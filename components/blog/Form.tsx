"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button, Form, Input, Upload, message } from 'antd';
import { IBlog } from '@/types/blog';
import { textFieldValidator } from '@/lib/utils';
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
import { getTransformedUrl } from '@/app/api/services/uploadFile';

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
  
  const [ isLoading, setIsLoading ] = useState<boolean>(false); 
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const router = useRouter(); 
  const quillRef = useRef<any | null>(null);

  useEffect(() => {
    if (blog?.image?.length) {
      const files = blog.image.map((file: any) => {
        return {
          ...file,
          status: 'done'
        }
      });
      setFileList(files);
    }
  }, []);

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

          const { success, msgText, ...rest} = await res.json();
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

          quill.enable(true);
          quill.insertEmbed(range.index, "image", transformedUrl);
          quill.setSelection(range.index + 1);
          fileInput!.value = "";
        } catch (err) {
          message.error("Image upload failed");
          console.error("Failed to upload",err);
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
        // [{ font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote','code-block'],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
  }), []);

  const initialValues: IBlog = {
    title: blog?.title || '',
    descp: blog?.descp || ''
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

  const handleFinish: FormProps<IBlog>['onFinish'] = async(values) => {
    setIsLoading(true);
    const formData =  new FormData();
    formData.append("title", values.title as string);
    formData.append("descp", values.descp as string);
    
    if(fileList.length) {
      fileList.forEach(file => {
        if (file.originFileObj) {
          if(blog?.image?.length) formData.append("deletedImage", blog.image[0].fileId)
          formData.append("imageInfo", file.originFileObj);
        }
      });
    }
    if(blog){
      if(!fileList.length && blog.image?.length) formData.append("deletedImage", blog.image[0].fileId)
      formData.append("id", blog.id?.toString()!)
      const { success, msgText } = await blogApi.update(formData);
      if(success) message.success(msgText);
      else message.error(msgText  || "Failed to update!");
      setIsLoading(false);
      return router.push('/blog');
    }

    const { success, msgText } = await blogApi.create(formData); 
    if(success) message.success(msgText);
    else message.error(msgText  || "Failed to create!");
    setIsLoading(false);
    router.push('/blog');
  }

  return (
    <div className='content-container'>
      <h1 className='font-bold text-3xl mb-7'>{title}</h1>
      <Form
        initialValues={initialValues}
        layout='vertical' 
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
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          { !isLoading && (
            <Link href={"/blog"} className='mr-3'>
              <Button danger type="primary">
                Cancel
              </Button>
            </Link>
          )}
          <Button type="primary" htmlType="submit" disabled={isLoading}>
            { isLoading ? 'Loading...': 'Submit' }
          </Button>
         
        </Form.Item>
      </Form>
    </div>
  )
}

export default withAuth(BlogForm)