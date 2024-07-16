"use client"

import { Button, Descriptions, Modal, Popconfirm, PopconfirmProps, Table, TableProps, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { SearchBox } from '../crud';
import Image from 'next/image';
import Edit from "../../public/images/icons/edit.png";
import Link from 'next/link';
import { testimonialApi } from '.';
import parse from "html-react-parser"
import { trimText } from '@/lib/utils';
import { ITestimonial } from '@/types/testimonial';
import { withAuth } from '../auth';

const List: React.FC = () => {

  const [testimonialData, setTestimonailData] = useState<ITestimonial[]>([]);
  const [searchedText, setSearchedText] = useState<string>("");
  const [isError, setIsError] = useState<string|null>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [pageNo, setPageNo] = useState<number>(1);
  const pageSize: number = 10;

  const fetchData = async () => {
    setIsLoading(true);
    const { success, data, count }  = await testimonialApi.list();
    if (success) {
      setCount(count);
      setTestimonailData(data);
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

  const columns: TableProps<ITestimonial>['columns'] = [
    {
      title: "Sr No.",
      dataIndex: "id",
      key: "id",
      render: (id, record, index) => ++index
    },
    {
      title: "Feedback By",
      dataIndex: "feedback_by",
      key: "feedback_by",
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        return String(record.feedback_by?.toLowerCase())
            .includes(String(value).toLowerCase())
      },
      render: (feedback_by, record) => (
        <Link href={`/testimonial/view/${record.id}`} className='text-blue-500'> 
          { feedback_by } 
        </Link>
      )
    },
    {
      title: "Feedback Descp",
      dataIndex: "feedback_descp",
      key: "feedback_descp",
      render: (feedback_descp) => parse(trimText(feedback_descp, 20))
    },
    {
      title: "Designation",
      dataIndex: "comp_and_desig",
      key: "comp_and_desig",
      render: (descp) => parse(trimText(descp, 20))
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
        <div className='flex'>
          <Link href={`/testimonial/edit/${record.id}`}>
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

  const dataSource: ITestimonial[] = testimonialData.map((testimonial: ITestimonial) => ({
    key: testimonial.id,
    id: testimonial.id,
    feedback_by: testimonial.feedback_by,
    feedback_descp: testimonial.feedback_descp,
    comp_and_desig: testimonial.comp_and_desig
  }));

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  
  // const deleteAll: PopconfirmProps['onConfirm'] = async () => {
  //   if (selectedRowKeys) {
  //     try {
  //       const { success, msgText } = await portfolioApi.remove(selectedRowKeys);
  //       if(!success) return message.error("Failed to Delete!");

  //       const deleteBucketImages = portfolioData.filter(portfolio => selectedRowKeys.includes(portfolio.id as React.Key)).flatMap(item => item?.image?.map(item => item.fileId) || [])
  //       if(deleteBucketImages.length) UploadFileService.deleteFiles(deleteBucketImages)
        
  //       const updatedPortfolioData = portfolioData.filter(portfolio => !selectedRowKeys.includes(portfolio.id as React.Key))
  //       setPortfolioData(updatedPortfolioData)
  //       setSelectedRowKeys([]);
  //       message.success(msgText);
  //     } catch (error) {
  //       message.error("Something went wrong!")
  //     }
  //   }
  // }

  return (
    <div className='content-container'>
      <h1 className='font-bold text-3xl'>All Testimonials</h1>
      <div className='flex justify-between mt-5'>
        <Link href={"/testimonial/create"}>
          <Button type="primary" size='large'>
            Add
          </Button>
        </Link>

        {selectedRowKeys.length >= 1 && (
          <Popconfirm
            title={`Do you really wanted to delete ${selectedRowKeys.length} items`}
            // onConfirm={deleteAll}
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