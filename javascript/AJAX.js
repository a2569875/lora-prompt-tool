(function(){

function module_init() {
    console.log("[lora-prompt-tool] load AJAX module");
    lorahelper.lorahelp_js_ajax_txtbox_textarea = null;
    lorahelper.lorahelp_js_ajax_txtbox_callback = function() {
        lorahelper.debug('lorahelp_js_ajax_txtbox_callback callback');
    }
    lorahelper.call_lorahelp_js_ajax_txtbox_callback = function(){
        lorahelper.lorahelp_js_ajax_txtbox_callback();
    }
    
    function build_cors_request(url){
        return new Promise((resolve, reject) => {
            new myAJAX({
                "action": "cors_request",
                "url": url
            }, lorahelper.js_cors_request_btn).then(response_message => {
                const response_json = JSON.parse(response_message);
                if(response_json.status === "error"){
                    reject(response_json.message);
                }
                resolve(response_json.message);
            }).error(error => {
                throw new Error("Request failed");
            }).sent();
        });
    }

    function readFile(filePath) {
        let request = new XMLHttpRequest();
        request.open("GET", `file=${filePath}`, false);
        request.send(null);
        return request.responseText;
      }
    
    // Options for the observer (which mutations to observe)
    var lorahelp_js_ajax_txtbox_observer_config = { attributes: true, childList: true, subtree: true };
    var lorahelp_js_ajax_txtbox_observer_value_check = "";
    // Create an observer instance linked to the callback function
    var lorahelp_js_ajax_txtbox_observer = new MutationObserver(lorahelper.call_lorahelp_js_ajax_txtbox_callback);
    
    //ajax queue
    let ajax_list = []
    let ajax_state = "ready";
    function update_myAJAX(){
        if(ajax_state == "running"){
            return;
        }
        if (ajax_list.length > 0){
            let req = ajax_list[0];
            req.sentAJAX();
        }
    }
    
    function remove_ajax_queue_item(self){
        for(let i=0; i<ajax_list.length; ++i){
            if(ajax_list[i] === self){
                ajax_list.splice(i, 1);
                break;
            }
        }
    }
    
    function myAJAX(msg, trigger){
        this.message = msg;
        this.trigger = trigger;
        this.then_not_set = true;
        this.then_func = lorahelper.noop_func;
        this.error_func = lorahelper.noop_func;
        this.timeout = 6000;
    }
    
    myAJAX.prototype.then = function(then_func) {
        this.then_func = then_func;
        this.then_not_set = false;
        return this;
    }
    
    myAJAX.prototype.error = function(error_func) {
        this.error_func = error_func;
        return this;
    }
    
    myAJAX.prototype.sentAJAX = function(){
        if(ajax_state == "running"){
            return;
        }
        ajax_state = "running";
        // fill to msg box
        send_lorahelp_py_ajax(this.message);
        if(!this.then_not_set){
            lorahelp_js_ajax_txtbox_observer_value_check = lorahelper.lorahelp_js_ajax_txtbox_textarea.value;
            this.timeout_id = window.setTimeout((function(self) {return function() {
                lorahelp_js_ajax_txtbox_observer.disconnect();
                lorahelper.lorahelp_js_ajax_txtbox_callback = function() {
                    lorahelper.debug('lorahelp_js_ajax_txtbox_callback callback');
                }
                self.error_func("timeout");
                remove_ajax_queue_item(self);
                ajax_state = "ready";
                update_myAJAX();
            }; })(this), this.timeout);
            lorahelper.lorahelp_js_ajax_txtbox_callback = (function(self) {return function() {
                if(lorahelper.lorahelp_js_ajax_txtbox_textarea.value == lorahelp_js_ajax_txtbox_observer_value_check){
                    return;
                }
                window.clearTimeout(self.timeout_id);
                lorahelp_js_ajax_txtbox_observer.disconnect();
                lorahelper.lorahelp_js_ajax_txtbox_callback = function() {
                    lorahelper.debug('lorahelp_js_ajax_txtbox_callback callback');
                }
                self.then_func(lorahelper.lorahelp_js_ajax_txtbox_textarea.value);
                remove_ajax_queue_item(self);
                ajax_state = "ready";
                update_myAJAX();
            }; })(this);
            lorahelp_js_ajax_txtbox_observer.observe(lorahelper.lorahelp_js_ajax_txtbox_textarea, lorahelp_js_ajax_txtbox_observer_config);
        }
        this.trigger.click();
        if(this.then_not_set){
            remove_ajax_queue_item(this);
            ajax_state = "ready";
            update_myAJAX();
        }
    }
    
    myAJAX.prototype.sent = function(){
        ajax_list.push(this);
        update_myAJAX();
    }
    
    function my_dispatchEvent(ele,eve){
        try {
            ele.dispatchEvent(eve);
        } catch (error) {
            
        }
    }
    
    function send_lorahelp_py_ajax(msg){
        lorahelper.debug("run send_lorahelp_py_ajax");
        let js_ajax_txtbox = lorahelper.gradioApp().querySelector("#lorahelp_js_ajax_txtbox textarea");
        if (js_ajax_txtbox && msg) {
            // fill to msg box
            update_inputbox(js_ajax_txtbox, JSON.stringify(msg));
            //js_ajax_txtbox.dispatchEvent(new Event("input"));
        }
    
    }
    
    function update_inputbox(textbox, text){
        textbox.value = text;
        my_dispatchEvent(textbox, new Event("input", {
            bubbles: true,
            cancelable: true,
        }));
    }
    
    function get_lorahelp_py_ajax(){
        lorahelper.debug("run get_lorahelp_py_ajax");
        const py_ajax_txtbox = lorahelper.gradioApp().querySelector("#lorahelp_py_ajax_txtbox textarea");
        if (py_ajax_txtbox && py_ajax_txtbox.value) {
            lorahelper.debug("find py_ajax_txtbox");
            lorahelper.debug("py_ajax_txtbox value: ");
            lorahelper.debug(py_ajax_txtbox.value);
            return py_ajax_txtbox.value
        } else {
            return ""
        }
    }
    
    const get_new_lorahelp_py_ajax = (max_count=3) => new Promise((resolve, reject) => {
        lorahelper.debug("run get_new_lorahelp_py_ajax");
    
        let count = 0;
        let new_ajax = "";
        let find_ajax = false;
        const interval = setInterval(() => {
            const py_ajax_txtbox = lorahelper.gradioApp().querySelector("#lorahelp_py_ajax_txtbox textarea");
            count++;
    
            if (py_ajax_txtbox && py_ajax_txtbox.value) {
                lorahelper.debug("find py_ajax_txtbox");
                lorahelper.debug("py_ajax_txtbox value: ");
                lorahelper.debug(py_ajax_txtbox.value);
    
                new_ajax = py_ajax_txtbox.value
                if (new_ajax != "") {
                    find_ajax=true
                }
            }
    
            if (find_ajax) {
                //clear msg in both sides
                update_inputbox(py_ajax_txtbox, "");
                //py_ajax_txtbox.dispatchEvent(new Event("input"));
    
                resolve(new_ajax);
                clearInterval(interval);
            } else if (count > max_count) {
                //clear msg in both sides
                update_inputbox(py_ajax_txtbox, "");
                //py_ajax_txtbox.dispatchEvent(new Event("input"));
    
                reject('');
                clearInterval(interval);
            }
    
        }, 1000);
    })

    lorahelper.build_cors_request = build_cors_request;
    lorahelper.readFile = readFile;
    lorahelper.myAJAX = myAJAX;
    lorahelper.my_dispatchEvent = my_dispatchEvent;
    lorahelper.update_inputbox = update_inputbox;
}
let module_loadded = false;
document.addEventListener("DOMContentLoaded", () => {
    if (module_loadded) return;
    module_loadded = true;
    module_init();
});
document.addEventListener("load", () => {
    if (module_loadded) return;
    module_loadded = true;
    module_init();
});
})();

