import { jobApi, View  } from '@/components/job';
import { IJob } from '@/types/supabase';

const Job = async({ params }: { params: { id: string } }) => {
  let job: IJob | null = null;
  let error: string | null = null;

  try {
    job = await getJob(Number(params?.id)); 
  } catch (err) {
    error = "An error occurred fetching job data."; 
  }
  
  if(error) {
    return (
      <div className='h-screen flex items-center justify-center text-2xl'>
        {error}
      </div>
    )
  }

  return (
    <View data={job}/>
  )
}

export default Job;

async function getJob(id: number) {
  const { job, success } = await jobApi.read(id);
  if(!success) throw "Error" 
  return job
}