from operator import itemgetter
import json
import gradio as gr
from . import libdata
from . import ajax_action

source_filename = "dataframe_edit"

#fallback unsupport class
my_SelectData = gr.Dataframe
try:
    my_SelectData = gr.SelectData
except Exception:
    pass

def get_select_index(evt: my_SelectData):#
    """get select index from DataFrame

    Parameters
    ----------
    evt : SelectData
        DataFrame select event object

    Returns
    -------
    Tuple[int, int]
        select index in DataFrame
    """
    return evt.index

def load_select_index(select_json):
    """load select index from JSON

    Parameters
    ----------
    select_json : JSON
        select index JSON

    Returns
    -------
    Tuple[int, int]
        select index
    """
    try:
        return json.loads(select_json)
    except Exception as err:
        return [-1, -1]

def add_row(select_json, df):
    """add a row to DataFrame

    Parameters
    ----------
    select_json : JSON
        select index
    df : DataFrame
        DataFrame to add
    """
    prompt_data = df.values.tolist()
    select_index = load_select_index(select_json)
    new_prompt_data = []
    i = 0
    for prompt_item in prompt_data:
        new_prompt_data.append(prompt_item)
        if i == select_index[0]:
            new_prompt_data.append(libdata.dataframe_empty_row)
        i += 1
    if len(new_prompt_data) <= 0:
        new_prompt_data = [libdata.dataframe_empty_row]
    return new_prompt_data

def delete_row(select_json, df):
    """delete a row to DataFrame

    Parameters
    ----------
    select_json : JSON
        select index
    df : DataFrame
        DataFrame to delete
    """
    prompt_data = df.values.tolist()
    select_index = load_select_index(select_json)
    new_prompt_data = []
    i = 0
    for prompt_item in prompt_data:
        if i != select_index[0]:
            new_prompt_data.append(prompt_item)
        i += 1
    if len(new_prompt_data) <= 0:
        new_prompt_data = [libdata.dataframe_empty_row]
    return new_prompt_data

def up_row(select_json, df):
    """Move selected row up one space

    Parameters
    ----------
    select_json : JSON
        select index
    df : DataFrame
        DataFrame to change
    """
    prompt_data = df.values.tolist()
    if len(prompt_data) <= 1:
        return prompt_data
    select_index = load_select_index(select_json)
    if select_index[0] <= 0:
        return prompt_data
    #swap
    tmp_row = prompt_data[select_index[0] - 1]
    prompt_data[select_index[0] - 1] = prompt_data[select_index[0]]
    prompt_data[select_index[0]] = tmp_row
    return prompt_data

def down_row(select_json, df):
    """Move selected row down one space

    Parameters
    ----------
    select_json : JSON
        select index
    df : DataFrame
        DataFrame to change
    """
    prompt_data = df.values.tolist()
    prompt_len = len(prompt_data)
    if prompt_len <= 1:
        return prompt_data
    select_index = load_select_index(select_json)
    if select_index[0] >= prompt_len - 1:
        return prompt_data
    #swap
    tmp_row = prompt_data[select_index[0] + 1]
    prompt_data[select_index[0] + 1] = prompt_data[select_index[0]]
    prompt_data[select_index[0]] = tmp_row
    return prompt_data

def paste_cell(select_json, paste_text, df):
    """Paste text from the clipboard to the selected cell 

    Parameters
    ----------
    select_json : JSON
        select index
    paste_text : JSON
        text to paste
    df : DataFrame
        DataFrame to paste
    """
    prompt_data = df.values.tolist()
    select_index = load_select_index(select_json)
    if select_index[0] < 0:
        return prompt_data
    if paste_text.strip() == "":
        return prompt_data
    prompt_data[select_index[0]][select_index[1]] = paste_text
    return prompt_data

def paste_merge_cell(select_json, paste_text, df):
    """Paste text from the clipboard to the selected cell, if cell not empty, merge it.

    Parameters
    ----------
    select_json : JSON
        select index
    paste_text : JSON
        text to paste
    df : DataFrame
        DataFrame to paste
    """
    prompt_data = df.values.tolist()
    select_index = load_select_index(select_json)
    if select_index[0] < 0:
        return prompt_data
    if paste_text.strip() == "":
        return prompt_data
    prompt = prompt_data[select_index[0]][select_index[1]]
    need_comma = True
    prompt_check = prompt.strip()
    if prompt_check == "":
        need_comma = False
    elif prompt_check[-1] == ",":
        need_comma = False 

    prompt_data[select_index[0]][select_index[1]] = prompt + (", " if need_comma else "") + paste_text
    return prompt_data

def append_empty(df):
    try:
        prompt_data = df.values.tolist()
    except:
        prompt_data = df
    if len(prompt_data) <= 0:
        return prompt_data
    if ("").join(prompt_data[-1]).strip() != "":
        prompt_data.append(["" for x in prompt_data[-1]])
    return prompt_data

