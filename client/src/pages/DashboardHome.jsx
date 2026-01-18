import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin } from 'antd';
import { UserOutlined, MessageOutlined, CustomerServiceOutlined } from '@ant-design/icons';
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
            if (!data.configured) {
                setShowOnboarding(true);
            }
        } catch (error) {
            console.error('Failed to fetch guild data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuildData();
    }, [guildId]);

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        fetchGuildData(); // Refresh data to reflect new config
    };

    if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

    return (
        <div>
            <h1 style={{ color: '#fff' }}>Server Overview</h1>
            <Row gutter={16}>
                <Col span={8}>
                    <Card variant="borderless">
                        <Statistic
                            title="Active Members"
                            value={1128} // Placeholder: Backend needs to return real stats
                            prefix={<UserOutlined />}
                            inputStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless">
                        <Statistic
                            title="Messages Today"
                            value={93} // Placeholder
                            prefix={<MessageOutlined />}
                            inputStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless">
                        <Statistic
                            title="Songs Queued"
                            value={5} // Placeholder
                            prefix={<CustomerServiceOutlined />}
                            inputStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
            </Row>

            <OnboardingWizard
                visible={showOnboarding}
                guildId={guildId}
                onClose={() => setShowOnboarding(false)} // Should we allow close without config? Rule 3 says "Allow skipping". Yes.
                onComplete={handleOnboardingComplete}
            />
        </div>
    );
};

export default DashboardHome;
