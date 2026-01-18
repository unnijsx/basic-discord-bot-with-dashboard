import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Typography, Tag, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import axios from '../../api/axios';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { Option } = Select;

const PageContainer = styled.div`
    padding: 24px;
`;

const ScheduledMessages = () => {
    const { guildId } = useParams();
    const [messages, setMessages] = useState([]);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [createForm] = Form.useForm();

    const fetchData = async () => {
        try {
            const [msgsRes, channelsRes] = await Promise.all([
                axios.get(`/modules/${guildId}/scheduled-messages`),
                axios.get(`/guilds/${guildId}/channels`)
            ]);
            setMessages(msgsRes.data);
            setChannels(channelsRes.data);
        } catch (error) {
            message.error('Failed to load schedules');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [guildId]);

    const handleCreate = async (values) => {
        try {
            await axios.post(`/modules/${guildId}/scheduled-messages`, values);
            message.success('Schedule created & active!');
            setIsModalVisible(false);
            createForm.resetFields();
            fetchData();
        } catch (error) {
            message.error('Failed to create schedule');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/modules/${guildId}/scheduled-messages/${id}`);
            message.success('Schedule stopped & deleted');
            fetchData();
        } catch (error) {
            message.error('Failed to delete schedule');
        }
    };

    const columns = [
        { title: 'Channel', dataIndex: 'channelId', key: 'channel', render: id => channels.find(c => c.id === id)?.name || id },
        { title: 'Cron', dataIndex: 'cronExpression', key: 'cron', render: text => <Tag color="blue">{text}</Tag> },
        { title: 'Content', dataIndex: 'content', key: 'content', ellipsis: true },
        {
            title: 'Actions',
            key: 'action',
            render: (_, record) => (
                <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)}>Stop</Button>
            ),
        },
    ];

    return (
        <PageContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Title level={2} style={{ color: '#fff', margin: 0 }}>Scheduled Messages</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    New Schedule
                </Button>
            </div>

            <Table
                dataSource={messages}
                columns={columns}
                rowKey="_id"
                loading={loading}
                pagination={false}
                scroll={{ x: 600 }}
                style={{ background: '#2f3136', borderRadius: 8 }}
            />

            <Modal
                title="Create Scheduled Message"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => createForm.submit()}
            >
                <Form form={createForm} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="channelId" label="Channel" rules={[{ required: true }]}>
                        <Select placeholder="Select a channel">
                            {channels.map(c => <Option key={c.id} value={c.id}>#{c.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="cronExpression" label="Cron Expression" rules={[{ required: true }]} help={<a href="https://crontab.guru/" target="_blank" rel="noreferrer">Help me writing cron</a>}>
                        <Input placeholder="* * * * *" />
                    </Form.Item>
                    <Form.Item name="timezone" label="Timezone" initialValue="UTC">
                        <Input placeholder="UTC" />
                    </Form.Item>
                    <Form.Item name="content" label="Message Content" rules={[{ required: true }]}>
                        <Input.TextArea rows={4} placeholder="Hello everyone!" />
                    </Form.Item>
                </Form>
            </Modal>
        </PageContainer>
    );
};

export default ScheduledMessages;
