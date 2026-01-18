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

    const columns = [
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (text) => <Tag color="blue">{text}</Tag>
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
            dataIndex: 'details',
            key: 'details',
            render: (details) => (
                <Tooltip title={<pre style={{ maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(details, null, 2)}</pre>}>
                    <Text code style={{ cursor: 'pointer' }}>View JSON</Text>
                </Tooltip>
            )
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
    ];



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
