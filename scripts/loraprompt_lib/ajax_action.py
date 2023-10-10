import os
import json
import re
import math
from . import libdata
from . import util
from . import loraprompttool
from . import ajax_handler
from . import localization
from .dataframe_edit import get_simple_from_df
from .dataframe_edit import save_to_dataframe
from .dataframe_edit import append_empty
source_filename = "ajax_action"

def cors_request(msg):
    result = ajax_handler.parse_ajax_msg(msg)
    if not result:
        util.console.error("Parsing ajax failed", f"{source_filename}.cors_request")
        return ""
    response = loraprompttool.sent_cors_request(result["url"])
    response_state = loraprompttool.check_model_state(response)
    response_body = { "status": "ok" }
    if response_state == "error":
        response_body["status"] = "error"
        response_body["message"] = loraprompttool.get_model_error_message(response)
    else:
        response_body["message"] = response["message"]
    return json.dumps(response_body, indent=4)

#用於顯示右鍵選單
def show_trigger_words(msg):
    """pass trigger words JSON to browser

    Parameters
    ----------
    msg : JSON
        requset message

    Returns
    -------
    JSON
        the trigger words JSON of selected model
    """
    util.console.start("loading trigger words for context menu")
    result = ajax_handler.parse_ajax_msg(msg)
    if not result:
        util.console.error("Parsing ajax failed", f"{source_filename}.show_trigger_words")
        return ""
    
    model_type = result["model_type"]
    model_path = result["model_path"]

    model_info = loraprompttool.load_model_info_by_model_path(model_type, model_path)
    model_bundle = loraprompttool.load_model_bundle_model_path(model_type, model_path)
    #no data
    if not model_info:
        #has bundle embeding
        if len(model_bundle) > 0:
            model_info = {}
        #no data for this model
        else:
            return ""
    
    model_info["_bundle_embs"] = []
    for bundle_emb in model_bundle:
        model_info["_bundle_embs"].append(bundle_emb)

    util.console.end("loading trigger words for context menu")
    #sent to client
    return json.dumps(model_info, indent=4)

#避免沒有這個key而出錯
def get_key(dist1, key : str, default_val):
    """get key from dictionary, if key doesn't exist, return default value.

    Parameters
    ----------
    dist1 : dist
        source dictionary
    key : str
        key to find
    default_val : any
        default value

    Returns
    -------
    object
        The object of the specified key in the dictionary
    """
    if key not in dist1.keys():
        return default_val
    value = dist1[key]
    if not value:
        return default_val
    return value

#這是在webui顯示用的；No會造成翻譯時出現與 "標號" (No)衝突，改用Not
def boolean_flag_to_display(flag):
    if load_boolean_flag(flag) == 1:
        return "Yes"
    else:
        return "Not"

#將各種是/非值正規劃
def load_boolean_flag(flag):
    if flag == True:
        return 1
    if flag == False:
        return ''
    flag_str = str(flag)
    flag_str = flag_str.lower().strip()
    if flag_str in ['yes','true','是','y','t']:
        return 1
    flag_num = int(util.load_json_number(flag_str))
    if flag_num != 0:
        return 1
    return ""

def flag_to_boolean(flag):
    return load_boolean_flag(flag) == 1

def get_setting_from_dreambooth(db_model_name, df):
    from . import model
    dreambooth_info = model.get_db_model_setting(db_model_name)
    if not dreambooth_info:
        return [localization.get_localize_message("trigger word not found."), append_empty(df.values.tolist())]
    prompt_list = []
    if "concepts_path" in dreambooth_info.keys():
        if dreambooth_info["concepts_path"].strip() != "":
            concepts_file = model.load_model_info(dreambooth_info["concepts_path"])
            if not concepts_file:
                libdata.noop_func()
            else:
                for concept in concepts_file:
                    if "instance_token" in concept.keys():
                        prompt = concept["instance_token"]
                        if prompt.strip() != "":
                            prompt_list.append(prompt)
    if "concepts_list" in dreambooth_info.keys():
        for concept in dreambooth_info["concepts_list"]:
            if "instance_token" in concept.keys():
                prompt = concept["instance_token"]
                if prompt.strip() != "":
                    prompt_list.append(prompt)
    if len(prompt_list) <= 0:
        return [localization.get_localize_message("trigger word not found."), append_empty(df.values.tolist())]
    
    if df is None:
        libdata.noop_func()
    else:
        prompt_data = df.values.tolist()
        for prompt in prompt_list:
            prompt_data.append(["", prompt, "", ""])
        return [localization.get_localize_message("Successfully load trigger word from Dreambooth model."), append_empty(prompt_data)]
    #反正程式現在跑不到這一行，就不理他了XD
    return ["你去問緒山真尋這程式寫好沒!", append_empty(df.values.tolist())]

