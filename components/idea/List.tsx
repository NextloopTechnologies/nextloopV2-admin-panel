"use client"

import { Button, Popconfirm, PopconfirmProps, Table, TableProps, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { SearchBox } from '../crud';
import Link from 'next/link';
import { ideaApi } from '.';
import { trimText } from '@/lib/utils';
import { withAuth } from '../auth';
import { IIdea } from '@/types/idea';

const List: React.FC = () => {

  const [ideaData, setIdeaData] = useState<IIdea[]>([]);
  const [searchedText, setSearchedText] = useState<string>("");
  const [isError, setIsError] = useState<string|null>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [pageNo, setPageNo] = useState<number>(1);
  const pageSize: number = 10;

  const fetchData = async () => {
    setIsLoading(true);
    const { success, data, count }  = await ideaApi.list();
    if (success) {
      setCount(count);
      setIdeaData(data);
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

  const columns: TableProps<IIdea>['columns'] = [
    {
      title: "Sr No.",
      dataIndex: "id",
      key: "id",
      render: (id, record, index) => ++index
    },
    {
      title: "Mail",
      dataIndex: "mail",
      key: "mail",
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        return String(record.mail?.toLowerCase())
            .includes(String(value).toLowerCase())
      },
      render: (mail, record) => (
        <Link href={`/idea/view/${record.id}`} className='text-blue-500'> 
          { mail } 
        </Link>
      )
    },
    {
      title: "Idea Description",
      dataIndex: "idea_descp",
      key: "idea_descp",
      render: (idea_descp) => trimText(idea_descp, 20)
    }
  ];

  const dataSource: IIdea[] = ideaData.map((idea: IIdea) => ({
    key: idea.id,
    id: idea.id,
    mail: idea.mail,
    idea_descp: idea.idea_descp
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
        const { success, msgText } = await ideaApi.remove(selectedRowKeys);
        if(!success) return message.error("Failed to Delete!");

        const updatedIdeaData = ideaData.filter(idea => !selectedRowKeys.includes(idea.id as React.Key))
        setIdeaData(updatedIdeaData)
        setSelectedRowKeys([]);
        message.success(msgText);
      } catch (error) {
        message.error("Something went wrong!")
      }
    }
  }

  return (
    <div className='content-container'>
      <h1 className='font-bold text-3xl'>All Ideas</h1>
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