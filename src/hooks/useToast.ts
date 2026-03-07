import { useDispatch } from 'react-redux'
import { addToast, clearAllToasts } from '../store/slices/toastSlice'
import type { Toast } from '../store/slices/toastSlice'

interface UseToastReturn {
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => void
  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => void
  warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => void
  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => void
  clearAll: () => void
}

export const useToast = (): UseToastReturn => {
  const dispatch = useDispatch()

  const success = (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => {
    dispatch(addToast({ message, type: 'success', ...options }))
  }

  const error = (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => {
    dispatch(addToast({ message, type: 'error', ...options }))
  }

  const warning = (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => {
    dispatch(addToast({ message, type: 'warning', ...options }))
  }

  const info = (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'type'>>) => {
    dispatch(addToast({ message, type: 'info', ...options }))
  }

  const clearAll = () => {
    dispatch(clearAllToasts())
  }

  return {
    success,
    error,
    warning,
    info,
    clearAll
  }
}
