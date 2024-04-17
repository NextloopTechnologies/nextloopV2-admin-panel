"use client"

import React from 'react';
import { withAuth } from '@/components/auth';

const Ideas: React.FC = () => {
  return (
    <div className='content-container'>Ideas</div>
  )
}

export default withAuth(Ideas);