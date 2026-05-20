package com.bodega.gestion.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.ECFieldFp;
import java.security.spec.ECParameterSpec;
import java.security.spec.ECPoint;
import java.security.spec.ECPublicKeySpec;
import java.security.spec.EllipticCurve;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class SupabaseJwtService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, PublicKey> keyCache = new ConcurrentHashMap<>();
    private volatile long lastKeyFetchTime = 0;
    private static final long KEY_CACHE_TTL_MS = 3600_000L;

    public SupabaseJwtService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClientBuilder = webClientBuilder;
        this.objectMapper = objectMapper;
    }

    private PublicKey getPublicKey(String kid) {
        PublicKey cached = keyCache.get(kid);
        if (cached != null && System.currentTimeMillis() - lastKeyFetchTime < KEY_CACHE_TTL_MS) {
            return cached;
        }

        try {
            String jwksUrl = supabaseUrl + "/auth/v1/.well-known/jwks.json";
            String jwksResponse = webClientBuilder.build()
                    .get()
                    .uri(jwksUrl)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode jwks = objectMapper.readTree(jwksResponse);
            JsonNode keys = jwks.get("keys");

            if (keys != null && keys.isArray()) {
                for (JsonNode key : keys) {
                    String currentKid = key.get("kid").asText();
                    PublicKey pubKey = buildECPublicKey(key);
                    keyCache.put(currentKid, pubKey);
                }
            }

            lastKeyFetchTime = System.currentTimeMillis();

            PublicKey result = keyCache.get(kid);
            if (result == null) {
                throw new RuntimeException("No se encontró la clave con kid: " + kid);
            }
            return result;
        } catch (Exception e) {
            if (keyCache.containsKey(kid)) {
                log.warn("Error refrescando JWKS, usando cache para kid {}: {}", kid, e.getMessage());
                return keyCache.get(kid);
            }
            log.error("Error obteniendo clave pública de JWKS: {}", e.getMessage());
            throw new RuntimeException("Error al obtener clave pública", e);
        }
    }

    private PublicKey buildECPublicKey(JsonNode jwk) throws Exception {
        String x = jwk.get("x").asText();
        String y = jwk.get("y").asText();

        byte[] xBytes = Base64.getUrlDecoder().decode(x);
        byte[] yBytes = Base64.getUrlDecoder().decode(y);

        BigInteger xCoord = new BigInteger(1, xBytes);
        BigInteger yCoord = new BigInteger(1, yBytes);

        ECPoint point = new ECPoint(xCoord, yCoord);
        ECParameterSpec ecSpec = getP256Spec();
        ECPublicKeySpec keySpec = new ECPublicKeySpec(point, ecSpec);

        KeyFactory factory = KeyFactory.getInstance("EC");
        return factory.generatePublic(keySpec);
    }

    private ECParameterSpec getP256Spec() {
        BigInteger p = new BigInteger("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF", 16);
        BigInteger a = new BigInteger("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC", 16);
        BigInteger b = new BigInteger("5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B", 16);
        BigInteger n = new BigInteger("FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551", 16);
        BigInteger gx = new BigInteger("6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296", 16);
        BigInteger gy = new BigInteger("4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5", 16);

        EllipticCurve curve = new EllipticCurve(new ECFieldFp(p), a, b);
        ECPoint g = new ECPoint(gx, gy);
        return new ECParameterSpec(curve, g, n, 1);
    }

    public Claims extractAllClaims(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new RuntimeException("Token JWT inválido");
            }

            String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]));
            JsonNode header = objectMapper.readTree(headerJson);
            String kid = header.get("kid").asText();

            PublicKey publicKey = getPublicKey(kid);

            return Jwts.parser()
                    .verifyWith(publicKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            log.error("Error extrayendo claims del JWT: {}", e.getMessage());
            throw new RuntimeException("Error al validar token", e);
        }
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).get("email", String.class);
    }

    public UUID extractUserId(String token) {
        String sub = extractAllClaims(token).getSubject();
        return UUID.fromString(sub);
    }

    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        log.debug("JWT claims completos: {}", claims);
        log.debug("app_metadata claim: {}", claims.get("app_metadata"));
        log.debug("raw_app_metadata claim: {}", claims.get("raw_app_metadata"));
        log.debug("role claim directo: {}", claims.get("role"));

        Object appMeta = claims.get("app_metadata");
        if (appMeta instanceof java.util.Map<?, ?> meta) {
            Object role = meta.get("role");
            log.debug("Role extraído de app_metadata: {}", role);
            return role != null ? role.toString() : "USUARIO";
        }

        Object rawAppMeta = claims.get("raw_app_metadata");
        if (rawAppMeta instanceof java.util.Map<?, ?> meta) {
            Object role = meta.get("role");
            log.debug("Role extraído de raw_app_metadata: {}", role);
            return role != null ? role.toString() : "USUARIO";
        }

        Object directRole = claims.get("role");
        if (directRole != null) {
            log.debug("Role directo del JWT: {}", directRole);
            String roleStr = directRole.toString();
            if (roleStr.equals("authenticated") || roleStr.equals("anon")) {
                return "USUARIO";
            }
            return roleStr;
        }

        log.warn("No se encontró rol en JWT, usando USUARIO por defecto");
        return "USUARIO";
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            log.warn("Token inválido: {}", e.getMessage());
            return false;
        }
    }
}