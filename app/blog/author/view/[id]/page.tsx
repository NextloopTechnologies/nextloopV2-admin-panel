import { authorApi, View  } from '@/components/author';
import { IAuthor } from '@/types/supabase';

const Author = async({ params }: { params: { id: string } }) => {
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
    <View data={author}/>
  )
}

export default Author;

async function getAuthor(id: number) {
  const { author, success } = await authorApi.read(id);
  if(!success) throw "Error" 
  return author
}