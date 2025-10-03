import React from 'react';
import DataTable from './DataTable';

// 测试数据类型
interface TestData {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
}

const DataTableTest: React.FC = () => {
  // 测试数据
  const testData: TestData[] = [
    {
      id: '1',
      name: '张三',
      gender: 'male',
      age: 30
    },
    {
      id: '2',
      name: '李四',
      gender: 'female',
      age: 28
    },
    {
      id: '3',
      name: '王五',
      gender: 'male',
      age: 32
    }
  ];

  // 表格列定义 - 仅包含性别和年龄列以简化测试
  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
    { title: '性别', dataIndex: 'gender', key: 'gender', width: 80 },
    { title: '年龄', dataIndex: 'age', key: 'age', width: 80 }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>DataTable 性别和年龄列测试</h2>
      <p>此页面用于测试DataTable中性别和年龄列的显示问题</p>
      
      <DataTable
        columns={columns}
        dataSource={testData}
        loading={false}
        emptyText="暂无数据"
      />
      
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h4>调试信息</h4>
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify({ columns, data: testData }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DataTableTest;