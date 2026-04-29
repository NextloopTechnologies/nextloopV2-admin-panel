"use client"

import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { AuthContextProps } from '@/types/auth';
import { AuthContext } from '../auth/AuthContext';
import { Dropdown, MenuProps, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const router = useRouter();
  const { authUser, logout } = useContext<AuthContextProps>(AuthContext);

  const blogItems: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <Link href="/blog">
          Blogs
        </Link>
      ),
    },
    {
      key: '2',
      label: (
        <Link href="/blog/author">
          Authors
        </Link>
      ),
    },
  ];
  const careerItems: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <Link href="/job">
          Jobs
        </Link>
      ),
    },
    {
      key: '2',
      label: (
        <Link href="/job/applied_job">
          Applied Jobs
        </Link>
      ),
    },
  ];

  const handleOnClickLogout = () => {
    logout();
    router.push('/');
  }

  if (!authUser) return null
  return (
    <nav className="bg-white shadow-md px-4 py-2.5 flex justify-between items-center">
      <Link href="/dashboard"
        className="text-blue-600 font-bold text-xl">NextLoop
      </Link>

      <ul className="hidden md:flex text-black transition duration-200 list-none">
        <li>
          <Link href="/dashboard"
            className="py-2 px-3 hover:bg-gray-100 hover:rounded-md">Dashboard
          </Link>
        </li>
        <li>
          <Link href="/portfolio"
            className=" py-2 px-3 hover:bg-gray-100 hover:rounded-md">Portfolio
          </Link>
        </li>
        <li>
          <Dropdown menu={{ items: blogItems }} className='p-2'>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                Blog
                <DownOutlined style={{ fontSize: '80%'}}/>
              </Space>
            </a>
          </Dropdown>
        </li>
        <li>
          <Dropdown menu={{ items: careerItems }} className='p-2'>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                Career
                <DownOutlined style={{ fontSize: '80%'}}/>
              </Space>
            </a>
          </Dropdown>
        </li>
        <li>
          <Link href="/idea"
            className=" py-2 px-3 hover:bg-gray-100 hover:rounded-md">Idea
          </Link>
        </li>
        <li>
          <Link href="/enquiry"
            className=" py-2 px-3 hover:bg-gray-100 hover:rounded-md">Enquiry
          </Link>
        </li>
        <li>
          <Link href="/popup-form"
            className=" py-2 px-3 hover:bg-gray-100 hover:rounded-md">Popup Form
          </Link>
        </li>
        <li>
          <Link href="/testimonial"
            className=" py-2 px-3 hover:bg-gray-100 hover:rounded-md">Testimonial
          </Link>
        </li>
        <li>
          <Link href="/user"
            className=" py-2 px-3 hover:bg-gray-100 hover:rounded-md">User
          </Link>
        </li>
       
      </ul>

      <button
        className="bg-white border border-blue-600 text-blue-600 px-1.5 py-1.5 rounded hover:bg-blue-600 hover:text-white"
        onClick={handleOnClickLogout}
      >
        Logout
      </button>
    </nav>
  );
}

export default Navbar;
