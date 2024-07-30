"use client"

import { Button, Popconfirm, PopconfirmProps, Table, TableProps, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { SearchBox } from '../crud';
import Image from 'next/image';
import Edit from "../../public/images/icons/edit.png";
import Link from 'next/link';
import { appliedJobApi } from '.';
import { withAuth } from '../auth';
import { IAppliedJob } from '@/types/supabase';
import { UploadFileService } from '@/app/api';

const List: React.FC = () => {

  const [appliedJobData, setAppliedJobData] = useState<IAppliedJob[]>([]);
  const [searchedText, setSearchedText] = useState<string>("");
  const [isError, setIsError] = useState<string|null>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [pageNo, setPageNo] = useState<number>(1);
  const pageSize: number = 10;

  const fetchData = async () => {
    setIsLoading(true);
    const { success, data, count }  = await appliedJobApi.list();
    if (success) {
      setCount(count);      
      setAppliedJobData(data);
    } 
    else setIsError("An error occured while fetching data.")
    setIsLoading(false)
  };
  
  useEffect(() => {
    fetchData();
  },[pageNo]);

  if (isError) {
    return (
      <div className='h-screen flex items-center justify-center text-l'>
        {isError}
      </div>
    )
  }

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
      filteredValue: [searchedText],
      onFilter: (value, record) => {        
        return String(record.title?.toLowerCase())
            .includes(String(value).toLowerCase())
      },
      render: (title, record) => (
        <Link href={`/job/view/${record.job_id}`} className='text-blue-500'> 
          { title } 
        </Link>
      )
    },
    {
      title: "Fullname",
      dataIndex: "fullname",
      key: "fullname",
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        return String(record.fullname?.toLowerCase())
            .includes(String(value).toLowerCase())
      },
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
      title: "Action",
      key: "action",
      render: (record) => (
        <div className='flex'>
          <Link href={`/job/applied_job/edit/${record.id}`}>
            <Image  
              src={Edit}
              alt='edit' 
              height='20'
              className='mr-2 cursor-pointer'
            />
          </Link>
      </div>
      )
    },
  ];

  const dataSource: IAppliedJob[] = appliedJobData.map((applied_job: IAppliedJob) => ({
    key: applied_job.id,
    id: applied_job.id,
    title: applied_job.title,
    job_id: applied_job.job_id,
    fullname: applied_job.fullname,
    email: applied_job.email,
    phone: applied_job.phone,
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

        const deleteBucketImages = appliedJobData.filter(applied_job => selectedRowKeys.includes(applied_job.id as React.Key)).map(item => item.resumeId!)     
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
        <Link href={"/job/applied_job/create"}>
          <Button type="primary" size='large'>
            Add
          </Button>
        </Link>

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
        <SearchBox onSearchText={(value: string) => setSearchedText(value)} />
      </div>

      <Table 
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