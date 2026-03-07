import { Box } from '@mui/material';
import { Header, Footer } from '../../components/layout';
import ContactUsSection from '../homepage/contactus';
import { useDocumentTitle } from '../../hooks';

const ContactUsPage = () => {
  useDocumentTitle('Contact Us');
  
  return (
    <Box sx={{ position: 'relative' }}>
      <Header />
      <Box sx={{ paddingTop: '80px' }}>
        <ContactUsSection />
      </Box>
      <Footer />
    </Box>
  );
};

export default ContactUsPage;
