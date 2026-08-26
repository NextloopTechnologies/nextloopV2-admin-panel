"use client"

import React, { useContext, useLayoutEffect, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import { ILogin } from '@/types/login';
import { AuthContext } from '../auth/AuthContext';
import { AuthContextProps } from '@/types/auth';
import { validateCredentials } from '@/app/api/services/user';

const headingTitle: string = "Log in to Nextloop Admin";

const LoginForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] =  useState<boolean>(false);
  const { authUser, login } = useContext<AuthContextProps>(AuthContext);
  
  useLayoutEffect(() => { 
    if(authUser) router.push('/dashboard');
  },[authUser]) 

  const handleSubmit = async (values: ILogin) => {
    setIsLoading(true);    
    if(await validateCredentials(values)) {
      login();
      return router.push('/dashboard') 
    }
    setIsLoading(false);
    message.error("Invalid Credentials!")
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md p-8 mt-10  border border-gray-300 rounded-md mx-auto">
      <h1 className='font-bold text-xl mb-10'>{headingTitle}</h1>
      <Form 
        onFinish={handleSubmit}
        size='large' 
        autoComplete="off"
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Login'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
};

export default LoginForm;
