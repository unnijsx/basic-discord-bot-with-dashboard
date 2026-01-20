import React, { useEffect, useState } from 'react';
import { Layout, Card, Switch, Statistic, Row, Col, Input, Button, Alert, message, List, Tag, Select, Table, Avatar, Tooltip, Space } from 'antd';
import { ThunderboltOutlined, WarningOutlined, DatabaseOutlined, GlobalOutlined, RobotOutlined } from '@ant-design/icons';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const { Content } = Layout;
const { TextArea } = Input;

const SuperAdmin = () => {
    const { user } = useAuth();
    const [config, setConfig] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [broadcastMsg, setBroadcastMsg] = useState('');

    useEffect(() => {
        if (!user?.isSuperAdmin) return;
        fetchData();
        const interval = setInterval(fetchStats, 5000); // Poll stats every 5s
        return () => clearInterval(interval);
    }, [user]);

    const fetchData = async () => {
        try {
            const [configRes, statsRes] = await Promise.all([
                axios.get('/admin/system-config'),
                axios.get('/admin/stats')
            ]);
            setConfig(configRes.data);
            setStats(statsRes.data);
        } catch (error) {
            message.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await axios.get('/admin/stats');
            setStats(data);
        } catch (error) {
            console.error('Stats poll failed', error);
        }
    };

    const handleMaintenanceToggle = async (checked) => {
        try {
            const { data } = await axios.put('/admin/system-config', { maintenanceMode: checked });
            setConfig(data);
            message.success(`Maintenance Mode ${checked ? 'ENABLED' : 'DISABLED'}`);
        } catch (error) {
            message.error('Failed to update maintenance mode');
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastMsg.trim()) return;
        try {
            await axios.post('/admin/broadcast', { message: broadcastMsg, type: 'info' });
            message.success('Alert broadcasted successfully');
            setBroadcastMsg('');
            fetchData(); // Refresh config to see current alert
        } catch (error) {
            message.error('Failed to broadcast message');
        }
    };

    // Bot Status Logic
    const [botStatus, setBotStatus] = useState({
        status: 'online',
        activityType: 'Playing',
        activityText: ''
    });

    useEffect(() => {
        if (config?.botStatus) {
            setBotStatus(config.botStatus);
        }
    }, [config]);

    const handleStatusSave = async () => {
        try {
            await axios.put('/admin/system-config', { botStatus });
            message.success('Bot status updated successfully!');
            fetchData();
        } catch (error) {
            message.error('Failed to update bot status');
        }
    };

    if (!user?.isSuperAdmin) {
        return <div style={{ padding: 50, textAlign: 'center' }}><h1>🚫 Restricted Area</h1></div>;
    }

    return (
        <Layout style={{ minHeight: '100vh', padding: '24px' }}>
            <Content style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>⚡ Super Admin Dashboard</h1>
                    <Button type="primary" href="/dashboard">Back to Dashboard</Button>
                </div>

                <Row gutter={[16, 16]}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Guilds"
                                value={stats?.guildCount || 0}
                                prefix={<DatabaseOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Users Reached"
                                value={stats?.users || 0}
                                prefix={<GlobalOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Ping"
                                value={`${stats?.ping?.toFixed(0) || 0}ms`}
                                prefix={<ThunderboltOutlined />}
                                valueStyle={{ color: (stats?.ping > 200) ? 'red' : 'green' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Uptime"
                                value={stats?.uptime ? (stats.uptime / 1000 / 60 / 60).toFixed(2) : 0}
                                suffix="Hours"
                            />
                        </Card>
                    </Col>
                </Row>

                <br />

                <Row gutter={[24, 24]}>
                    <Col span={12}>
                        <Card title="🚨 Emergency Controls" bordered={false} style={{ borderColor: 'red' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <span>
                                    <h3>Global Maintenance Mode</h3>
                                    <p style={{ color: '#888' }}>Shuts down all commands except for whitelisted servers.</p>
                                </span>
                                <Switch
                                    checked={config?.maintenanceMode}
                                    onChange={handleMaintenanceToggle}
                                    checkedChildren="ON"
                                    unCheckedChildren="OFF"
                                    style={{ background: config?.maintenanceMode ? 'red' : undefined }}
                                />
                            </div>
                            {config?.maintenanceMode && (
                                <Alert
                                    type="error"
                                    message="System is currently under maintenance"
                                    showIcon
                                />
                            )}
                        </Card>

                        <Card title={<span><RobotOutlined /> Bot Identity</span>} bordered={false} style={{ marginTop: 24 }}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Status</label>
                                <Select
                                    value={botStatus.status}
                                    onChange={(val) => setBotStatus({ ...botStatus, status: val })}
                                    style={{ width: '100%' }}
                                >
                                    <Select.Option value="online">Online</Select.Option>
                                    <Select.Option value="idle">Idle</Select.Option>
                                    <Select.Option value="dnd">Do Not Disturb</Select.Option>
                                    <Select.Option value="invisible">Invisible</Select.Option>
                                </Select>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Activity Type</label>
                                <Select
                                    value={botStatus.activityType}
                                    onChange={(val) => setBotStatus({ ...botStatus, activityType: val })}
                                    style={{ width: '100%' }}
                                >
                                    <Select.Option value="Playing">Playing</Select.Option>
                                    <Select.Option value="Watching">Watching</Select.Option>
                                    <Select.Option value="Listening">Listening</Select.Option>
                                    <Select.Option value="Competing">Competing</Select.Option>
                                </Select>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8 }}>Activity Text</label>
                                <Input
                                    value={botStatus.activityText}
                                    onChange={(e) => setBotStatus({ ...botStatus, activityText: e.target.value })}
                                />
                            </div>
                            <Button type="primary" onClick={handleStatusSave}>Update Presence</Button>
                        </Card>
                    </Col>

                    <Col span={12}>
                        <Card title="📢 Global Broadcast" bordered={false}>
                            <TextArea
                                rows={4}
                                value={broadcastMsg}
                                onChange={(e) => setBroadcastMsg(e.target.value)}
                                placeholder="Enter system-wide alert message..."
                            />
                            <Button
                                type="primary"
                                danger
                                icon={<WarningOutlined />}
                                style={{ marginTop: 16 }}
                                onClick={handleBroadcast}
                            >
                                Broadcast Alert
                            </Button>

                            {config?.currentAlert?.active && (
                                <Button
                                    type="default"
                                    danger
                                    style={{ marginTop: 16, marginLeft: 8 }}
                                    onClick={async () => {
                                        try {
                                            await axios.delete('/admin/broadcast');
                                            message.success('Broadcast cleared');
                                            fetchData();
                                        } catch (error) {
                                            message.error('Failed to clear broadcast');
                                        }
                                    }}
                                >
                                    Clear Broadcast
                                </Button>
                            )}
                        </Card>
                    </Col>
                </Row>

                <br />

                <Row gutter={[24, 24]}>
                    <Col span={24}>
                        <Card title={<Space><DatabaseOutlined /> Connected Servers ({stats?.servers?.length || 0})</Space>} bordered={false}>
                            <Table
                                dataSource={stats?.servers || []}
                                rowKey="id"
                                loading={loading}
                                pagination={{ pageSize: 5 }}
                                columns={[
                                    {
                                        title: 'Icon',
                                        dataIndex: 'icon',
                                        key: 'icon',
                                        render: (icon, record) => (
                                            <Avatar src={icon ? `https://cdn.discordapp.com/icons/${record.id}/${icon}.png` : null}>{record.name[0]}</Avatar>
                                        )
                                    },
                                    {
                                        title: 'Name',
                                        dataIndex: 'name',
                                        key: 'name',
                                        render: (text) => <b>{text}</b>
                                    },
                                    {
                                        title: 'ID',
                                        dataIndex: 'id',
                                        key: 'id',
                                        render: (text) => <Tag>{text}</Tag>
                                    },
                                    {
                                        title: 'Members',
                                        dataIndex: 'memberCount',
                                        key: 'members',
                                        sorter: (a, b) => a.memberCount - b.memberCount,
                                    },
                                    {
                                        title: 'Joined',
                                        dataIndex: 'joinedAt',
                                        key: 'joinedAt',
                                        render: (date) => new Date(date).toLocaleDateString()
                                    }
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default SuperAdmin;
