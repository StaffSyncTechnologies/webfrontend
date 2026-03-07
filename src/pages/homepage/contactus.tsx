import { useState } from 'react';
import { Box, styled, TextField } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { colors } from '../../utilities/colors';
import PhoneInput from '../../components/controls/PhoneInput';

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
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <Section id="contact-us">
      <Content>
        <FormSection>
          <Title>Contact Us</Title>
          <Subtitle>Our friendly team would love to hear from you.</Subtitle>
          
          <form onSubmit={handleSubmit}>
            <FormRow>
              <Box>
                <Label>First Name</Label>
                <StyledInput
                  name="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  variant="outlined"
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
                />
              </Box>
            </FormRow>

            <FormGroup>
              <Label>Email Address<span>*</span></Label>
              <StyledInput
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Phone Number</Label>
              <PhoneInput
                name="phone"
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                placeholder="Enter phone number"
              />
            </FormGroup>

            <FormGroup>
              <Label>Message</Label>
              <StyledTextArea
                name="message"
                placeholder="Enter your company address"
                value={formData.message}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={4}
              />
            </FormGroup>

            <SubmitButton type="submit">
              Send Message
              <ArrowForward />
            </SubmitButton>
          </form>
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

export default ContactUs