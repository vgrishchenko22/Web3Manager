const WebApp = window.Telegram.WebApp;

async function a1(params) {
    WebApp.showPopup(params);
};
async function a2() {
    enableClosingConfirmation();
    WebApp.MainButton.setParams({"text": "Ыыыыыыы"})
    WebApp.MainButton.show();
    WebApp.MainButton.enable();
};
WebApp.onEvent('mainButtonClicked', () => {
    WebApp.MainButton.showProgress(true)
    setTimeout(() => {
        WebApp.showAlert("Qwerty");
        WebApp.MainButton.hideProgress()
    }, 5000);
});
async function a3() {
    WebApp.showConfirm("Ytrewq!");
};
async function qr(text) {
    WebApp.showScanQrPopup(text);
};
