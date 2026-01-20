import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Select, ColorPicker, message, Divider, Typography, Row, Col } from 'antd';
import api from '../../api/axios';
import { useParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EmbedBuilder = () => {
    const { guildId } = useParams();
    const [preview, setPreview] = useState({});

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
                    <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={(_, allValues) => setPreview(allValues)}>
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
                <Card title="Preview" variant="borderless" style={{ position: 'sticky', top: 20 }}>
                    {/* Discord Message Container */}
                    <div style={{ background: '#36393f', padding: '16px', borderRadius: '8px', fontFamily: '"gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif', color: '#dcddde' }}>

                        {/* Avatar & Username Mock */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#5865F2', marginRight: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Bot</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                                    <span style={{ fontWeight: 600, color: '#fff', marginRight: 8, fontSize: '16px' }}>Bot Name</span>
                                    <span style={{ fontSize: '12px', color: '#72767d', background: '#5865F2', padding: '0 4px', borderRadius: '3px', lineHeight: '15px' }}>BOT</span>
                                    <span style={{ fontSize: '12px', color: '#72767d', marginLeft: 8 }}>Today at 12:00 PM</span>
                                </div>

                                {/* Plain Content */}
                                {preview.content && (
                                    <div style={{ marginTop: 4, whiteSpace: 'pre-wrap', color: '#dcddde' }}>
                                        {preview.content}
                                    </div>
                                )}

                                {/* Embed Preview */}
                                {(preview.title || preview.description || preview.footer || preview.image || preview.thumbnail) && (
                                    <div style={{
                                        marginTop: 8,
                                        background: '#2f3136',
                                        borderLeft: `4px solid ${preview.color ? (typeof preview.color === 'string' ? preview.color : preview.color.toHexString()) : '#202225'}`,
                                        borderRadius: '4px',
                                        padding: '12px',
                                        maxWidth: '432px',
                                        display: 'grid',
                                        gridTemplateColumns: preview.thumbnail ? '1fr 80px' : '1fr',
                                        gap: '16px'
                                    }}>
                                        <div>
                                            {preview.title && <div style={{ fontWeight: 600, color: '#fff', marginBottom: 8 }}>{preview.title}</div>}
                                            {preview.description && <div style={{ fontSize: '14px', color: '#dcddde', whiteSpace: 'pre-wrap', marginBottom: 8 }}>{preview.description}</div>}
                                            {preview.image && <img src={preview.image} alt="Embed" style={{ maxWidth: '100%', borderRadius: '4px', marginTop: 8 }} />}
                                            {preview.footer && <div style={{ fontSize: '12px', color: '#b9bbbe', marginTop: 8 }}>{preview.footer}</div>}
                                        </div>
                                        {preview.thumbnail && (
                                            <div>
                                                <img src={preview.thumbnail} alt="Thumb" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </Card>
            </Col>
        </Row>
    );
};

export default EmbedBuilder;
