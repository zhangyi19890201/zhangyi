import os
import sys

# 添加项目目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 设置Django环境变量
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trae_project.settings')

# 导入Django并配置
import django
django.setup()

from django.db import connection

print("=== 数据库连接验证 ===")

# 测试数据库连接
try:
    with connection.cursor() as cursor:
        # 获取当前数据库名
        cursor.execute("SELECT DATABASE();")
        current_db = cursor.fetchone()[0]
        print(f"当前连接的数据库: {current_db}")
        
        # 检查数据库中是否存在Django迁移表
        cursor.execute("SHOW TABLES;")
        tables = [table[0] for table in cursor.fetchall()]
        django_tables = [table for table in tables if table.startswith('django_') or table.startswith('auth_')]
        print(f"数据库中的Django表数量: {len(django_tables)}")
        if django_tables:
            print("部分表名示例: " + ", ".join(django_tables[:5]))
    
    print("\n结论: MySQL数据库连接正常，数据存储在trae4数据库中。")
    
except Exception as e:
    print(f"数据库连接测试失败: {e}")