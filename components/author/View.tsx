"use client"

import { Descriptions } from 'antd'
import React from 'react'
import { withAuth } from '../auth'
import { IAuthor } from '@/types/supabase'

type ViewProps = {
    data: IAuthor|null
}

const View: React.FC<ViewProps> = ({
    data
}) => {
    return (
        <div className='py-10 mx-24'>  
        <h1 className='mb-5 text-3xl font-bold '>View Author</h1>
            <Descriptions
                bordered
                column={1}
                contentStyle={{ fontSize: 16, color: '#111111' }}
            >
                <Descriptions.Item label="Name">{data?.name}</Descriptions.Item>
                <Descriptions.Item label="Designation">{data?.designation}</Descriptions.Item>
            </Descriptions>
        </div>
    )
}

export default withAuth(View)