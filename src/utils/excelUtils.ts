import * as XLSX from 'xlsx';

/**
 * 通用的Excel导入导出工具
 */
class ExcelUtils {
  /**
   * 将数据导出为Excel文件
   * @param data 要导出的数据数组
   * @param filename 文件名
   * @param sheetName 工作表名称
   * @param columns 列配置，用于自定义导出的字段和标题
   */
  static exportToExcel<T extends Record<string, any>>( 
    data: T[],
    filename: string,
    sheetName: string = '数据',
    columns?: Array<{ 
      key: string; 
      title: string; 
    }>
  ): void {
    try {
      // 准备要导出的数据
      let exportData: any[];
      
      if (columns) {
        // 如果提供了列配置，则只导出指定的字段
        exportData = data.map(item => {
          const row: Record<string, any> = {};
          columns!.forEach(col => {
            row[col.title] = item[col.key];
          });
          return row;
        });
      } else {
        // 否则导出所有字段
        exportData = data;
      }

      // 创建工作簿和工作表
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // 自动调整列宽
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      for (let col = range.s.c; col <= range.e.c; col++) {
        let maxWidth = 10; // 默认最小宽度
        const columnLetter = XLSX.utils.encode_col(col);
        
        for (let row = range.s.r; row <= range.e.r; row++) {
          const cellAddress = `${columnLetter}${row + 1}`;
          const cell = worksheet[cellAddress];
          
          if (cell && cell.v) {
            const cellWidth = cell.v.toString().length;
            maxWidth = Math.max(maxWidth, cellWidth);
          }
        }
        
        // 应用列宽（Excel的宽度单位需要特殊处理）
        worksheet['!cols'] = worksheet['!cols'] || [];
        worksheet['!cols'][col] = { wch: maxWidth + 2 }; // 额外加2作为边距
      }

      // 导出文件
      XLSX.writeFile(workbook, filename);
      console.log(`成功导出Excel文件: ${filename}`);
    } catch (error) {
      console.error('导出Excel文件时出错:', error);
      throw new Error(`导出Excel文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 从Excel文件导入数据
   * @param file Excel文件对象
   * @param columnMap 列映射，用于将Excel列标题映射到数据对象的属性
   * @returns Promise<any[]> 导入的数据数组
   */
  static async importFromExcel<T extends Record<string, any>>(
    file: File,
    columnMap?: Record<string, keyof T>
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.isExcelFile(file)) {
          throw new Error('请选择Excel文件(.xlsx或.xls)');
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            
            // 将Excel数据转换为JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // 检查是否有数据
            if (jsonData.length < 2) {
              throw new Error('Excel文件中没有找到有效的数据');
            }
            
            // 获取表头和数据
            const headers = jsonData[0] as string[];
            const dataRows = jsonData.slice(1);
            
            // 转换为目标数据类型
            const importedData: T[] = dataRows.map((row) => {
              const rowData = row as any[];
              const item: Record<string, any> = {};
              
              if (columnMap) {
                // 使用列映射进行转换
                Object.entries(columnMap).forEach(([excelHeader, dataKey]) => {
                  const headerIndex = headers.findIndex(h => 
                    h.toLowerCase().includes(excelHeader.toLowerCase())
                  );
                  
                  if (headerIndex >= 0 && rowData[headerIndex] !== undefined) {
                    (item as any)[dataKey] = rowData[headerIndex];
                  }
                });
              } else {
                // 自动转换（使用表头作为键名）
                headers.forEach((header, index) => {
                  if (rowData[index] !== undefined) {
                    item[header] = rowData[index];
                  }
                });
              }
              
              return item as T;
            });
            
            resolve(importedData);
          } catch (error) {
            reject(new Error(`解析Excel文件失败: ${error instanceof Error ? error.message : '未知错误'}`));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('读取文件失败'));
        };
        
        reader.readAsArrayBuffer(file);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 验证文件是否为Excel文件
   * @param file 要验证的文件
   * @returns boolean 是否为Excel文件
   */
  static isExcelFile(file: File): boolean {
    const fileExtension = file.name.toLowerCase().split('.').pop();
    return fileExtension === 'xlsx' || fileExtension === 'xls';
  }

  /**
   * 生成模拟数据（用于测试）
   * @param count 生成的数据条数
   * @param generators 各字段的生成器函数
   * @returns T[] 生成的模拟数据
   */
  static generateMockData<T extends Record<string, any>>(
    count: number,
    generators: Record<keyof T, () => any>
  ): T[] {
    const mockData: T[] = [];
    
    for (let i = 0; i < count; i++) {
      const item: Record<string, any> = {};
      
      Object.entries(generators).forEach(([key, generator]) => {
        item[key] = generator();
      });
      
      mockData.push(item as T);
    }
    
    return mockData;
  }

  /**
   * 处理导入数据的验证和转换
   * @param rawData 原始导入的数据
   * @param validators 各字段的验证器函数
   * @param transformers 各字段的转换器函数
   * @returns { valid: T[], invalid: any[] } 验证通过和未通过的数据
   */
  static processImportedData<T extends Record<string, any>>(
    rawData: any[],
    validators?: Record<keyof T, (value: any) => boolean>,
    transformers?: Record<keyof T, (value: any) => any>
  ): { valid: T[], invalid: any[] } {
    const valid: T[] = [];
    const invalid: any[] = [];
    
    rawData.forEach((item, index) => {
      let isValid = true;
      const transformedItem: Record<string, any> = {};
      
      // 应用转换
      if (transformers) {
        Object.entries(transformers).forEach(([key, transformer]) => {
          if (item[key] !== undefined) {
            try {
              transformedItem[key] = transformer(item[key]);
            } catch (error) {
              console.error(`转换字段${key}时出错:`, error);
              isValid = false;
            }
          }
        });
      }
      
      // 应用验证
      if (validators && isValid) {
        Object.entries(validators).forEach(([key, validator]) => {
          const value = transformedItem[key] !== undefined ? transformedItem[key] : item[key];
          if (!validator(value)) {
            isValid = false;
          }
        });
      }
      
      // 根据验证结果分类
      if (isValid) {
        valid.push({ ...item, ...transformedItem } as T);
      } else {
        invalid.push({
          ...item,
          _importErrorRow: index + 2, // Excel行号（表头+1）
        });
      }
    });
    
    return { valid, invalid };
  }
}

export default ExcelUtils;