import React, { useEffect, useState } from 'react';
import { Typography, Table, Card, Row, Col, Statistic, Avatar, Tag, Button, Modal, Form, InputNumber } from 'antd';
import { useParams } from 'react-router-dom';
import { TrophyOutlined, DollarOutlined, BankOutlined, PlusOutlined } from '@ant-design/icons';
import axios from '../api/axios';
import styled from 'styled-components';

const { Title, Text } = Typography;

const PageContainer = styled.div`
    padding: 24px;
`;

const StyledCard = styled(Card)`
    background: #2f3136;
    border-color: #202225;
    .ant-card-head {
        border-bottom: 1px solid #202225;
        color: #fff;
    }
    .ant-table {
        background: transparent;
        color: #fff;
    }
    .ant-table-thead > tr > th {
        background: #202225;
        color: #b9bbbe;
        border-bottom: none;
    }
    .ant-table-tbody > tr > td {
        border-bottom: 1px solid #202225;
        color: #fff;
    }
    .ant-table-tbody > tr:hover > td {
        background: #36393f !important;
    }
    .ant-empty-description {
        color: #b9bbbe;
    }
`;

const Economy = () => {
    // const { guildId } = useParams(); // Start with global leaderboard for now as per schema
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

    useEffect(() => {
        const fetchEconomy = async () => {
            try {
                // Determine if we want global or server-specific. 
                // For MVP, the economy is global, so we fetch global leaderboard.
                const res = await axios.get('/economy/leaderboard');
                setLeaderboard(res.data);
            } catch (error) {
                console.error('Failed to load economy data');
            } finally {
                setLoading(false);
            }
        };
        fetchEconomy();
    }, []);

    const columns = [
        {
            title: 'Rank',
            key: 'rank',
            render: (text, record, index) => {
                let color = '#b9bbbe';
                if (index === 0) color = '#FFD700'; // Gold
                if (index === 1) color = '#C0C0C0'; // Silver
                if (index === 2) color = '#CD7F32'; // Bronze
                return <TrophyOutlined style={{ color, fontSize: '18px' }} />;
            },
            width: 80,
            align: 'center',
        },
        {
            title: 'User',
            dataIndex: 'userId', // In real app, we'd populate username from Discord ID
            key: 'user',
            render: (text) => <Text style={{ color: '#fff' }}>{text}</Text>
        },
        {
            title: 'Wallet',
            dataIndex: 'wallet',
            key: 'wallet',
            render: (val) => <Tag color="#2ecc71"><DollarOutlined /> {val.toLocaleString()}</Tag>,
            sorter: (a, b) => a.wallet - b.wallet,
        },
        {
            title: 'Bank',
            dataIndex: 'bank',
            key: 'bank',
            render: (val) => <Tag color="#3498db"><BankOutlined /> {val.toLocaleString()}</Tag>,
            sorter: (a, b) => a.bank - b.bank,
        },
        {
            title: 'Net Worth',
            key: 'total',
            render: (_, record) => (
                <Text strong style={{ color: '#f1c40f' }}>
                    ${(record.wallet + record.bank).toLocaleString()}
                </Text>
            ),
            sorter: (a, b) => (a.wallet + a.bank) - (b.wallet + b.bank),
        }
    ];

    return (
        <PageContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ color: '#fff', margin: 0 }}>Global Economy</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsManageModalOpen(true)}>
                    Manage User Balance
                </Button>
            </div>

            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <StyledCard title={<span style={{ color: '#fff' }}>Richest Members</span>}>
                        <Table
                            dataSource={leaderboard}
                            columns={columns}
                            rowKey="_id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </StyledCard>
                </Col>
            </Row>

            <Modal
                title="Manage User Balance"
                open={isManageModalOpen}
                onCancel={() => setIsManageModalOpen(false)}
                footer={null}
            >
                <p>To be implemented: Admin control to add/remove money.</p>
            </Modal>
        </PageContainer>
    );
};

export default Economy;
