"use client"

import { Button, Popconfirm, PopconfirmProps, Table, TableProps, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { SearchBox } from '../crud';
import Link from 'next/link';
import { IUser } from '@/types/supabase';
import { withAuth } from '../auth';
import { list, remove } from './userApi';
import { responseMessage, thrownErrorMessage } from '../crud/apiResponse';

const List: React.FC = () => {

  const [userData, setUserData] = useState<IUser[]>([]);
  const [searchedText, setSearchedText] = useState<string>("");
  const [isError, setIsError] = useState<string|null>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [pageNo, setPageNo] = useState<number>(1);
  const pageSize: number = 10;

  const fetchData =  useCallback(async () => { 
    try {
      setIsLoading(true);
      const result = await list(pageNo, pageSize);
      const { data, count } = result;
      if (result.success) {
        setCount(count || 0);
        setUserData(Array.isArray(data) ? data : []);
        setIsError(null);
      } else setIsError(responseMessage(result, "Unable to load users."));
    } catch (error) {
      setIsError(thrownErrorMessage(error, "Unable to load users."));
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

  const columns: TableProps<IUser>['columns'] = [
    {
      title: "Sr No.",
      dataIndex: "id",
      key: "id",
      render: (id, record, index) => ++index
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        return String(record.name?.toLowerCase())
            .includes(String(value).toLowerCase())
      }
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email"
    }
  ];

  const dataSource: IUser[] = userData.map((user: IUser) => ({
    key: user.id,
    id: user.id,
    name: user.name,
    email: user.email
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
        const result = await remove(selectedRowKeys as number[]);
        if(!result.success) return message.error(result.msgText || "Failed to Delete!");

        const updatedUserData = userData.filter(user => !selectedRowKeys.includes(user.id as React.Key))
        setUserData(updatedUserData)
        setSelectedRowKeys([]);
        message.success("Deleted!");
      } catch (error) {
        message.error("Something went wrong!")
      }
    }
  }

  return (
    <div className='content-container'>
      <h1 className='font-bold text-3xl'>All Users</h1>
      <div className='flex justify-between mt-5'>
        <Link href={"/user/create"}>
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
        locale={{ emptyText: 'No records found.' }}
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