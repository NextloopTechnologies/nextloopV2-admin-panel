import { testimonialApi, View  } from '@/components/testimonial';
import { ITestimonial } from '@/types/testimonial';

const Testimonial = async({ params }: { params: { id: string } }) => {
  let testimonial: ITestimonial | null = null;
  let error: string | null = null;

  try {
    testimonial = await getTestimonial(Number(params?.id)); 
  } catch (err) {
    error = "An error occurred fetching testimonial data."; 
  }
  
  if(error) {
    return (
      <div className='h-screen flex items-center justify-center text-2xl'>
        {error}
      </div>
    )
  }

  return (
    <View data={testimonial}/>
  )
}

export default Testimonial;

async function getTestimonial(id: number) {
  const { testimonial, success } = await testimonialApi.read(id);
  if(!success) throw "Error" 
  return testimonial
}