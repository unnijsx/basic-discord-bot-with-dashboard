import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Modal, Avatar, Typography, Space, App, Drawer } from 'antd';
import { EyeOutlined, UserOutlined, ClockCircleOutlined, MessageOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const { Title, Text } = Typography;

const MessageContainer = styled.div`
  display: flex;
  margin-bottom: 5px; // Reduced margin for grouped feel
  padding: 4px 0;
  &:hover {
    background: #32353b;
  }
`;

const MessageContent = styled.div`
  margin-left: 10px;
  flex: 1;
`;

const DiscordTimestamp = styled.span`
  font-size: 0.75rem;
  color: #72767d;
  margin-left: 8px;
`;

const TicketHistory = () => {
    const { guildId } = useParams();
    const { message } = App.useApp();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);

    // Viewer State
    const [viewTicket, setViewTicket] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [msgLoading, setMsgLoading] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, [guildId]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/tickets/${guildId}/history`);
            setTickets(res.data);
        } catch (error) {
            console.error(error);
            message.error('Failed to fetch ticket history');
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (ticket) => {
        setViewTicket(ticket);
        setViewOpen(true);
        setMsgLoading(true);
        try {
            const res = await api.get(`/tickets/${guildId}/transcript/${ticket._id}`);
            setMessages(res.data.messages || []);
        } catch (error) {
            message.error('Failed to load transcript');
            setMessages([]);
        } finally {
            setMsgLoading(false);
        }
    };

    const columns = [
        {
            title: 'Ticket ID',
            dataIndex: '_id',
            key: '_id',
            render: (id) => <Text code>{id.slice(-6)}</Text>
        },
        {
            title: 'Opened By',
            dataIndex: 'userId',
            key: 'userId',
            render: (id) => <Tag icon={<UserOutlined />}>{id}</Tag> // Ideally resolve name
        },
        {
            title: 'Closed By',
            dataIndex: 'closedBy',
            key: 'closedBy',
            render: (id) => <Tag color="red">{id}</Tag>
        },
        {
            title: 'Closed At',
            dataIndex: 'closedAt',
            key: 'closedAt',
            render: (date) => new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString()
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={status === 'closed' ? 'grey' : 'green'}>{status.toUpperCase()}</Tag>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button type="primary" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>View Log</Button>
            )
        }
    ];

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2} style={{ color: '#fff', marginBottom: 24 }}>Ticket History (Web Transcripts)</Title>

            <Card style={{ background: '#2f3136', border: '1px solid #202225' }} bodyStyle={{ padding: 0 }}>
                <Table
                    dataSource={tickets}
                    columns={columns}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    style={{ background: 'transparent' }}
                />
            </Card>

            <Drawer
                title={
                    <Space>
                        <MessageOutlined />
                        Transcript: {viewTicket?._id}
                    </Space>
                }
                placement="right"
                width={600}
                onClose={() => setViewOpen(false)}
                open={viewOpen}
                bodyStyle={{ background: '#36393f', padding: 0 }}
                headerStyle={{ background: '#2f3136', borderBottom: '1px solid #202225', color: '#fff' }}
            >
                {msgLoading ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#fff' }}>Loading messages...</div>
                ) : (
                    <div style={{ padding: '16px 0', overflowY: 'auto', height: '100%' }}>
                        {messages.length === 0 ? (
                            <div style={{ padding: 20, textAlign: 'center', color: '#72767d' }}>No messages recorded.</div>
                        ) : (
                            messages.map((msg, index) => (
                                <MessageContainer key={index}>
                                    <div style={{ paddingLeft: 16, paddingTop: 4 }}>
                                        <Avatar src={msg.authorAvatar} size="large" icon={<UserOutlined />} />
                                    </div>
                                    <MessageContent>
                                        <div style={{ display: 'flex', alignItems: 'baseline' }}>
                                            <Text strong style={{ color: '#fff', marginRight: 8 }}>{msg.authorName}</Text>
                                            <DiscordTimestamp>{new Date(msg.timestamp).toLocaleString()}</DiscordTimestamp>
                                        </div>
                                        <Text style={{ color: '#dcddde', whiteSpace: 'pre-wrap' }}>{msg.content}</Text>
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div style={{ marginTop: 8 }}>
                                                {msg.attachments.map((url, i) => (
                                                    <a href={url} target="_blank" rel="noopener noreferrer" key={i} style={{ display: 'block', color: '#00b0f4' }}>
                                                        [Attachment {i + 1}]
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </MessageContent>
                                </MessageContainer>
                            ))
                        )}
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default TicketHistory;
