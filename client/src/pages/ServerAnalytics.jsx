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
                <div style={{ background: '#18191c', padding: '12px', border: '1px solid #2f3136', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                    <p style={{ color: '#fff', fontWeight: 'bold', marginBottom: 5 }}>{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color, margin: 0 }}>
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
            <Title level={2} style={{ color: '#fff', marginBottom: 24 }}>Growth & Activity</Title>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} md={8}>
                    <Card bordered={false} style={{ background: 'linear-gradient(135deg, #2f3136 0%, #202225 100%)', borderRadius: 12 }}>
                        <Statistic title={<span style={{ color: '#aaa' }}>Message Volume</span>} value={totalMessages} valueStyle={{ color: '#fff' }} suffix="msgs" />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card bordered={false} style={{ background: 'linear-gradient(135deg, #2f3136 0%, #202225 100%)', borderRadius: 12 }}>
                        <Statistic title={<span style={{ color: '#aaa' }}>New Members</span>} value={totalJoins} valueStyle={{ color: '#4caf50' }} prefix="+" />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card bordered={false} style={{ background: 'linear-gradient(135deg, #2f3136 0%, #202225 100%)', borderRadius: 12 }}>
                        <Statistic title={<span style={{ color: '#aaa' }}>Departures</span>} value={totalLeaves} valueStyle={{ color: '#f04747' }} prefix="-" />
                    </Card>
                </Col>
            </Row>

            <StyledCard title={<span style={{ color: '#fff' }}>Activity Trends (30 Days)</span>}>
                <div style={{ width: '100%', height: 350 }}>
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                                <XAxis dataKey="date" stroke="#72767d" tick={{ fill: '#72767d' }} />
                                <YAxis stroke="#72767d" tick={{ fill: '#72767d' }} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#2f3136" vertical={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="messagesSent" stroke="#5865F2" strokeWidth={3} fillOpacity={1} fill="url(#colorMsgs)" name="Messages" />
                                <Area type="monotone" dataKey="membersJoined" stroke="#3ba55c" strokeWidth={3} fillOpacity={1} fill="url(#colorJoins)" name="Joins" />
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
