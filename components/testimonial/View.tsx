"use client"

import { Descriptions } from 'antd'
import React from 'react'
import { ITestimonial } from '@/types/supabase'
import { withAuth } from '../auth'

type ViewProps = {
    data: ITestimonial|null
}

const View: React.FC<ViewProps> = ({
    data
}) => {
    return (
        <div className='py-10 mx-24'>  
        <h1 className='mb-5 text-3xl font-bold '>View Testimonial</h1>
            <Descriptions
                bordered
                column={1}
                contentStyle={{ fontSize: 16, color: '#111111' }}
            >
                <Descriptions.Item label="Feedback By">{data?.feedback_by}</Descriptions.Item>
                <Descriptions.Item label="Feedback Description">{data?.feedback_descp}</Descriptions.Item>
                <Descriptions.Item label="Company & Designation">{data?.comp_and_desig}</Descriptions.Item>
            </Descriptions>
        </div>
    )
}

export default withAuth(View)