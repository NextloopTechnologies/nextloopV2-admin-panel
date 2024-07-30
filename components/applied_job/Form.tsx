"use client"

import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Upload, message } from 'antd';
import { IBlog } from '@/types/blog';
import { textFieldValidator } from '@/lib/utils';
import { UploadOutlined } from '@ant-design/icons';
import { FileType } from '@/types/antd';
import type { FormProps, UploadFile, UploadProps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { appliedJobApi } from '.';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import { withAuth } from '../auth';

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
      const { success, msgText } = await appliedJobApi.update(formData);
      if(success) message.success(msgText);
      else message.error(msgText  || "Failed to update!");
      setIsLoading(false);
      return router.push('/blog');
    }

    const { success, msgText } = await appliedJobApi.create(formData); 
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
        style={{ maxWidth: 500 }}
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
          <ReactQuill value={initialValues.descp!} />
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