"use client"

import React, { useState, useEffect } from 'react';
import { Button, Form, Input, message } from 'antd';
import { textFieldValidator } from '@/lib/utils';
import type { FormProps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ICategory } from '@/types/blog';
import { categoryApi } from '.';
import { withAuth } from '../auth';

interface CategoryFormProps {
  title: string;
  category?: ICategory | null;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  title,
  category
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (category) {
      const generatedSlug = category.slug || (category.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      form.setFieldsValue({
        name: category.name || '',
        slug: generatedSlug,
        description: category.description || ''
      });
      setIsSlugManuallyEdited(!!category.slug);
    }
  }, [category, form]);

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if ('slug' in changedValues) {
      if (!changedValues.slug) {
        setIsSlugManuallyEdited(false);
        const generatedSlug = (allValues.name || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        form.setFieldsValue({ slug: generatedSlug });
      } else {
        setIsSlugManuallyEdited(true);
      }
    }
    if ('name' in changedValues) {
      if (!isSlugManuallyEdited) {
        const generatedSlug = (allValues.name || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        form.setFieldsValue({ slug: generatedSlug });
      }
    }
  };

  const initialValues = {
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || ''
  };

  const handleFinish: FormProps<ICategory>['onFinish'] = async (values) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("slug", values.slug);
      if (values.description) {
        formData.append("description", values.description);
      }

      if (category) {
        formData.append("id", category.id?.toString()!);
        const { success, msgText } = await categoryApi.update(formData);
        if (success) {
          message.success(msgText || "Category updated successfully!");
          router.push('/blog/category');
        } else {
          message.error(msgText || "Failed to update category.");
        }
      } else {
        const { success, msgText } = await categoryApi.create(formData);
        if (success) {
          message.success(msgText || "Category created successfully!");
          router.push('/blog/category');
        } else {
          message.error(msgText || "Failed to create category.");
        }
      }
    } catch (error) {
      console.error("CATEGORY_FORM_SUBMISSION_ERROR", error);
      message.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="content-container">
      <h1 className="font-bold text-3xl mb-7">{title}</h1>
      <Form
        form={form}
        initialValues={initialValues}
        style={{ maxWidth: 600 }}
        layout="vertical"
        onValuesChange={handleValuesChange}
        onFinish={handleFinish}
        size="large"
      >
        <Form.Item<ICategory>
          label="Category Name"
          name="name"
          rules={[
            {
              required: true,
              message: 'Please input the category name!',
            },
            {
              min: 2,
              message: 'Category name must be at least 2 characters!',
            },
            {
              max: 100,
              message: 'Category name cannot exceed 100 characters!',
            },
            {
              validator: textFieldValidator
            }
          ]}
        >
          <Input placeholder="e.g. Web Development" />
        </Form.Item>

        <Form.Item<ICategory>
          label="Slug"
          name="slug"
          rules={[
            {
              required: true,
              message: 'Please input the category slug!',
            },
            {
              pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
              message: 'Slug must be lowercase alphanumeric characters and hyphens only, and cannot start or end with a hyphen!',
            }
          ]}
        >
          <Input placeholder="e.g. web-development" />
        </Form.Item>

        <Form.Item<ICategory>
          label="Description"
          name="description"
          rules={[
            {
              validator: textFieldValidator
            }
          ]}
        >
          <Input.TextArea placeholder="Enter category description for internal reference" rows={4} />
        </Form.Item>

        <Form.Item>
          {!isLoading && (
            <Link href="/blog/category" className="mr-3">
              <Button danger type="primary">
                Cancel
              </Button>
            </Link>
          )}
          <Button type="primary" htmlType="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Submit'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default withAuth(CategoryForm);
