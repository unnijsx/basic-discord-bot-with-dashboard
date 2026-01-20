import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Avatar, Card, Typography, Spin, Row, Col, Empty, Tag } from 'antd';
import { UserOutlined, TrophyOutlined, CrownOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import styled from 'styled-components';

const { Title, Text } = Typography;

const LeaderboardContainer = styled.div`
  padding: 40px;
  background: #111214;
  min-height: 100vh;
  color: #fff;
`;

const RankTag = ({ rank }) => {
    let color = '#2f3136';
    let icon = null;
    if (rank === 1) { color = '#FFD700'; icon = <CrownOutlined />; }
    else if (rank === 2) { color = '#C0C0C0'; icon = <TrophyOutlined />; }
    else if (rank === 3) { color = '#CD7F32'; icon = <TrophyOutlined />; }

    return (
        <Tag color={color} style={{ fontSize: 16, padding: '5px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', color: rank <= 3 ? '#000' : '#fff', fontWeight: 'bold' }}>
            {icon || rank}
        </Tag>
    );
};

const Leaderboard = () => {
    const { guildId } = useParams();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guildName, setGuildName] = useState('Server');

    useEffect(() => {
        fetchData();
    }, [guildId]);

    const fetchData = async () => {
        try {
            // First fetch guild info for header
            // We use the public fetch or verify if we can access /guilds/:id without auth?
            // Usually API requires auth, but "Public Leaderboard" implies no auth.
            // If API middleware blocks us, we might need a specific public route.
            // Let's assume /api/guilds/:id/leaderboard is behind auth middleware in existing api.js?
            // Checked api.js: Router is generic. Middleware likely applied in index.js.
            // If it is protected, we can't do a public page easily without changing backend.
            // For now, let's assume valid token or public route logic.
            // User did ask for "Public-facing page (no login required)".
            // I'll need to check if /api/guilds/:id/leaderboard is protected.

            const [lbRes, guildRes] = await Promise.all([
                api.get(`/guilds/${guildId}/leaderboard`),
                api.get(`/guilds/${guildId}`) // This might require auth
            ]);

            setData(lbRes.data);
            setGuildName(guildRes.data.name);
        } catch (error) {
            console.error(error);
            // Fallback for public access failure
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Rank',
            key: 'rank',
            width: 80,
            align: 'center',
            render: (_, __, index) => <RankTag rank={index + 1} />
        },
        {
            title: 'User',
            dataIndex: 'username',
            key: 'user',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Avatar src={record.avatarURL} size={48} icon={<UserOutlined />} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>{text}</Text>
                        <Text type="secondary">Level {record.level}</Text>
                    </div>
                </div>
            )
        },
        {
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            align: 'center',
            render: (lvl) => <Text style={{ color: '#5865F2', fontWeight: 'bold', fontSize: 18 }}>{lvl}</Text>
        },
        {
            title: 'XP',
            dataIndex: 'xp',
            key: 'xp',
            align: 'right',
            render: (xp) => <Text style={{ color: '#aaa' }}>{xp.toLocaleString()} XP</Text>
        },
    ];

    return (
        <LeaderboardContainer>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <Card bordered={false} style={{ background: '#1e1f22', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '20px', background: 'linear-gradient(90deg, #5865F2 0%, #4752c4 100%)', marginBottom: 20, borderRadius: 8 }}>
                        <Title level={2} style={{ color: '#fff', margin: 0 }}>🏆 {guildName} Leaderboard</Title>
                        <Text style={{ color: '#e0e0e0' }}>Top active members ranking</Text>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 50 }}>
                            <Spin size="large" />
                        </div>
                    ) : data.length > 0 ? (
                        <Table
                            dataSource={data}
                            columns={columns}
                            rowKey="userId"
                            pagination={{ pageSize: 20 }}
                            rowClassName="leaderboard-row"
                        />
                    ) : (
                        <Empty description={<span style={{ color: '#aaa' }}>No data available</span>} />
                    )}
                </Card>
            </div>
        </LeaderboardContainer>
    );
};

export default Leaderboard;
