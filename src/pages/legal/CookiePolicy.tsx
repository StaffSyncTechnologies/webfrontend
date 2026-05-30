import { useEffect } from 'react';
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

const SubSectionTitle = styled('h3')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '1.125rem',
  fontWeight: 600,
  color: colors.primary.navy,
  marginBottom: '12px',
  marginTop: '24px',
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

const CookiePolicy = () => {
  useDocumentTitle('Cookie Policy');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageWrapper>
      <Header />
      <HeroSection>
        <HeroTitle>Cookies Policy</HeroTitle>
        <HeroSubtitle>Updated January 26, 2025</HeroSubtitle>
      </HeroSection>

      <ContentWrapper>
        <Notice>
          This Cookie Policy explains how StaffSync uses cookies and similar technologies on our platform.
        </Notice>

        <Section>
          <SectionTitle>1. What Are Cookies</SectionTitle>
          <Paragraph>
            Cookies are small files stored on your device to improve your experience.
          </Paragraph>
          <Paragraph>
            They help us remember your preferences, keep you logged in, and understand how you use our platform.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>2. Types of Cookies We Use</SectionTitle>

          <SubSectionTitle>Essential Cookies</SubSectionTitle>
          <Paragraph>
            These cookies are necessary for the platform to function properly:
          </Paragraph>
          <List>
            <ListItem>Login sessions</ListItem>
            <ListItem>Security features</ListItem>
            <ListItem>Core functionality</ListItem>
          </List>
          <Paragraph>
            You cannot opt out of essential cookies as they are required for the service to work.
          </Paragraph>

          <SubSectionTitle>Analytics Cookies</SubSectionTitle>
          <Paragraph>
            These cookies help us understand how users interact with our platform:
          </Paragraph>
          <List>
            <ListItem>Usage tracking</ListItem>
            <ListItem>Performance monitoring</ListItem>
            <ListItem>Feature usage statistics</ListItem>
          </List>

          <SubSectionTitle>Functional Cookies</SubSectionTitle>
          <Paragraph>
            These cookies enhance your experience:
          </Paragraph>
          <List>
            <ListItem>Remember preferences</ListItem>
            <ListItem>Improve usability</ListItem>
            <ListItem>Personalise content</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>3. How We Use Cookies</SectionTitle>
          <Paragraph>
            We use cookies to:
          </Paragraph>
          <List>
            <ListItem>Operate the platform securely</ListItem>
            <ListItem>Analyse usage patterns</ListItem>
            <ListItem>Improve performance</ListItem>
            <ListItem>Provide personalised features</ListItem>
            <ListItem>Maintain your session</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>4. Managing Cookies</SectionTitle>
          <Paragraph>
            You can control cookies via:
          </Paragraph>
          <List>
            <ListItem><strong>Browser settings</strong> – Most browsers allow you to block or delete cookies</ListItem>
            <ListItem><strong>Cookie consent banner</strong> – Manage your preferences when you first visit</ListItem>
          </List>
          <Paragraph>
            Please note that blocking certain cookies may affect platform functionality.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>5. Third-Party Cookies</SectionTitle>
          <Paragraph>
            We may use third-party services that set their own cookies:
          </Paragraph>
          <List>
            <ListItem>Analytics tools (e.g., Google Analytics)</ListItem>
            <ListItem>Payment processors</ListItem>
            <ListItem>Customer support services</ListItem>
          </List>
          <Paragraph>
            These providers have their own privacy policies and cookie policies.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>6. Cookie Duration</SectionTitle>
          <Paragraph>
            We use both:
          </Paragraph>
          <List>
            <ListItem><strong>Session cookies</strong> – Deleted when you close your browser</ListItem>
            <ListItem><strong>Persistent cookies</strong> – Remain on your device for a set period or until you delete them</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>7. Updates</SectionTitle>
          <Paragraph>
            We may update this Cookie Policy periodically to reflect changes in our practices or legal requirements.
          </Paragraph>
          <Paragraph>
            The latest version will always be available on our website.
          </Paragraph>
        </Section>

        <ContactBox>
          <Box sx={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>
            Questions About Cookies?
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

export default CookiePolicy;
