"use client"

import { Descriptions } from 'antd'
import React from 'react'
import { withAuth } from '../auth'
import { IEnquiry } from '@/types/supabase'

type ViewProps = {
    data: IEnquiry
}

const View: React.FC<ViewProps> = ({
    data
}) => {
    return (
        <div className='py-10 mx-24'>  
        <h1 className='mb-5 text-3xl font-bold '>View Enquiry</h1>
            <Descriptions
                bordered
                column={1}
                contentStyle={{ fontSize: 16, color: '#111111' }}
            >
                <Descriptions.Item label="Fullname">{data.fullname}</Descriptions.Item>
                <Descriptions.Item label="Email">{data.email}</Descriptions.Item>
                <Descriptions.Item label="Subject">{data.subject}</Descriptions.Item>
                <Descriptions.Item label="Contact">{data.contact || "NA"}</Descriptions.Item>
            </Descriptions>
        </div>
    )
}

export default withAuth(View)