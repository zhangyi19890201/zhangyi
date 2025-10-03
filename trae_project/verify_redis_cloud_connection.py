import os
import sys
import django

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trae_project.settings')
django.setup()

# 尝试导入redis模块
try:
    import redis
    print("✅ redis模块已安装")
except ImportError:
    print("❌ 未安装redis模块，请运行: pip install redis")
    sys.exit(1)

# 从Django设置中获取Redis配置
from django.conf import settings

redis_config = settings.CACHES['default']
redis_location = redis_config['LOCATION']
redis_options = redis_config.get('OPTIONS', {})

print(f"\n正在连接到Redis Cloud: {redis_location}")

# 解析连接URL
from urllib.parse import urlparse

parsed_url = urlparse(redis_location)
host = parsed_url.hostname
port = parsed_url.port
password = redis_options.get('PASSWORD', None)

# 测试连接
try:
    # 创建Redis连接
    r = redis.Redis(
        host=host,
        port=port,
        password=password,
        ssl=redis_options.get('CONNECTION_POOL_KWARGS', {}).get('ssl', False)
    )
    
    # 测试连接
    r.ping()
    print("✅ Redis Cloud连接成功!")
    
    # 设置测试键值
    test_key = 'django:test:key'
    test_value = 'Redis Cloud is working!'
    r.set(test_key, test_value)
    print(f"✅ 成功设置键: {test_key}")
    
    # 获取测试键值
    retrieved_value = r.get(test_key)
    print(f"✅ 成功获取键值: {retrieved_value.decode('utf-8')}")
    
    # 删除测试键
    r.delete(test_key)
    print(f"✅ 成功删除测试键")
    
    # 显示Redis服务器信息
    info = r.info()
    print(f"\n📊 Redis服务器信息:")
    print(f"   - Redis版本: {info.get('redis_version', 'N/A')}")
    print(f"   - 模式: {info.get('redis_mode', 'N/A')}")
    print(f"   - 已用内存: {info.get('used_memory_human', 'N/A')}")
    print(f"   - 连接数: {info.get('connected_clients', 'N/A')}")
    
except Exception as e:
    print(f"❌ Redis Cloud连接失败: {str(e)}")
    print("请检查以下几点:")
    print("1. Redis Cloud服务是否正常运行")
    print("2. settings.py中的连接配置是否正确")
    print("3. 网络连接是否正常")
    sys.exit(1)

print("\n✅ Redis Cloud配置验证完成!")
print("💡 提示: 如果需要更多存储空间或更高性能，可以升级到付费套餐。")