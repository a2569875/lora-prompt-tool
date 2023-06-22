import modules.scripts as scripts
from modules import shared as ws
import os
from enum import Enum

source_filename = "libdata"

# root path
root_path = os.getcwd()
script_path = os.sep.join(__file__.split(os.sep)[0:-5]) if root_path is None else root_path
models_path = os.path.join(script_path, "models")
dreambooth_models_path = os.path.join(models_path, "dreambooth")
try:
    dreambooth_models_path = ws.cmd_opts.dreambooth_models_path or dreambooth_models_path
except:
    pass

DEFAULT_KEY = "##default##"

# extension path
extension_path = scripts.basedir()

setting_file_name = "setting.json"
dreambooth_setting_file_name = "db_config.json"

up_symbol = '\u2b06\ufe0f' #⬆️
down_symbol ='\u2b07\ufe0f' #⬇️
delete_symbol = '\u274c' #❌
add_symbol = '\u2795' #➕
paste_symbol ='\U0001F4CB\u200B' #📋
copy_symbol = '\U0001F4DA' #📚
paste_append_symbol = '\U0001F4DD' #📝
refresh_symbol = '\U0001f504'  # 🔄

folders = {
    "ti": os.path.join(root_path, "embeddings"),
    "hyper": os.path.join(root_path, "models", "hypernetworks"),
    "ckp": os.path.join(root_path, "models", "Stable-diffusion"),
    "lora": os.path.join(root_path, "models", "Lora"),
    "lyco": os.path.join(root_path, "models", "LyCORIS"),
}

exts = (".bin", ".pt", ".safetensors", ".ckpt")
info_ext = [".json", ".info", ".civitai.info"]
vae_suffix = ".vae"

http_state_codes = {
    100 : "Continue",101 : "Switching Protocols",102 : "Processing",103 : "Early Hints",
    110 : "Response is Stale",111 : "Revalidation Failed",112 : "Disconnected Operation",113 : "Heuristic Expiration",
    199 : "Miscellaneous Warning",
    200 : "OK",201 : "Created",202 : "Accepted",203 : "Non-Authoritative Information",204 : "No Content",205 : "Reset Content",206 : "Partial Content",207 : "Multi-Status",208 : "Already Reported",
    214 : "Transformation Applied",226 : "IM Used",299 : "Miscellaneous Persistent Warning",
    300 : "Multiple Choices",301 : "Moved Permanently",302 : "Found",303 : "See Other",304 : "Not Modified",305 : "Use Proxy",306 : "Switch Proxy",307 : "Temporary Redirect",308 : "Permanent Redirect",
    400 : "Bad Request",401 : "Unauthorized",402 : "Payment Required",403 : "Forbidden",404 : "Not Found",405 : "Method Not Allowed",406 : "Not Acceptable",407 : "Proxy Authentication Required",408 : "Request Timeout",409 : "Conflict",
    410 : "Gone",411 : "Length Required",412 : "Precondition Failed",413 : "Request Entity Too Large",414 : "Request-URI Too Long",415 : "Unsupported Media Type",416 : "Requested Range Not Satisfiable",417 : "Expectation Failed",418 : "I'm a teapot",419 : "Page Expired",
    420 : "Method Failure/Enhance Your Calm",421 : "Misdirected Request",422 : "Unprocessable Entity",423 : "Locked",424 : "Failed Dependency",425 : "Too Early",426 : "Upgrade Required",428 : "Precondition Required",429 : "Too Many Requests",
    430 : "Request Header Fields Too Large",431 : "Request Header Fields Too Large",
    440 : "Login Time-out",444 : "No Response",449 : "Retry With",450 : "Blocked by Windows Parental Controls",451 : "Unavailable For Legal Reasons/Redirect",
    460 : "Client closed the connection with the load balancer before the idle timeout period elapsed",463 : "The load balancer received an X-Forwarded-For request header with more than 30 IP addresses",
    494 : "Request Header Too Large",495 : "SSL Certificate Error",496 : "SSL Certificate Required",497 : "HTTP Request Sent to HTTPS Port",498 : "Invalid Token",499 : "Client Closed Request/Token Required",
    500 : "Internal Server Error",501 : "Not Implemented",502 : "Bad Gateway",503 : "Service Unavailable",504 : "Gateway Timeout",505 : "HTTP Version Not Supported",506 : "Variant Also Negotiates",507 : "Insufficient Storage",508 : "Loop Detected",509 : "Bandwidth Limit Exceeded",
    510 : "Not Extended",511 : "Network Authentication Required",520 : "Web Server Returned an Unknown Error",521 : "Web Server Is Down",522 : "Connection Timed Out",523 : "Origin Is Unreachable",524 : "A Timeout Occurred",525 : "SSL Handshake Failed",526 : "Invalid SSL Certificate",527 : "Railgun Error",529 : "Site is overloaded",
    530 : "Site is frozen",561 : "Unauthorized",598 : "(Informal convention) Network read timeout error",599 : "Network Connect Timeout Error",
}

def_headers = {'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'}
proxies = None

class SortOrder(Enum):
    ASC = 'Ascending'
    DESC = 'Descending'

# action list
ajax_actions = ( "open_url", 
                 "add_selected_trigger_word", 
                 "show_trigger_words", 
                 "update_trigger_words",
                 "cors_request"
            )
py_actions = ("open_url")

model_type_dict = {
    "Checkpoint": "ckp",
    "TextualInversion": "ti",
    "Hypernetwork": "hyper",
    "LORA": "lora",
    "LoCon": "lora",
    "LyCORIS": "lyco",
}

model_type_names = {
    "ckp": "Checkpoint",
    "ti": "TextualInversion",
    "hyper": "Hypernetwork",
    "lora": "LORA",
    "lyco": "LyCORIS",
}

civitai_apis = {
    "modelPage":"https://civitai.com/models/",
    "modelId": "https://civitai.com/api/v1/models/",
    "modelVersionId": "https://civitai.com/api/v1/model-versions/",
    "hash": "https://civitai.com/api/v1/model-versions/by-hash/"
}

dataframe_empty_row = ["","","",""]

def noop_func():
    return