#從CivitAI站導入模型資料 (只限於從CivitAI站下載的模型...)
def get_setting_from_Civitai(model_type_display, model_sub_type, model_name, model_path, input_weight, input_param, 
        df, main_name, main_trigger, has_extra, extra_name, extra_trigger, has_neg, neg_name, neg_trigger,
        loadded_json_text):
    """get JSON from CivitAI.

    Parameters
    ----------
    model_type_display
        model type to display
    model_sub_type
        Variants of the model, for example, LoRA has variants LoCon, LoHA, etc.
    model_name
        name of model
    model_path
        path of model
    df : Dataframe
        prompts input by user
    loadded_json_text
        loadded JSON
    """
    util.console.start("get_setting_from_Civitai")

    returned_json = None
    try:
        returned_json = json.loads(loadded_json_text)
    except Exception:
        returned_json = {}

    #no model are selected
    if model_path == "":
        util.console.error("Parsing ajax failed", f"{source_filename}.get_setting_from_Civitai")
        return [localization.get_localize_message("Read failed, no model selected."), model_type_display, model_sub_type, model_name, 
                model_path, input_weight, input_param, 
                append_empty(save_to_dataframe(df, main_name, main_trigger, has_extra, extra_name, extra_trigger, has_neg, neg_name, neg_trigger)), 
                main_name, main_trigger, has_extra, extra_name, extra_trigger, has_neg, neg_name, neg_trigger,
                loadded_json_text, returned_json]
    
    model_type = libdata.model_type_dict[model_type_display]
    model_weight = input_weight
    model_param = input_param
    #load data from CivitAI
    Civitai_info = loraprompttool.load_model_info_from_Civitai(model_type, model_path)

    #error handling
    model_state = loraprompttool.check_model_state(Civitai_info)
    if model_state == "empty":
        return  [localization.get_localize_message("CivitAI does not have this model, or it has been taken down."), 
                model_type_display, model_sub_type, model_name,
                model_path, input_weight, input_param, 
                append_empty(save_to_dataframe(df, main_name, main_trigger, has_extra, extra_name, extra_trigger, has_neg, neg_name, neg_trigger)),
                main_name, main_trigger, has_extra, extra_name, extra_trigger, has_neg, neg_name, neg_trigger,
                loadded_json_text, returned_json]
    elif model_state == "error":
        return  [loraprompttool.get_model_error_message(Civitai_info), model_type_display, model_sub_type, model_name,
                model_path, input_weight, input_param, 
                append_empty(save_to_dataframe(df, main_name, main_trigger, has_extra, extra_name, extra_trigger, has_neg, neg_name, neg_trigger)),
                main_name, main_trigger, has_extra, extra_name, extra_trigger, has_neg, neg_name, neg_trigger,
                loadded_json_text, returned_json]
    
    #load user inputed information 
    loadded_json = None
    try:
        loadded_json = json.loads(loadded_json_text)
    except Exception as err:
        loadded_json = loraprompttool.load_model_info_by_model_path(model_type, model_path)

    #if no name, get from model path, remove file extension
    check_name, ext = os.path.splitext(model_path)
    check_name = check_name.replace("\\", "/")
    check_name = check_name.split("/")

    if not loadded_json:
        loadded_json = { "name":check_name[-1] }

    #first step: copy all prompt into loadded_json
    prompt_list = []
    if "prompts" in loadded_json.keys():
        if loadded_json["prompts"]:
            if isinstance(loadded_json["prompts"], str):
                prompt_item = {
                    "title": "", 
                    "prompt": loadded_json["prompts"], 
                    "categorys": "",
                    "neg":""
                }
                prompt_list.append(prompt_item)
            else:
                for prompt in loadded_json["prompts"]:
                    prompt_item = {
                        "title": get_key(prompt, "title", ""), 
                        "prompt": prompt["prompt"],
                        "categorys": get_key(prompt, "categorys", ""),
                        "neg": load_boolean_flag(get_key(prompt, "neg", "")),
                    }
                    prompt_list.append(prompt_item)
    civitai_prompt_list = []
    if "trainedWords" in loadded_json.keys():
        trainedWords = loadded_json["trainedWords"]
        if isinstance(trainedWords, str):
            civitai_prompt_list.append(trainedWords)
        else:
            for word in trainedWords:
                civitai_prompt_list.append(word)

    if df is None:
        libdata.noop_func()
    else:
        prompt_data = save_to_dataframe(df, main_name, main_trigger, has_extra, extra_name, extra_trigger, has_neg, neg_name, neg_trigger)
        for prompt in prompt_data:
            prompt_title = prompt[0]
            prompt_value = prompt[1]
            prompt_category = prompt[2]
            prompt_neg = load_boolean_flag(prompt[3])
            if isinstance(prompt, str):
                prompt_item = {
                    "title": "", 
                    "prompt": prompt, 
                    "categorys": "",
                    "neg":""
                }
                prompt_list.append(prompt_item)
            if prompt_value == "":
                continue
            if prompt_title == "##Civitai##":
                civitai_prompt_list.append(prompt_value)
            else:
                prompt_item = {
                    "prompt": prompt_value
                }
                if prompt_title.strip() != "":
                    prompt_item["title"] = prompt_title
                if prompt_category.strip() != "":
                    prompt_item["categorys"] = prompt_category
                if prompt_neg.strip() != "":
                    prompt_item["neg"] = prompt_neg
                prompt_list.append(prompt_item)

    #second step: merge prompt list
    if "prompts" not in Civitai_info.keys():
        if len(prompt_list) > 0:
            Civitai_info["prompts"] = []

    if len(prompt_list) > 0:
        if isinstance(Civitai_info["prompts"], str):
            Civitai_info["prompts"] = [{
                "prompt": Civitai_info["prompts"]
            }]
        for prompt in prompt_list:
            #find if prompt already exist
            has_same = False
            prompt_title = get_key(prompt, "title", "").strip()
            prompt_prompt = get_key(prompt, "prompt", "").strip()
            prompt_neg = load_boolean_flag(get_key(prompt, "neg", "").strip())
            for i, check_prompt in enumerate(Civitai_info["prompts"]):

                check_prompt_title = get_key(check_prompt, "title", "").strip()
                check_prompt_prompt = get_key(check_prompt, "prompt", "").strip()
                check_prompt_neg = load_boolean_flag(get_key(check_prompt, "neg", "").strip())
                if check_prompt_title == prompt_title and \
                    check_prompt_prompt == prompt_prompt and\
                    prompt_prompt != "" and prompt_neg == check_prompt_neg:
                    has_same = True
                    if "categorys" in check_prompt.keys():
                        Civitai_info["prompts"][i]["categorys"] = get_key(prompt, "categorys", "")
                    if "neg" in check_prompt.keys():
                        Civitai_info["prompts"][i]["neg"] = load_boolean_flag(get_key(prompt, "neg", ""))
                    break
            if not has_same:
                Civitai_info["prompts"].append(prompt)

    if "trainedWords" not in Civitai_info.keys():
        if len(civitai_prompt_list) > 0:
            Civitai_info["trainedWords"] = []

    if len(civitai_prompt_list) > 0:
        if isinstance(Civitai_info["trainedWords"], str):
            Civitai_info["trainedWords"] = [Civitai_info["trainedWords"]]
        for prompt in civitai_prompt_list:
            #find if prompt already exist
            has_same = False
            for i, check_prompt in enumerate(Civitai_info["trainedWords"]):
                if check_prompt == prompt:
                    has_same = True
            if not has_same:
                Civitai_info["trainedWords"].append(prompt)

    new_model_name = model_name
    new_model_sub_type = model_sub_type
    if "model" in Civitai_info.keys():
        new_model_name = Civitai_info["model"]["name"]
        new_model_sub_type = Civitai_info["model"]["type"]
        model_weight = get_key(Civitai_info, "weight", input_weight)
        model_param = get_key(Civitai_info, "param", input_param)

    prompt_list = []
    if "prompts" in Civitai_info.keys():
         if Civitai_info["prompts"]:
            if isinstance(Civitai_info["prompts"], str):
                prompt_item = []
                prompt_item.extend(["", Civitai_info["prompts"], "", "Not"])
                prompt_list.append(prompt_item)
            else:
                for prompt in Civitai_info["prompts"]:
                    prompt_item = []
                    prompt_item.extend([
                        get_key(prompt, "title", ""), 
                        prompt["prompt"],
                        get_key(prompt, "categorys", ""),
                        boolean_flag_to_display(get_key(prompt, "neg", ""))])
                    prompt_list.append(prompt_item)
    
    #support for Civitai's JSON
    if "trainedWords" in Civitai_info.keys():
        trainedWords = Civitai_info["trainedWords"]
        if isinstance(trainedWords, str):
            prompt_item = []
            prompt_item.extend(["##Civitai##", trainedWords, "civitai", "Not"])
            prompt_list.append(prompt_item)
        else:
            for word in trainedWords:
                prompt_item = []
                prompt_item.extend(["##Civitai##", word, "civitai", "Not"])
                prompt_list.append(prompt_item)

    if len(prompt_list) <= 0:
        prompt_list = [libdata.dataframe_empty_row]

    util.console.end("get_setting_from_Civitai")
    outputed_json_text = json.dumps(Civitai_info, indent=4)
    return [localization.get_localize_message("Successfully downloaded model data from CivitAI."), 
            model_type_display, new_model_sub_type, 
            new_model_name, model_path, model_weight, model_param, 
            append_empty(prompt_list), *get_simple_from_df(prompt_list),
            outputed_json_text, 
            update_trigger_words_json(model_sub_type, model_name, model_path, model_weight, model_param, 
                df, main_name, main_trigger, has_extra, extra_name, extra_trigger, has_neg, neg_name, neg_trigger,
            outputed_json_text)]

