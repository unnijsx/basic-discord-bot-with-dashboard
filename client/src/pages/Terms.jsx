import React from 'react';
import { Typography, Card } from 'antd';
import styled from 'styled-components';
import PremiumNavbar from '../components/Layout/PremiumNavbar';

const { Title, Paragraph } = Typography;

const Container = styled.div`
    padding: 100px 50px;
    min-height: 100vh;
    color: #fff;
    max-width: 900px;
    margin: 0 auto;
`;

const Section = styled.div`
    margin-bottom: 40px;
`;

const Terms = () => {
    return (
        <Container>
            <PremiumNavbar />
            <Title style={{ color: '#ffb7c5', fontSize: '3rem', textAlign: 'center' }}>Terms of Service</Title>
            <Paragraph style={{ color: '#ccc', textAlign: 'center', marginBottom: 60 }}>
                Last updated: {new Date().toLocaleDateString()}
            </Paragraph>

            <Section>
                <Title level={3} style={{ color: '#fff' }}>1. Acceptance of Terms</Title>
                <Paragraph style={{ color: '#ccc' }}>
                    By accessing or using Rheox, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </Paragraph>
            </Section>

            <Section>
                <Title level={3} style={{ color: '#fff' }}>2. Usage Restrictions</Title>
                <Paragraph style={{ color: '#ccc' }}>
                    You agree not to use Rheox for any unlawful purpose or in any way that interrupts, damages, or impairs the service.
                </Paragraph>
            </Section>

            <Section>
                <Title level={3} style={{ color: '#fff' }}>3. Limitation of Liability</Title>
                <Paragraph style={{ color: '#ccc' }}>
                    Rheox is provided "as is" without any warranties. We are not liable for any damages arising from your use of the bot or dashboard.
                </Paragraph>
            </Section>
        </Container>
    );
};

export default Terms;
