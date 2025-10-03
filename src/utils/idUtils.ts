/**
 * 根据身份证号获取性别
 * @param idNumber 18位身份证号
 * @returns 'male' 或 'female'
 */
export const getGenderFromIdNumber = (idNumber: string): 'male' | 'female' => {
  if (!idNumber || idNumber.length !== 18) {
    return 'male'; // 默认返回男性
  }
  
  // 第17位数字，奇数为男，偶数为女
  const genderDigit = parseInt(idNumber.charAt(16));
  return genderDigit % 2 === 1 ? 'male' : 'female';
};

/**
 * 根据身份证号获取出生日期
 * @param idNumber 18位身份证号
 * @returns 出生日期字符串 YYYY-MM-DD
 */
export const getBirthDateFromIdNumber = (idNumber: string): string => {
  if (!idNumber || idNumber.length !== 18) {
    return '';
  }
  
  // 第7-14位是出生日期
  const birthYear = idNumber.substring(6, 10);
  const birthMonth = idNumber.substring(10, 12);
  const birthDay = idNumber.substring(12, 14);
  
  return `${birthYear}-${birthMonth}-${birthDay}`;
};

/**
 * 根据身份证号计算年龄
 * @param idNumber 18位身份证号
 * @returns 年龄
 */
export const calculateAgeFromIdNumber = (idNumber: string): number => {
  const birthDate = getBirthDateFromIdNumber(idNumber);
  if (!birthDate) {
    return 0;
  }
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  
  // 检查是否已经过了生日
  const hasHadBirthday = today.getMonth() > birth.getMonth() || 
                        (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  
  return hasHadBirthday ? age : age - 1;
};

/**
 * 计算派遣时长（多少年多少月）
 * @param startDate 开始日期字符串 YYYY-MM-DD
 * @returns 派遣时长描述
 */
export const calculateEmploymentDuration = (startDate: string): string => {
  if (!startDate) {
    return '无';
  }
  
  const start = new Date(startDate);
  const today = new Date();
  
  // 计算月份差
  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();
  
  // 如果当前月份小于开始月份，需要借位
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // 检查日期
  if (today.getDate() < start.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months = 11;
    }
  }
  
  if (years === 0) {
    return `${months}个月`;
  } else if (months === 0) {
    return `${years}年`;
  } else {
    return `${years}年${months}个月`;
  }
};

/**
 * 验证身份证号格式
 * @param idNumber 身份证号
 * @returns 是否有效
 */
export const validateIdNumber = (idNumber: string): boolean => {
  if (!idNumber || typeof idNumber !== 'string') {
    return false;
  }
  
  // 18位身份证号的正则表达式
  const idRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  
  if (!idRegex.test(idNumber)) {
    return false;
  }
  
  // 计算校验码（简化版）
  const factors = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const parityBit = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idNumber.charAt(i)) * factors[i];
  }
  
  const checkDigit = parityBit[sum % 11];
  return idNumber.charAt(17).toUpperCase() === checkDigit;
};

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 格式化日期
 * @param date 日期对象或字符串
 * @param format 格式化模板，默认为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};