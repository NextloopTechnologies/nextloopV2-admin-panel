import React from 'react';

interface ViewLinkProps {
  title: string,
  onClick: () => void
}

const ViewLink: React.FC<ViewLinkProps> = ({ title, onClick }) => {
  return (
    <span onClick={onClick} className='text-blue cursor-pointer'>
     {/* <p className='text-blue'>{ title }</p>  */}
     { title }
    </span>
  )
}

export default ViewLink;