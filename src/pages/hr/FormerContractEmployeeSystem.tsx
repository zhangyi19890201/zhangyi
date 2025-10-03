import React, { useState } from 'react';
import DataTable from '@/components/DataTable';
import SearchBar from '@/components/SearchBar';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import HRSystemLayout from '@/components/HRSystemLayout';
import ExcelUtils from '@/utils/excelUtils';
import useHRData from '@/hooks/useHRData';
import { calculateAgeFromIdNumber, getGenderFromIdNumber } from '@/utils/idUtils';

// 生成唯一ID
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 非在职劳务派遣人员接口定义
export interface FormerContractEmployee {
  id: string;
  employeeId: string;
  name: string;
  idNumber: string;
  gender: 'male' | 'female';
  age: number;
  department?: string;
  position: string;
  employmentAgency: string;
  contractStartDate: string;
  contractEndDate: string;
  actualEndDate?: string;
  employmentDuration: number;
  reasonForLeaving: string;
  lastSalary?: number;
  clearanceStatus: 'completed' | 'pending' | 'incomplete';
  contactPhone?: string;
  emergencyContact?: string;
  remarks?: string;
}

// 生成模拟数据
const generateMockData = (): FormerContractEmployee[] => {
  const mockData: FormerContractEmployee[] = [
    {
      id: 'F1',
      employeeId: 'FCONTRACT001',
      name: '吴十一',
      idNumber: '310101199206067890',
      gender: 'male',
      age: 31,
      department: '市场部',
      position: '市场专员',
      employmentAgency: '上海人力资源服务有限公司',
      contractStartDate: '2022-03-01',
      contractEndDate: '2023-02-28',
      employmentDuration: 12,
      reasonForLeaving: '合同到期不续约',
      lastSalary: 8000,
      clearanceStatus: 'completed',
      contactPhone: '13800138001',
      emergencyContact: '吴父 13900139001',
      remarks: '工作表现良好'
    },
    {
      id: 'F2',
      employeeId: 'FCONTRACT002',
      name: '钱十二',
      idNumber: '310102199507151234',
      gender: 'female',
      age: 28,
      department: '财务部',
      position: '财务助理',
      employmentAgency: '上海财务外包服务有限公司',
      contractStartDate: '2022-05-01',
      contractEndDate: '2023-04-30',
      employmentDuration: 11,
      reasonForLeaving: '个人原因',
      lastSalary: 7500,
      clearanceStatus: 'completed',
      contactPhone: '13700137002',
      emergencyContact: '钱母 13600136002',
      remarks: '工作认真负责'
    },
    {
      id: 'F3',
      employeeId: 'FCONTRACT003',
      name: '孙十三',
      idNumber: '310103199008202345',
      gender: 'male',
      age: 33,
      department: '技术部',
      position: '前端开发',
      employmentAgency: '上海IT人才服务有限公司',
      contractStartDate: '2021-11-01',
      contractEndDate: '2023-10-31',
      employmentDuration: 23,
      reasonForLeaving: '转正式员工',
      lastSalary: 12000,
      clearanceStatus: 'completed',
      contactPhone: '13600136003',
      emergencyContact: '孙妻 13500135003',
      remarks: '技术能力强'
    },
    {
      id: 'F4',
      employeeId: 'FCONTRACT004',
      name: '李四',
      idNumber: '310104199309253456',
      gender: 'male',
      age: 30,
      department: '运营部',
      position: '运营专员',
      employmentAgency: '上海运营外包服务有限公司',
      contractStartDate: '2022-02-01',
      contractEndDate: '2023-01-31',
      employmentDuration: 12,
      reasonForLeaving: '合同到期不续约',
      lastSalary: 7800,
      clearanceStatus: 'completed',
      contactPhone: '13500135004',
      emergencyContact: '李父 13400134004'
    },
    {
      id: 'F5',
      employeeId: 'FCONTRACT005',
      name: '王五',
      idNumber: '310105199110304567',
      gender: 'female',
      age: 32,
      department: '行政部',
      position: '行政助理',
      employmentAgency: '上海行政外包服务有限公司',
      contractStartDate: '2022-01-01',
      contractEndDate: '2023-06-30',
      employmentDuration: 18,
      reasonForLeaving: '个人发展',
      lastSalary: 7200,
      clearanceStatus: 'completed',
      contactPhone: '13400134005',
      emergencyContact: '王母 13300133005'
    }
  ];
  
  return mockData;
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
    marginBottom: '4px',
    fontWeight: 'bold'
  },
  detailContainer: {
    marginTop: '10px'
  },
  detailRow: {
    display: 'flex',
    marginBottom: '16px',
    flexWrap: 'wrap' as const
  },
  detailItem: {
    flex: 1,
    minWidth: '200px',
    marginRight: '20px',
    display: 'flex',
    alignItems: 'center'
  },
  detailItemFull: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start'
  },
  detailLabel: {
    fontWeight: 'bold',
    marginRight: '8px',
    minWidth: '120px'
  },
  closeButton: {
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

const FormerContractEmployeeSystem: React.FC = () => {
  // 使用useHRData hook管理非在职劳务派遣人员数据
  const { 
    data: employees, 
    filteredData: filteredEmployees, 
    saveData,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    handleSearch: handleSearchData,
    getCurrentPageData
  } = useHRData<FormerContractEmployee>({
    localStorageKey: 'formerContractEmployees',
    initialData: generateMockData(),
    pageSize: 10
  });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<FormerContractEmployee | null>(null);
  const [searchValue, setSearchValue] = useState('');

  // 搜索功能
  const handleSearch = (value: string) => {
    setSearchValue(value);
    handleSearchData(value);
  };

  // 查看员工详情
  const handleViewDetail = (employee: FormerContractEmployee) => {
    setCurrentEmployee(employee);
    setIsDetailModalOpen(true);
  };

  // 获取离职手续状态信息
  const getClearanceStatusInfo = (status: string) => {
    const statusMap = {
      completed: { text: '已完成', color: '#52c41a' },
      pending: { text: '待跟进', color: '#faad14' },
      incomplete: { text: '未完成', color: '#ff4d4f' }
    };
    
    return statusMap[status as keyof typeof statusMap] || { text: status, color: '#666' };
  };

  // 计算派遣时长（年和月）
  const formatEmploymentDuration = (days: number): string => {
    if (days <= 0) return '0天';
    
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    
    if (years === 0) {
      return `${months}个月`;
    } else if (months === 0) {
      return `${years}年`;
    } else {
      return `${years}年${months}个月`;
    }
  };



  // 表格列定义
  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 60,
    render: (_value: unknown, _record: any, index: number) => (currentPage - 1) * pageSize + index + 1
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100
    },
    {
      title: '工号',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 120
    },
    {
      title: '身份证号',
      dataIndex: 'idNumber',
      key: 'idNumber',
      width: 180,
    render: (value: unknown) => {
      const idNumber = typeof value === 'string' ? value : String(value ?? '');
      if (!idNumber) return '';
      return idNumber.replace(/(\d{6})(\d{8})(\d{4})/, '$1********$3');
    }
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
    render: (value: unknown) => {
      const gender = typeof value === 'string' ? value : String(value ?? '');
      return gender === 'male' ? '男' : '女';
    }
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 80
    },
    {
      title: '原部门',
      dataIndex: 'department',
      key: 'department',
      width: 100
    },
    {
      title: '原岗位',
      dataIndex: 'position',
      key: 'position',
      width: 120
    },
    {
      title: '派遣机构',
      dataIndex: 'employmentAgency',
      key: 'employmentAgency',
      width: 150
    },
    {
      title: '合同开始日',
      dataIndex: 'contractStartDate',
      key: 'contractStartDate',
      width: 120
    },
    {
      title: '合同结束日',
      dataIndex: 'contractEndDate',
      key: 'contractEndDate',
      width: 120
    },
    {
      title: '派遣时长',
      key: 'duration',
      width: 100,
    render: (_value: unknown, record: FormerContractEmployee) => {
      return formatEmploymentDuration(record.employmentDuration);
    }
    },
    {
      title: '离职原因',
      dataIndex: 'reasonForLeaving',
      key: 'reasonForLeaving',
      width: 120
    },
    {
      title: '离职手续',
      dataIndex: 'clearanceStatus',
      key: 'clearanceStatus',
      width: 100,
        render: (value: unknown) => {
          const status = typeof value === 'string' ? value : String(value ?? '');
          const statusInfo = getClearanceStatusInfo(status as any);
          return (
          <span style={{ color: statusInfo.color, fontWeight: 'bold' }}>
            {statusInfo.text}
          </span>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
    render: (_value: unknown, record: FormerContractEmployee) => (
        <button 
          onClick={() => handleViewDetail(record)} 
          style={{
            padding: '4px 12px',
            backgroundColor: '#1890ff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          详情
        </button>
      ),
      width: 100
    }
  ];



  // 导出数据
  const exportDataToExcel = () => {
    try {
      // 准备导出数据，转换性别和状态显示
      const exportData = filteredEmployees.map(emp => ({
        '工号': emp.employeeId,
        '姓名': emp.name,
        '身份证号': emp.idNumber,
        '性别': emp.gender === 'male' ? '男' : '女',
        '年龄': emp.age,
        '原部门': emp.department || '-',
        '原岗位': emp.position,
        '派遣机构': emp.employmentAgency,
        '合同开始日': emp.contractStartDate,
        '合同结束日': emp.contractEndDate,
        '实际结束日': emp.actualEndDate || '-',
        '派遣时长': formatEmploymentDuration(emp.employmentDuration),
        '离职原因': emp.reasonForLeaving,
        '最后薪资': emp.lastSalary ? `¥${emp.lastSalary.toLocaleString()}` : '-',
        '离职手续': getClearanceStatusInfo(emp.clearanceStatus).text,
        '联系电话': emp.contactPhone || '-',
        '紧急联系人': emp.emergencyContact || '-',
        '备注': emp.remarks || '-'
      }));

      ExcelUtils.exportToExcel(
        exportData,
        `非在职劳务派遣人员数据_${new Date().toISOString().split('T')[0]}.xlsx`,
        '非在职劳务派遣人员数据'
      );
      alert('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  };

  // 导入数据
  const importDataFromExcel = async function(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('请选择Excel文件（.xlsx或.xls格式）');
      return;
    }

    try {
      // 使用ExcelUtils导入数据
      const importedData = await ExcelUtils.importFromExcel<Record<string, any>>(file);
      
      // 处理导入的数据
      const importedEmployees: FormerContractEmployee[] = importedData.map(function(item, index) {
        // 映射Excel列到员工对象
        const idNumber = item['身份证号'] || '';
        const startDate = item['合同开始日'] || '';
        const endDate = item['合同结束日'] || '';
        
        // 计算派遣时长
        let duration = 0;
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }
        
        return {
          id: generateUniqueId(),
          employeeId: item['工号'] || `FCONTRACT${Date.now().toString().slice(-6)}${index}`,
          name: item['姓名'] || '',
          idNumber: idNumber.toString(),
          gender: idNumber ? getGenderFromIdNumber(idNumber.toString()) : 'male',
          age: idNumber ? calculateAgeFromIdNumber(idNumber.toString()) : 0,
          department: item['原部门'] || '',
          position: item['原岗位'] || '',
          employmentAgency: item['派遣机构'] || '',
          contractStartDate: startDate,
          contractEndDate: endDate,
          actualEndDate: item['实际结束日'] || endDate,
          employmentDuration: duration,
          reasonForLeaving: item['离职原因'] || '',
          lastSalary: item['最后薪资'] ? Number(item['最后薪资']) : 0,
          clearanceStatus: (item['离职手续状态'] === '已完成' ? 'completed' : item['离职手续状态'] === '待跟进' ? 'pending' : 'incomplete') as 'completed' | 'pending' | 'incomplete',
          contactPhone: item['联系电话'] || '',
          emergencyContact: item['紧急联系人'] || '',
          remarks: item['备注'] || ''
        };
      }).filter(function(emp) { return emp.name && emp.idNumber; });

      if (importedEmployees.length === 0) {
        alert('没有有效数据被导入');
        return;
      }

      // 更新数据
      const updatedEmployees = [...employees, ...importedEmployees];
      saveData(updatedEmployees);
      
      alert(`成功导入 ${importedEmployees.length} 条数据`);
    } catch (error) {
      alert('导入失败：' + (error as Error).message);
    }
    
    // 清空文件输入
    e.target.value = '';
  };

  return (
    <HRSystemLayout 
      title="非在职劳务派遣信息系统" 
      navItems={[
        {key: 'formerContract', label: '非在职劳务派遣', path: '/hr/formerContract'}
      ]}
      currentPath={window.location.pathname}
    >
      <div style={styles.container}>
      <div style={styles.header}>
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="搜索员工姓名/工号/派遣机构/离职原因"
          value={searchValue}
        />
        <div style={styles.importExportButtons}>
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
          loading={false}
        />
      <div style={styles.footer}>
          <Pagination 
            total={filteredEmployees.length}
            pageSize={pageSize}
            current={currentPage}
            onChange={setCurrentPage}
            showTotal={(total: number, range: number[]) => `共${total}条记录, 当前显示第${range[0]}-${range[1]}条`}
            showSizeChanger
            onPageSizeChange={(size: number) => setPageSize(size)}
            pageSizeOptions={['10', '20', '50', '100']}
          />
        </div>
      
      {/* 员工详情弹窗 */}
      <Modal
        title="非在职派遣员工详情"
        visible={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        footer={[
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
                <label style={styles.detailLabel}>原部门：</label>
                <span>{currentEmployee.department || '-'}</span>
              </div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>原岗位：</label>
                <span>{currentEmployee.position}</span>
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>派遣机构：</label>
                <span>{currentEmployee.employmentAgency}</span>
              </div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>合同开始日：</label>
                <span>{currentEmployee.contractStartDate}</span>
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>合同结束日：</label>
                <span>{currentEmployee.contractEndDate}</span>
              </div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>实际结束日：</label>
                <span>{currentEmployee.actualEndDate || '-'}</span>
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>派遣时长：</label>
                <span>{formatEmploymentDuration(currentEmployee.employmentDuration)}</span>
              </div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>离职原因：</label>
                <span>{currentEmployee.reasonForLeaving}</span>
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>最后薪资：</label>
                <span>{currentEmployee.lastSalary ? `¥${currentEmployee.lastSalary.toLocaleString()}` : '-'}</span>
              </div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>离职手续：</label>
                <span style={{
                  color: getClearanceStatusInfo(currentEmployee.clearanceStatus).color,
                  fontWeight: 'bold'
                }}>
                  {getClearanceStatusInfo(currentEmployee.clearanceStatus).text}
                </span>
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>联系电话：</label>
                <span>{currentEmployee.contactPhone || '-'}</span>
              </div>
            </div>
            
            <div style={styles.detailRow}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>紧急联系人：</label>
                <span>{currentEmployee.emergencyContact || '-'}</span>
              </div>
            </div>
            
            {currentEmployee.remarks && (
              <div style={styles.detailRow}>
                <div style={styles.detailItemFull}>
                  <label style={styles.detailLabel}>备注：</label>
                  <span>{currentEmployee.remarks}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal></div>
    </HRSystemLayout>
  );
};

export default FormerContractEmployeeSystem;