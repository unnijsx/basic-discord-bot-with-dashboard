import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin } from 'antd';
import { UserOutlined, MessageOutlined, CustomerServiceOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import OnboardingWizard from '../components/OnboardingWizard';

const DashboardHome = () => {
    const { guildId } = useParams();
    const [guildData, setGuildData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    const fetchGuildData = async () => {
        try {
            const { data } = await axios.get(`/guilds/${guildId}`);
            setGuildData(data);
            // Logic to show onboarding if strictly needed, but let's assume they want dashboard
            if (data.modules && !data.configured) {
                // setShowOnboarding(true); 
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

    if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

    return (
        <div style={{ padding: '0 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 30 }}>
                {guildData?.icon && <img src={guildData.icon} alt="Icon" style={{ width: 64, height: 64, borderRadius: '50%', marginRight: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }} />}
                <div>
                    <h1 style={{ color: '#fff', margin: 0, fontSize: '2rem' }}>{guildData?.name || 'Server Overview'}</h1>
                    <span style={{ color: '#4caf50', fontWeight: 'bold' }}>● Bot Online</span>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                    <Card bordered={false} style={{ background: 'linear-gradient(135deg, #5865F2 0%, #4752c4 100%)', borderRadius: 16 }}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Members</span>}
                            value={guildData?.memberCount || 0}
                            prefix={<UserOutlined style={{ color: '#fff' }} />}
                            valueStyle={{ color: '#fff', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card bordered={false} style={{ background: '#2f3136', borderRadius: 16, border: '1px solid #202225' }}>
                        <Statistic
                            title={<span style={{ color: '#b9bbbe' }}>Channels</span>}
                            value={guildData?.channelCount || 0}
                            prefix={<MessageOutlined style={{ color: '#00b0f4' }} />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card bordered={false} style={{ background: '#2f3136', borderRadius: 16, border: '1px solid #202225' }}>
                        <Statistic
                            title={<span style={{ color: '#b9bbbe' }}>Roles</span>}
                            value={guildData?.roleCount || 0}
                            prefix={<CustomerServiceOutlined style={{ color: '#eb459e' }} />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
            </Row>

            <h2 style={{ color: '#fff', marginTop: 40 }}>Quick Actions</h2>
            <Row gutter={[16, 16]}>
                <Col xs={12} md={6}>
                    <Card hoverable style={{ background: '#2f3136', border: '1px solid #202225', borderRadius: 12 }}>
                        <Statistic title="Moderation" value=" " prefix={<SafetyCertificateOutlined style={{ color: '#faa61a' }} />} />
                    </Card>
                </Col>
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

export default DashboardHome;
