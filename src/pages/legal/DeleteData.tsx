import { useState, useEffect } from 'react';
import { Box, styled, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { Header, Footer } from '../../components/layout';
import { colors } from '../../utilities/colors';
import { useDocumentTitle } from '../../hooks';

const PageWrapper = styled(Box)({
  minHeight: '100vh',
  backgroundColor: colors.background.primary,
});

const HeroSection = styled(Box)({
  background: `linear-gradient(135deg, ${colors.primary.navy} 0%, ${colors.primary.blue} 100%)`,
  padding: '80px 24px 60px',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    opacity: 0.3,
  },
  '@media (max-width: 768px)': {
    padding: '60px 16px 40px',
  },
});

const HeroTitle = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '3rem',
  fontWeight: 700,
  color: colors.secondary.white,
  marginBottom: '16px',
  position: 'relative',
  zIndex: 1,
  '@media (max-width: 768px)': {
    fontSize: '2.5rem',
  },
});

const HeroSubtitle = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1.25rem',
  color: 'rgba(255, 255, 255, 0.8)',
  position: 'relative',
  zIndex: 1,
});

const ContentWrapper = styled(Box)({
  maxWidth: '800px',
  margin: '0 auto',
  padding: '48px 24px',
  '@media (max-width: 768px)': {
    padding: '24px 16px',
  },
});

const Section = styled(Box)({
  marginBottom: '32px',
});

const Notice = styled(Box)({
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
  borderLeft: '4px solid #f39c12',
});

const NoticeText = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  color: '#856404',
  fontWeight: 500,
});

const FormSection = styled(Box)({
  backgroundColor: colors.secondary.white,
  padding: '32px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  marginBottom: '32px',
});

const FormTitle = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1.5rem',
  fontWeight: 600,
  color: colors.primary.navy,
  marginBottom: '24px',
});

const FormField = styled(Box)({
  marginBottom: '20px',
});

const Label = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  fontWeight: 500,
  color: colors.text.primary,
  marginBottom: '8px',
});

const Input = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '16px',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: colors.border.default,
    },
    '&:hover fieldset': {
      borderColor: colors.primary.navy,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primary.navy,
    },
  },
});

const SubmitButton = styled(Button)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1rem',
  fontWeight: 600,
  padding: '12px 32px',
  borderRadius: '8px',
  textTransform: 'none',
  '@media (max-width: 768px)': {
    width: '100%',
  },
});

const DataSection = styled(Box)({
  backgroundColor: '#f8f9fa',
  padding: '24px',
  borderRadius: '8px',
  marginBottom: '24px',
});

const DataTitle = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1.125rem',
  fontWeight: 600,
  color: colors.primary.navy,
  marginBottom: '16px',
});

const DataList = styled(Box)({
  '& ul': {
    paddingLeft: '20px',
    '& li': {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '0.875rem',
      color: colors.text.secondary,
      marginBottom: '8px',
      lineHeight: 1.5,
    },
  },
});

const DeleteData = () => {
  useDocumentTitle('Delete Data - StaffSync');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dataType: '',
    reason: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/v1/auth/request-data-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          dataType: '',
          reason: '',
        });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to submit request');
        setSubmitStatus('error');
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <Header />
      <HeroSection>
        <HeroTitle>Data Deletion Request</HeroTitle>
        <HeroSubtitle>Request deletion of specific data from StaffSync</HeroSubtitle>
      </HeroSection>

      <ContentWrapper>
        <Notice>
          <NoticeText>
            <strong>StaffSync Worker App:</strong> This form is for requesting deletion of specific data without deleting your entire account. 
            Your account will remain active for continued work access.
          </NoticeText>
        </Notice>

        {submitStatus === 'success' && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Your data deletion request has been submitted successfully. We will process your request within 7-10 business days and contact you at your provided email address.
          </Alert>
        )}

        {submitStatus === 'error' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <FormSection>
          <FormTitle variant="h2">Submit Data Deletion Request</FormTitle>
          
          <form onSubmit={handleSubmit}>
            <FormField>
              <Label>Full Name *</Label>
              <Input
                fullWidth
                required
                value={formData.fullName}
                onChange={handleChange('fullName')}
                placeholder="Enter your full name as registered in the app"
                variant="outlined"
              />
            </FormField>

            <FormField>
              <Label>Email Address *</Label>
              <Input
                fullWidth
                required
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="Enter your registered email address"
                variant="outlined"
              />
            </FormField>

            <FormField>
              <Label>Phone Number</Label>
              <Input
                fullWidth
                value={formData.phone}
                onChange={handleChange('phone')}
                placeholder="Enter your registered phone number"
                variant="outlined"
              />
            </FormField>

            <FormField>
              <Label>Type of Data to Delete *</Label>
              <Input
                fullWidth
                required
                multiline
                rows={3}
                value={formData.dataType}
                onChange={handleChange('dataType')}
                placeholder="Specify what data you want deleted (e.g., location history, chat messages, documents, etc.)"
                variant="outlined"
              />
            </FormField>

            <FormField>
              <Label>Reason for Data Deletion (Optional)</Label>
              <Input
                fullWidth
                multiline
                rows={4}
                value={formData.reason}
                onChange={handleChange('reason')}
                placeholder="Please let us know why you're requesting this data deletion"
                variant="outlined"
              />
            </FormField>

            <SubmitButton
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Submitting...' : 'Request Data Deletion'}
            </SubmitButton>
          </form>
        </FormSection>

        <DataSection>
          <DataTitle variant="h3">Available Data Types for Deletion</DataTitle>
          <DataList>
            <ul>
              <li><strong>Location History:</strong> GPS check-in/check-out data and location tracking</li>
              <li><strong>Chat Messages:</strong> All communication history with managers and team members</li>
              <li><strong>Documents:</strong> Uploaded certificates, compliance documents, and files</li>
              <li><strong>Timesheet Data:</strong> Historical shift records and attendance data</li>
              <li><strong>Profile Information:</strong> Personal details, profile picture, and bio</li>
              <li><strong>Notification History:</strong> Past push notifications and alerts</li>
              <li><strong>App Settings:</strong> Personal preferences and configuration data</li>
            </ul>
          </DataList>
        </DataSection>

        <DataSection>
          <DataTitle variant="h3">Data Retained for Legal Compliance</DataTitle>
          <DataList>
            <ul>
              <li><strong>Payroll Records:</strong> Required by UK tax law for 6 years (cannot be deleted)</li>
              <li><strong>Health & Safety Records:</strong> Required for 3 years (cannot be deleted)</li>
              <li><strong>Accident/Incident Reports:</strong> Required for 3 years (cannot be deleted)</li>
              <li><strong>Basic Account Info:</strong> Email and name for authentication purposes</li>
            </ul>
          </DataList>
          <Typography variant="body2" sx={{ mt: 2, color: colors.text.secondary }}>
            Processing Time: 7-10 business days
          </Typography>
        </DataSection>

        <DataSection>
          <DataTitle variant="h3">Alternative: Complete Account Deletion</DataTitle>
          <Typography variant="body2" sx={{ color: colors.text.secondary, lineHeight: 1.6 }}>
            If you prefer to delete your entire account and all associated data, 
            please visit our <strong><a href="/delete-account" style={{ color: colors.primary.blue }}>Account Deletion Page</a></strong> 
            or email us directly at <strong>info@staffsynctech.co.uk</strong> with the subject 
            "Complete Account Deletion Request".
          </Typography>
        </DataSection>
      </ContentWrapper>

      <Footer />
    </PageWrapper>
  );
};

export default DeleteData;
