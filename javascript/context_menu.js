(function(){
function module_init() {
    console.log("[lora-prompt-tool] load context menu module");
    lorahelper.lorahelper_context_menu = null;
    lorahelper.lorahelper_context_menu_list = null;
    lorahelper.lorahelper_context_menu_edit_btn = null;
    lorahelper.lorahelper_context_menu_search_box = null;
    lorahelper.lorahelper_sub_context_menu = null;
    lorahelper.lorahelper_context_menu_opt = null;
    
    lorahelper.context_menu_list = [];
    lorahelper.context_menu_search_box_item = null;
    
    lorahelper.lorahelper_context_menu_search_text = "";
    lorahelper.lorahelper_context_menu_search_lock = false;
    
    lorahelper.lorahelper_mouse_position = {x: -1, y: -1};

    function updateLoraHelperSearchingBox(event){
        if(lorahelper.lorahelper_context_menu_search_lock){
            return;
        }
        if(lorahelper.lorahelper_context_menu_search_text == lorahelper.lorahelper_context_menu_search_box.value){
            return;
        }
        lorahelper.lorahelper_context_menu_search_lock = true;
        lorahelper.lorahelper_context_menu_search_text = lorahelper.lorahelper_context_menu_search_box.value;
        let filter = lorahelper.lorahelper_context_menu_search_text.trim();
        const menu_list = lorahelper.lorahelper_context_menu_list.querySelectorAll('.item');
        if(filter === ""){
            for(const menu_item of menu_list){
                menu_item.style.display = "block";
            }
            lorahelper.lorahelper_context_menu_search_lock = false;
            return;
        }
        let is_regex = false;
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
    
        for(const menu_item of menu_list){
            if(menu_item.classList.contains('edit-btn')) continue;
            let flag = false;
            const find_areas = [
                menu_item.innerHTML || "", 
                menu_item.getAttribute("prompt") || "", 
                menu_item.getAttribute("categorys") || ""
            ];
            for(const find_area of find_areas){
                if(is_regex){
                    flag = find_area.toLowerCase().search(filter) > -1
                } else {
                    flag = find_area.toLowerCase().indexOf(filter) > -1
                }
                if (flag) break;
            }
            menu_item.style.display = flag ? "block" : "none";
        }
        lorahelper.lorahelper_context_menu_search_lock = false;
    }
    
    function normalizePosition(the_context_menu, mouseX, mouseY){
        const {
            left: scopeOffsetX,
            top: scopeOffsetY,
        } = lorahelper.lorahelper_scope_div.getBoundingClientRect();
    
        const scopeX = mouseX - scopeOffsetX;
        const scopeY = mouseY - scopeOffsetY;
    
        //check if the element will go out of bounds
        const outOfBoundsOnX =
            scopeX + the_context_menu.clientWidth > lorahelper.lorahelper_scope_div.clientWidth;
        const outOfBoundsOnY =
            scopeY + the_context_menu.clientHeight > lorahelper.lorahelper_scope_div.clientHeight; 
        
        let normalizeX = mouseX;
        let normalizeY = mouseY;
    
        //normalize on X
        if(outOfBoundsOnX){
            normalizeX =
                scopeOffsetX + lorahelper.lorahelper_scope_div.clientWidth - the_context_menu.clientWidth;
        }
    
        //normalize on Y
        if(outOfBoundsOnY){
            normalizeY =
                scopeOffsetY + lorahelper.lorahelper_scope_div.clientHeight - the_context_menu.clientHeight;
        }
    
        return {normalizeX, normalizeY};
    }
    
    function show_lora_context_menu(mouseX, mouseY){
        lorahelper.lorahelper_context_menu_search_box.value = "";
        lorahelper.lorahelper_context_menu_search_text = "";
    
        lorahelper.lorahelper_context_menu_list.style.height = "unset";
        lorahelper.lorahelper_context_menu_search_box.style.width = "unset";
        lorahelper.lorahelper_context_menu_list.style.overflow = "unset";
        if(lorahelper.lorahelper_context_menu_list.clientHeight > lorahelper.lorahelper_scope_div.clientHeight - 150){
            lorahelper.lorahelper_context_menu_list.style.height = `${lorahelper.lorahelper_scope_div.clientHeight - 150}px`;
            lorahelper.lorahelper_context_menu_list.style.overflow = "scroll";
        }
    
        lorahelper.lorahelper_context_menu_search_box.style.width = `${lorahelper.lorahelper_context_menu_list.clientWidth - 10}px`;
    
        lorahelper.lorahelper_context_menu_edit_btn.innerHTML = lorahelper.get_UI_display("edit prompt words...");
        lorahelper.lorahelper_context_menu_search_box.placeholder = lorahelper.my_getTranslation("Search...");
    
        const {normalizeX, normalizeY} = normalizePosition(lorahelper.lorahelper_context_menu, mouseX, mouseY);
    
        lorahelper.lorahelper_context_menu.style.top = `${normalizeY}px`;
        lorahelper.lorahelper_context_menu.style.left = `${normalizeX}px`;
    
        open_lora_context_menu(lorahelper.lorahelper_context_menu);
    }
    
    function show_lora_sub_context_menu(sub_context_menu, parent_menu){
        const parent_rect = parent_menu.getBoundingClientRect();
    
        sub_context_menu.style.height = "unset";
        sub_context_menu.style.overflow = "unset";
        if(sub_context_menu.clientHeight > lorahelper.lorahelper_scope_div.clientHeight - 100){
            sub_context_menu.style.height = `${lorahelper.lorahelper_scope_div.clientHeight - 100}px`;
            sub_context_menu.style.overflow = "scroll";
        }
        let pos_x = parent_rect.right
        let pos_y = parent_rect.top
    
        if(parent_rect.right + sub_context_menu.clientWidth > lorahelper.lorahelper_scope_div.clientWidth){
            pos_x = parent_rect.left - sub_context_menu.clientWidth;
        }
    
        const {normalizeX, normalizeY} = normalizePosition(sub_context_menu, pos_x, pos_y);
    
        sub_context_menu.style.top = `${normalizeY}px`;
        sub_context_menu.style.left = `${normalizeX}px`;
    
        open_lora_context_menu(sub_context_menu);
    }
    
    function close_lora_context_menu(selected_context_menu){
        if (!lorahelper.is_nullptr(selected_context_menu)){
            selected_context_menu.classList.remove("visible");
            if (typeof(selected_context_menu.on_close) === typeof(lorahelper.noop_func)){
                selected_context_menu.on_close(selected_context_menu);
            }
        }else{
            lorahelper.resetElementLayer();
            let available_context_menu = get_lora_context_menu_list();
            for (let the_context_menu of available_context_menu){
                the_context_menu.classList.remove("visible");
                if (typeof(the_context_menu.on_close) === typeof(lorahelper.noop_func)){
                    the_context_menu.on_close(the_context_menu);
                }
            }
        }
    }
    
    function open_lora_context_menu(selected_context_menu){
        selected_context_menu.classList.remove("visible");
        setTimeout(()=>{
            selected_context_menu.classList.add("visible");
        });
    }
    
    function add_lora_context_menu(the_context_menu){
        lorahelper.lorahelper_scope.appendChild(the_context_menu);
        lorahelper.context_menu_list.push(the_context_menu);
    }
    
    function delete_lora_context_menu(the_context_menu){
        try {
            the_context_menu.remove();
        } catch (error) { }
        const index = lorahelper.context_menu_list.indexOf(the_context_menu);
        if (index > -1) { // only splice array when item is found
            lorahelper.context_menu_list.splice(index, 1); // 2nd parameter means remove one item only
        }
    }
    
    function get_lora_context_menu_list(){
        let copy_list = [];
        for (let item of lorahelper.context_menu_list) copy_list.push(item);
        return copy_list;
    }
    
    function create_context_menu(id){
        let the_context_menu = document.createElement("div");
        if(typeof(id) === typeof("string")){
            if(id.trim() != "") the_context_menu.setAttribute("id", id);
        }
        the_context_menu.classList.add("lora-context-menu");
        the_context_menu.innerHTML = "";
        return the_context_menu;
    }
    
    function create_context_menu_group(){
        let context_menu_group = document.createElement("div");
        context_menu_group.innerHTML = "";
        return context_menu_group;
    }
    
    function create_context_menu_hr_item(){
        let context_menu_hr_item = document.createElement("div");
        context_menu_hr_item.classList.add('hritem');
        context_menu_hr_item.appendChild(document.createElement("hr"));
        return context_menu_hr_item;
    }
    
    function create_context_menu_button(text){
        let context_menu_button_item = document.createElement("div");
        context_menu_button_item.classList.add('item');
        context_menu_button_item.innerHTML = text;
        return context_menu_button_item;
    }
    
    function create_context_subset(text, subset){
        let context_menu_button_item = document.createElement("div");
        let context_menu_subset_icon = document.createElement("span");
        context_menu_subset_icon.innerHTML = "\u27a4";
        context_menu_subset_icon.style.float = "right";
        context_menu_button_item.classList.add('item');
        context_menu_button_item.innerHTML = text;
        context_menu_button_item.appendChild(context_menu_subset_icon);
        context_menu_button_item.menu_subset = [];
        for(const set_item of subset) {
            context_menu_button_item.menu_subset.push(set_item);
        }
        const display_submenu = (event) => {
            let old_sub_menu = context_menu_button_item.sub_menu_object;
            if (!lorahelper.is_nullptr(old_sub_menu)){
                
            } else {
                let the_sub_menu = create_context_menu();
                for(const set_item of context_menu_button_item.menu_subset){
                    the_sub_menu.appendChild(set_item);
                }
                the_sub_menu.on_close = (self)=>{
                    context_menu_button_item.sub_menu_object = undefined;
                    delete_lora_context_menu(self);
                };
                context_menu_button_item.sub_menu_object = the_sub_menu;
                add_lora_context_menu(the_sub_menu);
                show_lora_sub_context_menu(the_sub_menu, context_menu_button_item);
            }
        }
        context_menu_button_item.addEventListener('mouseover', function(event) {
            display_submenu(event);
        }, false);
        context_menu_button_item.addEventListener('touchstart', function(event) {
            display_submenu(event);
            let current_sub_menu = context_menu_button_item.sub_menu_object;
            if (!lorahelper.is_nullptr(current_sub_menu)){
                lorahelper.sendontop(current_sub_menu);
            }
        }, false);
        context_menu_button_item.addEventListener('mouseleave', function(eve) {
            window.setTimeout(((context_menu_button_item) => {
                return () => {
                    let the_sub_menu = context_menu_button_item.sub_menu_object;
                    if (!lorahelper.is_nullptr(the_sub_menu)){
                        const sub_menu_rect = the_sub_menu.getBoundingClientRect();
                        if(!lorahelper.pointInRect(sub_menu_rect, lorahelper.lorahelper_mouse_position)){
                            close_lora_context_menu(the_sub_menu);
                        }
                    }
                }
            })(context_menu_button_item), 50);
        }, false);
        return context_menu_button_item;
    }
    
    function create_context_menu_textbox(text, onchange){
        let context_menu_textbox_item = document.createElement("div");
        let the_textbox = document.createElement("input");
        the_textbox.placeholder = text;
        if (typeof(onchange) === typeof(lorahelper.noop_func)){
            the_textbox.addEventListener("change", onchange);
            the_textbox.addEventListener("keypress", onchange);
            the_textbox.addEventListener("paste", onchange);
            the_textbox.addEventListener("input", onchange);
        }
        context_menu_textbox_item.classList.add('item');
        context_menu_textbox_item.appendChild(the_textbox);
        return context_menu_textbox_item;
    }
    
    function create_context_menu_iframe(href){
        let context_menu_iframe_item = document.createElement("div");
        let the_iframe = document.createElement("iframe");
        the_iframe.setAttribute("src", href);
        the_iframe.style.width = "600px";
        the_iframe.style.height = "60vh";
        the_iframe.style.overflow = "scroll";
        context_menu_iframe_item.classList.add('item');
        context_menu_iframe_item.appendChild(the_iframe);
        return context_menu_iframe_item;
    }
    
    lorahelper.context_menu_edit_hr_item = null;
    function hide_edit_btn(){
        lorahelper.context_menu_edit_hr_item.style.display = "none";
        lorahelper.lorahelper_context_menu_edit_btn.style.display = "none";
    }
    function show_edit_btn(){
        lorahelper.context_menu_edit_hr_item.style.display = "block";
        lorahelper.lorahelper_context_menu_edit_btn.style.display = "block";
    }
    
    function build_mahiro_menu(event){
        const {clientX: mouseX, clientY: mouseY} = event;
        lorahelper.lorahelper_context_menu_list.innerHTML = "";
        lorahelper.lorahelper_context_menu_opt.innerHTML = "";
        const onimai_list = ["Mahiro", "Mihari", "Momiji", "Kaede", "Asahi", "Miyo"];
        for(const onimai of onimai_list){
            let mahiro_off_website = create_context_menu_button(`${onimai}!`);
            mahiro_off_website.setAttribute("onclick",`lorahelper.build_mahiro_iframe(event, '${onimai.toLowerCase()}')`);
            lorahelper.lorahelper_context_menu_list.appendChild(mahiro_off_website);
        }
        lorahelper.context_menu_search_box_item.style.display = "block";
        hide_edit_btn();
        show_lora_context_menu(mouseX, mouseY);
        event.stopPropagation();
        event.preventDefault();
    }
    
    function build_mahiro_iframe(event, mahiro){
        const {clientX: mouseX, clientY: mouseY} = event;
        window.setTimeout(
            ((mouseX, mouseY)=>{
                return ()=>{
                    lorahelper.lorahelper_context_menu_list.innerHTML = "";
                    let mahiro_off_website = create_context_menu_iframe(`https://onimai.jp/character/${mahiro}.html`);
                    if(lorahelper.lorahelper_scope_div.clientWidth <= 600){
                        mahiro_off_website.style.width = "100vw";
                    } else {
                        mahiro_off_website.style.width = "600px";
                    }
                    mahiro_off_website.style.overflow = "scroll";
                    lorahelper.lorahelper_context_menu_list.appendChild(mahiro_off_website);
                    lorahelper.context_menu_search_box_item.style.display = "none";
                    hide_edit_btn();
                    show_lora_context_menu(mouseX, mouseY);
                };
            })(mouseX, mouseY)
        , 50);
        close_lora_context_menu();
        event.stopPropagation();
        event.preventDefault();
    }
    
    function setup_context_menu(){
        lorahelper.lorahelper_context_menu = create_context_menu("lora-context-menu");
        lorahelper.lorahelper_sub_context_menu = create_context_menu("lora-sub-context-menu");
    
        //searching box
        lorahelper.context_menu_search_box_item = create_context_menu_textbox(lorahelper.my_getTranslation("Search..."), updateLoraHelperSearchingBox);
        lorahelper.lorahelper_context_menu_search_box = lorahelper.context_menu_search_box_item.querySelector("input");
        lorahelper.lorahelper_context_menu_search_box.setAttribute("id", "lora-context-menu-search-box");
        lorahelper.lorahelper_context_menu.appendChild(lorahelper.context_menu_search_box_item);
    
        //prompt list
        lorahelper.lorahelper_context_menu_list = create_context_menu_group();
        lorahelper.lorahelper_context_menu.appendChild(lorahelper.lorahelper_context_menu_list);
    
        //other option
        lorahelper.lorahelper_context_menu_opt = create_context_menu_group();
        lorahelper.lorahelper_context_menu.appendChild(lorahelper.lorahelper_context_menu_opt);
    
        //分隔線
        lorahelper.context_menu_edit_hr_item = create_context_menu_hr_item();
        lorahelper.lorahelper_context_menu.appendChild(lorahelper.context_menu_edit_hr_item);
    
        //編輯按鈕
        lorahelper.lorahelper_context_menu_edit_btn = create_context_menu_button(lorahelper.get_UI_display("edit prompt words..."))
        lorahelper.lorahelper_context_menu_edit_btn.classList.add('edit-btn');
        lorahelper.lorahelper_context_menu.appendChild(lorahelper.lorahelper_context_menu_edit_btn);
    
        //test
        /*let my_sub = create_context_subset("a", [
            create_context_subset("b", [
                create_context_menu_button("c"),
                create_context_menu_button("d")
            ]),
            create_context_menu_button("e"),
            create_context_menu_button("f")
        ]);
        lorahelper.lorahelper_context_menu.appendChild(my_sub);*/
    
        lorahelper.lorahelper_scope = document.querySelector("body");
        lorahelper.lorahelper_scope.addEventListener("click", (e) => {
            let flag = true;
            let available_context_menu = get_lora_context_menu_list();
            for (let the_context_menu of available_context_menu){
                flag = flag && (e.target.offsetParent != the_context_menu);
            }
            if(flag){
                close_lora_context_menu();
            }
        });
        lorahelper.lorahelper_scope.addEventListener("mousemove", (e) => {
            lorahelper.lorahelper_mouse_position.x = e.clientX;
            lorahelper.lorahelper_mouse_position.y = e.clientY;
        });
        lorahelper.lorahelper_scope.addEventListener("touchstart", (e) => {
            if(!lorahelper.is_nullptr(e.changedTouches)){
                const touches = e.changedTouches;
                lorahelper.lorahelper_mouse_position.x = touches[0].clientX;
                lorahelper.lorahelper_mouse_position.y = touches[0].clientY;
            }
        });
        add_lora_context_menu(lorahelper.lorahelper_context_menu);
        add_lora_context_menu(lorahelper.lorahelper_sub_context_menu);
    
        //只覆蓋目前螢幕可見範圍的div，用於計算右鍵選單位置
        lorahelper.lorahelper_scope_div = document.createElement("div");
        lorahelper.lorahelper_scope_div.style.position = "fixed";
        lorahelper.lorahelper_scope_div.style.top = "0px";
        lorahelper.lorahelper_scope_div.style.left = "0px";
        lorahelper.lorahelper_scope_div.style.width = "100vw";
        lorahelper.lorahelper_scope_div.style.height = "100vh";
        lorahelper.lorahelper_scope_div.style.zIndex = -1;
        lorahelper.lorahelper_scope_div.style.backgroundColor = "transparent";
        lorahelper.lorahelper_scope_div.style.opacity = 0;
        lorahelper.lorahelper_scope_div.style.pointerEvents = "none";
        lorahelper.lorahelper_scope.appendChild(lorahelper.lorahelper_scope_div);
    }

    lorahelper.show_lora_context_menu = show_lora_context_menu;
    lorahelper.close_lora_context_menu = close_lora_context_menu;
    lorahelper.create_context_menu_hr_item = create_context_menu_hr_item;
    lorahelper.create_context_menu_button = create_context_menu_button;
    lorahelper.create_context_subset = create_context_subset;
    lorahelper.show_edit_btn = show_edit_btn;
    lorahelper.build_mahiro_menu = build_mahiro_menu;
    lorahelper.build_mahiro_iframe = build_mahiro_iframe;
    lorahelper.setup_context_menu = setup_context_menu;
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