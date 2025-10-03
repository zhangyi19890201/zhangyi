import React from 'react';

interface TestRowProps {
  gender: string;
  age: number;
}

const TestRow: React.FC<TestRowProps> = ({ gender, age }) => {
  return (
    <div style={{ display: 'flex', margin: '20px 0', gap: '20px' }}
      className="test-row-container"
    >
      <div style={{ 
        width: '100px', 
        height: '40px', 
        backgroundColor: '#e0f2fe', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #ddd'
      }}>
        性别
      </div>
      <div style={{ 
        width: '60px', 
        height: '40px', 
        backgroundColor: '#e0f2fe', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #ddd',
        whiteSpace: 'nowrap'
      }}>
        {gender}
      </div>
      <div style={{ 
        width: '100px', 
        height: '40px', 
        backgroundColor: '#dbeafe', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #ddd'
      }}>
        年龄
      </div>
      <div style={{ 
        width: '60px', 
        height: '40px', 
        backgroundColor: '#dbeafe', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #ddd',
        whiteSpace: 'nowrap'
      }}>
        {age}
      </div>
    </div>
  );
};

interface TestTableProps {
  data: { gender: string; age: number }[];
}

const TestTable: React.FC<TestTableProps> = ({ data }) => {
  return (
    <div style={{ margin: '20px', padding: '20px', border: '1px solid #eee', borderRadius: '4px' }}>
      <h3>性别和年龄列测试</h3>
      {data.map((item, index) => (
        <TestRow key={index} gender={item.gender} age={item.age} />
      ))}
      
      <div style={{ marginTop: '30px' }}>
        <h4>调试信息</h4>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TestTable;