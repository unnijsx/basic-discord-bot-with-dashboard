import React, { useEffect, useRef } from 'react';
import { Button, Typography, Space, Row, Col, Card, Avatar } from 'antd';
import { RocketOutlined, BarChartOutlined, SafetyCertificateOutlined, CustomerServiceOutlined, DiscordOutlined, RightOutlined, InstagramOutlined, TrophyOutlined, FireOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import PremiumNavbar from '../components/Layout/PremiumNavbar';

const { Title, Text, Paragraph } = Typography;

// --- Animations ---
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const aurora = keyframes`
  0% { background-position: 50% 50%, 50% 50%; }
  100% { background-position: 350% 50%, 350% 50%; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background-color: transparent; /* Let DynamicBackground show */
  }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  // background-color: #0a0a0a; // Removing opaque background to show video
  background-color: transparent;
  color: #fff;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  position: relative;
  will-change: transform; // Hint for GPU acceleration
`;

const AuroraBackground = styled.div`
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  // background: radial-gradient(circle at 50% 50%, rgba(88, 101, 242, 0.15), transparent 50%),
  //             radial-gradient(circle at 80% 20%, rgba(235, 69, 158, 0.1), transparent 40%);
  // animation: ${aurora} 60s linear infinite;
  z-index: 0;
  pointer-events: none;
  display: none; // Default hidden, relying on video background for main effect
  
  @media (min-width: 769px) {
    // Only enable if explicitly needed, otherwise keep hidden to save resources
    // display: block; 
  }
`;

const Navbar = styled.nav`
  position: fixed;
  top: 0;
  width: 100%;
  padding: 20px 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  @media (max-width: 768px) {
    padding: 15px 20px;
  }
`;

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding: 0 20px;
  text-align: center;
`;

const GradientText = styled.span`
  background: linear-gradient(135deg, #5865F2 0%, #99aab5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
`;

const NotificationWrapper = styled.div`
  position: absolute;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => props.visible ? 1 : 0};
  transform: ${props => props.visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)'};
  pointer-events: ${props => props.visible ? 'auto' : 'none'};
  z-index: 10;

  @media (max-width: 768px) {
    display: none;
  }
`;

// Reuse FloatingCard styles but remove positioning and pointer-events logic
const FloatingCardContent = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 20px;
  animation: ${float} 6s ease-in-out infinite;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
`;

const FadeInDiv = styled.div`
  animation: ${fadeIn} 1s ease-out;
  max-width: 800px;
`;

const FeatureGrid = styled.div`
  padding: 100px 50px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const ModernCard = styled(Card)`
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 24px !important;
  transition: all 0.4s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-10px);
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: #5865F2 !important;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    
    .anticon {
      transform: scale(1.1) rotate(5deg);
    }
  }

  .ant-card-meta-title {
    color: #fff !important;
    font-size: 1.5rem !important;
    font-weight: 700;
    margin-bottom: 12px !important;
  }
  
  .ant-card-meta-description {
    color: #b9bbbe !important;
    font-size: 1rem;
    line-height: 1.6;
  }
