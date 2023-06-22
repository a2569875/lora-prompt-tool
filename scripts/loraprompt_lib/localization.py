import os
import json
import re
from modules import shared

source_filename = "localization"

local_data = {}
local_id = ""

localizations = {}
localizations_dir = shared.cmd_opts.localizations_dir if "localizations_dir" in shared.cmd_opts else "localizations"

def list_localizations(dirname):
    localizations.clear()
    for file in os.listdir(dirname):
        fn, ext = os.path.splitext(file)
        if ext.lower() != ".json":
            continue

        localizations[fn] = os.path.join(dirname, file)

    from modules import scripts
    for file in scripts.list_scripts("localizations", ".json"):
        fn, ext = os.path.splitext(file.filename)
        localizations[fn] = file.path
list_localizations(localizations_dir)

my_localization_data = {
  "Edit Model Basic Data": {
    "zh_TW": "編輯模型基礎資料",
    "ja": "モデルの基本データを編集する",
    "ko": "모델 기본 데이터 편집",
    "zh_CN": "编辑模型基础资料"
  },
  "You DID NOT load any model!": {
    "zh_TW": "你沒有載入模型!",
    "ja": "モデルを読み込んでいません！",
    "ko": "모델을 로드하지 않았습니다!",
    "zh_CN": "你没有加载模型!"
  },
  "Edit Model Trigger Words": {
    "zh_TW": "編輯模型觸發詞",
    "ja": "モデルトリガーワードの編集",
    "ko": "모델 트리거 단어 수정",
    "zh_CN": "编辑模型触发词"
  },
  "Enter your prompt word (trigger word/prompt/negative prompt)": {
    "zh_TW": "輸入你的提示詞 (觸發詞/提示詞/反向提示詞)",
    "ja": "プロンプトワードを入力してください (トリガーワード/プロンプト/否定プロンプト)",
    "ko": "프롬프트 단어 입력(트리거 단어/프롬프트/부정 프롬프트)",
    "zh_CN": "输入你的提示词 (触发词/提示词/反向提示词)"
  },
  "Categorys of prompt": {
    "zh_TW": "分類",
    "ja": "カテゴリー",
    "ko": "카테고리",
    "zh_CN": "分类"
  },
  "Apply data": {
    "zh_TW": "確定",
    "ja": "確認する",
    "ko": "확인하다",
    "zh_CN": "确定"
  },
  "Suggested weight": {
    "zh_TW": "建議權重",
    "ja": "推奨モデル重量",
    "ko": "권장 모델 무게",
    "zh_CN": "建议权重"
  },
  "Sorting": {
    "zh_TW": "打開排序功能選單",
    "ja": "ソート機能メニューを開く",
    "ko": "정렬 기능 메뉴 열기",
    "zh_CN": "打开排序功能选单"
  },
  "Negative prompt: please enter Y if this prompt is a negative prompt.": {
    "zh_TW": "反向提示詞: 為反向提詞時請輸入Y",
    "ja": "ネガティブプロンプト: このプロンプトが否定的なプロンプトである場合は、Y を入力してください。",
    "ko": "부정적인 프롬프트: 이 프롬프트가 부정적인 프롬프트인 경우 Y를 입력하십시오.",
    "zh_CN": "反向提示词: 为反向提词时请输入Y"
  },
  "Translate prompt words into:": {
    "zh_TW": "將提示詞翻譯為:",
    "ja": "プロンプトの単語を他の言語に翻訳する: ",
    "ko": "프롬프트 단어를 다른 언어로 번역: ",
    "zh_CN": "将提示词翻译为: "
  },
  "Easy editing": {
    "zh_TW": "簡易編輯",
    "ja": "簡単な編集",
    "ko": "쉬운 편집",
    "zh_CN": "一键编辑"
  },
  "Advanced editing": {
    "zh_TW": "進階編輯",
    "ja": "高度な編集",
    "ko": "고급 편집",
    "zh_CN": "高级编辑"
  },
  "Additional description": {
    "zh_TW": "額外描述",
    "ja": "追加説明",
    "ko": "추가 설명",
    "zh_CN": "额外描述"
  },
  "Additional description name": {
    "zh_TW": "額外描述名稱",
    "ja": "追加説明の名前",
    "ko": "추가 설명의 이름",
    "zh_CN": "额外描述名称"
  },
  "Description prompt": {
    "zh_TW": "描述提詞",
    "ja": "プロンプト",
    "ko": "설명 프롬프트",
    "zh_CN": "描述提词"
  },
  "Dedicated negative prompt": {
    "zh_TW": "專用反向提詞",
    "ja": "専用の否定プロンプト",
    "ko": "전용 네거티브 프롬프트",
    "zh_CN": "专用反向提词"
  },
  "Dedicated negative prompt name": {
    "zh_TW": "專用反向提詞名稱",
    "ja": "専用ネガティブプロンプトの名前",
    "ko": "전용 네거티브 프롬프트의 이름",
    "zh_CN": "专用反向提词名称"
  },
  "EX: draw a Mahiro": {
    "zh_TW": "EX: 叫出真尋",
    "ja": "EX: まひろを描く",
    "ko": "EX: XXX 그리기",
    "zh_CN": "EX: 叫出真寻"
  },
  "EX: Characteristics of Mahiro": {
    "zh_TW": "EX: 真尋的特徵",
    "ja": "EX: ひろの特徴",
    "ko": "EX: XXX 그리기",
    "zh_CN": "EX: 真寻的特征"
  },
  "EX: negative prompt for Mahiro": {
    "zh_TW": "EX: 真尋反向提詞",
    "ja": "EX: まひろに対する否定的なプロンプト",
    "ko": "EX: XXX에 대한 부정적인 프롬프트",
    "zh_CN": "EX: 真寻反向提词"
  },
  "Type": {
    "zh_TW": "類別",
    "ja": "タイプ",
    "ko": "유형",
    "zh_CN": "类别"
  },
  "Name": {
    "zh_TW": "名稱",
    "ja": "名前",
    "ko": "이름",
    "zh_CN": "名称"
  },
  "Model Path": {
    "zh_TW": "模型路徑",
    "ja": "モデルパス",
    "ko": "모델 경로",
    "zh_CN": "模型路径"
  },
  "name": {
    "zh_TW": "名稱",
    "ja": "名前",
    "ko": "이름",
    "zh_CN": "名称"
  },
  "Trigger Word": {
    "zh_TW": "模型觸發詞",
    "ja": "トリガーワード",
    "ko": "트리거 단어",
    "zh_CN": "模型触发词"
  },
  "Categorys": {
    "zh_TW": "種類",
    "ja": "カテゴリー",
    "ko": "카테고리",
    "zh_CN": "种类"
  },
  "Negative prompt": {
    "zh_TW": "反向提詞",
    "ja": "ネガティブプロンプト",
    "ko": "부정적인 프롬프트",
    "zh_CN": "反向提词"
  },
  "Remove duplicate prompts": {
    "zh_TW": "移除重複的提詞",
    "ja": "重複するプロンプトを削除する",
    "ko": "중복 프롬프트 제거",
    "zh_CN": "移除重复的提词"
  },
  "Remove empty prompts": {
    "zh_TW": "移除空白的提詞",
    "ja": "空のプロンプトを削除する",
    "ko": "빈 프롬프트 제거",
    "zh_CN": "移除空白的提词"
  },
  "Sort Order": {
    "zh_TW": "排序方式",
    "ja": "ソート順",
    "ko": "정렬 순서",
    "zh_CN": "排序方式"
  },
  "Sort by title": {
    "zh_TW": "依標題排序",
    "ja": "タイトル順に並べ替える",
    "zh_CN": "依标题排序"
  },
  "Sort by prompt": {
    "zh_TW": "依提詞排序",
    "ja": "プロンプトで並べ替える",
    "ko": "프롬프트별로 정렬",
    "zh_CN": "依提词排序"
  },
  "Message": {
    "zh_TW": "訊息",
    "ja": "メッセージ",
    "ko": "메시지",
    "zh_CN": "消息"
  },
  "Batch import prompts": {
    "zh_TW": "批次導入提詞",
    "ja": "プロンプトの一括インポート",
    "ko": "프롬프트 일괄 가져 오기",
    "zh_CN": "批量导入提词"
  },
  "Read prompts from text boxes": {
    "zh_TW": "從文字框讀取提詞",
    "ja": "テキストボックスからプロンプトを読み取る",
    "ko": "텍스트 상자에서 프롬프트 읽기",
    "zh_CN": "从文字框读取提词"
  },
  "Download configuration files from CivitAI": {
    "zh_TW": "從CivitAI抓取設定檔",
    "ja": "CivitAIから設定ファイルをダウンロードする",
    "ko": "CivitAI에서 설정 파일 다운로드",
    "zh_CN": "从CivitAI抓取配置文件"
  },
  "Enter prompts (one line for one trigger words)": {
    "zh_TW": "輸入提詞 (一行為一組)",
    "ja": "プロンプトを入力する（1行に1つのトリガーワード）",
    "ko": "프롬프트 입력 (한 줄에 하나의 트리거 단어)",
    "zh_CN": "输入提词 (一行为一组)"
  },
  "Read failed, no model selected.": {
    "zh_TW": "讀取失敗，無選擇的模型。",
    "ja": "読み込みに失敗しました、モデルが選択されていません。",
    "ko": "로드 실패, 모델이 선택되지 않았습니다.",
    "zh_CN": "读取失败，无选择的模型。"
  },
  "CivitAI does not have this model, or it has been taken down.": {
    "zh_TW": "CivitAI沒有這個模型，或者已被下架。",
    "ja": "CivitAIにはこのモデルがないか、取り下げられました。",
    "ko": "CivitAI에는이 모델이 없거나 다운되었습니다.",
    "zh_CN": "CivitAI没有这个模型，或者已被下架。"
  },
  "Successfully downloaded model data from CivitAI.": {
    "zh_TW": "已成功從CivitAI抓取模型資料。",
    "ja": "CivitAIからモデルデータを正常にダウンロードしました。",
    "ko": "CivitAI에서 모델 데이터를 성공적으로 다운로드했습니다.",
    "zh_CN": "已成功从CivitAI抓取模型资料。"
  },
  "Save failed, no model selected.": {
    "zh_TW": "儲存失敗，無選擇的模型。",
    "ja": "モデルが選択されていませんので、保存に失敗しました。",
    "zh_CN": "保存失败，无选择的模型。"
  },
  "Load Successful": {
    "zh_TW": "讀取成功",
    "ja": "読み込み成功",
    "ko": "로드 성공",
    "zh_CN": "读取成功"
  },
  "Save complete": {
    "zh_TW": "儲存完成",
    "ja": "保存完了",
    "ko": "저장 완료",
    "zh_CN": "保存完成"
  },
  "Model not loaded.": {
    "zh_TW": "未載入模型。",
    "ja": "モデルが読み込まれていません。",
    "ko": "모델이 로드되지 않았습니다.",
    "zh_CN": "未加载模型。"
  },
  "HTTP ERROR": {
    "zh_TW": "HTTP錯誤",
    "ja": "HTTPエラー",
    "ko": "HTTP 오류",
    "zh_CN": "HTTP错误"
  },
  "hash calculate failed": {
    "zh_TW": "hash計算失敗",
    "ja": "ハッシュの計算に失敗しました。",
    "ko": "해시 계산 실패",
    "zh_CN": "hash计算失败"
  },
  "fail to load data": {
    "zh_TW": "資料讀取失敗",
    "ja": "データの読み込みに失敗しました。",
    "ko": "데이터 로드 실패",
    "zh_CN": "资料读取失败"
  },
  "error, content from CivitAI is None": {
    "zh_TW": "錯誤，CivitAI傳回資料為空",
    "ja": "エラー、CivitAIからのコンテンツがありません。",
    "ko": "오류, CivitAI에서 반환 된 콘텐츠가 없습니다.",
    "zh_CN": "错误，CivitAI传回资料为空"
  },
  "error, Can not connect to CivitAI.": {
    "zh_TW": "錯誤，無法連線到CivitAI",
    "ja": "エラー、CivitAIに接続できません。",
    "ko": "오류, CivitAI에 연결할 수 없습니다.",
    "zh_CN": "错误，无法连线到CivitAI"
  },
  "Successfully load trigger word from Dreambooth model.": {
    "zh_TW": "已成功從Dreambooth模型抓取觸發詞資料。",
    "ja": "Dreamboothモデルからトリガーワードを正常に読み込みました。",
    "ko": "Dreambooth 모델에서 트리거 단어를 성공적으로 로드했습니다.",
    "zh_CN": "已成功从Dreambooth模型抓取触发词资料。"
  },
  "trigger word not found.": {
    "zh_TW": "找不到模型觸發詞",
    "ja": "トリガーワードが見つかりません。",
    "ko": "트리거 단어를 찾을 수 없습니다.",
    "zh_CN": "找不到模型触发词"
  },
  "Show debug message": {
    "zh_TW": "顯示除錯Debug資訊。",
    "ja": "デバッグメッセージを表示",
    "zh_CN": "显示调试Debug信息。"
  },
  "Load trigger words from Dreambooth model": {
    "zh_TW": "從Dreambooth模型抓取觸發詞",
    "ja": "Dreamboothモデルからトリガーワードを読み込む",
    "zh_CN": "从Dreambooth模型抓取触发词"
  },
  "Force touch mode": {
    "zh_TW": "使用觸控模式",
    "ja": "タッチモードを強制する",
    "zh_CN": "使用触控模式"
  },
  "Model params": {
    "zh_TW": "建議的模型參數",
    "ja": "モデルのパラメーター",
    "zh_CN": "建议的模型参数"
  }
}

def load_localization(current_localization_name):
    global local_data
    global local_id
    local_id = current_localization_name
    fn = localizations.get(current_localization_name, None)
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
        prefix_id = re.sub(r"[_\-\s]+","_",local_id).split("_")[0]
        if prefix_id in my_localization_data[msg].keys():
            return my_localization_data[msg][prefix_id]
    return msg

def get_localize_message(msg):
    if msg in local_data.keys():
        return local_data[msg]
    if msg in my_localization_data.keys():
        if local_id in my_localization_data[msg].keys():
            return my_localization_data[msg][local_id]
        prefix_id = re.sub(r"[_\-\s]+","_",local_id).split("_")[0]
        if prefix_id in my_localization_data[msg].keys():
            return my_localization_data[msg][prefix_id]
    return msg
