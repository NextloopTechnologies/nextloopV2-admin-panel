"use client"

import { Button, Popconfirm, PopconfirmProps, Table, TableProps, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { SearchBox } from '../crud';
import Link from 'next/link';
import { popupFormApi } from '.';
import { withAuth } from '../auth';
import { IPopupForm } from '@/types/supabase';
import { formattedDate, trimText } from '@/lib/utils';
import { responseMessage, thrownErrorMessage } from '../crud/apiResponse';

const List: React.FC = () => {

  const [popupFormData, setPopupFormData] = useState<IPopupForm[]>([]);
  const [searchedText, setSearchedText] = useState<string>("");
  const [isError, setIsError] = useState<string | null>("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [pageNo, setPageNo] = useState<number>(1);
  const pageSize: number = 10;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await popupFormApi.list(pageNo, pageSize);
      if (result?.success) {
        setCount(result.count || 0);
        setPopupFormData(Array.isArray(result.data) ? result.data : []);
        setIsError(null);
      } else setIsError(responseMessage(result, "Unable to load popup forms."));
    } catch (error) {
      setIsError(thrownErrorMessage(error, "Unable to load popup forms."))
    } finally {
      setIsLoading(false)
    }
  }, [pageNo]);

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

  const columns: TableProps<IPopupForm>['columns'] = [
    {
      title: "Sr No.",
      dataIndex: "id",
      key: "id",
      render: (id, record, index) => ++index
    },
    {
      title: "Full Name",
      dataIndex: "name",
      key: "name",
      filteredValue: [searchedText],
      onFilter: (value, record) => {
        return String(record.name?.toLowerCase())
          .includes(String(value).toLowerCase())
      },
      render: (name, record) => (
        <Link href={`/popup-form/view/${record.id}`} className='text-blue-500'>
          {name}
        </Link>
      )
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email"
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone"
    },
    {
      title: "Service",
      dataIndex: "service",
      key: "service"
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country"
    },
    {
      title: "Submitted On",
      dataIndex: "created_at",
      key: "created_at",
    }
  ];

  const dataSource: IPopupForm[] = popupFormData.map((item: IPopupForm) => ({
    key: item.id,
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone || "NA",
    service: item.service,
    country: item.country || "NA",
    created_at: formattedDate(item.created_at!)
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
        const { success, msgText } = await popupFormApi.remove(selectedRowKeys as string[]); 
        if (!success) return message.error("Failed to Delete!");

        const updatedData = popupFormData.filter(item => !selectedRowKeys.includes(item.id as React.Key));
        setPopupFormData(updatedData);
        setSelectedRowKeys([]);
        message.success(msgText);
      } catch (error) {
        message.error("Something went wrong!")
      }
    }
  }

  return (
    <div className='content-container'>
      <h1 className='font-bold text-3xl'>All Popup Form Enquiries</h1>
      <div className='flex justify-between mt-5'>
        {selectedRowKeys.length >= 1 && (
          <Popconfirm
            title={`Do you really want to delete ${selectedRowKeys.length} items`}
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