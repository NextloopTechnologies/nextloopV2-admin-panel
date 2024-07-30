import { appliedJobApi } from '@/components/applied_job';
import { View } from '@/components/applied_job';
import { IAppliedJob } from '@/types/supabase';
import React from 'react';

const AppliedJob = async({ params }: { params: { id: string } }) => {
  let applied_job: IAppliedJob | null = null;
  let error: string | null = null;

  try {
    applied_job = await getAppliedJob(Number(params?.id)); 
  } catch (err) {
    error = "An error occurred fetching applied_job data."; 
  }
  
  if(error) {
    return (
      <div className='h-screen flex items-center justify-center text-2xl'>
        {error}
      </div>
    )
  }

  return (
    <View data={applied_job}/>
  )
}

export default AppliedJob;

async function getAppliedJob(id: number) {
  const { applied_job, success } = await appliedJobApi.read(id);
  if(!success) throw "Error" 
  return applied_job
}