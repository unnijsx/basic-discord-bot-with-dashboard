import React, { useEffect, useState } from 'react';
import { Form, Switch, Input, Button, Card, message, Tabs } from 'antd';
import api from '../../api/axios';
import { useParams } from 'react-router-dom';

const { TextArea } = Input;

const Leveling = () => {
    const { guildId } = useParams();
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get(`/guilds/${guildId}/settings`);
                form.setFieldsValue({
                    enabled: data.modules.leveling,
                    levelUpMessage: data.levelingConfig.levelUpMessage,
                    levelUpChannelId: data.levelingConfig.levelUpChannelId
                });
            } catch (error) {
                message.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [guildId]);

    const onFinish = async (values) => {
        try {
            await api.put(`/guilds/${guildId}/settings`, {
                modules: { leveling: values.enabled },
                levelingConfig: {
                    levelUpMessage: values.levelUpMessage,
                    levelUpChannelId: values.levelUpChannelId
                }
            }); // Ensure cookies are sent
            message.success('Settings saved successfully!');
        } catch (error) {
            message.error('Failed to save settings');
        }
    };

    return (
        <Card variant="outlined">
            <Tabs defaultActiveKey="1" items={[
                {
                    key: '1',
                    label: 'Settings',
                    children: (
                        <Form form={form} layout="vertical" onFinish={onFinish}>
                            <Form.Item name="enabled" label="Enable Leveling Module" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                            <Form.Item label="Level Up Message">
                                <Form.Item name="levelUpMessage" noStyle>
                                    <TextArea placeholder="Congratulations {user}, you reached level {level}!" rows={2} />
                                </Form.Item>
                                <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>Variables: &#123;user&#125;, &#123;level&#125;</div>
                            </Form.Item>
                            <Form.Item name="levelUpChannelId" label="Level Up Channel ID">
                                <Input placeholder="Leave empty for current channel" />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">Save Changes</Button>
                            </Form.Item>
                        </Form>
                    )
                },
                {
                    key: '2',
                    label: 'Leaderboard',
                    children: <LeaderboardView guildId={guildId} />
                }
            ]} />
        </Card>
    );
};

// Sub-component for Leaderboard
import { Table, Avatar as Av } from 'antd';
const LeaderboardView = ({ guildId }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/guilds/${guildId}/leaderboard`)
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    }, [guildId]);

    const columns = [
        { title: 'Rank', render: (_, __, index) => index + 1 },
        {
            title: 'User',
            dataIndex: 'username',
            render: (text, record) => (
                <div style={{ display: 'flex', items: 'center', gap: '10px' }}>
                    <Av src={record.avatarURL} />
                    <span>{text}</span>
                </div>
            )
        },
        { title: 'Level', dataIndex: 'level' },
        { title: 'XP', dataIndex: 'xp' },
    ];

    return <Table dataSource={data} columns={columns} rowKey="userId" loading={loading} pagination={{ pageSize: 10 }} />;
};


export default Leveling;
