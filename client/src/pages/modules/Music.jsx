import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Space, List, Avatar, Spin, message, Tag, Slider, Input, Row, Col, Alert } from 'antd';
import {
    CustomerServiceOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined,
    StepForwardOutlined,
    StopOutlined,
    SoundOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { useSocket } from '../../context/SocketContext';
import api from '../../api/axios';
import { useParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { Search } = Input;

const Music = () => {
    const { guildId } = useParams();
    const socket = useSocket();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const fetchStatus = async () => {
        try {
            const { data } = await api.get(`/music/${guildId}/status`);
            setStatus(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();

        if (socket) {
            socket.emit('joinGuild', guildId);

            socket.on('playerUpdate', (data) => {
                // If just status update, refresh full status or patch it. 
                // For simplicity, let's re-fetch or patch locally if payload has enough info.
                // Re-fetching is safer to stay in sync.
                fetchStatus();
            });

            socket.on('queueUpdate', () => {
                fetchStatus();
            });

            return () => {
                socket.off('playerUpdate');
                socket.off('queueUpdate');
            };
        }
    }, [guildId, socket]);

    const handleAction = async (action, payload = {}) => {
        try {
            await api.post(`/music/${guildId}/control`, { action, ...payload });
            message.success(`Command sent: ${action}`);
            // Socket will handle the update
        } catch (error) {
            message.error(error.response?.data?.message || 'Action failed');
        }
    };

    const handleSearch = async (value) => {
        if (!value) return;
        setSearching(true);
        try {
            const { data } = await api.get(`/music/${guildId}/search?query=${encodeURIComponent(value)}`);
            setSearchResults(data);
        } catch (error) {
            message.error('Search failed');
        } finally {
            setSearching(false);
        }
    };

    const playTrack = async (url) => {
        await handleAction('play', { query: url });
        setSearchResults([]); // Clear search after playing
    };

    if (loading) return <Spin size="large" />;

    // If bot isn't connected to a voice channel, don't show controls
    if (!status?.connected) {
        return (
            <Card variant="outlined" style={{ textAlign: 'center', padding: '50px' }}>
                <CustomerServiceOutlined style={{ fontSize: '64px', color: '#555', marginBottom: '20px' }} />
                <Title level={3}>Bot Not Connected</Title>
                <Text type="secondary">
                    Join a voice channel in Discord and use <code>/play</code> to start the music session.
                </Text>
            </Card>
        );
    }

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Now Playing & Controls */}
            <Card variant="outlined">
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                        <Avatar
                            shape="square"
                            size={180}
                            src={status.currentTrack?.thumbnail}
                            icon={<CustomerServiceOutlined />}
                        />
                    </Col>
                    <Col xs={24} md={16}>
                        {status.currentTrack ? (
                            <>
                                <Title level={3} style={{ margin: 0 }}>{status.currentTrack.title}</Title>
                                <Text type="secondary" style={{ fontSize: '16px' }}>{status.currentTrack.author}</Text>
                                <div style={{ marginTop: 15 }}>
                                    <Tag color="blue">{status.currentTrack.duration}</Tag>
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: '20px 0' }}>
                                <Title level={4}>No music playing</Title>
                                <Text>Queue some songs below!</Text>
                            </div>
                        )}

                        <Space size="middle" style={{ marginTop: 30, width: '100%' }}>
                            {status.isPlaying ? (
                                <Button type="primary" shape="circle" icon={<PauseCircleOutlined />} size="large" onClick={() => handleAction('pause')} />
                            ) : (
                                <Button type="primary" shape="circle" icon={<PlayCircleOutlined />} size="large" onClick={() => handleAction('resume')} />
                            )}
                            <Button shape="circle" icon={<StepForwardOutlined />} size="large" onClick={() => handleAction('skip')} />
                            <Button danger shape="circle" icon={<StopOutlined />} size="large" onClick={() => handleAction('stop')} />

                            <div style={{ width: 150, marginLeft: 20 }}>
                                <SoundOutlined /> Volume
                                <Slider
                                    defaultValue={status.volume}
                                    max={100}
                                    onChange={(val) => handleAction('volume', { volume: val })}
                                    tooltip={{ formatter: (value) => `${value}%` }}
                                />
                            </div>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Search Section */}
            <Card title="Add to Queue" variant="outlined">
                <Search
                    placeholder="Search for a song or paste a URL..."
                    enterButton="Search"
                    size="large"
                    onSearch={handleSearch}
                    loading={searching}
                />

                {searchResults.length > 0 && (
                    <List
                        style={{ marginTop: 20 }}
                        itemLayout="horizontal"
                        dataSource={searchResults}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    <Button type="primary" icon={<PlusOutlined />} onClick={() => playTrack(item.url)}>
                                        Play
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar src={item.thumbnail} />}
                                    title={item.title}
                                    description={`${item.author} • ${item.duration}`}
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Card>

            {/* Queue List */}
            {status.queue && status.queue.length > 0 && (
                <Card title={`Up Next (${status.queue.length} songs)`} variant="outlined">
                    <List
                        itemLayout="horizontal"
                        dataSource={status.queue}
                        pagination={{ pageSize: 5 }}
                        renderItem={(item, index) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={
                                        item.thumbnail ?
                                            <Avatar src={item.thumbnail} shape="square" size="large" /> :
                                            <Avatar style={{ backgroundColor: '#5865F2' }}>{index + 1}</Avatar>
                                    }
                                    title={<a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{item.title}</a>}
                                    description={
                                        <span>
                                            <Tag>{item.duration}</Tag> {item.author}
                                        </span>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            )}
        </Space>
    );
};

export default Music;
