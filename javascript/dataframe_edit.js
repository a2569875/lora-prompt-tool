(function(){

function module_init() {
    console.log("[lora-prompt-tool] load dataframe edit module");
    lorahelper.edit_action_list = {
        add: "lorahelp_dataedit_add",
        delete: "lorahelp_dataedit_delete",
        up: "lorahelp_dataedit_up",
        down: "lorahelp_dataedit_down",
        copy: "lorahelp_dataedit_copy",
        paste: "lorahelp_dataedit_paste",
        paste_append: "lorahelp_dataedit_paste_append",
        translate: "lorahelp_dataedit_translate"
    }
    
    lorahelper.lorahlep_dataframe_unselected = [-1,-1];
    
    let lorahelp_js_dataframe_observer_lock = false;
    let lorahelp_js_dataframe_add_event_lock = false;
    function lorahelp_js_dataframe_add_event(){
        window.setTimeout(()=>{
            if(lorahelp_js_dataframe_observer_lock) return;
            if(lorahelp_js_dataframe_add_event_lock) return;
            lorahelp_js_dataframe_add_event_lock = true;
            //const cell_list = lorahelper.gradioApp().getElementById("lorahelp_js_trigger_words_dataframe").querySelector("table").querySelectorAll(".cell-wrap");
            const cell_list = lorahelper.gradioApp().getElementById("lorahelp_js_trigger_words_dataframe").querySelector("table").querySelectorAll("td");
            for(const cell of cell_list){
                if(cell.getAttribute("onfocusout") || "" != ""){
                    lorahelp_js_dataframe_add_event_lock = false;
                    return;
                }
            }
            dataframe_focus_check_setup();
            lorahelp_js_dataframe_add_event_lock = false;
        }, 50);
    }
    var lorahelp_js_dataframe_observer_callback = function() {
        if(lorahelp_js_dataframe_observer_lock) return;
        lorahelp_js_dataframe_observer_lock = true;
        lorahelp_js_dataframe_add_event();
        lorahelp_js_dataframe_observer_lock = false;
    }
    function call_lorahelp_js_dataframe_observer_callback(){
        lorahelp_js_dataframe_observer_callback();
    }
    
    //select_index_text_box listener
    lorahelper.select_index_text_box = null;
    let select_index_text_box_callback = function() {
        lorahelper.debug('select_index_text_box_callback callback');
    }
    function call_select_index_text_box_callback(){
        select_index_text_box_callback();
    }
    // Options for the observer (which mutations to observe)
    var select_index_text_box_observer_config = { attributes: true, childList: true, subtree: true };
    var select_index_text_box_observer_value_check = "";
    // Create an observer instance linked to the callback function
    var select_index_text_box_observer = new MutationObserver(call_select_index_text_box_callback);
    var select_index_text_box_value_check = "";
    var select_index_text_box_value_lock = false;
    function start_listen_select_index_text(call_back, timeout_input){
        if (select_index_text_box_value_lock) return;
        //console.log('觀測開始。');
        select_index_text_box_value_lock = true;
        select_index_text_box_value_check = lorahelper.select_index_text_box.value;
        let timeout = 50;
        if (!lorahelper.is_nullptr(timeout_input)) timeout = parseInt(timeout_input);
        let timeout_id = window.setTimeout(function() {
            select_index_text_box_observer.disconnect();
            select_index_text_box_callback = function() {
                lorahelper.debug('select_index_text_box_callback callback');
            };
            if(typeof(call_back) === typeof(lorahelper.noop_func))call_back("timeout");
            //console.log('觀測結束。');
            select_index_text_box_value_lock = false;
        }, timeout);
        select_index_text_box_callback = (function(self_timeout_id) {return function() {
            if(lorahelper.select_index_text_box.value == select_index_text_box_value_check){
                return;
            }
            window.clearTimeout(self_timeout_id);
            select_index_text_box_observer.disconnect();
            select_index_text_box_callback = function() {
                lorahelper.debug('select_index_text_box_callback callback');
            }
            if(typeof(call_back) === typeof(lorahelper.noop_func))call_back();

            //console.log('觀測結束。');
            select_index_text_box_value_lock = false;
        }; })(timeout_id);
        select_index_text_box_observer.observe(lorahelper.select_index_text_box, select_index_text_box_observer_config);
    }
    
    // dataframe listener
    // Options for the observer (which mutations to observe)
    lorahelper.lorahelp_js_dataframe_observer_config = { childList: true, subtree: true };
    // Create an observer instance linked to the callback function
    lorahelper.lorahelp_js_dataframe_observer = new MutationObserver(call_lorahelp_js_dataframe_observer_callback);
    
    function dataframe_edit_action(event, action){
        const select_index = JSON.parse(lorahelper.gradioApp().querySelector("#lorahelp_dataedit_select_index_txtbox textarea").value);
        if (select_index[0] > -1){
            let table_obj = lorahelper.gradioApp().getElementById("lorahelp_js_trigger_words_dataframe").querySelector("table");
            let tbody_obj = table_obj.querySelector("tbody");
            let selected_row = tbody_obj.childNodes[select_index[0]];
            var the_btn = lorahelper.gradioApp().getElementById(lorahelper.edit_action_list[action]+"_event");
            let node_ptr;
            if (the_btn || action == "translate" || action == "copy") {
                switch (action) {
                    case "add":
                    case "delete":
                    case "up":
                    case "down":
                        the_btn.click();
                        window.setTimeout(((action, select_index)=>{
                            return ()=>{
                                let new_select_index = [select_index[0], select_index[1]];
                                if (action === "up"){
                                    --new_select_index[0];
                                }else if (action === "down"){
                                    ++new_select_index[0];
                                }
                                let shape = dataframe_shape();
                                if(new_select_index[0] < shape[0] && new_select_index[1] < shape[1] &&
                                    new_select_index[0] >= 0 && new_select_index[1] >= 0){
                                    lorahelper.update_inputbox(lorahelper.select_index_text_box, JSON.stringify(new_select_index));
                                    if (!lorahelper.gradio_no_select_event) {
                                        start_listen_select_index_text((state)=>{
                                            if(state !== 'timeout')
                                                lorahelper.update_inputbox(lorahelper.select_index_text_box, JSON.stringify(new_select_index));
                                        }, 500);
                                    }
                                }
                            };
                        })(action, select_index),50);
                        break;
                    case "copy":
                        let cell_node = selected_row.childNodes[select_index[1]];
                        node_ptr = cell_node;
                        //找葉子節點 (無分支節點)
                        while(node_ptr.childNodes.length > 0){
                            node_ptr = node_ptr.childNodes[0];
                        }
                        node_ptr = node_ptr.parentElement;
                        let cell_text = "";
                        for(const text_node of node_ptr.childNodes){
                            cell_text += (text_node.innerHTML || "");
                        }
                        lorahelper.lorahelp_copy_paste_txtbox.value = cell_text;
                        lorahelper.lorahelp_copy_paste_txtbox.select();
                        lorahelper.lorahelp_copy_paste_txtbox.setSelectionRange(0, 99999);
                        //document.execCommand("copy");
                        navigator.clipboard.writeText(cell_text).then(() => {
                            lorahelper.lorahelp_js_output_message.value = lorahelper.my_getTranslation("Content copied to clipboard");
                            /* Resolved - text copied to clipboard successfully */
                          },() => {
                            lorahelper.lorahelp_js_output_message.value = lorahelper.my_getTranslation("Failed to copy");
                            /* Rejected - text failed to copy to the clipboard */
                          });
                        break;
                    case "paste":
                    case "paste_append":
                        lorahelper.update_inputbox(lorahelper.lorahelp_copy_paste_txtbox.value, "");
                        //lorahelper.lorahelp_copy_paste_txtbox.dispatchEvent(new Event("input"));
                        navigator.clipboard.readText()
                        .then((the_trigger => { 
                            return text=>{
                                lorahelper.update_inputbox(lorahelper.lorahelp_copy_paste_txtbox, text);
                                //lorahelper.lorahelp_copy_paste_txtbox.dispatchEvent(new Event("input"));
                                the_trigger.click();
                            };
                        })(the_btn))
                        .catch(err => {
                            console.error('Failed to read clipboard contents: ', err);
                        });
                        break;
                    case "translate":
                        let prompt_node = selected_row.childNodes[1];
                        node_ptr = prompt_node
                        //找葉子節點 (無分支節點)
                        while(node_ptr.childNodes.length > 0){
                            node_ptr = node_ptr.childNodes[0];
                        }
                        node_ptr = node_ptr.parentElement;
                        let prompt_text = "";
                        for(const text_node of node_ptr.childNodes){
                            prompt_text += (text_node.innerHTML || "");
                        }
                        prompt_text = lorahelper.unescape_string(prompt_text);
                        prompt_text = prompt_text.replace(/[\s_]+/g, " ");
                        if(prompt_text.trim() !== ""){
                            let language_code = `${opts.localization}`.toLowerCase();
                            let normalize_lcode = /[a-z]+([\s_\-\+]+[a-z]+)?/.exec(language_code);
                            if (normalize_lcode) language_code = normalize_lcode[0] || language_code;
                            language_code = language_code.replace(/[\s_\-\+]+/g, "_");
                            lorahelper.lorahelp_translate_area.innerHTML = lorahelper.get_UI_display("translating...");
                            lorahelper.google_translate(prompt_text, { from: "en", to: lorahelper.dataedit_translate_translate_language_selector.value })
                            .then(res => {
                                lorahelper.lorahelp_translate_area.innerHTML = "";
                                let display_translate = document.createElement("p");
                                display_translate.innerHTML = res.text;
                                lorahelper.lorahelp_translate_area.appendChild(display_translate);
                            })
                            .catch(err => {
                                lorahelper.lorahelp_translate_area.innerHTML = lorahelper.get_UI_display("translation error");
                                console.error(err);
                            });
                        }
                        break;
                    default:
                        lorahelper.debug("unknown action")
                        break;
                }
            }
        } else {
            lorahelper.debug("no selected cell found!");
        }
        event.stopPropagation();
        event.preventDefault();
    }
    
    function updateDataeditSearchingBox(){
        if(lorahelper.lorahelper_dataedit_search_lock){
            return;
        }
        const table_body = lorahelper.gradioApp().getElementById("lorahelp_js_trigger_words_dataframe").querySelector("tbody");
        const txtbox = lorahelper.gradioApp().getElementById("lorahelp_js_dataframe_filter").querySelector("input, textarea");
        lorahelper.lorahelper_dataedit_search_lock = true;
        lorahelper.lorahelper_dataedit_search_text = txtbox.value;
        let filter = lorahelper.lorahelper_dataedit_search_text.trim();
        const menu_list = table_body.querySelectorAll('tr');
        let is_regex = false;
		if(filter !== ""){
			if(filter.charAt(filter.length-1) == filter.charAt(0) && filter.charAt(0) == "/" && filter.length >= 2){
				try {
					const reg_filter = filter.substring(1, filter.length-1);
					if(reg_filter !== ""){
						filter = new RegExp(reg_filter);
						is_regex = true;
					}
				} catch (error) {
					is_regex = false;
				}
			}
			if(!is_regex){
				filter = filter.toLowerCase();
				if(filter.indexOf("\\") > -1){
					try {
						filter = lorahelper.unescape_string(filter);
					} catch (error) {
						
					}
				}
			}
		}

        for(const menu_item of menu_list){
			let flag = false;
			let rows = menu_item.querySelectorAll('td');
			if (rows.length <= 0) continue;
			
            const find_areas = [
                rows[0].innerText, 
                rows[1].innerText, 
                rows[2].innerText
            ];
            for(const find_area of find_areas){
                if(is_regex){
                    flag = find_area.toLowerCase().search(filter) > -1
                } else {
                    flag = find_area.toLowerCase().indexOf(filter) > -1
                }
                if (flag) break;
            }
			if(filter === ""){
				if(/(^|,)\s*##default##\s*(,|$)/.exec(rows[2].innerText)){
					flag = false;
				} else {
					flag = true;
				}
			}
			if(find_areas.join("").trim() === ""){
				flag = true;
			}
			if(rows[0]?.querySelector("span")?.style?.color == "gray"){
				flag = true;
			}
			menu_item.style.display = flag ? "table-row" : "none";
        }
        lorahelper.lorahelper_dataedit_search_lock = false;
    }

    function fill_cell_placeholder(){
        const table_body = lorahelper.gradioApp().getElementById("lorahelp_js_trigger_words_dataframe").querySelector("tbody");
        let it=0;
        let jt=0;
        for(var i = 0; i < table_body.childNodes.length; ++i){
            //你不要亂入!
            if(table_body.childNodes[i].nodeName.toLowerCase() !== 'tr') continue;
            jt = 0;
            for(var j = 0; j < table_body.childNodes[i].childNodes.length; ++j){
                //你不要亂入 x 2!
                if(table_body.childNodes[i].childNodes[j].nodeName.toLowerCase() !== 'td') continue;
                const cell = table_body.childNodes[i].childNodes[j];
				const cell_span = cell.querySelector("span");
				const datafram_placeholder = [
					lorahelper.my_getTranslation("Enter your custom name."),
					lorahelper.my_getTranslation("Enter your trigger word. EX: character_name_\\(title of novel\\)"),
					lorahelper.my_getTranslation("(optional) separated by commas. EX: Character Name/Style Attributes"),
					lorahelper.my_getTranslation("It is automatically set to No when adding, and it needs to be changed again")
				];
				if(((cell_span?.innerText||"")+"").trim() === ""){
					if(((datafram_placeholder[jt]||"")+"").trim()!==""){
						cell_span.innerHTML =`<span style="color: gray;">${datafram_placeholder[jt]}</span>`;
					}
				}
                ++jt
            }
            ++it;
        }
    }

    function calculate_selected_cell(){
        const table_body = lorahelper.gradioApp().getElementById("lorahelp_js_trigger_words_dataframe").querySelector("tbody");
        let it=0;
        let jt=0;
        for(var i = 0; i < table_body.childNodes.length; ++i){
            //你不要亂入!
            if(table_body.childNodes[i].nodeName.toLowerCase() !== 'tr') continue;
            jt = 0;
            for(var j = 0; j < table_body.childNodes[i].childNodes.length; ++j){
                //你不要亂入 x 2!
                if(table_body.childNodes[i].childNodes[j].nodeName.toLowerCase() !== 'td') continue;
                const cell = table_body.childNodes[i].childNodes[j];
                let select_flag = cell.contains(document.activeElement);
                if (lorahelper.gradio_no_select_event){
                    select_flag = !cell.childNodes[0].classList.contains("border-transparent");
                }
                if(select_flag){
                    return [it, jt];
                }
                ++jt
            }
            ++it;
        }
        return lorahelper.lorahlep_dataframe_unselected;
    }
    
    function dataframe_shape(){
        const table_body = lorahelper.gradioApp().getElementById("lorahelp_js_trigger_words_dataframe").querySelector("tbody");
        let it=0;
        let jt=0;
        for(var i = 0; i < table_body.childNodes.length; ++i){
            //你不要亂入!
            if(table_body.childNodes[i].nodeName.toLowerCase() !== 'tr') continue;
            jt = 0;
            for(var j = 0; j < table_body.childNodes[i].childNodes.length; ++j){
                //你不要亂入 x 2!
                if(table_body.childNodes[i].childNodes[j].nodeName.toLowerCase() !== 'td') continue;
                ++jt;
            }
            ++it;
        }
        return [it, jt];
    }

    function dataframe_focus_check_setup(){
        //const cell_list = lorahelper.gradioApp().getElementById("lorahelp_js_trigger_words_dataframe").querySelector("table").querySelectorAll(".cell-wrap");
        for(const table_id of ["td","th"]){
            const cell_list = lorahelper.gradioApp().getElementById("lorahelp_js_trigger_words_dataframe").querySelector("table").querySelectorAll(table_id);
            for(const cell of cell_list){
                cell.setAttribute("onfocusout", "lorahelper.dataframe_focus_check(event)");
                cell.setAttribute("onfocusin", "lorahelper.dataframe_infocus(event)");
            }
        }
        if(lorahelper.translate_ready){
            fill_cell_placeholder();
            updateDataeditSearchingBox();
        }
    }
    
    function dataframe_infocus(event){
        const selected_index = calculate_selected_cell();
        if (lorahelper.gradio_no_select_event) {
            lorahelper.update_inputbox(lorahelper.select_index_text_box, JSON.stringify(selected_index));
        } else {
            start_listen_select_index_text((the_selected_index =>{
                return state => {
                    const new_select_index = JSON.parse(lorahelper.select_index_text_box.value);
                    if(new_select_index[0] != the_selected_index[0] || new_select_index[1] != the_selected_index[1]){
                        lorahelper.update_inputbox(lorahelper.select_index_text_box, JSON.stringify(selected_index));
                    }
                };
            })(selected_index));
        }
    }
    
    function dataframe_focus_check(event){
        window.setTimeout(()=>{
            let select_dom = document.activeElement;
            let btn_list = [];
            for (const [key, value] of Object.entries(lorahelper.edit_action_list)) btn_list.push(value+"_btn");
            if(btn_list.includes(select_dom.getAttribute("id"))) return;
            if(!lorahelper.is_dataframe_selected()){
                lorahelper.update_inputbox(lorahelper.select_index_text_box, JSON.stringify(lorahelper.lorahlep_dataframe_unselected));
                //lorahelper.select_index_text_box.dispatchEvent(new Event("input"));
            }
        }, 10);
    }
    
    function setup_dataframe_edit(){
        dataframe_focus_check_setup();
        lorahelper.lorahelper_scope.addEventListener("click", (event) => {
            const dataframe_area = lorahelper.gradioApp().getElementById("lorahelp_js_trigger_words_dataframe");
            if(lorahelper.is_nullptr(dataframe_area)) return;
            const rect = dataframe_area.querySelector("tbody").getBoundingClientRect();
            let select_dom = document.activeElement;
            let btn_list = [];
            for (const [key, value] of Object.entries(lorahelper.edit_action_list)) btn_list.push(value+"_btn");
            if(btn_list.includes(select_dom.getAttribute("id"))) return;
            const {clientX: mouseX, clientY: mouseY} = event;
            if (!lorahelper.pointInRect(rect, {x:mouseX, y:mouseY})){
                lorahelper.update_inputbox(lorahelper.select_index_text_box, JSON.stringify(lorahelper.lorahlep_dataframe_unselected));
            }
        });
    }

    lorahelper.dataframe_edit_action = dataframe_edit_action;
    lorahelper.dataframe_infocus = dataframe_infocus;
    lorahelper.dataframe_focus_check = dataframe_focus_check;
    lorahelper.setup_dataframe_edit = setup_dataframe_edit;
    lorahelper.fill_cell_placeholder = fill_cell_placeholder;
    lorahelper.updateDataeditSearchingBox = updateDataeditSearchingBox;

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


