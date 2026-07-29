"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Form, Input, Upload, message, Modal, Select } from 'antd';
import { IBlog } from '@/types/blog';
import { extractImageUrlsFromHtml, textFieldValidator } from '@/lib/utils';
import { authorApi } from '@/components/author';
import { UploadOutlined } from '@ant-design/icons';
import { FileType } from '@/types/antd';
import type { FormProps, UploadFile, UploadProps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { blogApi } from '.';
import 'react-quill/dist/quill.snow.css';
import { withAuth } from '../auth';
import dynamic from 'next/dynamic';
import config from '@/config';
import { deleteFiles, getTransformedUrl } from '@/app/api/services/uploadFile';
import parse from "html-react-parser";

const QuillNoSSRWrapper = dynamic(() => import('../quill/QuillEditor'), {
  ssr: false,
});

const ForwardedQuill = React.forwardRef((props: any, ref) => (
  <QuillNoSSRWrapper {...props} forwardedRef={ref} />
));
ForwardedQuill.displayName = 'ForwardedQuill';

interface BlogFormProps {
  title: string,
  blog?: IBlog | null,
}

const uploadedImageUrls: { "fileId": string; "transformedUrl": string }[] = [];

const BlogForm: React.FC<BlogFormProps> = ({
  title,
  blog
}) => {

  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [authorsList, setAuthorsList] = useState<{ id: number, name: string | null }[]>([]);
  const router = useRouter();
  const quillRef = useRef<any | null>(null);

  const handlePreview = () => {
    setIsPreviewOpen(true);
  }

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const result = await authorApi.list(1, 100);
        if (result && result.data) {
          setAuthorsList(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch authors", err);
      }
    };
    fetchAuthors();
  }, []);

  useEffect(() => {
    if (blog) {
      const generatedSlug = blog.slug || (blog.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      form.setFieldsValue({
        title: blog.title || '',
        slug: generatedSlug,
        meta_title: blog.meta_title || '',
        meta_description: blog.meta_description || '',
        descp: blog.descp || '',
        author_id: blog.author_id || blog.author?.id || undefined,
      });
      setIsSlugManuallyEdited(!!blog.slug);
      if (blog.image?.length) {
        const files = blog.image.map((file: any) => {
          return {
            ...file,
            status: 'done'
          }
        });
        setFileList(files);
      }
    }
  }, [blog, form]);

  const imageHandler = () => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;

    let fileInput = quill.root.querySelector("input.ql-image[type=file]") as HTMLInputElement | null;

    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.setAttribute("type", "file");
      fileInput.setAttribute("accept", "image/*");
      fileInput.classList.add("ql-image");

      fileInput.addEventListener("change", async () => {
        const files = fileInput!.files;
        const range = quill.getSelection(true);

        if (!files || !files.length) {
          message.warning("No image selected");
          return;
        }
        if (files.length > 1) {
          message.warning("Please select only one image");
          return;
        }

        const formData = new FormData();
        formData.append("file", files[0]);
        formData.append("folder", "/AdminNextloop/Blogs")

        try {
          setIsLoading(true);
          const res = await fetch(`${config.apiBaseUrl}/api/upload`, {
            method: "POST",
            body: formData
          });

          const { success, msgText, ...rest } = await res.json();
          if (!success) {
            message.error("Failed to upload image");
            throw new Error("Upload failed");
          }

          const { fileId, url } = rest.data;
          if (!fileId || !url) {
            message.error("Image upload failed");
            throw new Error("Image upload failed");
          }

          const transformedUrl = await getTransformedUrl(url);
          if (!transformedUrl) {
            message.error("Failed to transform image URL");
            throw new Error("Failed to transform image URL");
          }
          // Store the uploaded image URL and fileId
          uploadedImageUrls.push({ fileId, transformedUrl });

          quill.enable(true);
          quill.insertEmbed(range.index, "image", transformedUrl);
          quill.setSelection(range.index + 1);
          fileInput!.value = "";
        } catch (err) {
          message.error("Image upload failed");
          console.error("Failed to upload", err);
          quill.enable(true);
        } finally {
          setIsLoading(false);
        }
      });
      quill.root.appendChild(fileInput);
    }
    fileInput.click();
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    imageResize: {}
  }), []);

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if ('slug' in changedValues) {
      if (!changedValues.slug) {
        setIsSlugManuallyEdited(false);
        const generatedSlug = (allValues.title || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        form.setFieldsValue({ slug: generatedSlug });
      } else {
        setIsSlugManuallyEdited(true);
      }
    }
    if ('title' in changedValues) {
      if (!isSlugManuallyEdited) {
        const generatedSlug = (allValues.title || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        form.setFieldsValue({ slug: generatedSlug });
      }
    }
  };

  const initialValues = {
    title: blog?.title || '',
    slug: blog?.slug || (blog?.title ? blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : ''),
    meta_title: blog?.meta_title || '',
    meta_description: blog?.meta_description || '',
    descp: blog?.descp || '',
    author_id: blog?.author_id || blog?.author?.id || undefined,
  }

  const fileProps: UploadProps = {
    accept: 'image/*',
    listType: "picture",
    maxCount: 1,
    fileList,
    beforeUpload: (file: FileType) => {
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error(`${file.name} must smaller than 2MB!`);
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList)
    }
  }

  const handleFinish: FormProps<IBlog>['onFinish'] = async (values) => {
    try {
      setIsLoading(true);
      // delete backspaced images after adding it to quill
      const currentHtml = quillRef.current?.getEditor().root.innerHTML;
      const usedImages = new Set(extractImageUrlsFromHtml(currentHtml));
      const toDelete = uploadedImageUrls.filter(({ transformedUrl }) => !usedImages.has(transformedUrl));

      if (toDelete.length > 0) await deleteFiles(toDelete.map(({ fileId }) => fileId));

      const formData = new FormData();
      formData.append("title", values.title as string);
      formData.append("descp", values.descp as string);
      formData.append("folder", "/AdminNextloop/Blogs");

      if (values.author_id) {
        formData.append("author_id", values.author_id.toString());
      }

      formData.append("slug", values.slug || "");
      formData.append("meta_title", values.meta_title || "");
      formData.append("meta_description", values.meta_description || "");

      if (uploadedImageUrls.length) {
        const uploadedImages = uploadedImageUrls.filter(({ transformedUrl }) => usedImages.has(transformedUrl));
        if (uploadedImages.length) {
          uploadedImages.forEach(({ fileId, transformedUrl }) => {
            formData.append("descp_image_ids", JSON.stringify({ fileId, url: transformedUrl }));
          });
        }
      }

      if (fileList.length) {
        fileList.forEach(file => {
          if (file.originFileObj) {
            if (blog?.image?.length) formData.append("deletedImage", blog.image[0].fileId)
            formData.append("imageInfo", file.originFileObj);
          }
        });
      }
      //console.log("blog before submit:", blog);
      if (blog) {
        // console.log("UPDATE API CALLED");
        if (!fileList.length && blog.image?.length) formData.append("deletedImage", blog.image[0].fileId)
        formData.append("id", blog.id?.toString()!)
        const { success, msgText } = await blogApi.update(formData);
        if (!success) return message.error(msgText || "Failed to update!");
        message.success(msgText || "Blog updated successfully!");
      } else {
        // console.log("CREATE API CALLED");
        const { success, msgText } = await blogApi.create(formData);
        if (!success) return message.error(msgText || "Failed to create!");
        message.success(msgText || "Blog created successfully!");
      }
    } catch (error) {
      console.error("Error in handleFinish", error);
      message.error("Something went wrong!");
    } finally {
      setIsLoading(false);
      router.push('/blog');
    }
  }

  return (
    <div className='content-container'>
      <h1 className='font-bold text-3xl mb-7'>{title}</h1>
      <Form
        form={form}
        initialValues={initialValues}
        layout='vertical'
        onValuesChange={handleValuesChange}
        onFinish={handleFinish}
        size='large'
      >
        <Form.Item<IBlog>
          label="Title"
          name="title"
          rules={[
            {
              required: true,
              message: 'Please input your title!',
            },
            {
              validator: textFieldValidator
            }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item<IBlog>
          label="Slug"
          name="slug"
          rules={[
            {
              required: true,
              message: 'Please input your slug!',
            },
            {
              pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
              message: 'Slug must be lowercase alphanumeric characters and hyphens only, and cannot start or end with a hyphen!',
            }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item<IBlog>
          label="Author"
          name="author_id"
          rules={[
            {
              required: true,
              message: 'Please select an author!',
            }
          ]}
        >
          <Select
            placeholder="Select an Author"
            options={authorsList.map(a => ({ value: a.id, label: a.name || 'Unknown' }))}
          />
        </Form.Item>

        <Form.Item<IBlog>
          label="Description"
          name="descp"
          rules={[
            {
              required: true,
              message: 'Please input your description!',
            },
            {
              validator: textFieldValidator
            }
          ]}
        >
          <ForwardedQuill
            ref={quillRef}
            value={initialValues.descp!}
            modules={modules}
          />
        </Form.Item>
        <Form.Item<IBlog>
          label={<span className='text-l'>Blog Image</span>}>
          <Upload {...fileProps}>
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>

        <Form.Item<IBlog>
          label="Meta Title"
          name="meta_title"
          rules={[
            {
              max: 60,
              message: 'Meta title cannot exceed 60 characters!',
            }
          ]}
        >
          <Input maxLength={60} showCount placeholder="Enter Meta Title (max 60 characters)" />
        </Form.Item>

        <Form.Item<IBlog>
          label="Meta Description"
          name="meta_description"
          rules={[
            {
              max: 160,
              message: 'Meta description cannot exceed 160 characters!',
            }
          ]}
        >
          <Input.TextArea maxLength={160} showCount placeholder="Enter Meta Description (max 160 characters)" rows={4} />
        </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          {!isLoading && (
            <Link href={"/blog"} className='mr-3'>
              <Button danger type="primary">
                Cancel
              </Button>
            </Link>
          )}
          <Button
            type="default"
            onClick={handlePreview}
            style={{ marginRight: 8 }}
            disabled={isLoading}
          >
            Preview
          </Button>
          <Button type="primary" htmlType="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Submit'}
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title="Blog Preview"
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsPreviewOpen(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        <div style={{ padding: '20px 0' }}>
          {fileList.length > 0 && (
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
              <img
                src={
                  fileList[0].originFileObj
                    ? URL.createObjectURL(fileList[0].originFileObj)
                    : fileList[0].url
                }
                alt="Featured Banner"
                style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }}
              />
            </div>
          )}
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: 15 }}>
            {form.getFieldValue('title') || 'Untitled Blog'}
          </h1>
          <div style={{ borderBottom: '1px solid #f0f0f0', marginBottom: 20 }} />
          <div className="ql-editor" style={{ fontSize: 16, lineHeight: 1.6 }}>
            {parse(quillRef.current?.getEditor?.().root.innerHTML || form.getFieldValue('descp') || '')}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default withAuth(BlogForm)