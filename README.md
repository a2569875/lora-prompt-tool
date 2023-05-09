# LoRA Model Prompt Tool

When you have trained many LoRA models, each model usually has its own model prompt, trigger words and usage method. In the past, external tools were needed to record them. This extension can help you save these model prompts and dedicated prompts, and quickly call them up when needed.

# Installation

After extracting the extension, copy the "lora-prompt-tool" folder to "\webui\extensions" and restart the webui to complete the installation.

# Features

* 1. Automatic add trigger words to prompts
  - Insert prompts at the end of the prompt input box
  - Insert prompts at the position where there are double commas ",,"
  - Divided into prompts and reverse prompts
  - Support txt2img and img2img

* 2. Prompt search/filtering: When there are many prompts for a particular model, you can search/filter the prompts
  - Supports regex search

* 3. Editing and managing prompts
  - Dedicated tab for editing prompts
  - Can add, modify, delete prompts
  - Supports CivitAI's JSON format
  - Delete duplicate prompts
  - Sort prompts
  - Translate prompts

* 4. Batch import of prompts
  - Import from Civitai
  - Import from Dreambooth models
  - Import multiple lines of text

  ## Acknowledgements
*  [JackEllie's Stable-Siffusion community team](https://discord.gg/TM5d89YNwA) 、 [Youtube channel](https://www.youtube.com/@JackEllie)
*  [Chinese Wikipedia community team](https://discord.gg/77n7vnu)

<p align="center"><img src="https://count.getloli.com/get/@sd-webui-lora-prompt-tool.github" alt="sd-webui-lora-prompt-tool"></p>