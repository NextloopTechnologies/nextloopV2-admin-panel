import React from 'react';
import Edit from '../../public/images/icons/edit.png';
import Delete from '../../public/images/icons/delete.png';
import Image from 'next/image';

const ActionButton = () => {
  return (
    <div className='flex'>
      <Image  
        src={Edit}
        alt='edit' 
        height='20'
        className='mr-2'
      />
      <Image  
        src={Delete}
        alt='delete' 
        height='20'
      />
    </div>
  )
}

export default ActionButton;