import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '@/components/DataTable';
import SearchBar from '@/components/SearchBar';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import HRSystemLayout from '@/components/HRSystemLayout';
import useHRData from '@/hooks/useHRData';
import ExcelUtils from '@/utils/excelUtils';

// 证书类型定义
export type CertificateTypeId = 'skill' | 'professional' | 'technical' | 'language' | 'management';

export interface CertificateType {
  id: CertificateTypeId;
  name: string;
}

// 证书状态类型
export type CertificateStatus = 'valid' | 'expired' | 'upcoming_expiry';

// 附件类型
export interface Attachment {
  name: string;
  type: string;
  size: number;
  url: string;
}

// 员工信息接口
export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  [key: string]: any;
}

// 员工证书信息接口
export interface EmployeeCertificate {
  id: string;
  employeeId: string;
  employeeName: string;
  certificateType: CertificateTypeId;
  certificateName: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  issueAuthority: string;
  status: CertificateStatus;
  level?: string;
  remarks?: string;
  attachments?: Attachment[];
}

// 证书表单数据类型
export type CertificateFormData = Omit<EmployeeCertificate, 'id' | 'status'>;

const EmployeeDocumentSystem: React.FC = () => {
  // 使用HR数据管理Hook管理证书数据
  const { 
    data: certificates, 
    filteredData: filteredCertificates, 
    loading, 
    setLoading,
    addItem,
    updateItem,
    deleteItem,
    saveData,
    handleSearch,
    currentPage, 
    setCurrentPage,
    pageSize,
    setPageSize,
    getCurrentPageData
  } = useHRData<EmployeeCertificate>({
    localStorageKey: 'employeeCertificates',
    initialData: [], // 初始化空数据
    pageSize: 20
  });
  
  // 模态框状态
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEmployeeSelectModalOpen, setIsEmployeeSelectModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [currentCertificate, setCurrentCertificate] = useState<EmployeeCertificate | null>(null);
  const [certificateToDelete, setCertificateToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Excel操作状态
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState(false);
  
  // 员工数据状态（使用模拟数据）
  const [employees] = useState<Employee[]>([
    { id: '1', employeeId: 'EMP001', name: '张三', department: '研发部', position: '高级工程师' },
    { id: '2', employeeId: 'EMP002', name: '李四', department: '财务部', position: '会计' },
    { id: '3', employeeId: 'EMP003', name: '王五', department: '市场部', position: '市场经理' },
    { id: '4', employeeId: 'EMP004', name: '赵六', department: '研发部', position: '软件工程师' },
    { id: '5', employeeId: 'EMP005', name: '钱七', department: '人力资源部', position: 'HR专员' }
  ]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  
  // 计算证书状态
  const calculateStatus = useCallback((expiryDate: string): CertificateStatus => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'expired';
    } else if (diffDays <= 30) {
      return 'upcoming_expiry';
    } else {
      return 'valid';
    }
  }, []);
  
  // 表单数据和状态
  const [newCertificate, setNewCertificate] = useState<CertificateFormData>({
    employeeId: '',
    employeeName: '',
    certificateType: 'skill',
    certificateName: '',
    certificateNumber: '',
    issueDate: '',
    expiryDate: '',
    issueAuthority: '',
    level: '',
    remarks: '',
    attachments: []
  });
  
  // 失效日期编辑状态
  const [isEditingExpiryDate, setIsEditingExpiryDate] = useState(false);
  const [tempExpiryDate, setTempExpiryDate] = useState('');

  // 证书类型列表
  const certificateTypes: CertificateType[] = [
    { id: 'skill', name: '技能证书' },
    { id: 'professional', name: '职称证书' },
    { id: 'technical', name: '技术资格证书' },
    { id: 'language', name: '语言证书' },
    { id: 'management', name: '管理资格证书' }
  ];

  // 初始化证书数据
  useEffect(() => {
    // 使用模拟证书数据作为初始数据
    const mockCertificates: EmployeeCertificate[] = [
      {
        id: '1',
        employeeId: 'EMP001',
        employeeName: '张三',
        certificateType: 'skill',
        certificateName: '高级前端开发工程师认证',
        certificateNumber: 'FE20220001',
        issueDate: '2022-06-15',
        expiryDate: '2027-06-14',
        issueAuthority: '中国软件协会',
        status: calculateStatus('2027-06-14'),
        level: '高级',
        remarks: '年度优秀证书',
        attachments: [
          {
            name: '高级前端开发工程师证书.pdf',
            type: 'application/pdf',
            size: 2097152, // 2MB
            url: 'https://example.com/certificates/FE20220001.pdf'
          },
          {
            name: '考试成绩单.jpg',
            type: 'image/jpeg',
            size: 1048576, // 1MB
            url: 'https://example.com/certificates/FE20220001_score.jpg'
          }
        ]
      },
      {
        id: '2',
        employeeId: 'EMP002',
        employeeName: '李四',
        certificateType: 'professional',
        certificateName: '中级会计师',
        certificateNumber: 'ACC20210002',
        issueDate: '2021-03-20',
        expiryDate: '2026-03-19',
        issueAuthority: '财政部会计资格评价中心',
        status: calculateStatus('2026-03-19')
      }
    ];
    
    // 初始化数据时，如果没有现有数据，则加载模拟数据
    if (certificates.length === 0) {
      mockCertificates.forEach(cert => addItem(cert));
    }
  }, [certificates, addItem, calculateStatus]);

  // Excel导出功能
  const handleExport = useCallback(() => {
    try {
      const exportColumns = [
        { key: 'id', title: '证书ID' },
        { key: 'employeeId', title: '员工ID' },
        { key: 'employeeName', title: '员工姓名' },
        { key: 'certificateType', title: '证书类型' },
        { key: 'certificateName', title: '证书名称' },
        { key: 'issueAuthority', title: '发证机构' },
        { key: 'issueDate', title: '发证日期' },
        { key: 'expiryDate', title: '过期日期' },
        { key: 'certificateNumber', title: '证书编号' },
        { key: 'remarks', title: '描述' },
        { key: 'status', title: '状态' },
      ];
      
      ExcelUtils.exportToExcel(
        filteredCertificates,
        `员工证书信息_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`,
        '员工证书信息',
        exportColumns
      );
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('导出Excel文件失败:', error);
      setExportError(true);
      setTimeout(() => setExportError(false), 3000);
    }
  }, [filteredCertificates]);

  // Excel导入功能
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      
      // 使用ExcelUtils的importFromExcel方法导入数据
      ExcelUtils.importFromExcel(file).then((importedData) => {
        // 处理导入的数据
        const processedData = importedData.map(item => {
          // 查找证书类型ID
          const certTypeId = certificateTypes.find(type => type.name === item['证书类型'])?.id || 'skill';
           
          return {
            id: item['证书ID'] || Date.now().toString() + Math.random().toString(36).substr(2, 9),
            employeeId: item['员工ID'],
            employeeName: item['员工姓名'],
            certificateType: certTypeId,
            certificateName: item['证书名称'],
            issueAuthority: item['发证机构'],
            issueDate: item['发证日期'],
            expiryDate: item['过期日期'],
            certificateNumber: item['证书编号'],
            remarks: item['描述'],
            status: calculateStatus(item['过期日期'] || ''),
            attachments: []
          };
        });
        
        // 更新证书数据
        processedData.forEach(cert => addItem(cert));
        
        // 导入完成后重置文件输入
        event.target.value = '';
        
        // 显示成功消息
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      }).catch(error => {
        console.error('导入Excel文件失败:', error);
        setImportError(true);
        setTimeout(() => setImportError(false), 3000);
      }).finally(() => {
        setLoading(false);
      });
    } catch (error) {
      console.error('导入数据时出错:', error);
      setImportError(true);
      setTimeout(() => setImportError(false), 3000);
      setLoading(false);
    }
  }, [certificateTypes, addItem, calculateStatus]);

  // 更新证书状态 - 优化避免无限循环
  useEffect(() => {
    if (certificates.length === 0) return;
    
    const updatedCertificates = certificates.map(cert => ({
      ...cert,
      status: calculateStatus(cert.expiryDate)
    }));
    
    // 只有当状态真正改变时才更新，避免无限循环
    const hasStatusChanged = updatedCertificates.some((newCert, index) => 
      newCert.status !== certificates[index].status
    );
    
    if (hasStatusChanged) {
      saveData(updatedCertificates);
    }
  }, [certificates, calculateStatus, saveData]);

  // 搜索功能
  useEffect(() => {
    handleSearch(searchTerm);
    setCurrentPage(1);
  }, [searchTerm, handleSearch, setCurrentPage]);

  // 处理员工搜索
  const handleEmployeeSearch = useCallback((term: string) => {
    const lowerTerm = term.toLowerCase();
    const filtered = employees.filter(emp => 
      emp.name.toLowerCase().includes(lowerTerm) ||
      emp.employeeId.toLowerCase().includes(lowerTerm) ||
      emp.department.toLowerCase().includes(lowerTerm)
    );
    setFilteredEmployees(filtered);
  }, [employees]);

  // 处理员工选择
  const handleSelectEmployee = useCallback((employee: Employee) => {
    setNewCertificate(prev => ({
      ...prev,
      employeeId: employee.employeeId,
      employeeName: employee.name
    }));
    setIsEmployeeSelectModalOpen(false);
  }, []);

  // 处理表单输入变化
  const handleInputChange = useCallback((field: string, value: string) => {
    setNewCertificate(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 处理文件上传
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // 创建一个临时的URL用于预览
      const url = URL.createObjectURL(file);
      newAttachments.push({
        name: file.name,
        type: file.type,
        size: file.size,
        url
      });
    }

    setNewCertificate(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newAttachments]
    }));

    // 清空input以便再次选择相同文件
    event.target.value = '';
  }, []);

  // 移除附件
  const handleRemoveAttachment = useCallback((index: number) => {
    setNewCertificate(prev => {
      const updatedAttachments = [...(prev.attachments || [])];
      updatedAttachments.splice(index, 1);
      return {
        ...prev,
        attachments: updatedAttachments
      };
    });
  }, []);

  // 保存证书
  const handleSaveCertificate = useCallback(() => {
    // 表单验证
    if (!newCertificate.employeeId || !newCertificate.certificateName || !newCertificate.certificateNumber) {
      alert('请填写必填字段（员工、证书名称、证书编号）');
      return;
    }

    const newCert: EmployeeCertificate = {
      ...newCertificate,
      id: Date.now().toString(),
      status: calculateStatus(newCertificate.expiryDate)
    };

    addItem(newCert);
    
    // 重置表单
    setNewCertificate({
      employeeId: '',
      employeeName: '',
      certificateType: 'skill',
      certificateName: '',
      certificateNumber: '',
      issueDate: '',
      expiryDate: '',
      issueAuthority: '',
      level: '',
      remarks: '',
      attachments: []
    });

    setIsAddModalOpen(false);
    alert('证书添加成功！');
  }, [newCertificate, addItem, calculateStatus]);

  // 查看证书详情
  const handleViewDetail = useCallback((certificate: EmployeeCertificate) => {
    setCurrentCertificate(certificate);
    setTempExpiryDate(certificate.expiryDate);
    setIsDetailModalOpen(true);
  }, []);

  // 保存失效日期
  const handleSaveExpiryDate = useCallback(() => {
    if (!currentCertificate) return;

    const updatedCertificates = certificates.map(cert => 
      cert.id === currentCertificate.id 
        ? { 
            ...cert, 
            expiryDate: tempExpiryDate, 
            status: calculateStatus(tempExpiryDate) 
          } 
        : cert
    );

    updateItem(currentCertificate.id, { expiryDate: tempExpiryDate, status: calculateStatus(tempExpiryDate) });
    setCurrentCertificate(prev => 
      prev ? { ...prev, expiryDate: tempExpiryDate, status: calculateStatus(tempExpiryDate) } : null
    );
    setIsEditingExpiryDate(false);
    
    // 数据已通过updateItem保存
  }, [currentCertificate, tempExpiryDate, certificates, calculateStatus, updateItem]);

  // 打开删除确认模态框
  const handleDeleteCertificate = useCallback((id: string) => {
    setCertificateToDelete(id);
    setIsDeleteConfirmModalOpen(true);
  }, []);

  // 确认删除证书
  const handleConfirmDelete = useCallback(() => {
    if (certificateToDelete) {
      deleteItem(certificateToDelete);
      
      // 如果删除的是当前查看的证书，关闭详情模态框
      if (currentCertificate && currentCertificate.id === certificateToDelete) {
        setIsDetailModalOpen(false);
      }
      
      // 关闭确认模态框
      setIsDeleteConfirmModalOpen(false);
      setCertificateToDelete(null);
    }
  }, [certificateToDelete, currentCertificate, deleteItem]);

  // 取消删除
  const handleCancelDelete = useCallback(() => {
    setIsDeleteConfirmModalOpen(false);
    setCertificateToDelete(null);
  }, []);

  // 获取证书类型名称
  const getCertificateTypeName = useCallback((typeId: CertificateTypeId): string => {
    const type = certificateTypes.find(t => t.id === typeId);
    return type ? type.name : typeId;
  }, [certificateTypes]);

  // 获取状态信息
  const getStatusInfo = useCallback((status: CertificateStatus) => {
    switch (status) {
      case 'valid':
        return { text: '有效', className: 'status-valid' };
      case 'expired':
        return { text: '已过期', className: 'status-expired' };
      case 'upcoming_expiry':
        return { text: '即将过期', className: 'status-upcoming' };
      default:
        return { text: '未知', className: 'status-unknown' };
    }
  }, []);

  // 表格列定义
  const columns = [
  { key: 'index', title: '序号', dataIndex: 'index', width: 60, render: (_value: unknown, _record: any, index: number) => index + 1 },
    { key: 'employeeId', title: '工号', dataIndex: 'employeeId', width: 100 },
    { key: 'employeeName', title: '姓名', dataIndex: 'employeeName', width: 100 },
  { key: 'certificateType', title: '证书类型', dataIndex: 'certificateType', width: 120, render: (value: unknown) => getCertificateTypeName((typeof value === 'string' ? value : String(value)) as CertificateTypeId) },
    { key: 'certificateName', title: '证书名称', dataIndex: 'certificateName', width: 200 },
    { key: 'certificateNumber', title: '证书编号', dataIndex: 'certificateNumber', width: 150 },
    { key: 'issueDate', title: '发证日期', dataIndex: 'issueDate', width: 120 },
    { key: 'expiryDate', title: '失效日期', dataIndex: 'expiryDate', width: 120 },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value: unknown) => {
        const status = typeof value === 'string' ? value as CertificateStatus : (String(value) as CertificateStatus);
        const info = getStatusInfo(status);
        return <span className={info.className}>{info.text}</span>;
      }
    },
    {
      key: 'action',
      title: '操作',
      width: 150,
  render: (_value: unknown, record: EmployeeCertificate) => (
        <div className="action-buttons">
              <button className="btn-view" onClick={() => handleViewDetail(record)}>查看</button>
              <button className="btn-delete" onClick={() => handleDeleteCertificate(record.id)}>删除</button>
            </div>
      )
    }
  ];

  // 分页数据
  const paginatedData = filteredCertificates.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );

  return (
    <div className="employee-document-system">
      <h1 className="system-title">员工证书信息管理系统</h1>
      
      <div className="system-header">
        <SearchBar 
          placeholder="搜索员工姓名、工号、证书名称或编号" 
          onSearch={setSearchTerm}
          className="search-bar"
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-add" 
            style={{ backgroundColor: '#2196f3' }}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            导入Excel
          </button>
          <button 
            className="btn-add" 
            style={{ backgroundColor: '#ff9800' }}
            onClick={handleExport}
          >
            导出Excel
          </button>
          <button className="btn-add" onClick={() => setIsAddModalOpen(true)}>新增证书</button>
        </div>
        <input
          id="file-input"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>

      {/* 成功/错误消息提示 */}
      {exportSuccess && (
        <div className="success-message" style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
          Excel文件导出成功！
        </div>
      )}
      {exportError && (
        <div className="error-message" style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
          Excel文件导出失败，请重试！
        </div>
      )}
      {importSuccess && (
        <div className="success-message" style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
          Excel文件导入成功！
        </div>
      )}
      {importError && (
        <div className="error-message" style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
          Excel文件导入失败，请重试！
        </div>
      )}

      <div className="table-container">
        <DataTable 
          columns={columns} 
          dataSource={paginatedData} 
          className="certificate-table"
        />
      </div>

      <div className="pagination-container">
        <Pagination 
          current={currentPage}
          total={filteredCertificates.length}
          pageSize={pageSize}
          onChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          showSizeChanger={true}
          className="certificate-pagination"
        />
      </div>

      {/* 删除确认模态框 */}
      <Modal 
        visible={isDeleteConfirmModalOpen} 
        title="确认删除"
        onClose={handleCancelDelete}
        width="400px"
        height="200px"
        className="no-background-modal"
      >
        <div style={{
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          fontSize: '16px',
          color: '#333',
          backgroundColor: 'white'
        }}>
          <p style={{ marginBottom: '30px', textAlign: 'center' }}>确定要删除这个证书吗？</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handleCancelDelete}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#666',
                cursor: 'pointer'
              }}
            >
              取消
            </button>
            <button 
              onClick={handleConfirmDelete}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#d9534f',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              确认
            </button>
          </div>
        </div>
      </Modal>

      {/* 新增证书模态框 */}
      <Modal 
        visible={isAddModalOpen} 
        title="新增证书"
        onClose={() => setIsAddModalOpen(false)}
        width="500px" 
        height="auto"
        centered={true}
      >
        <div className="certificate-form">
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#333' }}>选择员工：</label>
            <div className="employee-selection" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={newCertificate.employeeName} 
                readOnly
                placeholder="请选择员工"
                className="employee-input"
                style={{
                  flex: 1, 
                  padding: '8px 12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  fontSize: '14px',
                  height: '36px',
                  boxSizing: 'border-box'
                }}
              />
              <button 
                className="btn-select-employee"
                onClick={() => setIsEmployeeSelectModalOpen(true)}
                style={{
                  padding: '8px 16px', 
                  backgroundColor: '#2196f3', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                选择
              </button>
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#333' }}>证书名称：</label>
            <input 
              type="text" 
              value={newCertificate.certificateName} 
              onChange={(e) => handleInputChange('certificateName', e.target.value)}
              placeholder="请输入证书名称"
              className="form-input"
              style={{ padding: '8px 12px', fontSize: '14px', height: '36px', border: '1px solid #ddd', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#333' }}>证书编号：</label>
            <input 
              type="text" 
              value={newCertificate.certificateNumber} 
              onChange={(e) => handleInputChange('certificateNumber', e.target.value)}
              placeholder="请输入证书编号"
              className="form-input"
              style={{ padding: '8px 12px', fontSize: '14px', height: '36px', border: '1px solid #ddd', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#333' }}>发证日期：</label>
            <input 
              type="date" 
              value={newCertificate.issueDate} 
              onChange={(e) => handleInputChange('issueDate', e.target.value)}
              placeholder="年/月/日"
              className="form-input date-input"
              style={{ padding: '8px 12px', fontSize: '14px', height: '36px', border: '1px solid #ddd', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#333' }}>失效日期：</label>
            <input 
              type="date" 
              value={newCertificate.expiryDate} 
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              placeholder="年/月/日"
              className="form-input date-input"
              style={{ padding: '8px 12px', fontSize: '14px', height: '36px', border: '1px solid #ddd', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#333' }}>证书类型：</label>
            <select 
              value={newCertificate.certificateType} 
              onChange={(e) => handleInputChange('certificateType', e.target.value)}
              className="form-select certificate-type-select"
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                height: '36px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '100%',
                boxSizing: 'border-box',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"%23666\"%3E%3Cpath stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 9l-7 7-7-7\"%3E%3C/path%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '20px',
                paddingRight: '40px'
              }}
            >
              {certificateTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#333' }}>发证机构：</label>
            <input 
              type="text" 
              value={newCertificate.issueAuthority} 
              onChange={(e) => handleInputChange('issueAuthority', e.target.value)}
              placeholder="请输入发证机构"
              className="form-input"
              style={{ padding: '8px 12px', fontSize: '14px', height: '36px', border: '1px solid #ddd', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#333' }}>等级：</label>
            <input 
              type="text" 
              value={newCertificate.level} 
              onChange={(e) => handleInputChange('level', e.target.value)}
              placeholder="请输入等级（可选）"
              className="form-input"
              style={{ padding: '8px 12px', fontSize: '14px', height: '36px', border: '1px solid #ddd', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#333' }}>备注：</label>
            <textarea 
              value={newCertificate.remarks} 
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              placeholder="请输入备注（可选）"
              rows={3}
              className="form-textarea"
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '100%',
                boxSizing: 'border-box',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#333' }}>附件上传：</label>
            <div className="file-upload-container">
              <input 
                type="file" 
                multiple 
                onChange={handleFileChange}
                className="file-input"
                id="file-upload"
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="file-upload" 
                className="file-upload-label"
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  height: '40px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: '1px dashed #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#fafafa',
                  transition: 'all 0.3s'
                }}
              >
                <span style={{ marginRight: '8px' }}>+</span>选择文件
              </label>
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>支持 PDF、JPG、PNG 等格式，单个文件大小不超过 10MB</div>
          </div>

          {/* 已上传附件列表 */}
          {newCertificate.attachments && newCertificate.attachments.length > 0 && (
            <div className="attachments-list" style={{ marginTop: '20px', marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '500', color: '#333' }}>已上传附件：</h4>
              {newCertificate.attachments.map((attachment, index) => (
                <div key={index} className="attachment-item">
                  <a 
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="attachment-link"
                    style={{
                      color: '#2196f3',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px 0',
                      fontSize: '14px'
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>📎</span>
                    <span style={{ wordBreak: 'break-all', flex: 1 }}>{attachment.name}</span>
                    <span style={{
                      fontSize: '12px', 
                      color: '#999', 
                      marginLeft: '12px',
                      minWidth: '80px',
                      textAlign: 'right'
                    }}>
                      {(attachment.size / 1024 / 1024).toFixed(2)}MB
                    </span>
                    <button
                      className="btn-remove-attachment"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveAttachment(index);
                      }}
                      style={{
                        marginLeft: '12px',
                        padding: '2px 6px',
                        fontSize: '12px',
                        border: 'none',
                        borderRadius: '2px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      删除
                    </button>
                  </a>
                </div>
              ))}
            </div>
          )}

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button 
              className="btn-cancel" 
              onClick={() => setIsAddModalOpen(false)} 
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#666',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              取消
            </button>
            <button 
              onClick={handleSaveCertificate} 
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#4caf50',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              className="btn-save"
            >
              保存
            </button>
          </div>
        </div>
      </Modal>

      {/* 员工选择模态框 */}
      <Modal 
        visible={isEmployeeSelectModalOpen} 
        title="选择员工"
        onClose={() => setIsEmployeeSelectModalOpen(false)}
      >
        <div className="employee-select-modal">
          <SearchBar 
          placeholder="搜索员工姓名、工号或部门"
          onSearch={handleEmployeeSearch}
          className="employee-search-bar"
        />
          
          <div className="employee-list">
            <DataTable 
              columns={[
                { key: 'employeeId', title: '工号', dataIndex: 'employeeId' },
                { key: 'name', title: '姓名', dataIndex: 'name' },
                { key: 'department', title: '部门', dataIndex: 'department' },
                { key: 'position', title: '职位', dataIndex: 'position' },
                { 
                  key: 'action',
                  title: '操作', 
                  render: (_value: unknown, record: Employee) => (
                    <button className="btn-select"
                      onClick={() => handleSelectEmployee(record)}
                      style={{ padding: '12px 24px', fontSize: '16px', height: '48px' }}
                >
                      选择
                    </button>
                  )
                }
              ]}
              dataSource={filteredEmployees}
              className="employee-table"
            />
          </div>
        </div>
      </Modal>

      {/* 证书详情模态框 */}
      {currentCertificate && (
        <Modal 
          visible={isDetailModalOpen} 
          title="证书详情"
          onClose={() => setIsDetailModalOpen(false)}
        >
          <div className="certificate-detail">
            <div className="detail-row">
              <span className="detail-label">工号：</span>
              <span className="detail-value">{currentCertificate.employeeId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">姓名：</span>
              <span className="detail-value">{currentCertificate.employeeName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">证书类型：</span>
              <span className="detail-value">{getCertificateTypeName(currentCertificate.certificateType)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">证书名称：</span>
              <span className="detail-value">{currentCertificate.certificateName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">证书编号：</span>
              <span className="detail-value">{currentCertificate.certificateNumber}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">发证日期：</span>
              <span className="detail-value">{currentCertificate.issueDate}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">失效日期：</span>
              <span className="detail-value">
                {isEditingExpiryDate ? (
                  <div className="expiry-date-edit">
                    <input 
                      type="date" 
                      value={tempExpiryDate} 
                      onChange={(e) => setTempExpiryDate(e.target.value)}
                      className="expiry-date-input"
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    <button 
                      className="btn-save-date" 
                      onClick={handleSaveExpiryDate}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        marginLeft: '8px'
                      }}
                    >保存</button>
                    <button 
                      className="btn-cancel-date" 
                      onClick={() => setIsEditingExpiryDate(false)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'white',
                        color: '#666',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        marginLeft: '8px'
                      }}
                    >取消</button>
                  </div>
                ) : (
                  <div className="expiry-date-display">
                    {currentCertificate.expiryDate || '无'}
                    <button className="btn-edit-date" onClick={() => setIsEditingExpiryDate(true)}>编辑</button>
                  </div>
                )}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">发证机构：</span>
              <span className="detail-value">{currentCertificate.issueAuthority}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">等级：</span>
              <span className="detail-value">{currentCertificate.level || '无'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">状态：</span>
              <span className={`detail-value status-badge ${getStatusInfo(currentCertificate.status).className}`}>
                {getStatusInfo(currentCertificate.status).text}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">备注：</span>
              <span className="detail-value">{currentCertificate.remarks || '无'}</span>
            </div>
            
            {/* 附件显示 */}
            {currentCertificate.attachments && currentCertificate.attachments.length > 0 && (
              <div className="detail-row">
                <span className="detail-label">附件：</span>
                <div className="detail-value">
                  {currentCertificate.attachments.map((attachment, index) => (
                    <div key={index} className="attachment-item">
                      <a 
                        href={attachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="attachment-link"
                        style={{
                          color: '#2196f3',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px 0',
                          fontSize: '14px'
                        }}
                      >
                        <span style={{ marginRight: '8px' }}>📎</span>
                        <span style={{ wordBreak: 'break-all', flex: 1 }}>{attachment.name}</span>
                        <span style={{
                          fontSize: '12px', 
                          color: '#999', 
                          marginLeft: '12px',
                          minWidth: '80px',
                          textAlign: 'right'
                        }}>
                          {(attachment.size / 1024 / 1024).toFixed(2)}MB
                        </span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 样式定义 */}
      <style>{`
        .employee-document-system {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .system-title {
          font-size: 24px;
          color: #333;
          margin-bottom: 20px;
          text-align: left;
        }
        
        .system-header {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin-bottom: 20px;
          padding: 0 10px;
        }
        
        .search-bar {
          flex: 1;
          max-width: 500px;
        }
        
        .btn-add {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-left: 10px;
        }
        
        .btn-add:hover {
          background-color: #45a049;
        }
        
        .table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .pagination-container {
          display: flex;
          justify-content: flex-end;
          padding: 10px;
        }
        
        /* 表单样式 */
        .certificate-form {
          max-height: 600px;
          overflow-y: auto;
          padding: 20px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .form-group {
          margin-bottom: 0;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
          font-size: 14px;
          white-space: nowrap;
        }
        
        .form-input,
        .form-select,
        .certificate-type-select,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
          height: 48px;
          box-sizing: border-box;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          transition: border-color 0.3s ease;
        }

        /* 确保select元素的样式与input一致 */
        select.form-select.certificate-type-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"%23666\"%3E%3Cpath stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M19 9l-7 7-7-7\"%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 20px;
          padding-right: 40px;
        }
        
        .form-input:focus,
        .form-select:focus,
        .certificate-type-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #2196f3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
        }
        
        .form-textarea {
          resize: vertical;
        }
        
        .employee-selection {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        .employee-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .btn-select-employee {
          background-color: #2196f3;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .btn-select-employee:hover {
          background-color: #1976d2;
        }
        
        /* 文件上传样式 */
        .file-upload-container {
          position: relative;
          display: inline-block;
        }
        
        .file-input {
          display: none;
        }
        
        .file-label {
          display: inline-block;
          background-color: #f5f5f5;
          color: #333;
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .file-label:hover {
          background-color: #e9e9e9;
        }
        
        .attachments-list {
          margin-top: 10px;
          padding: 10px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        
        .attachment-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 0;
        }
        
        .btn-remove-attachment {
          background-color: #f44336;
          color: white;
          border: none;
          padding: 4px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .btn-remove-attachment:hover {
          background-color: #d32f2f;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        
        .btn-save,
        .btn-cancel {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .btn-save {
          background-color: #4caf50;
          color: white;
        }
        
        .btn-save:hover {
          background-color: #45a049;
        }
        
        .btn-cancel {
          background-color: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
        }
        
        .btn-cancel:hover {
          background-color: #e9e9e9;
        }
        
        /* 员工选择模态框 */
        .employee-select-modal {
          max-height: 600px;
          display: flex;
          flex-direction: column;
        }
        
        .employee-search-bar {
          margin-bottom: 15px;
        }
        
        .employee-list {
          flex: 1;
          overflow: hidden;
        }
        
        .btn-select {
          background-color: #2196f3;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .btn-select:hover {
          background-color: #1976d2;
        }
        
        /* 证书详情模态框 */
        .certificate-detail {
          max-height: 600px;
          overflow-y: auto;
        }
        
        .detail-row {
          display: flex;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .detail-label {
          flex: 0 0 120px;
          font-weight: 500;
          color: #555;
        }
        
        .detail-value {
          flex: 1;
          color: #333;
        }
        
        .status-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .status-valid {
          color: #4caf50;
          background-color: #e8f5e9;
        }
        
        .status-expired {
          color: #f44336;
          background-color: #ffebee;
        }
        
        .status-upcoming {
          color: #ff9800;
          background-color: #fff3e0;
        }
        
        .status-unknown {
          color: #9e9e9e;
          background-color: #f5f5f5;
        }
        
        .expiry-date-edit {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        .expiry-date-input {
          padding: 6px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .btn-save-date,
        .btn-cancel-date,
        .btn-edit-date {
          padding: 4px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .btn-save-date {
          background-color: #4caf50;
          color: white;
        }
        
        .btn-cancel-date {
          background-color: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
        }
        
        .btn-edit-date {
          background-color: #2196f3;
          color: white;
          margin-left: 10px;
        }
        
        .attachment-link {
          color: #2196f3;
          text-decoration: none;
        }
        
        .attachment-link:hover {
          text-decoration: underline;
        }
        
        /* 操作按钮 */
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        
        .btn-view,
        .btn-delete {
          padding: 4px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .btn-view {
          background-color: #2196f3;
          color: white;
        }
        
        .btn-view:hover {
          background-color: #1976d2;
        }
        
        .btn-delete {
          background-color: #f44336;
          color: white;
        }
        
        .btn-delete:hover {
          background-color: #d32f2f;
        }
        
        /* 保存按钮样式 */
        .btn-save {
          padding: 8px 20px;
          font-size: 14px;
          background-color: #1976d2;
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .btn-save:hover {
          background-color: #1557b0;
          box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
        }
        
        .btn-save:active {
          transform: scale(0.98);
        }
        
        /* 删除附件按钮样式 */
        .btn-remove-attachment {
          padding: 6px 12px;
          font-size: 13px;
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          color: #d9534f;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .btn-remove-attachment:hover {
          background-color: #f8f9fa;
          border-color: #d9534f;
        }
        
        /* 无背景模态框样式 */
        .no-background-modal .modal-mask {
          background: transparent !important;
          backdrop-filter: none !important;
          background-image: none !important;
        }
      `}</style>
    </div>
  );
};

export default EmployeeDocumentSystem;