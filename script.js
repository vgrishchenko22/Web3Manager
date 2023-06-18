const WebApp = window.Telegram.WebApp;

WebApp.enableClosingConfirmation();
async function a2() {
    // WebApp.MainButton.setParams({"text": "ДА!!!"});
    WebApp.MainButton.show();
    WebApp.MainButton.enable();
};
WebApp.MainButton.onClick(() => {
    WebApp.MainButton.showProgress(true);
    setTimeout(() => {
        WebApp.showAlert("Qwerty");
        WebApp.MainButton.hideProgress();
    }, 5000);
});
