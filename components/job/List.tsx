"use client"

import { Button, Popconfirm, PopconfirmProps, Switch, Table, TableProps, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { SearchBox } from '../crud';
import Image from 'next/image';
import Edit from "../../public/images/icons/edit.png";
import Link from 'next/link';
import { jobApi } from '.';
import { trimText } from '@/lib/utils';
import { IJob } from '@/types/supabase';
import { withAuth } from '../auth';
import { JobService } from '@/app/api';

const List: React.FC = () => {

  const [jobData, setJobData] = useState<IJob[]>([]);
  const [searchedText, setSearchedText] = useState<string>("");
  const [isError, setIsError] = useState<string | null>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [pageNo, setPageNo] = useState<number>(1);
  const pageSize: number = 10;

  const fetchData = async () => {
    setIsLoading(true);
    const { success, data, count } = await jobApi.list();
    if (success) {
      setCount(count);
      setJobData(data);
    }
    else setIsError("An error occured while fetching data.")
    setIsLoading(false)
  };

  useEffect(() => {
    fetchData();
  }, [pageNo]);

  if (isError) {
    return (
      <div className='h-screen flex items-center justify-center text-l'>
        {isError}
      </div>
    )
  }

  const columns: TableProps<IJob>['columns'] = [
    {
      title: "Sr No.",
      dataIndex: "id",
      key: "id",
      render: (id, record, index) => ++index
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        return String(record.title?.toLowerCase())
          .includes(String(value).toLowerCase())
      },
      render: (title, record) => (
        <Link href={`/job/view/${record.id}`} className='text-blue-500'>
          {title}
        </Link>
      )
    },
    {
      title: "Description",
      dataIndex: "descp",
      key: "descp",
      render: (descp) => trimText(descp, 20)
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location"
    },
    {
      title: "Visibility",
      dataIndex: "visibility",
      key: "visibility",
      render: (visibility, record) => (
        <Switch
          checked={visibility}
          onChange={async (checked: boolean) => {
            setIsLoading(true)
            try {
              const { success, msgText } = await JobService.update({ visibility: checked }, record.id as number)
              if (!success) return message.error(msgText)
              const updatedJobData = jobData.map((job) => {
                if (job.id === record.id) {
                  return {
                    ...job,
                    visibility: checked
                  }
                }
                return job
              })
              setJobData(updatedJobData)
              message.success(msgText)
            } catch (error) {
              message.error("Semething went wrong!")
            }
            setIsLoading(false)
          }}
          loading={isLoading}
        />
      )
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
        <div className='flex'>
          <Link href={`/job/edit/${record.id}`}>
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

  const dataSource: IJob[] = jobData.map((job: IJob) => ({
    key: job.id,
    id: job.id,
    title: job.title,
    descp: job.descp,
    visibility: job.visibility,
    location: job.location
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
        const { success, msgText } = await jobApi.remove(selectedRowKeys as number[]);
        if (!success) return message.error("Failed to Delete!");

        const updatedJobData = jobData.filter(job => !selectedRowKeys.includes(job.id as React.Key))
        setJobData(updatedJobData)
        setSelectedRowKeys([]);
        message.success(msgText);
      } catch (error) {
        message.error("Something went wrong!")
      }
    }
  }

  return (
    <div className='content-container'>
      <h1 className='font-bold text-3xl'>All Jobs</h1>
      <div className='flex justify-between mt-5'>
        <Link href={"/job/create"}>
          <Button type="primary" size='large'>
            Add
          </Button>
        </Link>

        {selectedRowKeys.length >= 1 && (
          <Popconfirm
            title={`Do you really wanted to delete ${selectedRowKeys.length} items?`}
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