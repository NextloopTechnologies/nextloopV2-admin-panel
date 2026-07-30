import { Form, categoryApi } from '@/components/category';
import { ICategory } from '@/types/blog';

const EditCategory = async ({ params }: { params: { id: string } }) => {
  let category: ICategory | null = null;
  let error: string | null = null;

  try {
    category = await getCategory(Number(params?.id));
  } catch (err) {
    error = "An error occurred fetching category data.";
  }

  if (error) {
    return (
      <div className='h-screen flex items-center justify-center text-2xl'>
        {error}
      </div>
    );
  }

  return (
    <Form
      title='Edit Category'
      category={category}
    />
  );
};

export default EditCategory;

async function getCategory(id: number) {
  const { category, success } = await categoryApi.read(id);
  if (!success) throw "Error";
  return category;
}
