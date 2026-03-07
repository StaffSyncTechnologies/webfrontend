import { Box, styled } from '@mui/material';
import { colors } from '../../utilities/colors';

const Section = styled(Box)({
  padding: '80px 48px',
  backgroundColor: colors.primary.navy,
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

const PreviewGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: '24px',
  '@media (max-width: 900px)': {
    gridTemplateColumns: '1fr',
  },
});

const MainPreview = styled(Box)({
  backgroundColor: '#1E293B',
  borderRadius: '16px',
  padding: '24px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
});

const PreviewLabel = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: colors.primary.blue,
  margin: 0,
  marginBottom: '16px',
  textAlign: 'left',
});

const ScreenshotPlaceholder = styled(Box)({
  backgroundColor: '#0F172A',
  borderRadius: '12px',
  height: '320px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px dashed rgba(255, 255, 255, 0.2)',
  '& .icon': {
    fontSize: '48px',
    marginBottom: '16px',
  },
  '& .text': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  '@media (max-width: 768px)': {
    height: '220px',
  },
});

const SidePreviewsColumn = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const SmallPreview = styled(Box)({
  backgroundColor: '#1E293B',
  borderRadius: '16px',
  padding: '20px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  flex: 1,
});

const SmallScreenshot = styled(Box)({
  backgroundColor: '#0F172A',
  borderRadius: '10px',
  height: '120px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px dashed rgba(255, 255, 255, 0.2)',
  '& .text': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
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
});

const ProductPreview = () => {
  return (
    <Section id="product-preview">
      <Content>
        <Badge>Product Preview</Badge>
        <Title>See StaffSync in Action</Title>
        <Subtitle>A powerful yet intuitive platform designed for staffing agencies</Subtitle>
        
        <PreviewGrid>
          <MainPreview>
            <PreviewLabel>Admin Dashboard</PreviewLabel>
            <ScreenshotPlaceholder>
              <span className="icon">📊</span>
              <span className="text">Dashboard Screenshot Coming Soon</span>
            </ScreenshotPlaceholder>
          </MainPreview>
          
          <SidePreviewsColumn>
            <SmallPreview>
              <PreviewLabel>Shift Creation</PreviewLabel>
              <SmallScreenshot>
                <span className="text">📅 Shift Builder</span>
              </SmallScreenshot>
            </SmallPreview>
            
            <SmallPreview>
              <PreviewLabel>Worker App</PreviewLabel>
              <SmallScreenshot>
                <span className="text">📱 Mobile App</span>
              </SmallScreenshot>
            </SmallPreview>
          </SidePreviewsColumn>
        </PreviewGrid>

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
