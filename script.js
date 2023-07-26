const WebApp = window.Telegram.WebApp;
const TonAccess = window.TonAccess;
const TonWeb = window.TonWeb;
// let tonweb;
// const admin = "EQBeknN9S797M9Bi6Kktf8wREsaIbpMpVDG-EFM5OJ6UkJhp";

// document.addEventListener("DOMContentLoaded", function () {
//     TonAccess.getHttpEndpoint()
//     .then((endpoint) => {
//         tonweb = new TonWeb(new TonWeb.HttpProvider(endpoint));
//     })
//     .catch((error) => console.error(error));
// });

// const tonDnsCollection = new TonWeb.dns.DnsCollection(tonweb.provider, {
//     address: "EQC3dNlesgVD8YbAazcauIrXBPfiVhMMr5YYk2in0Mtsz0Bz",
// });
// const tmeDnsCollection = new TonWeb.dns.DnsCollection(tonweb.provider, {
//     address: "EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi",
// });

function begin() {
    WebApp.MainButton.setParams({"text": "Connect", "is_visible": true, "is_active": true});
}

WebApp.MainButton.onClick(() => {
    WebApp.MainButton.showProgress();
    WebApp.showAlert("Connected!", () => {
        WebApp.MainButton.hideProgress();
        WebApp.MainButton.setParams({"text": "Find"});

        document.getElementById("connect-section").style.display = "none";
        document.getElementById("search-section").style.display = "block";
    });
});
