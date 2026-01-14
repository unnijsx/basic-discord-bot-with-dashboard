import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Switch, Form, Input, Button, message, Typography, Divider } from 'antd';
import api from '../../api/axios';

const { Title, Text } = Typography;

const Logging = () => {
    const { guildId } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get(`/guilds/${guildId}/settings`);
                form.setFieldsValue({
                    enabled: data.modules.logging,
                    logChannelId: data.loggingConfig?.logChannelId,
                    logMessageDelete: data.loggingConfig?.logMessageDelete ?? true,
                    logMessageEdit: data.loggingConfig?.logMessageEdit ?? true,
                    logMemberJoin: data.loggingConfig?.logMemberJoin ?? true,
                    logMemberLeave: data.loggingConfig?.logMemberLeave ?? true,
                });
                setLoading(false);
            } catch (error) {
                console.error(error);
                message.error('Failed to load settings');
            }
        };
        fetchSettings();
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
                }
            });
            message.success('Settings saved successfully');
        } catch (error) {
            console.error(error);
            message.error('Failed to save settings');
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Title level={2}>Logging System</Title>
            <Card loading={loading}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="enabled" valuePropName="checked" label="Enable Logging Module">
                        <Switch />
                    </Form.Item>

                    <Divider />

                    <Form.Item name="logChannelId" label="Log Channel ID" tooltip="Right-click a channel and select 'Copy ID'">
                        <Input placeholder="123456789012345678" />
                    </Form.Item>

                    <Title level={4}>Events to Log</Title>

                    <Form.Item name="logMessageDelete" valuePropName="checked">
                        <Switch checkedChildren="Message Deletes" unCheckedChildren="Message Deletes" />
                    </Form.Item>

                    <Form.Item name="logMessageEdit" valuePropName="checked">
                        <Switch checkedChildren="Message Edits" unCheckedChildren="Message Edits" />
                    </Form.Item>

                    <Form.Item name="logMemberJoin" valuePropName="checked">
                        <Switch checkedChildren="Member Joins" unCheckedChildren="Member Joins" />
                    </Form.Item>

                    <Form.Item name="logMemberLeave" valuePropName="checked">
                        <Switch checkedChildren="Member Leaves" unCheckedChildren="Member Leaves" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit">Save Changes</Button>
                </Form>
            </Card>
        </div>
    );
};

export default Logging;
