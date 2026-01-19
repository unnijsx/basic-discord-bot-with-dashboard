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

    const [position, setPosition] = useState(0);
    const [dragging, setDragging] = useState(false);

    const fetchStatus = async () => {
        try {
            const { data } = await api.get(`/music/${guildId}/status`);
            if (data) {
                setStatus(data);
                if (!dragging) setPosition(data.currentTrack?.position || 0);
            }
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
                // Determine if we should refresh full status or just patch
                if (data && data.isPlaying !== undefined) {
                    setStatus(prev => (prev ? { ...prev, isPlaying: data.isPlaying } : prev));
                }
                if (data && data.position !== undefined && !dragging) {
                    setPosition(data.position);
                }
                fetchStatus(); // Sync full state occasionally
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

    // Local timer for smooth progress
    useEffect(() => {
        let interval;
        if (status?.isPlaying && status?.currentTrack && !dragging) {
            interval = setInterval(() => {
                setPosition(prev => Math.min(prev + 1000, status.currentTrack.duration));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status?.isPlaying, status?.currentTrack, dragging]);

    const handleSeek = async (val) => {
        setPosition(val);
        setDragging(false);
        await handleAction('seek', { position: val });
    };

    // Helper to format time
    const formatTime = (ms) => {
        if (!ms) return '0:00';
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0).padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

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
                            {/* Progress Bar */}
                            {status.currentTrack && status.currentTrack.duration > 0 && (
                                <div style={{ width: '100%', marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text type="secondary">{formatTime(position)}</Text>
                                        <Text type="secondary">{status.currentTrack.durationString}</Text>
                                    </div>
                                    <Slider
                                        value={position}
                                        max={status.currentTrack.duration}
                                        onChange={(val) => { setDragging(true); setPosition(val); }}
                                        onAfterChange={handleSeek}
                                        tooltip={{ formatter: formatTime }}
                                    />
                                </div>
                            )}

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
