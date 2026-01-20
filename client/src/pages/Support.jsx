import React from 'react';
import PremiumNavbar from '../components/Layout/PremiumNavbar';
import { Typography, Collapse, Button, Card } from 'antd';
import styled from 'styled-components';
import { DiscordOutlined, QuestionCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const Container = styled.div`
    padding: 80px 50px;
    background: #121212;
    min-height: 100vh;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const StyledCollapse = styled(Collapse)`
    background: transparent;
    border: none;
    width: 100%;
    max-width: 800px;
    
    .ant-collapse-item {
        border-bottom: 1px solid #2b2d31;
        margin-bottom: 16px; 
    }
    .ant-collapse-header {
        color: #fff !important;
        font-size: 1.1rem;
    }
    .ant-collapse-content {
        background: #1e1f22;
        border-top: none;
        color: #b9bbbe;
    }
`;

const Support = () => {
    return (
        <Container>
            <PremiumNavbar />
            <Title style={{ color: '#fff' }}>Support & FAQ</Title>
            <Text style={{ color: '#b9bbbe', fontSize: '1.2rem', marginBottom: 40 }}>
                Have questions? We have answers.
            </Text>

            <Card style={{ background: '#5865F2', border: 'none', width: '100%', maxWidth: 800, textAlign: 'center', marginBottom: 60 }}>
                <Title level={3} style={{ color: '#fff', margin: 0 }}>Need direct help?</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.8)', margin: '10px 0 20px 0' }}>
                    Join our official support server to chat with our team.
                </Paragraph>
                <Button
                    size="large"
                    icon={<DiscordOutlined />}
                    style={{ color: '#5865F2', fontWeight: 'bold' }}
                    onClick={() => window.open('https://discord.gg/your-support-server', '_blank')}
                >
                    Join Discord
                </Button>
            </Card>

            <StyledCollapse defaultActiveKey={['1']}>
                <Panel header="How do I add the bot to my server?" key="1">
                    <p>Simply go to the dashboard, click "Servers" and look for the "Invite Bot" button on your server card.</p>
                </Panel>
                <Panel header="Is the music feature free?" key="2">
                    <p>Yes! High-quality music playback is available for all servers completely free of charge.</p>
                </Panel>
                <Panel header="How do I set up auto-moderation?" key="3">
                    <p>Head to your server dashboard, select the "Moderation" module, and toggle on the features you need in the "Auto-Mod" tab.</p>
                </Panel>
            </StyledCollapse>
        </Container>
    );
};

export default Support;