def update_trigger_words_json(model_sub_type, model_name, model_path, model_weight, model_params, 
        df, main_name, main_trigger, has_extra, extra_name, extra_trigger, has_neg, neg_name, neg_trigger,
        loadded_json):
    model_info = None
    try:
        model_info = json.loads(loadded_json)
    except Exception as err:
        pass

    if model_path == "":
        return model_info

    check_name, ext = os.path.splitext(model_path)
    check_name = check_name.replace("\\", "/")
    check_name = check_name.split("/")

    if not model_info:
        model_info = { "name":check_name[-1] }

    is_civitai = False
    if "model" in model_info.keys():
        is_civitai = True
    
    if model_params.strip() != "":
        model_info["params"] = model_params
    try:
        load_weight = float(str(model_weight))
        if math.isfinite(load_weight):
            model_info["weight"] = load_weight
    except Exception:
        pass


    if df is None:
        libdata.noop_func()
    else:
        civitai_it = 0
        it = 0
        prompt_data = save_to_dataframe(df, main_name, main_trigger, has_extra, extra_name, extra_trigger, has_neg, neg_name, neg_trigger)
        if is_civitai:
            model_info["trainedWords"] = []
        model_info["prompts"] = []
        for prompt in prompt_data:
            prompt_title = prompt[0]
            prompt_value = prompt[1]
            prompt_category = prompt[2]
            prompt_neg = load_boolean_flag(prompt[3])
            if isinstance(prompt, str):
                prompt_title = ""
                prompt_value = prompt
                prompt_category = ""
            if prompt_value == "":
                continue
            if is_civitai and prompt_title == "##Civitai##":
                if civitai_it >= len(model_info["trainedWords"]):
                    model_info["trainedWords"].append(prompt_value)
                else:
                    model_info["trainedWords"][civitai_it] = prompt_value
                civitai_it += 1
            else:
                prompt_item = { "prompt" : prompt_value }
                if prompt_title != "":
                    prompt_item["title"] = prompt_title
                if prompt_category != "":
                    prompt_item["categorys"] = prompt_category
                if prompt_neg != "":
                    prompt_item["neg"] = load_boolean_flag(prompt_neg)

                if it >= len(model_info["prompts"]):
                    model_info["prompts"].append(prompt_item)
                else:
                    model_info["prompts"][it] = prompt_item
                it += 1
        if len(model_info["prompts"]) <= 0:
            model_info.pop("prompts")

    if model_name != "":
        if is_civitai:
            model_info["model"]["name"] = model_name
        else:
            model_info["name"] = model_name

    if model_sub_type != "":
        if is_civitai:
            model_info["model"]["type"] = model_sub_type
        else:
            model_info["type"] = model_sub_type

    return model_info

