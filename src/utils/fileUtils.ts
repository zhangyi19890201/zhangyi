import * as XLSX from 'xlsx';

/**
 * 将数据导出为Excel文件
 * @param data 要导出的数据
 * @param filename 文件名
 * @param headers 列标题映射
 */
export const exportToExcel = <T extends Record<string, any>>(data: T[], filename: string, headers?: Record<string, string>) => {
  try {
    // 处理标题映射
    const processedData = headers 
      ? data.map(item => {
          const processedItem: Record<string, any> = {};
          Object.entries(item).forEach(([key, value]) => {
            const headerKey = headers[key] || key;
            processedItem[headerKey] = value;
          });
          return processedItem;
        })
      : [...data];

    const worksheet = XLSX.utils.json_to_sheet(processedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // 生成并下载文件
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('导出Excel失败:', error);
    return false;
  }
};

/**
 * 从Excel文件导入数据
 * @param file Excel文件对象
 * @returns Promise<Record<string, any>[]>
 */
export const importFromExcel = async (file: File): Promise<Record<string, any>[]> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('文件读取失败'));
            return;
          }
          
          const workbook = XLSX.read(data, { type: 'binary' });
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData as Record<string, any>[]);
        } catch (error) {
          reject(new Error('解析Excel文件失败'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取错误'));
      };
      
      reader.readAsBinaryString(file);
    } catch (error) {
      reject(new Error('导入Excel失败'));
    }
  });
};

/**
 * 验证文件类型是否为Excel
 * @param file 文件对象
 * @returns 是否为Excel文件
 */
export const isExcelFile = (file: File): boolean => {
  const validExtensions = ['.xlsx', '.xls'];
  const fileName = file.name.toLowerCase();
  return validExtensions.some(ext => fileName.endsWith(ext));
};

/**
 * 从localStorage获取数据
 * @param key 存储键名
 * @param defaultValue 默认值
 * @returns 存储的数据或默认值
 */
export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('从localStorage读取失败:', error);
    return defaultValue;
  }
};

/**
 * 保存数据到localStorage
 * @param key 存储键名
 * @param data 要存储的数据
 */
export const saveToLocalStorage = <T>(key: string, data: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('保存到localStorage失败:', error);
    return false;
  }
};