import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthInfo } from '../services/authService';
import '../styles/MainPage.css';
import TaskButtonGroup from '../components/TaskButtonGroup';

// 导航菜单项配置
const navItems = [
  {
    key: 'tasks',
    icon: '📋',
    title: '任务管理',
    route: '/main'
  },
  {
    key: 'projects',
    icon: '🏗️',
    title: '项目管理',
    route: '/projects'
  },
  {
    key: 'hr',
    icon: '👥',
    title: '人力资源',
    route: '/hr'
  },
  {
    key: 'reports',
    icon: '📊',
    title: '报表统计',
    route: '/reports'
  },
  {
    key: 'settings',
    icon: '⚙️',
    title: '系统设置',
    route: '/settings'
  }
];

const MainPage = () => {
  const navigate = useNavigate();
  const [pendingTasks, setPendingTasks] = useState([]);
  const [initiatedTasks, setInitiatedTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showAllTasks, setShowAllTasks] = useState({ pending: false, initiated: false, completed: false });
  const [currentModule, setCurrentModule] = useState('tasks'); // tasks, projects, reports
  const [sidebarOpen, setSidebarOpen] = useState(true); // 控制侧边栏显示状态

  // 处理新建任务
  const handleCreateTask = () => {
    alert('创建新任务功能待实现');
  };

  // 初始化加载模拟数据
  useEffect(() => {
    // 模拟待审批任务数据
    const mockPendingTasks = [
      {
        id: '1',
        title: '项目预算审批',
        initiator: '张三',
        department: '财务部',
        time: '2025-09-27 10:30',
        priority: 'high'
      },
      {
        id: '2',
        title: '新人员入职申请',
        initiator: '李四',
        department: '管理部门',
        time: '2025-09-27 09:15',
        priority: 'medium'
      },
      {
        id: '3',
        title: '设备采购合同',
        initiator: '王五',
        department: '采购部',
        time: '2025-09-26 16:45',
        priority: 'medium'
      },
      {
        id: '4',
        title: '技术方案评审',
        initiator: '赵六',
        department: '研发部',
        time: '2025-09-26 14:20',
        priority: 'low'
      },
      {
        id: '5',
        title: '市场推广计划',
        initiator: '钱七',
        department: '市场部',
        time: '2025-09-26 11:05',
        priority: 'medium'
      }
    ];

    // 模拟发起任务数据
    const mockInitiatedTasks = [
      {
        id: '101',
        title: '季度工作总结',
        status: '审批中',
        time: '2025-09-25 15:30',
        approver: '部门经理'
      },
      {
        id: '102',
        title: '项目进度报告',
        status: '已通过',
        time: '2025-09-24 10:15',
        approver: '项目经理'
      },
      {
        id: '103',
        title: '加班申请',
        status: '已退回',
        time: '2025-09-23 18:45',
        approver: '部门经理'
      }
    ];

    // 模拟已办任务数据
    const mockCompletedTasks = [
      {
        id: '201',
        title: '费用报销审核',
        initiator: '孙八',
        action: '通过',
        time: '2025-09-27 08:50'
      },
      {
        id: '202',
        title: '项目里程碑确认',
        initiator: '周九',
        action: '通过',
        time: '2025-09-26 15:20'
      },
      {
        id: '203',
        title: '供应商资质审核',
        initiator: '吴十',
        action: '不通过',
        time: '2025-09-25 11:30'
      }
    ];

    setPendingTasks(mockPendingTasks);
    setInitiatedTasks(mockInitiatedTasks);
    setCompletedTasks(mockCompletedTasks);
  }, []);

  // 处理退出登录
  const handleLogout = () => {
    clearAuthInfo();
    navigate('/');
  };

  // 处理查看所有任务
  const handleViewAll = (taskType) => {
    setShowAllTasks(prev => ({
      ...prev,
      [taskType]: !prev[taskType]
    }));
  };

  // 处理审批任务（目前未在组件中直接使用，保留实现以备将来使用）
  const _handleApproveTask = (taskId, action) => {
    // 这里只是模拟审批操作
    const comment = action === 'reject' ? '需要补充更多信息' : '同意该申请';
    alert(`${action === 'approve' ? '已通过' : '已驳回'}任务ID: ${taskId}\n意见: ${comment}`);
  };

  // 处理查看任务详情
  const handleViewTaskDetail = (task) => {
    alert(`查看任务详情:\n标题: ${task.title}\n发起者: ${task.initiator || '系统'}\n时间: ${task.time}`);
  };

  // 处理设置功能
  const handleSettings = () => {
    alert('设置功能待实现');
  };

  // 渲染单个任务列表
  const renderSingleTaskList = (tasks, listTitle, taskType) => {
    // 决定显示的任务数量
    const displayTasks = showAllTasks[taskType] ? tasks : tasks.slice(0, 5);

    return (
      <div className="task-section">
        <div className="section-header">
          <h3 className="section-subtitle">{listTitle}</h3>
          {tasks.length > 5 && (
            <button className="view-all-btn" onClick={() => handleViewAll(taskType)}>
              {showAllTasks[taskType] ? '收起' : '查看全部'} {tasks.length}项 &gt;
            </button>
          )}
        </div>
        
        <div className="task-list">
          {displayTasks.length === 0 ? (
            <div className="empty-state">暂无{listTitle}</div>
          ) : (
            displayTasks.map(task => (
              <div key={task.id} className="task-item">
                <div className="task-info">
                  <h4 className="task-title" onClick={() => handleViewTaskDetail(task)}>{task.title}</h4>
                  <div className="task-meta">
                    {taskType === 'pending' && (
                      <> 
                        <span className="task-initiator">任务发起人: {task.initiator || '系统'}</span>
                        <span className="task-time">{task.time}</span>
                        <span className="task-department">{task.department}</span>
                      </>
                    )}
                    {taskType === 'initiated' && (
                      <> 
                        <span className={`task-status ${task.status === '已通过' ? 'approved' : task.status === '已退回' ? 'rejected' : 'pending'}`}>{task.status}</span>
                        <span className="task-time">{task.time}</span>
                        <span className="task-approver">审批人: {task.approver}</span>
                      </>
                    )}
                    {taskType === 'completed' && (
                      <> 
                        <span className="task-initiator">任务发起人: {task.initiator}</span>
                        <span className={`task-action ${task.action === '通过' ? 'approved' : 'rejected'}`}>{task.action}</span>
                        <span className="task-time">{task.time}</span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* 任务摘要信息 */}
                <div className="task-summary">
                  <div className="summary-content">
                    {taskType === 'pending' && `摘要：${task.title} (${task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}优先级任务，由${task.initiator}发起)`}
                    {taskType === 'initiated' && `摘要：${task.title} (当前${task.status}，审批人：${task.approver})`}
                    {taskType === 'completed' && `摘要：${task.title} (处理结果：${task.action}，发起者：${task.initiator})`}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // 处理刷新任务
  const handleRefreshTasks = (taskType) => {
    // 这里只是模拟刷新操作
    alert(`刷新${taskType === 'pending' ? '待审批' : taskType === 'initiated' ? '已发起' : '已完成'}任务`);
  };

  // 处理查看更多
  const handleViewMore = (taskType) => {
    // 这里只是模拟查看更多操作
    alert(`查看更多${taskType === 'pending' ? '待审批' : taskType === 'initiated' ? '已发起' : '已完成'}任务`);
  };

  // 渲染所有任务列表
  const renderAllTaskLists = () => {
    return (
      <>
        {/* 已发起任务区域 */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h2 className="section-main-title">我的请求</h2>
              <button className="create-task-btn" onClick={handleCreateTask}>
                新建任务
              </button>
            </div>
            <TaskButtonGroup 
              taskType="initiated" 
              onRefresh={() => handleRefreshTasks('initiated')} 
              onViewMore={() => handleViewMore('initiated')} 
            />
          </div>
          {renderSingleTaskList(initiatedTasks, '发起任务', 'initiated')}
        </div>
        
        {/* 待审批任务区域 */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="section-main-title">待审批任务</h2>
            <TaskButtonGroup 
              taskType="pending" 
              onRefresh={() => handleRefreshTasks('pending')} 
              onViewMore={() => handleViewMore('pending')} 
            />
          </div>
          {renderSingleTaskList(pendingTasks, '待审批任务', 'pending')}
        </div>
        
        {/* 已完成任务区域 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="section-main-title">我的已办</h2>
            <TaskButtonGroup 
              taskType="completed" 
              onRefresh={() => handleRefreshTasks('completed')} 
              onViewMore={() => handleViewMore('completed')} 
            />
          </div>
          {renderSingleTaskList(completedTasks, '已办任务', 'completed')}
        </div>
      </>
    );
  };

  // 处理导航菜单项点击
  const handleNavClick = (navItem) => {
    setCurrentModule(navItem.key);
    navigate(navItem.route);
  };

  // 切换侧边栏显示状态
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="main-container">
      {/* 顶部导航栏 */}
      <header className="main-header">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={toggleSidebar} title={sidebarOpen ? '收起侧边栏' : '展开侧边栏'}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <h1 className="system-title">工程项目管理系统</h1>
        </div>
        <div className="header-right">
          <span className="user-info">欢迎，测试用户</span>
          <button className="settings-btn" onClick={handleSettings} title="设置">⚙️</button>
          <button className="logout-btn" onClick={handleLogout}>退出登录</button>
        </div>
      </header>

      <div className="page-layout">
        {/* 左侧导航栏 */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <nav className="main-nav">
            {navItems.map(item => (
              <button
                key={item.key}
                className={`nav-item ${currentModule === item.key ? 'active' : ''}`}
                onClick={() => handleNavClick(item)}
                title={item.title}
              >
                <span className="nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="nav-text">{item.title}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* 主体内容区域 */}
        <main className="main-content">
          {/* 任务内容区域 */}
          <div className="content-area">
            {renderAllTaskLists()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainPage;