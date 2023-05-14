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
    "ko": "모델 기본 데이터 편집"
  },
  "You DID NOT load any model!": {
    "zh_TW": "你沒有載入模型!",
    "ja": "モデルを読み込んでいません！",
    "ko": "모델을 로드하지 않았습니다!"
  },
  "Edit Model Trigger Words": {
    "zh_TW": "編輯模型觸發詞",
    "ja": "モデルトリガーワードの編集",
    "ko": "모델 트리거 단어 수정"
  },
  "Model type": {
    "zh_TW": "模型種類",
    "ja": "モデルタイプ",
    "ko": "모델 유형"
  },
  "Type": {
    "zh_TW": "類別",
    "ja": "タイプ",
    "ko": "유형"
  },
  "Name": {
    "zh_TW": "名稱",
    "ja": "名前",
    "ko": "이름"
  },
  "Model Path": {
    "zh_TW": "模型路徑",
    "ja": "モデルパス",
    "ko": "모델 경로"
  },
  "name": {
    "zh_TW": "名稱",
    "ja": "名前",
    "ko": "이름"
  },
  "Trigger Word": {
    "zh_TW": "模型觸發詞",
    "ja": "トリガーワード",
    "ko": "트리거 단어"
  },
  "Categorys": {
    "zh_TW": "種類",
    "ja": "カテゴリー",
    "ko": "카테고리"
  },
  "Negative prompt": {
    "zh_TW": "反向提詞",
    "ja": "ネガティブプロンプト",
    "ko": "부정적인 프롬프트"
  },
  "Remove duplicate prompts": {
    "zh_TW": "移除重複的提詞",
    "ja": "重複するプロンプトを削除する",
    "ko": "중복 프롬프트 제거"
  },
  "Remove empty prompts": {
    "zh_TW": "移除空白的提詞",
    "ja": "空のプロンプトを削除する",
    "ko": "빈 프롬프트 제거"
  },
  "Sort Order": {
    "zh_TW": "排序方式",
    "ja": "ソート順",
    "ko": "정렬 순서"
  },
  "Sort by title": {
    "zh_TW": "依標題排序",
    "ja": "タイトル順に並べ替える"
  },
  "Sort by prompt": {
    "zh_TW": "依提詞排序",
    "ja": "プロンプトで並べ替える",
    "ko": "프롬프트별로 정렬"
  },
  "Message": {
    "zh_TW": "訊息",
    "ja": "メッセージ",
    "ko": "메시지"
  },
  "Batch import prompts": {
    "zh_TW": "批次導入提詞",
    "ja": "プロンプトの一括インポート",
    "ko": "프롬프트 일괄 가져 오기"
  },
  "Read prompts from text boxes": {
    "zh_TW": "從文字框讀取提詞",
    "ja": "テキストボックスからプロンプトを読み取る",
    "ko": "텍스트 상자에서 프롬프트 읽기"
  },
  "Download configuration files from CivitAI": {
    "zh_TW": "從CivitAI抓取設定檔",
    "ja": "CivitAIから設定ファイルをダウンロードする",
    "ko": "CivitAI에서 설정 파일 다운로드"
  },
  "Enter prompts (one line for one trigger words)": {
    "zh_TW": "輸入提詞 (一行為一組)",
    "ja": "プロンプトを入力する（1行に1つのトリガーワード）",
    "ko": "프롬프트 입력 (한 줄에 하나의 트리거 단어)"
  },
  "Read failed, no model selected.": {
    "zh_TW": "讀取失敗，無選擇的模型。",
    "ja": "読み込みに失敗しました、モデルが選択されていません。",
    "ko": "로드 실패, 모델이 선택되지 않았습니다."
  },
  "CivitAI does not have this model, or it has been taken down.": {
    "zh_TW": "CivitAI沒有這個模型，或者已被下架。",
    "ja": "CivitAIにはこのモデルがないか、取り下げられました。",
    "ko": "CivitAI에는이 모델이 없거나 다운되었습니다."
  },
  "Successfully downloaded model data from CivitAI.": {
    "zh_TW": "已成功從CivitAI抓取模型資料。",
    "ja": "CivitAIからモデルデータを正常にダウンロードしました。",
    "ko": "CivitAI에서 모델 데이터를 성공적으로 다운로드했습니다."
  },
  "Save failed, no model selected.": {
    "zh_TW": "儲存失敗，無選擇的模型。",
    "ja": "モデルが選択されていませんので、保存に失敗しました。"
  },
  "Load Successful": {
    "zh_TW": "讀取成功",
    "ja": "読み込み成功",
    "ko": "로드 성공"
  },
  "Save complete": {
    "zh_TW": "儲存完成",
    "ja": "保存完了",
    "ko": "저장 완료"
  },
  "Model not loaded.": {
    "zh_TW": "未載入模型。",
    "ja": "モデルが読み込まれていません。",
    "ko": "모델이 로드되지 않았습니다."
  },
  "HTTP ERROR": {
    "zh_TW": "HTTP錯誤",
    "ja": "HTTPエラー",
    "ko": "HTTP 오류"
  },
  "hash calculate failed": {
    "zh_TW": "hash計算失敗",
    "ja": "ハッシュの計算に失敗しました。",
    "ko": "해시 계산 실패"
  },
  "fail to load data": {
    "zh_TW": "資料讀取失敗",
    "ja": "データの読み込みに失敗しました。",
    "ko": "데이터 로드 실패"
  },
  "error, content from CivitAI is None": {
    "zh_TW": "錯誤，CivitAI傳回資料為空",
    "ja": "エラー、CivitAIからのコンテンツがありません。",
    "ko": "오류, CivitAI에서 반환 된 콘텐츠가 없습니다."
  },
  "error, Can not connect to CivitAI.": {
    "zh_TW": "錯誤，無法連線到CivitAI",
    "ja": "エラー、CivitAIに接続できません。",
    "ko": "오류, CivitAI에 연결할 수 없습니다."
  },
  "Successfully load trigger word from Dreambooth model.": {
    "zh_TW": "已成功從Dreambooth模型抓取觸發詞資料。",
    "ja": "Dreamboothモデルからトリガーワードを正常に読み込みました。",
    "ko": "Dreambooth 모델에서 트리거 단어를 성공적으로 로드했습니다."
  },
  "trigger word not found.": {
    "zh_TW": "找不到模型觸發詞",
    "ja": "トリガーワードが見つかりません。",
    "ko": "트리거 단어를 찾을 수 없습니다."
  },
  "Show debug message": {
    "zh_TW": "顯示除錯Debug資訊。",
    "ja": "デバッグメッセージを表示"
  },
  "Load trigger words from Dreambooth model": {
    "zh_TW": "從Dreambooth模型抓取觸發詞",
    "ja": "Dreamboothモデルからトリガーワードを読み込む"
  },
  "Force touch mode": {
    "zh_TW": "使用觸控模式",
    "ja": "タッチモードを強制する"
  },
  "Model params": {
    "zh_TW": "模型參數",
    "ja": "モデルのパラメーター"
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
