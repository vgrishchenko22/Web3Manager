const WebApp = window.Telegram.WebApp;

async function a1(params) {
    WebApp.showPopup(params);
};
async function a2() {
    setTimeout(() => {
        WebApp.showAlert("Qwerty");
    }, 5000);
};
async function a3() {
    WebApp.showConfirm("Ytrewq!");
};
async function qr(text) {
    WebApp.showScanQrPopup(text);
};
