import { Box, styled } from '@mui/material';
import { colors } from '../../utilities/colors';
import mobileImage from '../../assets/mobile.png';
import dashBImage from '../../assets/dashB.png';

const Section = styled(Box)({
  padding: '80px 48px',
  backgroundColor: colors.primary.navy,
  position: 'relative',
  overflow: 'hidden',
  '@media (max-width: 768px)': {
    padding: '60px 24px',
  },
  '@media (max-width: 576px)': {
    padding: '48px 16px',
  },
});

const LogoBackground = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: 'url(/logo.png)',
  backgroundRepeat: 'repeat',
  backgroundSize: '120px',
  opacity: 0.04,
  maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 80%)',
  WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 80%)',
  pointerEvents: 'none',
});

const Content = styled(Box)({
  position: 'relative',
  zIndex: 1,
  maxWidth: '1200px',
  margin: '0 auto',
  textAlign: 'center',
});

const Badge = styled('span')({
  display: 'inline-block',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  color: colors.primary.blue,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  padding: '8px 20px',
  border: `1px solid ${colors.primary.blue}`,
  borderRadius: '20px',
  marginBottom: '24px',
});

const Title = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '36px',
  fontWeight: 700,
  color: colors.secondary.white,
  margin: 0,
  marginBottom: '16px',
  lineHeight: 1.3,
  '@media (max-width: 768px)': {
    fontSize: '28px',
  },
});

const Subtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  color: 'rgba(255, 255, 255, 0.7)',
  margin: 0,
  marginBottom: '48px',
  '@media (max-width: 768px)': {
    fontSize: '16px',
  },
});

const PreviewRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '32px',
  justifyContent: 'center',
  height: '480px',
  '@media (max-width: 1024px)': {
    height: '380px',
    gap: '24px',
  },
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    height: 'auto',
    gap: '32px',
  },
});

const DashboardImage = styled('img')({
  height: '100%',
  maxWidth: '60%',
  objectFit: 'contain',
  borderRadius: '12px',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
  '@media (max-width: 768px)': {
    height: 'auto',
    maxWidth: '100%',
    width: '100%',
    borderRadius: '10px',
  },
});

const MobileImage = styled('img')({
  height: '100%',
  maxWidth: '20%',
  objectFit: 'contain',
  borderRadius: '12px',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
  '@media (max-width: 768px)': {
    height: 'auto',
    maxWidth: '45%',
    borderRadius: '10px',
  },
});

const DownloadPanel = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  flexShrink: 0,
  '@media (max-width: 768px)': {
    width: '100%',
    maxWidth: '340px',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '12px',
  },
});

const DownloadTitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 600,
  color: colors.secondary.white,
  margin: 0,
  marginBottom: '4px',
  '@media (max-width: 768px)': {
    width: '100%',
    fontSize: '16px',
  },
});

const DownloadSubtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '12px',
  color: 'rgba(255, 255, 255, 0.5)',
  margin: 0,
  marginBottom: '8px',
  '@media (max-width: 768px)': {
    width: '100%',
    marginBottom: '4px',
  },
});

const DownloadCard = styled('a')({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  backgroundColor: 'rgba(255, 255, 255, 0.06)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  width: '100%',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: `1px solid ${colors.primary.blue}`,
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
  },
  '@media (max-width: 768px)': {
    width: 'auto',
    flex: '1 1 140px',
    padding: '10px 12px',
    gap: '8px',
  },
});

const QrCodeWrapper = styled(Box)({
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  '& img': {
    width: '64px',
    height: '64px',
    display: 'block',
  },
  '@media (max-width: 768px)': {
    '& img': {
      width: '48px',
      height: '48px',
    },
  },
});

const StoreInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  textAlign: 'left',
  '& .store-icon': {
    width: '20px',
    height: '20px',
    flexShrink: 0,
    marginBottom: '2px',
  },
  '& .store-label': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 1.2,
    letterSpacing: '0.5px',
  },
  '& .store-name': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: colors.secondary.white,
    lineHeight: 1.3,
  },
  '& .scan-hint': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.35)',
    marginTop: '2px',
  },
});