`;

const CtaButton = styled(Button)`
  height: 60px;
  padding: 0 40px;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 30px;
  border: none;
  background: linear-gradient(135deg, #ffb7c5, #ff9eb5); /* Sakura Pink Gradient */
  color: #2c2c2c !important; /* Dark text for contrast */
  box-shadow: 0 4px 15px rgba(255, 183, 197, 0.4);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(255, 183, 197, 0.6);
    background: linear-gradient(135deg, #ff9eb5, #ffb7c5);
    color: #000 !important;
  }
`;

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appName, appLogo } = useBranding();

  /* Notification Logic */
  const [activeCard, setActiveCard] = React.useState(null); // 0 for Member, 1 for Music, null for none

  useEffect(() => {
    let timeout;

    const showRandomCard = () => {
      // 30% chance to show nothing, 35% chance for card 0, 35% for card 1
      const rand = Math.random();
      if (rand < 0.3) {
        setActiveCard(null);
        timeout = setTimeout(showRandomCard, 3000); // Check again soon
      } else {
        const cardIndex = rand < 0.65 ? 0 : 1;
        setActiveCard(cardIndex);

        // Show for ~10 seconds (8000ms - 12000ms)
        const duration = Math.random() * 4000 + 8000;

        timeout = setTimeout(() => {
          setActiveCard(null);
          // Wait 3-8 seconds before potentially showing another
          timeout = setTimeout(showRandomCard, Math.random() * 5000 + 3000);
        }, duration);
      }
    };

    // Start loop after initial delay, only if not mobile
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      timeout = setTimeout(showRandomCard, 2000);
    }

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    document.title = "Rheox Development";
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleCta = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      icon: <SafetyCertificateOutlined style={{ fontSize: '48px', color: '#5865F2' }} />,
      title: 'Unbreakable Security',
      desc: 'Advanced auto-moderation, anti-spam filters, and raid protection keep your community safe 24/7.'
    },
    {
      icon: <CustomerServiceOutlined style={{ fontSize: '48px', color: '#eb459e' }} />,
      title: 'High-Fidelity Music',
      desc: 'Experience lag-free, crystal clear music playback with support for Spotify, SoundCloud, and more.'
    },
    {
      icon: <BarChartOutlined style={{ fontSize: '48px', color: '#faa61a' }} />,
      title: 'Deep Insights',
      desc: 'Track member growth, engagement, and retention with our beautiful, real-time analytics dashboards.'
    }
  ];

  return (
    <PageWrapper>
      <GlobalStyle />
      <AuroraBackground />

      <PremiumNavbar />

      {/* Decorative Floating Elements */}
      <NotificationWrapper style={{ top: '20%', left: '10%' }} visible={activeCard === 0}>
        <FloatingCardContent>
          <Space>
            <Avatar style={{ backgroundColor: '#5865F2' }} icon={<DiscordOutlined />} />
            <div>
              <Text strong style={{ color: '#fff' }}>New Member</Text><br />
              <Text type="secondary" style={{ fontSize: 12 }}>Just joined the server!</Text>
            </div>
          </Space>
        </FloatingCardContent>
      </NotificationWrapper>

      <NotificationWrapper style={{ bottom: '20%', right: '10%' }} visible={activeCard === 1}>
        <FloatingCardContent>
          <Space>
            <CustomerServiceOutlined style={{ fontSize: 24, color: '#eb459e' }} />
            <div>
              <Text strong style={{ color: '#fff' }}>Now Playing</Text><br />
              <Text type="secondary" style={{ fontSize: 12 }}>Lofi Hip Hop - 24/7</Text>
            </div>
          </Space>
        </FloatingCardContent>
      </NotificationWrapper>

      <HeroSection>
        <FadeInDiv>
          <div style={{ marginBottom: 20 }}>
            <span style={{
              padding: '8px 16px',
              background: 'rgba(88, 101, 242, 0.1)',
              border: '1px solid rgba(88, 101, 242, 0.3)',
              borderRadius: 20,
              color: '#5865F2',
              fontWeight: 600,
              fontSize: 14
            }}>
              ✨ V2.0 is live with Advanced Analytics
            </span>
          </div>
          <Title style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', margin: '20px 0', color: '#fff', lineHeight: 1.1, padding: '0 10px' }}>
            Rheox <GradientText>Development</GradientText>
          </Title>
          <Paragraph style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: '#b9bbbe', margin: '0 auto 40px auto', maxWidth: 600, lineHeight: 1.6, padding: '0 20px' }}>
            Elevate your Discord server with advanced automation, crystal-clear music, and powerful moderation tools. Join the revolution today.
          </Paragraph>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            <CtaButton type="primary" size="large" onClick={handleCta}>
              {user ? 'Open Dashboard' : 'Add to Discord'} <RightOutlined />
            </CtaButton>
            <Button size="large" onClick={() => navigate('/features')} style={{
              height: 60,
              padding: '0 40px',
              fontSize: '1.2rem',
              borderRadius: '30px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff'
            }}>
              View Features
            </Button>
          </div>
        </FadeInDiv>
      </HeroSection>

      <FeatureGrid>
        <Title level={2} style={{ textAlign: 'center', color: '#fff', marginBottom: 60 }}>
          Power-packed Modules
        </Title>
        <Row gutter={[32, 32]}>
          {features.map((f, i) => (
            <Col xs={24} md={8} key={i}>
              <ModernCard bordered={false}>
                <div style={{ marginBottom: 24, transition: 'transform 0.3s' }} className="icon-wrapper">
                  {f.icon}
                </div>
                <Title level={4} style={{ color: '#fff' }}>{f.title}</Title>
                <Paragraph style={{ color: '#b9bbbe' }}>{f.desc}</Paragraph>
              </ModernCard>
            </Col>
          ))}
        </Row>
      </FeatureGrid>

      <div style={{ padding: '60px 20px', background: 'rgba(255, 255, 255, 0.02)' }}>
        <Title level={2} style={{ textAlign: 'center', color: '#fff', marginBottom: 40 }}>
          Join Our Community
        </Title>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
          <a href="https://discord.gg/gyQh6KaSbp" target="_blank" rel="noopener noreferrer">
            <Button size="large" shape="circle" icon={<DiscordOutlined />} style={{ width: 60, height: 60, fontSize: 24, background: '#5865F2', border: 'none', color: '#fff' }} />
          </a>
          <a href="https://instagram.com/u/rheox_" target="_blank" rel="noopener noreferrer">
            <Button size="large" shape="circle" icon={<InstagramOutlined />} style={{ width: 60, height: 60, fontSize: 24, background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', border: 'none', color: '#fff' }} />
          </a>
        </div>
        <Paragraph style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
          Stay updated with the latest features and announcements.
        </Paragraph>
      </div>

      <div style={{ padding: '80px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#050505' }}>
        <Title level={3} style={{ color: '#fff' }}>Ready to transform your server?</Title>
        <Button type="primary" size="large" shape="round" style={{ marginTop: 20, height: 50, padding: '0 40px' }} onClick={handleCta}>
          Get Started Now
        </Button>
      </div>
    </PageWrapper>
  );
};

export default LandingPage;
