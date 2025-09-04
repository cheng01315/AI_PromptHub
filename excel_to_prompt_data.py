import pandas as pd
import json

def excel_to_prompt_data(excel_file, output_js_file):
    # 读取Excel文件
    df = pd.read_excel(excel_file)
    
    # 确保列名正确（根据实际Excel列名调整）
    # 假设Excel列名为：大分类、小分类、标题、中文提示词、英文提示词
    required_columns = ['大分类', '小分类', '标题', '中文提示词', '英文提示词']
    if not all(col in df.columns for col in required_columns):
        raise ValueError("Excel文件必须包含以下列：大分类、小分类、标题、中文提示词、英文提示词")
    
    # 转换为所需格式
    prompt_data = []
    for _, row in df.iterrows():
        item = {
            "mainCategory": str(row['大分类']),
            "subCategory": str(row['小分类']),
            "title": str(row['标题']),
            "chinese": str(row['中文提示词']),
            "english": str(row['英文提示词'])
        }
        prompt_data.append(item)
    
    # 写入JavaScript文件
    with open(output_js_file, 'w', encoding='utf-8') as f:
        f.write("const promptData = " + json.dumps(prompt_data, ensure_ascii=False, indent=4) + ";")
    
    print(f"成功转换 {len(prompt_data)} 条数据到 {output_js_file}")

# 使用示例
if __name__ == "__main__":
    # 替换为你的Excel文件路径
    excel_file_path = "C:\\Users\\Cheng\\Downloads\\ai_ prompt\\提示词数据.xlsx"
    # 输出的JavaScript文件路径
    output_path = "C:\\Users\\Cheng\\Downloads\\ai_ prompt\\prompt-data.js"
    
    try:
        excel_to_prompt_data(excel_file_path, output_path)
    except Exception as e:
        print(f"转换失败：{str(e)}")
