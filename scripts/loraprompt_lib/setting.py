import os
import json
from . import libdata

source_filename = "setting"

data = {
    "debug": False,
    "touch_mode": False
}
default_setting = {
    "debug": False,
    "touch_mode": False
}

def load_setting():
    global data
    setting_data = None
    try:
        with open(os.path.realpath(os.path.join(libdata.extension_path, libdata.setting_file_name)), 'r') as f:
            try:
                setting_data = json.load(f)
            except Exception as e:
                return
    except Exception as e1:
        return
    if not setting_data:
        return
    data = setting_data

def save_setting():
    try:
        with open(os.path.realpath(os.path.join(libdata.extension_path, libdata.setting_file_name)), 'w') as f:
            f.write(json.dumps(data, indent=4))
    except Exception as e1:
        return

def get_setting(key):
    if key in data.keys():
        return data[key]
    return default_setting[key]

def set_setting(key, value):
    global data
    data[key] = value

def set_touch_mode(value):
    set_setting('touch_mode', value)