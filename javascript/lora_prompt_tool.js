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

            //find out current selected model type tab
            let active_extra_tab_type = "";
            let extra_tabs = lorahelper.gradioApp().getElementById(tab_prefix+"_extra_tabs");
            if (!extra_tabs) {lorahelper.debug("can not find extra_tabs: " + tab_prefix+"_extra_tabs");}

            //get active extratab
            const active_extra_tab = Array.from(get_uiCurrentTabContent().querySelectorAll('.extra-network-cards,.extra-network-thumbs'))
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
                    lorahelper.debug("can not get model_type from: " + js_model_type);
                    continue;
                }

                //only handle current sub-tab
                if (model_type != active_extra_tab_type) continue;
                

                extra_network_id = tab_prefix+"_"+js_model_type+"_"+cardid_suffix;
                // lorahelper.debug("searching extra_network_node: " + extra_network_id);
                extra_network_node = lorahelper.gradioApp().getElementById(extra_network_id);
                // check if extr network is under thumbnail mode
                is_thumb_mode = false
                if (extra_network_node) {
                    if (extra_network_node.className == "extra-network-thumbs") {
                        lorahelper.debug(extra_network_id + " is in thumbnail mode");
                        is_thumb_mode = true;
                    }
                } else {
                    lorahelper.debug("can not find extra_network_node: " + extra_network_id);
                    continue;
                }

                // get all card nodes
                cards = extra_network_node.querySelectorAll(".card");
                for (let card of cards) {
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
                }
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
                    update_card_for_lorahelper();
                    return true;
                }, false);
            }
        }
    }else{
        for (let the_tab of all_tabs) {
            the_tab.addEventListener('click', function(ev) {
                update_card_for_lorahelper();
                return true;
            }, false);
        }
    }
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
});