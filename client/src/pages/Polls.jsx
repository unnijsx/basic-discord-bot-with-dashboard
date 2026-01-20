import React from 'react';
import { Typography, Empty } from 'antd';
import styled from 'styled-components';

const { Title } = Typography;

const PageContainer = styled.div`
    padding: 24px;
`;

const Polls = () => {
    return (
        <PageContainer>
            <Title level={2} style={{ color: '#fff' }}>Active Polls</Title>
            <Empty
                description={<span style={{ color: '#b9bbbe' }}>Poll management coming soon to dashboard. Currently only available via /poll command.</span>}
                style={{ marginTop: 50 }}
            />
        </PageContainer>
    );
};

export default Polls;
