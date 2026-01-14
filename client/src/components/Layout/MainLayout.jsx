import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, theme } from 'antd';
import {
    DashboardOutlined,
    SettingOutlined,
    LogoutOutlined,
    CustomerServiceOutlined,
    SafetyCertificateOutlined,
    BarChartOutlined,
    MessageOutlined,
    ToolOutlined,

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
    const { token } = theme.useToken();
    const navigate = useNavigate();
    const location = useLocation();
    const { guildId } = useParams();
    const { appName, appLogo } = useBranding();

    const items = [
        {
            key: `/dashboard/${guildId}`,
            icon: <DashboardOutlined />,
            label: 'Overview',
        },
        {
            key: 'modules',
            label: 'Modules',
            type: 'group',
            children: [
                { key: `/dashboard/${guildId}/moderation`, icon: <SafetyCertificateOutlined />, label: 'Moderation' },
                { key: `/dashboard/${guildId}/music`, icon: <CustomerServiceOutlined />, label: 'Music' },
                { key: `/dashboard/${guildId}/leveling`, icon: <BarChartOutlined />, label: 'Leveling' },
                { key: `/dashboard/${guildId}/messages`, icon: <MessageOutlined />, label: 'Embed Builder' },
                { key: `/dashboard/${guildId}/management`, icon: <ToolOutlined />, label: 'Server Management' },

            ]
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
                onClick: () => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/logout`
            }
        ]
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#121212' }} hasSider>
            <StyledSider width={260} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
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
            <Layout>
                <StyledHeader>
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
