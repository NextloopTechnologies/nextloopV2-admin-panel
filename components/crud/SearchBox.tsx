import Search from 'antd/es/input/Search';
import React from 'react';

interface SearchBoxProps {
  onSearchText: (value: string) => void
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearchText }) => {
  return (
    <Search 
      placeholder="Input search text" 
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchText(e.target.value)}
      allowClear
      size='large'
      style={{ width: 300 }}
    /> 
  )
}

export default SearchBox;