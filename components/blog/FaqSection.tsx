"use client";

import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Card, Modal, message, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { IFaq } from '@/types/blog';
import { faqApi } from '@/components/faq';

interface FaqSectionProps {
    blogId?: number;
    onFaqsChange?: (count: number) => void;
}

const FaqSection: React.FC<FaqSectionProps> = ({ blogId, onFaqsChange }) => {
    const [faqs, setFaqs] = useState<IFaq[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<IFaq | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (blogId) {
            loadFaqs();
        } else {
            setFaqs([]);
        }
    }, [blogId]);

    const loadFaqs = async () => {
        if (!blogId) return;
        try {
            setLoading(true);
            const data = await faqApi.getByBlogId(blogId);
            setFaqs(data);
            onFaqsChange?.(data.length);
        } catch (error) {
            message.error('Failed to load FAQs');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingFaq(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (faq: IFaq) => {
        setEditingFaq(faq);
        form.setFieldsValue({
            question: faq.question,
            answer: faq.answer,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: 'Delete FAQ',
            content: 'Are you sure you want to delete this FAQ?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await faqApi.delete(id);
                    message.success('FAQ deleted successfully');
                    await loadFaqs();
                } catch (error) {
                    message.error('Failed to delete FAQ');
                }
            },
        });
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();

            if (editingFaq) {
                await faqApi.update(editingFaq.id!, {
                    ...values,
                    blog_id: blogId!,
                });
                message.success('FAQ updated successfully');
            } else {
                await faqApi.create({
                    ...values,
                    blog_id: blogId!,
                    display_order: faqs.length,
                });
                message.success('FAQ added successfully');
            }

            setIsModalOpen(false);
            form.resetFields();
            await loadFaqs();
        } catch (error) {
            message.error(error instanceof Error ? error.message : 'Failed to save FAQ');
        }
    };

    return (
        <div style={{ marginTop: 24, padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <h3 style={{ margin: 0 }}>❓ Frequently Asked Questions</h3>
                    <span style={{ color: '#999', fontSize: 12 }}>
                        {faqs.length} FAQ{faqs.length !== 1 ? 's' : ''} added
                    </span>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} disabled={!blogId}>
                    Add FAQ
                </Button>
            </div>

            {!blogId && (
                <div style={{ color: '#999', padding: 16, background: '#f5f5f5', borderRadius: 4, textAlign: 'center' }}>
                    💡 Please save the blog first to add FAQs
                </div>
            )}

            {faqs.length === 0 && blogId && (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No FAQs added yet">
                    <Button type="primary" onClick={handleAdd} size="small">
                        Add First FAQ
                    </Button>
                </Empty>
            )}

            {faqs.map((faq, index) => (
                <Card
                    key={faq.id}
                    size="small"
                    style={{ marginBottom: 12 }}
                    actions={[
                        <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => handleEdit(faq)}>
                            Edit
                        </Button>,
                        <Button key="delete" type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(faq.id!)}>
                            Delete
                        </Button>,
                    ]}
                >
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                        Q{index + 1}: {faq.question}
                    </div>
                    <div style={{ color: '#666', wordBreak: 'break-word' }}>
                        {faq.answer.length > 100 ? `${faq.answer.substring(0, 100)}...` : faq.answer}
                    </div>
                </Card>
            ))}

            <Modal
                title={editingFaq ? '✏️ Edit FAQ' : '➕ Add FAQ'}
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
                okText={editingFaq ? 'Update' : 'Add'}
                width={600}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="question"
                        label="Question"
                        rules={[
                            { required: true, message: 'Please enter the question' },
                            { min: 3, message: 'Question must be at least 3 characters' },
                        ]}
                    >
                        <Input.TextArea rows={2} placeholder="Enter frequently asked question..." />
                    </Form.Item>
                    <Form.Item
                        name="answer"
                        label="Answer"
                        rules={[
                            { required: true, message: 'Please enter the answer' },
                            { min: 5, message: 'Answer must be at least 5 characters' },
                        ]}
                    >
                        <Input.TextArea rows={4} placeholder="Enter the answer..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default FaqSection;