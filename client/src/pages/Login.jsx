import React from 'react';
import { Button, Typography, Layout, Space } from 'antd';
import { LoginOutlined, SmileFilled } from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { useBranding } from '../context/BrandingContext';

const { Title, Text } = Typography;
const { Content } = Layout;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const LoginContainer = styled(Content)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: radial-gradient(circle at top right, #1a1b1e 0%, #000000 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, ${props => props.color}22 10%, transparent 60%);
    animation: ${float} 20s infinite ease-in-out;
  }
`;

const GlassCard = styled.div`
  width: 450px;
  padding: 50px 40px;
  text-align: center;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  z-index: 10;
  
  transition: transform 0.3s ease;
  &:hover {
    transform: translateY(-5px);
  }
`;

const LogoImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px ${props => props.color}66;
`;

const Login = () => {
    const { appName, appLogo, themeColor } = useBranding();

    const handleLogin = () => {
        window.location.href = '/api/auth/discord';
    };

    return (
        <LoginContainer color={themeColor}>
            <GlassCard>
                {appLogo ? (
                    <LogoImage src={appLogo} alt="Logo" color={themeColor} />
                ) : (
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>
                        <SmileFilled style={{ color: themeColor }} />
                    </div>
                )}

                <Title level={1} style={{ color: '#fff', marginBottom: '8px', fontWeight: 700, letterSpacing: '-0.5px' }}>
                    {appName}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', display: 'block', marginBottom: '40px' }}>
                    The ultimate dashboard for your community.
                </Text>

                <Button
                    type="primary"
                    icon={<LoginOutlined />}
                    size="large"
                    onClick={handleLogin}
                    style={{
                        width: '100%',
                        height: '56px',
                        fontSize: '18px',
                        fontWeight: 600,
                        borderRadius: '16px',
                        background: themeColor,
                        border: 'none',
                        boxShadow: `0 10px 20px ${themeColor}44`
                    }}
                >
                    Login with Discord
                </Button>

                <div style={{ marginTop: '30px' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                        Protected by secure OAuth2 via Discord Inc.
                    </Text>
                </div>
            </GlassCard>
        </LoginContainer>
    );
};

export default Login;
