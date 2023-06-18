const WebApp = window.Telegram.WebApp;

async function a1(params) {
    WebApp.showPopup(params);
};
WebApp.enableClosingConfirmation();
async function a2() {
    WebApp.MainButton.setParams({"text": "ДА!!!"});
    WebApp.MainButton.show();
    WebApp.MainButton.enable();
};
WebApp.enableClosingConfirmation();
WebApp.MainButton.onClick(() => {
    WebApp.MainButton.showProgress(true);
    setTimeout(() => {
        WebApp.showAlert("Qwerty");
        WebApp.MainButton.hideProgress();
    }, 5000);
});
async function a3() {
    WebApp.showConfirm("Ytrewq!");
};
async function qr(text) {
    WebApp.showScanQrPopup(text);
};
