import React from 'react';
import styled from 'styled-components';
import { Button, Typography, Space, Avatar, Drawer, Grid } from 'antd';
import { RocketOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import { useState } from 'react';

const { Title } = Typography;
const { useBreakpoint } = Grid;

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  /* width: 100% caused overflow with padding */
  box-sizing: border-box;
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
    const screens = useBreakpoint();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isMobile = !screens.md;

    const handleLogout = () => {
        window.location.href = '/api/auth/logout';
    };

    const NavLinks = () => (
        <>
            {!user && (
                <>
                    <Button type="text" style={{ color: '#ccc', fontSize: isMobile ? '1.2rem' : '1rem' }} onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}>About</Button>
                    <Button type="text" style={{ color: '#ccc', fontSize: isMobile ? '1.2rem' : '1rem' }} onClick={() => { navigate('/support'); setMobileMenuOpen(false); }}>Support</Button>
                </>
            )}

            {user ? (
                showLogout ? (
                    <Button shape="round" danger ghost onClick={handleLogout} icon={<LogoutOutlined />} size={isMobile ? 'large' : 'middle'}>
                        Logout
                    </Button>
                ) : (
                    <Button shape="round" ghost style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }} onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} size={isMobile ? 'large' : 'middle'}>
                        Dashboard
                    </Button>
                )
            ) : (
                <Button shape="round" ghost style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }} onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} size={isMobile ? 'large' : 'middle'}>
                    Login
                </Button>
            )}
        </>
    );

    return (
        <NavbarContainer>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, cursor: 'pointer' }} onClick={() => navigate('/')}>
                {appLogo ? <img src={appLogo} alt="Logo" style={{ width: 40, height: 40, borderRadius: '50%' }} /> : <RocketOutlined style={{ fontSize: 30, color: '#5865F2' }} />}
                <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 800, letterSpacing: 1 }}>{appName.toUpperCase()}</Title>
            </div>

            {isMobile ? (
                <>
                    <Button type="text" icon={<MenuOutlined style={{ color: '#fff', fontSize: '1.5rem' }} />} onClick={() => setMobileMenuOpen(true)} />
                    <Drawer
                        title={<span style={{ color: '#fff' }}>Menu</span>}
                        placement="right"
                        onClose={() => setMobileMenuOpen(false)}
                        open={mobileMenuOpen}
                        styles={{ body: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#0a0a0a' }, header: { background: '#0a0a0a', borderBottom: '1px solid #333' } }}
                        closeIcon={<span style={{ color: '#fff' }}>X</span>}
                        width={280}
                    >
                        <NavLinks />
                    </Drawer>
                </>
            ) : (
                <Space size="middle">
                    <NavLinks />
                </Space>
            )}
        </NavbarContainer>
    );
};

export default PremiumNavbar;
