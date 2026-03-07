import React from 'react'
import { useSelector } from 'react-redux'
import { ToastContainer } from '../ui/Toast'
import type { RootState } from '../../store'

interface ToastProviderProps {
  children?: React.ReactNode
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  position = 'top-right' 
}) => {
  const toasts = useSelector((state: RootState) => state.toast.toasts)

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} position={position} />
    </>
  )
}