#儲存編輯好的提詞表
def save_trigger_words(model_type_display, model_sub_type, model_name, model_path, model_weight, model_params, 
        df, main_name, main_trigger, has_extra, extra_name, extra_trigger, has_neg, neg_name, neg_trigger,
        loadded_json):
    """save user inputed trigger words to JSON file.

    Parameters
    ----------
    model_type_display
        model type to display
    model_sub_type
        Variants of the model, for example, LoRA has variants LoCon, LoHA, etc.
    model_name
        name of model
    model_path
        path of model
    df : Dataframe
        prompts input by user
    loadded_json
        loadded JSON
    """
    util.console.start("save_trigger_words")
    if model_path == "":
        util.console.error("Parsing ajax failed", f"{source_filename}.save_trigger_words")
        return localization.get_localize_message("Save failed, no model selected.")

    model_type = libdata.model_type_dict[model_type_display]

    check_name, ext = os.path.splitext(model_path)
    check_name = check_name.replace("\\", "/")
    check_name = check_name.split("/")

    model_info = None
    try:
        model_info = json.loads(loadded_json)
    except Exception as err:
        model_info = loraprompttool.load_model_info_by_model_path(model_type, model_path)

    if not model_info:
        model_info = { "name":check_name[-1] }

    is_civitai = False
    if "model" in model_info.keys():
        is_civitai = True
    if model_params.strip() != "":
        model_info["params"] = model_params
    try:
        load_weight = float(str(model_weight))
        if math.isfinite(load_weight):
            model_info["weight"] = load_weight
    except Exception:
        pass

    if df is None:
        libdata.noop_func()
    else:
        civitai_it = 0
        it = 0
        prompt_data = save_to_dataframe(df, main_name, main_trigger, has_extra, extra_name, extra_trigger, has_neg, neg_name, neg_trigger)
        if is_civitai:
            model_info["trainedWords"] = []
        model_info["prompts"] = []
        for prompt in prompt_data:
            prompt_title = prompt[0]
            prompt_value = prompt[1]
            prompt_category = prompt[2]
            prompt_neg = load_boolean_flag(prompt[3])
            if isinstance(prompt, str):
                prompt_title = ""
                prompt_value = prompt
                prompt_category = ""
            if prompt_value == "":
                continue
            if is_civitai and prompt_title == "##Civitai##":
                if civitai_it >= len(model_info["trainedWords"]):
                    model_info["trainedWords"].append(prompt_value)
                else:
                    model_info["trainedWords"][civitai_it] = prompt_value
                civitai_it += 1
            else:
                prompt_item = { "prompt" : prompt_value }
                if prompt_title != "":
                    prompt_item["title"] = prompt_title
                if prompt_category != "":
                    prompt_item["categorys"] = prompt_category
                if prompt_neg != "":
                    prompt_item["neg"] = load_boolean_flag(prompt_neg)

                if it >= len(model_info["prompts"]):
                    model_info["prompts"].append(prompt_item)
                else:
                    model_info["prompts"][it] = prompt_item
                it += 1
        if len(model_info["prompts"]) <= 0:
            model_info.pop("prompts")

    if model_name != "":
        if is_civitai:
            model_info["model"]["name"] = model_name
        else:
            model_info["name"] = model_name

    if model_sub_type != "":
        if is_civitai:
            model_info["model"]["type"] = model_sub_type
        else:
            model_info["type"] = model_sub_type
    try:
        loraprompttool.save_model_info_by_model_path(model_info, model_type, model_path)
    except Exception as err:
        return "Error: " + err
    
    util.console.end("save_trigger_words")
    return localization.get_localize_message("Save complete")

