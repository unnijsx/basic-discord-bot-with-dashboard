import React, { useEffect, useState } from 'react';
import { Typography, Table, Tag, Empty } from 'antd';
import axios from '../api/axios';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

const { Title } = Typography;

const PageContainer = styled.div`
    padding: 24px;
`;

const Suggestions = () => {
    const { guildId } = useParams();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Placeholder fetch - we haven't built the GET /suggestions endpoint yet
    // Implementation Plan mentioned Kanban board, but for MVP let's show list

    return (
        <PageContainer>
            <Title level={2} style={{ color: '#fff' }}>Suggestions</Title>
            <Empty
                description={<span style={{ color: '#b9bbbe' }}>Suggestion review panel coming soon. Use /suggest command in Discord.</span>}
                style={{ marginTop: 50 }}
            />
        </PageContainer>
    );
};

export default Suggestions;
