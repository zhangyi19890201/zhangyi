import React from 'react';
import './DataTable.css';

// 更安全的索引类型，用于按字符串 key 访问泛型记录的属性
type Indexable = Record<string, unknown>;

interface ColumnDef<T> {
  key: string;
  title: string;
  width?: string | number;
  // 严格的 render 签名：值、当前记录、行索引
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  dataIndex?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  dataSource: T[];
  loading?: boolean;
  emptyText?: string;
  className?: string;
}

const DataTable = <T,>({ 
  columns, 
  dataSource, 
  loading = false, 
  emptyText = '暂无数据', 
  className = '' 
}: DataTableProps<T>) => {
  // 渲染单元格内容的函数
  const renderCell = (column: ColumnDef<T>, record: T, rowIndex: number) => {
    // 使用dataIndex或key获取单元格值
  const dataIndex = column.dataIndex || column.key;
  // 索引访问时类型不确定，使用 Indexable 来避免 any
  const rawValue = (record as Indexable)[dataIndex];
  const cellValue: unknown | string = rawValue !== undefined ? rawValue : '';
    
    // 特殊处理性别列 - 将英文转换为中文
    if (column.key === 'gender') {
      const genderMap: Record<string, string> = {
        'male': '男',
        'female': '女'
      };
  const keyForMap = typeof cellValue === 'string' ? cellValue : String(cellValue);
  const displayGender = genderMap[keyForMap] ?? String(cellValue);
  return <span>{displayGender}</span>;
    }
    
    // 使用自定义render或直接显示值
    return column.render ? 
      column.render(cellValue, record, rowIndex) : 
      <span>{String(cellValue)}</span>;
  };

  return (
    <div className={`data-table-container ${className}`}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
                <th 
                  key={column.key} 
                  className={`data-table__header-cell ${column.key === 'gender' ? 'gender-header' : column.key === 'age' ? 'age-header' : column.key === 'index' ? 'index-header' : ''}`}
                  data-column-key={column.key}
                >
                  {column.title}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="data-table__loading">
                加载中...
              </td>
            </tr>
          ) : !dataSource || dataSource.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="data-table__empty">
                {emptyText}
              </td>
            </tr>
          ) : (
            dataSource.map((record: T, rowIndex) => (
              <tr 
                key={String((record as Indexable).id ?? (record as Indexable).key ?? `row-${rowIndex}`)} 
                className="data-table__row"
              >
                {columns.map((column) => {
                  return (
                    <td 
                      key={column.key} 
                      className={`data-table__cell ${column.key === 'gender' ? 'gender-cell' : column.key === 'age' ? 'age-cell' : ''}`}
                      data-column-key={column.key}
                    >
                      {renderCell(column, record, rowIndex)}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;