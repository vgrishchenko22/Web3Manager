function begin() {
    WebApp.MainButton.setParams({"text": "Connect", "is_visible": true, "is_active": true});
}

WebApp.MainButton.onClick(() => {
    document.getElementById("connect-section").style.display = "none";
    if (document.getElementById("connect-section").style.display == "block") {}
    if (document.getElementById("search-section").style.display == "block") {}
    if (document.getElementById("info-section").style.display == "block") {}
    if (document.getElementById("edit-section").style.display == "block") {}
    if (document.getElementById("settings-section").style.display == "block") {}
}
