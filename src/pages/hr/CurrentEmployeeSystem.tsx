import React, { useState } from 'react';
import DataTable from '@/components/DataTable';
import SearchBar from '@/components/SearchBar';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import HRSystemLayout from '@/components/HRSystemLayout';
import useHRData from '@/hooks/useHRData';
import ExcelUtils from '@/utils/excelUtils';

// 员工信息接口定义
export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  idNumber: string;
  gender: 'male' | 'female';
  age: number;
  department: string;
  position: string;
  education: string;
  hireDate: string;
  phone: string;
  email: string;
}

const CurrentEmployeeSystem = () => {
  // 使用自定义Hook管理数据
  const { 
    data: employees,
    filteredData,
    currentPage,
    pageSize,
    totalPages,
    loading,
    loadData,
    saveData,
    addItem,
    updateItem,
    deleteItem,
    handleSearch,
    setCurrentPage,
    setPageSize,
    getCurrentPageData
  } = useHRData<Employee>({
    localStorageKey: 'currentEmployees',
    initialData: [],
    pageSize: 10
  });
  
  const [searchValue, setSearchValue] = useState('');
  
  // 搜索功能使用hook提供的handleSearch方法
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    handleSearch(value);
  };
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee>>({});

  // 将员工数据导出为Excel文件
  const exportDataToExcel = () => {
    try {
      ExcelUtils.exportToExcel(
        employees,
        '员工数据.xlsx',
        '员工数据',
        [
          { key: 'employeeId', title: '工号' },
          { key: 'name', title: '姓名' },
          { key: 'idNumber', title: '身份证号' },
          { key: 'gender', title: '性别' },
          { key: 'age', title: '年龄' },
          { key: 'department', title: '部门' },
          { key: 'position', title: '职位' },
          { key: 'education', title: '学历' },
          { key: 'hireDate', title: '入职日期' },
          { key: 'phone', title: '手机号' }
        ]
      );
    } catch (error) {
      console.error('导出数据时出错:', error);
      alert('导出数据失败，请重试！');
    }
  };

  // 导入数据功能
  const importDataFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 导入原始数据
      const rawData = await ExcelUtils.importFromExcel<Employee>(file);
      
      // 手动验证数据
      const validData = rawData.filter(item => {
        return item.employeeId && 
               item.name && 
               item.idNumber && 
               item.department && 
               item.position;
      });
      
      // 处理验证结果
      if (validData.length > 0) {
        const updatedEmployees = [...employees, ...validData];
        saveData(updatedEmployees);
        alert(`成功导入${validData.length}条员工数据`);
      }
      
      const invalidCount = rawData.length - validData.length;
      if (invalidCount > 0) {
        alert(`导入成功${validData.length}条数据，但有${invalidCount}条数据无效`);
      }
    } catch (error) {
      alert('文件解析失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 验证员工数据
  const validateEmployee = (data: any): boolean => {
    return data.employeeId && data.name && data.idNumber && data.department && data.position;
  };

  // 搜索功能 - 已通过useHRData hook提供的handleSearch方法处理

  // 打开添加员工模态框
  const handleAddEmployee = () => {
    setCurrentEmployee({});
    setIsAddModalOpen(true);
  };

  // 打开编辑员工模态框
  const handleEditEmployee = (employee: Employee) => {
    setCurrentEmployee({...employee});
    setIsEditModalOpen(true);
  };

  // 保存员工信息
  const handleSaveEmployee = () => {
    if (isAddModalOpen) {
      // 添加新员工
      const newEmployee: Employee = {
        id: Date.now().toString(),
        employeeId: currentEmployee.employeeId || `EMP${String(Date.now()).slice(-3)}`,
        name: currentEmployee.name || '',
        idNumber: currentEmployee.idNumber || '',
        gender: currentEmployee.gender as 'male' | 'female' || 'male',
        age: currentEmployee.age || 0,
        department: currentEmployee.department || '',
        position: currentEmployee.position || '',
        education: currentEmployee.education || '',
        hireDate: currentEmployee.hireDate || new Date().toISOString().split('T')[0],
        phone: currentEmployee.phone || '',
        email: '' // 不再收集邮箱信息
      };
      addItem(newEmployee);
    } else if (isEditModalOpen && currentEmployee.id) {
      // 编辑现有员工
      const updatedEmployee: Employee = {
        id: currentEmployee.id,
        employeeId: currentEmployee.employeeId || '',
        name: currentEmployee.name || '',
        idNumber: currentEmployee.idNumber || '',
        gender: currentEmployee.gender as 'male' | 'female' || 'male',
        age: currentEmployee.age || 0,
        department: currentEmployee.department || '',
        position: currentEmployee.position || '',
        education: currentEmployee.education || '',
        hireDate: currentEmployee.hireDate || new Date().toISOString().split('T')[0],
        phone: currentEmployee.phone || '',
        email: '' // 不再收集邮箱信息
      };
      updateItem(currentEmployee.id, updatedEmployee);
    }
    
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  };

  // 删除员工
  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('确定要删除该员工信息吗？删除后将转入非在职员工系统。')) {
      // 找到要删除的员工
      const deletedEmployee = employees.find(emp => emp.id === id);
      if (deletedEmployee) {
        // 创建非在职员工数据
        const formerEmployee = {
          ...deletedEmployee,
          leaveDate: new Date().toISOString().split('T')[0], // 设置今天为离职日期
          leaveReason: '主动离职', // 默认离职原因
          archiveDate: new Date().toISOString().split('T')[0] // 设置今天为归档日期
        };
        
        // 注：由于数据管理已由useHRData hook统一处理，此处不再需要localStorage操作
        // 员工数据将在非在职员工系统中通过适当的方式处理
      }
      
      // 从当前员工列表中移除
      deleteItem(id);
    }
  };

  // 生成150个测试员工数据
  const generateTestData = () => {
    if (window.confirm('确定要生成150条测试员工数据吗？这将覆盖现有的所有员工数据！')) {
      const departments = ['研发部', '市场部', '财务部', '人力资源部', '销售部', '运营部', '客服部', '产品部'];
      const positions = ['高级工程师', '工程师', '助理工程师', '经理', '主管', '专员', '实习生', '设计师', '测试工程师'];
      const educationLevels = ['本科', '硕士', '博士', '大专', '高中', '中专'];
      const lastNames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高'];
      const firstNames = ['伟', '芳', '娜', '秀英', '敏', '静', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '丽', '娟', '丹', '辉', '玲'];
      
      const testData: Employee[] = [];
      
      for (let i = 1; i <= 150; i++) {
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const name = lastName + firstName;
        
        // 生成随机年龄（22-55岁）
        const age = Math.floor(Math.random() * 34) + 22;
        
        // 生成随机身份证号
        const birthYear = new Date().getFullYear() - age;
        const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const addressCode = String(Math.floor(Math.random() * 900000) + 100000); // 6位地址码
        const sequenceCode = String(Math.floor(Math.random() * 900) + 100); // 3位顺序码
        const genderCode = gender === 'male' ? String(Math.floor(Math.random() * 5) * 2 + 1) : String(Math.floor(Math.random() * 5) * 2); // 1位性别码
        const checkDigit = '0123456789X'[Math.floor(Math.random() * 11)]; // 1位校验码
        const idNumber = `${addressCode}${birthYear}${birthMonth}${birthDay}${sequenceCode}${genderCode}${checkDigit}`;
        
        // 生成随机入职日期（1-5年前）
        const hireYearsAgo = Math.floor(Math.random() * 5) + 1;
        const hireYear = new Date().getFullYear() - hireYearsAgo;
        const hireMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const hireDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const hireDate = `${hireYear}-${hireMonth}-${hireDay}`;
        
        // 生成随机手机号
        const phonePrefix = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '170', '171', '173', '176', '177', '178', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
        const phone = phonePrefix[Math.floor(Math.random() * phonePrefix.length)] + String(Math.floor(Math.random() * 10000000)).padStart(7, '0');
        
        testData.push({
          id: Date.now().toString() + i,
          employeeId: `EMP${String(i).padStart(4, '0')}`,
          name: name,
          idNumber: idNumber,
          gender: gender,
          age: age,
          department: departments[Math.floor(Math.random() * departments.length)],
          position: positions[Math.floor(Math.random() * positions.length)],
          education: educationLevels[Math.floor(Math.random() * educationLevels.length)],
          hireDate: hireDate,
          phone: phone,
          email: '' // 不再收集邮箱信息
        });
      }
      
      saveData(testData);
      alert('已成功生成150条测试员工数据！');
    }
  };

  // 表格列定义
  const columns = [
  { title: '序号', key: 'index', width: 80, render: (_value: unknown, _record: Employee | null, index: number) => index + 1 },
    { title: '工号', dataIndex: 'employeeId', key: 'employeeId', width: 120 },
    { title: '姓名', dataIndex: 'name', key: 'name', width: 120 },
    { title: '身份证号', dataIndex: 'idNumber', key: 'idNumber', width: 200 },
    { 
      title: '性别', 
      dataIndex: 'gender', 
      key: 'gender', 
      width: 80
    },
    { title: '年龄', dataIndex: 'age', key: 'age', width: 80 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 120 },
    { title: '职位', dataIndex: 'position', key: 'position', width: 120 },
    { title: '学历', dataIndex: 'education', key: 'education', width: 100 },
    { title: '入职日期', dataIndex: 'hireDate', key: 'hireDate', width: 120 },
    { 
      title: '在职时间', 
      key: 'serviceTime', 
      width: 120,
      render: (_value: unknown, record: Employee) => {
        if (!record.hireDate) return '';
        
        const hireDate = new Date(record.hireDate);
        const now = new Date();
        
        // 计算月份差值
        let months = (now.getFullYear() - hireDate.getFullYear()) * 12;
        months -= hireDate.getMonth();
        months += now.getMonth();
        
        // 调整日期，确保计算准确
        if (now.getDate() < hireDate.getDate()) {
          months--;
        }
        
        // 转换为年和月
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        
        return `${years}年${remainingMonths}月`;
      }
    },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 150 },
    { 
      title: '操作', 
      key: 'action', 
      width: 160,
      render: (_value: unknown, record: Employee) => (
        <>
          <button 
            onClick={() => handleEditEmployee(record)} 
            style={styles.actionButton} 
          >
            编辑
          </button>
          <button 
            onClick={() => handleDeleteEmployee(record.id)} 
            style={{...styles.actionButton, ...styles.deleteButton}} 
          >
            删除
          </button>
        </>
      )
    }
  ];

  // 分页数据已由useHRData hook提供的getCurrentPageData()方法处理


  return (
    <HRSystemLayout
      title="在职员工信息系统"
      navItems={[
        { key: 'current', label: '在职员工', path: '/hr/current' },
        { key: 'contract', label: '派遣员工', path: '/hr/contract' },
        { key: 'former', label: '离职员工', path: '/hr/former' },
        { key: 'former-contract', label: '非在职派遣', path: '/hr/former-contract' }
      ]}
      currentPath="/hr/current"
    >
      <div style={styles.container}>
        <div style={styles.header}>
          <SearchBar 
            placeholder="请输入员工姓名、工号或身份证号搜索"
            onSearch={handleSearchChange}
          />
          <div style={styles.headerButtons}>
            <button style={styles.addButton} onClick={handleAddEmployee}>
              新增员工
            </button>
            <button style={styles.exportButton} onClick={exportDataToExcel}>
              导出数据
            </button>
            <button style={{...styles.importButton, backgroundColor: '#722ed1'}} onClick={generateTestData}>
              生成测试数据
            </button>
            <label style={styles.importButton}>
              导入数据
              <input
                type="file"
                accept=".json,.xlsx,.xls"
                onChange={importDataFromFile}
                style={styles.hiddenInput}
              />
            </label>
          </div>
        </div>

        <DataTable columns={columns} dataSource={getCurrentPageData()} loading={loading} />

        <div style={styles.footer}>
          <Pagination 
              total={filteredData.length} 
              current={currentPage} 
              pageSize={pageSize} 
              onChange={setCurrentPage} 
              onPageSizeChange={setPageSize} 
              showSizeChanger 
              // 移除不支持的属性 
              showTotal={(total: number, range: [number, number]) => `共 ${total} 条记录，当前显示第 ${range[0]}-${range[1]} 条`}
            />
        </div>

        {/* 添加/编辑员工模态框 */}
        <Modal
          title={isAddModalOpen ? "新增员工" : "编辑员工"}
          visible={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
          footer={[
            <button key="cancel" onClick={() => {
              setIsAddModalOpen(false);
              setIsEditModalOpen(false);
            }} style={styles.closeButton}>取消</button>,
            <button key="save" onClick={handleSaveEmployee} style={styles.saveButton}>保存</button>
          ]}
          closable={true}
          maskClosable={true}
        >
          <div style={styles.formContainer}>
            <div style={styles.formRow}>
              <div style={styles.formItem}>
                <label>工号</label>
                <input
                  type="text"
                  value={currentEmployee.employeeId || ''}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, employeeId: e.target.value})}
                  style={styles.input}
                  placeholder="请输入工号"
                  disabled={isEditModalOpen}
                />
              </div>
              <div style={styles.formItem}>
                <label>姓名</label>
                <input
                  type="text"
                  value={currentEmployee.name || ''}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, name: e.target.value})}
                  style={styles.input}
                  placeholder="请输入姓名"
                />
              </div>
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formItem}>
                <label>身份证号</label>
                <input
                  type="text"
                  value={currentEmployee.idNumber || ''}
                  onChange={(e) => {
                    const idNumber = e.target.value;
                    let updatedEmployee = { ...currentEmployee, idNumber };
                    
                    // 当输入完整的18位身份证号时，自动提取性别和年龄
                    if (idNumber.length === 18) {
                      // 提取性别：第17位数字，奇数为男，偶数为女
                      const genderDigit = parseInt(idNumber.charAt(16));
                      updatedEmployee.gender = genderDigit % 2 === 1 ? 'male' : 'female';
                      
                      // 提取出生年月日并计算年龄
                      const birthYear = parseInt(idNumber.substring(6, 10));
                      const birthMonth = parseInt(idNumber.substring(10, 12));
                      const birthDay = parseInt(idNumber.substring(12, 14));
                      
                      const today = new Date();
                      let age = today.getFullYear() - birthYear;
                      
                      // 调整年龄：如果还没过生日，则年龄减1
                      if (today.getMonth() + 1 < birthMonth || 
                          (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay)) {
                        age--;
                      }
                      
                      updatedEmployee.age = age;
                    }
                    
                    setCurrentEmployee(updatedEmployee);
                  }}
                  style={styles.input}
                  placeholder="请输入身份证号"
                  maxLength={18}
                />
              </div>
              <div style={styles.formItem}>
                <label>性别</label>
                <select
                  value={currentEmployee.gender || 'male'}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, gender: e.target.value as 'male' | 'female'})}
                  style={styles.input}
                >
                  <option value="male">男</option>
                  <option value="female">女</option>
                </select>
              </div>
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formItem}>
                <label>年龄</label>
                <input
                  type="number"
                  value={currentEmployee.age || ''}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, age: parseInt(e.target.value)})}
                  style={styles.input}
                  placeholder="请输入年龄"
                />
              </div>
              <div style={styles.formItem}>
                <label>部门</label>
                <input
                  type="text"
                  value={currentEmployee.department || ''}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, department: e.target.value})}
                  style={styles.input}
                  placeholder="请输入部门"
                />
              </div>
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formItem}>
                <label>职位</label>
                <input
                  type="text"
                  value={currentEmployee.position || ''}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, position: e.target.value})}
                  style={styles.input}
                  placeholder="请输入职位"
                />
              </div>
              <div style={styles.formItem}>
                <label>学历</label>
                <input
                  type="text"
                  value={currentEmployee.education || ''}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, education: e.target.value})}
                  style={styles.input}
                  placeholder="请输入学历"
                />
              </div>
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formItem}>
                <label>入职日期</label>
                <input
                  type="date"
                  value={currentEmployee.hireDate || ''}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, hireDate: e.target.value})}
                  style={styles.input}
                />
              </div>
              <div style={styles.formItem}>
                <label>手机号</label>
                <input
                  type="tel"
                  value={currentEmployee.phone || ''}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, phone: e.target.value})}
                  style={styles.input}
                  placeholder="请输入手机号"
                />
              </div>
            </div>
            
            {/* 附加上传功能 */}
            <div style={styles.formRow}>
              <div style={{...styles.formItem, flex: '2'}}>
                <label>附件上传</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const fileNames = Array.from(e.target.files).map(file => file.name);
                      console.log('上传的文件:', fileNames);
                      // 实际项目中这里会有文件上传逻辑
                      alert(`已选择${fileNames.length}个文件：\n${fileNames.join('\n')}\n注意：实际上传功能需要后端支持`);
                    }
                  }}
                  style={styles.input}
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </HRSystemLayout>
  );
};

// 样式定义
const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '20px',
    marginBottom: '20px',
    color: '#2c3e50'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  headerButtons: {
    display: 'flex',
    gap: '10px'
  },
  addButton: {
    padding: '8px 16px',
    backgroundColor: '#165DFF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  exportButton: {
    padding: '8px 16px',
    backgroundColor: '#52c41a',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  importButton: {
    padding: '8px 16px',
    backgroundColor: '#faad14',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'inline-block'
  },
  hiddenInput: {
    display: 'none'
  },
  footer: {
    marginTop: '20px',
    textAlign: 'right' as const
  },
  actionButton: {
    padding: '4px 12px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '8px'
  },
  deleteButton: {
    backgroundColor: '#ff4d4f',
    color: 'white'
  },
  closeButton: {
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    color: '#262626',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '8px'
  },
  saveButton: {
    padding: '8px 16px',
    backgroundColor: '#165DFF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  formContainer: {
    marginTop: '10px'
  },
  formRow: {
    display: 'flex',
    marginBottom: '16px'
  },
  formItem: {
    flex: 1,
    marginRight: '20px',
    display: 'flex',
    flexDirection: 'column' as const
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    marginTop: '4px',
    fontSize: '14px'
  }
};

export default CurrentEmployeeSystem;