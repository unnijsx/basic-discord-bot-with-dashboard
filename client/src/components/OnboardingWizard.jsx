import React, { useState } from 'react';
import { Modal, Radio, Steps, Button, Typography, Card, Result, Space } from 'antd';
import {
    RocketOutlined,
    TeamOutlined,
    CustomerServiceOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import axios from '../api/axios';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const OptionCard = styled(Card)`
  cursor: pointer;
  border: 2px solid ${props => props.selected ? '#5865F2' : 'transparent'};
  transition: all 0.3s;
  background: #2f3136;
  text-align: center;
  
  &:hover {
    transform: translateY(-5px);
    border-color: #5865F2;
  }

  .ant-card-body {
    padding: 12px;
  }
`;

const OnboardingWizard = ({ visible, onClose, guildId, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [serverType, setServerType] = useState(null);
    const [loading, setLoading] = useState(false);

    const presets = {
        community: {
            name: 'Community / Social',
            icon: <TeamOutlined style={{ fontSize: 32, color: '#4caf50' }} />,
            desc: 'Balanced moderation, leveling enabled, welcome messages.',
            modules: { moderation: true, leveling: true, music: true, welcome: true }
        },
        gaming: {
            name: 'Gaming',
            icon: <CustomerServiceOutlined style={{ fontSize: 32, color: '#f44336' }} />,
            desc: 'Heavy moderation, music bot priority, competitive leveling.',
            modules: { moderation: true, leveling: true, music: true, welcome: false }
        },
        minimal: {
            name: 'Minimal / Professional',
            icon: <SafetyCertificateOutlined style={{ fontSize: 32, color: '#2196f3' }} />,
            desc: 'Strict moderation only. No fun features.',
            modules: { moderation: true, leveling: false, music: false, welcome: false }
        }
    };

    const handleApply = async () => {
        setLoading(true);
        try {
            const selectedPreset = presets[serverType];

            // Update Guild Config
            await axios.put(`/guilds/${guildId}/onboarding`, {
                configured: true,
                modules: selectedPreset.modules,
                preset: serverType
            });

            setCurrentStep(2); // Success step
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Onboarding failed', error);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: 'Welcome',
            content: (
                <div style={{ textAlign: 'center' }}>
                    <RocketOutlined style={{ fontSize: 64, color: '#5865F2', marginBottom: 24 }} />
                    <Title level={3} style={{ color: '#fff' }}>Let's set up your server</Title>
                    <Paragraph style={{ color: '#aaa' }}>
                        We detected this is your first time. Answer a few questions to auto-configure the bot for your needs.
                    </Paragraph>
                </div>
            )
        },
        {
            title: 'Server Type',
            content: (
                <div>
                    <Paragraph style={{ color: '#aaa', textAlign: 'center', marginBottom: 24 }}>
                        What best describes your community?
                    </Paragraph>
                    <Space direction="horizontal" size="large" style={{ display: 'flex', justifyContent: 'center' }}>
                        {Object.entries(presets).map(([key, data]) => (
                            <OptionCard
                                key={key}
                                selected={serverType === key}
                                onClick={() => setServerType(key)}
                                style={{ width: 140 }}
                            >
                                {data.icon}
                                <div style={{ marginTop: 12, fontWeight: 'bold' }}>{data.name}</div>
                                <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{data.desc}</div>
                            </OptionCard>
                        ))}
                    </Space>
                </div>
            )
        },
        {
            title: 'Done',
            content: (
                <Result
                    status="success"
                    title="Setup Complete!"
                    subTitle="Your server has been configured with the best practices."
                    extra={[
                        <Button type="primary" key="console" onClick={onClose}>
                            Go to Dashboard
                        </Button>
                    ]}
                />
            )
        }
    ];

    return (
        <Modal
            open={visible}
            footer={null}
            closable={false}
            maskClosable={false}
            width={700}
            styles={{ body: { background: '#36393f', padding: 40 } }}
            style={{ top: 50 }}
        >
            <Steps current={currentStep} style={{ marginBottom: 40 }}>
                {steps.map((item) => <Step key={item.title} title={item.title} />)}
            </Steps>

            <div style={{ minHeight: 250, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {steps[currentStep].content}
            </div>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
                {currentStep === 0 && (
                    <Button type="primary" onClick={() => setCurrentStep(1)}>
                        Start Setup
                    </Button>
                )}
                {currentStep === 1 && (
                    <Button
                        type="primary"
                        disabled={!serverType}
                        loading={loading}
                        onClick={handleApply}
                    >
                        Apply Configuration
                    </Button>
                )}
            </div>
        </Modal>
    );
};

export default OnboardingWizard;
