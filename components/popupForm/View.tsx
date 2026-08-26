"use client"

import { Descriptions } from 'antd'
import React from 'react'
import { withAuth } from '../auth'
import { IPopupForm } from '@/types/supabase'

type ViewProps = {
    data: IPopupForm
}

const View: React.FC<ViewProps> = ({
    data
}) => {
    return (
        <div className='py-10 mx-24'>  
            <h1 className='mb-5 text-3xl font-bold'>View Popup Form</h1>
            <Descriptions
                bordered
                column={1}
                contentStyle={{ fontSize: 16, color: '#111111' }}
            >
                <Descriptions.Item label="Full Name">{data.name}</Descriptions.Item>
                <Descriptions.Item label="Email">{data.email}</Descriptions.Item>
                <Descriptions.Item label="Service">{data.service}</Descriptions.Item>
                <Descriptions.Item label="Phone">{data.phone || "NA"}</Descriptions.Item>
                <Descriptions.Item label="Country">{data.country || "NA"}</Descriptions.Item>
                <Descriptions.Item label="Submitted On">
                    {new Date(data.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </Descriptions.Item>
            </Descriptions>
        </div>
    )
}

export default withAuth(View)