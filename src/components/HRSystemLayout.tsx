import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HRSystem.css';

interface NavItem {
  key: string;
  label: string;
  path: string;
}

interface HRSystemLayoutProps {
  title: string;
  navItems: NavItem[];
  currentPath: string;
  children: React.ReactNode;
}

const HRSystemLayout: React.FC<HRSystemLayoutProps> = ({
  title,
  navItems,
  currentPath,
  children
}) => {
  // 判断当前路径是否匹配导航项路径
  const isActivePath = (path: string) => {
    return currentPath.includes(path);
  };

  return (
    <div className="hr-system-container">
      {/* 系统标题区域 */}
      <div className="hr-system-title">
        {title}
      </div>
      
      {/* 导航栏 */}
      <nav className="hr-system-nav">
        <ul className="hr-system-nav-list">
          {navItems.map(item => (
            <li key={item.key} className="hr-system-nav-item">
              <Link
                to={item.path}
                className={`hr-system-nav-link ${isActivePath(item.path) ? 'hr-system-nav-link-active' : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* 主要内容区域 */}
      <div className="hr-system-content">
        {children}
      </div>
    </div>
  );
};

export default HRSystemLayout;