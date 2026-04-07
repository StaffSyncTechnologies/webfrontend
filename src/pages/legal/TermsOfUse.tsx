import { Box, styled } from '@mui/material';
import { Header, Footer } from '../../components/layout';
import { colors } from '../../utilities/colors';
import { useDocumentTitle } from '../../hooks';

const PageWrapper = styled(Box)({
  minHeight: '100vh',
  backgroundColor: colors.background.primary,
});

const HeroSection = styled(Box)({
  backgroundColor: colors.primary.navy,
  color: colors.secondary.white,
  padding: '80px 20px 60px',
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
    backgroundImage: 'url(/dot.svg)',
    opacity: 0.1,
    pointerEvents: 'none',
  },
});

const HeroTitle = styled('h1')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '2.5rem',
  fontWeight: 700,
  margin: '0 0 16px 0',
  position: 'relative',
  zIndex: 1,
  '@media (max-width: 768px)': {
    fontSize: '2rem',
  },
});

const HeroSubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1.125rem',
  margin: 0,
  opacity: 0.9,
  position: 'relative',
  zIndex: 1,
});

const ContentWrapper = styled(Box)({
  maxWidth: '900px',
  margin: '0 auto',
  padding: '60px 20px',
});

const Notice = styled(Box)({
  backgroundColor: colors.secondary.lightGray,
  border: `1px solid ${colors.border.light}`,
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '40px',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.875rem',
  color: colors.text.secondary,
  lineHeight: 1.6,
});

const Section = styled(Box)({
  marginBottom: '48px',
});

const SectionTitle = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1.5rem',
  fontWeight: 600,
  color: colors.primary.navy,
  marginBottom: '16px',
  marginTop: 0,
});

const Paragraph = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1rem',
  lineHeight: 1.8,
  color: colors.text.secondary,
  marginBottom: '16px',
});

const List = styled('ul')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1rem',
  lineHeight: 1.8,
  color: colors.text.secondary,
  marginBottom: '16px',
  paddingLeft: '24px',
});

const ListItem = styled('li')({
  marginBottom: '8px',
});

const ContactBox = styled(Box)({
  backgroundColor: colors.primary.navy,
  color: colors.secondary.white,
  borderRadius: '12px',
  padding: '32px',
  textAlign: 'center',
  marginTop: '48px',
  '& a': {
    color: colors.primary.blue,
    textDecoration: 'none',
    fontWeight: 600,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});

const TermsOfUse = () => {
  useDocumentTitle('Terms of Use');

  return (
    <PageWrapper>
      <Header />
      <HeroSection>
        <HeroTitle>Terms of Use</HeroTitle>
        <HeroSubtitle>Updated January 26, 2025</HeroSubtitle>
      </HeroSection>

      <ContentWrapper>
        <Notice>
          PLEASE READ THESE TERMS OF USE CAREFULLY BEFORE USING THE SERVICES OR ACCESSING THE PLATFORM.
        </Notice>

        <Section>
          <SectionTitle>1. Introduction</SectionTitle>
          <Paragraph>
            These Terms govern your use of StaffSync ("Service"). By using our platform, you agree to these Terms.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>2. Company Information</SectionTitle>
          <List>
            <ListItem><strong>StaffSync Technologies Ltd</strong></ListItem>
            <ListItem>Registered in England & Wales</ListItem>
            <ListItem>Company No: 17023276</ListItem>
            <ListItem>Email: info@staffsynctech.co.uk</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>3. Use of the Service</SectionTitle>
          <Paragraph>
            You agree to:
          </Paragraph>
          <List>
            <ListItem>Use the platform lawfully</ListItem>
            <ListItem>Provide accurate information</ListItem>
            <ListItem>Not misuse or disrupt the system</ListItem>
            <ListItem>Maintain confidentiality of login credentials</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>4. Account Registration</SectionTitle>
          <List>
            <ListItem>You must be at least 18 years old</ListItem>
            <ListItem>You are responsible for all activity under your account</ListItem>
            <ListItem>We may suspend accounts for misuse</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>5. Services Provided</SectionTitle>
          <Paragraph>
            StaffSync provides:
          </Paragraph>
          <List>
            <ListItem>Workforce management tools</ListItem>
            <ListItem>Shift scheduling</ListItem>
            <ListItem>Worker onboarding</ListItem>
            <ListItem>Attendance tracking</ListItem>
            <ListItem>Compliance management</ListItem>
          </List>
          <Paragraph>
            We may update features at any time.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>6. Payments & Subscriptions</SectionTitle>
          <List>
            <ListItem>Services may be subscription-based</ListItem>
            <ListItem>Payments are processed via third-party providers</ListItem>
            <ListItem>Fees are non-refundable unless required by law</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>7. Data & Privacy</SectionTitle>
          <Paragraph>
            Your use of the Service is subject to our Privacy Policy.
          </Paragraph>
          <Paragraph>
            Customers are responsible for ensuring they have legal rights to upload worker data.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>8. Intellectual Property</SectionTitle>
          <Paragraph>
            All platform content, software, and branding belong to StaffSync.
          </Paragraph>
          <Paragraph>
            You may not copy, modify, or distribute without permission.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>9. Limitation of Liability</SectionTitle>
          <Paragraph>
            To the extent permitted by law:
          </Paragraph>
          <List>
            <ListItem>We are not liable for indirect or consequential damages</ListItem>
            <ListItem>We do not guarantee uninterrupted service</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>10. Termination</SectionTitle>
          <Paragraph>
            We may suspend or terminate access if:
          </Paragraph>
          <List>
            <ListItem>Terms are violated</ListItem>
            <ListItem>Misuse is detected</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>11. Governing Law</SectionTitle>
          <Paragraph>
            These Terms are governed by the laws of England and Wales.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>12. Changes</SectionTitle>
          <Paragraph>
            We may update these Terms at any time. Continued use means acceptance.
          </Paragraph>
        </Section>

        <ContactBox>
          <Box sx={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>
            Questions About Our Terms?
          </Box>
          <Box sx={{ fontSize: '1rem' }}>
            📧 <a href="mailto:info@staffsynctech.co.uk">info@staffsynctech.co.uk</a>
          </Box>
        </ContactBox>
      </ContentWrapper>

      <Footer />
    </PageWrapper>
  );
};

export default TermsOfUse;
