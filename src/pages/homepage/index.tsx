import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Box } from '@mui/material'
import { Header, Footer } from "../../components/layout"
import Body from "./body"
import Problem from "./problem"
import Solution from "./solution"
import HowItWorks from "./howitworks"
import ProductPreview from "./productpreview"
import WhoItsFor from "./whoitsfor"
import TrustCompliance from "./trustcompliance"
import Pricing from "./pricing"
import Founder from "./founder"
import CTA from "./cta"
import { useDocumentTitle } from "../../hooks"
import AboutUs from './aboutUs'
import Features from './features'
import ContactUs from './contactus'

const Homepage = () => {
    useDocumentTitle('Home');
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            setTimeout(() => {
                const element = document.querySelector(location.hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    }, [location.hash]);

    return (
        <Box sx={{ position: 'relative' }}>
            <Header />
            <Body />
            <Box sx={{ position: 'relative', zIndex: 2, backgroundColor: 'white' }}>
                <AboutUs />
                <Features/>
                <Problem />
                <Solution />
                <HowItWorks />
                <ProductPreview />
                <WhoItsFor />
                <TrustCompliance />
                <Pricing />
                <Founder />
                <ContactUs />
                <CTA />
                <Footer />
            </Box>
        </Box>
    );
};

export default Homepage