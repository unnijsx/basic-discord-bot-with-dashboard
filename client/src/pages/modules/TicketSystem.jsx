import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Select, Divider, App, Row, Col, Typography, Space, List, Tag, Modal, Popconfirm, Tabs, Table, Tooltip } from 'antd';
import { SendOutlined, SaveOutlined, RobotOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, ClockCircleOutlined, MessageOutlined, EllipsisOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { Option } = Select;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
`;

const TicketCard = styled(Card)`
    background: #2f3136;
    border: 1px solid #202225;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
    
    .ant-card-body {
        padding: 0;
    }

    /* Simulate Discord Embed Look */
    .discord-embed {
        background: #2f3136;
        padding: 16px;
        border-left: 4px solid #5865F2; /* Default blurple, dynamic later if color picker added */
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .discord-title {
        color: #fff;
        font-weight: 600;
        font-size: 16px;
    }

    .discord-desc {
        color: #dcddde;
        font-size: 14px;
        white-space: pre-wrap;
    }

    .discord-btn {
        background: #5865F2;
        color: white;
        border-radius: 3px;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        width: fit-content;
        margin-top: 8px;
        cursor: default; /* Just a preview */
    }

    .action-bar {
        background: #202225;
        padding: 8px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #18191c;
    }

    .action-btn {
        color: #b9bbbe;
        font-size: 16px;
        cursor: pointer;
        transition: color 0.2s;
        &:hover { color: #fff; }
        &.delete:hover { color: #f04747; }
    }
`;

const TicketSystem = () => {
    const { guildId } = useParams();
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [panels, setPanels] = useState([]);
    const [activeTickets, setActiveTickets] = useState([]);
    const [view, setView] = useState('list');
    const [editingPanel, setEditingPanel] = useState(null);
    const [channels, setChannels] = useState([]);
    const [roles, setRoles] = useState([]);

    // Deployment State per panel (map uniqueId -> channelId)
    const [deployTargets, setDeployTargets] = useState({});

    useEffect(() => {
        fetchData();
        fetchResources();
    }, [guildId]);

    const fetchData = async () => {
        try {
            const [panelsRes, ticketsRes] = await Promise.all([
                api.get(`/tickets/${guildId}/panels`),
                api.get(`/tickets/${guildId}/active`)
            ]);
            setPanels(panelsRes.data);
            setActiveTickets(ticketsRes.data);
        } catch (error) {
            console.error(error);
            message.error('Failed to fetch ticket data');
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
            console.log("Could not fetch resources");
        }
    };

    const handleDeploy = async (panelId) => {
        const targetChannel = deployTargets[panelId];
        if (!targetChannel) return message.warning('Select a channel first!');

        try {
            await api.post(`/tickets/${guildId}/deploy/${panelId}`, { channelId: targetChannel });
            message.success('Embedded panel deployed!');
        } catch (error) {
            message.error('Deployment failed');
        }
    };

    const handleDelete = async (uniqueId) => {
        try {
            await api.delete(`/tickets/${guildId}/panels/${uniqueId}`);
            message.success('Panel deleted');
            fetchData();
        } catch (error) {
            message.error('Failed to delete');
        }
    };

    const handleSave = async (values) => {
        setLoading(true);
        try {
            const payload = { ...values };
            if (editingPanel) payload.uniqueId = editingPanel.uniqueId;
            console.log('Sending payload:', payload); // Debug log
            await api.post(`/tickets/${guildId}/panels`, payload);
            message.success('Configuration saved');
            setView('list');
            fetchData();
        } catch (error) {
            console.error('Save error:', error);
            message.error(`Save failed: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.warning('Please fill in all required fields (e.g., Title)');
    };

    const handleEditStart = (panel) => {
        setEditingPanel(panel);
        setView('edit');
        if (panel) form.setFieldsValue(panel);
        else {
            form.resetFields();
            form.setFieldsValue({
                title: 'Open a Ticket',
                description: 'Click the button below to allow our support team to assist you.',
                buttonText: 'Create Ticket',
                buttonEmoji: '🎫',
                namingScheme: 'ticket-{username}'
            });
        }
    };

    // --- RENDER ---

    if (view === 'list') {
        return (
            <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
                <PageHeader>
                    <div>
                        <Title level={2} style={{ color: '#fff', margin: 0 }}>Ticket Panels</Title>
                        <Text style={{ color: '#b9bbbe' }}>Design and deploy generic support panels.</Text>
                    </div>
                    <Space>
                        <Button icon={<ClockCircleOutlined />} onClick={() => window.location.href = `/dashboard/${guildId}/tickets/history`}>
                            History
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleEditStart(null)} size="large" style={{ background: '#5865F2' }}>
                            New Panel
                        </Button>
                    </Space>
                </PageHeader>

                <Tabs defaultActiveKey="1" items={[
                    {
                        key: '1',
                        label: 'Ticket Panels',
                        children: (
                            <List
                                grid={{ gutter: 24, xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }}
                                dataSource={panels}
                                renderItem={panel => (
                                    <List.Item>
                                        <TicketCard bordered={false}>
                                            <div className="discord-embed">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ fontSize: 20 }}>{panel.buttonEmoji}</span>
                                                    <span className="discord-title">{panel.title}</span>
                                                </div>
                                                <div className="discord-desc">{panel.description}</div>
                                                <div className="discord-btn">
                                                    {panel.buttonText}
                                                </div>
                                                <div style={{ marginTop: 8 }}>
                                                    <Tag color="#5865F2">{panel.namingScheme}</Tag>
                                                </div>
                                            </div>

                                            <div className="action-bar">
                                                <Popconfirm title="Delete?" onConfirm={() => handleDelete(panel.uniqueId)}>
                                                    <Tooltip title="Delete Panel">
                                                        <DeleteOutlined className="action-btn delete" />
                                                    </Tooltip>
                                                </Popconfirm>

                                                <Tooltip title="Edit Configuration">
                                                    <EditOutlined className="action-btn" onClick={() => handleEditStart(panel)} />
                                                </Tooltip>

                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <Select
                                                        placeholder="Deploy to..."
                                                        size="small"
                                                        style={{ width: 130 }}
                                                        bordered={false}
                                                        className="deploy-select"
                                                        dropdownMatchSelectWidth={false}
                                                        onChange={(val) => setDeployTargets({ ...deployTargets, [panel.uniqueId]: val })}
                                                        options={channels.map(c => ({ label: '#' + c.name, value: c.id }))}
                                                        showSearch
                                                        optionFilterProp="label"
                                                    />
                                                    <Tooltip title="Send to Discord">
                                                        <SendOutlined
                                                            className="action-btn"
                                                            style={{ color: deployTargets[panel.uniqueId] ? '#5865F2' : '#4f545c' }}
                                                            onClick={() => handleDeploy(panel.uniqueId)}
                                                        />
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </TicketCard>
                                    </List.Item>
                                )}
                            />
                        )
                    },
                    {
                        key: '2',
                        label: `Active Tickets (${activeTickets.length})`,
                        children: (
                            <Table
                                dataSource={activeTickets}
                                rowKey="channelId"
                                pagination={{ pageSize: 10 }}
                                columns={[
                                    { title: 'Ticket', dataIndex: 'channelId', render: id => <Tag>#{id}</Tag> },
                                    { title: 'Status', dataIndex: 'status', render: s => <Tag color={s === 'open' ? 'green' : 'red'}>{s?.toUpperCase()}</Tag> },
                                    { title: 'Created', dataIndex: 'createdAt', render: d => new Date(d).toLocaleDateString() },
                                    { title: 'Action', render: (_, r) => <a href={`https://discord.com/channels/${guildId}/${r.channelId}`} target="_blank" rel="noreferrer">Open</a> }
                                ]}
                            />
                        )
                    }
                ]} />
            </div>
        );
    }

    return (
        <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setView('list')} style={{ color: '#b9bbbe', marginBottom: 16 }}>
                Back to Panels
            </Button>

            <Row gutter={32}>
                {/* Configuration Form */}
                <Col xs={24} lg={14}>
                    <Card title={editingPanel ? 'Edit Panel' : 'Create Panel'} style={{ background: '#2f3136', borderColor: '#202225' }}>
                        <Form form={form} layout="vertical" onFinish={handleSave} onFinishFailed={onFinishFailed}>
                            <Title level={5} style={{ color: '#fff' }}>Embed Appearance</Title>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter a title for the panel' }]}>
                                        <Input placeholder="Server Support" />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="description" label="Description">
                                        <Input.TextArea rows={3} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="buttonText" label="Button Label">
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="buttonEmoji" label="Emoji">
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider style={{ borderColor: '#ffffff10' }} />

                            <Title level={5} style={{ color: '#fff' }}>Ticket Settings</Title>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="ticketCategory" label="Open Ticket Category">
                                        <Select placeholder="Select Category" showSearch optionFilterProp="label" allowClear
                                            options={channels.filter(c => c.type === 4).map(c => ({ label: c.name.toUpperCase(), value: c.id }))}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="closedCategory" label="Closed Ticket Category">
                                        <Select placeholder="Select Category (Optional)" showSearch optionFilterProp="label" allowClear
                                            options={channels.filter(c => c.type === 4).map(c => ({ label: c.name.toUpperCase(), value: c.id }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="namingScheme" label="Naming Scheme">
                                        <Select>
                                            <Option value="ticket-{username}">ticket-username</Option>
                                            <Option value="ticket-{id}">ticket-001</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="supportRole" label="Support Role">
                                        <Select placeholder="Select Support Role" showSearch optionFilterProp="children" allowClear>
                                            {roles.map(r => (
                                                <Option key={r.id} value={r.id} style={{ color: r.color }}>{r.name}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item name="transcriptChannelId" label="Transcript Log Channel">
                                        <Select placeholder="Select a channel to log transcripts" showSearch optionFilterProp="label" allowClear
                                            options={channels.filter(c => c.type === 0).map(c => ({ label: `#${c.name}`, value: c.id }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    onClick={() => form.submit()}
                                    block
                                    size="large"
                                    loading={loading}
                                    style={{ background: '#5865F2', marginTop: 16 }}
                                >
                                    Save Panel
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                {/* Live Preview */}
                <Col xs={24} lg={10}>
                    <div style={{ position: 'sticky', top: 24 }}>
                        <Text style={{ color: '#b9bbbe', display: 'block', marginBottom: 8, textTransform: 'uppercase', fontSize: 12, fontWeight: 700 }}>Preview</Text>
                        <Form shouldUpdate form={form}>
                            {() => {
                                const values = form.getFieldsValue();
                                return (
                                    <TicketCard bordered={false}>
                                        <div className="discord-embed">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: 20 }}>{values.buttonEmoji || '🎫'}</span>
                                                <span className="discord-title">{values.title || 'Embed Title'}</span>
                                            </div>
                                            <div className="discord-desc">{values.description || 'Embed Description'}</div>
                                            <div className="discord-btn">
                                                {values.buttonText || 'Create Ticket'}
                                            </div>
                                            <div style={{ marginTop: 8 }}>
                                                <Tag color="#5865F2">{values.namingScheme}</Tag>
                                            </div>
                                        </div>
                                    </TicketCard>
                                );
                            }}
                        </Form>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default TicketSystem;
