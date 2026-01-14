import React, { useEffect, useState } from 'react';
import { Form, Switch, Input, Button, Card, message, Select } from 'antd';
import api from '../../api/axios';
import { useParams } from 'react-router-dom';

const { TextArea } = Input;

const Moderation = () => {
    const { guildId } = useParams();
    const [loading, setLoading] = useState(true);
    const [initialValues, setInitialValues] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get(`/guilds/${guildId}/settings`);
                setInitialValues({
                    enabled: data.modules.moderation,
                    autoMod: data.moderationConfig.autoMod,
                    logChannelId: data.moderationConfig.logChannelId
                });
            } catch (error) {
                message.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [guildId]);

    const onFinish = async (values) => {
        try {
            await api.put(`/guilds/${guildId}/settings`, {
                modules: { moderation: values.enabled },
                moderationConfig: {
                    autoMod: values.autoMod,
                    logChannelId: values.logChannelId
                }
            });
            message.success('Settings saved successfully!');
        } catch (error) {
            message.error('Failed to save settings');
        }
    };

    return (
        <Card title="Moderation Settings" loading={loading} variant="outlined">
            {!loading && (
                <Form form={form} layout="vertical" onFinish={onFinish} initialValues={initialValues}>
                    <Form.Item name="enabled" label="Enable Moderation Module" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item name="autoMod" label="Enable Auto-Mod (Bad Words)" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item name="logChannelId" label="Log Channel ID">
                        <Input placeholder="Enter Channel ID" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Save Changes
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </Card>
    );
};

export default Moderation;
