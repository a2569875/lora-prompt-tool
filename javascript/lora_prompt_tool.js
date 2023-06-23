let lorahelper = {};
console.log("[lora-prompt-tool] load the main module");

lorahelper.lorahelper_model_image = null;
lorahelper.lorahelper_model_image_parent = null;
lorahelper.lorahelper_scope = null;
lorahelper.lorahelper_scope_div = null;
lorahelper.lorahelper_trigger_words_dataframe_scope = null;

lorahelper.lorahelp_copy_paste_txtbox = null;
lorahelper.lorahelp_js_output_message = null;
lorahelper.lorahelp_translate_area = null;
lorahelper.js_cors_request_btn = null;
lorahelper.lorahelp_extension_name = null;
lorahelper.gradio_no_select_event = false;

onUiLoaded(() => {
    //load extension name
    lorahelper.lorahelp_extension_name = lorahelper.gradioApp().querySelector("#lorahelp_extension_name textarea").value;

    //check select event support or not 
    lorahelper.gradio_no_select_event = !!(lorahelper.gradioApp().querySelector("#lorahelp_select_not_support"));
    if(lorahelper.gradio_no_select_event){
        var styleSheet = document.createElement("style");
        styleSheet.innerHTML = lorahelp_old_ver_css;
        document.head.appendChild(styleSheet);
    }
    
    //init
    lorahelper.setup_context_menu();
    lorahelper.setup_dataframe_edit();

    lorahelper.txt2img_prompt = lorahelper.gradioApp().querySelector("#txt2img_prompt textarea");
    lorahelper.img2img_prompt = lorahelper.gradioApp().querySelector("#img2img_prompt textarea");
    lorahelper.neg_txt2img_prompt = lorahelper.gradioApp().querySelector("#txt2img_neg_prompt textarea");
    lorahelper.neg_img2img_prompt = lorahelper.gradioApp().querySelector("#img2img_neg_prompt textarea");

    ace_txt2img_prompt = lorahelper.gradioApp().querySelector("#ace-txt2img_prompt");
    ace_img2img_prompt = lorahelper.gradioApp().querySelector("#ace-img2img_prompt");
    ace_txt2img_neg_prompt = lorahelper.gradioApp().querySelector("#ace-txt2img_neg_prompt");
    ace_img2img_neg_prompt = lorahelper.gradioApp().querySelector("#ace-img2img_neg_prompt");

    if(!lorahelper.is_nullptr(ace_txt2img_prompt)) lorahelper.txt2img_prompt = ace_txt2img_prompt;
    if(!lorahelper.is_nullptr(ace_img2img_prompt)) lorahelper.img2img_prompt = ace_img2img_prompt;
    if(!lorahelper.is_nullptr(ace_txt2img_neg_prompt)) lorahelper.neg_txt2img_prompt = ace_txt2img_neg_prompt;
    if(!lorahelper.is_nullptr(ace_img2img_neg_prompt)) lorahelper.neg_img2img_prompt = ace_img2img_neg_prompt;

    //preview image size handler
    lorahelper.lorahelper_model_image = lorahelper.gradioApp().getElementById("lorahelp_js_image_area");
    let parent_iter = lorahelper.lorahelper_model_image.parentElement
    while(!lorahelper.is_nullptr(parent_iter)){
        if(parent_iter.classList.contains('gradio-html') && parent_iter.classList.contains('block')){
            lorahelper.lorahelper_model_image_parent = parent_iter;
            break;
        }
        parent_iter = parent_iter.parentElement;
    }
    if(lorahelper.is_nullptr(lorahelper.lorahelper_model_image_parent)){
        parent_iter = lorahelper.lorahelper_model_image.parentElement
        while(!lorahelper.is_nullptr(parent_iter)){
            if(parent_iter.classList.contains('gr-block') && parent_iter.classList.contains('gr-box')){
                lorahelper.lorahelper_model_image_parent = parent_iter;
                break;
            }
            parent_iter = parent_iter.parentElement;
        }
    }
    
    //AJAX setup
    lorahelper.js_cors_request_btn = lorahelper.gradioApp().getElementById("lorahelp_js_cors_request_btn");
    lorahelper.lorahelp_js_ajax_txtbox_textarea = lorahelper.gradioApp().querySelector("#lorahelp_js_ajax_txtbox textarea");
    lorahelper.lorahelp_js_ajax_txtbox_textarea.addEventListener('input', lorahelper.call_lorahelp_js_ajax_txtbox_callback);

    lorahelper.lorahelp_js_output_message = lorahelper.gradioApp().querySelector("#lorahelp_js_output_message textarea");

    lorahelper.lorahelper_trigger_words_dataframe_scope = lorahelper.gradioApp().getElementById("lorahelp_js_trigger_words_dataframe").querySelector("table").parentElement;
    lorahelper.lorahelp_js_dataframe_observer.observe(lorahelper.lorahelper_trigger_words_dataframe_scope, lorahelper.lorahelp_js_dataframe_observer_config);

    lorahelper.select_index_text_box = lorahelper.gradioApp().querySelector("#lorahelp_dataedit_select_index_txtbox textarea");
    lorahelper.update_inputbox(lorahelper.select_index_text_box, JSON.stringify(lorahelper.lorahlep_dataframe_unselected));

    lorahelper.lorahelp_translate_area = lorahelper.gradioApp().getElementById("lorahelp_translate_area");

    lorahelper.localizationPromise.then(()=>{
        let helper_tag = lorahelper.get_tab_by_name("LoRA prompt helper");
        helper_tag.innerHTML = lorahelper.get_UI_display("LoRA prompt helper");

        lorahelper.gradioApp().getElementById("lorahelp_dataedit_refresh_event_btn").setAttribute("title", lorahelper.my_getTranslation("Reload trigger words from model information file."));
        lorahelper.gradioApp().getElementById("lorahelp_json_refresh_event_btn").setAttribute("title", lorahelper.my_getTranslation("Update the JSON data from user input."));
        lorahelper.gradioApp().getElementById("lorahelp_js_save_model_setting_btn").setAttribute("title", lorahelper.my_getTranslation("Save the trigger words to model information file."));
        let lorahelp_js_sort_order_radio = lorahelper.gradioApp().getElementById("lorahelp_js_sort_order_radio");
        let lorahelp_js_sort_order_radio_text = lorahelper.find_tag_by_innerHTML(lorahelp_js_sort_order_radio, "span", "Sort Order");
        if (!lorahelper.is_nullptr(lorahelp_js_sort_order_radio_text)) lorahelp_js_sort_order_radio_text.innerHTML = lorahelper.get_UI_display("Sort Order");
        lorahelper.find_tag_by_innerHTML(lorahelp_js_sort_order_radio, "span", "Ascending").innerHTML = lorahelper.get_UI_display("Ascending");
        lorahelper.find_tag_by_innerHTML(lorahelp_js_sort_order_radio, "span", "Descending").innerHTML = lorahelper.get_UI_display("Descending");
        lorahelper.translate_language_selector();
        lorahelper.fill_cell_placeholder();

        lorahelper.gradioApp().getElementById("lorahelp_js_load_textbox_prompt_btn").addEventListener('click', e=>{
            lorahelper.gradioApp().getElementById("js_tab_adv_edit").parentElement.parentElement.querySelectorAll("button")[1].click();
            lorahelper.dataedit_search_box.value = "";
        }, false);
        lorahelper.gradioApp().getElementById("lorahelp_js_load_civitai_setting_btn").addEventListener('click', e=>{
            lorahelper.gradioApp().getElementById("js_tab_adv_edit").parentElement.parentElement.querySelectorAll("button")[1].click();
            lorahelper.dataedit_search_box.value = "";
        }, false);
        lorahelper.gradioApp().getElementById("lorahelp_js_load_dreambooth_setting_btn").addEventListener('click', e=>{
            lorahelper.gradioApp().getElementById("js_tab_adv_edit").parentElement.parentElement.querySelectorAll("button")[1].click();
            lorahelper.dataedit_search_box.value = "";
        }, false);

        let dataedit_search = lorahelper.gradioApp().getElementById("lorahelp_js_dataframe_filter").querySelector("input, textarea");
        for(const eve_name of ["change", "keypress", "paste", "input"]){
            dataedit_search.addEventListener(eve_name, e=>{
                lorahelper.updateDataeditSearchingBox();
            }, false);
        }
        lorahelper.dataedit_search_box = dataedit_search;

        (()=>{
            // Select the node that will be observed for mutations
            const targetNode = document.getElementById("lorahelp_simpleedit_supergroup_other");
    
            // Options for the observer (which mutations to observe)
            const config = { attributes: true, childList: true, subtree: true };
    
            // Callback function to execute when mutations are observed
            const callback = (mutationList, observer) => {
                lorahelper.update_simpleedit_group();
            };
    
            // Create an observer instance linked to the callback function
            const observer = new MutationObserver(callback);
    
            // Start observing the target node for configured mutations
            observer.observe(targetNode, config);
        })();

    });

    //緒山真尋!! 緒山真尋!! 緒山真尋!! 緒山真尋!! 緒山真尋!!
    let mahiro_btn = lorahelper.gradioApp().getElementById("lorahelp_oyama_mahiro");
    if(!lorahelper.is_nullptr(mahiro_icon) && !lorahelper.is_nullptr(mahiro_icon2)){
        let mahiro_img = document.createElement("img");
        mahiro_img.setAttribute("src", mahiro_icon);
        mahiro_img.style.height = "32px";
        mahiro_img.style.position = "absolute";
        
        mahiro_btn.appendChild(mahiro_img);
        mahiro_btn.addEventListener('click', function(ev) {
            mahiro_img.setAttribute("src", mahiro_icon2);
            window.setTimeout(()=>{
                alert("你好，我是緒山真尋!!\nこんにちは、おやま まひろです！！");
                new Audio(watashiwoyamamahoro).play();
                lorahelper.lorahelp_js_output_message.value = "你去問緒山真尋這程式寫好沒!";
                window.setTimeout(()=>mahiro_img.setAttribute("src", mahiro_icon),1000);
            },100);
        }, false);
        mahiro_btn.addEventListener('mouseover', event => mahiro_img.setAttribute("src", mahiro_icon2), false);
        mahiro_btn.addEventListener('mouseleave', event => mahiro_img.setAttribute("src", mahiro_icon), false);
        mahiro_btn.setAttribute("title", "緒山真尋!");
        mahiro_btn.setAttribute("oncontextmenu","lorahelper.build_mahiro_menu(event)");
        mahiro_btn.setAttribute("ondblclick","lorahelper.build_mahiro_menu(event)");
    } else {
        //お兄ちゃんはおしまい！
        mahiro_btn.style.display = "none";
    }

    lorahelper.lorahelp_copy_paste_txtbox = lorahelper.gradioApp().querySelector("#lorahelp_copy_paste_txtbox textarea");

    //get gradio version
    let gradio_ver = lorahelper.lorahelp_gradio_version();
    lorahelper.debug("gradio_ver:" + gradio_ver);

    // get all extra network tabs
    let tab_prefix_list = ["txt2img", "img2img"];
    let model_type_list = ["textual_inversion", "hypernetworks", "checkpoints", "lora", "lycoris"];
    let cardid_suffix = "cards";

    function update_card_for_lorahelper(){
        let replace_preview_text = lorahelper.my_getTranslation("replace preview");
        if (!replace_preview_text) {
            replace_preview_text = "replace preview";
        }

        //initial values
        let extra_network_id = "";
        let extra_network_node = null;
        let model_path_node = null;
        let model_name_node = null;
        let model_path = "";
        let model_name = "";
        let model_type = "";
        let cards = null;

        //get current tab
        let active_tab_type = lorahelper.getActiveTabType();
        if (!active_tab_type){active_tab_type = "txt2img";}

        for (const tab_prefix of tab_prefix_list) {
            if (tab_prefix != active_tab_type) continue;

            let log_messages = [];

            //find out current selected model type tab
            let active_extra_tab_type = "";
            let extra_tabs = lorahelper.gradioApp().getElementById(tab_prefix+"_extra_tabs");
            if (!extra_tabs) {
                log_messages.push("can not find extra_tabs: " + tab_prefix+"_extra_tabs");
            }

            //get active extratab
            let try_to_get_extra_tab = Array.from(get_uiCurrentTabContent().querySelectorAll('.extra-network-cards,.extra-network-thumbs'))
            if(try_to_get_extra_tab.length <= 0){ //support for kitchen-theme
                let txt2img_array_tmp = Array.from(lorahelper.gradioApp().querySelector("#txt2img-extra-netwrok-sidebar")?.querySelectorAll('.extra-network-cards,.extra-network-thumbs')||[]);
                let img2img_array_tmp = Array.from(lorahelper.gradioApp().querySelector("#img2img-extra-netwrok-sidebar")?.querySelectorAll('.extra-network-cards,.extra-network-thumbs')||[]);
                try_to_get_extra_tab = txt2img_array_tmp.concat(img2img_array_tmp);
            }
            const active_extra_tab = try_to_get_extra_tab
                .find(el => el.closest('.tabitem').style.display === 'block')
                ?.id.match(/^(txt2img|img2img)_(.+)_cards$/)[2];

            switch (active_extra_tab) {
                case "textual_inversion":
                    active_extra_tab_type = "ti";
                    break;
                case "hypernetworks":
                    active_extra_tab_type = "hyper";
                    break;
                case "checkpoints":
                    active_extra_tab_type = "ckp";
                    break;
                case "lora":
                    active_extra_tab_type = "lora";
                    break;
                case "lycoris":
                    active_extra_tab_type = "lyco";
                    break;
            }
            let tab_counter = 0;
            for (const js_model_type of model_type_list) {
                //get model_type for python side
                switch (js_model_type) {
                    case "textual_inversion":
                        model_type = "ti";
                        break;
                    case "hypernetworks":
                        model_type = "hyper";
                        break;
                    case "checkpoints":
                        model_type = "ckp";
                        break;
                    case "lora":
                        model_type = "lora";
                        break;
                    case "lycoris":
                        model_type = "lyco";
                        break;
                }

                if (!model_type) {
                    log_messages.push("can not get model_type from: " + js_model_type);
                    continue;
                }

                let extra_network_parent = null;
                //only handle current sub-tab
                extra_network_id = tab_prefix+"_"+js_model_type+"_"+cardid_suffix;
                if (model_type != active_extra_tab_type) continue;
                extra_network_node = lorahelper.gradioApp().getElementById(extra_network_id);
                // check if extr network is under thumbnail mode
                is_thumb_mode = false
                if (extra_network_node) {
                    if (extra_network_node.className == "extra-network-thumbs") {
                        log_messages.push(extra_network_id + " is in thumbnail mode");
                        is_thumb_mode = true;
                    }
                } else {
                    log_messages.push("can not find extra_network_node: " + extra_network_id);
                    continue;
                }

                let i = 0;
                // get all card nodes
                cards = extra_network_node.querySelectorAll(".card");
                for (let card of cards) {
                    if(card.classList.contains("lorahelp-context_menu")) continue;
                    card.classList.add("lorahelp-context_menu");
                    if(i==0){
                        log_messages.push("setup context menu for " + extra_network_id);
                        for(const msg of log_messages) lorahelper.debug(msg);
                    }
                    //metadata_buttoncard
                    metadata_button = card.querySelector(".metadata-button");
                    //additional node
                    additional_node = card.querySelector(".actions .additional");
                    //get ul node, which is the parent of all buttons
                    ul_node = card.querySelector(".actions .additional ul");
                    // replace preview text button
                    replace_preview_btn = card.querySelector(".actions .additional a");

                    // model_path node
                    // model_path = subfolder path + model name + ext
                    model_path_node = card.querySelector(".actions .additional .search_term");
                    if (!model_path_node){
                        lorahelper.debug("can not find search_term node for cards in " + extra_network_id);
                        continue;
                    }

                    model_name_node = card.querySelector(".actions .name");
                    if (!model_name_node){
                        lorahelper.debug("can not find name node for cards in " + extra_network_id);
                    }

                    // get model_path
                    model_path = model_path_node.innerHTML;
                    if (!model_path) {
                        lorahelper.debug("model_path is empty for cards in " + extra_network_id);
                        continue;
                    }
                    model_name = model_name_node.innerHTML;
                    if (!model_name) {
                        lorahelper.debug("model_name is empty for cards in " + extra_network_id);
                        model_name = "";
                    }
                    model_path = model_path.replace(/(\.(bin|pt|safetensors|ckpt))(\s+)?([a-z0-9]+)?$/i, "$1");
                    let bgimg = card.style.backgroundImage || "url(\"./file=html/card-no-preview.png\")";
                    if(lorahelper.is_empty(card.style.backgroundImage)){
                        let img_preview = card.querySelector("img.preview");
                        let tmp_bgimg = "./file=html/card-no-preview.png";
                        if(img_preview){
                            tmp_bgimg = card.querySelector("img.preview").getAttribute('src') || "./file=html/card-no-preview.png";
                        }
                        bgimg = `url(\"${tmp_bgimg}\")`;
                    }
                    bgimg = bgimg.replace(/^\s*url\s*\(\s*\"/i, "lorahelper.pass_url(\"");

                    card.setAttribute("oncontextmenu",
                        `lorahelper.show_trigger_words(event, '${model_type}', '${model_path}', '${model_name}', ${bgimg}, '${active_tab_type}')`
                    );
                    let touch_icon = card.querySelector(".lorahelp-touch-icon");
                    if(lorahelper.is_nullptr(touch_icon)){
                        touch_icon = document.createElement("div");
                        touch_icon.classList.add("lorahelp-touch-icon");
                        let inside_span = document.createElement("span");
                        touch_icon.appendChild(inside_span);
                        card.appendChild(touch_icon);
                    }
                    let icon_label = touch_icon.querySelector("span");
                    icon_label.innerHTML = "...";
                    touch_icon.setAttribute("onclick",
                        `lorahelper.show_trigger_words(event, '${model_type}', '${model_path}', '${model_name}', ${bgimg}, '${active_tab_type}')`
                    );
                    touch_icon.setAttribute("ontouchstart",
                        `lorahelper.show_trigger_words(event, '${model_type}', '${model_path}', '${model_name}', ${bgimg}, '${active_tab_type}')`
                    );
                    if(lorahelper.isTouchDevice() || lorahelper.settings.touch_mode()){
                        touch_icon.style.display = "block";
                    }else{
                        touch_icon.style.display = "none";
                    }
                    ++i;
                }
                if(tab_counter == 0){
                    for(let node_ptr = lorahelper.gradioApp().getElementById(extra_network_id);
                        !lorahelper.is_empty(node_ptr?.parentElement?.parentNode);
                        node_ptr = node_ptr?.parentElement
                    ){
                        node_id = (node_ptr||{getAttribute:()=>null}).getAttribute("id");
                        if(lorahelper.is_empty(node_id)) continue;
                        if ((node_id||"").indexOf("extra_network") >= 0){
                            extra_network_parent = node_ptr;
                            break;
                        }
                    }
                    if(!lorahelper.is_empty(extra_network_parent)){
                        if (lorahelper.is_empty(lorahelper.extra_network_panel_list)){
                            lorahelper.extra_network_panel_list = [];
                            lorahelper.extra_network_observer_list = [];
                        }
                        if ((lorahelper.extra_network_panel_list?.length||-1) <= 0){
                            lorahelper.extra_network_panel_list = [];
                            lorahelper.extra_network_observer_list = [];
                        }
                        let observer_id = lorahelper.extra_network_panel_list.indexOf(extra_network_parent);
                        if(observer_id < 0){
                            lorahelper.extra_network_panel_list.push(extra_network_parent);
                            observer_id = lorahelper.extra_network_panel_list.indexOf(extra_network_parent);
                            let lorahelper_observer = new MutationObserver((function(self){
                                return mutations => {
                                    if(lorahelper.extra_network_observer_list[self.id].working) return;
                                    lorahelper.extra_network_observer_list[self.id].working = true;
                                    lorahelper.update_card_for_lorahelper();
                                    lorahelper.extra_network_observer_list[self.id].working = false;
                                }
                            })({
                                id: observer_id,
                                tab_prefix: tab_prefix
                            }) );
                            lorahelper.extra_network_observer_list.push(lorahelper_observer);
                            lorahelper_observer.observe(extra_network_parent, {
                                characterData: true,
                                childList: true,
                                subtree: true,
                                attributes: true
                            });
                        }
                    }
                }
                ++tab_counter;
            }
        }
    }

    //update when tab is changed
    let all_tabs = lorahelper.gradioApp().querySelectorAll(".tab-nav");
    if(all_tabs.length <= 0){
        //support for old version
        all_tabs = lorahelper.gradioApp().querySelectorAll(".tabs");
        for (let tab_parent of all_tabs) {
            all_tab_items = tab_parent.childNodes[0].querySelectorAll("button");
            for (let the_tab of all_tab_items) {
                the_tab.addEventListener('click', function(ev) {
                    (the_tab.querySelector("button")||{addEventListener:()=>false}).addEventListener('click', function(ev) {
                        update_card_for_lorahelper();
                        return true;
                    }, false);
                    update_card_for_lorahelper();
                    return true;
                }, false);
            }
        }
    }else{
        for (let the_tab of all_tabs) {
            (the_tab.querySelector("button")||{addEventListener:()=>false}).addEventListener('click', function(ev) {
                update_card_for_lorahelper();
                return true;
            }, false);
            the_tab.addEventListener('click', function(ev) {
                update_card_for_lorahelper();
                return true;
            }, false);
        }
    }
    lorahelper.simpleedit_group_extra_enabled = lorahelper.gradioApp().querySelector("#lorahelp_simpleedit_group_extra_enabled input");
    lorahelper.simpleedit_group_extra_body = lorahelper.gradioApp().querySelector("#lorahelp_simpleedit_group_extra_body");
    lorahelper.simpleedit_group_neg_enabled = lorahelper.gradioApp().querySelector("#lorahelp_simpleedit_group_neg_enabled input");
    lorahelper.simpleedit_group_neg_body= lorahelper.gradioApp().querySelector("#lorahelp_simpleedit_group_neg_body");
    lorahelper.sorting_group_enabled = lorahelper.gradioApp().querySelector("#lorahelp_sorting_group_enabled input");
    lorahelper.sorting_group_body = lorahelper.gradioApp().querySelector("#lorahelp_sorting_group");
    lorahelper.update_simpleedit_group = function(){
        if(lorahelper.simpleedit_group_extra_enabled.checked)
            lorahelper.simpleedit_group_extra_body.style.display="block";
        else
            lorahelper.simpleedit_group_extra_body.style.display="none";
        if(lorahelper.simpleedit_group_neg_enabled.checked)
            lorahelper.simpleedit_group_neg_body.style.display="block";
        else
            lorahelper.simpleedit_group_neg_body.style.display="none";
        if(lorahelper.sorting_group_enabled.checked)
            lorahelper.sorting_group_body.style.display="block";
        else
            lorahelper.sorting_group_body.style.display="none";
        return true;
    }

    lorahelper.simpleedit_group_extra_enabled.addEventListener('click', lorahelper.update_simpleedit_group, false);
    lorahelper.simpleedit_group_neg_enabled.addEventListener('click', lorahelper.update_simpleedit_group, false);
    lorahelper.sorting_group_enabled.addEventListener('click', lorahelper.update_simpleedit_group, false);
    lorahelper.update_simpleedit_group();
    //update when tab refreshed
    lorahelper.gradioApp().getElementById("txt2img_extra_refresh").addEventListener('click', function(ev) {
        update_card_for_lorahelper();
        return true;
    }, false);
    lorahelper.gradioApp().getElementById("img2img_extra_refresh").addEventListener('click', function(ev) {
        update_card_for_lorahelper();
        return true;
    }, false);

    //link dataframe edit actions
    for (const [key, value] of Object.entries(lorahelper.edit_action_list)) {
        var the_btn = lorahelper.gradioApp().getElementById(value+"_btn");
        the_btn.setAttribute("onclick", `lorahelper.dataframe_edit_action(event, '${key}')`);
        the_btn.setAttribute("title", key);
    }
    //check if Browser support paste from clipboard
    if (typeof(lorahelper.noop_func) !== typeof(navigator.clipboard.readText)){
        lorahelper.gradioApp().getElementById("lorahelp_dataedit_paste_btn").style.display = "none";
        lorahelper.gradioApp().getElementById("lorahelp_dataedit_paste_append_btn").style.display = "none";
    }

    //update when start webui
    update_card_for_lorahelper();
    lorahelper.dataframe_focus_check();
    lorahelper.update_card_for_lorahelper = update_card_for_lorahelper;
});