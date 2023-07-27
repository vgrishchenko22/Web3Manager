const WebApp = window.Telegram.WebApp;
const TonAccess = window.TonAccess;
const TonWeb = window.TonWeb;
let tonweb;
const admin = "EQBeknN9S797M9Bi6Kktf8wREsaIbpMpVDG-EFM5OJ6UkJhp";

document.addEventListener("DOMContentLoaded", function () {
    TonAccess.getHttpEndpoint()
    .then((endpoint) => {
        tonweb = new TonWeb(new TonWeb.HttpProvider(endpoint));
    })
    .catch((error) => console.error(error));
});

const tonDnsCollection = new TonWeb.dns.DnsCollection(TonWeb.provider, {
    address: "EQC3dNlesgVD8YbAazcauIrXBPfiVhMMr5YYk2in0Mtsz0Bz",
});
const tmeDnsCollection = new TonWeb.dns.DnsCollection(TonWeb.provider, {
    address: "EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi",
});

function begin() {
    WebApp.MainButton.setParams({"text": "Connect", "is_visible": true, "is_active": true});
}

WebApp.MainButton.onClick(async () => {
    if (document.getElementById("connect-section").style.display == "block") {
        console.log("connect");

        WebApp.MainButton.setParams({"text": "Search"});

        document.getElementById("connect-section").style.display = "none";
        document.getElementById("search-section").style.display = "block";
    } else if (document.getElementById("search-section").style.display == "block") {
        console.log("search");

        WebApp.MainButton.showProgress();

        const domain = document.getElementById('search').value.toLowerCase().trim();
        const zone = document.getElementById('zone').value;

        function validateDomain(domain) {
            if (domain.length < 4 || domain.length > 126) {
                return WebApp.showAlert("Length error!")
            }
            
            for (let i = 0; i < domain.length; i++) {
                if (domain.charAt(i) === '.') {
                    return WebApp.showAlert("Subdomains soon...")
                }
                const char = domain.charCodeAt(i);
                const isHyphen = char === 45;
                const isValidChar = (isHyphen && i > 0 && i < domain.length - 1) || (char >= 48 && char <= 57) || (char >= 97 && char <= 122);
                
                if (!isValidChar) {
                    return WebApp.showAlert("Invalid chars!")
                }
            }
        }

        if (!validateDomain(domain)) {
            const domainAddress = await tonDnsCollection.resolve(domain, TonWeb.dns.DNS_CATEGORY_NEXT_RESOLVER, true);

            const accountInfo = await TonWeb.provider.getAddressInfo(
                domainAddress.toString(true, true, true)
            );
            const dnsItem = new TonWeb.dns.DnsItem(TonWeb.provider, {
                address: domainAddress
            });

            let domainExists = accountInfo.state === 'active';
            let data = await dnsItem.methods.getData();
            let auctionInfo = await dnsItem.methods.getAuctionInfo();
            let lastFillUpTime = await dnsItem.methods.getLastFillUpTime();

            if (accountInfo.state == "active") {
                if (!data.isInitialized) {
                    domainExists = false;
                }
            }
            if (accountInfo.state == "active" && !ownerAddress) {
                if (auctionInfo.auctionEndTime < Date.now() / 1000) {
                    data.ownerAddress = auctionInfo.maxBidAddress;
                }
            }

            if (!domainExists) {
                document.getElementById("info-section-domain").innerText = domain + zone;
                document.getElementById("info-section-status").innerText = "Status: Available";
                document.getElementById("info-section-news").innerText = "Soon...";

                WebApp.MainButton.hideProgress();
                // WebApp.MainButton.setParams({"text": "Bid to start"});
    
                document.getElementById("search-section").style.display = "none";
                document.getElementById("info-section").style.display = "block";
            } else if (data.ownerAddress) {
                document.getElementById("info-section-domain").innerText = domain + zone;
                document.getElementById("info-section-status").innerText = "Status: Taken";

                WebApp.MainButton.hideProgress();
                WebApp.MainButton.setParams({"text": "Edit"});
    
                document.getElementById("search-section").style.display = "none";
                document.getElementById("info-section").style.display = "block";
            } else {
                document.getElementById("info-section-domain").innerText = domain + zone;
                document.getElementById("info-section-status").innerText = "Status: On auction";
                document.getElementById("info-section-news").innerText = "Soon...";

                WebApp.MainButton.hideProgress();
                // WebApp.MainButton.setParams({"text": "Bid"});
    
                document.getElementById("search-section").style.display = "none";
                document.getElementById("info-section").style.display = "block";
            }
        }
    } else if (document.getElementById("info-section").style.display == "block") {
        console.log("info");
    } else if (document.getElementById("edit-section").style.display == "block") {
        console.log("edit");
    } else if (document.getElementById("settings-section").style.display == "block") {
        console.log("settings");
    }
    // WebApp.MainButton.showProgress();
    // setTimeout(() => {
    //     WebApp.showAlert("Connected!", () => {
    //         WebApp.MainButton.hideProgress();
    //         WebApp.MainButton.setParams({"text": "Find"});

    //         document.getElementById("connect-section").style.display = "none";
    //         document.getElementById("search-section").style.display = "block";
    //     });
    // }, 5000);
});

WebApp.enableClosingConfirmation();
// async function a2() {
//     WebApp.MainButton.setParams({"text": "ДА!!!"});
//     WebApp.MainButton.show();
//     WebApp.MainButton.enable();
// };
// WebApp.MainButton.onClick(() => {
//     WebApp.MainButton.showProgress(true);
//     setTimeout(() => {
//         WebApp.showAlert("Qwerty");
//         WebApp.MainButton.hideProgress();
//     }, 5000);
// });
