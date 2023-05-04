import json
from . import libdata
from . import util

source_filename = "ajax_handler"

#模擬AJAX。前端 -> 後端
def parse_ajax_msg(msg):
    """parse message from browser

    Parameters
    ----------
    msg : JSON
        requset message

    Returns
    -------
    JSON
        parsed result
    """
    try:
        msg_dict = json.loads(msg)
    except Exception as err:
        util.console.error(err, f"{source_filename}.parse_ajax_msg")
        util.console.log("Error load Json!")
        return

    # in case client side run JSON.stringify twice
    if (type(msg_dict) == str):
        msg_dict = json.loads(msg_dict)

    if "action" not in msg_dict.keys():
        util.console.error("Can not find action from js request", f"{source_filename}.parse_ajax_msg")
        return

    action = msg_dict["action"]
    if not action:
        util.console.error("Action from js request is None", f"{source_filename}.parse_ajax_msg")
        return

    if action not in libdata.ajax_actions:
        util.console.error("Unknow action: " + action, f"{source_filename}.parse_ajax_msg")
        return

    return msg_dict

#模擬AJAX。後端 -> 前端
def build_py_msg(action:str, content:dict):
    """sent message to browser

    Parameters
    ----------
    action : str
        requset header
    content : dict
        requset content

    Returns
    -------
    JSON
        message to sent
    """
    util.console.start("build_py_msg")
    if not content:
        util.console.error("Content is None", f"{source_filename}.build_py_msg")
        return
    
    if not action:
        util.console.error("Action is None", f"{source_filename}.build_py_msg")
        return

    if action not in libdata.py_actions:
        util.console.error("Unknow action: " + action, f"{source_filename}.build_py_msg")
        return

    msg = {
        "action" : action,
        "content": content
    }

    util.console.end("build_py_msg")
    return json.dumps(msg)