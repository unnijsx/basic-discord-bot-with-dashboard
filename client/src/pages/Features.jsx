import React, { useEffect } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Typography, Row, Col, Card, Button } from 'antd';
import {
    SafetyCertificateOutlined,
    CustomerServiceOutlined,
    BarChartOutlined,
    ThunderboltOutlined,
    FileTextOutlined,
    TeamOutlined,
    RightOutlined,
    RocketOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PremiumNavbar from '../components/Layout/PremiumNavbar';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph, Text } = Typography;

// Reuse Animations
const aurora = keyframes`
  0% { background-position: 50% 50%, 50% 50%; }
  100% { background-position: 350% 50%, 350% 50%; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Reuse Styled Components for consistency
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #0a0a0a;
    color: #fff;
    font-family: 'Inter', sans-serif;
  }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  padding-top: 100px;
`;

const AuroraBackground = styled.div`
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 50% 50%, rgba(88, 101, 242, 0.15), transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(235, 69, 158, 0.1), transparent 40%);
  animation: ${aurora} 60s linear infinite;
  z-index: 0;
  pointer-events: none;
`;

const HeaderSection = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 60px auto;
  padding: 0 20px;
  animation: ${fadeIn} 0.8s ease-out;
  position: relative;
  z-index: 1;
`;

const GradientText = styled.span`
  background: linear-gradient(135deg, #5865F2 0%, #99aab5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
`;

const FeatureCard = styled(Card)`
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 20px !important;
  transition: all 0.3s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.04) !important;
    border-color: #5865F2 !important;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    
    .anticon {
        transform: scale(1.1);
        color: #5865F2;
    }
  }

  .ant-card-meta-title {
    color: #fff !important;
    font-size: 1.25rem !important;
    font-weight: 700;
    margin-bottom: 12px !important;
  }
  
  .ant-card-meta-description {
    color: #b9bbbe !important;
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

const IconWrapper = styled.div`
    font-size: 2.5rem;
    color: #99aab5;
    margin-bottom: 20px;
    transition: all 0.3s;
    display: inline-block;
`;

const StyledButton = styled(Button)`
  height: 50px;
  padding: 0 30px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 25px;
  border: none;
  background: linear-gradient(135deg, #5865F2, #4752c4);
  box-shadow: 0 4px 15px rgba(88, 101, 242, 0.4);
  margin-top: 40px;
  
  &:hover {
    transform: scale(1.05);
    background: linear-gradient(135deg, #4752c4, #5865F2);
  }
`;

const Features = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const featuresList = [
        {
            icon: <SafetyCertificateOutlined />,
            title: 'Advanced Moderation',
            desc: 'Keep your server clean with customizable auto-filters for bad words, links, and caps. Set up mute, kick, and ban roles instantly.'
        },
        {
            icon: <CustomerServiceOutlined />,
            title: 'High-Fidelity Music',
            desc: 'Stream music from Spotify, SoundCloud, and YouTube with crystal clear quality. Create queues, skip tracks, and control playback.'
        },
        {
            icon: <BarChartOutlined />,
            title: 'Detailed Analytics',
            desc: 'Visualize member growth, message activity, and engagement trends with beautiful, interactive charts.'
        },
        {
            icon: <ThunderboltOutlined />,
            title: 'Leveling System',
            desc: 'Gamify your community with a robust XP and leveling system. Reward active members with custom roles and leaderboard spots.'
        },
        {
            icon: <FileTextOutlined />,
            title: 'Audit Logging',
            desc: 'Track every action taken in your server. From message deletions to role changes, nothing goes unnoticed.'
        },
        {
            icon: <TeamOutlined />,
            title: 'Role Management',
            desc: 'Self-assignable roles, reaction roles (coming soon), and easy management of member permissions.'
        }
    ];

    return (
        <PageWrapper>
            <GlobalStyle />
            <AuroraBackground />
            <PremiumNavbar />

            <HeaderSection>
                <div style={{ marginBottom: 15 }}>
                    <span style={{
                        color: '#5865F2',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        fontSize: '0.9rem'
                    }}>
                        Feature Showcase
                    </span>
                </div>
                <Title level={1} style={{ color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: 20 }}>
                    Everything Your <GradientText>Server Needs</GradientText>
                </Title>
                <Paragraph style={{ color: '#b9bbbe', fontSize: '1.2rem', maxWidth: 600, margin: '0 auto' }}>
                    From powerful moderation tools to engaging music playback, Rheox is packed with features to take your community to the next level.
                </Paragraph>
            </HeaderSection>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', paddingBottom: 100, position: 'relative', zIndex: 1 }}>
                <Row gutter={[24, 24]}>
                    {featuresList.map((feature, idx) => (
                        <Col xs={24} sm={12} lg={8} key={idx}>
                            <FeatureCard bordered={false}>
                                <IconWrapper>{feature.icon}</IconWrapper>
                                <Title level={4} style={{ color: '#fff' }}>{feature.title}</Title>
                                <Paragraph style={{ color: '#b9bbbe' }}>{feature.desc}</Paragraph>
                            </FeatureCard>
                        </Col>
                    ))}
                </Row>

                <div style={{ textAlign: 'center', marginTop: 80 }}>
                    <Title level={3} style={{ color: '#fff' }}>Ready to get started?</Title>
                    <StyledButton type="primary" onClick={() => navigate(user ? '/dashboard' : '/login')}>
                        {user ? 'Go to Dashboard' : 'Add to Discord'} <RocketOutlined />
                    </StyledButton>
                </div>
            </div>
        </PageWrapper>
    );
};

export default Features;
