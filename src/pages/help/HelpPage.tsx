import { useState } from 'react';
import { CheckCircleOutline, ArrowForward } from '@mui/icons-material';
import { useDocumentTitle } from '../../hooks';
import { Box, styled, TextField, CircularProgress, Alert } from '@mui/material';
import { DashboardContainer, PageTitle } from '../../components/layout';
import { Card } from '../../components/controls';
import { colors } from '../../utilities/colors';
import axios from 'axios';
import { API_BASE_URL, CONTACT } from '../../services/endpoints';
import PhoneInput from '../../components/controls/PhoneInput';

const FormRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  marginBottom: '20px',
  '@media (max-width: 576px)': { gridTemplateColumns: '1fr' },
});

const FormGroup = styled(Box)({ marginBottom: '20px' });

const Label = styled('label')({
  display: 'block',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  color: colors.text.primary,
  marginBottom: '8px',
  '& span': { color: '#EF4444' },
});

const StyledInput = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    borderRadius: '8px',
    backgroundColor: '#F9FAFB',
    '& fieldset': { borderColor: '#E5E7EB' },
    '&:hover fieldset': { borderColor: colors.primary.navy },
    '&.Mui-focused fieldset': { borderColor: colors.primary.blue },
  },
  '& .MuiOutlinedInput-input': { padding: '14px 16px' },
});

const StyledTextArea = styled(TextField)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    borderRadius: '8px',
    backgroundColor: '#F9FAFB',
    '& fieldset': { borderColor: '#E5E7EB' },
    '&:hover fieldset': { borderColor: colors.primary.navy },
    '&.Mui-focused fieldset': { borderColor: colors.primary.blue },
  },
});

const SubmitButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px 28px',
  backgroundColor: colors.primary.navy,
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': { backgroundColor: '#1a1a4e' },
  '& svg': { fontSize: '18px' },
});

const BLANK = { firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' };

export function HelpPage() {
  useDocumentTitle('Help & Support');
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setError(null);
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.firstName.trim()) { setError('Please enter your first name.'); return; }
    if (!form.email.trim()) { setError('Please enter your email address.'); return; }
    if (form.message.trim().length < 10) { setError('Please enter a message (at least 10 characters).'); return; }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}${CONTACT.SEND}`, form, { headers: { 'Content-Type': 'application/json' } });
      setSuccess(true);
      setForm(BLANK);
    } catch (err: unknown) {
      setError(axios.isAxiosError(err) ? (err.response?.data?.error || 'Something went wrong. Please try again.') : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContainer header={<PageTitle>Help & Support</PageTitle>}>
      <Card>
        <Box sx={{ maxWidth: 600, padding: '8px 0' }}>
          <Box component="h2" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: colors.text.primary, margin: '0 0 4px' }}>
            Contact Support
          </Box>
          <Box component="p" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.875rem', color: colors.text.secondary, margin: '0 0 24px' }}>
            Our team will get back to you within 1 business day.
          </Box>

          {success ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px 24px', border: '1px solid #D1FAE5', borderRadius: '12px', backgroundColor: '#F0FDF4', textAlign: 'center' }}>
              <CheckCircleOutline sx={{ fontSize: 48, color: '#16A34A' }} />
              <Box component="h3" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 700, color: '#15803D', margin: 0 }}>Message Sent!</Box>
              <Box component="p" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: '#166534', margin: 0 }}>
                Thank you for reaching out. We've received your message and will respond shortly.
              </Box>
              <Box component="button" onClick={() => setSuccess(false)} sx={{ marginTop: '8px', padding: '10px 24px', backgroundColor: '#16A34A', color: '#fff', border: 'none', borderRadius: '8px', fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Send Another Message
              </Box>
            </Box>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && <Alert severity="error" sx={{ marginBottom: '20px', borderRadius: '8px', fontFamily: "'Outfit', sans-serif" }}>{error}</Alert>}

              <FormRow>
                <Box>
                  <Label>First Name <span>*</span></Label>
                  <StyledInput name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} variant="outlined" disabled={loading} />
                </Box>
                <Box>
                  <Label>Last Name</Label>
                  <StyledInput name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} variant="outlined" disabled={loading} />
                </Box>
              </FormRow>

              <FormGroup>
                <Label>Email Address <span>*</span></Label>
                <StyledInput name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} variant="outlined" disabled={loading} />
              </FormGroup>

              <FormGroup>
                <Label>Phone Number</Label>
                <PhoneInput name="phone" value={form.phone} onChange={(value) => { setError(null); setForm(prev => ({ ...prev, phone: value })); }} placeholder="Phone number" />
              </FormGroup>

              <FormGroup>
                <Label>Subject</Label>
                <StyledInput name="subject" placeholder="What is your enquiry about?" value={form.subject} onChange={handleChange} variant="outlined" disabled={loading} />
              </FormGroup>

              <FormGroup>
                <Label>Message <span>*</span></Label>
                <StyledTextArea name="message" placeholder="Tell us how we can help you..." value={form.message} onChange={handleChange} variant="outlined" multiline rows={4} disabled={loading} />
              </FormGroup>

              <SubmitButton type="submit" disabled={loading} style={{ opacity: loading ? 0.8 : 1 }}>
                {loading ? (<><CircularProgress size={16} sx={{ color: '#fff' }} />Sending...</>) : (<>Send Message<ArrowForward /></>)}
              </SubmitButton>
            </form>
          )}
        </Box>
      </Card>
    </DashboardContainer>
  );
}

export default HelpPage;
