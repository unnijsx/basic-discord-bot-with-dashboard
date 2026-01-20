import React, { useEffect, useState } from 'react';
import PremiumNavbar from '../components/Layout/PremiumNavbar';
import { Typography, Row, Col, Card, Button, Avatar, Spin, Tag } from 'antd';
import styled from 'styled-components';
import { RocketOutlined, HeartOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const { Title, Paragraph, Text } = Typography;

const Container = styled.div`
    padding: 80px 50px;
    background: transparent;
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

const TeamCard = styled.div`
    background: #2b2d31;
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    border: 1px solid rgba(255,255,255,0.05);
    transition: transform 0.2s;
    &:hover {
        transform: translateY(-5px);
        background: #313338;
    }
`;

const About = () => {
    const navigate = useNavigate();
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    const TEAM_IDS = [
        { id: '562859302130286613', role: 'Lead Developer', color: '#5865F2' },
        { id: '718100913029382146', role: 'Manager', color: '#faa61a' },
        { id: '752505790631510016', role: 'Manager', color: '#faa61a' }
    ];

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const { data } = await api.post('/users/batch', { userIds: TEAM_IDS.map(m => m.id) });
                // Merge fetched data with static role info
                const merged = data.map(user => ({
                    ...user,
                    ...TEAM_IDS.find(t => t.id === user.id)
                }));
                // Sort to keep Developer first (simple way: rely on order or sort by role)
                merged.sort((a, b) => a.id === '562859302130286613' ? -1 : 1);
                setTeam(merged);
            } catch (err) {
                console.error("Failed to fetch team", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeam();
    }, []);

    return (
        <Container>
            <PremiumNavbar />
            <Title style={{ color: '#fff', fontSize: '3rem' }}>About Rheox</Title>
            <Paragraph style={{ color: '#b9bbbe', fontSize: '1.2rem', maxWidth: 800, margin: '0 auto 60px auto' }}>
                Established in 2022, Rheox is a vibrant development community dedicated to innovation.
                We actively specialize in developing Bots, unique Discord Servers, modern Websites, UI/UX Designs, and 3D Arts.
            </Paragraph>

            <Row gutter={[32, 32]} justify="center" style={{ marginBottom: 80 }}>
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

            <Title level={2} style={{ color: '#fff', marginBottom: 40 }}>Meet the Team</Title>

            {loading ? (
                <Spin size="large" />
            ) : (
                <Row gutter={[24, 24]} justify="center">
                    {team.map(member => (
                        <Col key={member.id} xs={24} sm={12} md={8} lg={6}>
                            <TeamCard>
                                <Avatar
                                    size={100}
                                    src={member.avatar}
                                    icon={<UserOutlined />}
                                    style={{ marginBottom: 16, border: `3px solid ${member.color}` }}
                                />
                                <Title level={4} style={{ color: '#fff', margin: 0 }}>
                                    {member.globalName || member.username}
                                </Title>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                                    @{member.username}
                                    {member.discriminator !== '0' && `#${member.discriminator}`}
                                </Text>
                                <Tag color={member.color} style={{ fontSize: 14, padding: '4px 12px' }}>
                                    {member.role?.toUpperCase()}
                                </Tag>
                            </TeamCard>
                        </Col>
                    ))}
                </Row>
            )}

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
