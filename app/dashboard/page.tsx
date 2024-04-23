"use client"

import React from 'react';
import { withAuth } from '@/components/auth';

const Dashboard: React.FC = () => {
  return (
    <div className='content-container'>Dashboard</div>
  )
}

export default withAuth(Dashboard);