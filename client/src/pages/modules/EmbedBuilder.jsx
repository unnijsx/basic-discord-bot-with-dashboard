import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Select, ColorPicker, message, Divider, Typography, Row, Col } from 'antd';
import api from '../../api/axios';
import { useParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EmbedBuilder = () => {
    const { guildId } = useParams();
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const { data } = await api.get(`/guilds/${guildId}/channels`);
                setChannels(data);
            } catch (error) {
                message.error('Failed to load channels');
            }
        };
        fetchChannels();
    }, [guildId]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await api.post(`/guilds/${guildId}/messages`, {
                channelId: values.channelId,
                content: values.content, // Say command part
                embed: {
                    title: values.title,
                    description: values.description,
                    color: values.color ? values.color.toHexString() : null,
                    image: values.image,
                    thumbnail: values.thumbnail,
                    footer: values.footer
                }
            });
            message.success('Message sent!');
            form.resetFields();
        } catch (error) {
            message.error('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Row gutter={24}>
            <Col span={14}>
                <Card title="Embed Builder & Say Command" variant="borderless">
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item name="channelId" label="Select Channel" rules={[{ required: true, message: 'Please select a channel' }]}>
                            <Select placeholder="Select a channel" showSearch filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {channels.map(ch => <Option key={ch.id} value={ch.id}>#{ch.name}</Option>)}
                            </Select>
                        </Form.Item>

                        <Divider titlePlacement="left">Message Content</Divider>
                        <Form.Item name="content" label="Plain Text Message (Say)">
                            <TextArea rows={2} placeholder="Type a message here (optional if sending embed)" />
                        </Form.Item>

                        <Divider titlePlacement="left">Embed Configuration</Divider>
                        <Form.Item name="title" label="Title">
                            <Input placeholder="Embed Title" />
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                            <TextArea rows={4} placeholder="Embed Description" />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="color" label="Color">
                                    <ColorPicker showText />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="image" label="Image URL">
                            <Input placeholder="https://example.com/image.png" />
                        </Form.Item>
                        <Form.Item name="thumbnail" label="Thumbnail URL">
                            <Input placeholder="https://example.com/thumb.png" />
                        </Form.Item>
                        <Form.Item name="footer" label="Footer Text">
                            <Input placeholder="Footer text" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} block size="large">
                                Send Message
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>

            <Col span={10}>
                <Card title="Preview" variant="borderless">
                    <div style={{ background: '#36393f', padding: '10px', borderRadius: '5px' }}>
                        <Text style={{ color: '#fff' }}>Preview is approximate.</Text>
                        {/* A rough preview could go here if requested later */}
                    </div>
                </Card>
            </Col>
        </Row>
    );
};

export default EmbedBuilder;
