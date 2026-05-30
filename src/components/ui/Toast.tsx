import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Fade, Slide, Paper, IconButton, Box, Typography } from '@mui/material'
import { Close } from '@mui/icons-material'
import { removeToast } from '../../store/slices/toastSlice'
import type { Toast } from '../../store/slices/toastSlice'

interface ToastContainerProps {
  toasts: Toast[]
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

interface ToastItemProps {
  toast: Toast
  onClose: (id: string) => void
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!toast.persistent) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          dispatch(removeToast(toast.id))
        }, 300)
      }, toast.duration || 5000)

      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, toast.persistent, dispatch])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      dispatch(removeToast(toast.id))
    }, 300)
  }

  const getToastColor = () => {
    switch (toast.type) {
      case 'success':
        return 'success.main'
      case 'error':
        return 'error.main'
      case 'warning':
        return 'warning.main'
      case 'info':
        return 'info.main'
      default:
        return 'grey.700'
    }
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'success.dark'
      case 'error':
        return 'error.dark'
      case 'warning':
        return 'warning.dark'
      case 'info':
        return 'info.dark'
      default:
        return 'grey.800'
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ℹ'
      default:
        return 'ℹ'
    }
  }

  return (
    <Fade in={isVisible} timeout={300}>
      <Paper
        elevation={8}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          minWidth: 300,
          maxWidth: 400,
          bgcolor: getBackgroundColor(),
          color: 'white',
          borderRadius: 2,
          border: `1px solid ${getToastColor()}`,
        }}
      >
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          {getIcon()}
        </Box>
        
        <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
          {toast.message}
        </Typography>
        
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Paper>
    </Fade>
  )
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ 
  toasts, 
  position = 'top-right' 
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return { top: 0, right: 0 }
      case 'top-left':
        return { top: 0, left: 0 }
      case 'bottom-right':
        return { bottom: 0, right: 0 }
      case 'bottom-left':
        return { bottom: 0, left: 0 }
      case 'top-center':
        return { top: 0, left: '50%', transform: 'translateX(-50%)' }
      case 'bottom-center':
        return { bottom: 0, left: '50%', transform: 'translateX(-50%)' }
      default:
        return { top: 0, right: 0 }
    }
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 2,
        pointerEvents: 'none',
        ...getPositionStyles(),
      }}
    >
      {toasts.map((toast) => (
        <Box key={toast.id} sx={{ pointerEvents: 'auto' }}>
          <ToastItem toast={toast} onClose={() => {}} />
        </Box>
      ))}
    </Box>
  )
}
