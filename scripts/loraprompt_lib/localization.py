import json
from modules import localization

source_filename = "localization"

local_data = {}
local_id = ""

my_localization_data = {
    "Edit Model Basic Data" : {
        "zh_TW": "編輯模型基礎資料"
    },
    "You DID NOT load any model!" : {
        "zh_TW": "你沒有載入模型!"
    },
    "Edit Model Trigger Words" : {
        "zh_TW": "編輯模型觸發詞"
    },
    "Model type" : {
        "zh_TW": "模型種類"
    },
    "Type" : {
        "zh_TW": "類別"
    },
    "Name" : {
        "zh_TW": "名稱"
    },
    "Model Path" : {
        "zh_TW": "模型路徑"
    },
    "name" : {
        "zh_TW": "名稱"
    },
    "Trigger Word" : {
        "zh_TW": "模型觸發詞"
    },
    "Categorys" : {
        "zh_TW": "種類"
    },
    "Negative prompt" : {
        "zh_TW": "反向提詞"
    },
    "Remove duplicate prompts" : {
        "zh_TW": "移除重複的提詞"
    },
    "Remove empty prompts" : {
        "zh_TW": "移除空白的提詞"
    },
    "Sort Order" : {
        "zh_TW": "排序方式"
    },
    "Sort by title" : {
        "zh_TW": "依標題排序"
    },
    "Sort by prompt" : {
        "zh_TW": "依提詞排序"
    },
    "Message" : {
        "zh_TW": "訊息"
    },
    "Batch import prompts" : {
        "zh_TW": "批次導入提詞"
    },
    "Read prompts from text boxes" : {
        "zh_TW": "從文字框讀取提詞"
    },
    "Download configuration files from CivitAI" : {
        "zh_TW": "從CivitAI抓取設定檔"
    },
    "Enter prompts (one line for one trigger words)" : {
        "zh_TW": "輸入提詞 (一行為一組)"
    },
    "Read failed, no model selected." : {
        "zh_TW": "讀取失敗，無選擇的模型。"
    },
    "CivitAI does not have this model, or it has been taken down." : {
        "zh_TW": "CivitAI沒有這個模型，或者已被下架。"
    },
    "Successfully downloaded model data from CivitAI." : {
        "zh_TW": "已成功從CivitAI抓取模型資料。"
    },
    "Save failed, no model selected." : {
        "zh_TW": "儲存失敗，無選擇的模型。"
    },
    "Load Successful" : {
        "zh_TW": "讀取成功"
    },
    "Save complete" : {
        "zh_TW": "儲存完成"
    },
    "Model not loaded." : {
        "zh_TW": "未載入模型。"
    },
    "HTTP ERROR" : {
        "zh_TW": "HTTP錯誤"
    },
    "hash calculate failed" : {
        "zh_TW": "hash計算失敗"
    },
    "fail to load data" : {
        "zh_TW": "資料讀取失敗"
    },
    "error, content from CivitAI is None" : {
        "zh_TW": "錯誤，CivitAI傳回資料為空"
    },
    "error, Can not connect to CivitAI." : {
        "zh_TW": "錯誤，無法連線到CivitAI"
    },
    "Successfully load trigger word from Dreambooth model." : {
        "zh_TW": "已成功從Dreambooth模型抓取觸發詞資料。"
    },
    "trigger word not found." : {
        "zh_TW": "找不到模型觸發詞"
    },
    "Show debug message" : {
        "zh_TW": "顯示除錯Debug資訊。"
    },
    "Load trigger words from Dreambooth model" : {
        "zh_TW": "從Dreambooth模型抓取觸發詞"
    },
    "Force touch mode" : {
        "zh_TW": "使用觸控模式"
    },
    "Model params" : {
        "zh_TW": "模型參數"
    }
}

def load_localization(current_localization_name):
    global local_data
    global local_id
    local_id = current_localization_name
    fn = localization.localizations.get(current_localization_name, None)
    if fn is not None:
        try:
            with open(fn, "r", encoding="utf8") as file:
                local_data = json.load(file)
        except Exception:
            print(f"Error loading localization from {fn}")

def get_localize(msg):
    if msg in local_data.keys():
        return msg
    if msg in my_localization_data.keys():
        if local_id in my_localization_data[msg].keys():
            return my_localization_data[msg][local_id]
    return msg

def get_localize_message(msg):
    if msg in local_data.keys():
        return local_data[msg]
    if msg in my_localization_data.keys():
        if local_id in my_localization_data[msg].keys():
            return my_localization_data[msg][local_id]
    return msg
