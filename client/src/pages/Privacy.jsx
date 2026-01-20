import React from 'react';
import { Typography } from 'antd';
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

const Privacy = () => {
    return (
        <Container>
            <PremiumNavbar />
            <Title style={{ color: '#ffb7c5', fontSize: '3rem', textAlign: 'center' }}>Privacy Policy</Title>
            <Paragraph style={{ color: '#ccc', textAlign: 'center', marginBottom: 60 }}>
                Last updated: {new Date().toLocaleDateString()}
            </Paragraph>

            <Section>
                <Title level={3} style={{ color: '#fff' }}>1. Data Collection</Title>
                <Paragraph style={{ color: '#ccc' }}>
                    We collect basic user information (Discord ID, username) and server data (Guild IDs) to provide our services. We do not store sensitive personal messages.
                </Paragraph>
            </Section>

            <Section>
                <Title level={3} style={{ color: '#fff' }}>2. Data Usage</Title>
                <Paragraph style={{ color: '#ccc' }}>
                    Collected data is used solely for the operation and improvement of Rheox features, such as moderation logs, music queues, and leaderboards.
                </Paragraph>
            </Section>

            <Section>
                <Title level={3} style={{ color: '#fff' }}>3. Third-Party Sharing</Title>
                <Paragraph style={{ color: '#ccc' }}>
                    We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.
                </Paragraph>
            </Section>
        </Container>
    );
};

export default Privacy;
