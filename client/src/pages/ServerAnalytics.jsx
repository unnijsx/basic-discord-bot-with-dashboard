import React, { useEffect, useState } from 'react';
import { Typography, Card, Spin, Row, Col, Statistic, Empty } from 'antd';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import axios from '../api/axios';
import styled from 'styled-components';

const { Title, Text } = Typography;

const PageContainer = styled.div`
    padding: 24px;
`;

const StyledCard = styled(Card)`
    background: #2f3136;
    border-color: #202225;
    .ant-card-head {
        border-bottom: 1px solid #202225;
        color: #fff;
    }
    .ant-statistic-title {
        color: #b9bbbe;
    }
    .ant-statistic-content {
        color: #fff;
    }
`;

const ServerAnalytics = () => {
    const { guildId } = useParams();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`/stats/${guildId}/analytics`);
                setData(res.data);
            } catch (error) {
                console.error('Failed to load stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [guildId]);

    // Calculate totals for summary cards
    const totalMessages = data.reduce((acc, cur) => acc + cur.messagesSent, 0);
    const totalJoins = data.reduce((acc, cur) => acc + cur.membersJoined, 0);
    const totalLeaves = data.reduce((acc, cur) => acc + cur.membersLeft, 0);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#18191c', padding: '10px', border: '1px solid #202225', borderRadius: '4px' }}>
                    <p style={{ color: '#fff' }}>{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;

    return (
        <PageContainer>
            <Title level={2} style={{ color: '#fff', marginBottom: 24 }}>Server Analytics</Title>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} md={8}>
                    <StyledCard>
                        <Statistic title="Messages (Last 30 Days)" value={totalMessages} suffix="msgs" />
                    </StyledCard>
                </Col>
                <Col xs={24} md={8}>
                    <StyledCard>
                        <Statistic title="New Members" value={totalJoins} styles={{ content: { color: '#3f8600' } }} />
                    </StyledCard>
                </Col>
                <Col xs={24} md={8}>
                    <StyledCard>
                        <Statistic title="Members Left" value={totalLeaves} styles={{ content: { color: '#cf1322' } }} />
                    </StyledCard>
                </Col>
            </Row>

            <StyledCard title="Activity Trends">
                <div style={{ width: '100%', height: 300 }}>
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#5865F2" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#5865F2" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorJoins" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3ba55c" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3ba55c" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#b9bbbe" />
                                <YAxis stroke="#b9bbbe" />
                                <CartesianGrid strokeDasharray="3 3" stroke="#40444b" />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="messagesSent" stroke="#5865F2" fillOpacity={1} fill="url(#colorMsgs)" name="Messages" />
                                <Area type="monotone" dataKey="membersJoined" stroke="#3ba55c" fillOpacity={1} fill="url(#colorJoins)" name="Joins" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <Empty description={<span style={{ color: '#b9bbbe' }}>No data collected yet</span>} />
                    )}
                </div>
            </StyledCard>
        </PageContainer>
    );
};

export default ServerAnalytics;
