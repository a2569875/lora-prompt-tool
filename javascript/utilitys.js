(function(){
function module_init() {
    console.log("[lora-prompt-tool] load utilitys module");
    lorahelper.noop_func = ()=>{};
    lorahelper.pointInRect = (rect, {x, y}) => (
        (x > rect.left && x < rect.right) && (y > rect.top && y < rect.bottom)
      );
    
    function load_json_number(input){
        let cvt = parseFloat(input)
        if(Number.isNaN(cvt)) return 0;
        return cvt;
    }
    
    function load_boolean_flag(flag){
        let flag_str = `${flag}`;
        flag_str = flag_str.toLowerCase().trim();
        if(['yes','true','是','y','t'].includes(flag_str)){
            return 1;
        }
        const flag_num = parseInt(load_json_number(flag_str))
        if (flag_num != 0){
            return 1;
        }
        return "";
    }
    
    function debug(...msg) {
        if (lorahelper.settings.is_debug()) console.log(`[${lorahelper.lorahelp_extension_name}]`,...msg);
    }
    
    function is_nullptr(obj) {
        try {
            if (typeof(obj) === "undefined") return true;
            if (obj == undefined) return true;
            if (obj == null) return true;
        } catch (error) {
            return true;
        }
        return false;
    }
    
    function is_empty(str) {
        if (is_nullptr(str)) return true;
        if ((''+str).trim() === '') return true;
        return false;
    }

    function convert_file_path_to_url(path){
        let prefix = "file=";
        let path_to_url = path.replaceAll('\\', '/');
        return prefix+path_to_url;
    }
    function img_node_str(path){
        return `<img src='${convert_file_path_to_url(path)}' style="width:24px"/>`;
    }
    
    function pass_url(url_name){
        return url_name;
    }
    
    function unescape_string(input_string){
        let result = '';
        const unicode_list = ['u','x'];
        for(var i=0; i<input_string.length; ++i){
            const current_char = input_string.charAt(i);
            if(current_char == '\\'){
                ++i;
                if (i >= input_string.length) break;
                const string_body = input_string.charAt(i);
                if(unicode_list.includes(string_body.toLowerCase())){
                    result += `${current_char}${string_body}`;
                } else {
                    let char_added = false;
                    try {
                        const unescaped = JSON.parse(`"${current_char}${string_body}"`);
                        if (unescaped){
                            result += unescaped;
                            char_added = true;
                        }
                    } catch (error) {
                        
                    }
                    if(!char_added){
                        result += string_body;
                    }
                }
            } else {
                result += current_char;
            }
        }
        return JSON.parse(JSON.stringify(result).replace(/\\\\/g,"\\"));
    }
    
    const default_top_index = 10001;
    var my_index = default_top_index;
    function sendontop(ele_id) {
        let element = ele_id;
        if (typeof(ele_id)===typeof("string")) {
            element = document.getElementById(ele_id);
        }
        element.classList.add("sendontop");
        element.style.zIndex = ++my_index;
    }
    function resetElementLayer() {
        const all_top_element = document.querySelectorAll(".sendontop");
        my_index = default_top_index;
        for(let ele of all_top_element){
            ele.style.zIndex = "unset";
        }
    }

    async function google_translate(text, options = {}) {
        const defaultTranslateOptions = {
            client: 'gtx',
            from: 'auto',
            to: 'en',
            hl: 'en',
            tld: 'com',
        };
        function sM(a) {
            let e = [];
            let f = 0;
            for (let g = 0; g < a.length; g++) {
                let l = a.charCodeAt(g)
                128 > l
                ? (e[f++] = l)
                : (2048 > l
                    ? (e[f++] = (l >> 6) | 192)
                    : (55296 == (l & 64512) &&
                        g + 1 < a.length &&
                        56320 == (a.charCodeAt(g + 1) & 64512)
                        ? ((l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023)),
                            (e[f++] = (l >> 18) | 240),
                            (e[f++] = ((l >> 12) & 63) | 128))
                        : (e[f++] = (l >> 12) | 224),
                        (e[f++] = ((l >> 6) & 63) | 128)),
                    (e[f++] = (l & 63) | 128));
            }
            let a_ = 0
            for (f = 0; f < e.length; f++) {
                a_ += e[f];
                a_ = xr(a_, "+-a^+6");
            }
            a_ = xr(a_, "+-3^+b+-f");
            a_ ^= 0;
            0 > a_ && (a_ = (a_ & 2147483647) + 2147483648);
            a_ %= 1e6;
            return a_.toString() + "." + a_.toString();
        }
        function xr(a, b) {
            for (let c = 0; c < b.length - 2; c += 3) {
                let d = b.charAt(c + 2);
                d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
                d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
                a = "+" == b.charAt(c) ? a + d : a ^ d;
            }
            return a;
        }
        function normaliseResponse(body, raw = false) {
            const result = {
                text: "",
                pronunciation: "",
                from: {
                    language: {
                        didYouMean: false,
                        iso: ""
                    },
                    text: {
                        autoCorrected: false,
                        value: "",
                        didYouMean: false
                    }
                }
            };
            body[0].forEach(obj => {
                if (obj[0]) {
                    result.text += obj[0];
                } else if (obj[2]) {
                    result.pronunciation += obj[2];
                }
            })
            if (body[2] === body[8][0][0]) {
                result.from.language.iso = body[2];
            } else {
                result.from.language.didYouMean = true;
                result.from.language.iso = body[8][0][0];
            }
            if (body[7] && body[7][0]) {
                let str = body[7][0];
    
                str = str.replace(/<b><i>/g, "[");
                str = str.replace(/<\/i><\/b>/g, "]");
    
                result.from.text.value = str;
    
                if (body[7][5] === true) {
                    result.from.text.autoCorrected = true;
                } else {
                    result.from.text.didYouMean = true;
                }
            }
    
            if (raw) {
                result.raw = body;
            }
    
            return result;
        }
    
        function generateRequestUrl(text, options) {
          const translateOptions = { ...defaultTranslateOptions, ...options }
    
          const queryParams = {
            client: translateOptions.client,
            sl: translateOptions.from,
            tl: translateOptions.to,
            hl: translateOptions.hl,
            ie: "UTF-8",
            oe: "UTF-8",
            otf: "1",
            ssel: "0",
            tsel: "0",
            kc: "7",
            q: text,
            tk: sM(text)
          }
          const searchParams = new URLSearchParams(queryParams);
          ["at", "bd", "ex", "ld", "md", "qca", "rw", "rm", "ss", "t"].forEach(l =>
            searchParams.append("dt", l)
          )
    
          return `https://translate.google.${translateOptions.tld}/translate_a/single?${searchParams}`;
        }
        const translateUrl = generateRequestUrl(text, options);
        const response = await lorahelper.build_cors_request(translateUrl);
    
        const body = await JSON.parse(response);
        return normaliseResponse(body, options.raw);
    }

    function isTouchDevice() {
        return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
    }

    lorahelper.gradioApp = function() {
        const elems = document.getElementsByTagName('gradio-app');
        const elem = elems.length == 0 ? document : elems[0];
    
        if (elem !== document) elem.getElementById = function (id) { return document.getElementById(id); }
        return elem.shadowRoot ? elem.shadowRoot : elem;
    };
    lorahelper.debug = debug;
    lorahelper.load_json_number = load_json_number;
    lorahelper.load_boolean_flag = load_boolean_flag;
    lorahelper.is_nullptr = is_nullptr;
    lorahelper.is_empty = is_empty;
    lorahelper.convert_file_path_to_url = convert_file_path_to_url;
    lorahelper.img_node_str = img_node_str;
    lorahelper.pass_url = pass_url;
    lorahelper.unescape_string = unescape_string;
    lorahelper.google_translate = google_translate;
    lorahelper.isTouchDevice = isTouchDevice;
    lorahelper.sendontop = sendontop;
    lorahelper.resetElementLayer = resetElementLayer;
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