import React, { useState } from 'react';
import DataTable from '@/components/DataTable';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import HRSystemLayout from '@/components/HRSystemLayout';
import useHRData from '@/hooks/useHRData';
import ExcelUtils from '@/utils/excelUtils';
import { generateUniqueId } from '@/utils/idUtils';

// 定义劳务派遣人员接口
export interface ContractEmployee {
  id: string;
  employeeId: string;
  name: string;
  idNumber: string;
  gender: 'male' | 'female';
  age: number;
  department?: string;
  position: string;
  project: string;
  employmentAgency: string;
  contractStartDate: string;
  contractEndDate?: string;
  salary?: number;
  paymentMethod?: string;
  status: 'active' | 'expired' | 'renewed';
  contactPhone?: string;
  emergencyContact?: string;
}

interface StatusInfo {
  text: string;
  color: string;
}

// 样式定义
const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  title: {
    color: '#333',
    marginBottom: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
    gap: '10px'
  },
  importExportButtons: {
    display: 'flex',
    gap: '10px'
  },
  addButton: {
    backgroundColor: '#1890ff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    cursor: 'pointer'
  },
  actionButton: {
    backgroundColor: '#fff',
    color: '#666',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    padding: '8px 16px',
    cursor: 'pointer'
  },
  fileInput: {
    display: 'none'
  },
  footer: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  modalBody: {
    padding: '20px'
  },
  formGroup: {
    marginBottom: '16px'
  },
  formLabel: {
    display: 'block',
    marginBottom: '4px'
  },
  formInput: {
    width: '100%',
    padding: '8px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px'
  }
};

