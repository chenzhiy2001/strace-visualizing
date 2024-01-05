import json

# 读取包含多个 JSON 数据的 JSON 文件
json_file_path = "./output_1.json"

with open(json_file_path, 'r') as file:
    json_data_list = json.load(file)

# 构建Markdown表格的表头
markdown_table = "| 系统调用名 | 次数 |\n| --- | --- |"

# 遍历每个 JSON 数据并构建Markdown表格行
for json_data in json_data_list:
    syscall_name = json_data.get("syscall", "")
    syscall_count = json_data.get("count", "")
    markdown_table += f"\n| {syscall_name} | {syscall_count} |"

# 打印Markdown表格
print(markdown_table)
