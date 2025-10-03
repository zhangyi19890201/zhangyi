import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

// 定义导航项类型
interface NavItem {
  id: string;
  title: string;
  route: string;
}

const HRMainPage: React.FC = () => {
  const navigate = useNavigate();

  // 导航项列表
  const navItems: NavItem[] = [
    {
      id: 'currentEmployee',
      title: '在职员工信息系统',
      route: '/hr/current-employees'
    },
    {
      id: 'formerEmployee',
      title: '非在职员工信息系统',
      route: '/hr/former-employees'
    },
    {
      id: 'employeeDocument',
      title: '员工证书信息管理系统',
      route: '/hr/employee-documents'
    },
    {
      id: 'contractEmployee',
      title: '劳务派遣信息系统',
      route: '/hr/contract-employees'
    },
    {
      id: 'formerContractEmployee',
      title: '非在职劳务派遣信息系统',
      route: '/hr/former-contract-employees'
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>人力资源管理系统</h1>
      </div>
      
      <div style={styles.content}>        
        {/* 左侧导航栏 */}
        <div style={styles.sidebar}>
          {navItems.map(item => (
            <div
              key={item.id}
              style={{
                ...styles.navItem,
                ...(window.location.pathname === item.route && styles.navItemActive)
              }}
              onClick={() => navigate(item.route)}
            >
              {item.title}
            </div>
          ))}
          
          {/* 返回主页按钮 */}
          <div 
            style={styles.backButton} 
            onClick={() => navigate('/main')}
          >
            返回主页
          </div>
        </div>
        
        {/* 右侧内容区域 - 使用Outlet渲染子路由 */}
        <div style={styles.mainContent}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

// 样式定义
const styles = {
  container: {
    width: '100%',
    height: '100vh',
    backgroundColor: '#f0f2f5',
    display: 'flex' as const,
    flexDirection: 'column' as const
  },
  header: {
    backgroundColor: '#1890ff',
    color: 'white',
    padding: '16px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden'
  },
  sidebar: {
    width: '220px',
    backgroundColor: '#fff',
    borderRight: '1px solid #e8e8e8',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    overflowY: 'auto' as const
  },
  navItem: {
    padding: '16px 24px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
    transition: 'all 0.3s',
    color: '#333',
    fontSize: '14px'
  },
  navItemActive: {
    backgroundColor: '#e6f7ff',
    color: '#1890ff',
    fontWeight: 'bold',
    borderRight: '3px solid #1890ff'
  },
  mainContent: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto' as const
  },
  backButton: {
    marginTop: 'auto',
    padding: '16px 24px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    borderTop: '1px solid #e8e8e8',
    textAlign: 'center' as const,
    fontWeight: 'bold',
    color: '#666',
    transition: 'all 0.3s'
  }
};

export default HRMainPage;