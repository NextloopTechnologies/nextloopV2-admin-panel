"use client"

import { IBlog } from '@/types/blog';
import { Button, Popconfirm, PopconfirmProps, Table, TableProps, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { SearchBox } from '../crud';
import Image from 'next/image';
import Edit from "../../public/images/icons/edit.png";
import Link from 'next/link';
import { blogApi } from '.';

import { UploadFileService } from '@/app/api';
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

  const fetchData = async () => {
    setIsLoading(true);
    const { success, data, count }  = await blogApi.list();
    if (success) {
      setCount(count);
      setBlogData(data as IBlog[]);
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

  const columns: TableProps<IBlog>['columns'] = [
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
    image: blog.image
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
        const { success, msgText } = await blogApi.remove(selectedRowKeys);
        if(!success) return message.error("Failed to Delete!");

        const deleteBucketImages = blogData.filter(blog => selectedRowKeys.includes(blog.id as React.Key)).flatMap(item => item?.image?.map(item => item.fileId) || [])
        if(deleteBucketImages.length) UploadFileService.deleteFiles(deleteBucketImages)
        
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