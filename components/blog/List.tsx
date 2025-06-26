"use client"

import { IBlog } from '@/types/blog';
import { Button, Popconfirm, PopconfirmProps, Table, TableProps, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { SearchBox } from '../crud';
import Image from 'next/image';
import Edit from "../../public/images/icons/edit.png";
import Link from 'next/link';
import { blogApi } from '.';

import parse from "html-react-parser"
import { trimText } from '@/lib/utils';
import { withAuth } from '../auth';

const List: React.FC = () => {

  const [blogData, setBlogData] = useState<IBlog[]>([]);
  const [searchedText, setSearchedText] = useState<string>("");
  const [isError, setIsError] = useState<string|null>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [pageNo, setPageNo] = useState<number>(1);
  const pageSize: number = 10;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await blogApi.list(pageNo, pageSize);
      const { success, data, count }  = result;
      if (success){
        setCount(count);      
        setBlogData(data);
      } 
        
      else setIsError("An error occured while fetching data.")
    } catch (error) {
      console.error("BLOG_LIST_CONTROLLER", error);
      setIsError("Something went wrong while fetching data!");
    } finally {
      setIsLoading(false);
    }
  }, [pageNo]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isError) {
    return (
      <div className='h-screen flex items-center justify-center text-l'>
        {isError}
      </div>
    )
  }

  const columns: TableProps<IBlog>['columns'] = [
    {
      title: "Sr No.",
      dataIndex: "id",
      key: "id",
      render: (id, record, index) => ++index
    },
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
      filteredValue: [searchedText],
      onFilter: (value, record) => {        
        return String(record.author?.name?.toLowerCase())
            .includes(String(value).toLowerCase())
      },
      render: ({ id, name }) => (
        <Link href={`/blog/author/view/${id}`} className='text-blue-500'> 
          { name } 
        </Link>
      )
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
        <Link href={`/blog/view/${record.id}`} className='text-blue-500'> 
          { title } 
        </Link>
      )
    },
    {
      title: "Description",
      dataIndex: "descp",
      key: "descp",
      render: (descp) => parse(trimText(descp, 20))
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) => {
        const imageSrc: string = image?.[0]?.url;
        return (
          imageSrc ? (
            <Image 
              src={imageSrc}
              alt='blog-image'
              height={100}
              width={100} 
            />
          ) : (
            <p> No image! </p>
          )
        );
      }
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
        <div className='flex'>
          <Link href={`/blog/edit/${record.id}`}>
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

  const dataSource: IBlog[] = blogData.map((blog: IBlog) => ({
    key: blog.id,
    id: blog.id,
    title: blog.title,
    descp: blog.descp,
    image: blog.image,
    author: blog.author
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
        const { success, msgText } = await blogApi.remove(selectedRowKeys as number[]);
        if(!success) return message.error("Failed to Delete!");
 
        const updatedBlogData = blogData.filter(blog => !selectedRowKeys.includes(blog.id as React.Key))
        setBlogData(updatedBlogData)
        setSelectedRowKeys([]);
        message.success(msgText);
      } catch (error) {
        message.error("Something went wrong!")
      }
    }
  }

  return (
    <div className='content-container'>
      <h1 className='font-bold text-3xl'>All Blogs</h1>
      <div className='flex justify-between mt-5'>
        <Link href={"/blog/create"}>
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