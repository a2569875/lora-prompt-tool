[![Python](https://img.shields.io/badge/Python-%E2%89%A73.10-blue)](https://www.python.org/downloads/)
[![License](https://img.shields.io/github/license/a2569875/lora-prompt-tool)](https://github.com/a2569875/lora-prompt-tool/blob/main/LICENSE)
# LoRA模型觸發詞工具

當你訓練了很多LoRA模型時，每個模型通常都有自己的模型觸發詞和使用方法，以往要使用外部工具來進行記錄
這個擴展可以幫助你將這些模型的觸發詞和專用提示詞保存起來，並且在要使用時能快速地叫出來

[![buy me a coffee](readme/Artboard.svg)](https://www.buymeacoffee.com/a2569875 "buy me a coffee")

[![LoRA-Prompt-Tool!](https://res.cloudinary.com/marcomontalbano/image/upload/v1683644210/video_to_markdown/images/youtube--QQ9YVjCO_9s-c05b58ac6eb4c4700831b2b3070cd403.jpg)](https://www.youtube.com/watch?v=QQ9YVjCO_9s "LoRA-Prompt-Tool!")

# 安裝

將擴展解壓縮後，將lora-prompt-tool資料夾複製到\webui\extensions下，重新啟動webui即完成安裝

# 功能
* 1.自動加入提示詞
  - 插入提示詞到提示詞輸入框的末尾
  - 插入提示詞到中間有雙逗號 ",," 的位置
  - 分為提示詞和反向提示詞
  - txt2img和img2img支援

* 2.提示詞搜索/篩選 : 當某個模型提示詞非常多時，可以搜索/篩選提示詞
  - 支援regex(正規表達式)搜索

* 3.編輯與管理提示詞
  - 編輯提示詞的專屬頁籤
  - 可以編輯、新增、修改、刪除
  - 支援CivitAI的JSON
  - 刪除重複的提示詞
  - 排序提示詞
  - 翻譯提示詞

* 4.批次匯入提示詞
  - 從Civitai匯入
  - 從dreambooth模型匯入
  - 文字多行匯入

* ~~緒山真尋!~~

## Acknowledgements
*  [JackEllie的Stable-Siffusion的社群團隊](https://discord.gg/TM5d89YNwA) 、 [Youtube頻道](https://www.youtube.com/@JackEllie)
*  [中文維基百科的社群團隊](https://discord.gg/77n7vnu)

<p align="center"><img src="https://count.getloli.com/get/@sd-webui-lora-prompt-tool.github" alt="sd-webui-lora-prompt-tool"></p>