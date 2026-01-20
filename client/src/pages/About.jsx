import React from 'react';
import PremiumNavbar from '../components/Layout/PremiumNavbar';
import { Typography, Row, Col, Card, Button } from 'antd';
import styled from 'styled-components';
import { RocketOutlined, HeartOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Container = styled.div`
    padding: 80px 50px;
    background: #121212;
    min-height: 100vh;
    color: #fff;
    text-align: center;
`;

const FeatureCard = styled(Card)`
    background: #1e1f22;
    border: 1px solid #2b2d31;
    border-radius: 12px;
    height: 100%;
    .ant-card-meta-title { color: #fff; }
    .ant-card-meta-description { color: #b9bbbe; }
`;

const About = () => {
    const navigate = useNavigate();

    return (
        <Container>
            <PremiumNavbar />
            <Title style={{ color: '#fff', fontSize: '3rem' }}>About Rheox</Title>
            <Paragraph style={{ color: '#b9bbbe', fontSize: '1.2rem', maxWidth: 800, margin: '0 auto 60px auto' }}>
                Rheox is an advanced, all-in-one Discord bot designed to supercharge your community.
                From robust moderation to high-quality music and deep analytics, we provide the tools you need to grow on Discord.
            </Paragraph>

            <Row gutter={[32, 32]} justify="center">
                <Col xs={24} md={8}>
                    <FeatureCard>
                        <RocketOutlined style={{ fontSize: 40, color: '#5865F2', marginBottom: 20 }} />
                        <Card.Meta title="Performance First" description="Built with modern tech for speed and reliability." />
                    </FeatureCard>
                </Col>
                <Col xs={24} md={8}>
                    <FeatureCard>
                        <HeartOutlined style={{ fontSize: 40, color: '#eb459e', marginBottom: 20 }} />
                        <Card.Meta title="User Friendly" description="A dashboard so intuitive, you won't need a manual." />
                    </FeatureCard>
                </Col>
                <Col xs={24} md={8}>
                    <FeatureCard>
                        <TeamOutlined style={{ fontSize: 40, color: '#faa61a', marginBottom: 20 }} />
                        <Card.Meta title="Community Driven" description="Features built based on what community owners actually need." />
                    </FeatureCard>
                </Col>
            </Row>

            <div style={{ marginTop: 80 }}>
                <Title level={3} style={{ color: '#fff' }}>Join the Revolution</Title>
                <Button type="primary" size="large" shape="round" onClick={() => navigate('/')}>
                    Get Started
                </Button>
            </div>
        </Container>
    );
};

export default About;
