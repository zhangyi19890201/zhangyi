// 生成100个非在职员工测试数据的脚本
// 使用方法：运行此脚本后，刷新非在职员工信息系统页面即可看到测试数据

import type { FormerEmployee } from './FormerEmployeeSystem';

// 生成随机ID
function generateId(index: number): string {
  return (index + 1000).toString();
}

// 生成工号
function generateEmployeeId(index: number): string {
  return `EMP${(index + 1000).toString().padStart(5, '0')}`;
}

// 生成随机中文姓名
function generateRandomName(index: number): string {
  const familyNames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴'];
  const givenNames = ['伟', '芳', '娜', '秀英', '敏', '静', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明'];
  
  const familyName = familyNames[index % familyNames.length];
  const givenName = givenNames[Math.floor(Math.random() * givenNames.length)];
  
  return `${familyName}${givenName}`;
}

// 生成随机身份证号
function generateIdNumber(gender: 'male' | 'female'): string {
  // 前6位：地区码（这里使用310101代表上海黄浦区）
  const areaCode = '310101';
  
  // 接下来8位：出生日期（随机生成1980-2000年之间的日期）
  const year = Math.floor(Math.random() * 21) + 1980;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  const birthDate = `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;
  
  // 接下来3位：顺序码（随机）
  const sequenceCode = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  // 最后1位：性别码和校验码（简化处理）
  return `${areaCode}${birthDate}${sequenceCode}${gender === 'male' ? Math.floor(Math.random() * 5) * 2 + 1 : Math.floor(Math.random() * 5) * 2}`;
}

// 生成随机年龄
function generateAge(): number {
  return Math.floor(Math.random() * 25) + 25; // 25-50岁
}

// 随机部门
function generateDepartment(): string {
  const departments = ['研发部', '人力资源部', '财务部', '市场部', '销售部', '行政部', '客服部', '运营部'];
  return departments[Math.floor(Math.random() * departments.length)];
}

// 随机职位
function generatePosition(department: string): string {
  const positionsMap: Record<string, string[]> = {
    '研发部': ['工程师', '高级工程师', '技术总监', '产品经理'],
    '人力资源部': ['招聘专员', '培训专员', 'HRBP', '人事经理'],
    '财务部': ['会计', '出纳', '财务经理', '财务总监'],
    '市场部': ['市场专员', '市场经理', '品牌经理', '策划专员'],
    '销售部': ['销售专员', '销售经理', '销售总监', '区域经理'],
    '行政部': ['行政专员', '行政经理', '前台接待', '后勤主管'],
    '客服部': ['客服专员', '客服经理', '投诉处理专员', '客服主管'],
    '运营部': ['运营专员', '运营经理', '数据分析专员', '内容运营']
  };
  
  const positions = positionsMap[department] || ['员工'];
  return positions[Math.floor(Math.random() * positions.length)];
}

// 随机学历
function generateEducation(): string {
  const educations = ['高中', '专科', '本科', '硕士', '博士'];
  return educations[Math.floor(Math.random() * educations.length)];
}

// 生成随机日期（格式：YYYY-MM-DD）
function generateDate(startYear: number, endYear: number): string {
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// 生成随机手机号
function generatePhone(): string {
  const prefixes = ['135', '136', '137', '138', '139', '150', '151', '152', '157', '158'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  
  return `${prefix}${suffix}`;
}

// 生成随机邮箱
function generateEmail(name: string): string {
  const domains = ['example.com', 'test.com', 'company.com', 'work.com', 'biz.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  
  return `${name.toLowerCase()}${Math.floor(Math.random() * 100)}@${domain}`;
}

// 生成随机离职原因
function generateLeaveReason(): string {
  const reasons = ['个人发展', '家庭原因', '公司架构调整', '薪资待遇', '工作环境', '职业规划', '通勤问题', '健康原因'];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

// 生成100个测试用户数据
function generateTestData(): FormerEmployee[] {
  const testData: FormerEmployee[] = [];
  
  for (let i = 0; i < 100; i++) {
    const gender: 'male' | 'female' = Math.random() > 0.5 ? 'male' : 'female';
    const department = generateDepartment();
    const hireDate = generateDate(2015, 2022);
    
    // 离职日期必须晚于入职日期
    const hireYear = parseInt(hireDate.split('-')[0]);
    const leaveDate = generateDate(hireYear, 2024);
    
    // 归档日期必须晚于离职日期
    const leaveYear = parseInt(leaveDate.split('-')[0]);
    const archiveDate = generateDate(leaveYear, 2024);
    
    const employee: FormerEmployee = {
      id: generateId(i),
      employeeId: generateEmployeeId(i),
      name: generateRandomName(i),
      idNumber: generateIdNumber(gender),
      gender: gender,
      age: generateAge(),
      department: department,
      position: generatePosition(department),
      education: generateEducation(),
      hireDate: hireDate,
      leaveDate: leaveDate,
      leaveReason: generateLeaveReason(),
      archiveDate: archiveDate,
      phone: generatePhone(),
      email: generateEmail(generateRandomName(i))
    };
    
    testData.push(employee);
  }
  
  return testData;
}

// 将测试数据保存到localStorage
function saveTestDataToLocalStorage() {
  const testData = generateTestData();
  localStorage.setItem('formerEmployees', JSON.stringify(testData));
  console.log('已生成100个非在职员工测试数据并保存到localStorage');
}

// 执行生成和保存操作
saveTestDataToLocalStorage();

export default generateTestData;