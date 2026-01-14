import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { UserOutlined, MessageOutlined, CustomerServiceOutlined } from '@ant-design/icons';

const DashboardHome = () => {
    return (
        <div>
            <h1 style={{ color: '#fff' }}>Server Overview</h1>
            <Row gutter={16}>
                <Col span={8}>
                    <Card variant="borderless">
                        <Statistic
                            title="Active Members"
                            value={1128}
                            prefix={<UserOutlined />}
                            inputStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless">
                        <Statistic
                            title="Messages Today"
                            value={93}
                            prefix={<MessageOutlined />}
                            inputStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless">
                        <Statistic
                            title="Songs Queued"
                            value={5}
                            prefix={<CustomerServiceOutlined />}
                            inputStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardHome;
