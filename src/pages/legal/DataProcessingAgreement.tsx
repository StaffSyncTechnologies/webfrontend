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

const DataProcessingAgreement = () => {
  useDocumentTitle('Data Processing Agreement');

  return (
    <PageWrapper>
      <Header />
      <HeroSection>
        <HeroTitle>Data Processing Agreement</HeroTitle>
        <HeroSubtitle>Updated January 26, 2025</HeroSubtitle>
      </HeroSection>

      <ContentWrapper>
        <Notice>
          This Data Processing Agreement (DPA) applies when agencies use StaffSync to manage workers and process personal data.
        </Notice>

        <Paragraph>
          This agreement supplements our Terms of Service and Privacy Policy, defining the responsibilities when StaffSync acts as a data processor on behalf of our customers.
        </Paragraph>

        <Section>
          <SectionTitle>1. Roles</SectionTitle>
          <List>
            <ListItem><strong>Customer (Agency)</strong> = Data Controller</ListItem>
            <ListItem><strong>StaffSync</strong> = Data Processor</ListItem>
          </List>
          <Paragraph>
            The Customer determines the purposes and means of processing personal data. StaffSync processes data only on behalf of and according to the Customer's instructions.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>2. Scope</SectionTitle>
          <Paragraph>
            StaffSync processes personal data only:
          </Paragraph>
          <List>
            <ListItem>To provide the platform and services</ListItem>
            <ListItem>Based on customer instructions</ListItem>
            <ListItem>In accordance with applicable data protection laws</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>3. Types of Data</SectionTitle>
          <Paragraph>
            Personal data processed may include:
          </Paragraph>
          <List>
            <ListItem>Employee names and contact details</ListItem>
            <ListItem>Identification information</ListItem>
            <ListItem>Attendance records</ListItem>
            <ListItem>Shift assignments</ListItem>
            <ListItem>Compliance documents</ListItem>
            <ListItem>Payroll-related data</ListItem>
            <ListItem>Performance information</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>4. Processing Purpose</SectionTitle>
          <Paragraph>
            Data is processed for:
          </Paragraph>
          <List>
            <ListItem>Workforce management</ListItem>
            <ListItem>Shift scheduling and tracking</ListItem>
            <ListItem>Compliance monitoring</ListItem>
            <ListItem>Attendance and timesheet management</ListItem>
            <ListItem>Payroll processing support</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>5. Security Measures</SectionTitle>
          <Paragraph>
            StaffSync implements appropriate technical and organisational measures:
          </Paragraph>
          <List>
            <ListItem>End-to-end encryption</ListItem>
            <ListItem>Role-based access controls</ListItem>
            <ListItem>Secure cloud hosting infrastructure</ListItem>
            <ListItem>Regular security monitoring and audits</ListItem>
            <ListItem>Employee confidentiality agreements</ListItem>
            <ListItem>Incident response procedures</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>6. Sub-processors</SectionTitle>
          <Paragraph>
            We may use trusted sub-processors, including:
          </Paragraph>
          <List>
            <ListItem>Cloud hosting providers</ListItem>
            <ListItem>Email service providers</ListItem>
            <ListItem>Analytics tools</ListItem>
            <ListItem>Payment processors</ListItem>
          </List>
          <Paragraph>
            All sub-processors are contractually bound by data protection obligations equivalent to those in this DPA.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>7. International Transfers</SectionTitle>
          <Paragraph>
            Where data is transferred outside the UK:
          </Paragraph>
          <List>
            <ListItem>UK International Data Transfer Agreement (IDTA) is used</ListItem>
            <ListItem>Standard Contractual Clauses (SCCs) are implemented</ListItem>
            <ListItem>Transfers only occur to countries with adequacy decisions or appropriate safeguards</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>8. Data Subject Rights</SectionTitle>
          <Paragraph>
            We assist customers in responding to data subject requests:
          </Paragraph>
          <List>
            <ListItem>Access requests</ListItem>
            <ListItem>Deletion requests</ListItem>
            <ListItem>Correction requests</ListItem>
            <ListItem>Restriction of processing</ListItem>
            <ListItem>Data portability</ListItem>
          </List>
          <Paragraph>
            The Customer remains responsible for responding to data subjects within legal timeframes.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>9. Data Breach Notification</SectionTitle>
          <Paragraph>
            In case of a personal data breach:
          </Paragraph>
          <List>
            <ListItem>We notify the Customer promptly (within 24 hours where possible)</ListItem>
            <ListItem>We provide details of the breach and affected data</ListItem>
            <ListItem>We assist with regulatory notifications and remediation</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>10. Data Deletion</SectionTitle>
          <Paragraph>
            Upon termination of services:
          </Paragraph>
          <List>
            <ListItem>Data is deleted or anonymised within 30 days</ListItem>
            <ListItem>Data may be retained longer if legally required</ListItem>
            <ListItem>Customers can request data export before deletion</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>11. Audit Rights</SectionTitle>
          <Paragraph>
            Customers may request:
          </Paragraph>
          <List>
            <ListItem>Reasonable evidence of compliance with this DPA</ListItem>
            <ListItem>Security certifications and audit reports</ListItem>
            <ListItem>Information about sub-processors</ListItem>
          </List>
          <Paragraph>
            On-site audits may be conducted with reasonable notice and at the Customer's expense.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>12. Customer Responsibilities</SectionTitle>
          <Paragraph>
            The Customer (Data Controller) must:
          </Paragraph>
          <List>
            <ListItem>Ensure they have legal basis to process worker data</ListItem>
            <ListItem>Provide clear privacy notices to data subjects</ListItem>
            <ListItem>Obtain necessary consents where required</ListItem>
            <ListItem>Respond to data subject requests</ListItem>
            <ListItem>Comply with UK GDPR and applicable laws</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>13. Duration</SectionTitle>
          <Paragraph>
            This agreement remains valid for as long as StaffSync processes personal data on behalf of the Customer.
          </Paragraph>
        </Section>

        <ContactBox>
          <Box sx={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>
            Questions About Data Processing?
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

export default DataProcessingAgreement;
