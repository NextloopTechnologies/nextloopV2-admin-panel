"use client"

import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { textFieldValidator } from '@/lib/utils';
import type { FormProps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IUser, IUserMutate } from '@/types/supabase';
import { withAuth } from '../auth';
import { create } from './userApi';

interface UserFormProps {
  title: string;
  user?: IUser|null;
}

const UserForm: React.FC<UserFormProps> = ({ 
  title, 
  user
}) => {
  
  const [ isLoading, setIsLoading ] = useState<boolean>(false); 
  const router = useRouter(); 

  const initialValues: IUserMutate = {
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  }
  
  const handleFinish: FormProps<IUserMutate>['onFinish'] = async(values) => {
    setIsLoading(true);
    const payload = {
      ...values,
      password: values.password
    }
    const result = await create(payload);
    if(result.success) message.success(result.msgText || "Created Successfully!");
    else {
      message.error(result.msgText || "Failed to create!");
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    router.push('/user');
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
        <Form.Item<IUserMutate>
          label="Name"
          name="name"
          rules={[
            {
              required: true,
              message: 'Please input your name!',
            },
            {
              validator: textFieldValidator
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item<IUserMutate>
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: 'Please input your email!',
            },
            {
              type: 'email'
            },
            {
              validator: textFieldValidator
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item<IUserMutate>
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: 'Please input your password!',
            },
            {
              validator: textFieldValidator
            }
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          { !isLoading && (
            <Link href={"/user"} className='mr-3'>
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

export default withAuth(UserForm)