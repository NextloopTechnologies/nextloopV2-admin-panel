"use client"

import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { textFieldValidator } from '@/lib/utils';
import type { FormProps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IAuthor } from '@/types/supabase';
import { authorApi } from '.';
import { withAuth } from '../auth';

interface AuthorFormProps {
  title: string;
  author?: IAuthor|null;
}

const AuthorForm: React.FC<AuthorFormProps> = ({ 
  title, 
  author
}) => {
  
  const [ isLoading, setIsLoading ] = useState<boolean>(false); 
  const router = useRouter(); 

  const initialValues: IAuthor = {
    name: author?.name || '',
    designation: author?.designation || ''
  }
  
  const handleFinish: FormProps<IAuthor>['onFinish'] = async(values) => {
    setIsLoading(true);
    const formData =  new FormData();
    formData.append("name", values.name as string);
    formData.append("designation", values.designation as string);
    
    if(author){
     formData.append("id", author.id?.toString()!)
      const { success, msgText } = await authorApi.update(formData);
      if(success) message.success(msgText);
      else message.error(msgText  || "Failed to update!");
      setIsLoading(false);
      return router.push('/blog/author');
    }
    const { success, msgText } = await authorApi.create(formData); 
    if(success) message.success(msgText);
    else message.error(msgText  || "Failed to create!");
    setIsLoading(false);
    router.push('/blog/author');
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
        <Form.Item<IAuthor>
          label="Name"
          name="name"
          rules={[
            {
              required: true,
              message: 'Please input your feedback by!',
            },
            {
              validator: textFieldValidator
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item<IAuthor>
          label="Designation"
          name="designation"
          rules={[
            {
              required: true,
              message: 'Please input your feedback description!',
            },
            {
              validator: textFieldValidator
            }
          ]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          { !isLoading && (
            <Link href={"/blog/author"} className='mr-3'>
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

export default withAuth(AuthorForm)