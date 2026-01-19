import React from 'react';
import styled from 'styled-components';
import { Button, Typography, Space, Avatar } from 'antd';
import { RocketOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';

const { Title } = Typography;

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  width: 100%;
  padding: 20px 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  @media (max-width: 768px) {
    padding: 15px 20px;
  }
`;

const PremiumNavbar = ({ showLogout = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { appName, appLogo } = useBranding();

    const handleLogout = () => {
        window.location.href = '/api/auth/logout';
    };

    return (
        <NavbarContainer>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, cursor: 'pointer' }} onClick={() => navigate('/')}>
                {appLogo ? <img src={appLogo} alt="Logo" style={{ width: 40, height: 40, borderRadius: '50%' }} /> : <RocketOutlined style={{ fontSize: 30, color: '#5865F2' }} />}
                <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 800, letterSpacing: 1 }}>{appName.toUpperCase()}</Title>
            </div>
            <Space>
                {/* Only show nav links if NOT on dashboard/selector to avoid clutter, or maybe always show? */}
                {/* For Server Selector, we might want simple links to Dashboard or Home */}

                {!user && (
                    <>
                        <Button type="link" style={{ color: '#ccc' }} onClick={() => navigate('/about')}>About</Button>
                        <Button type="link" style={{ color: '#ccc' }} onClick={() => navigate('/support')}>Support</Button>
                    </>
                )}

                {user ? (
                    showLogout ? (
                        <Button shape="round" danger ghost onClick={handleLogout} icon={<LogoutOutlined />}>
                            Logout
                        </Button>
                    ) : (
                        <Button shape="round" ghost style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }} onClick={() => navigate('/dashboard')}>
                            Dashboard
                        </Button>
                    )
                ) : (
                    <Button shape="round" ghost style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }} onClick={() => navigate('/login')}>
                        Login
                    </Button>
                )}
            </Space>
        </NavbarContainer>
    );
};

export default PremiumNavbar;
