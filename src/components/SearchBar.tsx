import React, { useState } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (keyword: string) => void;
  className?: string;
  value?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = '搜索', 
  onSearch, 
  className = '',
  value = '' 
}) => {
  const [keyword, setKeyword] = useState(value);

  const handleSearch = () => {
    onSearch(keyword.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`search-bar ${className}`}>
      <input
        type="text"
        className="search-bar__input"
        placeholder={placeholder}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button 
        className="search-bar__button" 
        onClick={handleSearch}
        title="搜索"
      >
        🔍 搜索
      </button>
    </div>
  );
};

export default SearchBar;