import { View } from '@/components/popupForm';
import { popupFormApi } from '@/components/popupForm';
import { IPopupForm } from '@/types/supabase';

const PopupFormDetail = async ({ params }: { params: { id: string } }) => {
  let popupForm: IPopupForm | null = null;
  let error: string | null = null;

  try {
    popupForm = await getPopupForm(params?.id); 
  } catch (err) {
    error = "An error occurred fetching data.";
  }

  if (error) {
    return (
      <div className='h-screen flex items-center justify-center text-2xl'>
        {error}
      </div>
    );
  }

  if (popupForm) {
    return <View data={popupForm} />;
  }
};

export default PopupFormDetail;

async function getPopupForm(id: string) {
  const data = await popupFormApi.read(id);
  if (!data) throw "Error";
  return data;
}