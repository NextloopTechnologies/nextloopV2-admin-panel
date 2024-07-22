import { blogApi } from '@/components/blog';
import View from '@/components/blog/View';
import { IBlog } from '@/types/blog';
import React from 'react';

const Blog = async({ params }: { params: { id: string } }) => {
  let blog: IBlog | null = null;
  let error: string | null = null;

  try {
    blog = await getBlog(Number(params?.id)); 
  } catch (err) {
    error = "An error occurred fetching blog data."; 
  }
  
  if(error) {
    return (
      <div className='h-screen flex items-center justify-center text-2xl'>
        {error}
      </div>
    )
  }

  return (
    <View data={blog}/>
  )
}

export default Blog;

async function getBlog(id: number) {
  const { blog, success } = await blogApi.read(id);
  if(!success) throw "Error" 
  return blog
}