#將提詞表傳到前端WebUI供編輯
def reload_trigger_words(model_type_input, model_path):
    """pass model JSON to browser for edit

    Parameters
    ----------
    msg : JSON
        request header.
    """
    model_type = model_type_input
    try:
        model_type = libdata.model_type_dict[model_type_input]
    except Exception:
        pass
    
    model_type_display = libdata.model_type_names[model_type]

    check_name, ext = os.path.splitext(model_path)
    check_name = check_name.replace("\\", "/")
    check_name = check_name.split("/")

    model_info = loraprompttool.load_model_info_by_model_path(model_type, model_path)
    
    if not model_info:
        return [model_type_display, "", check_name[-1], model_path, "", "", [libdata.dataframe_empty_row], *get_simple_from_df([libdata.dataframe_empty_row]), "", {}]

    model_sub_type = get_key(model_info, "type", model_type_display)
    model_name = get_key(model_info, "name", check_name[-1])
    model_weight = get_key(model_info, "weight", "")
    model_params = get_key(model_info, "params", "")

    #check is Civitai's JSON
    if "model" in model_info.keys():
        model_sub_type = get_key(model_info, "type", model_info["model"]["type"])
        model_name = model_info["model"]["name"]
        model_weight = get_key(model_info, "weight", model_weight)

    prompt_list = []
    if "prompts" in model_info.keys():
         if model_info["prompts"]:
            if isinstance(model_info["prompts"], str):
                prompt_item = []
                prompt_item.extend(["", model_info["prompts"], "", "Not"])
                prompt_list.append(prompt_item)
            else:
                for prompt in model_info["prompts"]:
                    prompt_item = []
                    prompt_item.extend([
                        get_key(prompt, "title", ""), 
                        prompt["prompt"],
                        get_key(prompt, "categorys", ""),
                        boolean_flag_to_display(get_key(prompt, "neg", ""))])
                    prompt_list.append(prompt_item)
    
    #support for Civitai's JSON
    if "trainedWords" in model_info.keys():
        trainedWords = model_info["trainedWords"]
        if isinstance(trainedWords, str):
            prompt_item = []
            prompt_item.extend(["##Civitai##", trainedWords, "civitai", "Not"])
            prompt_list.append(prompt_item)
        else:
            for word in trainedWords:
                prompt_item = []
                prompt_item.extend(["##Civitai##", word, "civitai", "Not"])
                prompt_list.append(prompt_item)

    if len(prompt_list) <= 0:
        prompt_list = [libdata.dataframe_empty_row]

    return [model_type_display, model_sub_type, model_name, model_path, model_weight, model_params, append_empty(prompt_list), *get_simple_from_df(prompt_list), json.dumps(model_info, indent=4), model_info]


