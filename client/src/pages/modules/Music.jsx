import React, { useEffect, useState, useRef } from 'react';
import { Card, Typography, Button, Space, List, Avatar, Spin, message, Tag, Slider, Input, Row, Col, Alert, Tabs, Badge, Switch, Tooltip } from 'antd';
import {
    CustomerServiceOutlined,
    PauseCircleFilled,
    PlayCircleFilled,
    StepForwardFilled,
    StopFilled,
    SoundOutlined,
    PlusOutlined,
    SearchOutlined,
    UnorderedListOutlined,
    RetweetOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { useSocket } from '../../context/SocketContext';
import api from '../../api/axios';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { Search } = Input;

const MusicContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
`;

const PlayerCard = styled.div`
    background: #18191c;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    border: 1px solid #2f3136;
    margin-bottom: 32px;
    position: relative;
`;

const PlayerBackground = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${props => props.src ? `url(${props.src})` : 'linear-gradient(135deg, #5865F2, #18191c)'};
    background-size: cover;
    background-position: center;
    filter: blur(80px) brightness(0.3);
    z-index: 0;
`;

const PlayerContent = styled.div`
    padding: 40px;
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 32px;
`;

const TrackInfo = styled.div`
    display: flex;
    gap: 32px;
    align-items: center;
    
    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
    }
`;

const AlbumArt = styled.div`
    width: 200px;
    height: 200px;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    background-image: url(${props => props.src});
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.1);
`;

const ControlsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
`;

const ProgressBarContainer = styled.div`
    width: 100%;
    
    .ant-slider-track {
        background-color: #5865F2 !important;
        height: 8px !important;
    }
    .ant-slider-rail {
        background-color: rgba(255,255,255,0.1) !important;
        height: 8px !important;
    }
    .ant-slider-handle {
        width: 16px !important;
        height: 16px !important;
        margin-top: -4px !important;
        border: 2px solid #5865F2 !important;
        &::after {
            display: none !important;
        }
    }
`;

const ButtonsRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    @media (max-width: 576px) {
        flex-direction: column;
        gap: 20px;
    }
`;

const MainButtons = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;
`;

const VolumeParam = styled.div`
    width: 150px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(0,0,0,0.2);
    padding: 8px 16px;
    border-radius: 20px;
`;

const StyledSlider = styled(Slider)`
    margin: 6px 0 !important;
`;

const Music = () => {
    const { guildId } = useParams();
    const socket = useSocket();
    const [status, setStatus] = useState({
        connected: false,
        isPlaying: false,
        currentTrack: null,
        queue: [],
        volume: 100
    });
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [position, setPosition] = useState(0);
    const [dragging, setDragging] = useState(false);

    // --- LOGIC SAME AS BEFORE ---
    const fetchStatus = async () => {
        try {
            const { data } = await api.get(`/music/${guildId}/status`);
            if (data) {
                setStatus(prev => ({ ...prev, ...data }));
                if (!dragging) setPosition(data.currentTrack?.position || 0);
            }
        } catch (error) {
            console.error('Error fetching status:', error);
        }
    };

    useEffect(() => {
        fetchStatus();
        if (socket) {
            socket.emit('joinGuild', guildId);
            socket.on('playerUpdate', (data) => {
                if (data) {
                    if (data.isPlaying !== undefined) setStatus(prev => ({ ...prev, isPlaying: data.isPlaying }));
                    if (data.position !== undefined && !dragging) setPosition(data.position);
                    fetchStatus();
                }
            });
            socket.on('queueUpdate', () => fetchStatus());
            return () => {
                socket.off('playerUpdate');
                socket.off('queueUpdate');
            };
        }
    }, [guildId, socket]);

    useEffect(() => {
        let interval;
        if (status?.isPlaying && status?.currentTrack && !dragging) {
            interval = setInterval(() => {
                setPosition(prev => Math.min(prev + 1000, status.currentTrack.duration));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status?.isPlaying, status?.currentTrack, dragging]);

    const handleAction = async (action, payload = {}) => {
        try {
            await api.post(`/music/${guildId}/control`, { action, ...payload });
        } catch (error) {
            message.error('Action failed');
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
        setSearchResults([]);
        message.success('Added to queue');
    };

    const handleSeek = async (val) => {
        setPosition(val);
        setDragging(false);
        await handleAction('seek', { position: val });
    };

    const formatTime = (ms) => {
        if (!ms) return '0:00';
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0).padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const DEFAULT_COVER = 'https://i.scdn.co/image/ab67616d0000b273574c8df636eb08d538e14670';

    return (
        <MusicContainer>

            <PlayerCard>
                <PlayerBackground src={status.currentTrack?.thumbnail || DEFAULT_COVER} />
                <PlayerContent>

                    {/* TOP SECTION: ART + INFO */}
                    <TrackInfo>
                        <AlbumArt src={status.currentTrack?.thumbnail || DEFAULT_COVER} />
                        <div style={{ flex: 1 }}>
                            {status.currentTrack ? (
                                <>
                                    <Title level={2} style={{ color: '#fff', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                                        {status.currentTrack.title}
                                    </Title>
                                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, display: 'block', marginTop: 8 }}>
                                        {status.currentTrack.author}
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Title level={2} style={{ color: '#fff', margin: 0 }}>Nothing Playing</Title>
                                    <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Queue up some tunes below to get the party started.</Text>
                                </>
                            )}
                        </div>
                    </TrackInfo>

                    {/* CONTROLS */}
                    <ControlsContainer>
                        {/* 1. PROGRESS BAR (Full Width) */}
                        <ProgressBarContainer>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text style={{ color: '#ddd', fontSize: 12 }}>{formatTime(position)}</Text>
                                <Text style={{ color: '#ddd', fontSize: 12 }}>{status.currentTrack?.durationString || "0:00"}</Text>
                            </div>
                            <Slider
                                value={position}
                                max={status.currentTrack?.duration || 100}
                                onChange={(val) => { setDragging(true); setPosition(val); }}
                                onAfterChange={handleSeek}
                                tooltip={{ open: false }}
                                disabled={!status.currentTrack}
                            />
                        </ProgressBarContainer>

                        {/* 2. BUTTONS + VOLUME */}
                        <ButtonsRow>
                            <div style={{ width: 150, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>8D Effect</Text>
                                <Switch
                                    checked={!!status.filters?.rotation}
                                    onChange={(checked) => handleAction('8d', { enabled: checked })}
                                    style={{ background: status.filters?.rotation ? '#5865F2' : 'rgba(255,255,255,0.2)' }}
                                />
                            </div>

                            <MainButtons>
                                <MainButtons>
                                    <Tooltip title={status.loop ? "Disable Loop" : "Enable Loop"}>
                                        <Button
                                            type="text"
                                            shape="circle"
                                            icon={<RetweetOutlined style={{ fontSize: 24, color: status.loop ? '#5865F2' : '#fff' }} />}
                                            size="large"
                                            onClick={() => handleAction('toggleLoop')}
                                        />
                                    </Tooltip>

                                    {status.isPlaying ? (
                                        <Tooltip title="Pause">
                                            <Button
                                                type="primary"
                                                shape="circle"
                                                icon={<PauseCircleFilled style={{ fontSize: 32 }} />}
                                                size="large"
                                                style={{ width: 64, height: 64, background: '#fff', color: '#000', border: 'none' }}
                                                onClick={() => handleAction('pause')}
                                            />
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title="Play">
                                            <Button
                                                type="primary"
                                                shape="circle"
                                                icon={<PlayCircleFilled style={{ fontSize: 32 }} />}
                                                size="large"
                                                style={{ width: 64, height: 64, background: '#fff', color: '#000', border: 'none' }}
                                                onClick={() => handleAction('resume')}
                                            />
                                        </Tooltip>
                                    )}

                                    <Tooltip title="Skip Track">
                                        <Button
                                            type="text"
                                            shape="circle"
                                            icon={<StepForwardFilled style={{ fontSize: 24 }} />}
                                            size="large"
                                            style={{ color: '#fff' }}
                                            onClick={() => handleAction('skip')}
                                        />
                                    </Tooltip>
                                </MainButtons>
                            </MainButtons>

                            <VolumeParam>
                                <SoundOutlined style={{ color: '#fff' }} />
                                <StyledSlider
                                    style={{ width: 80 }}
                                    value={status.volume}
                                    max={100}
                                    onChange={(val) => handleAction('volume', { volume: val })}
                                    trackStyle={{ background: '#fff' }}
                                    handleStyle={{ borderColor: '#fff' }}
                                />
                            </VolumeParam>
                        </ButtonsRow>
                    </ControlsContainer>

                </PlayerContent>
            </PlayerCard>

            {/* TABS FOR SEARCH & QUEUE */}
            <Tabs
                defaultActiveKey="1"
                type="card"
                items={[
                    {
                        key: '1',
                        label: <span><SearchOutlined /> Search</span>,
                        children: (
                            <Card style={{ background: '#2f3136', border: '1px solid #202225' }} bordered={false}>
                                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                                    <Input
                                        size="large"
                                        prefix={<SearchOutlined />}
                                        placeholder="Search songs or paste URL..."
                                        onPressEnter={(e) => handleSearch(e.target.value)}
                                    />
                                </div>

                                <List
                                    loading={searching}
                                    grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                                    dataSource={searchResults}
                                    renderItem={item => (
                                        <List.Item>
                                            <Card
                                                hoverable
                                                cover={<img alt={item.title} src={item.thumbnail} style={{ height: 140, objectFit: 'cover' }} />}
                                                style={{ background: '#18191c', border: 'none', overflow: 'hidden' }}
                                                bodyStyle={{ padding: 12 }}
                                                actions={[
                                                    <Button type="primary" block icon={<PlusOutlined />} onClick={() => playTrack(item.url)}>Add</Button>
                                                ]}
                                            >
                                                <Card.Meta
                                                    title={<Text style={{ color: '#fff' }} ellipsis>{item.title}</Text>}
                                                    description={<Text type="secondary" ellipsis>{item.author}</Text>}
                                                />
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        )
                    },
                    {
                        key: '2',
                        label: <span><UnorderedListOutlined /> Queue ({status.queue.length})</span>,
                        children: (
                            <List
                                dataSource={status.queue}
                                renderItem={(item, index) => (
                                    <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #2f3136' }}>
                                        <List.Item.Meta
                                            avatar={
                                                <div style={{ position: 'relative' }}>
                                                    <Avatar shape="square" size={48} src={item.thumbnail} />
                                                    <div style={{ position: 'absolute', top: -5, left: -5, background: '#202225', color: '#fff', borderRadius: '50%', width: 20, height: 20, textAlign: 'center', fontSize: 10, lineHeight: '20px' }}>
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            }
                                            title={<Text style={{ color: '#fff' }}>{item.title}</Text>}
                                            description={<Text type="secondary">{item.author} • {item.durationString}</Text>}
                                        />
                                        <Text style={{ color: '#72767d' }}>{item.requester && `Added by @${item.requester.username}`}</Text>
                                    </List.Item>
                                )}
                            />
                        )
                    }
                ]}
            />
        </MusicContainer>
    );
};

export default Music;
