import React from 'react';
import { Typography, Empty } from 'antd';
import styled from 'styled-components';

const { Title } = Typography;

const PageContainer = styled.div`
    padding: 24px;
`;

const Roles = () => {
    return (
        <PageContainer>
            <Title level={2} style={{ color: '#fff' }}>Role Management</Title>
            <Empty
                description={<span style={{ color: '#b9bbbe' }}>Reaction Role Configurator coming soon. Use /reactionrole command in Discord.</span>}
                style={{ marginTop: 50 }}
            />
        </PageContainer>
    );
};

export default Roles;
