import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { removeToast } from '../../store/slices/toastSlice'
import type { Toast } from '../../store/slices/toastSlice'
import {
  Alert,
  Box,
  Fade,
  IconButton,
  Stack,
  ThemeProvider,
  createTheme
} from '@mui/material'
import { Close, CheckCircle, Error, Warning, Info } from '@mui/icons-material'

const theme = createTheme({
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          alignItems: 'center',
          '& .MuiAlert-message': {
            flex: 1
          }
        }
      }
    }
  }
})

interface ToastComponentProps {
  toast: Toast
  onClose?: () => void
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onClose }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    if (!toast.persistent && toast.duration !== 0) {
      const timer = setTimeout(() => {
        dispatch(removeToast(toast.id))
        onClose?.()
      }, toast.duration || 5000)
      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, toast.persistent, dispatch, onClose])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle fontSize="inherit" />
      case 'error':
        return <Error fontSize="inherit" />
      case 'warning':
        return <Warning fontSize="inherit" />
      case 'info':
        return <Info fontSize="inherit" />
      default:
        return <Info fontSize="inherit" />
    }
  }

  const handleClose = () => {
    dispatch(removeToast(toast.id))
    onClose?.()
  }

  return (
    <Fade in={true} timeout={300}>
      <Alert
        severity={toast.type}
        icon={getIcon()}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <Close fontSize="inherit" />
          </IconButton>
        }
        sx={{
          minWidth: '300px',
          maxWidth: '500px',
          boxShadow: 2,
          '& .MuiAlert-icon': {
            fontSize: '24px'
          }
        }}
      >
        {toast.message}
      </Alert>
    </Fade>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

const ToastContainer: React.FC<ToastContainerProps> = ({ 
  toasts, 
  position = 'top-right' 
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return {
          position: 'fixed' as const,
          top: 24,
          right: 24,
          zIndex: 9999
        }
      case 'top-left':
        return {
          position: 'fixed' as const,
          top: 24,
          left: 24,
          zIndex: 9999
        }
      case 'bottom-right':
        return {
          position: 'fixed' as const,
          bottom: 24,
          right: 24,
          zIndex: 9999
        }
      case 'bottom-left':
        return {
          position: 'fixed' as const,
          bottom: 24,
          left: 24,
          zIndex: 9999
        }
      case 'top-center':
        return {
          position: 'fixed' as const,
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999
        }
      case 'bottom-center':
        return {
          position: 'fixed' as const,
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999
        }
      default:
        return {
          position: 'fixed' as const,
          top: 24,
          right: 24,
          zIndex: 9999
        }
    }
  }

  if (toasts.length === 0) return null

  return (
    <ThemeProvider theme={theme}>
      <Box sx={getPositionStyles()}>
        <Stack spacing={2}>
          {toasts.map((toast) => (
            <ToastComponent key={toast.id} toast={toast} />
          ))}
        </Stack>
      </Box>
    </ThemeProvider>
  )
}

export { ToastContainer, ToastComponent }
