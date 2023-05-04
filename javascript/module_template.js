(function(){

function module_init() {
    console.log("[lora-prompt-tool] load module template module");
	console.log("Hello, World!\n");
	//insert code here
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