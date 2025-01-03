"use client"

import { Button, Popconfirm, PopconfirmProps, Table, TableProps, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { appliedJobApi } from '.';
import { withAuth } from '../auth';
import { IAppliedJob, IJob } from '@/types/supabase';
import { UploadFileService } from '@/app/api';
import { formattedDate } from '@/lib/utils';
import { jobApi } from '../job';

const List: React.FC = () => {

  const [appliedJobData, setAppliedJobData] = useState<IAppliedJob[]>([]);
  const [jobData, setJobData] = useState<IJob[]>([]);
  const [isError, setIsError] = useState<string|null>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [pageNo, setPageNo] = useState<number>(1);
  const pageSize: number = 10;

  const fetchData =  useCallback(async () => {
    setIsLoading(true);
    const { success, data, count }  = await appliedJobApi.list(pageNo, pageSize);
    if (success) {
      setCount(count);      
      setAppliedJobData(data);
    } 
    else setIsError("An error occured while fetching data.")
    setIsLoading(false)
  }, [pageNo]);
  
  useEffect(() => {
    fetchData();
  },[pageNo]);

  useEffect(() => {
    async function fetchJobs() {
      setIsLoading(true);
      const { success, data } = await jobApi.list(pageNo, 1000);
      if (success) {
        setJobData(data);
      }
      else setIsError("An error occured while fetching job filter data.")
      setIsLoading(false)
    }
    fetchJobs()
  },[])

  if (isError) {
    return (
      <div className='h-screen flex items-center justify-center text-l'>
        {isError}
      </div>
    )
  }

  const uniqueJobTitleFilters = jobData?.map(({ title }) => ({ text: title!, value: title! }))

  const columns: TableProps<IAppliedJob>['columns'] = [
    {
      title: "Sr No.",
      dataIndex: "id",
      key: "id",
      render: (id, record, index) => ++index
    },
    {
      title: "Job Title",
      dataIndex: "title",
      key: "title",
      filters: uniqueJobTitleFilters,
      onFilter: (value, record) => record.title?.indexOf(value as string) === 0 || false,
      render: (title, record) => {        
        if(!title) return "NA"
        return (
          <Link href={`/job/view/${record.id}`} className='text-blue-500'>
            {title}
          </Link>
        )
      }
    },
    {
      title: "Fullname",
      dataIndex: "fullname",
      key: "fullname",
      render: (fullname, record) => (
        <Link href={`/job/applied_job/view/${record.id}`} className='text-blue-500'> 
          { fullname } 
        </Link>
      )
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Experience",
      dataIndex: "experience",
      key: "experience",
      filters: [
        { text: '0-1', value: '0-1'},
        { text: '1-3', value: '1-3'},
        { text: '3-5', value: '3-5'},
        { text: '5+',  value: '5+' }
      ], 
      onFilter: (value, record) => record.experience?.indexOf(value as string) === 0 || false
    },
    {
      title: "Applied On",
      dataIndex: "created_at",
      key: "created_at",
    }
  ];

  const dataSource: IAppliedJob[] = appliedJobData.map((applied_job: IAppliedJob) => ({
    key: applied_job.id,
    id: applied_job.id,
    title: applied_job.title,
    job_id: applied_job.job_id,
    fullname: applied_job.fullname,
    email: applied_job.email,
    phone: applied_job.phone,
    experience: applied_job.experience || "0-1",
    created_at: formattedDate(applied_job.created_at!)
  }));
  
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  
  const deleteAll: PopconfirmProps['onConfirm'] = async () => {
    if (selectedRowKeys) {
      try {
        const { success, msgText } = await appliedJobApi.remove(selectedRowKeys as number[]);
        if(!success) return message.error("Failed to Delete!");

        const deleteBucketImages = appliedJobData.filter(applied_job => selectedRowKeys.includes(applied_job.id as React.Key)).map(item => item.resume_id!)            
        if(deleteBucketImages.length) UploadFileService.deleteFiles(deleteBucketImages)
        
        const updatedAppliedJobData = appliedJobData.filter(applied_job => !selectedRowKeys.includes(applied_job.id as React.Key))
        setAppliedJobData(updatedAppliedJobData)
        setSelectedRowKeys([]);
        message.success(msgText);
      } catch (error) {
        message.error("Something went wrong!")
      }
    }
  }

  return (
    <div className='content-container'>
      <h1 className='font-bold text-3xl'>All Applied Jobs</h1>
      <div className='flex justify-between mt-5'>
        {selectedRowKeys.length >= 1 && (
          <Popconfirm
            title={`Do you really wanted to delete ${selectedRowKeys.length} items`}
            onConfirm={deleteAll}
          >
            <Button danger type="primary" size='large'>
              Delete ({selectedRowKeys.length})
            </Button>
          </Popconfirm>
        )}
      </div>

      <Table <IAppliedJob>
        className='mt-2'
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        pagination={{
          pageSize,
          total: count,
          onChange: (page) => setPageNo(page)
        }}
      />
    </div>
  )
}

export default withAuth(List);