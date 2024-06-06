"use client"

import { PortfolioService } from '@/app/api';
import { IPortfolio } from '@/types/portfolio'
import { Button, Descriptions, Modal, Popconfirm, Table, TableProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { SearchBox, ViewLink } from '../crud';
import Image from 'next/image';
import Edit from "../../public/images/icons/edit.png";
import Delete from "../../public/images/icons/delete.png";
import Link from 'next/link';
import { portfolioApi } from '.';

const List: React.FC = () => {

  const [portfolioData, setPortfolioData] = useState<IPortfolio[]>([]);
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
      render: (title) => (
        <ViewLink title={title} onClick={() => setIsViewModalOpen(true)} />
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
        // <ActionButton />
        <div className='flex'>
          <Link href={`/portfolio/edit/${record.id}`}>
            <Image  
              src={Edit}
              alt='edit' 
              height='20'
              className='mr-2 cursor-pointer'
              // onClick={() => console.log("Im clicked Edit")}
            />
          </Link>
          
          <Image  
            src={Delete}
            alt='delete' 
            height='20'
            className='cursor-pointer'
          />
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
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  
  const deleteAll = () => async () => {
    if (selectedRowKeys) {
      const deletePayload = {
        ids: [...selectedRowKeys],
      };
      // if (deletePayload) {
      //   const res = await deleteGuesList(deletePayload);
      //   if (res.success == true) {
      //     message.success(
      //       `${selectedRowKeys.length} items deleted successfully`
      //     );
      //     setSelectedRowKeys([]);
      //   }
      // }
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
        {selectedRowKeys.length > 1 && (
        
          <Popconfirm
            title={`Do you really wanted to delete ${selectedRowKeys.length} items`}
            onConfirm={() => deleteAll()}
          >
            {selectedRowKeys.length > 1 ? (
              <Button danger type="primary" size='large'>
                Delete ({selectedRowKeys.length})
              </Button>
            ) : (
              ""
            )}
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
        <Descriptions 
          bordered
          column={1}
          labelStyle={{ fontSize: 16, fontWeight: "semi-bold" }}
          contentStyle={{ fontSize: 16 }}
          // size="middle"
        >
          <Descriptions.Item label="Title">{dataSource[0]?.title}</Descriptions.Item>
          <Descriptions.Item label="Description">{dataSource[0]?.descp}</Descriptions.Item>
          {/* <Descriptions.Item label="Snaps">
            { dataSource[0]?.image ? (
                  <Image 
                    key={dataSource[0]?.id}  
                    width={200} 
                    height={200} 
                    src={dataSource[0]?.image} 
                    alt="image" 
                  />
              ) : `No snapshot available!`  
            }
          </Descriptions.Item> */}
        </Descriptions>
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