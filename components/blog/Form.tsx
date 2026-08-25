"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Form, Input, InputNumber, Upload, message, Modal, Select } from 'antd';
import { IBlog } from '@/types/blog';
import { extractImageUrlsFromHtml, textFieldValidator } from '@/lib/utils';
import { authorApi } from '@/components/author';
import { categoryApi } from '@/components/category';
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
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { deleteFiles, getTransformedUrl } from '../crud/uploadApi';
import BlogPreviewModal from './BlogPreviewModal';

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



const BlogForm: React.FC<BlogFormProps> = ({
  title,
  blog
}) => {

  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState<boolean>(false);
  const [isMetaKeywordsManuallyEdited, setIsMetaKeywordsManuallyEdited] = useState<boolean>(false);
  const [isCanonicalManuallyEdited, setIsCanonicalManuallyEdited] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [authorsList, setAuthorsList] = useState<{ id: number, name: string | null, designation?: string | null, description?: string | null, profile?: string | null }[]>([]);
  const [categoriesList, setCategoriesList] = useState<{ id: number, name: string | null }[]>([]);
  const [publishedBlogsList, setPublishedBlogsList] = useState<{ id: number, title: string | null }[]>([]);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoUrlError, setVideoUrlError] = useState<string>('');
  const pendingVideoQuillRef = useRef<any | null>(null);
  const router = useRouter();
  const quillRef = useRef<any | null>(null);
  const uploadedImageUrlsRef = useRef<{ fileId: string; transformedUrl: string }[]>([]);

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
    const fetchCategories = async () => {
      try {
        const result = await categoryApi.list();
        if (result && result.data) {
          setCategoriesList(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPublishedBlogs = async () => {
      try {
        const result = await blogApi.list(1, 500);
        if (result?.data) {
          const published = result.data.filter((b: any) => b.status === 'published');
          setPublishedBlogsList(published);
        }
      } catch (err) {
        console.error("Failed to fetch published blogs", err);
      }
    };
    fetchPublishedBlogs();
  }, []);


  useEffect(() => {
    if (blog) {
      const generatedSlug = blog.slug || (blog.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const generatedCanonical = blog.canonical_url ||
        (generatedSlug ? `${config.siteUrl}/blog/${generatedSlug}` : '');

      form.setFieldsValue({
        title: blog.title || '',
        slug: generatedSlug,
        canonical_url: generatedCanonical,
        meta_title: blog.meta_title || '',
        meta_description: blog.meta_description || '',
        descp: blog.descp || '',
        author_id: blog.author_id || blog.author?.id || undefined,
        status: blog.status || 'draft',
        category_id: blog.category_id || blog.categories?.id || undefined,
        tags: blog.tags || [],
        meta_keywords: blog.meta_keywords || [],
        read_time: blog.read_time || 2,
        featured_blogs: blog.featured_blogs || [],
      });
      setIsSlugManuallyEdited(!!blog.slug);
      setIsCanonicalManuallyEdited(!!blog.canonical_url);
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
          uploadedImageUrlsRef.current.push({ fileId, transformedUrl });

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
        image: imageHandler,
        video: function () {
          const quill = (this as any).quill;
          pendingVideoQuillRef.current = quill;
          setVideoUrl('');
          setVideoUrlError('');
          setIsVideoModalOpen(true);
        }
      }
    },
    imageResize: {}
  }), []);

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if ('canonical_url' in changedValues) {
      if (!changedValues.canonical_url) {
        setIsCanonicalManuallyEdited(false);
        const currentSlug = allValues.slug || '';
        form.setFieldsValue({ canonical_url: currentSlug ? `${config.siteUrl}/blog/${currentSlug}` : '' });
      } else {
        setIsCanonicalManuallyEdited(true);
      }
    }
    if ('slug' in changedValues) {
      if (!changedValues.slug) {
        setIsSlugManuallyEdited(false);
        const generatedSlug = (allValues.title || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        form.setFieldsValue({ slug: generatedSlug });
        if (!isCanonicalManuallyEdited) {
          form.setFieldsValue({ canonical_url: generatedSlug ? `${config.siteUrl}/blog/${generatedSlug}` : '' });
        }
      } else {
        setIsSlugManuallyEdited(true);
        if (!isCanonicalManuallyEdited) {
          form.setFieldsValue({ canonical_url: `${config.siteUrl}/blog/${changedValues.slug}` });
        }
      }
    }
    if ('title' in changedValues) {
      if (!isSlugManuallyEdited) {
        const generatedSlug = (allValues.title || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        form.setFieldsValue({ slug: generatedSlug });
        if (!isCanonicalManuallyEdited) {
          form.setFieldsValue({ canonical_url: generatedSlug ? `${config.siteUrl}/blog/${generatedSlug}` : '' });
        }
      }
    }
    if ("tags" in changedValues && !isMetaKeywordsManuallyEdited) {
      form.setFieldsValue({
        meta_keywords: changedValues.tags || [],
      });
    }
    if ("meta_keywords" in changedValues) {
      setIsMetaKeywordsManuallyEdited(true);
    }

  };

  const initialValues = {
    title: blog?.title || '',
    slug: blog?.slug || (blog?.title ? blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : ''),
    canonical_url: blog?.canonical_url || (() => {
      const slug = blog?.slug || (blog?.title ? blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '');
      return slug ? `${config.siteUrl}/blog/${slug}` : '';
    })(),
    meta_title: blog?.meta_title || '',
    meta_description: blog?.meta_description || '',
    descp: blog?.descp || '',
    author_id: blog?.author_id || blog?.author?.id || undefined,
    status: blog?.status || 'draft',
    category_id: blog?.category_id || blog?.categories?.id || undefined,
    tags: blog?.tags || [],
    meta_keywords: blog?.meta_keywords || [],
    read_time: blog?.read_time || 2,
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
      setFileList(newFileList);
      // Re-trigger image field validation when file is added/removed
      setTimeout(() => form.validateFields(['image']), 0);
    }
  }

  const handleFinish: FormProps<IBlog>['onFinish'] = async (values) => {
    try {
      setIsLoading(true);
      // delete backspaced images after adding it to quill
      const currentHtml = quillRef.current?.getEditor().root.innerHTML;
      const usedImages = new Set(extractImageUrlsFromHtml(currentHtml));
      const toDelete = uploadedImageUrlsRef.current.filter(({ transformedUrl }) => !usedImages.has(transformedUrl));

      if (toDelete.length > 0) await deleteFiles(toDelete.map(({ fileId }) => fileId));

      const formData = new FormData();
      formData.append("title", values.title as string);
      formData.append("descp", values.descp as string);
      formData.append("folder", "/AdminNextloop/Blogs");

      if (values.author_id) {
        formData.append("author_id", values.author_id.toString());
      }

      formData.append("slug", values.slug || "");
      formData.append("canonical_url", values.canonical_url || "");
      formData.append("meta_title", values.meta_title || "");
      formData.append("meta_description", values.meta_description || "");
      formData.append("status", values.status || "draft");

      if (values.category_id) {
        formData.append("category_id", values.category_id.toString());
      }

      if (values.tags) {
        formData.append("tags", JSON.stringify(values.tags));
      }
      if (values.meta_keywords) {
        formData.append("meta_keywords", JSON.stringify(values.meta_keywords));
      }
      if (values.read_time) {
        formData.append("read_time", values.read_time.toString());
      }
      if (values.featured_blogs) {
        formData.append("featured_blogs", JSON.stringify(values.featured_blogs));
      }


      if (uploadedImageUrlsRef.current.length) {
        const uploadedImages = uploadedImageUrlsRef.current.filter(({ transformedUrl }) => usedImages.has(transformedUrl));
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

      if (blog) {


        if (!fileList.length) {
          const oldFileId = blog.image?.[0]?.fileId;
          if (oldFileId) formData.append("deletedImage", oldFileId);
        }

        formData.append("id", blog.id?.toString()!)
        const { success, msgText } = await blogApi.update(formData);
        if (!success) return message.error(msgText || "Failed to update!");
        message.success(msgText || "Blog updated successfully!");
      } else {

        const { success, msgText } = await blogApi.create(formData);
        if (!success) return message.error(msgText || "Failed to create!");
        message.success(msgText || "Blog created successfully!");
      }
    } catch (error) {
      console.error("Error in handleFinish", error);
      message.error("Something went wrong!");
    } finally {
      setIsLoading(false);
      uploadedImageUrlsRef.current = [];
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
          label={
            <span>
              Canonical URL&nbsp;
              <Tooltip title="Auto-generated from slug. Edit to override. Leave blank to save as empty.">
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,0.45)' }} />
              </Tooltip>
            </span>
          }
          name="canonical_url"
          rules={[
            {
              type: 'url',
              message: 'Please enter a valid URL (e.g. https://example.com/blog/my-post)',
            }
          ]}
        >
          <Input placeholder={`${config.siteUrl}/blog/your-slug`} allowClear />
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
          label="Category"
          name="category_id"
          rules={[
            {
              required: false,
            }
          ]}
        >
          <Select
            placeholder="Select a Category"
            options={categoriesList.map(c => ({ value: c.id, label: c.name || 'Unknown' }))}
            allowClear
          />
        </Form.Item>

        <Form.Item<IBlog>
          label="Status"
          name="status"
          rules={[
            {
              required: true,
              message: 'Please select a status!',
            }
          ]}
        >
          <Select
            placeholder="Select Status"
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' }
            ]}
          />
        </Form.Item>

        <Form.Item<IBlog>
          label="Tags"
          name="tags"
          rules={[
            {
              required: false,
            }
          ]}
        >
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Enter tags (press Enter or comma to add)"
            tokenSeparators={[',']}
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
          label="Read Time (minutes)"
          name="read_time"
          rules={[
            { required: true, message: 'Please input the estimated read time!' }
          ]}
        >
          <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="e.g. 2" />
        </Form.Item>

        <Form.Item<IBlog>
          label={<span className='text-l'>Blog Image <span style={{ color: '#ff4d4f' }}>*</span></span>}
          name="image"
          rules={[
            {
              validator: () => {
                if (fileList.length === 0) {
                  return Promise.reject(new Error('Please upload a blog image!'));
                }
                return Promise.resolve();
              },
            }
          ]}
        >
          <Upload {...fileProps}>
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>

        <Form.Item<IBlog>
          label="Featured Blogs"
          name="featured_blogs"
        >
          <Select
            mode="multiple"
            placeholder="Select up to 3 featured blogs"
            maxCount={3}
            options={publishedBlogsList.map(b => ({ value: b.id, label: b.title || 'Untitled' }))}
            allowClear
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>


        <Form.Item<IBlog>
          label="Meta Title"
          name="meta_title"
          rules={[
            {
              required: true,
              message: 'Please input meta title!',
            },
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
              required: true,
              message: 'Please input meta description!',
            },
            {
              max: 160,
              message: 'Meta description cannot exceed 160 characters!',
            }
          ]}
        >
          <Input.TextArea maxLength={160} showCount placeholder="Enter Meta Description (max 160 characters)" rows={4} />
        </Form.Item>
        <Form.Item<IBlog>
          label="Meta Keywords"
          name="meta_keywords"

        >
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Enter meta keywords (press Enter or comma to add)"
            tokenSeparators={[',']}
          />
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

      <BlogPreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={form.getFieldValue('title') || 'Untitled Blog'}
        html={quillRef.current?.getEditor?.().root.innerHTML || form.getFieldValue('descp') || ''}
        imageSrc={fileList[0]?.originFileObj ? URL.createObjectURL(fileList[0].originFileObj) : (fileList[0] as any)?.url}
        categoryName={categoriesList.find(c => c.id === form.getFieldValue('category_id'))?.name ?? null}
        readTime={form.getFieldValue('read_time') ?? null}
        status={form.getFieldValue('status') ?? 'draft'}
        createdAt={blog?.created_at ?? null}
        author={authorsList.find(a => a.id === form.getFieldValue('author_id')) ?? null}
      />

      {/* Video Embed Modal */}
      <Modal
        title="Embed Video"
        open={isVideoModalOpen}
        onCancel={() => { setIsVideoModalOpen(false); setVideoUrl(''); setVideoUrlError(''); }}
        onOk={() => {
          const url = videoUrl.trim();
          if (!url) {
            setVideoUrlError('Please enter a video URL.');
            return;
          }

          const isYouTube = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)/.test(url);
          const isVimeo = /^(https?:\/\/)?(www\.)?vimeo\.com\//.test(url);

          if (!isYouTube && !isVimeo) {
            setVideoUrlError('Only YouTube or Vimeo video URLs are allowed.');
            return;
          }


          let embedUrl = url;
          if (isYouTube) {
            const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
          }


          if (isVimeo) {
            const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
            if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
          }

          const quill = pendingVideoQuillRef.current;
          if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'video', embedUrl);
            quill.setSelection(range.index + 1);
          }

          setIsVideoModalOpen(false);
          setVideoUrl('');
          setVideoUrlError('');
        }}
        okText="Embed"
        cancelText="Cancel"
        width={480}
      >
        <div style={{ marginBottom: 8 }}>
          <Input
            placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
            value={videoUrl}
            onChange={(e) => { setVideoUrl(e.target.value); setVideoUrlError(''); }}
            onPressEnter={() => {
              const okBtn = document.querySelector('.ant-modal-footer .ant-btn-primary') as HTMLButtonElement;
              okBtn?.click();
            }}
            size="large"
            autoFocus
          />
          {videoUrlError && (
            <div style={{ color: '#ff4d4f', marginTop: 4, fontSize: 13 }}>{videoUrlError}</div>
          )}
          <div style={{ color: '#999', marginTop: 8, fontSize: 12 }}>
            Supported: YouTube and Vimeo only
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default withAuth(BlogForm)