import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Select, Divider, App, Row, Col, Typography, Space, List, Tag, Modal, Popconfirm } from 'antd';
import { SendOutlined, SaveOutlined, RobotOutlined, DeploymentUnitOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { useParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const TicketSystem = () => {
    const { guildId } = useParams();
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [panels, setPanels] = useState([]);
    const [view, setView] = useState('list'); // 'list' or 'edit'
    const [editingPanel, setEditingPanel] = useState(null); // null = new
    const [channels, setChannels] = useState([]);
    const [roles, setRoles] = useState([]);
    const [deployLoading, setDeployLoading] = useState(false);
    const [deployChannel, setDeployChannel] = useState(null);

    useEffect(() => {
        fetchData();
        fetchResources();
    }, [guildId]);

    const fetchData = async () => {
        try {
            const res = await api.get(`/guilds/${guildId}/tickets/panels`);
            setPanels(res.data);
        } catch (error) {
            console.error(error);
            message.error('Failed to fetch ticket panels');
        }
    };

    const fetchResources = async () => {
        try {
            const [channelsRes, rolesRes] = await Promise.all([
                api.get(`/guilds/${guildId}/channels`),
                api.get(`/guilds/${guildId}/roles`)
            ]);
            setChannels(channelsRes.data);
            setRoles(rolesRes.data);
        } catch (error) {
            console.error('Failed to fetch resources');
        }
    };

    const handleEdit = (panel) => {
        setEditingPanel(panel);
        setView('edit');
        if (panel) {
            form.setFieldsValue(panel);
        } else {
            form.resetFields();
            form.setFieldsValue({
                title: 'Open a Ticket',
                description: 'Click the button below to react out to our support team.',
                buttonText: 'Create Ticket',
                buttonEmoji: '🎫',
                namingScheme: 'ticket-{username}'
            });
        }
    };

    const handleDelete = async (uniqueId) => {
        try {
            await api.delete(`/guilds/${guildId}/tickets/panel/${uniqueId}`);
            message.success('Panel deleted');
            fetchData();
        } catch (error) {
            message.error('Failed to delete panel');
        }
    };

    const handleSave = async (values) => {
        setLoading(true);
        try {
            const payload = { ...values };
            if (editingPanel) payload.uniqueId = editingPanel.uniqueId;

            await api.post(`/guilds/${guildId}/tickets/panel`, payload);
            message.success('Ticket panel saved');
            setView('list');
            fetchData();
        } catch (error) {
            message.error('Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleDeploy = async (panelId) => {
        if (!deployChannel) return message.warning('Please select a channel to deploy to');
        setDeployLoading(true);
        try {
            await api.post(`/guilds/${guildId}/tickets/send`, {
                channelId: deployChannel,
                uniqueId: panelId
            });
            message.success('Ticket panel deployed successfully!');
        } catch (error) {
            message.error('Failed to deploy ticket panel');
        } finally {
            setDeployLoading(false);
        }
    };

    if (view === 'list') {
        return (
            <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={2} style={{ color: '#fff', margin: 0 }}>Ticket System</Title>
                        <Text type="secondary">Manage multiple support ticket panels for your server.</Text>
                    </div>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => handleEdit(null)} size="large">
                        Create New Panel
                    </Button>
                </div>

                <List
                    grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 3 }}
                    dataSource={panels}
                    renderItem={item => (
                        <List.Item>
                            <Card
                                style={{ background: '#2f3136', border: '1px solid #202225' }}
                                actions={[
                                    <Popconfirm title="Delete this panel?" onConfirm={() => handleDelete(item.uniqueId)}>
                                        <DeleteOutlined key="delete" style={{ color: '#f5222d' }} />
                                    </Popconfirm>,
                                    <EditOutlined key="edit" onClick={() => handleEdit(item)} />,
                                    <div style={{ padding: '0 8px' }}>
                                        <Select
                                            placeholder="Deploy to..."
                                            size="small"
                                            style={{ width: 120 }}
                                            onChange={setDeployChannel}
                                            options={channels.map(c => ({ label: '#' + c.name, value: c.id }))}
                                            dropdownMatchSelectWidth={false}
                                        />
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<SendOutlined />}
                                            onClick={() => handleDeploy(item.uniqueId)}
                                            disabled={!deployChannel}
                                            style={{ color: '#5865F2' }}
                                        />
                                    </div>
                                ]}
                            >
                                <Card.Meta
                                    avatar={<div style={{ fontSize: 24 }}>{item.buttonEmoji}</div>}
                                    title={<Text style={{ color: '#fff' }}>{item.title}</Text>}
                                    description={
                                        <Space direction="vertical" size={2}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>{item.buttonText}</Text>
                                            <Tag color="blue">{item.namingScheme}</Tag>
                                        </Space>
                                    }
                                />
                            </Card>
                        </List.Item>
                    )}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => setView('list')} style={{ marginBottom: 16, paddingLeft: 0 }}>
                Back to Panels
            </Button>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card title={<Space><RobotOutlined /> {editingPanel ? 'Edit Panel' : 'New Panel'}</Space>} bordered={false} style={{ background: '#2f3136' }}>
                        <Form form={form} layout="vertical" onFinish={handleSave}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="title" label="Embed Title" rules={[{ required: true }]}>
                                        <Input placeholder="e.g. Server Support" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="namingScheme" label="Ticket Naming" initialValue="ticket-{username}">
                                        <Select>
                                            <Option value="ticket-{username}">ticket-username</Option>
                                            <Option value="ticket-{id}">ticket-001</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="description" label="Embed Description" initialValue="Click the button below to contact support.">
                                <Input.TextArea rows={3} placeholder="Explain what this ticket panel is for..." />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="buttonText" label="Button Text" initialValue="Create Ticket">
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="buttonEmoji" label="Button Emoji" initialValue="🎫">
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider />

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="ticketCategory" label="Ticket Category (ID)" tooltip="Paste the Category ID where new tickets will be created.">
                                        <Input placeholder="e.g. 123456789012345678" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="supportRole" label="Support Role (ID)" tooltip="Paste the Role ID of your support team.">
                                        <Select placeholder="Select Support Role" showSearch optionFilterProp="children" allowClear>
                                            {roles.map(r => (
                                                <Option key={r.id} value={r.id} style={{ color: r.color !== '#000000' ? r.color : 'inherit' }}>
                                                    {r.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider orientation="left" style={{ color: '#fff', borderColor: '#ffffff20' }}>Ticket Form (Optional)</Divider>
                            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                                If you add questions here, a popup form (Modal) will appear when users click the "Create Ticket" button.
                            </Text>

                            <Form.List name="formQuestions">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Card key={key} size="small" style={{ background: '#36393f', borderColor: '#202225', marginBottom: 12 }}>
                                                <Space align="baseline" style={{ width: '100%', justifyContent: 'space-between' }}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'label']}
                                                        rules={[{ required: true, message: 'Question required' }]}
                                                        style={{ marginBottom: 0, width: 300 }}
                                                    >
                                                        <Input placeholder="Question (e.g. What is your issue?)" />
                                                    </Form.Item>

                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'style']}
                                                        initialValue="Paragraph"
                                                        style={{ marginBottom: 0, width: 120 }}
                                                    >
                                                        <Select>
                                                            <Option value="Short">Short</Option>
                                                            <Option value="Paragraph">Paragraph</Option>
                                                        </Select>
                                                    </Form.Item>

                                                    <DeleteOutlined onClick={() => remove(name)} style={{ color: '#f5222d' }} />
                                                </Space>
                                            </Card>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} disabled={fields.length >= 5}>
                                                Add Question (Max 5)
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} block size="large">
                                    Save Configuration
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Preview" bordered={false} style={{ background: '#2f3136' }}>
                        <Form shouldUpdate form={form}>
                            {() => {
                                const values = form.getFieldsValue();
                                return (
                                    <div style={{ borderLeft: '4px solid #5865F2', background: '#36393f', padding: 16, borderRadius: 4 }}>
                                        <Title level={5} style={{ color: '#fff', marginTop: 0 }}>{values.title || 'Embed Title'}</Title>
                                        <Text style={{ color: '#dcddde', display: 'block', marginBottom: 16 }}>{values.description || 'Description...'}</Text>
                                        <Button type="primary" style={{ background: '#5865F2', borderColor: '#5865F2' }}>
                                            {values.buttonEmoji} {values.buttonText}
                                        </Button>
                                    </div>
                                );
                            }}
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default TicketSystem;
