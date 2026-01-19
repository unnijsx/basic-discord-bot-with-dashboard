import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, theme, Drawer, Button, Grid } from 'antd';
import {
    DashboardOutlined,
    SettingOutlined,
    LogoutOutlined,
    CustomerServiceOutlined,
    SafetyCertificateOutlined,
    BarChartOutlined,
    FileTextOutlined,
    MessageOutlined,
    ToolOutlined,
    FormOutlined,
    CalendarOutlined,
    MenuOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useBranding } from '../../context/BrandingContext';

const { Header, Sider, Content } = Layout;

const StyledHeader = styled(Header)`
    padding: 0 32px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    background: #00000000 !important; /* Transparent to let body gradient show or blend */
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    z-index: 10;
`;

const StyledSider = styled(Sider)`
    background: #09090b !important; /* Deep zinc/black */
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    
    .ant-layout-sider-trigger {
        background: #09090b !important;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .logo {
        height: 80px; /* Taller header area */
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
        font-weight: 800;
        letter-spacing: 1px;
        color: #fff;
        background: linear-gradient(135deg, #5865F2, #a084dc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        margin-bottom: 10px;
    }
`;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { token } = theme.useToken();
    const navigate = useNavigate();
    const location = useLocation();
    const { guildId } = useParams();
    const { appName, appLogo } = useBranding();
    const screens = Grid.useBreakpoint();

    // Determine if we are on mobile based on screens.md
    // screens.md is true if width >= 768px.
    const isMobile = !screens.md;

    // Simplified responsive logic:
    // If width < 768px (md), sidebar is hidden and we show hamburger.

    // Let's rely on CSS media queries or a hook.

    // Let's use a simple state synced with window for now or just Antd's `breakpoint` prop on Sider, 
    // but we want a Drawer for mobile, not just a collapsed Sider.

    // We will render Drawer on small screens and Sider on large screens.

    const items = [
        {
            key: `/dashboard/${guildId}`,
            icon: <DashboardOutlined />,
            label: 'Overview',
        },
        {
            key: `/dashboard/${guildId}/analytics`,
            icon: <BarChartOutlined />,
            label: 'Analytics',
        },
        {
            key: 'modules',
            label: 'Modules',
            type: 'group',
            children: [
                { key: `/dashboard/${guildId}/moderation`, icon: <SafetyCertificateOutlined />, label: 'Moderation' },
                { key: `/dashboard/${guildId}/music`, icon: <CustomerServiceOutlined />, label: 'Music' },
                { key: `/dashboard/${guildId}/analytics`, icon: <BarChartOutlined />, label: 'Analytics' },
                { key: `/dashboard/${guildId}/logs`, icon: <FileTextOutlined />, label: 'Audit Logs' },
                { type: 'divider' },
                { key: `/dashboard/${guildId}/messages`, icon: <MessageOutlined />, label: 'Embed Builder' },
                { key: `/dashboard/${guildId}/forms`, icon: <FormOutlined />, label: 'Forms' },
                { key: `/dashboard/${guildId}/scheduled-messages`, icon: <CalendarOutlined />, label: 'Scheduled Msgs' },
                { key: `/dashboard/${guildId}/management`, icon: <ToolOutlined />, label: 'Server Management' },

            ]
        },
        {
            key: `/dashboard/${guildId}/privacy`,
            icon: <SafetyCertificateOutlined />,
            label: 'Data Privacy',
        },
        {
            key: `/dashboard/${guildId}/settings`,
            icon: <SettingOutlined />,
            label: 'Settings',
        },
    ];

    const menuProps = {
        items: [
            {
                key: 'servers',
                label: 'Switch Server',
                onClick: () => navigate('/dashboard')
            },
            {
                key: 'logout',
                label: 'Logout',
                icon: <LogoutOutlined />,
                onClick: () => window.location.href = '/api/auth/logout'
            }
        ]
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#121212' }} hasSider>
            {/* Desktop Sider - Hidden on Mobile */}
            {!isMobile && (
                <StyledSider
                    width={260}
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    trigger={null}
                >
                    <div className="logo">
                        {!collapsed ? appName.toUpperCase() : appName.charAt(0).toUpperCase()}
                    </div>
                    <Menu
                        theme="dark"
                        mode="inline"
                        defaultSelectedKeys={[location.pathname]}
                        items={items}
                        onClick={({ key }) => navigate(key)}
                        style={{ background: 'transparent' }}
                    />
                </StyledSider>
            )}

            {/* Mobile Drawer */}
            <Drawer
                placement="left"
                onClose={() => setMobileOpen(false)}
                open={mobileOpen}
                styles={{ body: { padding: 0, background: '#09090b' }, wrapper: { width: 260 } }}
                closable={false}
            >
                <div style={{ height: 80, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: 20, fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {appName.toUpperCase()}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={[location.pathname]}
                    items={items}
                    onClick={({ key }) => {
                        navigate(key);
                        setMobileOpen(false);
                    }}
                    style={{ background: 'transparent' }}
                />
            </Drawer>

            <Layout>
                <StyledHeader style={{ justifyContent: 'space-between', paddingLeft: 16 }}>
                    {/* Mobile Menu Button */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {isMobile && (
                            <Button
                                type="text"
                                icon={<MenuOutlined style={{ color: '#fff', fontSize: 18 }} />}
                                onClick={() => setMobileOpen(true)}
                                style={{ marginRight: 16 }}
                            />
                        )}
                    </div>

                    <Dropdown menu={menuProps} placement="bottomRight">
                        <Avatar style={{ backgroundColor: token.colorPrimary, cursor: 'pointer' }}>A</Avatar>
                    </Dropdown>
                </StyledHeader>
                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, overflow: 'initial' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
