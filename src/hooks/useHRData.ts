import { useState, useEffect } from 'react';

// 定义基础ID接口，用于通用数据管理
interface BaseId {
  id: string;
  [key: string]: any;
}

// 定义通用的员工数据接口
interface BaseEmployee extends BaseId {
  employeeId: string;
  name: string;
  idNumber: string;
  gender: 'male' | 'female';
  age: number;
}

// 定义Hook的参数接口
interface UseHRDataProps<T extends BaseId> {
  localStorageKey: string;
  initialData?: T[];
  pageSize?: number;
}

// 定义Hook的返回类型
interface UseHRDataReturn<T extends BaseId> {
  data: T[];
  filteredData: T[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  searchKeyword: string;
  
  // 数据操作方法
  loadData: () => Promise<void>;
  saveData: (data: T[]) => void;
  addItem: (item: Omit<T, 'id'>) => void;
  updateItem: (id: string, updates: Partial<T>) => void;
  deleteItem: (id: string) => void;
  
  // 搜索和分页
  handleSearch: (keyword: string) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  
  // 获取当前页数据
  getCurrentPageData: () => T[];
}

/**
 * 通用的HR数据管理Hook
 * @param localStorageKey localStorage的键名
 * @param initialData 初始数据
 * @param pageSize 每页显示的记录数
 * @returns 数据管理相关的状态和方法
 */
const useHRData = <T extends BaseId>({
  localStorageKey,
  initialData = [],
  pageSize = 20
}: UseHRDataProps<T>): UseHRDataReturn<T> => {
  const [data, setData] = useState<T[]>([]);
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(pageSize);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 计算总页数
  const totalPages = Math.max(1, Math.ceil(filteredData.length / localPageSize));

  // 从localStorage加载数据
  const loadData = async (): Promise<void> => {
    setLoading(true);
    try {
      const storedData = localStorage.getItem(localStorageKey);
      
      if (storedData) {
        const parsedData = JSON.parse(storedData) as T[];
        setData(parsedData);
        setFilteredData(parsedData);
      } else if (initialData.length > 0) {
        // 如果没有存储数据但提供了初始数据，则使用初始数据
        setData(initialData);
        setFilteredData(initialData);
        saveData(initialData);
      }
    } catch (error) {
      console.error(`加载${localStorageKey}数据失败:`, error);
    } finally {
      setLoading(false);
    }
  };

  // 保存数据到localStorage
  const saveData = (newData: T[]): void => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(newData));
      setData(newData);
      // 如果正在搜索，则同时更新筛选后的数据
      if (searchKeyword) {
        handleSearch(searchKeyword);
      } else {
        setFilteredData(newData);
      }
    } catch (error) {
      console.error(`保存${localStorageKey}数据失败:`, error);
      throw error;
    }
  };

  // 添加新条目
  const addItem = (item: Omit<T, 'id'>): void => {
    const newItem = {
      ...item,
      id: Date.now().toString()
    } as T;
    
    const updatedData = [...data, newItem];
    saveData(updatedData);
    
    // 添加后跳转到最后一页
    if (searchKeyword) {
      // 如果正在搜索，检查新条目是否匹配搜索条件
      const isMatch = 
        item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.employeeId.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.idNumber.includes(searchKeyword);
      
      if (isMatch) {
        setFilteredData([...filteredData, newItem]);
        setCurrentPage(Math.ceil(filteredData.length / localPageSize) + 1);
      }
    } else {
      setCurrentPage(totalPages + 1);
    }
  };

  // 更新条目
  const updateItem = (id: string, updates: Partial<T>): void => {
    const updatedData = data.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    saveData(updatedData);
  };

  // 删除条目
  const deleteItem = (id: string): void => {
    const updatedData = data.filter(item => item.id !== id);
    saveData(updatedData);
  };

  // 搜索功能
  const handleSearch = (keyword: string): void => {
    const trimmedKeyword = keyword.trim().toLowerCase();
    setSearchKeyword(trimmedKeyword);
    setCurrentPage(1);
    
    if (!trimmedKeyword) {
      setFilteredData(data);
      return;
    }
    
    const filtered = data.filter(item => 
      item.name.toLowerCase().includes(trimmedKeyword) ||
      item.employeeId.toLowerCase().includes(trimmedKeyword) ||
      item.idNumber.includes(trimmedKeyword) ||
      // 搜索其他可能的常用字段
      (item.department && item.department.toLowerCase().includes(trimmedKeyword)) ||
      (item.position && item.position.toLowerCase().includes(trimmedKeyword))
    );
    
    setFilteredData(filtered);
  };

  // 获取当前页数据
  const getCurrentPageData = (): T[] => {
    const startIndex = (currentPage - 1) * localPageSize;
    const endIndex = startIndex + localPageSize;
    return filteredData.slice(startIndex, endIndex);
  };

  // 初始化加载数据
  useEffect(() => {
    loadData();
  }, [localStorageKey]);

  // 当pageSize改变时，重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [localPageSize]);

  return {
    data,
    filteredData,
    currentPage,
    pageSize: localPageSize,
    totalPages,
    loading,
    searchKeyword,
    
    loadData,
    saveData,
    addItem,
    updateItem,
    deleteItem,
    
    handleSearch,
    setCurrentPage,
    setPageSize: setLocalPageSize,
    setLoading,
    
    getCurrentPageData
  };
};

export default useHRData;