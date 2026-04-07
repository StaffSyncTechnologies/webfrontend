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

const PrivacyPolicy = () => {
  useDocumentTitle('Privacy Policy');

  return (
    <PageWrapper>
      <Header />
      <HeroSection>
        <HeroTitle>Privacy and policy</HeroTitle>
        <HeroSubtitle>Updated January 26, 2025</HeroSubtitle>
      </HeroSection>

      <ContentWrapper>
        <Notice>
          PLEASE READ THESE TERMS OF USE CAREFULLY BEFORE USING THE SERVICES OR ACCESSING THE PLATFORM.
        </Notice>

        <Paragraph>
          This Privacy Policy explains how StaffSync Technologies Ltd ("StaffSync", "we", "us", "our") collects, uses, and protects personal data when you use our platform, website, or services.
        </Paragraph>

        <Paragraph>
          StaffSync is committed to complying with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
        </Paragraph>

        <Section>
          <SectionTitle>1. WHO WE ARE (DATA CONTROLLER)</SectionTitle>
          <Paragraph>
            StaffSync Technologies Ltd is the data controller for personal data processed through our platform, except where we act as a data processor on behalf of our customers.
          </Paragraph>
          <List>
            <ListItem>Email: info@staffsynctech.co.uk</ListItem>
            <ListItem>Registered in England & Wales</ListItem>
            <ListItem>Company No: 17023276</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>2. INFORMATION WE COLLECT</SectionTitle>
          <Paragraph>
            We may collect the following categories of personal data:
          </Paragraph>

          <SubSectionTitle>A. Personal Information</SubSectionTitle>
          <List>
            <ListItem>Name</ListItem>
            <ListItem>Email address</ListItem>
            <ListItem>Phone number</ListItem>
            <ListItem>Company name</ListItem>
            <ListItem>Job title</ListItem>
          </List>

          <SubSectionTitle>B. Worker Profile Data (provided by customers)</SubSectionTitle>
          <Paragraph>
            Where our customers use StaffSync to manage workers, we process:
          </Paragraph>
          <List>
            <ListItem>Employee names</ListItem>
            <ListItem>Contact details</ListItem>
            <ListItem>Identification information (where required)</ListItem>
            <ListItem>Attendance records</ListItem>
            <ListItem>Shift assignments</ListItem>
            <ListItem>Compliance documentation</ListItem>
            <ListItem>Payroll-related information</ListItem>
            <ListItem>Performance data</ListItem>
          </List>
          <Paragraph>
            In these cases, StaffSync acts as a data processor on behalf of the customer (data controller).
          </Paragraph>

          <SubSectionTitle>C. Technical Information</SubSectionTitle>
          <List>
            <ListItem>IP address</ListItem>
            <ListItem>Device information</ListItem>
            <ListItem>Browser type</ListItem>
            <ListItem>Log data</ListItem>
            <ListItem>Usage analytics</ListItem>
            <ListItem>Cookies and tracking technologies</ListItem>
          </List>

          <SubSectionTitle>D. Payment Information</SubSectionTitle>
          <List>
            <ListItem>Payments are processed by third-party providers.</ListItem>
            <ListItem>We do not store full payment card details.</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>3. LEGAL BASIS FOR PROCESSING</SectionTitle>
          <Paragraph>
            We process personal data under the following lawful bases:
          </Paragraph>
          <List>
            <ListItem><strong>Contractual necessity</strong> – to provide and operate our services</ListItem>
            <ListItem><strong>Legitimate interests</strong> – for platform security, fraud prevention, and service improvements</ListItem>
            <ListItem><strong>Legal obligations</strong> – to comply with applicable laws and regulations</ListItem>
            <ListItem><strong>Consent</strong> – where required (e.g., marketing communications)</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>4. HOW WE USE PERSONAL DATA</SectionTitle>
          <Paragraph>
            We use personal data to:
          </Paragraph>
          <List>
            <ListItem>Provide and operate the platform</ListItem>
            <ListItem>Manage accounts and subscriptions</ListItem>
            <ListItem>Process payments</ListItem>
            <ListItem>Provide customer support</ListItem>
            <ListItem>Improve platform performance and functionality</ListItem>
            <ListItem>Ensure system security and prevent fraud</ListItem>
            <ListItem>Comply with legal and regulatory obligations</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>5. DATA SHARING</SectionTitle>
          <Paragraph>
            We do not sell personal data.
          </Paragraph>
          <Paragraph>
            We may share data with trusted third parties, including:
          </Paragraph>
          <List>
            <ListItem>Payment processors</ListItem>
            <ListItem>Cloud hosting providers</ListItem>
            <ListItem>Analytics providers</ListItem>
            <ListItem>Professional advisors</ListItem>
            <ListItem>Legal or regulatory authorities where required</ListItem>
          </List>
          <Paragraph>
            All third parties are contractually required to process personal data securely and in accordance with applicable data protection laws.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>6. INTERNATIONAL DATA TRANSFERS</SectionTitle>
          <Paragraph>
            Where personal data is transferred outside the UK, we ensure appropriate safeguards, including:
          </Paragraph>
          <List>
            <ListItem>UK International Data Transfer Agreement (IDTA)</ListItem>
            <ListItem>Standard Contractual Clauses (SCCs)</ListItem>
            <ListItem>Transfers to countries with adequacy decisions</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>7. DATA RETENTION</SectionTitle>
          <Paragraph>
            We retain personal data only for as long as necessary to:
          </Paragraph>
          <List>
            <ListItem>Fulfil contractual obligations</ListItem>
            <ListItem>Comply with legal and regulatory requirements</ListItem>
            <ListItem>Resolve disputes and enforce agreements</ListItem>
          </List>
          <Paragraph>
            Upon account termination, data may be deleted or anonymised unless retention is required by law.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>8. DATA SECURITY</SectionTitle>
          <Paragraph>
            We implement appropriate technical and organisational measures, including:
          </Paragraph>
          <List>
            <ListItem>Encryption</ListItem>
            <ListItem>Access controls</ListItem>
            <ListItem>Secure cloud infrastructure</ListItem>
            <ListItem>Monitoring and logging</ListItem>
            <ListItem>Restricted access to authorised personnel</ListItem>
          </List>
          <Paragraph>
            However, no system is completely secure, and we cannot guarantee absolute security.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>9. YOUR RIGHTS (UK GDPR)</SectionTitle>
          <Paragraph>
            Under UK data protection law, you have the right to:
          </Paragraph>
          <List>
            <ListItem>Access your personal data</ListItem>
            <ListItem>Rectify inaccurate data</ListItem>
            <ListItem>Request erasure ("right to be forgotten")</ListItem>
            <ListItem>Restrict processing</ListItem>
            <ListItem>Object to processing</ListItem>
            <ListItem>Request data portability</ListItem>
            <ListItem>Withdraw consent at any time</ListItem>
          </List>
          <Paragraph>
            To exercise your rights, contact: <strong>info@staffsynctech.co.uk</strong>
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>10. COMPLAINTS</SectionTitle>
          <Paragraph>
            You have the right to lodge a complaint with:
          </Paragraph>
          <Paragraph>
            <strong>Information Commissioner's Office (ICO)</strong><br />
            <a href="https://www.ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: colors.primary.blue }}>https://www.ico.org.uk</a>
          </Paragraph>
          <Paragraph>
            We encourage you to contact us first to resolve any concerns.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>11. CHILDREN'S DATA</SectionTitle>
          <List>
            <ListItem>Our services are not intended for individuals under the age of 18.</ListItem>
            <ListItem>We do not knowingly collect personal data from children.</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>12. MARKETING COMMUNICATIONS</SectionTitle>
          <Paragraph>
            We may send service-related communications necessary for account operation.
          </Paragraph>
          <Paragraph>
            Marketing communications will only be sent where:
          </Paragraph>
          <List>
            <ListItem>You have provided consent; or</ListItem>
            <ListItem>It is permitted under applicable law</ListItem>
          </List>
          <Paragraph>
            You may unsubscribe at any time.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>13. DATA BREACHES</SectionTitle>
          <Paragraph>
            In the event of a personal data breach:
          </Paragraph>
          <List>
            <ListItem>We will notify the ICO where required</ListItem>
            <ListItem>We will inform affected individuals where there is a high risk</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>14. COOKIES</SectionTitle>
          <Paragraph>
            We use cookies and similar technologies to:
          </Paragraph>
          <List>
            <ListItem>Maintain user sessions</ListItem>
            <ListItem>Analyse usage</ListItem>
            <ListItem>Improve performance</ListItem>
          </List>
          <Paragraph>
            You can control cookies through your browser settings. A separate Cookie Policy may apply.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>15. THIRD-PARTY LINKS</SectionTitle>
          <List>
            <ListItem>Our platform may contain links to third-party websites.</ListItem>
            <ListItem>We are not responsible for their privacy practices.</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>16. CHANGES TO THIS POLICY</SectionTitle>
          <List>
            <ListItem>We may update this Privacy Policy from time to time.</ListItem>
            <ListItem>The latest version will always be available on our website.</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>17. CONTACT</SectionTitle>
          <Paragraph>
            For privacy-related enquiries or to exercise your rights:
          </Paragraph>
        </Section>

        <ContactBox>
          <Box sx={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>
            Contact Us
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

export default PrivacyPolicy;
