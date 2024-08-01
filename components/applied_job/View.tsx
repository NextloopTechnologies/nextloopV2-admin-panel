"use client"

import { IAppliedJob } from '@/types/supabase'
import { Descriptions } from 'antd'
import React from 'react'
import Link from 'next/link'

type ViewProps = {
    data: IAppliedJob | null
}

const View: React.FC<ViewProps> = ({
    data
}) => {
    return (
        <div className='py-10 mx-24'>
            <h1 className='mb-5 text-3xl font-bold '>View Applied Job</h1>
            <Descriptions
                bordered
                column={1}
                contentStyle={{ fontSize: 16, color: '#111111' }}
            >
                <Descriptions.Item label="Fullname">{data?.fullname}</Descriptions.Item>
                <Descriptions.Item label="Job Title">
                    {data?.job_id ? (
                        <Link href={`/job/view/${data?.job_id}`} className="text-blue-400" >
                            {data?.title || "NA"}
                        </Link>
                    ) : "NA"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">{data?.email}</Descriptions.Item>
                <Descriptions.Item label="Phone">{data?.phone}</Descriptions.Item>
                <Descriptions.Item label="Resume">
                    <a href={data?.resume_url} download={`${data?.fullname}.pdf`} target="_blank" className="text-blue-400" rel="noopener noreferrer">
                        {data?.resume_url}
                    </a>
                </Descriptions.Item>
                <Descriptions.Item label="CoverLetter">{data?.cover_letter || "NA"}</Descriptions.Item>
                <Descriptions.Item label="Github">
                    {data?.github_url ? (
                        <a href={data?.github_url} target="_blank" className="text-blue-400" rel="noopener noreferrer">
                            {data?.github_url}
                        </a>
                    ) : "NA"}
                </Descriptions.Item>
                <Descriptions.Item label="LinkedIn">
                    {data?.linkedin_url ? (
                        <a href={data?.linkedin_url} target="_blank" className="text-blue-400" rel="noopener noreferrer">
                            {data?.linkedin_url}
                        </a>
                    ) : "NA"}
                </Descriptions.Item>

            </Descriptions>
        </div>
    )
}

export default View