import { Box, styled, keyframes } from '@mui/material';
import { colors } from '../../utilities/colors';
import { FormatQuote, Star } from '@mui/icons-material';

const scrollAnimation = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`;

const Section = styled(Box)({
  backgroundColor: colors.secondary.white,
  padding: '80px 48px',
  overflow: 'hidden',
  '@media (max-width: 768px)': {
    padding: '60px 16px',
  },
});

const Content = styled(Box)({
  maxWidth: '1200px',
  margin: '0 auto',
  textAlign: 'center',
});

const Badge = styled(Box)({
  display: 'inline-block',
  padding: '8px 16px',
  borderRadius: '20px',
  backgroundColor: '#10B981',
  marginBottom: '24px',
  '& span': {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 600,
    color: colors.secondary.white,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
});

const Title = styled('h2')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '30px',
  fontWeight: 700,
  color: colors.primary.navy,
  margin: 0,
  marginBottom: '16px',
  '@media (max-width: 768px)': {
    fontSize: '28px',
  },
});

const Subtitle = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '18px',
  fontWeight: 400,
  color: colors.text.secondary,
  margin: 0,
  marginBottom: '48px',
  '@media (max-width: 768px)': {
    fontSize: '16px',
  },
});

const CardsWrapper = styled(Box)({
  overflow: 'hidden',
  width: '100%',
});

const CardsContainer = styled(Box)({
  display: 'flex',
  gap: '24px',
  animation: `${scrollAnimation} 25s linear infinite`,
  '&:hover': {
    animationPlayState: 'paused',
  },
  '@media (max-width: 768px)': {
    gap: '16px',
  },
});

const TestimonialCard = styled(Box)({
  minWidth: '320px',
  maxWidth: '320px',
  backgroundColor: colors.secondary.white,
  borderRadius: '16px',
  padding: '32px',
  textAlign: 'left',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid #F3F4F6',
  flexShrink: 0,
  '@media (max-width: 768px)': {
    minWidth: '280px',
    maxWidth: '280px',
    padding: '24px',
  },
});

const QuoteIcon = styled(Box)({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: colors.primary.navy,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '20px',
  '& svg': {
    fontSize: '24px',
    color: colors.secondary.white,
    transform: 'rotate(180deg)',
  },
});

const StarsContainer = styled(Box)({
  display: 'flex',
  gap: '4px',
  marginBottom: '16px',
  '& svg': {
    fontSize: '20px',
    color: '#FBBF24',
  },
});

const ReviewText = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '15px',
  fontWeight: 400,
  color: colors.text.primary,
  margin: 0,
  marginBottom: '24px',
  lineHeight: 1.7,
});

const AuthorName = styled('h4')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '16px',
  fontWeight: 600,
  color: colors.primary.navy,
  margin: 0,
  marginBottom: '4px',
});

const AuthorRole = styled('p')({
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  fontWeight: 400,
  color: colors.text.secondary,
  margin: 0,
});

const testimonials = [
  {
    text: "StaffSync cut our admin time by 70%. The emergency broadcast feature alone has saved us thousands in lost shifts.",
    author: "Serhiy Hipskyy",
    role: "CEO Universal",
    rating: 5,
  },
  {
    text: "The GPS clock-in feature has eliminated buddy punching completely. Our payroll accuracy improved dramatically.",
    author: "Emma Thompson",
    role: "HR Director, TechCorp",
    rating: 5,
  },
  {
    text: "We manage over 500 workers across 20 sites. StaffSync makes it feel effortless with real-time visibility.",
    author: "James Wilson",
    role: "Operations Manager",
    rating: 5,
  },
  {
    text: "The compliance tracking alone is worth it. No more last-minute scrambles for expired certifications.",
    author: "Sarah Chen",
    role: "Compliance Officer",
    rating: 5,
  },
  {
    text: "Our workers love the mobile app. Shift swaps that used to take hours now happen in minutes.",
    author: "Michael Brown",
    role: "Agency Owner",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <Section id="testimonial">
      <Content>
        <Badge>
          <span>Testimonial</span>
        </Badge>
        <Title>Client Reviews</Title>
        <Subtitle>Check out what our amazing clients say about us</Subtitle>
        
        <CardsWrapper>
          <CardsContainer>
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <TestimonialCard key={index}>
                <QuoteIcon>
                  <FormatQuote />
                </QuoteIcon>
                <StarsContainer>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} />
                  ))}
                </StarsContainer>
                <ReviewText>{testimonial.text}</ReviewText>
                <AuthorName>{testimonial.author}</AuthorName>
                <AuthorRole>{testimonial.role}</AuthorRole>
              </TestimonialCard>
            ))}
          </CardsContainer>
        </CardsWrapper>
      </Content>
    </Section>
  );
};

export default Testimonials;
