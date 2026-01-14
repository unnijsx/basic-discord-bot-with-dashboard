import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Spin, Avatar, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styled from 'styled-components';

const { Title } = Typography;

const Container = styled.div`
    padding: 50px;
    background: #23272a;
    min-height: 100vh;
`;

const GuildCard = styled(Card).attrs({ variant: "borderless" })`
    background: #2c2f33;
    text-align: center;
    border-radius: 10px;
    transition: transform 0.2s;
    &:hover {
        transform: translateY(-5px);
        background: #2c2f33;
    }
    .ant-card-meta-title {
        color: #fff;
    }
`;

const ServerSelector = () => {
    const [guilds, setGuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGuilds = async () => {
            try {
                const { data } = await api.get('/auth/guilds');
                setGuilds(data);
            } catch (error) {
                console.error('Failed to fetch guilds', error);
            } finally {
                setLoading(false);
            }
        };
        fetchGuilds();
    }, []);

    const handleSelect = (guildId) => {
        navigate(`/dashboard/${guildId}`);
    };

    if (loading) return <Container><Spin size="large" /></Container>;

    return (
        <Container>
            <Title level={2} style={{ color: '#fff', textAlign: 'center', marginBottom: '40px' }}>Select a Server</Title>
            <Row gutter={[24, 24]}>
                {guilds.map(guild => (
                    <Col xs={24} sm={12} md={8} lg={6} key={guild.id}>
                        <GuildCard
                            hoverable
                            cover={
                                <Avatar
                                    size={100}
                                    src={guild.icon
                                        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                                        : 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                    style={{ margin: '20px auto' }}
                                />
                            }
                        >
                            <Card.Meta title={guild.name} className="server-name" />
                            <Button
                                type="primary"
                                style={{ marginTop: '15px', width: '100%' }}
                                onClick={() => handleSelect(guild.id)}
                            >
                                Manage
                            </Button>
                        </GuildCard>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default ServerSelector;
