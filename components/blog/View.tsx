"use client"
import { IBlog } from '@/types/blog'
import { Descriptions } from 'antd'
import React from 'react'
import parse from "html-react-parser"
import Image from 'next/image'

type ViewProps = {
    data: IBlog|null
}

const View: React.FC<ViewProps> = ({
    data
}) => {
    return (
        <div className='py-10 mx-24'>  
        <h1 className='mb-5 text-3xl font-bold '>View Blog</h1>
            <Descriptions
                bordered
                column={1}
                contentStyle={{ fontSize: 16, color: '#111111' }}
            >
                <Descriptions.Item label="Title">{data?.title}</Descriptions.Item>
                <Descriptions.Item label="Description">{parse(data?.descp!)}</Descriptions.Item>
                <Descriptions.Item label="Snaps">
                    {data?.image?.length ? (
                        <Image
                            key={data?.id}
                            width={200}
                            height={200}
                            src={data.image[0].url}
                            alt="image"
                        />
                    ) : `No snapshot available!`
                    }
                </Descriptions.Item>
            </Descriptions>
        </div>
    )
}

export default View