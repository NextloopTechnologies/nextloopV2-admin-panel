"use client"

import { Button, Popconfirm, PopconfirmProps, Table, TableProps, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { appliedJobApi } from '.';
import { withAuth } from '../auth';
import { IAppliedJobView, IJob } from '@/types/supabase';
import { UploadFileService } from '@/app/api';
import { formattedDate } from '@/lib/utils';
import { jobApi } from '../job';
import { IAppliedJobFilters } from '@/types/applied_job';

const List: React.FC = () => {

  const [appliedJobData, setAppliedJobData] = useState<IAppliedJobView[]>([]);
  const [jobData, setJobData] = useState<IJob[]>([]);
  const [isError, setIsError] = useState<string|null>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [pageNo, setPageNo] = useState<number>(1);
  const [filters, setFilters] = useState<IAppliedJobFilters>({ title: null, experience: null })
  const pageSize: number = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log("pageNo", pageNo);
        const { success, data, count } = await appliedJobApi.list(pageNo, pageSize, filters);
        if (success) {
          setCount(count);
          setAppliedJobData(data);
        } else {
          setIsError("An error occurred while fetching data.");
        }
      } catch (error) {
        console.error("APPLIED_JOB_LIST_CONTROLLER", error);
        message.error("An error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pageNo, filters]);


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

  const columns: TableProps<IAppliedJobView>['columns'] = [
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
      filters: jobData?.map(({ title }) => ({ text: title!, value: title! })),
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
    },
    {
      title: "Applied On",
      dataIndex: "created_at",
      key: "created_at",
    }
  ];

  const dataSource: IAppliedJobView[] = appliedJobData.map((applied_job: IAppliedJobView) => ({
    ...applied_job,
    key: applied_job.id,
    title: applied_job.job_title,
    experience: applied_job.experience || "0-1",
    created_at: formattedDate(applied_job.created_at!),
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

      <Table <IAppliedJobView>
        className='mt-2'
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        pagination={{
          pageSize,
          total: count,
          current: pageNo,
        }}
        onChange={(pagination, filters ) => {
          //handle pagination
          setPageNo(pagination.current || 1);

          const titleFilters = Array.isArray(filters.title) && filters.title.length > 0 ? filters.title as [] : undefined;
          const experienceFilters = Array.isArray(filters.experience) && filters.experience.length > 0 ? filters.experience as [] : undefined;

          setFilters({
            title: titleFilters ?? null,
            experience: experienceFilters ?? null
          });
        }}
      />
    </div>
  )
}

export default withAuth(List);