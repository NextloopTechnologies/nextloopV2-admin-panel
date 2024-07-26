"use client"

import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Upload, message } from 'antd';
import { textFieldValidator } from '@/lib/utils';
import type { FormProps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ITestimonial } from '@/types/supabase';
import { testimonialApi } from '.';
import { withAuth } from '../auth';

interface TestimonialFormProps {
  title: string,
  testimonial?: ITestimonial | null,
}

const TestimonialForm: React.FC<TestimonialFormProps> = ({ 
  title, 
  testimonial
}) => {
  
  const [ isLoading, setIsLoading ] = useState<boolean>(false); 
  const router = useRouter(); 

  const initialValues: ITestimonial = {
    feedback_by: testimonial?.feedback_by || '',
    feedback_descp: testimonial?.feedback_descp || '',
    comp_and_desig: testimonial?.comp_and_desig || ''
  }

  const handleFinish: FormProps<ITestimonial>['onFinish'] = async(values) => {
    setIsLoading(true);
    const formData =  new FormData();
    formData.append("feedback_by", values.feedback_by as string);
    formData.append("feedback_descp", values.feedback_descp as string);
    formData.append("comp_and_desig", values.comp_and_desig as string);
    
    if(testimonial){
     formData.append("id", testimonial.id?.toString()!)
      const { success, msgText } = await testimonialApi.update(formData);
      if(success) message.success(msgText);
      else message.error(msgText  || "Failed to update!");
      setIsLoading(false);
      return router.push('/testimonial');
    }

    const { success, msgText } = await testimonialApi.create(formData); 
    if(success) message.success(msgText);
    else message.error(msgText  || "Failed to create!");
    setIsLoading(false);
    router.push('/testimonial');
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
        <Form.Item<ITestimonial>
          label="Feedback By"
          name="feedback_by"
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
        <Form.Item<ITestimonial>
          label="Feedback Description"
          name="feedback_descp"
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
        <Form.Item<ITestimonial>
          label="Company & Designation"
          name="comp_and_desig"
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
            <Link href={"/testimonial"} className='mr-3'>
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

export default withAuth(TestimonialForm)