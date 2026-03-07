import React from 'react'
import { useToast } from '../../hooks/useToast'
import { Button, ButtonGroup, Card, CardContent, Typography, Box } from '@mui/material'

export const ToastExample: React.FC = () => {
  const toast = useToast()

  const handleSuccess = () => {
    toast.success('Operation completed successfully!')
  }

  const handleError = () => {
    toast.error('Something went wrong. Please try again.')
  }

  const handleWarning = () => {
    toast.warning('Please review your input before proceeding.')
  }

  const handleInfo = () => {
    toast.info('Here is some useful information for you.')
  }

  const handlePersistent = () => {
    toast.success('This toast will stay until you close it', { persistent: true })
  }

  const handleCustomDuration = () => {
    toast.info('This toast will disappear in 2 seconds', { duration: 2000 })
  }

  const handleClearAll = () => {
    toast.clearAll()
  }

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Toast Notification Examples
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Click the buttons below to see different types of toast notifications.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <ButtonGroup variant="contained" fullWidth>
            <Button onClick={handleSuccess} color="success">
              Success
            </Button>
            <Button onClick={handleError} color="error">
              Error
            </Button>
            <Button onClick={handleWarning} color="warning">
              Warning
            </Button>
            <Button onClick={handleInfo} color="info">
              Info
            </Button>
          </ButtonGroup>
          
          <ButtonGroup variant="outlined" fullWidth>
            <Button onClick={handlePersistent}>
              Persistent Toast
            </Button>
            <Button onClick={handleCustomDuration}>
              2 Second Toast
            </Button>
            <Button onClick={handleClearAll} color="secondary">
              Clear All
            </Button>
          </ButtonGroup>
        </Box>
      </CardContent>
    </Card>
  )
}
