
(function(){

function module_init() {
    
    console.log("[lora-prompt-tool] load gradio UI Control module");
    function switch_to_helper_tab(){
        let tabs = lorahelper.gradioApp().querySelector('#tabs').querySelectorAll('button');
        let target_tab_name = lorahelper.my_getTranslation("LoRA prompt helper");
        if (!target_tab_name) {
            target_tab_name = "LoRA prompt helper";
        }
        let complete_flag = false;
        let tab_name = "";
        for (const tab of tabs) {
            tab_name = tab.innerHTML;
            if(tab_name.trim().indexOf(target_tab_name.trim()) > -1){
                tab.click();
                complete_flag = true;
                break;
            }
        }
        if(!complete_flag){
            target_tab_name = "LoRA prompt helper";
            for (const tab of tabs) {
                tab_name = tab.innerHTML;
                if(tab_name.trim().indexOf(target_tab_name.trim()) > -1){
                    tab.click();
                    break;
                }
            }
        }
        lorahelper.dataframe_focus_check();
    }

    function find_tag_by_innerHTML(parent, tagname, innerHTML){
        if(!lorahelper.is_nullptr(parent)){
            if(typeof(parent.querySelectorAll) === typeof(lorahelper.noop_func)){
                let tag_list = parent.querySelectorAll(tagname);
                let target_element_name = lorahelper.my_getTranslation(innerHTML);
                if (!target_element_name) {
                    target_element_name = innerHTML;
                }
                let complete_flag = false;
                let element_name = "";
                for (const element of tag_list) {
                    element_name = element.innerHTML;
                    if(element_name.trim().indexOf(target_element_name.trim()) > -1 ){
                        return element;
                    }
                }
                if(!complete_flag){
                    target_element_name = innerHTML;
                    for (const element of tag_list) {
                        element_name = element.innerHTML;
                        if(element_name.trim().indexOf(target_element_name.trim()) > -1 ){
                            return element;
                        }
                    }
                }
            }
        }
    }
    
    function get_tab_by_name(input_tab_name){
        let tabs = lorahelper.gradioApp().querySelector('#tabs').querySelectorAll('button');
        let target_tab_name = lorahelper.my_getTranslation(input_tab_name);
        if (!target_tab_name) {
            target_tab_name = input_tab_name;
        }
        let complete_flag = false;
        let tab_name = "";
        for (const tab of tabs) {
            tab_name = tab.innerHTML;
            if(tab_name.trim() == target_tab_name.trim()){
                return tab;
            }
        }
        if(!complete_flag){
            target_tab_name = input_tab_name;
            for (const tab of tabs) {
                tab_name = tab.innerHTML;
                if(tab_name.trim() == target_tab_name.trim()){
                    return tab;
                }
            }
        }
        return null;
    }

    function lora_help_change_number_input(target, value){
        let input_eles = target.querySelectorAll("input");
        let value_changed = false;
        for(let input_ele of input_eles){ 
            if((''+input_ele.value) !== (''+value)){
                input_ele.value = value;
                value_changed = true;
            }
        }
        if(value_changed){
            for(let input_ele of input_eles) lorahelper.my_dispatchEvent(
                input_ele, new Event("input", {
                    bubbles: true,
                    cancelable: true,
                })
            );
        }
    }
    
    function is_dataframe_selected(){
        const cell_list = lorahelper.gradioApp().getElementById("lorahelp_js_trigger_words_dataframe").querySelector("table").querySelectorAll("td");
        for(const cell of cell_list){
            let select_flag = cell.contains(document.activeElement);
            if (lorahelper.gradio_no_select_event){
                select_flag = !cell.childNodes[0].classList.contains("border-transparent");
            }
            if (select_flag) {
                return true;
            }
        }
        return false;
    }
    
    function lorahelp_gradio_version(){
        let foot = lorahelper.gradioApp().getElementById("footer");
        if (!foot){return null;}
    
        let versions = foot.querySelector(".versions");
        if (!versions){return null;}
    
        if (versions.innerHTML.indexOf("gradio: 3.16.2")>0) {
            return "3.16.2";
        } else {
            return "3.23.0";
        }
        
    }
    
    function getActiveTabType() {
        if(typeof(get_uiCurrentTabContent) !== typeof(lorahelper.noop_func)) return null;
        const currentTab = get_uiCurrentTabContent();
        switch (currentTab?.id) {
            case "tab_txt2img":
                return "txt2img";
            case "tab_img2img":
                return "img2img";
        }
        return null;
    }
    
    function getActivePrompt() {
        if(typeof(get_uiCurrentTabContent) !== typeof(lorahelper.noop_func)) return null;
        const currentTab = get_uiCurrentTabContent();
        switch (currentTab?.id) {
            case "tab_txt2img":
                return lorahelper.txt2img_prompt;
            case "tab_img2img":
                return lorahelper.img2img_prompt;
        }
        return null;
    }
    
    function getActiveNegativePrompt() {
        if(typeof(get_uiCurrentTabContent) !== typeof(lorahelper.noop_func)) return null;
        const currentTab = get_uiCurrentTabContent();
        switch (currentTab?.id) {
            case "tab_txt2img":
                return lorahelper.neg_txt2img_prompt;
            case "tab_img2img":
                return lorahelper.neg_img2img_prompt;
        }
        return null;
    }

    lorahelper.switch_to_helper_tab = switch_to_helper_tab;
    lorahelper.lora_help_change_number_input = lora_help_change_number_input;
    lorahelper.is_dataframe_selected = is_dataframe_selected;
    lorahelper.lorahelp_gradio_version = lorahelp_gradio_version;
    lorahelper.getActiveTabType = getActiveTabType;
    lorahelper.getActivePrompt = getActivePrompt;
    lorahelper.getActiveNegativePrompt = getActiveNegativePrompt;
    lorahelper.get_tab_by_name = get_tab_by_name;
    lorahelper.find_tag_by_innerHTML = find_tag_by_innerHTML;
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

