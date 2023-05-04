(function(){

function module_init() {
    console.log("[lora-prompt-tool] load localization module");

    const my_localization_data = {
        "LoRA prompt helper" : {
            "zh_TW": "LoRA提示詞工具"
        },
        "Edit Model Trigger Words" : {
            "zh_TW": "編輯模型觸發詞"
        },
        "Update the JSON data from user input." : {
            "zh_TW": "從在編輯頁面上做的編輯更新本JSON表格"
        },
        "Reload trigger words from model information file." : {
            "zh_TW": "從模型資料檔案中重新載入模型觸發詞"
        },
        "Save the trigger words to model information file." : {
            "zh_TW": "將模型觸發詞存檔到模型資料檔案中"
        },
        "prompts" : {
            "zh_TW": "提示詞"
        },
        "prompt" : {
            "zh_TW": "提示詞"
        },
        "title" : {
            "zh_TW": "標題"
        },
        "trainedWords" : {
            "zh_TW": "已訓練的提示詞"
        },
        "baseModel" : {
            "zh_TW": "基底模型"
        },
        "description" : {
            "zh_TW": "描述"
        },
        "modelId" : {
            "zh_TW": "模型編號"
        },
        "negativePrompt" : {
            "zh_TW": "反向提示詞"
        },
        "hashes" : {
            "zh_TW": "雜湊值"
        },
        "Size" : {
            "zh_TW": "尺寸"
        },
        "name" : {
            "zh_TW": "名稱"
        },
        "Success" : {
            "zh_TW": "成功"
        },
        "virusScanResult" : {
            "zh_TW": "掃毒結果"
        },
        "downloadUrl" : {
            "zh_TW": "下載網址"
        },
        "sizeKB" : {
            "zh_TW": "檔案大小 (KB)"
        },
        "(from CivitAI)" : {
            "zh_TW": "(來自CivitAI)"
        },
        "(No Trigger Word)" : {
            "zh_TW": "(無觸發詞)"
        },
        "edit prompt words..." : {
            "zh_TW": "編輯..."
        },
        "Not" : {
            "zh_TW": "否"
        },
        "##Civitai##" : {
            "zh_TW": "(CivitAI提供的提詞)"
        },
        "Sort Order" : {
            "zh_TW": "排序方式"
        },
        "Ascending" : {
            "zh_TW": "升序排序"
        },
        "Descending" : {
            "zh_TW": "降序排序"
        },
        "Content copied to clipboard" : {
            "zh_TW": "成功將所選擇的儲存格複製到剪貼簿"
        },
        "Failed to copy" : {
            "zh_TW": "複製失敗"
        },
        "translating..." : {
            "zh_TW": "翻譯中..."
        },
        "translation error" : {
            "zh_TW": "翻譯發生錯誤"
        },
        "add prompt by image" : {
            "zh_TW": "加入範例圖片的提示詞"
        },
        "use prompt and setting by image" : {
            "zh_TW": "使用範例圖片的提示詞和生圖設定"
        },
        "Chinese Traditional" : {
            "zh_TW": "繁體中文"
        },
        "add model using suggested setting" : {
            "zh_TW": "使用建議的模型設定"
        },
        "Use suggested weight" : {
            "zh_TW": "使用建議的權重"
        },
        "Use suggested params" : {
            "zh_TW": "使用建議的模型參數"
        },
        "Use suggested weight and params" : {
            "zh_TW": "使用建議的權重和模型參數"
        },
    };
    
    lorahelper.localizationPromise = new Promise((resolve, reject) => {
        lorahelper.localizationPromiseResolve = resolve;
        lorahelper.localizationPromiseReject = reject;
    });
    let other_translate = {};
    let try_localization_looping = false;
    let try_localization = window.setInterval(function(){
        if (try_localization_looping) return;
        try {
            if(!lorahelper.is_nullptr(localization) && !lorahelper.is_nullptr(opts.localization)){
                try_localization_looping = true;
                if (Object.keys(localization).length) {
                    for (const [key, value] of Object.entries(my_localization_data)) {
                        if(value[opts.localization]){
                            localization[key] = value[opts.localization];
                        }
                    }
                } else {
                    if(has_bilingual()){
                        const dirs = opts["bilingual_localization_dirs"];
                        const file = opts["bilingual_localization_file"];
                        if (file !== "None" && dirs !== "None"){
                            const dirs_list = JSON.parse(dirs);
                            const regex_scope = /^##(?<scope>\S+)##(?<skey>\S+)$/ // ##scope##.skey
                            const i18n = JSON.parse(lorahelper.readFile(dirs_list[file]), (key, value) => {
                                if (key.startsWith('@@')) {} //skip
                                else if (regex_scope.test(key)) {} //skip
                                else return value;
                            });
                            other_translate = i18n;
                        }
                    }
                    //opts["bilingual_localization_dirs"]
                }
                if(typeof(lorahelper.localizationPromiseResolve) === typeof(lorahelper.noop_func)){
                    lorahelper.localizationPromiseResolve();
                }
                try_localization_looping = false;
                window.clearInterval(try_localization);
            }
        } catch (error) {
            console.log(error.stack);
        }
    },10);

    function get_if_not_empty(toget){
        if(lorahelper.is_empty(toget)) return undefined;
        if((''+toget).toLowerCase() === "none") return undefined;
        return toget;
    }
    function get_system_language(){
        let DateTimeFormat_obj = Intl?.DateTimeFormat;
        if(typeof(DateTimeFormat_obj) !== typeof(lorahelper.noop_func)) return undefined;
        return DateTimeFormat_obj()?.resolvedOptions()?.locale
    }

    function has_bilingual(){
        return !!opts.bilingual_localization_enabled && !!get_if_not_empty(opts.bilingual_localization_file) && !(Object.keys(localization).length);
    }

    function get_language_code(for_translate){
        const selected_language_code = get_if_not_empty(opts.localization);
        if(selected_language_code){
            return selected_language_code
        } else {
            if(opts.bilingual_localization_enabled){
                const bilingual_language_code = get_if_not_empty(opts.bilingual_localization_file);
                if (bilingual_language_code){
                    return bilingual_language_code;
                }
            } else if (for_translate) {
                const browser_language_code = get_if_not_empty(navigator.language || navigator.userLanguage);
                if (browser_language_code){
                    return browser_language_code;
                }
                const system_language_code = get_if_not_empty(get_system_language());
                if (system_language_code){
                    return system_language_code;
                }
                return "en"; //default english
            }
        }
        return undefined;
    }

    function is_same_language(lang1, lang2){
        lang1_split = (''+lang1).trim().toLowerCase().replace(/[_\s\-\+]+/g,"_").split("_");
        lang2_split = (''+lang2).trim().toLowerCase().replace(/[_\s\-\+]+/g,"_").split("_");
        if (lang1_split[0] !== lang2_split[0]) return false;
        if (lang1_split.length <= 1) return true;
        if (lang2_split.length <= 1) return false;
        let flag = true;
        for (const variants of lang1_split){
            flag = flag && !!lang2_split.includes(variants);
        }
        return flag;
    }

    function get_myTranslation_in_mydist(msg, lang_code){
        const msg_obj = my_localization_data[msg];
        if (msg_obj){
            for (const [lang_name, translated_msg] of Object.entries(msg_obj)) {
                if(is_same_language(lang_name, lang_code)) return translated_msg;
            }
        }
        return undefined;
    }

    function my_getTranslation(msg){
        const selected_language_code = get_language_code();
        let trans = getTranslation(msg);
        if (selected_language_code){
            const my_translate = get_myTranslation_in_mydist(msg,selected_language_code);
            if(my_translate) return my_translate;
        }
        if (!trans) {
            trans = other_translate[msg];
            if (!trans) trans = msg;
        }
        return trans;
    }

    function set_bilingual(element){
        if (!has_bilingual()) return;
        if (!lorahelper.is_nullptr(element.querySelector(".bilingual__trans_wrapper"))) return;
        const msg = element.innerHTML;
        element.innerHTML = get_UI_display(msg);
    }

    function get_UI_display(msg){
        const tmsg = my_getTranslation(msg);
        if (has_bilingual()){
            if (tmsg != msg){
                if(opts.bilingual_localization_order.toLowerCase() === "translation first")
                    return `<div class="bilingual__trans_wrapper">${tmsg}<em>${msg}</em></div>`;
                else return `<div class="bilingual__trans_wrapper">${msg}<em>${tmsg}</em></div>`
            }
        }
        return tmsg;
    }

    function translate_language_selector(){
        lorahelper.dataedit_translate_btn = lorahelper.gradioApp().getElementById("lorahelp_dataedit_translate_btn")
        //Create and append select list
        var selectList = document.createElement("select");
        selectList.id = "translate_language_selector";
        let select_box = document.createElement("div");

        selectList.style.position = "absolute";
        selectList.style.top = "0px";
        selectList.style.border = "none";
        selectList.style.backgroundColor = "transparent";

        select_box.appendChild(selectList);
        lorahelper.dataedit_translate_btn.appendChild(select_box);
        lorahelper.dataedit_translate_translate_language_selector = selectList;

        //Create and append the options
        let i = 0;
        const selected_lang_code = get_language_code(true);
        let select_id = 0;
        for (const [lang_code, lang_name] of Object.entries(lorahelper.languages)) {
            var option = document.createElement("option");
            option.value = lang_code;
            if(is_same_language(lang_code, selected_lang_code)) select_id = i;
            option.text = my_getTranslation(lang_name);
            selectList.appendChild(option);
            ++i;
        }
        lorahelper.dataedit_translate_translate_language_selector.selectedIndex = select_id;
    }
    lorahelper.translate_language_selector = translate_language_selector;
    lorahelper.get_language_code = get_language_code;
    lorahelper.my_getTranslation = my_getTranslation;
    lorahelper.get_UI_display = get_UI_display;

    lorahelper.languages = {
        auto: 'Automatic',
        af: 'Afrikaans',
        sq: 'Albanian',
        am: 'Amharic',
        ar: 'Arabic',
        hy: 'Armenian',
        az: 'Azerbaijani',
        eu: 'Basque',
        be: 'Belarusian',
        bn: 'Bengali',
        bs: 'Bosnian',
        bg: 'Bulgarian',
        ca: 'Catalan',
        ceb: 'Cebuano',
        ny: 'Chichewa',
        zh: 'Chinese Simplified',
        zh_cn: 'Chinese Simplified',
        zh_tw: 'Chinese Traditional',
        co: 'Corsican',
        hr: 'Croatian',
        cs: 'Czech',
        da: 'Danish',
        nl: 'Dutch',
        en: 'English',
        eo: 'Esperanto',
        et: 'Estonian',
        tl: 'Filipino',
        fi: 'Finnish',
        fr: 'French',
        fy: 'Frisian',
        gl: 'Galician',
        ka: 'Georgian',
        de: 'German',
        el: 'Greek',
        gu: 'Gujarati',
        ht: 'Haitian Creole',
        ha: 'Hausa',
        haw: 'Hawaiian',
        he: 'Hebrew',
        iw: 'Hebrew',
        hi: 'Hindi',
        hmn: 'Hmong',
        hu: 'Hungarian',
        is: 'Icelandic',
        ig: 'Igbo',
        id: 'Indonesian',
        ga: 'Irish',
        it: 'Italian',
        ja: 'Japanese',
        jw: 'Javanese',
        kn: 'Kannada',
        kk: 'Kazakh',
        km: 'Khmer',
        rw: 'Kinyarwanda',
        ko: 'Korean',
        ku: 'Kurdish (Kurmanji)',
        ky: 'Kyrgyz',
        lo: 'Lao',
        la: 'Latin',
        lv: 'Latvian',
        lt: 'Lithuanian',
        lb: 'Luxembourgish',
        mk: 'Macedonian',
        mg: 'Malagasy',
        ms: 'Malay',
        ml: 'Malayalam',
        mt: 'Maltese',
        mi: 'Maori',
        mr: 'Marathi',
        mn: 'Mongolian',
        my: 'Myanmar (Burmese)',
        ne: 'Nepali',
        no: 'Norwegian',
        or: 'Odia (Oriya)',
        ps: 'Pashto',
        fa: 'Persian',
        pl: 'Polish',
        pt: 'Portuguese',
        pa: 'Punjabi',
        ro: 'Romanian',
        ru: 'Russian',
        sm: 'Samoan',
        gd: 'Scots Gaelic',
        sr: 'Serbian',
        st: 'Sesotho',
        sn: 'Shona',
        sd: 'Sindhi',
        si: 'Sinhala',
        sk: 'Slovak',
        sl: 'Slovenian',
        so: 'Somali',
        es: 'Spanish',
        su: 'Sundanese',
        sw: 'Swahili',
        sv: 'Swedish',
        tg: 'Tajik',
        ta: 'Tamil',
        tt: 'Tatar',
        te: 'Telugu',
        th: 'Thai',
        tr: 'Turkish',
        tk: 'Turkmen',
        uk: 'Ukrainian',
        ur: 'Urdu',
        ug: 'Uyghur',
        uz: 'Uzbek',
        vi: 'Vietnamese',
        cy: 'Welsh',
        xh: 'Xhosa',
        yi: 'Yiddish',
        yo: 'Yoruba',
        zu: 'Zulu',
      };
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