import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import MainPage from '../pages/MainPage';
import HRMainPage from '../pages/hr/HRMainPage';
import CurrentEmployeeSystem from '../pages/hr/CurrentEmployeeSystem';
import FormerEmployeeSystem from '../pages/hr/FormerEmployeeSystem';
import EmployeeDocumentSystem from '../pages/hr/EmployeeDocumentSystem';
import ContractEmployeeSystem from '../pages/hr/ContractEmployeeSystem';
import FormerContractEmployeeSystem from '../pages/hr/FormerContractEmployeeSystem';
import DataTableTest from '../components/DataTableTest';

// 创建路由配置
const router = createBrowserRouter([
  { 
    path: '/', 
    element: <LoginPage />
  },
  { 
    path: '/main', 
    element: <MainPage />
  },
  { 
    path: '/data-table-test', 
    element: <DataTableTest />
  },
  {
    path: '/hr',
    element: <HRMainPage />,
    children: [
      {
        path: 'current-employees',
        element: <CurrentEmployeeSystem />
      },
      {
        path: 'former-employees',
        element: <FormerEmployeeSystem />
      },
      {
        path: 'employee-documents',
        element: <EmployeeDocumentSystem />
      },
      {
        path: 'contract-employees',
        element: <ContractEmployeeSystem />
      },
      {
        path: 'former-contract-employees',
        element: <FormerContractEmployeeSystem />
      }
    ]
  }
]);

export default router;