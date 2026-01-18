import React, { useEffect, useState } from 'react';
import { Layout, Card, Switch, Statistic, Row, Col, Input, Button, Alert, message, List, Tag } from 'antd';
import { ThunderboltOutlined, WarningOutlined, DatabaseOutlined, GlobalOutlined } from '@ant-design/icons';
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
                        </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default SuperAdmin;
