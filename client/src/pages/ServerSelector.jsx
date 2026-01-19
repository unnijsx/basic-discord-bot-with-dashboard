import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Spin, Avatar, Typography, Input, Empty, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { ThunderboltOutlined, SearchOutlined, RobotOutlined, SettingOutlined } from '@ant-design/icons';

import PremiumNavbar from '../components/Layout/PremiumNavbar';

const { Title, Text } = Typography;

const Container = styled.div`
    padding: 0;
    padding-top: 100px; /* Space for fixed navbar */
    background: #0a0a0a;
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
    position: relative;
    overflow: hidden;
`;

const ContentWrapper = styled.div`
    padding: 20px 50px;
    max-width: 1600px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
`;

/* Reuse Aurora Logic from Landing Page (optional, or just keep dark theme)
 * Let's add a subtle gradient instead of full aurora for performance on dashboard
 */
const BackgroundGlow = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% -20%, rgba(88, 101, 242, 0.15), transparent 50%);
    z-index: 0;
    pointer-events: none;
`;

const GuildCard = styled(Card)`
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
            <PremiumNavbar showLogout={true} />
            <BackgroundGlow />
            <ContentWrapper>
                <div style={{ textAlign: 'center', marginBottom: 60, position: 'relative' }}>
                    <Title level={1} style={{ color: '#fff', marginBottom: 12, fontSize: '2.5rem' }}>Select a Server</Title>
                    <Text style={{ color: '#b9bbbe', fontSize: '1.1rem' }}>Manage your existing servers or invite Rheox to a new one.</Text>

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
                                    bordered={false}
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
            </ContentWrapper>
        </Container>
    );
};

export default ServerSelector;