const ContractEmployeeSystem = () => {
  // 使用HR数据管理Hook
  const {
    data: employees,
    filteredData,
    loading,
    addItem,
    deleteItem,
    handleSearch,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    getCurrentPageData
  } = useHRData<ContractEmployee>({
    localStorageKey: 'contract_employees',
    initialData: [],
    pageSize: 10
  });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<ContractEmployee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<ContractEmployee>>({
    project: '',
    employmentAgency: '',
    contractStartDate: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  // 查看员工详情
  const handleViewDetail = (employee: ContractEmployee) => {
    setCurrentEmployee(employee);
    setIsDetailModalOpen(true);
  };

  // 根据身份证号获取性别
  const getGenderFromIdNumber = (idNumber: string): 'male' | 'female' => {
    // 身份证号第17位数字，奇数为男，偶数为女
    if (idNumber.length === 18) {
      const genderDigit = parseInt(idNumber.charAt(16), 10);
      return genderDigit % 2 === 1 ? 'male' : 'female';
    }
    return 'male';
  };

  // 计算年龄
  const calculateAgeFromIdNumber = (idNumber: string): number => {
    if (idNumber.length === 18) {
      const birthYear = parseInt(idNumber.substring(6, 10), 10);
      const birthMonth = parseInt(idNumber.substring(10, 12), 10);
      const birthDay = parseInt(idNumber.substring(12, 14), 10);
      
      const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      
      // 调整年龄，如果生日还没过
      if (today.getMonth() < birthDate.getMonth() || 
          (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    }
    return 0;
  };

  // 验证身份证号格式 - TODO: 后续可能会使用
  /*
  const validateIdNumber = (idNumber: string): boolean => {
    const idRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return idRegex.test(idNumber);
  };
  */

  // 计算派遣时长文本格式（多少年多少月）
  const calculateEmploymentDurationText = (startDate: string, endDate?: string): string => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    
    // 调整月份差
    if (months < 0 || (months === 0 && end.getDate() < start.getDate())) {
      years--;
      months += 12;
    }
    
    return `${years}年${months}月`;
  };

  // 获取状态信息
  const getStatusInfo = (status: string) => {
    const statusMap = {
      active: { text: '在用', color: '#52c41a' },
      expired: { text: '已过期', color: '#faad14' },
      renewed: { text: '已续约', color: '#1890ff' }
    };
    
    return statusMap[status as keyof typeof statusMap] || { text: status, color: '#666' };
  };

  // 表格列定义
    const columns = [
      {
        title: '序号',
        key: 'index',
        width: 60,
  render: (_value: unknown, _record: ContractEmployee | null, index: number) => (currentPage - 1) * pageSize + index + 1
      },
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '身份证号',
        dataIndex: 'idNumber',
        key: 'idNumber',
        render: (value: unknown) => {
          const idNumber = typeof value === 'string' ? value : String(value ?? '');
          if (!idNumber) return '';
          return idNumber;
        }
      },
      {
        title: '性别',
        dataIndex: 'gender',
        key: 'gender',
        render: (value: unknown) => {
          const gender = typeof value === 'string' ? value : String(value ?? '');
          return gender === 'male' ? '男' : '女';
        }
      },
      {
        title: '年龄',
        dataIndex: 'age',
        key: 'age'
      },
      {
        title: '劳务派遣项目',
        dataIndex: 'project',
        key: 'project'
      },
      {
        title: '派遣机构',
        dataIndex: 'employmentAgency',
        key: 'employmentAgency'
      },
      {
        title: '合同开始日',
        dataIndex: 'contractStartDate',
        key: 'contractStartDate'
      },
      {
        title: '派遣时长',
        key: 'employmentDuration',
        render: (_value: unknown, record: ContractEmployee) => {
          if (!record.contractStartDate) return '';
          return calculateEmploymentDurationText(record.contractStartDate, record.contractEndDate);
        }
      },
      {
        title: '岗位',
        dataIndex: 'position',
        key: 'position'
      },
      {
        title: '操作',
        key: 'action',
  render: (_value: unknown, record: ContractEmployee) => (
          <span className="action-buttons">
            <button className="detail-btn" onClick={() => handleViewDetail(record)}>详情</button>
            <button className="edit-btn" onClick={() => handleEditEmployee(record)}>编辑</button>
            <button className="delete-btn" onClick={() => handleDeleteEmployee(record.id)}>删除</button>
          </span>
        ),
        width: 150
      }
    ];

  // 分页数据已由useHRData hook提供的getCurrentPageData()方法处理

  // 打开新增员工模态框
  const handleAddEmployee = () => {
    // 重置表单
    setNewEmployee({
      project: '',
      employmentAgency: '',
      contractStartDate: new Date().toISOString().split('T')[0],
      status: 'active'
    });
    setIsAddModalOpen(true);
  };

  // 处理新增员工表单输入变化
  const handleNewEmployeeChange = (field: keyof ContractEmployee, value: string) => {
    setNewEmployee(prev => ({ ...prev, [field]: value }));
    
    // 当身份证号改变时，自动计算性别和年龄
    if (field === 'idNumber' && value && value.length === 18) {
      setNewEmployee(prev => ({
        ...prev,
        gender: getGenderFromIdNumber(value),
        age: calculateAgeFromIdNumber(value)
      }));
    }
  };

  // 保存新增员工
  const handleSaveNewEmployee = () => {
    // 简单验证必要字段
    if (!newEmployee.name || !newEmployee.idNumber || !newEmployee.contractStartDate) {
      alert('请填写姓名、身份证号和合同开始日');
      return;
    }

    // 验证身份证号格式
    const idRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (!idRegex.test(newEmployee.idNumber)) {
      alert('身份证号格式不正确');
      return;
    }

    // 自动生成工号
    const employeeId = `CONTRACT${Date.now().toString().slice(-6)}`;
    
    // 确保性别和年龄已设置
    const gender = newEmployee.gender || getGenderFromIdNumber(newEmployee.idNumber);
    const age = newEmployee.age || calculateAgeFromIdNumber(newEmployee.idNumber);

    // 创建新员工记录
    const employeeToAdd: ContractEmployee = {
      id: generateUniqueId(),
      employeeId,
      name: newEmployee.name,
      idNumber: newEmployee.idNumber,
      gender,
      age,
      department: newEmployee.department || '',
      position: newEmployee.position || '',
      project: newEmployee.project || '',
      employmentAgency: newEmployee.employmentAgency || '',
      contractStartDate: newEmployee.contractStartDate,
      contractEndDate: newEmployee.contractEndDate,
      salary: newEmployee.salary || 0,
      paymentMethod: newEmployee.paymentMethod || '',
      status: newEmployee.status as 'active' | 'expired' | 'renewed',
      contactPhone: newEmployee.contactPhone || '',
      emergencyContact: newEmployee.emergencyContact || ''
    };

    // 添加到员工列表
    addItem(employeeToAdd);

    // 关闭模态框
    setIsAddModalOpen(false);
    alert('新增员工成功');
  };

    // 编辑员工
  const handleEditEmployee = (_employee: ContractEmployee) => {
    // 这里可以实现编辑员工的逻辑
    alert('编辑员工功能待实现');
  };

  // 删除员工
  const handleDeleteEmployee = (employeeId: string) => {
    if (window.confirm('确定要删除该劳务派遣人员吗？')) {
      deleteItem(employeeId);
      alert('员工已成功删除');
    }
  };

  // 导出数据
  const exportDataToExcel = () => {
    const headers = {
      employeeId: '工号',
      name: '姓名',
      gender: '性别',
      age: '年龄',
      department: '部门',
      position: '岗位',
      employmentAgency: '派遣机构',
      contractStartDate: '合同开始日',
      contractEndDate: '合同结束日',
      salary: '薪资',
      paymentMethod: '支付方式',
      status: '状态',
      contactPhone: '联系方式',
      emergencyContact: '紧急联系人'
    };

    const exportData = filteredData.map(emp => ({
      ...emp,
      gender: emp.gender === 'male' ? '男' : '女',
      status: getStatusInfo(emp.status).text
    }));

    try {
      ExcelUtils.exportToExcel(
        exportData,
        `劳务派遣人员数据_${new Date().toISOString().split('T')[0]}`,
        '派遣员工数据'
      );
      alert('导出成功');
    } catch (error) {
      console.error('导出数据失败:', error);
      alert('导出失败，请重试');
    }
  };

  // 导入数据
  const importDataFromExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ExcelUtils.isExcelFile(file)) {
      alert('请选择Excel文件（.xlsx或.xls格式）');
      return;
    }

    try {
      const importedData = await ExcelUtils.importFromExcel(file);
      
      // 处理导入的数据
      const importedEmployees: ContractEmployee[] = importedData.map((item, index) => {
        // 映射Excel列到员工对象
        const idNumber = item['身份证号'] || '';
        return {
          id: generateUniqueId(),
          employeeId: item['工号'] || `CONTRACT${Date.now().toString().slice(-6)}${index}`,
          name: item['姓名'] || '',
          idNumber: idNumber.toString(),
          gender: idNumber ? getGenderFromIdNumber(idNumber.toString()) : 'male',
          age: idNumber ? calculateAgeFromIdNumber(idNumber.toString()) : 0,
          department: item['部门'] || '',
          position: item['岗位'] || '',
          project: item['劳务派遣项目'] || '',
          employmentAgency: item['派遣机构'] || '',
          contractStartDate: item['合同开始日'] || '',
          contractEndDate: item['合同结束日'] || '',
          salary: item['薪资'] ? Number(item['薪资']) : 0,
          paymentMethod: item['支付方式'] || '',
          status: (item['状态'] === '在用' ? 'active' : item['状态'] === '已过期' ? 'expired' : item['状态'] === '已续约' ? 'renewed' : 'active') as 'active' | 'expired' | 'renewed',
          contactPhone: item['联系方式'] || '',
          emergencyContact: item['紧急联系人'] || ''
        };
      }).filter(emp => emp.name && emp.idNumber);

      if (importedEmployees.length === 0) {
        alert('没有有效数据被导入');
        return;
      }

      // 添加多个员工
      importedEmployees.forEach(employee => addItem(employee));
      
      alert(`成功导入 ${importedEmployees.length} 条数据`);
    } catch (error) {
      alert('导入失败：' + (error as Error).message);
    }
    
    // 清空文件输入
    e.target.value = '';
  };

  return (
    <HRSystemLayout
      title="派遣员工管理系统"
      navItems={[
        { key: 'current', label: '在职员工', path: '/hr/current' },
        { key: 'contract', label: '派遣员工', path: '/hr/contract' },
        { key: 'former', label: '离职员工', path: '/hr/former' }
      ]}
      currentPath="/hr/contract"
    >
      <div style={styles.container}>
      <div style={styles.header}>
        <SearchBar 
          onSearch={handleSearch}
          placeholder="请输入员工姓名、工号或身份证号搜索" 
        />
        <div style={styles.importExportButtons}>
          <button style={styles.addButton} onClick={handleAddEmployee}>
            新增劳务派遣人员
          </button>
          <button style={styles.actionButton} onClick={exportDataToExcel}>
            导出数据
          </button>
          <label style={styles.actionButton}>
            导入数据
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              style={styles.fileInput} 
              onChange={importDataFromExcel} 
            />
          </label>
        </div>
      </div>
      <DataTable 
        columns={columns}
        dataSource={getCurrentPageData()}
        loading={loading}
      />
      <div style={styles.footer}>
        <Pagination 
          total={filteredData.length}
          current={currentPage}
          pageSize={pageSize}
          onChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          showSizeChanger={true}
          showTotal={(total: number, range: [number, number]) => `共 ${total} 条记录，当前显示第 ${range[0]}-${range[1]} 条`}
        />
      </div>
      
      {/* 新增员工弹窗 */}
      <Modal
        title="新增劳务派遣人员"
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        footer={[
          <button key="cancel" onClick={() => setIsAddModalOpen(false)}>取消</button>,
          <button key="save" onClick={handleSaveNewEmployee} style={{ backgroundColor: '#1890ff', color: '#fff' }}>保存</button>
        ]}
      >
        <div style={styles.modalBody}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>姓名 *：</label>
            <input 
              type="text" 
              style={styles.formInput}
              value={newEmployee.name || ''}
              onChange={(e) => handleNewEmployeeChange('name', e.target.value)}
              placeholder="请输入姓名"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>身份证号 *：</label>
            <input 
              type="text" 
              style={styles.formInput}
              value={newEmployee.idNumber || ''}
              onChange={(e) => handleNewEmployeeChange('idNumber', e.target.value)}
              placeholder="请输入18位身份证号"
              maxLength={18}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>性别：</label>
            <span>{newEmployee.gender === 'male' ? '男' : '女'}</span>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>年龄：</label>
            <span>{newEmployee.age || '-'}</span>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>岗位：</label>
            <input 
              type="text" 
              style={styles.formInput}
              value={newEmployee.position || ''}
              onChange={(e) => handleNewEmployeeChange('position', e.target.value)}
              placeholder="请输入岗位"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>劳务派遣项目：</label>
            <input 
              type="text" 
              style={styles.formInput}
              value={newEmployee.project || ''}
              onChange={(e) => handleNewEmployeeChange('project', e.target.value)}
              placeholder="请输入劳务派遣项目"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>派遣机构 *：</label>
            <input 
              type="text" 
              style={styles.formInput}
              value={newEmployee.employmentAgency || ''}
              onChange={(e) => handleNewEmployeeChange('employmentAgency', e.target.value)}
              placeholder="请输入派遣机构"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>合同开始日 *：</label>
            <input 
              type="date" 
              style={styles.formInput}
              value={newEmployee.contractStartDate || ''}
              onChange={(e) => handleNewEmployeeChange('contractStartDate', e.target.value)}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>合同结束日：</label>
            <input 
              type="date" 
              style={styles.formInput}
              value={newEmployee.contractEndDate || ''}
              onChange={(e) => handleNewEmployeeChange('contractEndDate', e.target.value)}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>联系方式：</label>
            <input 
              type="tel" 
              style={styles.formInput}
              value={newEmployee.contactPhone || ''}
              onChange={(e) => handleNewEmployeeChange('contactPhone', e.target.value)}
              placeholder="请输入联系方式"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>紧急联系人：</label>
            <input 
              type="text" 
              style={styles.formInput}
              value={newEmployee.emergencyContact || ''}
              onChange={(e) => handleNewEmployeeChange('emergencyContact', e.target.value)}
              placeholder="请输入紧急联系人"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>薪资：</label>
            <input 
              type="number" 
              style={styles.formInput}
              value={newEmployee.salary || 0}
              onChange={(e) => handleNewEmployeeChange('salary', e.target.value)}
              placeholder="请输入薪资"
              min="0"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>支付方式：</label>
            <input 
              type="text" 
              style={styles.formInput}
              value={newEmployee.paymentMethod || ''}
              onChange={(e) => handleNewEmployeeChange('paymentMethod', e.target.value)}
              placeholder="请输入支付方式"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>状态：</label>
            <select 
              style={styles.formInput}
              value={newEmployee.status || 'active'}
              onChange={(e) => handleNewEmployeeChange('status', e.target.value)}
            >
              <option value="active">在用</option>
              <option value="expired">已过期</option>
              <option value="renewed">已续约</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="员工详情"
        visible={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      >
        {currentEmployee && (
          <div style={styles.modalBody}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>工号：</label>
              <span>{currentEmployee.employeeId}</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>姓名：</label>
              <span>{currentEmployee.name}</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>性别：</label>
              <span>{currentEmployee.gender === 'male' ? '男' : '女'}</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>年龄：</label>
              <span>{currentEmployee.age}</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>身份证号：</label>
              <span>{currentEmployee.idNumber}</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>部门：</label>
              <span>{currentEmployee.department || '-'}</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>岗位：</label>
              <span>{currentEmployee.position}</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>项目：</label>
              <span>{currentEmployee.project}</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>派遣机构：</label>
              <span>{currentEmployee.employmentAgency}</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>合同开始日：</label>
              <span>{currentEmployee.contractStartDate}</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>合同结束日：</label>
              <span>{currentEmployee.contractEndDate || '-'}</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>薪资：</label>
              <span>{currentEmployee.salary || '-'}</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>支付方式：</label>
              <span>{currentEmployee.paymentMethod || '-'}</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>状态：</label>
              <span style={{ color: getStatusInfo(currentEmployee.status).color }}>
                {getStatusInfo(currentEmployee.status).text}
              </span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>联系方式：</label>
              <span>{currentEmployee.contactPhone || '-'}</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>紧急联系人：</label>
              <span>{currentEmployee.emergencyContact || '-'}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
    </HRSystemLayout>
  );
};

export default ContractEmployeeSystem;