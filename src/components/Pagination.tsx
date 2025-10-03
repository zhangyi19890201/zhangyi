// 移除重复的导入语句，后续代码中已存在相同导入
import React from 'react';
import './Pagination.css';

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showSizeChanger?: boolean;
  pageSizeOptions?: string[];
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ 
  current = 1, 
  total = 0, 
  pageSize = 10, 
  onChange, 
  onPageSizeChange,
  showSizeChanger = false, 
  pageSizeOptions = ['10', '20', '50', '100'], 
  showTotal,
  className = '' 
}) => {
  // 计算总页数
  const totalPages = Math.ceil(total / pageSize);
  
  // 处理页码点击
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== current) {
      onChange(page);
    }
  };
  
  // 处理每页条数变化
  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    onChange(1); // 重置到第一页
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };
  
  // 生成页码列表 - 简化版，只显示当前页和前后各一个页码
  const renderPageItems = () => {
    const pageItems: React.ReactNode[] = [];
    
    // 只显示当前页和前后各一个页码
    const startPage = Math.max(1, current - 1);
    const endPage = Math.min(totalPages, current + 1);
    
    // 显示页码
    for (let i = startPage; i <= endPage; i++) {
      pageItems.push(
        <button
          key={i}
          className={`pagination-item ${current === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    return pageItems;
  };
  
  return (
    <div className={`pagination ${className}`}>
      {/* 上一页按钮 */}
      <button
        className={`pagination-btn prev-btn ${current === 1 ? 'disabled' : ''}`}
        onClick={() => handlePageChange(current - 1)}
        disabled={current === 1}
      >
        上一页
      </button>
      
      {/* 页码列表 */}
      <div className="pagination-list">
        {renderPageItems()}
      </div>
      
      {/* 下一页按钮 */}
      <button
        className={`pagination-btn next-btn ${current === totalPages ? 'disabled' : ''}`}
        onClick={() => handlePageChange(current + 1)}
        disabled={current === totalPages}
      >
        下一页
      </button>
      
      {/* 显示总数 */}
      {showTotal && (
        <div className="pagination-total">
          {showTotal(total, [(current - 1) * pageSize + 1, Math.min(current * pageSize, total)])}
        </div>
      )}
      
      {/* 每页条数选择器 */}
      {showSizeChanger && (
        <div className="pagination-size-changer">
          <span>每页</span>
          <select 
            value={pageSize.toString()} 
            onChange={handleSizeChange}
            className="pagination-select"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span>条</span>
        </div>
      )}
    </div>
  );
};

export default Pagination;