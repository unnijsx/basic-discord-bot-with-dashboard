import React, { useEffect, useState } from 'react';
import { Layout, Card, Switch, Statistic, Row, Col, Input, Button, Alert, message, List, Tag, Select, Table, Avatar, Tooltip, Space, Menu, Drawer } from 'antd';
import {
    ThunderboltOutlined, WarningOutlined, DatabaseOutlined, GlobalOutlined, RobotOutlined,
    UserOutlined, AppstoreOutlined, MenuOutlined, BgColorsOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const { Content, Sider } = Layout;
const { TextArea } = Input;

const SuperAdmin = () => {
    const [selectedKey, setSelectedKey] = useState('overview');
    const { user } = useAuth();
    const [config, setConfig] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [broadcastMsg, setBroadcastMsg] = useState('');

    // User Management State
    const [userSearch, setUserSearch] = useState('');
    const [userResults, setUserResults] = useState([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    useEffect(() => {
        document.title = "RHX | ADMIN";
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
            fetchData();
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

    // USER MANAGEMENT
    const fetchUsers = async () => {
        setSearchingUsers(true);
        try {
            const endpoint = userSearch ? `/admin/users?search=${userSearch}` : '/admin/users';
            const { data } = await axios.get(endpoint);
            setUserResults(data);
            if (data.length === 0 && userSearch) message.info('No users found');
        } catch (err) {
            message.error('Failed to fetch users');
        } finally {
            setSearchingUsers(false);
        }
    };

    useEffect(() => {
        if (selectedKey === 'users') {
            fetchUsers();
        }
    }, [selectedKey]);

    const handleUserSearch = fetchUsers;

    const togglePremium = async (userId, currentStatus) => {
        try {
            const { data } = await axios.put(`/admin/users/${userId}/premium`, { isPremium: !currentStatus });
            message.success(`User is now ${data.isPremium ? 'PREMIUM' : 'FREE'}`);
            setUserResults(prev => prev.map(u => u.discordId === userId ? { ...u, isPremium: data.isPremium } : u));
        } catch (err) {
            message.error('Failed to toggle premium');
        }
    };

    // MODULE CONFIG
    const handleModuleTierChange = async (moduleKey, tier) => {
        try {
            const newModuleTiers = { ...config.moduleTiers, [moduleKey]: tier };
            setConfig({ ...config, moduleTiers: newModuleTiers });
            await axios.put('/admin/system-config', { moduleTiers: newModuleTiers });
            message.success(`Set ${moduleKey} to ${tier}`);
        } catch (err) {
            message.error('Failed to update tiers');
            fetchData();
        }
    };

    // BRANDING CONFIG
    const [brandingForm, setBrandingForm] = useState({
        appName: 'Rheox',
        appLogo: '',
        primaryColor: '#ffb7c5',
        backgroundType: 'sakura',
        backgroundValue: ''
    });

    useEffect(() => {
        if (config?.branding) {
            setBrandingForm(config.branding);
        }
    }, [config]);

    const handleBrandingSave = async () => {
        try {
            await axios.put('/admin/system-config', { branding: brandingForm });
            message.success('Theme settings updated! Refresh to see changes.');
            fetchData();
            // Force reload to apply theme changes cleanly
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            message.error('Failed to update theme');
        }
    };

    // ADMIN MANAGEMENT
    const [admins, setAdmins] = useState([]);
    const [newAdminId, setNewAdminId] = useState('');
    const [loadingAdmins, setLoadingAdmins] = useState(false);

    const fetchAdmins = async () => {
        setLoadingAdmins(true);
        try {
            const { data } = await axios.get('/admin/admins');
            setAdmins(data);
        } catch (err) {
            message.error('Failed to fetch admins');
        } finally {
            setLoadingAdmins(false);
        }
    };

    const handleAddAdmin = async () => {
        if (!newAdminId) return;
        try {
            await axios.post('/admin/admins', { discordId: newAdminId });
            message.success('Admin added successfully');
            setNewAdminId('');
            fetchAdmins();
        } catch (err) {
            message.error(err.response?.data?.message || 'Failed to add admin');
        }
    };

    const handleRemoveAdmin = async (discordId) => {
        try {
            await axios.delete(`/admin/admins/${discordId}`);
            message.success('Admin removed successfully');
            fetchAdmins();
        } catch (err) {
            message.error('Failed to remove admin');
        }
    };

    useEffect(() => {
        if (selectedKey === 'admins') {
            fetchAdmins();
        }
    }, [selectedKey]);

    const hasAccess = user?.isSuperAdmin || user?.isAdmin;

    if (!hasAccess) {
        return <div style={{ padding: 50, textAlign: 'center' }}><h1>🚫 Restricted Area</h1></div>;
    }

    // MENU ITEMS
    const menuItems = [
        { key: 'overview', icon: <ThunderboltOutlined />, label: 'Overview' },
        { key: 'users', icon: <UserOutlined />, label: 'User Management' },
        { key: 'modules', icon: <AppstoreOutlined />, label: 'Module Config' },
        { key: 'theme', icon: <BgColorsOutlined />, label: 'Theme & Branding' },
        { key: 'admins', icon: <SafetyCertificateOutlined />, label: 'Manage Admins' }, // Valid for all to see list
    ];

    const renderContent = () => {
        switch (selectedKey) {
            case 'users':
                return (
                    <Card title="User & Premium Management" bordered={false}>
                        <div style={{ display: 'flex', marginBottom: 20 }}>
                            <Input
                                placeholder="Search by ID or Username"
                                value={userSearch}
                                onChange={e => setUserSearch(e.target.value)}
                                onPressEnter={handleUserSearch}
                                style={{ marginRight: 10 }}
                            />
                            <Button type="primary" onClick={handleUserSearch} loading={searchingUsers}>Search</Button>
                        </div>

                        <List
                            itemLayout="horizontal"
                            dataSource={userResults}
                            renderItem={item => (
                                <List.Item
                                    actions={[
                                        <Button
                                            type={item.isPremium ? "dashed" : "primary"}
                                            danger={item.isPremium}
                                            onClick={() => togglePremium(item.discordId, item.isPremium)}
                                        >
                                            {item.isPremium ? "Revoke Premium" : "Grant Premium"}
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={item.avatar ? `https://cdn.discordapp.com/avatars/${item.discordId}/${item.avatar}.png` : null}>{item.username[0]}</Avatar>}
                                        title={
                                            <Space>
                                                {item.username}
                                                {item.isPremium && <Tag color="gold">PREMIUM</Tag>}
                                                <Tag>{item.discordId}</Tag>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                );
            case 'modules':
                return (
                    <Card title="Premium Module Configuration" bordered={false}>
                        <p>Select which modules require Premium status.</p>
                        <List
                            bordered
                            dataSource={Object.keys(config?.moduleTiers || {})}
                            renderItem={moduleKey => {
                                const status = config?.moduleTiers[moduleKey];
                                return (
                                    <List.Item actions={[
                                        <Select
                                            value={status}
                                            style={{ width: 120 }}
                                            onChange={(val) => handleModuleTierChange(moduleKey, val)}
                                        >
                                            <Select.Option value="free">Free</Select.Option>
                                            <Select.Option value="premium">Premium</Select.Option>
                                        </Select>
                                    ]}>
                                        <List.Item.Meta
                                            title={<b>{moduleKey.toUpperCase()}</b>}
                                            description={status === 'premium' ?
                                                <Tag color="gold">PREMIUM USER ONLY</Tag> :
                                                <Tag color="green">AVAILABLE TO EVERYONE</Tag>
                                            }
                                        />
                                    </List.Item>
                                );
                            }}
                        />
                    </Card>
                );
            case 'theme':
                return (
                    <Card title="🎨 Theme & Branding" bordered={false}>
                        <Row gutter={[24, 24]}>
                            <Col span={12}>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', marginBottom: 8 }}>Application Name</label>
                                    <Input
                                        value={brandingForm.appName}
                                        onChange={(e) => setBrandingForm({ ...brandingForm, appName: e.target.value })}
                                    />
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', marginBottom: 8 }}>Primary Color (Hex)</label>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <Input
                                            type="color"
                                            value={brandingForm.primaryColor}
                                            onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                                            style={{ width: 50, padding: 0, height: 32 }}
                                        />
                                        <Input
                                            value={brandingForm.primaryColor}
                                            onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', marginBottom: 8 }}>Background Type</label>
                                    <Select
                                        value={brandingForm.backgroundType}
                                        onChange={(val) => setBrandingForm({ ...brandingForm, backgroundType: val })}
                                        style={{ width: '100%' }}
                                    >
                                        <Select.Option value="sakura">Sakura Animation (Default)</Select.Option>
                                        <Select.Option value="video">Video URL</Select.Option>
                                        <Select.Option value="image">Image URL</Select.Option>
                                        <Select.Option value="gradient">CSS Gradient</Select.Option>
                                    </Select>
                                </div>
                                {brandingForm.backgroundType !== 'sakura' && (
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', marginBottom: 8 }}>
                                            {brandingForm.backgroundType === 'gradient' ? 'CSS Gradient Value' : 'Media URL'}
                                        </label>
                                        <Input
                                            placeholder={brandingForm.backgroundType === 'gradient' ? 'linear-gradient(...)' : 'https://...'}
                                            value={brandingForm.backgroundValue}
                                            onChange={(e) => setBrandingForm({ ...brandingForm, backgroundValue: e.target.value })}
                                        />
                                    </div>
                                )}
                            </Col>
                            <Col span={12}>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', marginBottom: 8 }}>App Logo URL</label>
                                    <Input
                                        value={brandingForm.appLogo}
                                        onChange={(e) => setBrandingForm({ ...brandingForm, appLogo: e.target.value })}
                                    />
                                    {brandingForm.appLogo && (
                                        <img src={brandingForm.appLogo} alt="Preview" style={{ marginTop: 10, maxHeight: 50 }} />
                                    )}
                                </div>
                                <Alert
                                    message="Theme Changes"
                                    description="Updating the theme will refresh the page for you. All connected users will see the changes on their next reload."
                                    type="info"
                                    showIcon
                                />
                                <Button type="primary" size="large" onClick={handleBrandingSave} style={{ marginTop: 20, width: '100%' }}>
                                    Save Theme Settings
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                );
            case 'admins':
                return (
                    <Card title="🛡️ Admin Management" bordered={false}>
                        {user?.isSuperAdmin && (
                            <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
                                <Input
                                    placeholder="Enter Discord ID to promote"
                                    value={newAdminId}
                                    onChange={(e) => setNewAdminId(e.target.value)}
                                    style={{ maxWidth: 300 }}
                                />
                                <Button type="primary" onClick={handleAddAdmin} icon={<SafetyCertificateOutlined />}>
                                    Add Admin
                                </Button>
                            </div>
                        )}
                        {!user?.isSuperAdmin && (
                            <Alert
                                message="ReadOnly Access"
                                description="You can view the admin list, but only Super Admins can add or remove administrators."
                                type="info"
                                showIcon
                                style={{ marginBottom: 20 }}
                            />
                        )}
                        <List
                            loading={loadingAdmins}
                            itemLayout="horizontal"
                            dataSource={admins}
                            bordered
                            renderItem={item => (
                                <List.Item
                                    actions={user?.isSuperAdmin ? [
                                        <Button danger onClick={() => handleRemoveAdmin(item.discordId)}>Remove</Button>
                                    ] : []}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={`https://cdn.discordapp.com/avatars/${item.discordId}/${item.avatar}.png`} />}
                                        title={item.username}
                                        description={<Tag color="blue">{item.discordId}</Tag>}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                );
            default: // overview
                return (
                    <>
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
                                ]}
                            />
                        </Card>
                    </>
                );
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Desktop Sidebar */}
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                style={{ background: '#111214', borderRight: '1px solid #2f3136' }}
            >
                <div style={{ padding: '20px', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                    <RobotOutlined style={{ marginRight: 10 }} /> Admin
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    onClick={({ key }) => setSelectedKey(key)}
                    items={menuItems}
                    style={{ background: 'transparent' }}
                />
                <div style={{ position: 'absolute', bottom: 20, width: '100%', padding: '0 20px' }}>
                    <Button type="default" block href="/dashboard">Exit Admin</Button>
                </div>
            </Sider>

            <Layout>
                <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
                    <div style={{ padding: 24, background: '#1e1f22', minHeight: 360, borderRadius: 8 }}>
                        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, color: '#fff' }}>
                                {menuItems.find(i => i.key === selectedKey)?.label}
                            </h2>
                        </div>
                        {renderContent()}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default SuperAdmin;
