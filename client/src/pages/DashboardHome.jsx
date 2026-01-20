import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin, Progress, Button, Avatar, Typography, Badge, Tooltip } from 'antd';
import {
    UserOutlined,
    MessageOutlined,
    CustomerServiceOutlined,
    SafetyCertificateOutlined,
    RocketOutlined,
    SettingOutlined,
    ArrowRightOutlined,
    DollarOutlined,
    DeploymentUnitOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import OnboardingWizard from '../components/OnboardingWizard';
import styled from 'styled-components';

const { Title, Text } = Typography;

const HeroSection = styled.div`
    background: linear-gradient(135deg, #5865F2 0%, #4752c4 100%);
    padding: 30px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    box-shadow: 0 10px 40px rgba(88, 101, 242, 0.2);
    position: relative;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 300px;
        height: 100%;
        background: url('https://svgshare.com/i/14u.svg') no-repeat right center;
        background-size: contain;
        opacity: 0.1;
        pointer-events: none;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
    }
`;

const StatCard = styled(Card)`
    background: #18191c;
    border: 1px solid #2f3136;
    border-radius: 16px;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        border-color: #5865F2;
    }

    .ant-statistic-title {
        color: #b9bbbe;
        font-size: 14px;
    }
    .ant-statistic-content {
        color: #fff;
    }
`;

const ActionCard = styled(Card)`
    background: #2f3136;
    border: 1px solid #202225;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    height: 100%;

    &:hover {
        background: #36393f;
        transform: scale(1.02);
        border-color: ${props => props.color || '#5865F2'};
    }
`;

const IconWrapper = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => props.bg || 'rgba(88, 101, 242, 0.1)'};
    color: ${props => props.color || '#5865F2'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 16px;
`;

const DashboardHome = () => {
    const { guildId } = useParams();
    const navigate = useNavigate();
    const [guildData, setGuildData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    const { t } = useTranslation();

    const fetchGuildData = async () => {
        try {
            const { data } = await axios.get(`/guilds/${guildId}`);
            setGuildData(data);
            if (data.modules && !data.configured) {
                // Determine completion percentage
                // logic here if needed
            }
        } catch (error) {
            console.error('Failed to fetch guild data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "RHX | DASHBOARD";
        fetchGuildData();
    }, [guildId]);

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        fetchGuildData();
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" /></div>;

    // Calculate "Setup Progress" based on enabled modules/config
    const modules = guildData?.modules || {};
    const enabledCount = Object.values(modules).filter(Boolean).length;
    const totalModules = Object.keys(modules).length || 5;
    const progressPercent = Math.round((enabledCount / totalModules) * 100) || 20;

    const modulesList = [
        { title: t('sidebar.moderation'), desc: t('dashboard.descriptions.moderation'), icon: <SafetyCertificateOutlined />, color: '#faa61a', bg: 'rgba(250, 166, 26, 0.1)', path: 'moderation' },
        { title: 'Economy', desc: t('dashboard.descriptions.economy'), icon: <DollarOutlined />, color: '#ffd700', bg: 'rgba(255, 215, 0, 0.1)', path: 'economy' },
        { title: t('sidebar.music'), desc: t('dashboard.descriptions.music'), icon: <CustomerServiceOutlined />, color: '#eb459e', bg: 'rgba(235, 69, 158, 0.1)', path: 'music' },
        { title: t('sidebar.analytics'), desc: t('dashboard.descriptions.analytics'), icon: <BarChartOutlined />, color: '#5865F2', bg: 'rgba(88, 101, 242, 0.1)', path: 'analytics' },
        { title: t('sidebar.tickets'), desc: t('dashboard.descriptions.tickets'), icon: <DeploymentUnitOutlined />, color: '#3ba55c', bg: 'rgba(59, 165, 92, 0.1)', path: 'tickets' },
        { title: 'Embeds', desc: t('dashboard.descriptions.embeds'), icon: <MessageOutlined />, color: '#00b0f4', bg: 'rgba(0, 176, 244, 0.1)', path: 'messages' },
        { title: t('sidebar.settings'), desc: t('dashboard.descriptions.settings'), icon: <SettingOutlined />, color: '#f04747', bg: 'rgba(240, 71, 71, 0.1)', path: 'settings' },
    ];

    return (
        <div style={{ padding: '0 10px', maxWidth: 1600, margin: '0 auto' }}>

            {/* HERRO SECTION */}
            <HeroSection>
                <div style={{ display: 'flex', alignItems: 'center', zIndex: 2 }}>
                    <Avatar
                        src={guildData?.icon}
                        size={100}
                        style={{ border: '4px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', marginRight: 24 }}
                    >
                        {guildData?.name?.charAt(0)}
                    </Avatar>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Title level={2} style={{ color: '#fff', margin: 0 }}>{guildData?.name}</Title>
                            <TagComponent status={true} />
                        </div>
                        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, display: 'block', marginTop: 8 }}>
                            {t('dashboard.welcomeBack')}
                        </Text>
                        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 15 }}>
                            <Button type="primary" size="large" icon={<SettingOutlined />} style={{ background: '#fff', color: '#5865F2', border: 'none' }} onClick={() => navigate('settings')}>
                                {t('sidebar.settings')}
                            </Button>
                            <Button ghost size="large" icon={<CustomerServiceOutlined />} onClick={() => navigate('music')}>
                                {t('sidebar.music')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Visual Progress Circle */}
                <div style={{ textAlign: 'center', zIndex: 2, minWidth: 150 }}>
                    <Progress
                        type="circle"
                        percent={progressPercent}
                        strokeColor="#fff"
                        trailColor="rgba(255,255,255,0.2)"
                        width={80}
                        format={percent => <span style={{ color: '#fff' }}>{percent}%</span>}
                    />
                    <div style={{ color: '#fff', marginTop: 10, fontWeight: 500 }}>{t('dashboard.setupScore')}</div>
                </div>
            </HeroSection>

            {/* KEY METRICS */}
            <Row gutter={[20, 20]} style={{ marginBottom: 40 }}>
                <Col xs={24} sm={8}>
                    <StatCard bordered={false}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <Statistic
                                    title={t('dashboard.metrics.totalMembers')}
                                    value={guildData?.memberCount || 0}
                                    prefix={<UserOutlined />}
                                />
                                <Text type="success" style={{ fontSize: 12 }}>+ Live Tracking</Text>
                            </div>
                            <StatsIconWrapper bg="rgba(88, 101, 242, 0.1)" color="#5865F2">
                                <UserOutlined />
                            </StatsIconWrapper>
                        </div>
                    </StatCard>
                </Col>
                <Col xs={24} sm={8}>
                    <StatCard bordered={false}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <Statistic
                                    title={t('dashboard.metrics.activeChannels')}
                                    value={guildData?.channelCount || 0}
                                    prefix={<MessageOutlined />}
                                />
                                <Text style={{ color: '#aaa', fontSize: 12 }}>Across {guildData?.categoryCount || 0} categories</Text>
                            </div>
                            <StatsIconWrapper bg="rgba(76, 175, 80, 0.1)" color="#4caf50">
                                <DeploymentUnitOutlined />
                            </StatsIconWrapper>
                        </div>
                    </StatCard>
                </Col>
                <Col xs={24} sm={8}>
                    <StatCard bordered={false}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <Statistic
                                    title={t('dashboard.metrics.totalRoles')}
                                    value={guildData?.roleCount || 0}
                                    prefix={<SafetyCertificateOutlined />}
                                />
                                <Text style={{ color: '#aaa', fontSize: 12 }}>Configured permissions</Text>
                            </div>
                            <StatsIconWrapper bg="rgba(235, 69, 158, 0.1)" color="#eb459e">
                                <SafetyCertificateOutlined />
                            </StatsIconWrapper>
                        </div>
                    </StatCard>
                </Col>
            </Row>

            {/* CONTROL CENTER */}
            <Title level={3} style={{ color: '#fff', marginBottom: 24, paddingLeft: 5, borderLeft: '4px solid #5865F2' }}>{t('dashboard.controlCenter')}</Title>
            <Row gutter={[20, 20]}>
                {modulesList.map((mod, idx) => (
                    <Col xs={24} sm={12} md={6} key={idx}>
                        <ActionCard color={mod.color} onClick={() => navigate(mod.path)}>
                            <IconWrapper bg={mod.bg} color={mod.color}>
                                {mod.icon}
                            </IconWrapper>
                            <Title level={4} style={{ color: '#fff', margin: '0 0 8px 0', fontSize: 18 }}>{mod.title}</Title>
                            <Text style={{ color: '#b9bbbe', fontSize: 13 }}>{mod.desc}</Text>
                        </ActionCard>
                    </Col>
                ))}
            </Row>

            <OnboardingWizard
                visible={showOnboarding}
                guildId={guildId}
                onClose={() => setShowOnboarding(false)}
                onComplete={handleOnboardingComplete}
            />
        </div>
    );
};

// --- Helpers ---
const TagComponent = () => (
    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#43b581', marginRight: 8, boxShadow: '0 0 8px #43b581' }}></div>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 12, letterSpacing: 0.5 }}>ONLINE</span>
    </div>
);

const StatsIconWrapper = styled.div`
    width: 40px; height: 40px; borderRadius: 10px;
    background: ${props => props.bg};
    color: ${props => props.color};
    display: flex; alignItems: center; justifyContent: center;
    font-size: 20px;
`;



export default DashboardHome;
