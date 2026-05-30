import { useState } from 'react';
import { Box, styled, TextField, CircularProgress, Alert } from '@mui/material';
import { ArrowForward, CheckCircleOutline } from '@mui/icons-material';
import axios from 'axios';
import { colors } from '../../utilities/colors';
import PhoneInput from '../../components/controls/PhoneInput';
import { API_BASE_URL, CONTACT } from '../../services/endpoints';

const Section = styled(Box)({
  padding: '80px 48px',
  backgroundColor: colors.secondary.white,
  '@media (max-width: 768px)': {
    padding: '60px 24px',
  },
  '@media (max-width: 576px)': {
    padding: '48px 16px',
  },
});

const Content = styled(Box)({
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '64px',
  alignItems: 'center',
  '@media (max-width: 900px)': {
    gridTemplateColumns: '1fr',
    gap: '48px',
  },
});

const FormSection = styled(Box)({
  maxWidth: '500px',
});

const Title = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '36px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
  marginBottom: '12px',
  '@media (max-width: 768px)': {
    fontSize: '28px',
  },
});

const Subtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  color: colors.text.secondary,
  margin: 0,
  marginBottom: '32px',
});

const FormRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  marginBottom: '20px',
  '@media (max-width: 576px)': {
    gridTemplateColumns: '1fr',
  },
});

const FormGroup = styled(Box)({
  marginBottom: '20px',
});

const Label = styled('label')({
  display: 'block',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.text.primary,
  marginBottom: '8px',
  '& span': {
    color: '#EF4444',
  },
});

const StyledInput = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    borderRadius: '8px',
    backgroundColor: '#F9FAFB',
    '& fieldset': {
      borderColor: '#E5E7EB',
    },
    '&:hover fieldset': {
      borderColor: colors.primary.navy,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primary.blue,
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '14px 16px',
  },
});

const StyledTextArea = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    borderRadius: '8px',
    backgroundColor: '#F9FAFB',
    '& fieldset': {
      borderColor: '#E5E7EB',
    },
    '&:hover fieldset': {
      borderColor: colors.primary.navy,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primary.blue,
    },
  },
});

const SubmitButton = styled('button')({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '14px 32px',
  backgroundColor: colors.primary.navy,
  color: colors.secondary.white,
  border: 'none',
  borderRadius: '8px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  marginTop: '24px',
  '&:hover': {
    backgroundColor: '#1a1a4e',
    transform: 'translateY(-2px)',
  },
  '& svg': {
    fontSize: '20px',
  },
});

const ImageSection = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  '@media (max-width: 900px)': {
    display: 'none',
  },
});

const ContactImage = styled('img')({
  width: '100%',
  maxWidth: '500px',
  height: 'auto',
  borderRadius: '16px',
  objectFit: 'cover',
});

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setError(null);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setError('Please enter a message (at least 10 characters).');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}${CONTACT.SEND}`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      setSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section id="contact-us">
      <Content>
        <FormSection>
          <Title>Contact Us</Title>
          <Subtitle>Our friendly team would love to hear from you.</Subtitle>

          {success ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                padding: '48px 32px',
                border: '1px solid #D1FAE5',
                borderRadius: '12px',
                backgroundColor: '#F0FDF4',
                textAlign: 'center',
              }}
            >
              <CheckCircleOutline sx={{ fontSize: 56, color: '#16A34A' }} />
              <Box
                component="h3"
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#15803D',
                  margin: 0,
                }}
              >
                Message Sent!
              </Box>
              <Box
                component="p"
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '15px',
                  color: '#166534',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Thank you for reaching out. We've received your message and will get back to you within 1 business day.
                A confirmation has been sent to your email.
              </Box>
              <Box
                component="button"
                onClick={() => setSuccess(false)}
                sx={{
                  marginTop: '8px',
                  padding: '10px 24px',
                  backgroundColor: '#16A34A',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#15803D' },
                }}
              >
                Send Another Message
              </Box>
            </Box>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <Alert severity="error" sx={{ marginBottom: '20px', borderRadius: '8px', fontFamily: "'Outfit', sans-serif" }}>
                  {error}
                </Alert>
              )}

              <FormRow>
                <Box>
                  <Label>First Name <span>*</span></Label>
                  <StyledInput
                    name="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleChange}
                    variant="outlined"
                    disabled={loading}
                  />
                </Box>
                <Box>
                  <Label>Last Name</Label>
                  <StyledInput
                    name="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    variant="outlined"
                    disabled={loading}
                  />
                </Box>
              </FormRow>

              <FormGroup>
                <Label>Email Address <span>*</span></Label>
                <StyledInput
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  disabled={loading}
                />
              </FormGroup>

              <FormGroup>
                <Label>Phone Number</Label>
                <PhoneInput
                  name="phone"
                  value={formData.phone}
                  onChange={(value) => { setError(null); setFormData({ ...formData, phone: value }); }}
                  placeholder="Enter your phone number"
                />
              </FormGroup>

              <FormGroup>
                <Label>Subject</Label>
                <StyledInput
                  name="subject"
                  placeholder="What is your enquiry about?"
                  value={formData.subject}
                  onChange={handleChange}
                  variant="outlined"
                  disabled={loading}
                />
              </FormGroup>

              <FormGroup>
                <Label>Message <span>*</span></Label>
                <StyledTextArea
                  name="message"
                  placeholder="Tell us how we can help you..."
                  value={formData.message}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={4}
                  disabled={loading}
                />
              </FormGroup>

              <SubmitButton type="submit" disabled={loading} style={{ opacity: loading ? 0.8 : 1 }}>
                {loading ? (
                  <>
                    <CircularProgress size={18} sx={{ color: '#fff' }} />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <ArrowForward />
                  </>
                )}
              </SubmitButton>
            </form>
          )}
        </FormSection>

        <ImageSection>
          <ContactImage
            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=700&fit=crop"
            alt="Warehouse worker"
          />
        </ImageSection>
      </Content>
    </Section>
  );
};

export default ContactUs;