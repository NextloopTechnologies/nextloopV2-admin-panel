"use client"

import { IBlog } from '@/types/blog';
import { Button, Popconfirm, PopconfirmProps, Table, TableProps, message, Select, DatePicker, Input, Modal, Tooltip } from 'antd';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { EyeOutlined } from '@ant-design/icons';
import Image from 'next/image';
import Edit from "../../public/images/icons/edit.png";
import Link from 'next/link';
import { blogApi } from '.';
import parse from "html-react-parser"
import { trimText } from '@/lib/utils';
import { withAuth } from '../auth';
import dayjs from 'dayjs';
import { authorApi } from '@/components/author';

const List: React.FC = () => {

  const [blogData, setBlogData] = useState<IBlog[]>([]);
  const [isError, setIsError] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);

  // Search & Filter State
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [filterAuthor, setFilterAuthor] = useState<string>("ALL");
  const [filterDateRange, setFilterDateRange] = useState<any>(null);

  // Authors state
  const [authorsList, setAuthorsList] = useState<{ id: number, name: string | null }[]>([]);

  // Preview state
  const [previewBlog, setPreviewBlog] = useState<IBlog | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await blogApi.list(1, 1000);
      const { success, data, count } = result;
      if (success) {
        setCount(count);
        setBlogData(data);
      } else {
        setIsError("An error occurred while fetching data.");
      }
    } catch (error) {
      console.error("BLOG_LIST_CONTROLLER", error);
      setIsError("Something went wrong while fetching data!");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const result = await authorApi.list(1, 100);
        if (result && result.data) {
          setAuthorsList(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch authors", err);
      }
    };
    fetchAuthors();
  }, []);

  if (isError) {
    return (
      <div className='h-screen flex items-center justify-center text-l'>
        {isError}
      </div>
    )
  }

  const filteredBlogs = useMemo(() => {
    return blogData.filter(blog => {
      // 1. Global Search
      if (globalSearch) {
        const query = globalSearch.toLowerCase();
        const titleMatch = blog.title?.toLowerCase().includes(query) || false;
        const descpMatch = blog.descp?.toLowerCase().includes(query) || false;
        const authorMatch = blog.author?.name?.toLowerCase().includes(query) || false;
        if (!titleMatch && !descpMatch && !authorMatch) return false;
      }

      // 2. Author Filter
      if (filterAuthor !== 'ALL') {
        const authorId = blog.author?.id?.toString();
        if (authorId !== filterAuthor) return false;
      }

      // 3. Date Range Filter
      if (filterDateRange && filterDateRange.length === 2) {
        const [start, end] = filterDateRange;
        if (blog.created_at) {
          const blogDate = dayjs(blog.created_at);
          if (blogDate.isBefore(start.startOf('day')) || blogDate.isAfter(end.endOf('day'))) {
            return false;
          }
        } else {
          return false;
        }
      }

      return true;
    });
  }, [blogData, globalSearch, filterAuthor, filterDateRange]);

  const columns: TableProps<any>['columns'] = [
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
      render: (author) => (
        author ? (
          <Link href={`/blog/author/view/${author.id}`} className='text-blue-500'>
            {author.name}
          </Link>
        ) : '-'
      )
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <Link href={`/blog/view/${record.id}`} className='text-blue-500'>
          {title}
        </Link>
      )
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (created_at) => created_at ? dayjs(created_at).format('DD-MM-YYYY') : '-'
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
        <div className='flex items-center gap-3'>
          <Tooltip title="Preview">
            <EyeOutlined
              style={{ fontSize: '20px', color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setPreviewBlog(record);
                setIsPreviewOpen(true);
              }}
            />
          </Tooltip>
          <Link href={`/blog/edit/${record.id}`}>
            <Tooltip title="Edit">
              <Image
                src={Edit}
                alt='edit'
                height={20}
                width={20}
                className='cursor-pointer'
              />
            </Tooltip>
          </Link>
        </div>
      )
    },
  ];

  const dataSource = filteredBlogs.map((blog: IBlog) => ({
    key: blog.id,
    id: blog.id,
    title: blog.title,
    descp: blog.descp,
    image: blog.image,
    author: blog.author,
    created_at: blog.created_at
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
        if (!success) return message.error("Failed to Delete!");

        const updatedBlogData = blogData.filter(blog => !selectedRowKeys.includes(blog.id as React.Key))
        setBlogData(updatedBlogData)
        setSelectedRowKeys([]);
        message.success(msgText);
      } catch (error) {
        message.error("Something went wrong!")
      }
    }
  }

  const handleResetFilters = () => {
    setGlobalSearch("");
    setFilterAuthor("ALL");
    setFilterDateRange(null);
  };

  return (
    <div className='content-container'>
      <h1 className='font-bold text-3xl mb-5'>All Blogs</h1>

      {/* Add Button & Filter Panel */}
      <div className='flex flex-wrap items-center gap-4 mb-6'>
        <Link href={"/blog/create"}>
          <Button type="primary" size='large' style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
            Add
          </Button>
        </Link>

        <div className='bg-gray-50 px-4 rounded-lg flex flex-wrap gap-4 items-center border border-gray-200 flex-1' style={{ minHeight: '40px', paddingTop: '4px', paddingBottom: '4px' }}>
          <div style={{ flex: '1 1 200px' }}>
            <Input
              placeholder="Search title, desc, author..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              allowClear
              style={{ height: '32px' }}
            />
          </div>

          <div style={{ width: 180 }}>
            <Select
              value={filterAuthor}
              onChange={setFilterAuthor}
              style={{ width: '100%', height: '32px' }}
              options={[
                { value: 'ALL', label: 'All Authors' },
                ...authorsList.map(a => ({ value: a.id.toString(), label: a.name || 'Unknown' }))
              ]}
            />
          </div>

          <div style={{ flex: '1 1 240px' }}>
            <DatePicker.RangePicker
              value={filterDateRange}
              onChange={setFilterDateRange}
              style={{ width: '100%', height: '32px' }}
            />
          </div>

          <div>
            <Button onClick={handleResetFilters} style={{ height: '32px', display: 'flex', alignItems: 'center' }}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className='flex justify-between items-center mb-2'>
        <span className='text-sm text-gray-500'>
          Showing {filteredBlogs.length} of {count} blogs
        </span>
        {selectedRowKeys.length >= 1 && (
          <Popconfirm
            title={`Do you really wanted to delete ${selectedRowKeys.length} items`}
            onConfirm={deleteAll}
          >
            <Button danger type="primary" size='middle'>
              Delete Selected ({selectedRowKeys.length})
            </Button>
          </Popconfirm>
        )}
      </div>

      <Table
        className='mt-2'
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        pagination={{
          pageSize: 10
        }}
      />

      <Modal
        title="Blog Preview"
        open={isPreviewOpen}
        onCancel={() => { setIsPreviewOpen(false); setPreviewBlog(null); }}
        footer={[
          <Button key="close" onClick={() => { setIsPreviewOpen(false); setPreviewBlog(null); }}>
            Close
          </Button>
        ]}
        width={800}
      >
        {previewBlog && (
          <div style={{ padding: '20px 0' }}>
            {previewBlog.image && previewBlog.image.length > 0 && (
              <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
                <img
                  src={previewBlog.image[0].url}
                  alt="Featured Banner"
                  style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }}
                />
              </div>
            )}
            <div className="flex gap-4 text-xs text-gray-500 mb-3">
              {previewBlog.author && <span>Author: <strong>{previewBlog.author.name}</strong></span>}
              {previewBlog.created_at && <span>Date: <strong>{dayjs(previewBlog.created_at).format('YYYY-MM-DD')}</strong></span>}
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: 15 }}>
              {previewBlog.title || 'Untitled Blog'}
            </h1>
            <div style={{ borderBottom: '1px solid #f0f0f0', marginBottom: 20 }} />
            <div className="ql-editor" style={{ fontSize: 16, lineHeight: 1.6 }}>
              {parse(previewBlog.descp || '')}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default withAuth(List);