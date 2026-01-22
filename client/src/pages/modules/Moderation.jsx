import React, { useEffect, useState } from 'react';
import { Form, Switch, Input, Button, Card, message, Tabs, Select, List, Tag, Typography, Slider, Row, Col, Divider, Tooltip } from 'antd';
import { InfoCircleOutlined, DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import { useParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const Moderation = () => {
    const { guildId } = useParams();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(null);
    const [badWordInput, setBadWordInput] = useState('');
    const [form] = Form.useForm();

    const fetchSettings = async () => {
        try {
            const { data } = await api.get(`/guilds/${guildId}/settings`);
            // Ensure deep objects exist
            const modConfig = data.moderationConfig || {};
            const autoModFilters = modConfig.autoModFilters || { caps: false, links: false, spam: false, badWords: false };
            const actions = modConfig.actions || { badWords: 'delete', caps: 'delete', links: 'delete', spam: 'timeout' };

            const initialValues = {
                enabled: data.modules.moderation,
                logChannelId: modConfig.logChannelId,
                muteRoleId: modConfig.muteRoleId,
                ...autoModFilters, // Flatten for form
                actionBadWords: actions.badWords,
                actionCaps: actions.caps,
                actionLinks: actions.links,
                actionSpam: actions.spam,
            };

            setSettings({ ...data, moderationConfig: { ...modConfig, autoModFilters, actions } });
            form.setFieldsValue(initialValues);
        } catch (error) {
            console.error(error);
            message.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, [guildId]);

    const onFinish = async (values) => {
        try {
            const payload = {
                modules: { moderation: values.enabled },
                moderationConfig: {
                    ...settings.moderationConfig, // Preserve existing config (logChannelId, etc)
                    autoMod: true, // Ensure AutoMod logic is enabled serverside
                    logChannelId: values.logChannelId,
                    muteRoleId: values.muteRoleId,
                    autoModFilters: {
                        caps: values.caps,
                        links: values.links,
                        spam: values.spam,
                        badWords: values.badWords
                    },
                    actions: {
                        badWords: values.actionBadWords,
                        caps: values.actionCaps,
                        links: values.actionLinks,
                        spam: values.actionSpam
                    },
                    bannedWords: settings.moderationConfig.bannedWords
                }
            };

            await api.put(`/guilds/${guildId}/settings`, payload);
            message.success('Moderation settings saved!');
        } catch (error) {
            message.error('Failed to save settings');
        }
    };

    const handleAddWord = () => {
        if (!badWordInput) return;
        const currentWords = settings.moderationConfig.bannedWords || [];
        if (currentWords.includes(badWordInput)) return message.warning('Word already exists');

        const newWords = [...currentWords, badWordInput];
        setSettings(prev => ({
            ...prev,
            moderationConfig: { ...prev.moderationConfig, bannedWords: newWords }
        }));
        setBadWordInput('');
    };

    const handleRemoveWord = (word) => {
        const newWords = settings.moderationConfig.bannedWords.filter(w => w !== word);
        setSettings(prev => ({
            ...prev,
            moderationConfig: { ...prev.moderationConfig, bannedWords: newWords }
        }));
    };

    if (loading) return <Card loading variant="outlined" />;

    const items = [
        {
            key: '1',
            label: 'General',
            children: (
                <>
                    <Form.Item name="enabled" label="Enable Moderation Module" valuePropName="checked">
                        <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                    </Form.Item>
                    <Divider />
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="logChannelId" label="Log Channel ID" tooltip="Channel ID where mod actions are logged">
                                <Input placeholder="123456789..." />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="muteRoleId" label="Mute Role ID" tooltip="Role to assign when muting users">
                                <Input placeholder="123456789..." />
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            ),
        },
        {
            key: '2',
            label: 'Auto-Mod Filters',
            children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <Card size="small" variant="outlined">
                        <Row align="middle" justify="space-between">
                            <Col span={16}>
                                <Text strong>🚫 Block Bad Words</Text><br />
                                <Text type="secondary">Automatically handle messages containing banned words.</Text>
                            </Col>
                            <Col>
                                <Form.Item name="badWords" valuePropName="checked" noStyle><Switch /></Form.Item>
                            </Col>
                        </Row>
                        <div style={{ marginTop: 10 }}>
                            <Form.Item name="actionBadWords" label="Action" style={{ marginBottom: 0 }}>
                                <Select style={{ width: 120 }}>
                                    <Option value="delete">Delete</Option>
                                    <Option value="warn">Warn</Option>
                                    <Option value="mute">Mute</Option>
                                </Select>
                            </Form.Item>
                        </div>
                    </Card>

                    <Card size="small" variant="outlined">
                        <Row align="middle" justify="space-between">
                            <Col span={16}>
                                <Text strong>🔗 Block Links</Text><br />
                                <Text type="secondary">Prevent users from posting external links.</Text>
                            </Col>
                            <Col>
                                <Form.Item name="links" valuePropName="checked" noStyle><Switch /></Form.Item>
                            </Col>
                        </Row>
                        <div style={{ marginTop: 10 }}>
                            <Form.Item name="actionLinks" label="Action" style={{ marginBottom: 0 }}>
                                <Select style={{ width: 120 }}>
                                    <Option value="delete">Delete</Option>
                                    <Option value="warn">Warn</Option>
                                    <Option value="mute">Mute</Option>
                                </Select>
                            </Form.Item>
                        </div>
                    </Card>

                    <Card size="small" variant="outlined">
                        <Row align="middle" justify="space-between">
                            <Col span={16}>
                                <Text strong>📢 Anti-Spam (Caps)</Text><br />
                                <Text type="secondary">Prevent excessive use of capital letters.</Text>
                            </Col>
                            <Col>
                                <Form.Item name="caps" valuePropName="checked" noStyle><Switch /></Form.Item>
                            </Col>
                        </Row>
                        <div style={{ marginTop: 10 }}>
                            <Form.Item name="actionCaps" label="Action" style={{ marginBottom: 0 }}>
                                <Select style={{ width: 120 }}>
                                    <Option value="delete">Delete</Option>
                                    <Option value="warn">Warn</Option>
                                    <Option value="mute">Mute</Option>
                                </Select>
                            </Form.Item>
                        </div>
                    </Card>
                </div>
            ),
        },
        {
            key: '3',
            label: 'Banned Words',
            children: (
                <>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                        <Input
                            placeholder="Add a bad word..."
                            value={badWordInput}
                            onChange={e => setBadWordInput(e.target.value)}
                            onPressEnter={handleAddWord}
                        />
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddWord}>Add</Button>
                    </div>
                    <div style={{ background: '#2f3136', padding: 10, borderRadius: 8, minHeight: 100 }}>
                        {settings.moderationConfig.bannedWords?.length > 0 ? (
                            settings.moderationConfig.bannedWords.map(word => (
                                <Tag
                                    key={word}
                                    closable
                                    onClose={() => handleRemoveWord(word)}
                                    color="red"
                                    style={{ margin: 5, fontSize: 14, padding: '4px 8px' }}
                                >
                                    {word}
                                </Tag>
                            ))
                        ) : (
                            <Text type="secondary">No banned words added yet.</Text>
                        )}
                    </div>
                    <Text type="warning" style={{ display: 'block', marginTop: 10 }}>
                        <InfoCircleOutlined /> Don't forget to save changes after adding/removing words!
                    </Text>
                </>
            ),
        }
    ];

    return (
        <Card title="🛡️ Advanced Moderation" variant="outlined">
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Tabs defaultActiveKey="1" items={items} />
                <Divider />
                <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                    <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />}>
                        Save Configuration
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default Moderation;
