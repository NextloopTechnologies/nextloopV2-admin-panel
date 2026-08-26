"use client"

import { Button, Popconfirm, PopconfirmProps, Table, TableProps, message, Select, Input, Modal, Tooltip, Tag } from 'antd';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { categoryApi } from '.';
import { ICategory } from '@/types/blog';
import { withAuth } from '../auth';
import dayjs from 'dayjs';

const List: React.FC = () => {
  const [categoryData, setCategoryData] = useState<ICategory[]>([]);
  const [isError, setIsError] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);

  // Search, Filter & Sort State
  const [searchText, setSearchText] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Reassign Deletion Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingCategory, setDeletingCategory] = useState<ICategory | null>(null);
  const [reassignCategoryId, setReassignCategoryId] = useState<number | undefined>(undefined);
  const [isDeletingInProgress, setIsDeletingInProgress] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await categoryApi.list();
      const { success, data, count: totalCount } = result;
      if (success) {
        setCount(totalCount);
        setCategoryData(data || []);
      } else {
        setIsError("An error occurred while fetching categories.");
      }
    } catch (error) {
      console.error("CATEGORY_LIST_FETCH_ERROR", error);
      setIsError("Something went wrong while fetching categories!");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Deletion Click
  const handleDeleteClick = (record: ICategory) => {
    if (record.blogs_count && record.blogs_count > 0) {
      // Prevent deletion - open reassign modal
      setDeletingCategory(record);
      setReassignCategoryId(undefined);
      setIsDeleteModalOpen(true);
    } else {
      // Direct deletion confirmation
      Modal.confirm({
        title: 'Delete Category?',
        icon: <ExclamationCircleOutlined className="text-red-500" />,
        content: 'Are you sure you want to delete this category?',
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          try {
            setIsLoading(true);
            const { success, msgText } = await categoryApi.remove([record.id!]);
            if (success) {
              message.success(msgText || "Category deleted successfully!");
              fetchData();
            } else {
              message.error(msgText || "Failed to delete category.");
            }
          } catch (err) {
            console.error(err);
            message.error("An error occurred during deletion.");
          } finally {
            setIsLoading(false);
          }
        }
      });
    }
  };

  // Perform Reassignment & Deletion
  const handleReassignAndDelete = async () => {
    if (!deletingCategory || !reassignCategoryId) return;
    try {
      setIsDeletingInProgress(true);
      const { success, msgText } = await categoryApi.reassignAndRemove(deletingCategory.id!, reassignCategoryId);
      if (success) {
        message.success(msgText || "Blogs reassigned and category deleted successfully!");
        setIsDeleteModalOpen(false);
        setDeletingCategory(null);
        setReassignCategoryId(undefined);
        fetchData();
      } else {
        message.error(msgText || "Failed to delete category.");
      }
    } catch (err) {
      console.error(err);
      message.error("Something went wrong.");
    } finally {
      setIsDeletingInProgress(false);
    }
  };

  // Bulk Delete
  const deleteSelected = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      setIsLoading(true);
      // Filter out categories that contain blogs
      const selectedCategories = categoryData.filter(c => selectedRowKeys.includes(c.id!));
      const hasBlogs = selectedCategories.some(c => c.blogs_count && c.blogs_count > 0);

      if (hasBlogs) {
        message.error("Cannot perform bulk deletion: One or more selected categories contain blogs.");
        return;
      }

      const { success, msgText } = await categoryApi.remove(selectedRowKeys as number[]);
      if (success) {
        message.success(msgText || "Categories deleted successfully!");
        setSelectedRowKeys([]);
        fetchData();
      } else {
        message.error(msgText || "Failed to delete categories.");
      }
    } catch (err) {
      console.error(err);
      message.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // Search & Filter & Sort Computed Data
  const processedCategories = useMemo(() => {
    let result = [...categoryData];

    // Search filter
    if (searchText) {
      const q = searchText.toLowerCase();
      result = result.filter(c => c.name?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      if (sortBy === 'oldest') {
        return dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf();
      }
      if (sortBy === 'most-blogs') {
        return (b.blogs_count || 0) - (a.blogs_count || 0);
      }
      // Default: newest first
      return dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf();
    });

    return result;
  }, [categoryData, searchText, sortBy]);

  const columns: TableProps<ICategory>['columns'] = [
    {
      title: "Sr No.",
      dataIndex: "id",
      key: "id",
      render: (_, __, index) => ++index
    },
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <span className="font-semibold text-gray-800">{name}</span>
      )
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (slug) => (
        <code className="px-2 py-0.5 bg-gray-100 border rounded text-sm text-gray-700">{slug}</code>
      )
    },
    {
      title: "No. of Blogs",
      dataIndex: "blogs_count",
      key: "blogs_count",
      render: (count) => (
        <Tag color={count > 0 ? "blue" : "default"}>{count || 0}</Tag>
      )
    },
    {
      title: "Created On",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => date ? dayjs(date).format('DD MMM YYYY') : '-'
    },
    {
      title: "Last Updated",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (date) => date ? dayjs(date).format('DD MMM YYYY') : '-'
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Link href={`/blog/category/edit/${record.id}`}>
            <Tooltip title="Edit">
              <Button type="text" icon={<EditOutlined className="text-blue-500" />} />
            </Tooltip>
          </Link>
          <Tooltip title="Delete">
            <Button
              type="text"
              icon={<DeleteOutlined className="text-red-500" />}
              onClick={() => handleDeleteClick(record)}
            />
          </Tooltip>
        </div>
      )
    }
  ];

  const dataSource = processedCategories.map((c) => ({
    ...c,
    key: c.id
  }));

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  if (isError) {
    return (
      <div className="h-screen flex items-center justify-center text-xl text-red-500">
        {isError}
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-3xl text-gray-900">Category Management</h1>
        <div className="flex gap-3">
          <Link href="/blog">
            <Button size="large">Back to Blogs</Button>
          </Link>
          <Link href="/blog/category/create">
            <Button type="primary" size="large">
              + Add Category
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg flex flex-wrap gap-4 items-center border border-gray-200 mb-6">
        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="Search categories by name..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            size="large"
          />
        </div>
        <div className="w-[200px]">
          <Select
            placeholder="Sort by"
            style={{ width: '100%' }}
            value={sortBy}
            onChange={value => setSortBy(value)}
            size="large"
            options={[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'name-asc', label: 'Name (A–Z)' },
              { value: 'name-desc', label: 'Name (Z–A)' },
              { value: 'most-blogs', label: 'Most Blogs' }
            ]}
          />
        </div>

        {selectedRowKeys.length > 0 && (
          <Popconfirm
            title={`Are you sure you want to delete ${selectedRowKeys.length} selected categories?`}
            onConfirm={deleteSelected}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button danger type="primary" size="large">
              Delete Selected ({selectedRowKeys.length})
            </Button>
          </Popconfirm>
        )}
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: false
        }}
        locale={{
          emptyText: (
            <div className="py-16 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-1">No Categories Found</h3>
              <p className="text-gray-500 mb-6">Start by creating your first blog category.</p>
              <Link href="/blog/category/create">
                <Button type="primary" size="large">Create Category</Button>
              </Link>
            </div>
          )
        }}
      />

      {/* Delete and Reassign Dialog */}
      <Modal
        title="Delete Category"
        open={isDeleteModalOpen}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeletingCategory(null);
          setReassignCategoryId(undefined);
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="delete"
            danger
            type="primary"
            disabled={!reassignCategoryId}
            loading={isDeletingInProgress}
            onClick={handleReassignAndDelete}
          >
            Delete
          </Button>
        ]}
      >
        {deletingCategory && (
          <div className="py-3">
            <p className="text-gray-800 font-semibold mb-2">
              This category contains <span className="text-red-500 font-bold">{deletingCategory.blogs_count}</span> blog posts.
            </p>
            <p className="text-gray-600 mb-4">
              Please move these blogs to another category before deleting.
            </p>
            <label className="block text-gray-700 font-medium mb-1">Move Blogs To</label>
            <Select
              placeholder="Select Category"
              style={{ width: '100%' }}
              value={reassignCategoryId}
              onChange={value => setReassignCategoryId(value)}
              options={categoryData
                .filter(c => c.id !== deletingCategory.id)
                .map(c => ({ value: c.id, label: c.name }))}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default withAuth(List);
