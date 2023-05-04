(function(){

function module_init() {
    console.log("[lora-prompt-tool] load settings module");

    lorahelper.settings = {};

    function get_boolean(ele_id){
        const element = lorahelper.gradioApp().querySelector(`#${ele_id} input`);
        if(lorahelper.is_nullptr(element)) return false;
        if(lorahelper.is_nullptr(element.checked)) return false;
        return !!element.checked;
    }
    
    lorahelper.settings.is_debug = ()=>get_boolean("lorahelp_js_debug_logging");
    lorahelper.settings.touch_mode = ()=>get_boolean("lorahelp_js_touch_mode");
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