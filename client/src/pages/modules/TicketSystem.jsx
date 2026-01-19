import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Select, Divider, App, Row, Col, Typography, Space } from 'antd';
import { SendOutlined, SaveOutlined, RobotOutlined, DeploymentUnitOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { useParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const TicketSystem = () => {
    const { guildId } = useParams();
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [channels, setChannels] = useState([]);
    const [roles, setRoles] = useState([]);
    const [deployLoading, setDeployLoading] = useState(false);
    const [deployChannel, setDeployChannel] = useState(null);

    useEffect(() => {
        fetchData();
    }, [guildId]);

    const fetchData = async () => {
        try {
            const [panelRes, channelsRes, rolesRes] = await Promise.all([
                api.get(`/guilds/${guildId}/tickets/panel`),
                api.get(`/guilds/${guildId}/channels`),
                api.get(`/guilds/${guildId}/roles`)
            ]);

            form.setFieldsValue(panelRes.data);
            setChannels(channelsRes.data);
            setRoles(rolesRes.data);
        } catch (error) {
            console.error(error);
            message.error('Failed to fetch ticket configuration');
        }
    };

    const handleSave = async (values) => {
        setLoading(true);
        try {
            await api.post(`/guilds/${guildId}/tickets/panel`, values);
            message.success('Ticket panel configuration saved');
        } catch (error) {
            message.error('Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleDeploy = async () => {
        if (!deployChannel) return message.warning('Please select a channel to deploy to');
        setDeployLoading(true);
        try {
            await api.post(`/guilds/${guildId}/tickets/send`, { channelId: deployChannel });
            message.success('Ticket panel deployed successfully!');
        } catch (error) {
            message.error('Failed to deploy ticket panel');
        } finally {
            setDeployLoading(false);
        }
    };

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ color: '#fff', margin: 0 }}>Ticket System</Title>
                <Text type="secondary">Configure your support ticket system and deploy panels to your server.</Text>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card title={<Space><RobotOutlined /> Panel Configuration</Space>} bordered={false} style={{ background: '#2f3136' }}>
                        <Form form={form} layout="vertical" onFinish={handleSave}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="title" label="Embed Title" initialValue="Open a Ticket">
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
                                         <Select placeholder="Select Support Role" showSearch optionFilterProp="children">
                                            {roles.map(r => (
                                                <Option key={r.id} value={r.id} style={{ color: r.color !== '#000000' ? r.color : 'inherit' }}>
                                                    {r.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            
                            <Form.Item>
                                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} block size="large">
                                    Save Configuration
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title={<Space><DeploymentUnitOutlined /> Deploy Panel</Space>} bordered={false} style={{ background: '#2f3136' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Text type="secondary">
                                Select a channel to send this ticket panel to. Make sure the bot has permission to view and send messages in that channel.
                            </Text>
                            
                            <Select 
                                placeholder="Select Channel" 
                                style={{ width: '100%' }}
                                onChange={setDeployChannel}
                                value={deployChannel}
                                showSearch
                                optionFilterProp="children"
                            >
                                {channels.map(c => (
                                    <Option key={c.id} value={c.id}>#{c.name}</Option>
                                ))}
                            </Select>

                            <Button 
                                type="primary" 
                                danger 
                                icon={<SendOutlined />} 
                                onClick={handleDeploy} 
                                loading={deployLoading}
                                disabled={!deployChannel}
                            >
                                Deploy Panel
                            </Button>
                        </div>
                    </Card>
                    
                    <Card title="Preview" bordered={false} style={{ background: '#2f3136', marginTop: 24 }}>
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
