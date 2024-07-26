"use client"

import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Upload, message } from 'antd';
import { textFieldValidator } from '@/lib/utils';
import type { FormProps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IJob } from '@/types/supabase';
import { jobApi } from '.';
import { withAuth } from '../auth';

interface JobFormProps {
  title: string,
  job?: IJob | null,
}

const JobForm: React.FC<JobFormProps> = ({ 
  title, 
  job
}) => {
  
  const [ isLoading, setIsLoading ] = useState<boolean>(false); 
  const router = useRouter(); 

  const initialValues: IJob = {
    title: job?.title || '',
    descp: job?.descp || '',
    location: job?.location || ''
  }

  const handleFinish: FormProps<IJob>['onFinish'] = async(values) => {
    setIsLoading(true);
    const formData =  new FormData();
    formData.append("title", values.title as string);
    formData.append("descp", values.descp as string);
    formData.append("location", values.location as string);
    
    if(job){
     formData.append("id", job.id?.toString()!)
      const { success, msgText } = await jobApi.update(formData);
      if(success) message.success(msgText);
      else message.error(msgText  || "Failed to update!");
      setIsLoading(false);
      return router.push('/job');
    }

    const { success, msgText } = await jobApi.create(formData); 
    if(success) message.success(msgText);
    else message.error(msgText  || "Failed to create!");
    setIsLoading(false);
    router.push('/job');
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
        <Form.Item<IJob>
          label="Feedback By"
          name="title"
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
        <Form.Item<IJob>
          label="Feedback Description"
          name="descp"
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
        <Form.Item<IJob>
          label="Company & Designation"
          name="location"
          rules={[
            {
              required: true,
              message: 'Please input your company and designation!',
            },
            {
              validator: textFieldValidator
            }
          ]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          { !isLoading && (
            <Link href={"/job"} className='mr-3'>
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

export default withAuth(JobForm)