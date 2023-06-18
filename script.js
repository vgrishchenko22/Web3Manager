const WebApp = window.Telegram.WebApp;

function begin() {
    WebApp.MainButton.setParams({"text": "Connect", "is_visible": true, "is_active": true});
}

WebApp.MainButton.onClick(() => {
    WebApp.MainButton.showProgress();
    setTimeout(() => {
        WebApp.showAlert("Connected!", () => {
            WebApp.MainButton.hideProgress();
            WebApp.MainButton.setParams({"text": "Find"});

            document.getElementById("connect-section").style.display = "none";
            document.getElementById("search-section").style.display = "block";
        });
    }, 5000);
});
