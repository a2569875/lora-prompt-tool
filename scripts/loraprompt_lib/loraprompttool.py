import os
import requests
from . import libdata
from . import util
from . import model
from . import localization

source_filename = "loraprompttool"

def load_model_bundle_model_path(model_type, model_path):
    """load model bundle embeding by model path

    Parameters
    ----------
    model_type
        model type, you can choose between Checkpoint, TextualInversion, Hypernetwork and LORA
    model_path
        model path
        
    Returns
    -------
    JSON
        a set contains model bundle embeding
    """
    util.console.debug(f"Load model bundle embeding of {model_path} in {model_type}")
    if model_type not in libdata.folders.keys():
        util.console.error("unknow model type: " + model_type, f"{source_filename}.load_model_info_by_model_path")
        return
    
    base, ext = os.path.splitext(model_path)
    model_info_base = base
    if base[:1] == "/":
        model_info_base = base[1:]

    model_folder = libdata.folders[model_type]
    model_safetensor = f"{model_info_base}.safetensors"
    model_safetensor_path = os.path.join(model_folder, model_safetensor)
    enb_names = set()
    if os.path.isfile(model_safetensor_path):
        import torch
        import safetensors
        with safetensors.safe_open(model_safetensor_path, framework="pt", device="cpu") as f:
            for key in f.keys():
                if key.split(".", 1)[0] == 'bundle_emb':
                    enb_names.add(key.split(".")[1])
    return enb_names


def load_model_info_by_model_path(model_type, model_path):
    """load model information JSON file by model path

    Parameters
    ----------
    model_type
        model type, you can choose between Checkpoint, TextualInversion, Hypernetwork and LORA
    model_path
        model path
        
    Returns
    -------
    JSON
        model information JSON file content
    """
    util.console.debug(f"Load model info of {model_path} in {model_type}")
    if model_type not in libdata.folders.keys():
        util.console.error("unknow model type: " + model_type, f"{source_filename}.load_model_info_by_model_path")
        return
    
    # model_path = subfolderpath + model name + ext. And it always start with a / even there is no sub folder
    base, ext = os.path.splitext(model_path)
    model_info_base = base
    if base[:1] == "/":
        model_info_base = base[1:]

    finded_file = False
    first_path = ""
    model_info_filepath = ""
    model_folder = libdata.folders[model_type]
    for info_ext in libdata.info_ext:
        if finded_file:
            break
        model_info_filename = model_info_base + info_ext
        model_info_filepath = os.path.join(model_folder, model_info_filename)
        if first_path == "":
            first_path = model_info_filepath
        if not os.path.isfile(model_info_filepath):
            continue
        finded_file = True
    if not finded_file:
        util.console.log("Can not find model info file: " + first_path)
        return
    if model_info_filepath == "":
        util.console.error("Error load info file!", f"{source_filename}.load_model_info_by_model_path")
        return
    return model.load_model_info(model_info_filepath)

def check_model_state(model_info):
    if model_info is None:
        return "empty"
    if "loading state" in model_info.keys():
        return model_info["loading state"]
    return "ok"

def get_model_error_message(model_info):
    model_state = check_model_state(model_info)
    if model_state == "ok":
        return localization.get_localize_message("Load Successful")
    elif model_state == "error":
        if "message" in model_info.keys():
            if model_info["message"] == "HTTP ERROR":
                status_code = int(model_info["status code"])
                return localization.get_localize_message("HTTP ERROR") + " : " +\
                    status_code + " " +\
                    localization.get_localize_message(libdata.http_state_codes[status_code])
            if model_info["message"] == "fail to load data":
                return localization.get_localize_message(model_info["message"]) + "\n" +\
                    localization.get_localize_message("response") + ":\n" +\
                    model_info["response"]
            return localization.get_localize_message(model_info["message"])
        return localization.get_localize_message("Error")
    return localization.get_localize_message("unknown")

def sent_cors_request(url):
    r : requests.Response
    try:
        r = requests.get(url, headers=libdata.def_headers, proxies=libdata.proxies)
    except Exception as e:
        return {
            "loading state":"error",
            "message": "error, Can not connect to url."
        }
    if not r.ok:
        util.console.error("Get error code: " + str(r.status_code), f"{source_filename}.sent_cors_request")
        util.console.log(r.text)
        return {
            "loading state":"error",
            "message": "HTTP ERROR",
            "status code": r.status_code
        }
    return {
        "loading state":"ok",
        "message": r.text
    }

def get_model_info_by_hash(hash:str):
    """using the model hash to find model information, this will connect to civitAI

    Parameters
    ----------
    hash : str
        the model hash

    Returns
    -------
    JSON
        model information JSON file content
    """
    if not hash:
        util.console.error("hash is empty", f"{source_filename}.get_model_info_by_hash")
        return {
            "loading state":"error",
            "message": "hash calculate failed"
        }
    r : requests.Response
    try:
        r = requests.get(libdata.civitai_apis["hash"]+hash, headers=libdata.def_headers, proxies=libdata.proxies)
    except Exception as e:
        return {
            "loading state":"error",
            "message": "error, Can not connect to CivitAI."
        }
    if not r.ok:
        if r.status_code == 404:
            # this is not a civitai model
            util.console.log("Civitai does not have this model")
            return {
                "loading state":"error",
                "message": "CivitAI does not have this model, or it has been taken down."
            }
        else:
            util.console.error("Get error code: " + str(r.status_code), f"{source_filename}.get_model_info_by_hash")
            util.console.log(r.text)
            return {
                "loading state":"error",
                "message": "HTTP ERROR",
                "status code": r.status_code
            }

    # try to get content
    content = None
    try:
        content = r.json()
    except Exception as e:
        util.console.error("Parse response json failed", f"{source_filename}.get_model_info_by_hash")
        util.console.log(str(e))
        util.console.log("response:")
        util.console.log(r.text)
        return {
            "loading state":"error",
            "message": "fail to load data",
            "response": r.text
        }
    
    if not content:
        util.console.error("error, content from civitai is None", f"{source_filename}.get_model_info_by_hash")
        return {
            "loading state":"error",
            "message": "error, content from CivitAI is None"
        }
    
    return content

def load_model_info_from_Civitai(model_type, model_path):
    """load model information from CivitAI

    Parameters
    ----------
    model_type
        model type, you can choose between Checkpoint, TextualInversion, Hypernetwork and LORA
    model_path
        model path

    Returns
    -------
    JSON
        model information JSON file content
    """
    util.console.debug(f"Load model info of {model_path} in {model_type}")
    if model_type not in libdata.folders.keys():
        util.console.error("unknow model type: " + model_type, f"{source_filename}.load_model_info_from_Civitai")
        return

    model_exts = ("",)
    if f"{model_path}".find(".") < 0:
        model_exts = libdata.exts

    model_base = model_path
    if model_path[:1] == "/" or model_path[:1] == "\\":
        model_base = model_path[1:]

    first_model_filename = None
    model_folder = libdata.folders[model_type]
    for ext in model_exts:
        model_filename = model_base
        model_filepath = os.path.join(model_folder, model_filename) + ext
        if first_model_filename is None:
            first_model_filename = os.path.join(model_folder, model_filename)
        if not os.path.isfile(model_filepath):
            continue
        break
    if not os.path.isfile(model_filepath):
        util.console.debug("Can not find model file: " + first_model_filename)
        return
    hash = util.gen_file_sha256(model_filepath)
    return get_model_info_by_hash(hash)


def save_model_info_by_model_path(model_info, model_type, model_path):
    """save model information JSON file by model path

    Parameters
    ----------
    model_type
        model type, you can choose between Checkpoint, TextualInversion, Hypernetwork and LORA
    model_path
        model path
    """
    util.console.debug(f"Write model info of {model_path} in {model_type}")
    if model_type not in libdata.folders.keys():
        util.console.error("unknow model type: " + model_type, f"{source_filename}.save_model_info_by_model_path")
        return
    
    # model_path = subfolderpath + model name + ext. And it always start with a / even there is no sub folder
    base, ext = os.path.splitext(model_path)
    model_info_base = base
    if base[:1] == "/" or base[:1] == "\\":
        model_info_base = base[1:]

    finded_file = False
    not_file = False
    first_path = ""
    model_info_filepath = ""
    model_folder = libdata.folders[model_type]
    for info_ext in libdata.info_ext:
        if finded_file:
            break
        not_file = False
        model_info_filename = model_info_base + info_ext
        model_info_filepath = os.path.join(model_folder, model_info_filename)
        if first_path == "":
            first_path = model_info_filepath
        if os.path.exists(model_info_filepath):
            if not os.path.isfile(model_info_filepath):
                not_file = True
                continue
            finded_file = True
    if not_file:
        util.console.error("not a file: " + first_path, f"{source_filename}.save_model_info_by_model_path")
        return
    if not finded_file:
        model_info_filepath = first_path
    model.write_model_info(model_info_filepath, model_info)