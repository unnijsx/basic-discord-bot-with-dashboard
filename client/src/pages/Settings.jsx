import React, { useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Switch, Button, notification, Divider, Select, Row, Col, Spin, Alert, Tooltip, Space, Tag } from 'antd';
import { SaveOutlined, SettingOutlined, AppstoreOutlined, GlobalOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const StyledCard = styled(Card)`
  background: #1e1f22;
  border-radius: 8px;
  border: 1px solid #2b2d31;
  .ant-card-head {
    border-bottom: 1px solid #2b2d31;
    color: #f2f3f5;
  }
  .ant-card-body {
    color: #dbdee1;
  }
`;

const Settings = () => {
    const { guildId } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();
    const [notificationApi, contextHolder] = notification.useNotification();

    useEffect(() => {
        fetchSettings();
    }, [guildId]);

    const [moduleTiers, setModuleTiers] = useState({});
    const { user } = useAuth(); // Needed for isPremium check

    useEffect(() => {
        fetchSettings();
        fetchModuleTiers();
    }, [guildId]);

    const fetchModuleTiers = async () => {
        try {
            const { data } = await api.get('/api/config');
            setModuleTiers(data.moduleTiers || {});
        } catch (error) {
            console.error(error);
        }
    };

    const isLocked = (key) => {
        const tier = moduleTiers[key];
        return tier === 'premium' && !user?.isPremium;
    };

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await api.get(`/api/guilds/${guildId}/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Flatten the structure for the form if needed, or just set fields
            // The API returns: { prefix, language, modules: { moderation: bool, ... }, ... }
            const data = response.data;

            form.setFieldsValue({
                prefix: data.prefix,
                language: data.language,
                'modules.moderation': data.modules?.moderation,
                'modules.music': data.modules?.music,
                'modules.leveling': data.modules?.leveling,
                'modules.logging': data.modules?.logging,
            });

            setLoading(false);
        } catch (error) {
            console.error('Fetch settings error:', error);
            notificationApi.error({
                message: 'Error Loading Settings',
                description: 'Could not load guild settings. Please try again.'
            });
            setLoading(false);
        }
    };

    const onFinish = async (values) => {
        try {
            setSaving(true);
            const token = localStorage.getItem('token');

            await api.put(`/api/guilds/${guildId}/settings`, values, {
                headers: { Authorization: `Bearer ${token}` }
            });

            notificationApi.success({
                message: 'Settings Saved',
                description: 'Guild configuration has been updated successfully.'
            });
            setSaving(false);
        } catch (error) {
            console.error('Save settings error:', error);
            notificationApi.error({
                message: 'Save Failed',
                description: error.response?.data?.error || 'Failed to save settings.'
            });
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: 24, paddingBottom: 100 }}>
            {contextHolder}

            <PageHeader>
                <Title level={2} style={{ color: '#fff', marginBottom: 8 }}>
                    <SettingOutlined /> General Settings
                </Title>
                <Text type="secondary">Configure global bot behavior and enable/disable modules.</Text>
            </PageHeader>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={14}>
                        <StyledCard title="Core Configuration" bordered={false}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="prefix"
                                        label={<span style={{ color: '#dbdee1' }}>Command Prefix</span>}
                                        rules={[{ required: true, message: 'Prefix is required' }]}
                                        extra={<span style={{ color: '#949ba4' }}>Default is !</span>}
                                    >
                                        <Input
                                            size="large"
                                            placeholder="!"
                                            style={{ background: '#1e1f22', borderColor: '#41434a', color: '#dbdee1' }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="language"
                                        label={<span style={{ color: '#dbdee1' }}>Language</span>}
                                        initialValue="en"
                                    >
                                        <Select
                                            size="large"
                                            style={{ width: '100%' }}
                                            dropdownStyle={{ background: '#2b2d31' }}
                                        >
                                            <Option value="en">English (US)</Option>
                                            <Option value="ml">Malayalam (മലയാളം)</Option>
                                            <Option value="hi">Hindi (हिंदी)</Option>
                                            <Option value="de">German (Deutsch)</Option>
                                            <Option value="ru">Russian (Русский)</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </StyledCard>

                        <StyledCard title="Module Management" bordered={false} style={{ marginTop: 24 }}>
                            <Paragraph style={{ color: '#949ba4', marginBottom: 24 }}>
                                Enable or disable specific functionality. <span style={{ color: '#faa61a' }}>Premium modules are locked for free users.</span>
                            </Paragraph>

                            <Row gutter={[16, 16]}>
                                {['moderation', 'music', 'leveling', 'logging'].map(key => {
                                    const locked = isLocked(key);
                                    return (
                                        <Col span={12} key={key}>
                                            <Form.Item name={['modules', key]} valuePropName="checked">
                                                <Card size="small" style={{ background: '#2b2d31', borderColor: '#1e1f22', opacity: locked ? 0.6 : 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Space>
                                                            <span style={{ color: '#fff', fontWeight: 600, textTransform: 'capitalize' }}>{key}</span>
                                                            {locked && <Tag color="gold">PREMIUM</Tag>}
                                                        </Space>
                                                        <Tooltip title={locked ? "Upgrade to Premium to enable" : ""}>
                                                            <Switch disabled={locked} />
                                                        </Tooltip>
                                                    </div>
                                                </Card>
                                            </Form.Item>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </StyledCard>
                    </Col>

                    <Col xs={24} lg={10}>
                        <StyledCard title="Bot Info" bordered={false}>
                            <div style={{ textAlign: 'center', padding: 20 }}>
                                <Title level={4} style={{ color: '#fff' }}>Rheox Bot</Title>
                                <Text type="secondary">Version 2.0.0</Text>
                                <Divider style={{ borderColor: '#41434a' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <Button type="link" href="/support" target="_blank">Support Server</Button>
                                    <Button type="link" href="/terms" target="_blank">Terms of Service</Button>
                                    <Button type="link" href="/privacy" target="_blank">Privacy Policy</Button>
                                </div>
                            </div>
                        </StyledCard>
                    </Col>
                </Row>

                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: '#111214',
                    padding: '16px 24px',
                    borderTop: '1px solid #1e1f22',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    zIndex: 100,
                    paddingRight: 60
                }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        size="large"
                        loading={saving}
                        style={{ minWidth: 150 }}
                    >
                        Save Changes
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default Settings;
