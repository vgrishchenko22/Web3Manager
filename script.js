const WebApp = window.Telegram.WebApp;
// const TonAccess = window.TonAccess;
// const TonWeb = window.TonWeb;

let tonweb, dnsCollection, dnsItem;

document.addEventListener("DOMContentLoaded", function () {
    TonAccess.getHttpEndpoint()
    .then((endpoint) => {
        tonweb = new TonWeb(new TonWeb.HttpProvider(endpoint));
    })
    .catch((error) => console.error(error));
});

async function validateDomain(domain) {
    if (domain.length < 4 || domain.length > 126) {
        WebApp.showAlert("Length error!", () => WebApp.MainButton.hideProgress());
        return "Length error!"
    }
    const charArray = domain.split();
    let i = 0;
    for await (const oneChar of charArray) {
        if (oneChar === ".") {
            WebApp.showAlert("Subdomains soon...", () => WebApp.MainButton.hideProgress());
            return "Subdomains soon..."
        }
        const char = domain.charCodeAt(i);
        const isHyphen = char === 45;
        const isValidChar = (isHyphen && i > 0 && i < domain.length - 1) || (char >= 48 && char <= 57) || (char >= 97 && char <= 122);
        
        if (!isValidChar) {
            WebApp.showAlert("Invalid chars!", () => WebApp.MainButton.hideProgress());
            return "Invalid chars!"
        }

        i++
    }
}

WebApp.MainButton.onClick(async () => {
    if (document.getElementById("search-section").style.display == "block") {
        console.log("search");

        WebApp.MainButton.showProgress();

        document.getElementById("info-section-domain").innerText = "";
        document.getElementById("info-section-status").innerText = "";
        document.getElementById("info-section-news").innerText = "";

        const domain = document.getElementById('search').value.toLowerCase().trim();
        const zone = document.getElementById('zone').value;

        dnsCollection = new TonWeb.dns.DnsCollection(tonweb.provider, {
            address: (await tonweb.dns.resolve(domain + zone, TonWeb.dns.DNS_CATEGORY_NEXT_RESOLVER, true)).toString(true, true, true)
        });

        if (!(await validateDomain(domain))) {
            const domainAddress = await dnsCollection.resolve(domain, TonWeb.dns.DNS_CATEGORY_NEXT_RESOLVER, true);
            const accountInfo = await tonweb.provider.getAddressInfo(domainAddress.toString(true, true, true));
    
            let domainExists = accountInfo.state === 'active'
            let ownerAddress = null
        
            if (domainExists) {
                dnsItem = new TonWeb.dns.DnsItem(tonweb.provider, {
                    address: domainAddress,
                })
                const data = await dnsItem.methods.getData()
                if (!data.isInitialized) {
                    domainExists = false
                } else {
                    ownerAddress = data.ownerAddress
                }
            }
            let auctionInfo = null
            if (domainExists && !ownerAddress) {
                auctionInfo = await dnsItem.methods.getAuctionInfo()
                if (auctionInfo.auctionEndTime < Date.now() / 1000) {
                    ownerAddress = auctionInfo.maxBidAddress
                }
            }
            // let lastFillUpTime = 0
            // if (domainExists && ownerAddress) {
            //     lastFillUpTime = await dnsItem.methods.getLastFillUpTime()
            // }
            
            if (!domainExists) {
                console.log("free");
                document.getElementById("info-section-domain").innerText = domain + zone;
                document.getElementById("info-section-status").innerText = "Status: Available";
                document.getElementById("info-section-news").innerText = "Soon...";

                document.getElementById("search-section").style.display = "none";
                document.getElementById("info-section").style.display = "block";
            } else if (ownerAddress) {
                console.log("busy");
                document.getElementById("info-section-domain").innerText = domain + zone;
                document.getElementById("info-section-status").innerText = "Status: Taken";

                WebApp.MainButton.hideProgress();
                WebApp.MainButton.setText("Edit");
                WebApp.BackButton.show();

                document.getElementById("search-section").style.display = "none";
                document.getElementById("info-section").style.display = "block";
            } else {
                console.log("auction");
                document.getElementById("info-section-domain").innerText = domain + zone;
                document.getElementById("info-section-status").innerText = "Status: On auction";
                document.getElementById("info-section-news").innerText = "Soon...";

                document.getElementById("search-section").style.display = "none";
                document.getElementById("info-section").style.display = "block";
            }
        }
    } else if (document.getElementById("info-section").style.display == "block") {
        console.log("info");

        document.getElementById("info-section").style.display = "none";
        document.getElementById("edit-section").style.display = "block";
    } else if (document.getElementById("edit-section").style.display == "block") {
        console.log("edit");

        document.getElementById("edit-section").style.display = "none";
        document.getElementById("settings-section").style.display = "block";
    }
});

WebApp.BackButton.onClick(async () => {
    WebApp.BackButton.hide();
    WebApp.MainButton.setText("Search");
    
    document.getElementById("info-section").style.display = "none";
    document.getElementById("search-section").style.display = "block";
});

WebApp.enableClosingConfirmation();
