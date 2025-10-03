import React, { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieLabelRenderProps } from 'recharts';
import { EmployeeCertificate, CertificateTypeId, CertificateStatus } from './EmployeeDocumentSystem';
import Pagination from '../../components/Pagination';
import SearchBar from '../../components/SearchBar';

// 证书类型定义
const certificateTypes = [
  { id: 'skill', name: '技能证书' },
  { id: 'professional', name: '职称证书' },
  { id: 'technical', name: '技术资格证书' },
  { id: 'language', name: '语言证书' },
  { id: 'management', name: '管理资格证书' }
];

// 颜色配置
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];
const STATUS_COLORS = {
  valid: '#4caf50',
  upcoming_expiry: '#ff9800',
  expired: '#f44336'
};

const CertificateReport: React.FC = () => {
  // 状态定义
  const [certificates, setCertificates] = useState<EmployeeCertificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCertificates, setFilteredCertificates] = useState<EmployeeCertificate[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  // 删除未使用的变量
  // const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'overview' | 'department' | 'expiry'>('overview');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);

  // 初始化数据
  useEffect(() => {
    fetchData();
  }, []);

  // 搜索和分页效果
  useEffect(() => {
    filterCertificates();
  }, [certificates, searchTerm, currentPage, pageSize, selectedDepartment]);

  // 模拟获取数据
  const fetchData = async () => {
    setLoading(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 从localStorage读取证书数据或使用模拟数据
      const storedCertificates = localStorage.getItem('employeeCertificates');
      
      if (storedCertificates) {
        const parsedCertificates = JSON.parse(storedCertificates);
        setCertificates(parsedCertificates);
      } else {
        // 使用模拟数据
        const mockCertificates: EmployeeCertificate[] = [
          { id: '1', employeeId: 'EMP001', employeeName: '张三', certificateType: 'skill', certificateName: '高级前端开发工程师认证', certificateNumber: 'FE20220001', issueDate: '2022-06-15', expiryDate: '2027-06-14', issueAuthority: '中国软件协会', status: 'valid' },
          { id: '2', employeeId: 'EMP002', employeeName: '李四', certificateType: 'professional', certificateName: '中级会计师', certificateNumber: 'ACC20210002', issueDate: '2021-03-20', expiryDate: '2026-03-19', issueAuthority: '财政部的会计资格评价中心', status: 'valid' },
          { id: '3', employeeId: 'EMP003', employeeName: '王五', certificateType: 'technical', certificateName: 'PMP认证', certificateNumber: 'PMP20230003', issueDate: '2023-01-10', expiryDate: '2026-01-09', issueAuthority: '项目管理协会', status: 'valid' },
          { id: '4', employeeId: 'EMP004', employeeName: '赵六', certificateType: 'language', certificateName: '英语专业八级', certificateNumber: 'ENG20200004', issueDate: '2020-05-20', expiryDate: '2025-05-19', issueAuthority: '教育部', status: 'valid' },
          { id: '5', employeeId: 'EMP005', employeeName: '钱七', certificateType: 'management', certificateName: '高级人力资源管理师', certificateNumber: 'HRM20210005', issueDate: '2021-09-05', expiryDate: '2026-09-04', issueAuthority: '人力资源和社会保障部', status: 'valid' },
          { id: '6', employeeId: 'EMP006', employeeName: '孙八', certificateType: 'skill', certificateName: 'AWS认证解决方案架构师', certificateNumber: 'AWS20220006', issueDate: '2022-08-15', expiryDate: '2025-08-14', issueAuthority: 'Amazon Web Services', status: 'valid' },
          { id: '7', employeeId: 'EMP007', employeeName: '周九', certificateType: 'professional', certificateName: '高级经济师', certificateNumber: 'ECO20200007', issueDate: '2020-11-30', expiryDate: '2025-11-29', issueAuthority: '人力资源和社会保障部', status: 'valid' },
          { id: '8', employeeId: 'EMP008', employeeName: '吴十', certificateType: 'technical', certificateName: 'Cisco认证网络专家', certificateNumber: 'CCIE20230008', issueDate: '2023-03-20', expiryDate: '2026-03-19', issueAuthority: 'Cisco', status: 'valid' },
          { id: '9', employeeId: 'EMP009', employeeName: '郑十一', certificateType: 'language', certificateName: '日语N1', certificateNumber: 'JPN20210009', issueDate: '2021-07-05', expiryDate: '2026-07-04', issueAuthority: '日本语能力测试中心', status: 'valid' },
          { id: '10', employeeId: 'EMP010', employeeName: '王十二', certificateType: 'management', certificateName: '敏捷项目管理师', certificateNumber: 'APM20220010', issueDate: '2022-04-10', expiryDate: '2025-04-09', issueAuthority: '敏捷联盟', status: 'valid' },
          { id: '11', employeeId: 'EMP011', employeeName: '陈十三', certificateType: 'skill', certificateName: 'Python高级开发工程师', certificateNumber: 'PYT20230011', issueDate: '2023-02-15', expiryDate: '2028-02-14', issueAuthority: 'Python软件基金会', status: 'valid' },
          { id: '12', employeeId: 'EMP012', employeeName: '李十四', certificateType: 'professional', certificateName: '初级审计师', certificateNumber: 'AUD20220012', issueDate: '2022-09-25', expiryDate: '2027-09-24', issueAuthority: '审计署', status: 'valid' },
          { id: '13', employeeId: 'EMP013', employeeName: '张十五', certificateType: 'technical', certificateName: '信息系统项目管理师', certificateNumber: 'ISP20210013', issueDate: '2021-10-15', expiryDate: '2026-10-14', issueAuthority: '工业和信息化部', status: 'valid' },
          { id: '14', employeeId: 'EMP014', employeeName: '赵十六', certificateType: 'language', certificateName: '法语DELF B2', certificateNumber: 'FRA20230014', issueDate: '2023-01-20', expiryDate: '2028-01-19', issueAuthority: '法国教育部', status: 'valid' },
          { id: '15', employeeId: 'EMP015', employeeName: '钱十七', certificateType: 'management', certificateName: '企业培训师', certificateNumber: 'TRN20220015', issueDate: '2022-06-10', expiryDate: '2027-06-09', issueAuthority: '人力资源和社会保障部', status: 'valid' },
          // 添加即将过期和已过期的证书
          { id: '16', employeeId: 'EMP016', employeeName: '孙十八', certificateType: 'skill', certificateName: 'Java开发工程师', certificateNumber: 'JAVA20200016', issueDate: '2020-01-15', expiryDate: '2024-01-14', issueAuthority: 'Oracle', status: 'upcoming_expiry' },
          { id: '17', employeeId: 'EMP017', employeeName: '周十九', certificateType: 'professional', certificateName: '助理工程师', certificateNumber: 'ENG20190017', issueDate: '2019-05-20', expiryDate: '2023-05-19', issueAuthority: '人力资源和社会保障部', status: 'expired' },
          { id: '18', employeeId: 'EMP018', employeeName: '吴二十', certificateType: 'technical', certificateName: '网络工程师', certificateNumber: 'NET20180018', issueDate: '2018-08-10', expiryDate: '2022-08-09', issueAuthority: '工业和信息化部', status: 'expired' },
        ];
        setCertificates(mockCertificates);
      }
      
      // 模拟部门数据
      const mockDepartments = [
        { id: 'all', name: '全部部门' },
        { id: 'rd', name: '研发部' },
        { id: 'finance', name: '财务部' },
        { id: 'hr', name: '人力资源部' },
        { id: 'marketing', name: '市场部' },
        { id: 'operations', name: '运营部' }
      ];
      setDepartments(mockDepartments);
    } catch (error) {
      console.error('获取证书数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 筛选证书
  const filterCertificates = () => {
    let filtered = [...certificates];
    
    // 按搜索词筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cert => 
        cert.employeeName.toLowerCase().includes(term) ||
        cert.employeeId.toLowerCase().includes(term) ||
        cert.certificateName.toLowerCase().includes(term) ||
        cert.certificateNumber.toLowerCase().includes(term)
      );
    }
    
    // 按部门筛选（这里是模拟的，实际项目中需要根据真实的部门信息进行筛选）
    if (selectedDepartment !== 'all') {
      // 这里简单模拟，实际应该有employee的department信息
      const deptEmployees = {
        rd: ['EMP001', 'EMP004', 'EMP006', 'EMP011'],
        finance: ['EMP002', 'EMP007', 'EMP012'],
        hr: ['EMP005', 'EMP015'],
        marketing: ['EMP003', 'EMP010'],
        operations: ['EMP008', 'EMP009', 'EMP013', 'EMP014']
      };
      
      filtered = filtered.filter(cert => 
        deptEmployees[selectedDepartment as keyof typeof deptEmployees]?.includes(cert.employeeId)
      );
    }
    
    // 删除已注释掉的代码
    // 计算总页数
    // setTotalPages(Math.ceil(filtered.length / pageSize));
    
    // 分页
    const paginated = filtered.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
    
    setFilteredCertificates(paginated);
  };

  // 生成证书类型统计数据
  const getTypeStats = () => {
    const typeCount: Record<string, number> = {};
    
    certificates.forEach(cert => {
      typeCount[cert.certificateType] = (typeCount[cert.certificateType] || 0) + 1;
    });
    
    return certificateTypes.map(type => ({
      name: type.name,
      value: typeCount[type.id] || 0
    })).filter(item => item.value > 0);
  };

  // 生成证书状态统计数据
  const getStatusStats = () => {
    const statusCount: Record<CertificateStatus, number> = {
      valid: 0,
      expired: 0,
      upcoming_expiry: 0
    };
    
    certificates.forEach(cert => {
      statusCount[cert.status]++;
    });
    
    return Object.entries(statusCount).map(([key, value]) => ({
      name: key === 'valid' ? '有效' : key === 'expired' ? '已过期' : '即将过期',
      value,
      status: key as CertificateStatus
    }));
  };

  // 生成部门统计数据
  const getDepartmentStats = () => {
    // 模拟部门数据
    const deptEmployees: Record<string, string[]> = {
      '研发部': ['EMP001', 'EMP004', 'EMP006', 'EMP011'],
      '财务部': ['EMP002', 'EMP007', 'EMP012'],
      '人力资源部': ['EMP005', 'EMP015'],
      '市场部': ['EMP003', 'EMP010'],
      '运营部': ['EMP008', 'EMP009', 'EMP013', 'EMP014']
    };
    
    const deptStats: Array<{ name: string; count: number; valid: number; expired: number; upcoming_expiry: number }> = [];
    
    Object.entries(deptEmployees).forEach(([deptName, employeeIds]) => {
      const deptCerts = certificates.filter(cert => employeeIds.includes(cert.employeeId));
      
      const statusCount = {
        valid: 0,
        expired: 0,
        upcoming_expiry: 0
      };
      
      deptCerts.forEach(cert => {
        statusCount[cert.status]++;
      });
      
      deptStats.push({
        name: deptName,
        count: deptCerts.length,
        valid: statusCount.valid,
        expired: statusCount.expired,
        upcoming_expiry: statusCount.upcoming_expiry
      });
    });
    
    return deptStats;
  };

  // 生成过期预警数据
  const getExpiryAlertData = () => {
    const today = new Date();
    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);
    
    const alertCerts = certificates.filter(cert => {
      if (cert.status !== 'upcoming_expiry') return false;
      const expiryDate = new Date(cert.expiryDate);
      return expiryDate <= next30Days;
    });
    
    return alertCerts.map(cert => ({
      ...cert,
      daysLeft: Math.ceil((new Date(cert.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    })).sort((a, b) => a.daysLeft - b.daysLeft);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // 获取证书类型名称
  const getCertificateTypeName = (typeId: CertificateTypeId) => {
    const type = certificateTypes.find(t => t.id === typeId);
    return type ? type.name : typeId;
  };

  // 获取证书状态名称
  const getStatusName = (status: CertificateStatus) => {
    switch (status) {
      case 'valid': return '有效';
      case 'expired': return '已过期';
      case 'upcoming_expiry': return '即将过期';
      default: return '未知';
    }
  };

  // 渲染概览报告
  const renderOverviewReport = () => {
    const typeStats = getTypeStats();
    const statusStats = getStatusStats();
    
    return (
      <div className="report-overview">
        <div className="report-section">
          <h3>证书类型分布</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeStats}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(props: PieLabelRenderProps) => `${props.name}: ${((Number(props.percent) || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="report-section">
          <h3>证书状态分布</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={statusStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="数量">
                  {statusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="report-section">
          <h3>即将过期证书预警（30天内）</h3>
          <div className="alert-list">
            {getExpiryAlertData().length > 0 ? (
              <table className="alert-table">
                <thead>
                  <tr>
                    <th>员工姓名</th>
                    <th>工号</th>
                    <th>证书名称</th>
                    <th>失效日期</th>
                    <th>剩余天数</th>
                  </tr>
                </thead>
                <tbody>
                  {getExpiryAlertData().map(cert => (
                    <tr key={cert.id} className="alert-row">
                      <td>{cert.employeeName}</td>
                      <td>{cert.employeeId}</td>
                      <td>{cert.certificateName}</td>
                      <td>{formatDate(cert.expiryDate)}</td>
                      <td className={cert.daysLeft <= 15 ? 'urgent' : 'warning'}>{cert.daysLeft}天</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-alerts">暂无即将过期的证书</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染部门报告
  const renderDepartmentReport = () => {
    const deptStats = getDepartmentStats();
    
    return (
      <div className="report-department">
        <div className="report-section">
          <h3>部门证书数量统计</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={deptStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="valid" name="有效" stackId="a" fill={STATUS_COLORS.valid} />
                <Bar dataKey="upcoming_expiry" name="即将过期" stackId="a" fill={STATUS_COLORS.upcoming_expiry} />
                <Bar dataKey="expired" name="已过期" stackId="a" fill={STATUS_COLORS.expired} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // 渲染过期统计报告
  const renderExpiryReport = () => {
    const expiryAlertData = getExpiryAlertData();
    
    return (
      <div className="report-expiry">
        <div className="report-section">
          <h3>证书过期预警详情</h3>
          {expiryAlertData.length > 0 ? (
            <table className="expiry-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>员工姓名</th>
                  <th>工号</th>
                  <th>证书名称</th>
                  <th>证书类型</th>
                  <th>发证日期</th>
                  <th>失效日期</th>
                  <th>剩余天数</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {expiryAlertData.map((cert, index) => (
                  <tr key={cert.id}>
                    <td>{index + 1}</td>
                    <td>{cert.employeeName}</td>
                    <td>{cert.employeeId}</td>
                    <td>{cert.certificateName}</td>
                    <td>{getCertificateTypeName(cert.certificateType)}</td>
                    <td>{formatDate(cert.issueDate)}</td>
                    <td>{formatDate(cert.expiryDate)}</td>
                    <td className={cert.daysLeft <= 15 ? 'urgent' : 'warning'}>{cert.daysLeft}天</td>
                    <td>
                      <span className={`status-badge ${cert.status}`}>
                        {getStatusName(cert.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-expiry-data">暂无即将过期的证书数据</div>
          )}
        </div>
      </div>
    );
  };

  // 渲染证书列表
  const renderCertificateList = () => {
    if (loading) {
      return <div className="loading">加载中...</div>;
    }

    return (
      <div className="certificate-list-section">
        <h3>证书明细</h3>
        <div className="table-container">
          <table className="certificate-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>员工姓名</th>
                <th>工号</th>
                <th>证书名称</th>
                <th>证书类型</th>
                <th>发证日期</th>
                <th>失效日期</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.length > 0 ? (
                filteredCertificates.map((cert, index) => (
                  <tr key={cert.id}>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td>{cert.employeeName}</td>
                    <td>{cert.employeeId}</td>
                    <td>{cert.certificateName}</td>
                    <td>{getCertificateTypeName(cert.certificateType)}</td>
                    <td>{formatDate(cert.issueDate)}</td>
                    <td>{formatDate(cert.expiryDate)}</td>
                    <td>
                      <span className={`status-badge ${cert.status}`}>
                        {getStatusName(cert.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="no-data">暂无证书数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredCertificates.length > 0 && (
          <div className="pagination">
            <Pagination
              current={currentPage}
              total={certificates.length}
              pageSize={pageSize}
              onChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              showSizeChanger={true}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="certificate-report">
      <h1 className="report-title">员工证书统计报告</h1>
      
      <div className="report-controls">
        <SearchBar
          placeholder="搜索员工姓名、工号、证书名称或编号"
          onSearch={setSearchTerm}
          className="search-bar"
        />
        
        <div className="filter-controls">
          <select 
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="department-filter"
          >
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="report-tabs">
        <button 
          className={`tab-button ${reportType === 'overview' ? 'active' : ''}`}
          onClick={() => setReportType('overview')}
        >
          概览统计
        </button>
        <button 
          className={`tab-button ${reportType === 'department' ? 'active' : ''}`}
          onClick={() => setReportType('department')}
        >
          部门统计
        </button>
        <button 
          className={`tab-button ${reportType === 'expiry' ? 'active' : ''}`}
          onClick={() => setReportType('expiry')}
        >
          过期预警
        </button>
      </div>
      
      <div className="report-content">
        {reportType === 'overview' && renderOverviewReport()}
        {reportType === 'department' && renderDepartmentReport()}
        {reportType === 'expiry' && renderExpiryReport()}
      </div>
      
      {renderCertificateList()}
      
      <style>{`
        .certificate-report {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .report-title {
          font-size: 24px;
          color: #333;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .report-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 0 10px;
        }
        
        .search-bar {
          flex: 1;
          max-width: 500px;
        }
        
        .filter-controls {
          display: flex;
          gap: 10px;
        }
        
        .department-filter {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .report-tabs {
          display: flex;
          margin-bottom: 20px;
          border-bottom: 1px solid #e8e8e8;
        }
        
        .tab-button {
          padding: 10px 20px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 16px;
          color: #666;
          position: relative;
          margin-right: 20px;
        }
        
        .tab-button.active {
          color: #1890ff;
          font-weight: 500;
        }
        
        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #1890ff;
        }
        
        .report-content {
          margin-bottom: 30px;
        }
        
        .report-section {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .report-section h3 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 18px;
          color: #333;
        }
        
        .chart-container {
          height: 300px;
          margin-bottom: 20px;
        }
        
        .alert-list {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .alert-table,
        .expiry-table,
        .certificate-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .alert-table th,
        .alert-table td,
        .expiry-table th,
        .expiry-table td,
        .certificate-table th,
        .certificate-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e8e8e8;
        }
        
        .alert-table th,
        .expiry-table th,
        .certificate-table th {
          background-color: #fafafa;
          font-weight: 500;
          color: #333;
        }
        
        .alert-row:hover,
        .expiry-table tr:hover,
        .certificate-table tr:hover {
          background-color: #f5f5f5;
        }
        
        .urgent {
          color: #f44336;
          font-weight: 500;
        }
        
        .warning {
          color: #ff9800;
          font-weight: 500;
        }
        
        .no-alerts,
        .no-expiry-data,
        .no-data {
          text-align: center;
          padding: 40px;
          color: #999;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .status-badge.valid {
          color: #4caf50;
          background-color: #e8f5e9;
        }
        
        .status-badge.expired {
          color: #f44336;
          background-color: #ffebee;
        }
        
        .status-badge.upcoming_expiry {
          color: #ff9800;
          background-color: #fff3e0;
        }
        
        .pagination {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #999;
        }
        
        .report-overview,
        .report-department,
        .report-expiry {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        /* 响应式布局 */
        @media (max-width: 768px) {
          .report-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          
          .search-bar {
            max-width: 100%;
          }
          
          .report-tabs {
            overflow-x: auto;
          }
          
          .tab-button {
            flex-shrink: 0;
          }
          
          .chart-container {
            height: 250px;
          }
          
          .alert-table,
          .expiry-table,
          .certificate-table {
            font-size: 14px;
          }
          
          .alert-table th,
          .alert-table td,
          .expiry-table th,
          .expiry-table td,
          .certificate-table th,
          .certificate-table td {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateReport;