import os
import json
from collections import defaultdict

# 指定输入和输出 JSON 文件夹路径
input_folder = '../strace_logs'
output_folder = './result_folder'

# 获取输入文件夹中的所有 JSON 文件
input_files = [f for f in os.listdir(input_folder) if f.endswith('.json')]

# 遍历每个 JSON 文件
for input_file in input_files:
    # 构建输入和输出 JSON 文件的完整路径
    input_json_path = os.path.join(input_folder, input_file)
    output_json_path = os.path.join(output_folder, input_file.replace('.json', '_result.json'))

    # 读取输入 JSON 文件内容
    with open(input_json_path, 'r') as file:
        json_data = file.read()

    # 解析 JSON 数据
    data = json.loads(json_data)

    # 使用 defaultdict 来创建一个字典，用于存储 syscall 名称和对应的次数
    syscall_stats = defaultdict(int)

    # 遍历每个对象，统计 syscall 信息
    for entry in data:
        # 检查键是否存在
        if "syscall" in entry:
            syscall_name = entry["syscall"]

            # 更新统计信息
            syscall_stats[syscall_name] += 1

    # 按照 count 的大小从大到小排序
    sorted_stats = sorted(syscall_stats.items(), key=lambda x: x[1], reverse=True)

    # 将统计结果写入输出 JSON 文件，每行一个结果
    with open(output_json_path, 'w') as output_file:
        for syscall_name, count in sorted_stats:
            output_line = {"syscall": syscall_name, "count": count}
            output_file.write(json.dumps(output_line) + '\n')

    print(f"Statistical results for {input_file} saved to {output_json_path}")