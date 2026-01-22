import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tabs, Modal, Form, Input, Select, message, Tag, Space, Popconfirm, Upload, Typography, Alert } from 'antd';
import { DeleteOutlined, PlusOutlined, UploadOutlined, DownloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { useParams } from 'react-router-dom';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const ServerManagement = () => {
    const { guildId } = useParams();

    return (
        <Card variant="outlined" title="Server Management" style={{ background: '#2f3136', borderColor: '#202225', color: '#fff' }}>
            <Tabs defaultActiveKey="1" items={[
                { key: '1', label: 'Channels', children: <ChannelsManager guildId={guildId} /> },
                { key: '2', label: 'Roles', children: <RolesManager guildId={guildId} /> },
                { key: '3', label: 'Backups', children: <BackupsManager guildId={guildId} /> }
            ]} />
        </Card>
    );
};

const BackupsManager = ({ guildId }) => {
    // --- Cloud Backup State ---
    const [backupCode, setBackupCode] = React.useState('');
    const [restoreCode, setRestoreCode] = React.useState('');
    const [generating, setGenerating] = React.useState(false);
    const [restoring, setRestoring] = React.useState(false);

    const handleGenerateCloudBackup = async () => {
        setGenerating(true);
        try {
            const { data } = await api.post(`/guilds/${guildId}/backups/generate`);
            setBackupCode(data.code);
            message.success('Cloud Backup created!');
            Modal.success({
                title: 'Backup Code Generated',
                content: (
                    <div>
                        <Paragraph>Save this code to restore your settings later:</Paragraph>
                        <Title level={2} copyable style={{ textAlign: 'center', margin: '20px 0', color: '#5865F2' }}>{data.code}</Title>
                        <Paragraph type="secondary">This code will expire in 7 days.</Paragraph>
                    </div>
                ),
            });
        } catch (error) {
            message.error('Failed to generate backup');
        } finally {
            setGenerating(false);
        }
    };

    const handleRestoreCloudBackup = async () => {
        if (!restoreCode || restoreCode.length < 10) return message.error('Invalid code');
        setRestoring(true);
        try {
            await api.post(`/guilds/${guildId}/backups/restore`, { code: restoreCode });
            message.success('Settings restored from Cloud Backup!');
            setRestoreCode('');
        } catch (error) {
            message.error('Restore failed: ' + (error.response?.data?.message || 'Invalid Code'));
        } finally {
            setRestoring(false);
        }
    };

    const handleExport = () => {
        const url = `/api/guilds/${guildId}/backup`;
        window.open(url, '_blank');
        message.success('Download started');
    };

    const handleImport = (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target.result);
                if (!json.data || !json.data.guildId) {
                    message.error('Invalid backup file format');
                    return;
                }

                await api.post(`/guilds/${guildId}/backup`, { data: json.data });
                message.success('Server settings restored successfully!');
            } catch (err) {
                console.error(err);
                message.error('Failed to restore backup: ' + (err.response?.data?.message || err.message));
            }
        };
        reader.readAsText(file);
        return false;
    };

    return (
        <div style={{ padding: 24, textAlign: 'center' }}>
            <Title level={4} style={{ color: '#fff' }}>Server Backup & Restore</Title>
            <Paragraph style={{ color: '#aaa', maxWidth: 600, margin: '0 auto 24px' }}>
                Manage your server configuration backups. You can use local JSON files or our Cloud Backup system.
            </Paragraph>

            <Space size="large" align="start" wrap style={{ justifyContent: 'center' }}>
                {/* Local JSON Export */}
                <Card style={{ width: 300, background: '#202225', borderColor: '#2f3136' }}>
                    <DownloadOutlined style={{ fontSize: 48, color: '#5865F2', marginBottom: 16 }} />
                    <Title level={5} style={{ color: '#fff' }}>Local JSON Export</Title>
                    <div style={{ marginBottom: 16, color: '#aaa', fontSize: 13 }}>Download config to your computer.</div>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport} block>
                            Download JSON
                        </Button>
                        <Upload beforeUpload={handleImport} showUploadList={false} accept=".json">
                            <Button icon={<UploadOutlined />} block>Upload JSON</Button>
                        </Upload>
                    </Space>
                </Card>

                {/* Cloud Backup */}
                <Card style={{ width: 300, background: '#2f3136', borderColor: '#5865F2', borderWidth: 2 }}>
                    <SafetyCertificateOutlined style={{ fontSize: 48, color: '#faa61a', marginBottom: 16 }} />
                    <Title level={5} style={{ color: '#fff' }}>Cloud Backup</Title>
                    <div style={{ marginBottom: 16, color: '#aaa', fontSize: 13 }}>Generate a 10-digit code to instant restore.</div>

                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Button type="primary" style={{ background: '#faa61a', borderColor: '#faa61a' }} loading={generating} onClick={handleGenerateCloudBackup} block>
                            Generate Code
                        </Button>

                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <Input
                                placeholder="Enter Code"
                                value={restoreCode}
                                onChange={e => setRestoreCode(e.target.value)}
                                style={{ textAlign: 'center' }}
                            />
                            <Popconfirm title="Overwrite current settings?" onConfirm={handleRestoreCloudBackup}>
                                <Button loading={restoring} icon={<UploadOutlined />} />
                            </Popconfirm>
                        </div>
                    </Space>
                </Card>
            </Space>
        </div>
    );
};

const ChannelsManager = ({ guildId }) => {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const fetchChannels = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/guilds/${guildId}/channels`);
            setChannels(data);
        } catch (error) {
            message.error('Failed to load channels');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchChannels(); }, [guildId]);

    const handleCreate = async (values) => {
        try {
            await api.post(`/guilds/${guildId}/channels`, values);
            message.success('Channel created');
            setIsModalOpen(false);
            fetchChannels();
        } catch (error) {
            message.error('Failed to create channel');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/guilds/${guildId}/channels/${id}`);
            message.success('Channel deleted');
            fetchChannels();
        } catch (error) {
            message.error('Failed to delete channel');
        }
    };

    const columns = [
        { title: 'Name', dataIndex: 'name', render: (text) => `# ${text}` },
        { title: 'ID', dataIndex: 'id' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Popconfirm title="Delete channel?" onConfirm={() => handleDelete(record.id)}>
                    <Button danger icon={<DeleteOutlined />} shape="circle" />
                </Popconfirm>
            )
        }
    ];

    return (
        <div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} style={{ marginBottom: 16 }}>
                Create Channel
            </Button>
            <Table dataSource={channels} columns={columns} rowKey="id" loading={loading} />

            <Modal title="Create Channel" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()}>
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="name" label="Channel Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="type" label="Type" initialValue={0}>
                        <Select>
                            <Option value={0}>Text</Option>
                            <Option value={2}>Voice</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

const RolesManager = ({ guildId }) => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/guilds/${guildId}/roles`);
            setRoles(data);
        } catch (error) {
            message.error('Failed to load roles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRoles(); }, [guildId]);

    const columns = [
        { title: 'Name', dataIndex: 'name', render: (text, record) => <Tag color={record.color === '#000000' ? 'default' : record.color}>{text}</Tag> },
        { title: 'Position', dataIndex: 'position' },
        { title: 'ID', dataIndex: 'id' }
    ];

    return <Table dataSource={roles} columns={columns} rowKey="id" loading={loading} />;
};

export default ServerManagement;
