import { ideaApi, View } from '@/components/idea';
import { IIdea } from '@/types/supabase';

const Idea = async({ params }: { params: { id: string } }) => {
  let idea: IIdea | null = null;
  let error: string | null = null;

  try {
    idea = await getIdea(Number(params?.id)); 
  } catch (err) {
    error = "An error occurred fetching idea data."; 
  }
  
  if(error) {
    return (
      <div className='h-screen flex items-center justify-center text-2xl'>
        {error}
      </div>
    )
  }

  return (
    <View data={idea}/>
  )
}

export default Idea;

async function getIdea(id: number) {
  const { idea, success } = await ideaApi.read(id);
  if(!success) throw "Error" 
  return idea
}