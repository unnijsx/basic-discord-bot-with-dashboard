import React from 'react';
import { Button, Typography, Space, Row, Col, Card } from 'antd';
import { RocketOutlined, BarChartOutlined, SafetyCertificateOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #121212 0%, #1a1a1a 100%);
  color: #fff;
  overflow-x: hidden;
`;

const HeroSection = styled.div`
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: radial-gradient(circle at 50% 50%, #2a2a2a 0%, #121212 70%);
  padding: 0 20px;
  animation: ${fadeIn} 1s ease-out;
`;

const GradientText = styled.span`
  background: linear-gradient(45deg, #5865F2, #00b0f4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
`;

const FeatureCard = styled(Card)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  transition: transform 0.3s ease, border-color 0.3s ease;
  height: 100%;

  &:hover {
    transform: translateY(-10px);
    border-color: #5865F2;
  }

  .ant-card-meta-title {
    color: #fff !important;
    font-size: 1.2rem;
  }
  .ant-card-meta-description {
    color: #aaa !important;
  }
`;

const Navbar = styled.nav`
  position: absolute;
  top: 0;
  width: 100%;
  padding: 20px 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const FeaturesSection = styled.div`
  padding: 100px 50px;
  background: #121212;
`;

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleCta = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    const features = [
        {
            icon: <SafetyCertificateOutlined style={{ fontSize: '32px', color: '#5865F2' }} />,
            title: 'Advanced Moderation',
            desc: 'Keep your server safe with auto-moderation, logs, and powerful tools.'
        },
        {
            icon: <CustomerServiceOutlined style={{ fontSize: '32px', color: '#eb459e' }} />,
            title: 'High-Quality Music',
            desc: 'Stream your favorite tunes with a lag-free, high-quality music player.'
        },
        {
            icon: <BarChartOutlined style={{ fontSize: '32px', color: '#ffad00' }} />,
            title: 'Deep Analytics',
            desc: 'Understand your community with detailed insights and growth tracking.'
        },
        {
            icon: <RocketOutlined style={{ fontSize: '32px', color: '#00b0f4' }} />,
            title: 'Role Management',
            desc: 'Automate roles with reaction roles (coming soon) and leveling systems.'
        }
    ];

    return (
        <Container>
            <Navbar>
                <Title level={3} style={{ color: '#fff', margin: 0 }}>
                    <RocketOutlined /> Nova<GradientText>Bot</GradientText>
                </Title>
                <Space>
                    <Button type="text" style={{ color: '#fff' }} onClick={() => window.open('https://discord.com', '_blank')}>Support</Button>
                    <Button type="primary" shape="round" onClick={handleCta}>
                        {user ? 'Go to Dashboard' : 'Login'}
                    </Button>
                </Space>
            </Navbar>

            <HeroSection>
                <Title style={{ color: '#fff', fontSize: '4rem', marginBottom: 20 }}>
                    Supercharge your <GradientText>Discord Server</GradientText>
                </Title>
                <Paragraph style={{ color: '#ccc', fontSize: '1.2rem', maxWidth: 600, marginBottom: 40 }}>
                    The all-in-one bot for moderation, music, leveling, and analytics.
                    Manage your community with a beautiful, easy-to-use dashboard.
                </Paragraph>
                <Space size="large">
                    <Button type="primary" size="large" shape="round" icon={<RocketOutlined />} style={{ height: 50, padding: '0 40px', fontSize: '1.2rem' }} onClick={handleCta}>
                        Get Started
                    </Button>
                    <Button size="large" shape="round" ghost style={{ height: 50, padding: '0 40px', fontSize: '1.2rem', borderColor: '#fff', color: '#fff' }} onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                        Learn More
                    </Button>
                </Space>
            </HeroSection>

            <FeaturesSection id="features">
                <Title level={2} style={{ color: '#fff', textAlign: 'center', marginBottom: 60 }}>
                    Everything you need
                </Title>
                <Row gutter={[32, 32]} justify="center">
                    {features.map((f, i) => (
                        <Col xs={24} sm={12} md={6} key={i}>
                            <FeatureCard>
                                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                    {f.icon}
                                    <div>
                                        <Title level={4} style={{ color: '#fff', margin: 0 }}>{f.title}</Title>
                                        <Text style={{ color: '#aaa' }}>{f.desc}</Text>
                                    </div>
                                </Space>
                            </FeatureCard>
                        </Col>
                    ))}
                </Row>
            </FeaturesSection>

            <div style={{ textAlign: 'center', padding: '40px', background: '#0a0a0a', color: '#444' }}>
                NovaBot &copy; 2026. Built for Communities.
            </div>
        </Container>
    );
};

export default LandingPage;
