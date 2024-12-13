"use client"

import React, { useState } from 'react';
import { Button, Form, Input, Select, message } from 'antd';
import { textFieldValidator } from '@/lib/utils';
import type { FormProps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Enums, IJob } from '@/types/supabase';
import { jobApi } from '.';
import { withAuth } from '../auth';
import { JobModeOptions, JobTypeOptions } from '@/constants';

interface JobFormProps {
  title: string,
  job?: IJob | null,
}

const JobForm: React.FC<JobFormProps> = ({
  title,
  job
}) => {

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const initialValues = {
    title: job?.title || '',
    descp: job?.descp || '',
    responsibilities: job?.responsibilities?.join(',') || '',
    qualifications: job?.qualifications?.join(',') || '',
    skills: job?.skills?.join(',') || '',
    location: job?.location || '',
    job_mode: job?.job_mode || JobModeOptions[0] as Enums<'enum_job_mode'>,
    // package: job?.package,
    job_type: job?.job_type || JobTypeOptions[0] as Enums<'enum_job_type'>
  }
  
  const handleFinish: FormProps<IJob>['onFinish'] = async (values) => {
    setIsLoading(true);
    const responsibilities = (values.responsibilities! as unknown as string)
      .split(".,")
      .map((s) => s.trim() + ".");
    const qualifications = (values.qualifications! as unknown as string)
      .split(".,")
      .map((s) => s.trim() + ".");
    const skills = (values.skills! as unknown as string).split(",")
    
    const formData = new FormData();
    formData.append("title", values.title!);
    formData.append("descp", values.descp!);
    responsibilities?.map(responsibility => {
      formData.append('responsibilities[]', responsibility)
    });
    qualifications?.forEach(qualification => {
      formData.append('qualifications[]', qualification)
    });
    skills?.forEach(skill => {
      formData.append('skills[]', skill)
    });
    formData.append("location", values.location!);
    formData.append("job_mode", values.job_mode!);
    // formData.append("package", values.package!);
    formData.append("job_type", values.job_type!);

    if (job) {
      formData.append("id", job.id?.toString()!)
      const { success, msgText } = await jobApi.update(formData);
      if (success) message.success(msgText);
      else message.error(msgText || "Failed to update!");
      setIsLoading(false);
      return router.push('/job');
    }

    const { success, msgText } = await jobApi.create(formData);
    if (success) message.success(msgText);
    else message.error(msgText || "Failed to create!");
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
          <Input  placeholder='Ex. React Native Develeper'/>
        </Form.Item>
        <Form.Item<IJob>
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
          <Input.TextArea placeholder='Ex. We are looking for a passionate React Native Developer...'/>
        </Form.Item>
        <Form.Item<IJob>
          label="Responsibilities (Comma Separated)"
          name="responsibilities"
          rules={[
            {
              required: true,
              message: 'Please input your responsibilities',
            }
          ]}
        >
          <Input.TextArea placeholder='Ex. Managing native app., End-to-End App testing., Complete Deployment'/>
        </Form.Item>
        <Form.Item<IJob>
          label="Qualifications (Comma Separated)"
          name="qualifications"
          rules={[
            {
              required: true,
              message: 'Please input your qualifications!',
            }
          ]}
        >
          <Input.TextArea placeholder='Ex. Bachelors Degree in IT or realted Field., 2 years of experience in app development., Working in a paced environment'/>
        </Form.Item>
        <Form.Item<IJob>
          label="Skills (Comma Separated)"
          name="skills"
          rules={[
            {
              required: true,
              message: 'Please input your skills!',
            }
          ]}
        >
          <Input.TextArea placeholder='Ex. React Native, Firebase'/>
        </Form.Item>
        <Form.Item<IJob>
          label="Job Mode"
          name="job_mode"
        >
          <Select
            options={JobModeOptions.map((jobmode) => (
              { value: jobmode, label: jobmode }
            ))}
          />
        </Form.Item>
        <Form.Item<IJob>
          label="Location"
          name="location"
          rules={[
            {
              required: true,
              message: 'Please input your location!',
            },
            {
              validator: textFieldValidator
            }
          ]}
        >
          <Input placeholder='Ex. Indore'/>
        </Form.Item>
        <Form.Item<IJob>
          label="Job Type"
          name="job_type"
        >
          <Select
            options={JobTypeOptions.map((jobtype) => (
              { value: jobtype, label: jobtype }
            ))}
          />
        </Form.Item>
        {/* <Form.Item<IJob>
          label="Package"
          name="package"
          rules={[
            {
              required: true,
              message: 'Please input package!',
            },
            {
              validator: textFieldValidator
            }
          ]}
        >
          <Input placeholder='2-3LPA'/>
        </Form.Item> */}
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          {!isLoading && (
            <Link href={"/job"} className='mr-3'>
              <Button danger type="primary">
                Cancel
              </Button>
            </Link>
          )}
          <Button type="primary" htmlType="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Submit'}
          </Button>

        </Form.Item>
      </Form>
    </div>
  )
}

export default withAuth(JobForm)