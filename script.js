const WebApp = window.Telegram.WebApp;

async function begin() {
    WebApp.MainButton.setParams({"text": "Connect"});
    WebApp.MainButton.show();
    WebApp.MainButton.enable();
}

WebApp.MainButton.onClick(() => {
    WebApp.MainButton.showProgress(true);
    setTimeout(() => {
        WebApp.showAlert("Connected!", () => {
            WebApp.MainButton.hideProgress();
            WebApp.MainButton.disable();
            WebApp.MainButton.setParams({"text": "Connect"});

            document.getElementById("connect-section").style.display = "none";
            document.getElementById("search-section").style.display = "block";
        });
    }, 5000);
});
