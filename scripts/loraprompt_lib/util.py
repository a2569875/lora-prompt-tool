import os
import io
import hashlib
from . import extension_data
from . import setting

source_filename = "util"

#習慣用console.log就宣告一個console.log來用...
class Console:
    """
    A class used to output the extension message to console

    Attributes
    ----------
    package_name : str
        extension name.

    Methods
    -------
    log(msg : str)
        outputs a message to the python console.
    """
    def __init__(self, package_name : str):
        """
        Parameters
        ----------
        package_name : str
            set extension name.
        """
        self.package_name = package_name
        self.debug_enabled = True

    def log(self, msg):
        """outputs a message to the python console.

        Parameters
        ----------
        msg : any
            message to output.
        """
        print(f"[{self.package_name}] {msg}")

    def error(self, msg, func=None):
        """outputs a error message to the python console.

        Parameters
        ----------
        msg : any
            message to output.
        """
        self.log(f" [Error] {msg}" + ("" if func is None else f", in {func}"))

    def debug(self, msg):
        """outputs a debug message to the python console.

        Parameters
        ----------
        msg : any
            message to output.
        """
        if self.debug_enabled:
            self.log(f" [Debug] {msg}")

    def start(self, process):
        """outputs a process start message to the python console.

        Parameters
        ----------
        process : any
            process name.
        """
        self.debug(f"start process : {process}")

    def end(self, process):
        """outputs a process end message to the python console.

        Parameters
        ----------
        process : any
            process name.
        """
        self.debug(f"end process : {process}")

console = Console(extension_data.extension_name)

def set_debug_logging_state(value):
    setting.set_setting('debug', value)
    console.debug_enabled = value

def load_json_number(input) -> float:
    """a safe way to load a jumber from JSON

    Parameters
    ----------
    input : any
        item from JSON object

    Returns
    -------
    float
        a float value equivalent to JSON object
    """
    try:
        return float(str(input))
    except Exception:
        return 0

def read_chunks(file, size=io.DEFAULT_BUFFER_SIZE):
    """Yield pieces of data from a file-like object until EOF."""
    while True:
        chunk = file.read(size)
        if not chunk:
            break
        yield chunk

def get_subfolders(folder:str) -> list:
    """get subfolder list

    Parameters
    ----------
    folder : str
        The directory to look for subdirectories

    Returns
    -------
    list
        list of subdirectories
    """
    console.debug("Get subfolder for: " + folder)
    if not folder:
        console.error("folder can not be None", f"{source_filename}.get_subfolders")
        return
    
    if not os.path.isdir(folder):
        console.error("path is not a folder", f"{source_filename}.get_subfolders")
        return
    
    prefix_len = len(folder)
    subfolders = []
    for root, dirs, files in os.walk(folder, followlinks=True):
        for dir in dirs:
            full_dir_path = os.path.join(root, dir)
            # get subfolder path from it
            subfolder = full_dir_path[prefix_len:]
            subfolders.append(subfolder)

    return subfolders

def get_relative_path(item_path:str, parent_path:str) -> str:
    """get relative path

    Parameters
    ----------
    item_path : str
        relative path to get
    parent_path : str
        relative to parent path

    Returns
    -------
    path
        the result path
    """
    if not item_path:
        return ""
    if not parent_path:
        return ""
    if not item_path.startswith(parent_path):
        return item_path

    relative = item_path[len(parent_path):]
    if relative[:1] == "/" or relative[:1] == "\\":
        relative = relative[1:]

    return relative

def gen_file_sha256(filname) -> str:
    """get relative path

    Parameters
    ----------
    filname : path
        path to the file for sha256 calculation

    Returns
    -------
    str
        sha256 result
    """
    blocksize=1 << 20
    h = hashlib.sha256()
    length = 0
    with open(os.path.realpath(filname), 'rb') as f:
        for block in read_chunks(f, size=blocksize):
            length += len(block)
            h.update(block)

    hash_value =  h.hexdigest()
    return hash_value