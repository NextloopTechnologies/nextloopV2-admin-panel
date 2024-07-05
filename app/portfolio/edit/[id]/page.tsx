import { Form, portfolioApi } from '@/components/portfolio';
import { IPortfolio } from '@/types/portfolio';
import React from 'react';

const EditPortfolio = async({ params }: { params: { id: string } }) => {
  let portfolio: IPortfolio | null = null;
  let error: string | null = null;

  try {
    portfolio = await getPortfolio(Number(params?.id)); 
  } catch (err) {
    error = "An error occurred fetching portfolio data."; 
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
      title='Edit Portfolio'
      portfolio={portfolio}
    />
  )
}

export default EditPortfolio;

async function getPortfolio(id: number) {
  const { portfolio, success } = await portfolioApi.read(id);
  if(!success) throw "Error" 
  return portfolio
}