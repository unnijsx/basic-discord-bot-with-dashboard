import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, SendOutlined, DiffOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import axios from '../../api/axios';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { Option } = Select;

const PageContainer = styled.div`
    padding: 24px;
`;

const FormBuilder = () => {
    const { guildId } = useParams();
    const [forms, setForms] = useState([]);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPostModalVisible, setIsPostModalVisible] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);
    const [postForm] = Form.useForm();
    const [createForm] = Form.useForm();
    const [questions, setQuestions] = useState([]);

    const fetchData = async () => {
        try {
            const [formsRes, channelsRes] = await Promise.all([
                axios.get(`/modules/${guildId}/forms`),
                axios.get(`/guilds/${guildId}/channels`)
            ]);
            setForms(formsRes.data);
            setChannels(channelsRes.data);
        } catch (error) {
            message.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [guildId]);

    const handleCreate = async (values) => {
        if (questions.length === 0) return message.error('Add at least one question!');
        try {
            const payload = {
                ...values,
                questions: questions.map((q, i) => ({ ...q, id: `q_${i}` }))
            };
            await axios.post(`/modules/${guildId}/forms`, payload);
            message.success('Form created!');
            setIsModalVisible(false);
            createForm.resetFields();
            setQuestions([]);
            fetchData();
        } catch (error) {
            message.error('Failed to create form');
        }
    };

    const handleDelete = async (formId) => {
        try {
            await axios.delete(`/modules/${guildId}/forms/${formId}`);
            message.success('Form deleted');
            fetchData();
        } catch (error) {
            message.error('Failed to delete form');
        }
    };

    const openPostModal = (form) => {
        setSelectedForm(form);
        setIsPostModalVisible(true);
        postForm.resetFields();
    };

    const handlePost = async (values) => {
        if (!selectedForm) return;
        try {
            await axios.post(`/guilds/${guildId}/messages`, {
                channelId: values.targetChannelId,
                content: `**${selectedForm.title}**\n${selectedForm.description || 'Click below to apply.'}`,
                components: [
                    {
                        type: 1, // ActionRow
                        components: [
                            {
                                type: 2, // Button
                                style: 1, // Primary
                                label: selectedForm.triggerLabel || 'Open Form',
                                custom_id: `form_open_${selectedForm._id}`
                            }
                        ]
                    }
                ]
            });
            message.success('Button posted successfully!');
            setIsPostModalVisible(false);
        } catch (err) {
            message.error('Failed to post button. Check bot permissions.');
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, { label: 'New Question', type: 'short', required: true }]);
    };

    const updateQuestion = (index, field, value) => {
        const newQ = [...questions];
        newQ[index][field] = value;
        setQuestions(newQ);
    };

    const removeQuestion = (index) => {
        const newQ = [...questions];
        newQ.splice(index, 1);
        setQuestions(newQ);
    };

    const columns = [
        { title: 'Title', dataIndex: 'title', key: 'title', render: text => <Text style={{ color: '#fff' }}>{text}</Text> },
        { title: 'Response Channel', dataIndex: 'responseChannelId', key: 'response', render: id => channels.find(c => c.id === id)?.name || id },
        { title: 'Questions', dataIndex: 'questions', key: 'q', render: q => q.length },
        {
            title: 'Actions',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<SendOutlined />} onClick={() => openPostModal(record)}>Post Button</Button>
                    <Popconfirm title="Delete?" onConfirm={() => handleDelete(record._id)}>
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <PageContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Title level={2} style={{ color: '#fff', margin: 0 }}>Form Builder</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Create Form
                </Button>
            </div>

            <Table
                dataSource={forms}
                columns={columns}
                rowKey="_id"
                loading={loading}
                pagination={false}
                scroll={{ x: 800 }}
                style={{ background: '#2f3136', borderRadius: 8 }}
            />

            {/* Create Form Modal */}
            <Modal
                title="Create New Form"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => createForm.submit()}
                width={700}
            >
                <Form form={createForm} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="title" label="Form Title" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Helper Application" />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea placeholder="Describe what this form is for..." />
                    </Form.Item>
                    <Form.Item name="triggerLabel" label="Button Label" initialValue="Apply Now">
                        <Input placeholder="Text on the button" />
                    </Form.Item>
                    <Form.Item name="responseChannelId" label="Response Channel" rules={[{ required: true }]}>
                        <Select
                            placeholder="Select a channel"
                            showSearch
                            optionFilterProp="label"
                            options={channels.map(c => ({ label: `#${c.name}`, value: c.id }))}
                        />
                    </Form.Item>

                    <Title level={5}>Questions ({questions.length}/5)</Title>
                    {questions.map((q, i) => (
                        <Card key={i} size="small" style={{ marginBottom: 10 }}>
                            <Space style={{ width: '100%' }} direction="vertical">
                                <Input
                                    addonBefore="Label"
                                    value={q.label}
                                    onChange={e => updateQuestion(i, 'label', e.target.value)}
                                />
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <Select
                                        value={q.type}
                                        onChange={v => updateQuestion(i, 'type', v)}
                                        style={{ width: 120 }}
                                    >
                                        <Option value="short">Short Text</Option>
                                        <Option value="paragraph">Paragraph</Option>
                                    </Select>
                                    <Button danger icon={<DeleteOutlined />} onClick={() => removeQuestion(i)} />
                                </div>
                            </Space>
                        </Card>
                    ))}
                    {questions.length < 5 && (
                        <Button type="dashed" onClick={addQuestion} block icon={<PlusOutlined />}>
                            Add Question
                        </Button>
                    )}
                </Form>
            </Modal>

            {/* Post Button Modal */}
            <Modal
                title="Post Form Button"
                open={isPostModalVisible}
                onCancel={() => setIsPostModalVisible(false)}
                onOk={() => postForm.submit()}
            >
                <Form form={postForm} layout="vertical" onFinish={handlePost}>
                    <Form.Item
                        name="targetChannelId"
                        label="Select Channel to Post Button"
                        rules={[{ required: true, message: 'Please select a channel!' }]}
                    >
                        <Select
                            placeholder="Select a channel"
                            showSearch
                            optionFilterProp="label"
                            options={channels.map(c => ({ label: `#${c.name}`, value: c.id }))}
                        />
                    </Form.Item>
                    <Text type="secondary">
                        This will send a message with a button to the selected channel.
                        Users clicking the button will see the form modal.
                    </Text>
                </Form>
            </Modal>
        </PageContainer>
    );
};

export default FormBuilder;
