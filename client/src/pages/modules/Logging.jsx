import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Switch, Form, Input, Button, message, Typography, Divider, Row, Col, Select } from 'antd';
import { SoundOutlined, UserOutlined, MessageOutlined, SettingOutlined } from '@ant-design/icons';
import api from '../../api/axios';

const { Title, Text } = Typography;

const Logging = () => {
    const { guildId } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [channels, setChannels] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsRes, channelsRes] = await Promise.all([
                    api.get(`/guilds/${guildId}/settings`),
                    api.get(`/guilds/${guildId}/channels`)
                ]);

                const data = settingsRes.data;
                setChannels(channelsRes.data.filter(c => c.type === 0)); // Text channels only

                form.setFieldsValue({
                    enabled: data.modules.logging,
                    logChannelId: data.loggingConfig?.logChannelId,
                    logMessageDelete: data.loggingConfig?.logMessageDelete ?? true,
                    logMessageEdit: data.loggingConfig?.logMessageEdit ?? true,
                    logMemberJoin: data.loggingConfig?.logMemberJoin ?? true,
                    logMemberLeave: data.loggingConfig?.logMemberLeave ?? true,
                    logVoiceState: data.loggingConfig?.logVoiceState ?? true,
                });
                setLoading(false);
            } catch (error) {
                console.error(error);
                message.error('Failed to load settings');
            }
        };
        fetchData();
    }, [guildId, form]);

    const onFinish = async (values) => {
        try {
            await api.put(`/guilds/${guildId}/settings`, {
                modules: { logging: values.enabled },
                loggingConfig: {
                    logChannelId: values.logChannelId,
                    logMessageDelete: values.logMessageDelete,
                    logMessageEdit: values.logMessageEdit,
                    logMemberJoin: values.logMemberJoin,
                    logMemberLeave: values.logMemberLeave,
                    logVoiceState: values.logVoiceState,
                }
            });
            message.success('Logging settings updated!');
        } catch (error) {
            console.error(error);
            message.error('Failed to save settings');
        }
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Logging System</Title>
                <Text type="secondary">Track events and activities in your server.</Text>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        {/* Global Settings */}
                        <Card title={<><SettingOutlined /> General Configuration</>} style={{ marginBottom: 24 }}>
                            <Row gutter={16} align="middle">
                                <Col span={12}>
                                    <Form.Item name="enabled" valuePropName="checked" label="Module Status" style={{ marginBottom: 0 }}>
                                        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="logChannelId" label="Log Channel" style={{ marginBottom: 0 }}>
                                        <Select
                                            placeholder="Select a channel"
                                            showSearch
                                            optionFilterProp="label"
                                            options={channels.map(c => ({ label: `#${c.name}`, value: c.id }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        {/* Event Categories */}
                        <Card title="Event Subscriptions" loading={loading}>

                            {/* Message Events */}
                            <div style={{ marginBottom: 24 }}>
                                <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <MessageOutlined /> Message Events
                                </Title>
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Form.Item name="logMessageDelete" valuePropName="checked" noStyle>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2b2d31', padding: 12, borderRadius: 8 }}>
                                                <Text>Message Deletes</Text>
                                                <Switch />
                                            </div>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="logMessageEdit" valuePropName="checked" noStyle>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2b2d31', padding: 12, borderRadius: 8 }}>
                                                <Text>Message Edits</Text>
                                                <Switch />
                                            </div>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>

                            <Divider />

                            {/* Member Events */}
                            <div style={{ marginBottom: 24 }}>
                                <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <UserOutlined /> Member Events
                                </Title>
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Form.Item name="logMemberJoin" valuePropName="checked" noStyle>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2b2d31', padding: 12, borderRadius: 8 }}>
                                                <Text>Member Joins</Text>
                                                <Switch />
                                            </div>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="logMemberLeave" valuePropName="checked" noStyle>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2b2d31', padding: 12, borderRadius: 8 }}>
                                                <Text>Member Leaves</Text>
                                                <Switch />
                                            </div>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>

                            <Divider />

                            {/* Voice Events */}
                            <div style={{ marginBottom: 24 }}>
                                <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <SoundOutlined /> Voice Events
                                </Title>
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Form.Item name="logVoiceState" valuePropName="checked" noStyle>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2b2d31', padding: 12, borderRadius: 8 }}>
                                                <Text>Voice Channel Updates</Text>
                                                <Switch />
                                            </div>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>

                        </Card>
                    </Col>

                    {/* Sidebar Info */}
                    <Col xs={24} lg={8}>
                        <Card title="Information" style={{ position: 'sticky', top: 24 }}>
                            <Text type="secondary">
                                Toggle specific events to control what gets logged to your server.
                                Ensure the bot has <b>View Channel</b> and <b>Send Messages</b> permissions in the selected Log Channel.
                            </Text>
                            <Divider />
                            <Button type="primary" htmlType="submit" block size="large" style={{ background: '#5865F2' }}>
                                Save Changes
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default Logging;