const FeatureHighlights = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '16px',
  marginTop: '32px',
  '@media (max-width: 900px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (max-width: 480px)': {
    gridTemplateColumns: '1fr',
  },
});

const Highlight = styled(Box)({
  padding: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  textAlign: 'center',
  '& .number': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '28px',
    fontWeight: 700,
    color: colors.primary.blue,
    margin: 0,
    marginBottom: '8px',
  },
  '& .label': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.7)',
    margin: 0,
  },
  '@media (max-width: 480px)': {
    padding: '16px',
    '& .number': {
      fontSize: '24px',
    },
  },
});

const ProductPreview = () => {
  return (
    <Section id="product-preview">
      <LogoBackground />
      <Content>
        <Badge>Product Preview</Badge>
        <Title>See StaffSync in Action</Title>
        <Subtitle>A powerful yet intuitive platform designed for staffing agencies</Subtitle>
        
        <PreviewRow>
          <DashboardImage src={dashBImage} alt="Admin Dashboard" />
          <MobileImage src={mobileImage} alt="Worker Mobile App" />
          
          <DownloadPanel>
            <DownloadTitle>Download App</DownloadTitle>
            <DownloadSubtitle>Scan QR to download</DownloadSubtitle>
            <DownloadCard href="https://apps.apple.com" target="_blank" rel="noopener noreferrer">
              <QrCodeWrapper>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent('https://apps.apple.com')}&bgcolor=ffffff&color=000000`}
                  alt="App Store QR Code"
                />
              </QrCodeWrapper>
              <StoreInfo>
                <svg className="store-icon" viewBox="0 0 24 24" fill="white">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span className="store-label">Download on the</span>
                <span className="store-name">App Store</span>
                <span className="scan-hint">Scan to download</span>
              </StoreInfo>
            </DownloadCard>
            <DownloadCard href="https://play.google.com/store/apps/details?id=com.staffsync.worker" target="_blank" rel="noopener noreferrer">
              <QrCodeWrapper>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${encodeURIComponent('https://play.google.com/store/apps/details?id=com.staffsync.worker')}&bgcolor=ffffff&color=000000`}
                  alt="Google Play QR Code"
                />
              </QrCodeWrapper>
              <StoreInfo>
                <svg className="store-icon" viewBox="0 0 24 24" fill="white">
                  <path d="M3.18 23.04c-.35-.2-.57-.59-.57-1.04V2c0-.45.22-.84.58-1.04L13.04 12 3.18 23.04zM14.47 13.42l-2.83 2.83 8.47 4.88c.63.36 1.14.11 1.14-.56 0-.17-.04-.36-.13-.56l-6.65-6.59zM14.47 10.58l6.65-6.59c.09-.2.13-.39.13-.56 0-.67-.51-.92-1.14-.56L11.64 8.175l2.83 2.405zM4.56 1.64l9.03 9.03-2.83 2.83L4.56 1.64z"/>
                </svg>
                <span className="store-label">Get it on</span>
                <span className="store-name">Google Play</span>
                <span className="scan-hint">Scan to download</span>
              </StoreInfo>
            </DownloadCard>
          </DownloadPanel>
        </PreviewRow>

        <FeatureHighlights>
          <Highlight>
            <p className="number">50%</p>
            <p className="label">Less admin time</p>
          </Highlight>
          <Highlight>
            <p className="number">90%</p>
            <p className="label">Shift fill rate</p>
          </Highlight>
          <Highlight>
            <p className="number">100%</p>
            <p className="label">Compliance ready</p>
          </Highlight>
          <Highlight>
            <p className="number">24/7</p>
            <p className="label">Support available</p>
          </Highlight>
        </FeatureHighlights>
      </Content>
    </Section>
  );
};

export default ProductPreview;
