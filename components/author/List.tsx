"use client"

import { Button, Popconfirm, PopconfirmProps, Table, TableProps, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { SearchBox } from '../crud';
import Image from 'next/image';
import Edit from "../../public/images/icons/edit.png";
import Link from 'next/link';
import { authorApi } from '.';
import { IAuthor } from '@/types/supabase';
import { withAuth } from '../auth';

const List: React.FC = () => {

  const [authorData, setAuthorData] = useState<IAuthor[]>([]);
  const [searchedText, setSearchedText] = useState<string>("");
  const [isError, setIsError] = useState<string|null>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [pageNo, setPageNo] = useState<number>(1);
  const pageSize: number = 10;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const { success, data, count }  = await authorApi.list(pageNo, pageSize);
    if (success) {
      setCount(count);
      setAuthorData(data);
    } 
    else setIsError("An error occured while fetching data.")
    setIsLoading(false)
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

  const columns: TableProps<IAuthor>['columns'] = [
    {
      title: "Sr No.",
      dataIndex: "id",
      key: "id",
      render: (id, record, index) => ++index
    },
    {
      title: "Author Name",
      dataIndex: "name",
      key: "name",
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        return String(record.name?.toLowerCase())
            .includes(String(value).toLowerCase())
      },
      render: (name, record) => (
        <Link href={`/blog/author/view/${record.id}`} className='text-blue-500'> 
          { name } 
        </Link>
      )
    },
    {
      title: "Designaton",
      dataIndex: "designation",
      key: "designation"
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
        <div className='flex'>
          <Link href={`/blog/author/edit/${record.id}`}>
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

  const dataSource: IAuthor[] = authorData.map((author: IAuthor) => ({
    key: author.id,
    id: author.id,
    name: author.name,
    designation: author.designation
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
        const { success, msgText } = await authorApi.remove(selectedRowKeys as number[]);
        if(!success) return message.error("Failed to Delete!");

        const updatedAuthorData = authorData.filter(author => !selectedRowKeys.includes(author.id as React.Key))
        setAuthorData(updatedAuthorData)
        setSelectedRowKeys([]);
        message.success(msgText);
      } catch (error) {
        message.error("Something went wrong!")
      }
    }
  }

  return (
    <div className='content-container'>
      <h1 className='font-bold text-3xl'>All Authors</h1>
      <div className='flex justify-between mt-5'>
        <Link href={"/blog/author/create"}>
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