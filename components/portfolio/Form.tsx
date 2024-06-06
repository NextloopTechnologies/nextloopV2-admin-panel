"use client"

import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Upload, message } from 'antd';
import { IFileUpload, IPortfolio } from '@/types/portfolio';
import { textFieldValidator } from '@/lib/utils';
import { UploadOutlined } from '@ant-design/icons';
import { FileType } from '@/types/antd';
import type { FormProps, UploadFile, UploadProps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { portfolioApi } from '.';

interface PortfolioFormProps {
  title: string,
  portfolio?: IPortfolio | null,
  // onSubmit: (portfolioData: any) => void,
  // isLoading: boolean,
  // setIsLoading: (loading: boolean) => void
}

const PortfolioForm: React.FC<PortfolioFormProps> = ({ 
  title, 
  portfolio, 
  // onSubmit,
  // isLoading,
  // setIsLoading 
}) => {

  const [ imageFileName, setImageFileName ] = useState<string>("");  
  const [ imageFileInfo, setImageFileInfo ] = useState<FileType>();  
  const [ isLoading, setIsLoading ] = useState<boolean>(false); 
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const router = useRouter(); 

  useEffect(() => {
    if (portfolio?.image?.length) {
      const files = portfolio.image.map((file: any) => {
        return {
          ...file,
          status: 'done'
        }
      });
      setFileList(files);
    }
  }, []);

  const initialValues: IPortfolio = {
    title: portfolio?.title || '',
    descp: portfolio?.descp || ''
  }

  const fileProps: UploadProps = {
    accept: 'image/*',
    listType: "picture",
    maxCount: 1,
    fileList,
    beforeUpload: (file: FileType) => {
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error(`${file.name} must smaller than 2MB!`);
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    // onChange:(info) => {
    //   console.log("file info", info)
    //   setImageFileName(info.file.name)
    //   setImageFileInfo(info.file as FileType)
    // }
    onChange: ({ fileList: newFileList }) => {
      console.log("new file lst", newFileList)
      setFileList(newFileList)
      // setImageFileName(newFileList)
      // setImageFileInfo(newFileList?.originFileObj as FileType)
    },
    // onRemove: (file) => {
    //   if (file.fileId) {
    //     setDeleteFiles((current) => [...current, file.fileId]);
    //   }
    // }
  }

  const handleFinish: FormProps<IPortfolio>['onFinish'] = async(values) => {
    setIsLoading(true);
    const formData =  new FormData();
    formData.append("title", values.title as string);
    formData.append("descp", values.descp as string);
    if(fileList.length) {
      fileList.forEach(file => {
        if (file.originFileObj) formData.append("imageInfo", file.originFileObj);
      });
    }

    if(!portfolio){
      const { success, msgText } = await portfolioApi.create(formData);
      if(success) message.success(msgText);
      else message.error(msgText  || "Failed to create!");
      setIsLoading(false);
      return router.push('/portfolio');
    }

    const { success, msgText } = await portfolioApi.create(formData); 
    if(success) message.success(msgText);
    else message.error(msgText  || "Failed to create!");
    setIsLoading(false);
    router.push('/portfolio');
  }

  return (
    <div className='content-container'>
      <h1 className='font-bold text-3xl mb-7'>{title}</h1>
      <Form
        initialValues={initialValues}
        style={{ maxWidth: 500 }}
        layout='vertical' 
        onFinish={handleFinish}   
        size='large'
        // encType='multipart/form-data'
      >
        <Form.Item<IPortfolio>
          // label={<span className='text-l'>Title</span>}
          label="Title"
          name="title"
          rules={[
            {
              required: true,
              message: 'Please input your title!',
            },
            {
              validator: textFieldValidator
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item<IPortfolio>
          // label={<span className='text-l'>Description</span>}
          label="Description"
          name="descp"
          rules={[
            {
              required: true,
              message: 'Please input your description!',
            },
            {
              validator: textFieldValidator
            }
          ]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item<IPortfolio>
          label={<span className='text-l'>Porfolio Image</span>}>
          <Upload {...fileProps}>
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          {/* <div className='flex'> */}
          { !isLoading && (
            <Link href={"/portfolio"} className='mr-3'>
              <Button danger type="primary">
                Cancel
              </Button>
            </Link>
          )}

            <Button type="primary" htmlType="submit" disabled={isLoading}>
             { isLoading ? 'Loading...': 'Submit' }
            </Button>
          {/* </div> */}
        </Form.Item>
      </Form>
    </div>
  )
}

export default PortfolioForm