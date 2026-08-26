"use client"

import { Descriptions } from 'antd'
import React from 'react'
import { withAuth } from '../auth'
import { IIdea } from '@/types/supabase'

type ViewProps = {
    data: IIdea|null
}

const View: React.FC<ViewProps> = ({
    data
}) => {
    return (
        <div className='py-10 mx-24'>  
        <h1 className='mb-5 text-3xl font-bold '>View Idea</h1>
            <Descriptions
                bordered
                column={1}
                contentStyle={{ fontSize: 16, color: '#111111' }}
            >
                <Descriptions.Item label="Feedback By">{data?.mail}</Descriptions.Item>
                <Descriptions.Item label="Feedback Description">{data?.idea_descp}</Descriptions.Item>
            </Descriptions>
        </div>
    )
}

export default withAuth(View)