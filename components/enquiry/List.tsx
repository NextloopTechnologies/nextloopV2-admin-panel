"use client"

import { Button, Popconfirm, PopconfirmProps, Table, TableProps, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { SearchBox } from '../crud';
import Link from 'next/link';
import { enquiryApi } from '.';
import { withAuth } from '../auth';
import { IEnquiry } from '@/types/supabase';
import { formattedDate, trimText } from '@/lib/utils';

const List: React.FC = () => {

  const [enquiryData, setEnquiryData] = useState<IEnquiry[]>([]);
  const [searchedText, setSearchedText] = useState<string>("");
  const [isError, setIsError] = useState<string|null>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [pageNo, setPageNo] = useState<number>(1);
  const pageSize: number = 10;

  const fetchData = useCallback(async () => {    
    setIsLoading(true);
    try {
      const { success, data, count }  = await enquiryApi.list(pageNo, pageSize);
      if (success) {
        setCount(count);
        setEnquiryData(data);
      } 
    } catch (error) {
      setIsError("An error occured while fetching data.")
    } finally {
      setIsLoading(false)
    }   
  }, [pageNo]);
  
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

  const columns: TableProps<IEnquiry>['columns'] = [
    {
      title: "Sr No.",
      dataIndex: "id",
      key: "id",
      render: (id, record, index) => ++index
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
        <Link href={`/enquiry/view/${record.id}`} className='text-blue-500'> 
          { fullname } 
        </Link>
      )
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email"
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact"
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject"
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (message) => trimText(message, 20)
    },
    {
      title: "Enquired On",
      dataIndex: "created_at",
      key: "created_at",
    }
  ];

  const dataSource: IEnquiry[] = enquiryData.map((enquiry: IEnquiry) => ({
    key: enquiry.id,
    id: enquiry.id,
    fullname: enquiry.fullname,
    email: enquiry.email,
    contact: enquiry.contact || "NA",
    subject: enquiry.subject,
    message: enquiry.message,
    created_at: formattedDate(enquiry.created_at!)
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
        const { success, msgText } = await enquiryApi.remove(selectedRowKeys as number[]);
        if(!success) return message.error("Failed to Delete!");

        const updatedIdeaData = enquiryData.filter(idea => !selectedRowKeys.includes(idea.id as React.Key))
        setEnquiryData(updatedIdeaData)
        setSelectedRowKeys([]);
        message.success(msgText);
      } catch (error) {
        message.error("Something went wrong!")
      }
    }
  }

  return (
    <div className='content-container'>
      <h1 className='font-bold text-3xl'>All Enquiries</h1>
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