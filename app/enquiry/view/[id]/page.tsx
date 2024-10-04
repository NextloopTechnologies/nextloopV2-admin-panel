import { enquiryApi, View } from '@/components/enquiry';
import { IEnquiry } from '@/types/supabase';

const Enquiry = async({ params }: { params: { id: string } }) => {
  let enquiry: IEnquiry | null = null;
  let error: string | null = null;

  try {
    enquiry = await getEnquiry(Number(params?.id)); 
  } catch (err) {
    error = "An error occurred fetching enquiry data."; 
  }
  
  if(error) {
    return (
      <div className='h-screen flex items-center justify-center text-2xl'>
        {error}
      </div>
    )
  }

  if(enquiry) {
    return (
      <View data={enquiry}/>
    )
  }
}

export default Enquiry;

async function getEnquiry(id: number) {
  const { enquiry, success } = await enquiryApi.read(id);
  if(!success) throw "Error" 
  return enquiry
}