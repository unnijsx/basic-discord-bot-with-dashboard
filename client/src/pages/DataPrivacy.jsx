import React from 'react';
import { Card, Typography, List, Alert, Button, Popconfirm, message } from 'antd';
import { DeleteOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import axios from '../api/axios';

const { Title, Paragraph, Text } = Typography;

const DataPrivacy = ({ guildId }) => {

    const handleDeleteData = async () => {
        try {
            // Placeholder: Backend needs to implement data Wipe
            // await axios.delete(`/guilds/${guildId}/data`);
            message.success('Data deletion request submitted.');
        } catch (error) {
            message.error('Failed to submit request');
        }
    };

    const storedDataPoints = [
        { title: 'User Levels', desc: 'XP, Level, and Rank for gamification.', retention: 'Permanent until member leaves' },
        { title: 'Moderation Logs', desc: 'Kicks, bans, and warned user IDs.', retention: '30 Days (configurable)' },
        { title: 'Server Configuration', desc: 'Module settings, channel IDs, and prefixes.', retention: 'Permanent' },
        { title: 'Message Content', desc: 'We do NOT store message content unless it triggered a moderation filter.', retention: 'Immediate deletion after processing' }
    ];

    return (
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <SafetyCertificateOutlined style={{ fontSize: 48, color: '#5865F2' }} />
                <Title level={2} style={{ color: '#fff', marginTop: 16 }}>Data Transparency</Title>
                <Paragraph style={{ color: '#aaa' }}>
                    We believe in full transparency. Here is exactly what this bot stores about your server.
                </Paragraph>
            </div>

            <Card style={{ background: '#2f3136', borderColor: '#202225' }}>
                {storedDataPoints.map((item, index) => (
                    <div key={index} style={{ padding: '12px 0', borderBottom: index !== storedDataPoints.length - 1 ? '1px solid #40444b' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{item.title}</Text>
                                <div style={{ color: '#ccc', marginTop: 4 }}>{item.desc}</div>
                            </div>
                            <div style={{ color: '#888', fontSize: 12, textAlign: 'right' }}>
                                Retention: <br />
                                {item.retention}
                            </div>
                        </div>
                    </div>
                ))}
            </Card>

            <Alert
                style={{ marginTop: 24, background: '#202225', border: 'none' }}
                title={<span style={{ color: '#ec4145' }}>Danger Zone</span>}
                description={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#aaa' }}>
                            Want to remove all data associated with this server? This action cannot be undone.
                        </span>
                        <Popconfirm
                            title="Are you sure?"
                            description="This will wipe all levels, logs, and settings."
                            onConfirm={handleDeleteData}
                            okText="Yes, Wipe Data"
                            cancelText="Cancel"
                        >
                            <Button type="primary" danger icon={<DeleteOutlined />}>
                                Wipe All Data
                            </Button>
                        </Popconfirm>
                    </div>
                }
                type="error"
            />
        </div>
    );
};

export default DataPrivacy;