def update_trigger_words(msg):
    """pass model JSON to browser for edit

    Parameters
    ----------
    msg : JSON
        request header.
    """
    util.console.start("load trigger words of model for edit")
    result = ajax_handler.parse_ajax_msg(msg)
    if not result:
        util.console.error("Parsing ajax failed", f"{source_filename}.update_trigger_words")
        return [localization.get_localize_message("Model not loaded."), "", "", "", "", "", [libdata.dataframe_empty_row], ""]
    
    model_type = result["model_type"]
    model_path = result["model_path"]
    gradio_outputs = reload_trigger_words(model_type, model_path)
    util.console.end("load trigger words of model for edit")
    return gradio_outputs

#將提詞加入提詞輸入框
def add_selected_trigger_word(msg):
    """add selected trigger word to prompt textbox.

    Parameters
    ----------
    msg : JSON
        request header.
    """
    result = ajax_handler.parse_ajax_msg(msg)
    if not result:
        util.console.error("Parsing ajax failed", f"{source_filename}.add_selected_trigger_word")
        return ""
    
    txt2img_prompt = result["txt2img_prompt"]
    img2img_prompt = result["img2img_prompt"]
    active_tab_type = result["active_tab_type"]
    addprompt = result["addprompt"]

    overwrite = False
    if "overwrite" in result.keys():
        if flag_to_boolean(result["overwrite"]):
            overwrite = True

    prompt = txt2img_prompt if active_tab_type == "txt2img" else img2img_prompt
    if overwrite:
        prompt = ""

    need_comma = True
    prompt_check = prompt.strip()
    if prompt_check == "":
        need_comma = False
    elif prompt_check[-1] == ",":
        need_comma = False 

    re_pattern_insert = ",\s*,"
    if re.search(re_pattern_insert, prompt):
        new_prompt = re.sub(re_pattern_insert, f",{addprompt} ,", prompt)
    else:
        new_prompt = prompt + (", " if need_comma else "") + addprompt

    result_prompts = [txt2img_prompt, img2img_prompt]
    if active_tab_type == "txt2img":
        result_prompts[0] = new_prompt
    elif active_tab_type == "img2img":
        result_prompts[1] = new_prompt

    # add to prompt
    return result_prompts
