"use client"

import { Descriptions } from 'antd'
import React from 'react'
import { IJob } from '@/types/supabase'
import { withAuth } from '../auth'

type ViewProps = {
    data: IJob | null
}

const UnorderedList = ({ contentArray }: { contentArray: string[] }) => (
    <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
        {contentArray.map((content, idx) => (
            <li key={idx}>{content}</li>
        ))}
    </ul>
)

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
                <Descriptions.Item label="Title">{data?.title}</Descriptions.Item>
                <Descriptions.Item label="Description">{data?.descp}</Descriptions.Item>
                <Descriptions.Item label="Responsibilities">
                    <UnorderedList contentArray={data?.responsibilities!}/>
                </Descriptions.Item>
                <Descriptions.Item label="Qualifications">
                    <UnorderedList contentArray={data?.qualifications!}/>
                </Descriptions.Item>
                <Descriptions.Item label="Skills">
                    <UnorderedList contentArray={data?.skills!}/>
                </Descriptions.Item>
                <Descriptions.Item label="Location">{data?.location}</Descriptions.Item>
                <Descriptions.Item label="Job Mode">{data?.job_mode}</Descriptions.Item>
                <Descriptions.Item label="Job Type">{data?.job_type}</Descriptions.Item>
            </Descriptions>
        </div>
    )
}

export default withAuth(View)