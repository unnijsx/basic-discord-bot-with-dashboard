import React, { useEffect, useState } from 'react';
import { Card, Table, Typography, Tag, App, Tooltip, Space } from 'antd';
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const AuditLogs = () => {
    const { guildId } = useParams();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { message } = App.useApp();

    const fetchLogs = async () => {
        try {
            const { data } = await api.get(`/guilds/${guildId}/audit-logs`);
            setLogs(data);
        } catch (error) {
            message.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [guildId]);

    const renderDetails = React.useCallback((action, details) => {
        if (!details) return <Text type="secondary">No details</Text>;

        switch (action.toUpperCase()) {
            case 'MESSAGE_DELETE':
                return (
                    <Text>
                        Message sent by <Text strong>{details.executorName}</Text> deleted in <Text strong>#{details.channelName}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11 }}>Content: {details.content ? details.content.substring(0, 50) + (details.content.length > 50 ? '...' : '') : 'No content'}</Text>
                    </Text>
                );
            case 'MESSAGE_UPDATE':
                return (
                    <Text>
                        Message edited in <Text strong>#{details.channelName}</Text> <a href={details.url} target="_blank" rel="noopener noreferrer">[Jump]</a>
                    </Text>
                );
            case 'MEMBER_JOIN':
                return <Text>User joined the server</Text>;
            case 'MEMBER_LEAVE':
                return <Text>User left the server</Text>;
            case 'VOICE_STATE':
                return <Text dangerouslySetInnerHTML={{ __html: details }}></Text>;

            case 'UPDATE_SETTINGS':
                const changes = [];
                if (details.moderationConfig) changes.push('Moderation');
                if (details.levelingConfig) changes.push('Leveling');
                if (details.musicConfig) changes.push('Music');
                if (details.loggingConfig) changes.push('Logging');
                if (details.modules) changes.push('Modules Toggled');
                return <Text>Updated: {changes.join(', ') || 'Settings'}</Text>;

            case 'SEND_MESSAGE':
                return (
                    <Text>
                        Sent {details.hasEmbed ? 'Embed' : 'Message'} to <Text strong>#{details.channelName}</Text>
                    </Text>
                );
            case 'CREATE_CHANNEL':
                return <Text>Created channel <Text strong>#{details.name}</Text> ({details.type === 2 ? 'Voice' : 'Text'})</Text>;
            case 'DELETE_CHANNEL':
                return <Text>Deleted channel <Text strong>#{details.name}</Text></Text>;
            case 'RESTORE_BACKUP':
                return <Text>Restored server backup</Text>;
            default:
                return (
                    <Tooltip title={<pre style={{ maxHeight: 200, overflow: 'auto', fontSize: 11 }}>{JSON.stringify(details, null, 2)}</pre>}>
                        <Text code style={{ cursor: 'pointer' }}>View Raw Data</Text>
                    </Tooltip>
                );
        }
    }, []);

    const columns = React.useMemo(() => [
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (text) => {
                let color = 'blue';
                if (text.includes('DELETE')) color = 'red';
                if (text.includes('CREATE')) color = 'green';
                if (text.includes('UPDATE')) color = 'orange';
                return <Tag color={color}>{text.toUpperCase().replace(/_/g, ' ')}</Tag>;
            }
        },
        {
            title: 'Executor',
            dataIndex: 'executorName',
            key: 'executor',
            render: (text, record) => (
                <Space>
                    <UserOutlined />
                    <Text>{text}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>({record.executorId})</Text>
                </Space>
            )
        },
        {
            title: 'Details',
            dataIndex: 'changes', // Note: Backend saves as 'changes', logic used 'details' in switch
            key: 'details',
            render: (changes, record) => renderDetails(record.action, changes)
        },
        {
            title: 'Time',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text) => (
                <Tooltip title={dayjs(text).format('YYYY-MM-DD HH:mm:ss')}>
                    <Space>
                        <ClockCircleOutlined />
                        {dayjs(text).fromNow()}
                    </Space>
                </Tooltip>
            )
        }
    ], [renderDetails]);



    return (
        <Card title={<Title level={4} style={{ margin: 0 }}>Audit Logs</Title>} style={{ background: '#2f3136', borderRadius: 8 }}>
            <Table
                dataSource={logs}
                columns={columns}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                style={{ background: '#2f3136' }}
                scroll={{ x: 800 }}
            />
        </Card>
    );
};

export default AuditLogs;
