import React from 'react';
import { Button, Typography } from 'antd';
import { LoginOutlined, ToolOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;

const Container = styled.div`
    height: 100vh;
    width: 100%;
    background-color: #000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: #fff;
    padding: 20px;
    background-image: radial-gradient(circle at 50% 50%, #2a2a2a 0%, #000 100%);
`;

const Maintenance = () => {
    return (
        <Container>
            <div style={{ fontSize: 64, marginBottom: 20, color: '#f5222d' }}>
                <ToolOutlined spin />
            </div>
            <Title level={1} style={{ color: '#fff', marginBottom: 16 }}>Under Maintenance</Title>
            <Text style={{ color: '#aaa', fontSize: 18, maxWidth: 600, display: 'block', marginBottom: 40 }}>
                We are currently performing scheduled maintenance to improve our services.
                Please check back soon.
            </Text>

            <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                onClick={() => window.location.href = '/login'}
                ghost
            >
                Admin Login
            </Button>
        </Container>
    );
};

export default Maintenance;
