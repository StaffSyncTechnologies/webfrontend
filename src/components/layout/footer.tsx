import { Box, styled, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import { Button } from '../controls';
import { colors } from '../../utilities/colors';

const FooterWrapper = styled('footer')({
  width: '100%',
});

const NewsletterSection = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '32px 48px',
  backgroundColor: colors.secondary.white,
  borderBottom: `1px solid ${colors.border.light}`,
  position: 'relative',
  overflow: 'hidden',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    gap: '24px',
    padding: '24px 16px',
    alignItems: 'flex-start',
  },
});

const LogoBackgroundPattern = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: 'url(/logo.png)',
  backgroundRepeat: 'repeat',
  backgroundSize: '100px',
  opacity: 0.15,
  pointerEvents: 'none',
  zIndex: 0,
  backgroundColor: 'rgba(0,0,0,0.02)',
});

const NewsletterText = styled(Box)({
  '& h3': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '18px',
    fontWeight: 600,
    color: colors.text.primary,
    margin: 0,
    marginBottom: '8px',
  },
  '& p': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    color: colors.text.secondary,
    margin: 0,
  },
});

const NewsletterForm = styled(Box)({
  display: 'flex',
  gap: '12px',
  '@media (max-width: 768px)': {
    width: '100%',
    flexDirection: 'column',
  },
});

const EmailInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    borderRadius: '8px',
    backgroundColor: colors.secondary.white,
    minWidth: '280px',
    '& fieldset': {
      borderColor: colors.border.default,
    },
    '&:hover fieldset': {
      borderColor: colors.primary.navy,
    },
  },
  '@media (max-width: 768px)': {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      minWidth: 'unset',
    },
  },
});

const MainFooter = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
  gap: '48px',
  padding: '48px',
  backgroundColor: colors.primary.navy,
  '@media (max-width: 968px)': {
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
    padding: '32px',
  },
  '@media (max-width: 576px)': {
    gridTemplateColumns: '1fr',
    gap: '32px',
    padding: '24px 16px',
  },
});

const BrandSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const LogoImg = styled('img')({
  width: '48px',
  height: '48px',
  objectFit: 'contain',
});

const BrandName = styled('span')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '20px',
  fontWeight: 600,
  color: colors.secondary.white,
  marginLeft: '8px',
});

const Tagline = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: 'rgba(255, 255, 255, 0.7)',
  margin: 0,
  lineHeight: 1.6,
});

const Address = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: 'rgba(255, 255, 255, 0.6)',
  margin: 0,
  marginTop: '8px',
  lineHeight: 1.5,
});

const SocialLinks = styled(Box)({
  display: 'flex',
  gap: '16px',
  marginTop: '8px',
});

const SocialIcon = styled('a')({
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.secondary.white,
  transition: 'color 0.2s ease',
  '&:hover': {
    color: colors.primary.blue,
  },
});

const LinkColumn = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

const ColumnTitle = styled('h4')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.secondary.white,
  margin: 0,
  marginBottom: '8px',
});

const FooterLink = styled(Link)({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  color: 'rgba(255, 255, 255, 0.7)',
  textDecoration: 'none',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: colors.primary.blue,
  },
});

const BottomBar = styled(Box)({
  padding: '20px 48px',
  backgroundColor: colors.primary.navy,
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  '@media (max-width: 768px)': {
    padding: '16px',
    textAlign: 'center',
  },
});

const Copyright = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  color: 'rgba(255, 255, 255, 0.5)',
  margin: 0,
});

const productLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
];

const companyLinks = [
  { label: 'About us', href: '#about' },
  { label: 'Careers', href: '#careers' },
  { label: 'Contact', href: '#contact' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Cookies Policy', href: '/cookies' },
  { label: 'GDPR', href: '/gdpr' },
];

const Footer = () => {
  return (
    <FooterWrapper>
      <NewsletterSection>
        <LogoBackgroundPattern />
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', '@media (max-width: 768px)': { flexDirection: 'column', gap: '24px', alignItems: 'flex-start' } }}>
          <NewsletterText>
            <h3>Join our newsletter</h3>
            <p>We'll send you a nice letter once per week. No spam.</p>
          </NewsletterText>
          <NewsletterForm>
            <EmailInput
              placeholder="Enter your email"
              variant="outlined"
              size="small"
            />
            <Button variant="primary">Subscribe</Button>
          </NewsletterForm>
        </Box>
      </NewsletterSection>

      <MainFooter>
        <BrandSection>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LogoImg src="/logo.png" alt="StaffSync" />
            <BrandName>StaffSync</BrandName>
          </Box>
          <Tagline>
            The modern platform for flexible workforce management and compliant staffing solutions.
          </Tagline>
   <Address>
  <strong>StaffSync Technologies Ltd</strong><br />
  Registered in England and Wales<br />
  Company No: 17023276<br /><br />
  Registered Office:<br />
  71–75 Shelton Street,<br />
  Covent Garden,<br />
  London WC2H 9JQ<br />
  United Kingdom<br /><br />
  <a href="mailto:info@staffsynctech.co.uk">
    info@staffsynctech.co.uk
  </a>
</Address>

          <SocialLinks>
            <SocialIcon href="https://twitter.com" target="_blank" rel="noopener">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </SocialIcon>
            <SocialIcon href="https://linkedin.com" target="_blank" rel="noopener">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </SocialIcon>
            <SocialIcon href="https://facebook.com" target="_blank" rel="noopener">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </SocialIcon>
          </SocialLinks>
        </BrandSection>

        <LinkColumn>
          <ColumnTitle>Product</ColumnTitle>
          {productLinks.map((link) => (
            <FooterLink key={link.label} to={link.href}>
              {link.label}
            </FooterLink>
          ))}
        </LinkColumn>

        <LinkColumn>
          <ColumnTitle>Company</ColumnTitle>
          {companyLinks.map((link) => (
            <FooterLink key={link.label} to={link.href}>
              {link.label}
            </FooterLink>
          ))}
        </LinkColumn>

        <LinkColumn>
          <ColumnTitle>Legal</ColumnTitle>
          {legalLinks.map((link) => (
            <FooterLink key={link.label} to={link.href}>
              {link.label}
            </FooterLink>
          ))}
        </LinkColumn>
      </MainFooter>

      <BottomBar>
        <Copyright>© {new Date().getFullYear()} StaffSync Ltd. Registered in England & Wales.</Copyright>
      </BottomBar>
    </FooterWrapper>
  );
};

export default Footer;