def get_simple_from_df(df):
    try:
        prompt_data = df.values.tolist()
    except:
        prompt_data = df
    main_name : str = ""
    main_trigger : str = ""
    has_extra = False
    extra_name : str = ""
    extra_trigger : str = ""
    has_neg = False
    neg_name : str = ""
    neg_trigger : str = ""
    i = 0
    for prompt_item in prompt_data:
        if libdata.DEFAULT_KEY in [x.strip() for x in prompt_item[2].split(",")]:
            if i == 0:
                main_name = str(prompt_item[0])
                main_trigger = str(prompt_item[1])
            elif i == 1:
                has_extra = True
                extra_name = str(prompt_item[0])
                extra_trigger = str(prompt_item[1])
            else:
                if ajax_action.flag_to_boolean(prompt_item[3]):
                    if not has_neg:
                        has_neg = True
                        neg_name = str(prompt_item[0])
                        neg_trigger = str(prompt_item[1])
            i += 1
    return main_name, main_trigger, has_extra, extra_name, extra_trigger, has_neg, neg_name, neg_trigger

def save_to_dataframe(df, main_name, main_trigger, has_extra, extra_name, extra_trigger, has_neg, neg_name, neg_trigger):
    try:
        prompt_data = df.values.tolist()
    except:
        prompt_data = df
    insert_data = []
    if main_trigger.strip() != "":
        insert_data.append([main_name, main_trigger, libdata.DEFAULT_KEY, "Not"])
    if has_extra and extra_trigger.strip() != "":
        insert_data.append([extra_name, extra_trigger, libdata.DEFAULT_KEY, "Not"])
    if has_neg and neg_trigger.strip() != "":
        insert_data.append([neg_name, neg_trigger, libdata.DEFAULT_KEY, "Yes"])
    new_prompt_data = []
    if len(insert_data) > 0:
        i=0
        for prompt_item in prompt_data:
            if libdata.DEFAULT_KEY in [x.strip() for x in prompt_item[2].split(",")]:
                if i < len(insert_data):
                    new_prompt_data.append(insert_data[i])
                i += 1
            else:
                if prompt_item[0].strip() != "" and prompt_item[1].strip() != "":
                    new_prompt_data.append(prompt_item)
        while i < len(insert_data):
            new_prompt_data.append(insert_data[i])
            i += 1
    else:
        return prompt_data

    return new_prompt_data

def sort_by_title(order, df):
    """Sort the data in the DataFrame according to the title

    Parameters
    ----------
    order
        Sort order
    df : DataFrame
        DataFrame to sort
    """
    prompt_data = df.values.tolist()
    if order == libdata.SortOrder.DESC.value:
        return sorted(prompt_data, key=itemgetter(0,1), reverse=True)
    return sorted(prompt_data, key=itemgetter(0,1))

def sort_by_prompt(order, df):
    """Sort the data in the DataFrame according to the prompt

    Parameters
    ----------
    order
        Sort order
    df : DataFrame
        DataFrame to sort
    """
    prompt_data = df.values.tolist()
    if order == libdata.SortOrder.DESC.value:
        return sorted(prompt_data, key=itemgetter(1,0), reverse=True)
    return sorted(prompt_data, key=itemgetter(1,0))

def load_prompt_from_textbox(input_text: str, df):
    """load prompts line by line into DataFrame

    Parameters
    ----------
    input_text
        input
    df : DataFrame
        DataFrame to load into
    """
    prompt_data = df.values.tolist()
    if input_text.strip() == "":
        return prompt_data
    lines = input_text.splitlines()
    for line in lines:
        if line.strip() != "":
            prompt_data.append(["",line,""])
    return prompt_data

def remove_duplicate_prompt(df):
    """Remove duplicate prompt from DataFrame

    Parameters
    ----------
    df : DataFrame
        DataFrame to change
    """
    prompt_data = df.values.tolist()
    new_prompt_data = []
    for prompt_item in prompt_data:
        has_same = False
        prompt_title = prompt_item[0]
        prompt_prompt = prompt_item[1]
        for check_prompt_item in new_prompt_data:
            check_prompt_title = check_prompt_item[0]
            check_prompt_prompt = check_prompt_item[1]
            if check_prompt_title == prompt_title and \
                check_prompt_prompt == prompt_prompt and\
                prompt_prompt != "":
                has_same = True
                break
        if not has_same:
            new_prompt_data.append(prompt_item)
    if len(new_prompt_data) <= 0:
        new_prompt_data = [libdata.dataframe_empty_row]
    return new_prompt_data

def remove_empty_prompt(df):
    """Remove empty prompt from DataFrame

    Parameters
    ----------
    df : DataFrame
        DataFrame to change
    """
    prompt_data = df.values.tolist()
    new_prompt_data = []
    for prompt_item in prompt_data:
        prompt_prompt = prompt_item[1].strip()
        if prompt_prompt != "":
            new_prompt_data.append(prompt_item)
    if len(new_prompt_data) <= 0:
        new_prompt_data = [libdata.dataframe_empty_row]
    return new_prompt_data