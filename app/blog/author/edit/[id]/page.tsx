import { Form, authorApi } from '@/components/author';
import { IAuthor } from '@/types/supabase';

const EditAuthor = async({ params }: { params: { id: string } }) => {
  let author: IAuthor | null = null;
  let error: string | null = null;

  try {
    author = await getAuthor(Number(params?.id)); 
  } catch (err) {
    error = "An error occurred fetching author data."; 
  }
  
  if(error) {
    return (
      <div className='h-screen flex items-center justify-center text-2xl'>
        {error}
      </div>
    )
  }

  return (
    <Form 
      title='Edit Author'
      author={author}
    />
  )
}

export default EditAuthor;

async function getAuthor(id: number) {
  const { author, success } = await authorApi.read(id);
  if(!success) throw "Error" 
  return author
}