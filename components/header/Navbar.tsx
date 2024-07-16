"use client"

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { AuthContextProps } from '@/types/auth';
import { AuthContext } from '../auth/AuthContext';

const Navbar: React.FC = () => {
  const router = useRouter();
  const { authUser, logout } = useContext<AuthContextProps>(AuthContext);

  const handleOnClickLogout = () => {
    logout();
    router.push('/');
  }

  if(!authUser) return null
  return (
    <nav className="bg-white shadow-md px-4 py-2.5 flex justify-between items-center">
      <Link href="/dashboard" 
        className="text-blue-600 font-bold text-xl">NextLoop 
      </Link>

      <ul className="hidden md:flex space-x-4 list-none">
        <li>
          <Link href="/dashboard"
            className="text-gray-700 hover:text-blue-600 transition duration-200">Dashboard
          </Link>
        </li>
        <li>
          <Link href="/careers"
            className="text-gray-700 hover:text-blue-600 transition duration-200">Careers
          </Link>
        </li>
        <li>
          <Link href="/blogs"
            className="text-gray-700 hover:text-blue-600 transition duration-200">Blogs
          </Link>
        </li>
        <li>
          <Link href="/ideas"
            className="text-gray-700 hover:text-blue-600 transition duration-200">Ideas
          </Link>
        </li>
        <li>
          <Link href="/testimonial"
            className="text-gray-700 hover:text-blue-600 transition duration-200">Testimonials
          </Link>
        </li>
        <li>
          <Link href="/portfolio"
          className="text-gray-700 hover:text-blue-600 transition duration-200">Portfolio
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
