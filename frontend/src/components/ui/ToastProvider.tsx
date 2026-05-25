import { createContext, useContext, useState, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import { CircleCheck, CircleAlert, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  type: ToastType
  message: string
  exiting: boolean
}

interface ToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const iconMap: Record<ToastType, typeof CircleCheck> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
}

const borderColor: Record<ToastType, string> = {
  success: 'var(--success)',
  error: 'var(--danger)',
  info: 'var(--primary)',
}

const bgColor: Record<ToastType, string> = {
  success: '#f0fdf4',
  error: '#fef2f2',
  info: '#eff6ff',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 300)
  }, [])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = nextId.current++
    setToasts(prev => [...prev, { id, type, message, exiting: false }])
    setTimeout(() => removeToast(id), 4000)
  }, [removeToast])

  const toast: ToastContextValue = {
    success: (msg) => addToast('success', msg),
    error: (msg) => addToast('error', msg),
    info: (msg) => addToast('info', msg),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '380px',
          pointerEvents: 'none',
        }}
      >
        <style>{`
          @keyframes toastSlideIn {
            from { transform: translateX(120%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes toastSlideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(120%); opacity: 0; }
          }
        `}</style>
        {toasts.map(t => {
          const Icon = iconMap[t.type]
          return (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '1rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                borderLeft: `4px solid ${borderColor[t.type]}`,
                animation: t.exiting ? 'toastSlideOut 0.3s ease forwards' : 'toastSlideIn 0.35s ease',
                pointerEvents: 'auto',
              }}
              onMouseEnter={() => {
                setToasts(prev => prev.map(to => to.id === t.id ? { ...to, exiting: true } : to))
              }}
              onMouseLeave={() => {
                setTimeout(() => removeToast(t.id), 2500)
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: bgColor[t.type],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={14} color={borderColor[t.type]} />
              </div>
              <p style={{
                flex: 1,
                fontSize: '0.8125rem',
                lineHeight: 1.5,
                color: 'var(--text-primary)',
                margin: 0,
              }}>
                {t.message}
              </p>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  flexShrink: 0,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 2,
                  color: 'var(--text-secondary)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
