"use client"

import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { textFieldValidator } from '@/lib/utils';
import type { FormProps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IUser, IUserMutate } from '@/types/supabase';
import { withAuth } from '../auth';
import { create, hashPassword, userExists } from '@/app/api/services/user';

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
    const isUserExists = await userExists(values.email)
    if(isUserExists != null) {
      message.error("Email already taken!")
      setIsLoading(false)
      return
    }
    const payload = {
      ...values,
      password: await hashPassword(values.password)
    }
    const data  = await create(payload);    
    if(data != null ) message.success("Created Successfully!");
    else message.error("Failed to create!");
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