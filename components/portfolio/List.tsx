"use client"

import { IPortfolio } from '@/types/portfolio'
import { Button, Descriptions, Modal, Popconfirm, PopconfirmProps, Table, TableProps, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { SearchBox } from '../crud';
import Image from 'next/image';
import Edit from "../../public/images/icons/edit.png";
import Link from 'next/link';
import { portfolioApi } from '.';
import { UploadFileService } from '@/app/api';

const List: React.FC = () => {

  const [portfolioData, setPortfolioData] = useState<IPortfolio[]>([]);
  const [viewPortfolioData, setViewPortfolioData] = useState<IPortfolio>();
  const [searchedText, setSearchedText] = useState<string>("");
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isError, setIsError] = useState<string|null>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [pageNo, setPageNo] = useState<number>(1);
  const pageSize: number = 10;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { success, data, count }  = await portfolioApi.list();
      if (success) {
        setCount(count);
        setPortfolioData(data as IPortfolio[]);
      } 
      else setIsError("An error occured while fetching data.")
      setIsLoading(false)
    };
    fetchData();
  },[pageNo]);

  const handleViewModalOpen = (values : IPortfolio) => {
    setViewPortfolioData(values)
    setIsViewModalOpen(true);
  }

  if (isError) {
    return (
      <div className='h-screen flex items-center justify-center text-l'>
        {isError}
      </div>
    )
  }

  const columns: TableProps<IPortfolio>['columns'] = [
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
        <span onClick={() => handleViewModalOpen(record)} className='text-blue cursor-pointer'>
          { title }
        </span>
      )
    },
    {
      title: "Description",
      dataIndex: "descp",
      key: "descp"
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
              alt='portfolio-image'
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
          <Link href={`/portfolio/edit/${record.id}`}>
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

  const dataSource: IPortfolio[] = portfolioData.map((portfolio: IPortfolio) => ({
    key: portfolio.id,
    id: portfolio.id,
    title: portfolio.title,
    descp: portfolio.descp,
    image: portfolio.image
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
        const { success, msgText } = await portfolioApi.remove(selectedRowKeys);
        if(!success) return message.error("Failed to Delete!");

        const deleteBucketImages = portfolioData.filter(portfolio => selectedRowKeys.includes(portfolio.id as React.Key)).flatMap(item => item?.image?.map(item => item.fileId) || [])
        if(deleteBucketImages.length) UploadFileService.deleteFiles(deleteBucketImages)
        
        const updatedPortfolioData = portfolioData.filter(portfolio => !selectedRowKeys.includes(portfolio.id as React.Key))
        setPortfolioData(updatedPortfolioData)
        setSelectedRowKeys([]);
        message.success(msgText);
      } catch (error) {
        message.error("Something went wrong!")
      }
    }
  }

  return (
    <div className='content-container'>
      <h1 className='font-bold text-3xl'>All Portfolios</h1>
      <div className='flex justify-between mt-5'>
        <Link href={"/portfolio/create"}>
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

      {/* View Modal */}
      <Modal
        open={isViewModalOpen}
        title="View Portfolio"
        onCancel={() => setIsViewModalOpen(false)} 
      >  
      { viewPortfolioData && (
        <Descriptions 
        bordered
        column={1}
        labelStyle={{ fontSize: 16, fontWeight: "semi-bold" }}
        contentStyle={{ fontSize: 16 }}
      >
        <Descriptions.Item label="Title">{viewPortfolioData?.title}</Descriptions.Item>
        <Descriptions.Item label="Description">{viewPortfolioData?.descp}</Descriptions.Item>
        <Descriptions.Item label="Snaps">
          { viewPortfolioData?.image?.length ? (
                <Image 
                  key={viewPortfolioData?.id}  
                  width={200} 
                  height={200}
                  src={viewPortfolioData.image[0].url} 
                  alt="image" 
                />
            ) : `No snapshot available!`  
          }
        </Descriptions.Item>
      </Descriptions>
      )}
        
      </Modal>

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

export default List;