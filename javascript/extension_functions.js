(function(){

function module_init() {
    console.log("[lora-prompt-tool] load extension functions module");
    function show_trigger_words(event, model_type, model_path, model_name, bgimg, active_tab_type){
        lorahelper.debug("start show_trigger_words");
        model_path_edit = model_path.replace(/\\/g, '\\\\');
    
        //get hidden components of extension 
        let js_show_trigger_words_btn = lorahelper.gradioApp().getElementById("lorahelp_js_show_trigger_words_btn");
        if (!js_show_trigger_words_btn) {
            return;
        }
        let {clientX: mouseX, clientY: mouseY} = event;
        if(!lorahelper.is_nullptr(event.changedTouches)){
            const touches = event.changedTouches;
            mouseX = touches[0].clientX;
            mouseY = touches[0].clientY;
        }

        //ajax to python side
        new lorahelper.myAJAX({
            "action": "show_trigger_words",
            "model_type": model_type,
            "model_path": model_path,
        }, js_show_trigger_words_btn).then(
            (function(mouseX, mouseY){return function(response){
                lorahelper.lorahelper_context_menu_list.innerHTML = "";
                lorahelper.lorahelper_context_menu_opt.innerHTML = "";
                lorahelper.lorahelper_context_menu_edit_after.innerHTML = "";
                let prompt_count = 0;
                let modelId = null;
                try{
                    let data = JSON.parse(response);
                    if(!lorahelper.is_nullptr(data)){
                        if(!lorahelper.is_nullptr(data.prompts)){
                            let data_prompts = data.prompts;
                            if (typeof data_prompts === 'string' || data_prompts instanceof String){
                                data_prompts = [{"prompt": data_prompts}];
                            }
                            for(const prompt of data_prompts){
                                if(!lorahelper.is_nullptr(prompt.prompt) && prompt.prompt !== ""){
                                    const is_neg = (lorahelper.load_boolean_flag(prompt.neg || "")==1);
                                    let context_menu_item = lorahelper.create_context_menu_button(prompt.prompt);
                                    context_menu_item.setAttribute("prompt", prompt.prompt);
                                    if(!lorahelper.is_nullptr(prompt.title) && prompt.title !== ""){
                                        context_menu_item.innerHTML = prompt.title;
                                        context_menu_item.setAttribute("title", prompt.prompt);
                                    }
                                    if(!lorahelper.is_nullptr(prompt.categorys) && prompt.categorys !== ""){
                                        context_menu_item.setAttribute("categorys", prompt.categorys);
                                    }
                                    let function_name = "lorahelper.add_selected_trigger_word";
                                    if(is_neg){
                                        function_name = "lorahelper.add_selected_neg_trigger_word";
                                        context_menu_item.innerHTML += ` (${lorahelper.my_getTranslation("Negative prompt")})`
                                    }
                                    context_menu_item.setAttribute("onclick",
                                        `${function_name}(event, '${model_type}', '${model_path_edit}', ${JSON.stringify(prompt.prompt)}, '${active_tab_type}')`
                                    );
                                    lorahelper.lorahelper_context_menu_list.appendChild(context_menu_item);
    
                                    ++prompt_count;
                                }
                            }
                        }
                        //support for Civitai's JSON
                        if(!lorahelper.is_nullptr(data.trainedWords)){
                            for(const prompt of data.trainedWords){
                                if(!lorahelper.is_nullptr(prompt) && prompt !== ""){
                                    let context_menu_item = lorahelper.create_context_menu_button(`${prompt} ${lorahelper.my_getTranslation("(from CivitAI)")}`);
                                    context_menu_item.setAttribute("prompt", prompt);
                                    context_menu_item.setAttribute("categorys", "civitai");
                                    context_menu_item.setAttribute("onclick",
                                        `lorahelper.add_selected_trigger_word(event, '${model_type}', '${model_path_edit}', ${JSON.stringify(prompt)}, '${active_tab_type}')`
                                    );
                                    lorahelper.lorahelper_context_menu_list.appendChild(context_menu_item);
    
                                    ++prompt_count;
                                }
                            }
                        }

                        if(!lorahelper.is_nullptr(data.modelId)){
                            if(data.modelId !== ""){
                                modelId = data.modelId;
                            }
                        }

                        if(!lorahelper.is_nullptr(data._bundle_embs)){
                            for(const _bundle_emb of data._bundle_embs){
                                if(!lorahelper.is_nullptr(_bundle_emb) && (""+_bundle_emb).trim() !== ""){
                                    let context_menu_item = lorahelper.create_context_menu_button(`${_bundle_emb} ${lorahelper.my_getTranslation("(bundle embeding)")}`);
                                    context_menu_item.setAttribute("prompt", _bundle_emb);
                                    context_menu_item.setAttribute("categorys", "bundle embeding");
                                    context_menu_item.setAttribute("onclick",
                                        `lorahelper.add_selected_trigger_word(event, '${model_type}', '${model_path_edit}', ${JSON.stringify(_bundle_emb)}, '${active_tab_type}')`
                                    );
                                    lorahelper.lorahelper_context_menu_list.appendChild(context_menu_item);
    
                                    ++prompt_count;
                                }
                            }
                        }

                        let options_count = 0;
                        if(!lorahelper.is_nullptr(data.weight) || !lorahelper.is_nullptr(data.params)){
                            let select_list = [];
                            if(!lorahelper.is_empty(data.weight)){
                                let syntax = lorahelper.build_hyper_cmd(model_type,model_name,data.weight,"");
                                if(!lorahelper.is_empty(syntax)){
                                    let select_btn = lorahelper.create_context_menu_button(lorahelper.get_UI_display("Use suggested weight"));
                                
                                    select_btn.setAttribute("onclick",
                                            `lorahelper.add_selected_trigger_word(event, '${model_type}', '${model_path_edit}', '${lorahelper.build_hyper_cmd(model_type,model_name,data.weight,"")}', '${active_tab_type}')`
                                    );
                                    select_list.push(select_btn);
                                }
                            }
                            if(!lorahelper.is_empty(data.params)){
                                let syntax = lorahelper.build_hyper_cmd(model_type,model_name,1.0,data.params);
                                if(!lorahelper.is_empty(syntax)){
                                    let select_btn = lorahelper.create_context_menu_button(lorahelper.get_UI_display("Use suggested params"));
                                
                                    select_btn.setAttribute("onclick",
                                            `lorahelper.add_selected_trigger_word(event, '${model_type}', '${model_path_edit}', '${lorahelper.build_hyper_cmd(model_type,model_name,1.0,data.params)}', '${active_tab_type}')`
                                    );
                                    select_list.push(select_btn);
                                }
                            }
                            if(!lorahelper.is_empty(data.params) && !lorahelper.is_empty(data.weight)){
                                let syntax = lorahelper.build_hyper_cmd(model_type,model_name,data.weight,data.params);
                                if(!lorahelper.is_empty(syntax)){
                                    let select_btn = lorahelper.create_context_menu_button(lorahelper.get_UI_display("Use suggested weight and params"));
                                    select_btn.setAttribute("onclick",
                                            `lorahelper.add_selected_trigger_word(event, '${model_type}', '${model_path_edit}', '${lorahelper.build_hyper_cmd(model_type,model_name,data.weight,data.params)}', '${active_tab_type}')`
                                    );
                                    select_list.push(select_btn);
                                }
                            }
                            if(select_list.length > 0){
                                let sub_menu = lorahelper.create_context_subset(lorahelper.get_UI_display("add model using suggested setting"), select_list);
                                lorahelper.lorahelper_context_menu_opt.appendChild(sub_menu);
                                ++options_count;
                            }
                        }
                        if(!lorahelper.is_nullptr(data.images)){
                            if(data.images.length > 0){
                                let image_list = [];
                                let image_setting_list = [];
                                for(const image_data of data.images){
                                    if (!lorahelper.is_nullptr(image_data.meta)){
                                        if (!lorahelper.is_nullptr(image_data.meta.prompt) && !lorahelper.is_nullptr(image_data.url)){
                                            let image_btn = lorahelper.create_context_menu_button("");
                                            let image_ele = document.createElement("img");
                                            image_ele.setAttribute("src", image_data.url);
                                            image_ele.style.width = "100px";
                                            image_btn.appendChild(image_ele);
                                            image_btn.addEventListener("click", ((model_type, model_path, image_data, active_tab_type) => {return (event) => {
                                                lorahelper.add_selected_trigger_word(event, model_type, model_path, image_data.meta.prompt, active_tab_type);
                                                window.setTimeout(((model_type, model_path, image_data, active_tab_type) => {return (event) => {
                                                    if(!lorahelper.is_nullptr(image_data.meta.negativePrompt) && (""+image_data.meta.negativePrompt).trim() !== ""){
                                                        lorahelper.add_selected_neg_trigger_word(event, model_type, model_path, image_data.meta.negativePrompt, active_tab_type);
                                                    }
                                                };})(model_type, model_path, image_data, active_tab_type),50);
                                            };})(model_type, model_path, image_data, active_tab_type));
                                            image_list.push(image_btn);
                                            
                                            let image_setting_btn = lorahelper.create_context_menu_button("");
                                            let image_setting_ele = document.createElement("img");
                                            image_setting_ele.setAttribute("src", image_data.url);
                                            image_setting_ele.style.width = "100px";
                                            image_setting_btn.appendChild(image_setting_ele);
                                            image_setting_btn.addEventListener("click", ((model_type, model_path, image_data, active_tab_type) => {return (event) => {
                                                lorahelper.add_selected_trigger_word(event, model_type, model_path, image_data.meta.prompt, active_tab_type, true);
                                                window.setTimeout(((event, model_type, model_path, image_data, active_tab_type) => {return () => {
                                                    if(!lorahelper.is_nullptr(image_data.meta.negativePrompt) && (""+image_data.meta.negativePrompt).trim() !== ""){
                                                        lorahelper.add_selected_neg_trigger_word(event, model_type, model_path, image_data.meta.negativePrompt, active_tab_type, true);
                                                    }
                                                };})(event, model_type, model_path, image_data, active_tab_type),50);
                                                const tab_ele = lorahelper.gradioApp().querySelector(`#tab_${active_tab_type}`);
                                                if(!lorahelper.is_nullptr(tab_ele)){
                                                    const load_size = /^\s*[\[\(\{<]?\s*(\d+)\s*[\*xX,]+\s*(\d+)\s*[\]\)\}>]?\s*$/.exec(image_data.meta.size || image_data.meta.Size);
                                                    const image_size = {width:parseInt(load_size[1]), height:parseInt(load_size[2]||load_size[1])};
                                                    const setting_panel = tab_ele.querySelector(`#${active_tab_type}_settings`);
                                                    let sampling_element = setting_panel.querySelector(`#${active_tab_type}_sampling select`);
                                                    let steps_element = setting_panel.querySelector(`#${active_tab_type}_steps`);
                                                    let width_element = setting_panel.querySelector(`#${active_tab_type}_width`);
                                                    let height_element = setting_panel.querySelector(`#${active_tab_type}_height`);
                                                    let denoising_strength_element = setting_panel.querySelector(`#${active_tab_type}_denoising_strength`);
                                                    let cfg_scale_element = setting_panel.querySelector(`#${active_tab_type}_cfg_scale`);
                                                    let subseed_strength_element = setting_panel.querySelector(`#${active_tab_type}_subseed_strength`);
                                                    let subseed_element = setting_panel.querySelector(`#${active_tab_type}_subseed`);
                                                    let seed_element = setting_panel.querySelector(`#${active_tab_type}_seed input`);
                                                    let mask_blur_element = setting_panel.querySelector(`#${active_tab_type}_mask_blur`);
    
                                                    let enable_hr_element = setting_panel.querySelector(`#${active_tab_type}_enable_hr input`);
                                                    let subseed_show_element = setting_panel.querySelector(`#${active_tab_type}_subseed_show input`);
    
                                                    if (!Number.isNaN(image_size.width) && !Number.isNaN(image_size.height)){
                                                        lorahelper.lora_help_change_number_input(width_element, image_size.width);
                                                        lorahelper.lora_help_change_number_input(height_element, image_size.height);
                                                    }
    
                                                    for (const [key, value] of Object.entries(image_data.meta)) {
                                                        const key_name = key.toLowerCase();
                                                        if(key_name === "seed" && !lorahelper.is_nullptr(seed_element)){
                                                            lorahelper.update_inputbox(seed_element, value);
                                                        }
                                                        if(key_name === "eta" && !lorahelper.is_nullptr(subseed_strength_element)){
                                                            if(!lorahelper.is_nullptr(subseed_show_element)){
                                                                subseed_show_element.checked = true;
                                                                lorahelper.update_inputbox(subseed_show_element, subseed_show_element.value);
                                                            }
                                                            lorahelper.lora_help_change_number_input(subseed_strength_element, value);
                                                        }
                                                        if(key_name === "ensd" && !lorahelper.is_nullptr(subseed_element)){
                                                            subseed_show_element.checked = true;
                                                            lorahelper.update_inputbox(subseed_show_element, subseed_show_element.value);
                                                            lorahelper.lora_help_change_number_input(subseed_element, value);
                                                        }
                                                        if(key_name === "sampler" && !lorahelper.is_nullptr(sampling_element)){
                                                            let index = -1;
                                                            let val = value;
                                                            let opt_index = -1;
                                                            let selected_option = null;
                                                            for (var i=0; i<sampling_element.options.length; ++i){
                                                                const option = sampling_element.options[i];
                                                                if(option.getAttribute("value").toLowerCase() == value.toLowerCase()){
                                                                    index = i;
                                                                    val = option.getAttribute("value");
                                                                    opt_index = option.index;
                                                                    selected_option = option;
                                                                }
                                                            }
                                                            if (index > 0){
                                                                sampling_element.selectedIndex = opt_index;
                                                                sampling_element.value = val;
                                                                //set again avoid it disappear
                                                                sampling_element.selectedIndex = opt_index;
                                                                lorahelper.my_dispatchEvent(sampling_element, new Event("change", {
                                                                    bubbles: true,
                                                                    cancelable: true,
                                                                }));
                                                                lorahelper.my_dispatchEvent(sampling_element, new Event("input", {
                                                                    bubbles: true,
                                                                    cancelable: true,
                                                                }));
                                                            }
                                                        }
                                                        if((key_name === "step" || key_name === "steps") && !lorahelper.is_nullptr(steps_element)){
                                                            lorahelper.lora_help_change_number_input(steps_element, value);
                                                        }
                                                        if((key_name === "cfgscale" || key_name === "cfg scale" || 
                                                            key_name === "cfg_scale") && !lorahelper.is_nullptr(cfg_scale_element)){
                                                                lorahelper.lora_help_change_number_input(cfg_scale_element, value);
                                                        }
                                                        if((key_name === "denoising strength" || key_name === "denoisingstrength") &&
                                                             !lorahelper.is_nullptr(denoising_strength_element)){
                                                            if(!lorahelper.is_nullptr(enable_hr_element)){
                                                                enable_hr_element.checked = true;
                                                                lorahelper.update_inputbox(enable_hr_element, enable_hr_element.value);
                                                            }
                                                            lorahelper.lora_help_change_number_input(denoising_strength_element, value);
                                                        }
                                                        if((key_name === "mask blur" || key_name === "maskblur") &&
                                                             !lorahelper.is_nullptr(mask_blur_element)){
                                                                lorahelper.lora_help_change_number_input(mask_blur_element, value);
                                                        }
    
                                                    }
                                                }
                                            };})(model_type, model_path, image_data, active_tab_type));
                                            image_setting_list.push(image_setting_btn);
                                        }
                                    }
                                }
                                if (image_list.length > 0){
                                    let sub_menu = lorahelper.create_context_subset(lorahelper.get_UI_display("add prompt by image"), image_list);
                                    let sub_setting_menu = lorahelper.create_context_subset(lorahelper.get_UI_display("use prompt and setting by image"), image_setting_list);
                                    lorahelper.lorahelper_context_menu_opt.appendChild(sub_menu);
                                    lorahelper.lorahelper_context_menu_opt.appendChild(sub_setting_menu);
                                    options_count += 2;
                                }
                            }
                        }
                        if (options_count > 0){
                            lorahelper.lorahelper_context_menu_opt.prepend(lorahelper.create_context_menu_hr_item());
                        }
                    }
                } catch(ex){
        
                }
                if(prompt_count <= 0) {
                    let context_menu_item = lorahelper.create_context_menu_button(lorahelper.get_UI_display("(No Trigger Word)"));
                    context_menu_item.setAttribute("onclick","lorahelper.close_lora_context_menu()");
                    lorahelper.lorahelper_context_menu_list.appendChild(context_menu_item);
                }
                lorahelper.context_menu_search_box_item.style.display = "block";
                lorahelper.show_edit_btn();
                lorahelper.lorahelper_context_menu_edit_btn.setAttribute("onclick", `lorahelper.update_trigger_words(event, '${model_type}', '${model_path_edit}', '${bgimg}')`);

                if (modelId !== null) {
                    let context_menu_goto_civitai = lorahelper.create_context_menu_button(lorahelper.get_UI_display("CivitAI webpage of model"));
                    context_menu_goto_civitai.setAttribute("onclick",'window.open("https://civitai.com/models/'+modelId+'", "_blank")');
                    lorahelper.lorahelper_context_menu_edit_after.appendChild(context_menu_goto_civitai);
                }

                lorahelper.show_lora_context_menu(mouseX, mouseY);
            }; })(mouseX, mouseY)
        ).sent();
    
        lorahelper.debug("end show_trigger_words");
    
        if(event){
            event.stopPropagation();
            event.preventDefault();
        }
    }
    
    function add_selected_trigger_word(event, model_type, model_path, addprompt, active_tab_type, overwrite){
        lorahelper.debug("start add_selected_trigger_word");
    
        //get hidden components of extension 
        let js_add_selected_trigger_word_btn = lorahelper.gradioApp().getElementById("lorahelp_js_add_selected_trigger_word_btn");
        if (!js_add_selected_trigger_word_btn) {
            return;
        }
    
        let txt2img_prompt = lorahelper.txt2img_prompt;
        let img2img_prompt = lorahelper.img2img_prompt;
    
        let param = {
            "action": "add_selected_trigger_word",
            "addprompt":addprompt,
            "model_type": model_type,
            "model_path": model_path,
            "txt2img_prompt": txt2img_prompt.value,
            "img2img_prompt": img2img_prompt.value,
            "neg_prompt": "",
            "active_tab_type": active_tab_type
        };
        if(overwrite === true) param.overwrite = 1;
        
        //ajax to python side
        new lorahelper.myAJAX(param, js_add_selected_trigger_word_btn).sent();
    
        lorahelper.close_lora_context_menu();
        lorahelper.debug("end add_selected_trigger_word");
    
        if(event){
            event.stopPropagation();
            event.preventDefault();
        }
    }
    
    function add_selected_neg_trigger_word(event, model_type, model_path, addprompt, active_tab_type, overwrite){
        lorahelper.debug("start add_selected_neg_trigger_word");
    
        //get hidden components of extension 
        let js_add_selected_neg_trigger_word_btn = lorahelper.gradioApp().getElementById("lorahelp_js_add_selected_neg_trigger_word_btn");
        if (!js_add_selected_neg_trigger_word_btn) {
            return;
        }
    
        let txt2img_prompt = lorahelper.neg_txt2img_prompt;
        let img2img_prompt = lorahelper.neg_img2img_prompt;
    
        let param = {
            "action": "add_selected_trigger_word",
            "addprompt":addprompt,
            "model_type": model_type,
            "model_path": model_path,
            "txt2img_prompt": txt2img_prompt.value,
            "img2img_prompt": img2img_prompt.value,
            "neg_prompt": "",
            "active_tab_type": active_tab_type
        }
        if(overwrite === true) param.overwrite = 1;
    
        //ajax to python side
        new lorahelper.myAJAX(param, js_add_selected_neg_trigger_word_btn).sent();
    
        lorahelper.close_lora_context_menu();
        lorahelper.debug("end add_selected_neg_trigger_word");
        if(event){
            event.stopPropagation();
            event.preventDefault();
        }
    }
    
    function update_trigger_words(event, model_type, model_path, bgimg){
        lorahelper.debug("start update_trigger_words");
    
        //get hidden components of extension 
        let js_update_trigger_words_btn = lorahelper.gradioApp().getElementById("lorahelp_js_update_trigger_words_btn");
        if (!js_update_trigger_words_btn) {
            return;
        }
    
        //msg to python side
        new lorahelper.myAJAX({
            "action": "update_trigger_words",
            "model_type": model_type,
            "model_path": model_path,
        }, js_update_trigger_words_btn).sent();
    
        lorahelper.switch_to_helper_tab();
        lorahelper.close_lora_context_menu();
        lorahelper.dataedit_search_box.value = "";
        lorahelper.lorahelper_model_image.innerHTML = "";
        let state = {EditTab:false};
        let interval_id = window.setInterval((function(state_obj, bgimg_src){
            return function(){
                if(!state_obj.EditTab){
                    state_obj.EditTab = true;
                    let edit_model_tab = lorahelper.get_tab_by_name("Edit Model Trigger Words");
                    if(edit_model_tab) edit_model_tab.click();
                    else lorahelper.debug("fail to switch to edit tab.");
                }
                if(lorahelper.lorahelper_model_image_parent.clientWidth <= 0) return;
                let theHeight = lorahelper.lorahelper_model_image_parent.clientHeight;
                if (theHeight <= 0){
                    theHeight = lorahelper.lorahelper_model_image_parent.clientWidth;
                }
                let preview_model_image = document.createElement("img");
                preview_model_image.setAttribute("src", bgimg_src);
                preview_model_image.style.margin = "0 auto";
                preview_model_image.style.height = `${theHeight}px`
                lorahelper.lorahelper_model_image.appendChild(preview_model_image);
                lorahelper.gradioApp().getElementById("lorahelp_js_trigger_words_dataframe").querySelector("table").parentElement.style.overflow = "scroll";
                lorahelper.gradioApp().getElementById("js_tab_adv_edit").parentElement.parentElement.querySelectorAll("button")[0].click();
                window.clearInterval(interval_id);
            };
        })(state, bgimg), 50);
    
        lorahelper.debug("end update_trigger_words");
    
        if(event){
            event.stopPropagation();
            event.preventDefault();
        }
    }

    lorahelper.show_trigger_words = show_trigger_words;
    lorahelper.add_selected_trigger_word = add_selected_trigger_word;
    lorahelper.add_selected_neg_trigger_word = add_selected_neg_trigger_word;
    lorahelper.update_trigger_words = update_trigger_words;
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
