import React, { useState } from 'react';
import DataTable from '../../components/DataTable';
import SearchBar from '../../components/SearchBar';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import HRSystemLayout from '../../components/HRSystemLayout';
import useHRData from '../../hooks/useHRData';
import ExcelUtils from '../../utils/excelUtils';
import { Employee } from './CurrentEmployeeSystem';
import generateFormerEmployeeTestData from './generateFormerEmployeeTestData';

// 非在职员工信息接口定义
export interface FormerEmployee extends Employee {
  leaveDate: string;
  leaveReason: string;
  archiveDate: string;
}

const FormerEmployeeSystem = () => {
  // 使用useHRData hook管理非在职员工数据
  const { 
    data: employees, 
    filteredData,
    saveData,
    updateItem: updateEmployee,
    handleSearch,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    getCurrentPageData,
    loading
  } = useHRData<FormerEmployee>({
    localStorageKey: 'formerEmployees',
    initialData: generateFormerEmployeeTestData(),
    pageSize: 20
  });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<FormerEmployee | null>(null);
  const [editingLeaveReason, setEditingLeaveReason] = useState(''); // 用于编辑离职原因的状态

  // 搜索功能使用hook提供的handleSearch方法
  const [searchValue, setSearchValue] = useState('');
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    handleSearch(value);
  };

  // 将非在职员工数据导出为Excel文件
  const exportDataToExcel = () => {
    // 准备要导出的数据字段映射
    const headers = {
      employeeId: '工号',
      name: '姓名',
      idNumber: '身份证号',
      gender: '性别',
      age: '年龄',
      department: '原部门',
      position: '原职位',
      education: '学历',
      hireDate: '入职日期',
      leaveDate: '离职日期',
      leaveReason: '离职原因',
      archiveDate: '归档日期',
      phone: '手机号'
    };

    // 准备导出数据，转换性别显示
    const exportData = employees.map(emp => ({
      ...emp,
      gender: emp.gender === 'male' ? '男' : '女'
    }));

    ExcelUtils.exportToExcel(
      exportData,
      `非在职员工数据_${new Date().toISOString().split('T')[0]}`,
      '非在职员工数据',
      Object.entries(headers).map(([key, title]) => ({ key, title }))
    );
    
    alert('导出成功');
  };

  // 从Excel文件导入数据
  const importDataFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ExcelUtils.isExcelFile(file)) {
      alert('请选择Excel文件（.xlsx或.xls格式）');
      return;
    }

    try {
      const importedData = await ExcelUtils.importFromExcel(file);
      
      // 处理导入的数据
      const importedEmployees: FormerEmployee[] = importedData.map((item: any) => {
        // 查找各字段对应的值
        const employeeId = findValueFromKeys(item, ['工号', '员工编号', 'EmployeeId']);
        const name = findValueFromKeys(item, ['姓名', 'Name']);
        const idNumber = findValueFromKeys(item, ['身份证号', '身份证', 'IDNumber']);
        const gender = findValueFromKeys(item, ['性别', 'Gender']);
        const age = findValueFromKeys(item, ['年龄', 'Age']);
        const department = findValueFromKeys(item, ['原部门', '部门', 'Department']);
        const position = findValueFromKeys(item, ['原职位', '职位', 'Position']);
        const education = findValueFromKeys(item, ['学历', 'Education']);
        const hireDate = findValueFromKeys(item, ['入职日期', '入职', 'HireDate']);
        const leaveDate = findValueFromKeys(item, ['离职日期', '离职', 'LeaveDate']);
        const leaveReason = findValueFromKeys(item, ['离职原因', '原因', 'Reason']);
        const archiveDate = findValueFromKeys(item, ['归档日期', '归档', 'ArchiveDate']);
        const phone = findValueFromKeys(item, ['手机号', '电话', 'Phone']);
        
        // 构建非在职员工对象
        return {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // 生成唯一ID
          employeeId: employeeId || `EMP${Math.random().toString(36).substr(2, 5)}`,
          name: name || '',
          idNumber: idNumber || '',
          gender: (gender?.toString().includes('男') ? 'male' : 'female') as 'male' | 'female',
          age: age ? parseInt(age.toString()) : 0,
          department: department || '',
          position: position || '',
          education: education || '',
          hireDate: hireDate || new Date().toISOString().split('T')[0],
          leaveDate: leaveDate || new Date().toISOString().split('T')[0],
          leaveReason: leaveReason || '',
          archiveDate: archiveDate || new Date().toISOString().split('T')[0],
          phone: phone || '',
          email: '' // 不再收集邮箱信息
        };
      }).filter(emp => emp.name && emp.idNumber); // 过滤掉无效数据
      
      if (importedEmployees.length > 0) {
        saveData(importedEmployees);
        alert(`成功导入${importedEmployees.length}条非在职员工数据！`);
      } else {
        alert('没有有效数据被导入');
      }
    } catch (error) {
      console.error('导入数据时出错:', error);
      alert('导入失败：' + (error as Error).message);
    }
    
    // 清空文件输入
    e.target.value = '';
  };
  
  // 从对象的多个可能的键中查找值
  const findValueFromKeys = (obj: any, keys: string[]): any => {
    for (const key of keys) {
      const foundKey = Object.keys(obj).find(k => 
        k.includes(key) || k.toLowerCase().includes(key.toLowerCase())
      );
      if (foundKey && obj[foundKey]) {
        return obj[foundKey];
      }
    }
    return null;
  }

  // 查看员工详情
  const handleViewDetail = (employee: FormerEmployee) => {
    setCurrentEmployee(employee);
    setEditingLeaveReason(employee.leaveReason);
    setIsDetailModalOpen(true);
  };

  // 保存离职原因
  const handleSaveLeaveReason = () => {
    if (currentEmployee) {
      // 更新员工数据
      const updatedEmployee = {
        ...currentEmployee,
        leaveReason: editingLeaveReason
      };
      
      // 使用updateEmployee更新员工数据
      updateEmployee(currentEmployee.id, { leaveReason: editingLeaveReason });
      setCurrentEmployee(updatedEmployee);
      alert('离职原因已更新');
    }
  };

  // 表格列定义
  const columns = [
  { title: '序号', key: 'index', width: 80, render: (_value: unknown, _record: any, index: number) => index + 1 },
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
    { title: '原部门', dataIndex: 'department', key: 'department', width: 120 },
    { title: '原职位', dataIndex: 'position', key: 'position', width: 120 },
    { title: '入职日期', dataIndex: 'hireDate', key: 'hireDate', width: 120 },
    { title: '离职日期', dataIndex: 'leaveDate', key: 'leaveDate', width: 120 },
    { title: '离职原因', dataIndex: 'leaveReason', key: 'leaveReason', width: 150 },
    {
      title: '操作', 
      key: 'action', 
      width: 100,
  render: (_value: unknown, record: FormerEmployee) => (
        <button 
          onClick={() => handleViewDetail(record)} 
          style={styles.actionButton} 
        >
          查看
        </button>
      )
    }
  ];

  // 分页数据已由useHRData hook提供的getCurrentPageData()方法处理


  return (
    <HRSystemLayout
      title="非在职员工信息系统"
      navItems={[
        { key: 'current', label: '在职员工', path: '/hr/current' },
        { key: 'contract', label: '派遣员工', path: '/hr/contract' },
        { key: 'former', label: '离职员工', path: '/hr/former' },
        { key: 'former-contract', label: '非在职派遣', path: '/hr/former-contract' }
      ]}
      currentPath="/hr/former"
    >
      <div style={styles.container}>
      
      <div style={styles.header}>
        <SearchBar 
          placeholder="请输入员工姓名、工号或身份证号搜索" 
          onSearch={handleSearchChange} 
          value={searchValue}
        />
        <div style={styles.headerButtons}>
          <button 
            onClick={exportDataToExcel} 
            style={styles.exportButton}
          >
            导出数据
          </button>
          <label style={styles.importButton}>
            导入数据
            <input 
              type="file" 
              onChange={importDataFromFile}
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <DataTable columns={columns} dataSource={getCurrentPageData()} loading={loading} />

      <div style={styles.footer}>
        <Pagination 
          current={currentPage}
          total={filteredData.length}
          pageSize={pageSize}
          onChange={setCurrentPage}
          showSizeChanger={true}
          pageSizeOptions={['10', '20', '30', '40', '50']}
          onPageSizeChange={setPageSize}
          showTotal={(total: number, range: [number, number]) => `共 ${total} 条记录，当前显示第 ${range[0]}-${range[1]} 条`}
        />
      </div>

      {/* 员工详情模态框 */}
      <Modal
        title="员工详情"
        visible={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        footer={[
            <button
              key="save"
              onClick={handleSaveLeaveReason}
              style={styles.saveButton}
            >
              保存
            </button>,
            <button 
              key="close" 
              onClick={() => setIsDetailModalOpen(false)}
              style={styles.closeButton}
            >
              关闭
            </button>
          ]}
      >
        {currentEmployee && (
          <div style={styles.detailContainer}>
            <div style={styles.detailRow}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>工号：</label>
                <span>{currentEmployee.employeeId}</span>
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>姓名：</label>
                <span>{currentEmployee.name}</span>
              </div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>身份证号：</label>
                <span>{currentEmployee.idNumber}</span>
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>性别：</label>
                <span>{currentEmployee.gender === 'male' ? '男' : '女'}</span>
              </div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>年龄：</label>
                <span>{currentEmployee.age}</span>
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>学历：</label>
                <span>{currentEmployee.education}</span>
              </div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>原部门：</label>
                <span>{currentEmployee.department}</span>
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>原职位：</label>
                <span>{currentEmployee.position}</span>
              </div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>入职日期：</label>
                <span>{currentEmployee.hireDate}</span>
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>离职日期：</label>
                <span>{currentEmployee.leaveDate}</span>
              </div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>离职原因：</label>
                <input
                  type="text"
                  value={editingLeaveReason}
                  onChange={(e) => setEditingLeaveReason(e.target.value)}
                  style={styles.editInput}
                />
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>归档日期：</label>
                <span>{currentEmployee.archiveDate}</span>
              </div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>手机号：</label>
                <span>{currentEmployee.phone}</span>
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>邮箱：</label>
                <span>{currentEmployee.email}</span>
              </div>
            </div>
          </div>
        )}
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
    gap: '10px',
    marginLeft: '20px'
  },
  exportButton: {
    padding: '6px 16px',
    backgroundColor: '#52c41a',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  importButton: {
    padding: '6px 16px',
    backgroundColor: '#fa8c16',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'inline-block'
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
    fontSize: '12px'
  },
  closeButton: {
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginLeft: '10px'
  },
  saveButton: {
    padding: '8px 16px',
    backgroundColor: '#1890ff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  editInput: {
    padding: '4px 8px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    width: '200px',
    fontSize: '14px'
  },
  detailContainer: {
    marginTop: '10px'
  },
  detailRow: {
    display: 'flex',
    marginBottom: '16px'
  },
  detailItem: {
    flex: 1,
    marginRight: '20px',
    display: 'flex',
    alignItems: 'center'
  },
  detailLabel: {
    fontWeight: 'bold',
    marginRight: '8px',
    minWidth: '80px'
  }
};

export default FormerEmployeeSystem;