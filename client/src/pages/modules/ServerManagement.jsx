import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tabs, Modal, Form, Input, Select, message, Tag, Space, Popconfirm } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { useParams } from 'react-router-dom';

const { Option } = Select;

const ServerManagement = () => {
    const { guildId } = useParams();

    return (
        <Card variant="outlined" title="Server Management">
            <Tabs defaultActiveKey="1" items={[
                { key: '1', label: 'Channels', children: <ChannelsManager guildId={guildId} /> },
                { key: '2', label: 'Roles', children: <RolesManager guildId={guildId} /> }
            ]} />
        </Card>
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
