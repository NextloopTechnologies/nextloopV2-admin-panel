"use client"

import { Descriptions } from 'antd'
import React from 'react'
import { IJob } from '@/types/supabase'
import { withAuth } from '../auth'

type ViewProps = {
    data: IJob|null
}

const View: React.FC<ViewProps> = ({
    data
}) => {
    return (
        <div className='py-10 mx-24'>  
        <h1 className='mb-5 text-3xl font-bold '>View Job</h1>
            <Descriptions
                bordered
                column={1}
                contentStyle={{ fontSize: 16, color: '#111111' }}
            >
                <Descriptions.Item label="Feedback By">{data?.title}</Descriptions.Item>
                <Descriptions.Item label="Feedback Description">{data?.descp}</Descriptions.Item>
                <Descriptions.Item label="Company & Designation">{data?.location}</Descriptions.Item>
            </Descriptions>
        </div>
    )
}

export default withAuth(View)