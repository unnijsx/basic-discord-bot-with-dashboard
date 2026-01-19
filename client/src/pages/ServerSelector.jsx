import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Spin, Avatar, Typography, Input, Empty, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { ThunderboltOutlined, SearchOutlined, RobotOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Container = styled.div`
    padding: 40px;
    background: #121212;
    min-height: 100vh;
`;

const GuildCard = styled(Card).attrs({ variant: "borderless" })`
    background: #1e1f22;
    text-align: center;
    border-radius: 12px;
    transition: all 0.3s ease;
    border: 1px solid rgba(255,255,255,0.05);
    height: 100%;
    
    &:hover {
        transform: translateY(-5px);
        background: #232428;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        border-color: #5865F2;
    }

    .ant-card-cover {
        margin-top: 20px;
    }

    .server-name {
        margin: 15px 0;
        font-weight: 600;
        font-size: 1.1rem;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

const SearchBar = styled(Input)`
    margin-bottom: 40px;
    background: #1e1f22 !important;
    border: 1px solid #2b2d31 !important;
    color: #fff !important;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 16px;
    max-width: 500px;
    
    input {
        background: transparent !important;
        color: #fff !important;
    }
`;

const ServerSelector = () => {
    const { user } = useAuth();
    const [guilds, setGuilds] = useState([]);
    const [filteredGuilds, setFilteredGuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Use environment variable or constant for Client ID if available, else hardcode or fetch
    const INVITE_URL = `https://discord.com/api/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID || 'YOUR_CLIENT_ID_HERE'}&permissions=8&scope=bot%20applications.commands`;

    useEffect(() => {
        const fetchGuilds = async () => {
            try {
                const { data } = await api.get('/auth/guilds');
                setGuilds(data);
                setFilteredGuilds(data);
            } catch (error) {
                console.error('Failed to fetch guilds', error);
            } finally {
                setLoading(false);
            }
        };
        fetchGuilds();
    }, []);

    useEffect(() => {
        const filtered = guilds.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
        setFilteredGuilds(filtered);
    }, [searchTerm, guilds]);

    const handleSelect = (guild) => {
        if (guild.botInGuild) {
            navigate(`/dashboard/${guild.id}`);
        } else {
            // Open Invite in new tab
            window.open(`${INVITE_URL}&guild_id=${guild.id}`, '_blank');
        }
    };

    if (loading) return <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></Container>;

    return (
        <Container>
            <div style={{ textAlign: 'center', marginBottom: 40, position: 'relative' }}>
                <Title level={2} style={{ color: '#fff', marginBottom: 10 }}>Select a Server</Title>
                <Text style={{ color: '#b9bbbe' }}>Manage your existing servers or invite Rheox to a new one.</Text>

                <div style={{ marginTop: 30 }}>
                    <SearchBar
                        placeholder="Search servers..."
                        prefix={<SearchOutlined style={{ color: '#b9bbbe' }} />}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {user?.isSuperAdmin && (
                    <Button
                        type="primary"
                        danger
                        icon={<ThunderboltOutlined />}
                        style={{ position: 'absolute', right: 20, top: 0 }}
                        onClick={() => navigate('/super-admin')}
                    >
                        Admin
                    </Button>
                )}
            </div>

            {filteredGuilds.length > 0 ? (
                <Row gutter={[24, 24]}>
                    {filteredGuilds.map(guild => (
                        <Col xs={24} sm={12} md={8} lg={6} xl={4} key={guild.id}>
                            <GuildCard
                                hoverable
                                cover={
                                    <Badge count={!guild.botInGuild ? "Invite" : 0} offset={[-20, 20]} color="#faa61a">
                                        <Avatar
                                            size={80}
                                            src={guild.icon
                                                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                                                : 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                            style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
                                        />
                                    </Badge>
                                }
                            >
                                <div className="server-name">{guild.name}</div>
                                <Button
                                    type={guild.botInGuild ? "primary" : "default"}
                                    block
                                    icon={guild.botInGuild ? <SettingOutlined /> : <RobotOutlined />}
                                    onClick={() => handleSelect(guild)}
                                    style={!guild.botInGuild ? {
                                        borderColor: '#5865F2',
                                        color: '#5865F2',
                                        background: 'transparent'
                                    } : {}}
                                >
                                    {guild.botInGuild ? 'Manage' : 'Invite Bot'}
                                </Button>
                            </GuildCard>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty description={<span style={{ color: '#b9bbbe' }}>No servers found</span>} style={{ marginTop: 50 }} />
            )}
        </Container>
    );
};

export default ServerSelector;
