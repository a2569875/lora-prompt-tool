import os
import re
import json
from . import util
from . import libdata
from modules import shared

source_filename = "model"

def get_db_models():
    rgx = re.compile(r"\[.*\]")
    output = [""]
    try:
        out_dir = libdata.dreambooth_models_path
        if os.path.exists(out_dir):
            for item in os.listdir(out_dir):
                check_path = os.path.join(out_dir, item)
                if os.path.isdir(check_path) and not rgx.search(item):
                    json_path = os.path.join(check_path, libdata.dreambooth_setting_file_name)
                    if not os.path.isfile(json_path):
                        continue
                    output.append(item)
    except Exception:
        pass
    return output

def get_db_model_setting(model_name):
    try:
        model_path = os.path.join(libdata.dreambooth_models_path, model_name, libdata.dreambooth_setting_file_name)
        return load_model_info(model_path)
    except Exception as e1:
        return

def get_custom_model_folder():
    """load model folder by user setting"""
    util.console.log("Get Custom Model Folder")

    if shared.cmd_opts.embeddings_dir and os.path.isdir(shared.cmd_opts.embeddings_dir):
        libdata.folders["ti"] = shared.cmd_opts.embeddings_dir

    if shared.cmd_opts.hypernetwork_dir and os.path.isdir(shared.cmd_opts.hypernetwork_dir):
        libdata.folders["hyper"] = shared.cmd_opts.hypernetwork_dir

    if shared.cmd_opts.ckpt_dir and os.path.isdir(shared.cmd_opts.ckpt_dir):
        libdata.folders["ckp"] = shared.cmd_opts.ckpt_dir

    if hasattr(shared.cmd_opts, "lora_dir"):
        if shared.cmd_opts.lora_dir and os.path.isdir(shared.cmd_opts.lora_dir):
            libdata.folders["lora"] = shared.cmd_opts.lora_dir

    if hasattr(shared.cmd_opts, "lyco_dir"):
        if shared.cmd_opts.lyco_dir and os.path.isdir(shared.cmd_opts.lyco_dir):
            libdata.folders["lyco"] = shared.cmd_opts.lyco_dir

def write_model_info(path, model_info):
    """write model JSON data

    Parameters
    ----------
    path
        file path to write
    model_info
        data to write
    """
    util.console.log("Write model info to file: " + path)
    with open(os.path.realpath(path), 'w') as f:
        f.write(json.dumps(model_info, indent=4))


def load_model_info(path):
    """load model JSON data

    Parameters
    ----------
    path
        file path to load
        
    Returns
    -------
    JSON
        loadded JSON data
    """
    model_info = None
    try:
        with open(os.path.realpath(path), 'r') as f:
            try:
                model_info = json.load(f)
            except Exception as e:
                util.console.error("Selected file is not json: " + path, f"{source_filename}.load_model_info")
                util.console.log(e)
                return
    except Exception as e1:
        util.console.error("file not found: " + path, f"{source_filename}.load_model_info")
        return
    return model_info

