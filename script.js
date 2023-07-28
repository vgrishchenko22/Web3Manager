let tonweb, dnsCollection, dnsItem;

document.addEventListener("DOMContentLoaded", function () {
    TonAccess.getHttpEndpoint()
    .then((endpoint) => {
        tonweb = new TonWeb(new TonWeb.HttpProvider(endpoint));
    })
    .catch((error) => console.error(error));

    Telegram.WebApp.MainButton.setParams({text: "Search", is_visible: true, is_active: true});
    Telegram.WebApp.BackButton.hide();
    Telegram.WebApp.disableClosingConfirmation();

    window.history.replaceState("search-section", "Search", "/Web3Manager?section=search");
});

Telegram.WebApp.MainButton.onClick(async () => {
    switch (window.location.search) {
        case "?section=search":
            Telegram.WebApp.MainButton.showProgress();

            document.getElementById("info-section-domain").innerText = "";
            document.getElementById("info-section-status").innerText = "";
            document.getElementById("info-section-news").innerText = "";
        
            const domain = document.getElementById('domain').value.toLowerCase().trim();
            const zone = document.getElementById('zone').value;
        
            if (domain.length < 4 || domain.length > 126) {
                return Telegram.WebApp.showAlert("Length error!", () => Telegram.WebApp.MainButton.hideProgress());
            }
        
            const charArray = domain.split("");
            let i = 0;
            for await (const oneChar of charArray) {
                if (oneChar === ".") {
                    return Telegram.WebApp.showAlert("Subdomains soon...", () => Telegram.WebApp.MainButton.hideProgress());
                }
        
                const char = domain.charCodeAt(i);
                const isHyphen = char === 45;
                const isValidChar = (isHyphen && i > 0 && i < domain.length - 1) || (char >= 48 && char <= 57) || (char >= 97 && char <= 122);
                if (!isValidChar) {
                    return Telegram.WebApp.showAlert("Invalid chars!", () => Telegram.WebApp.MainButton.hideProgress());
                }
        
                i++
            }
        
            dnsCollection = new TonWeb.dns.DnsCollection(tonweb.provider, {
                address: (await tonweb.dns.resolve(domain + zone, TonWeb.dns.DNS_CATEGORY_NEXT_RESOLVER, true)).toString(true, true, true)
            });
        
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
            
            if (!domainExists) {
                document.getElementById("info-section-domain").innerText = domain + zone;
                document.getElementById("info-section-status").innerText = "Status: Available";
                document.getElementById("info-section-news").innerText = "Soon...";
            } else if (ownerAddress) {
                document.getElementById("info-section-domain").innerText = domain + zone;
                document.getElementById("info-section-status").innerText = "Status: Taken";

                Telegram.WebApp.MainButton.hideProgress().setText("Edit");
            } else {
                document.getElementById("info-section-domain").innerText = domain + zone;
                document.getElementById("info-section-status").innerText = "Status: On auction";
                document.getElementById("info-section-news").innerText = "Soon...";
            }

            Telegram.WebApp.BackButton.show();

            document.getElementById("search-section").style.display = "none";
            document.getElementById("info-section").style.display = "block";
    
            window.history.pushState("info-section", "Info", "/Web3Manager?section=info");

            break;

        case "?section=info":
            Telegram.WebApp.MainButton.showProgress();
            
            Telegram.WebApp.MainButton.hideProgress().setText("Save");
            Telegram.WebApp.BackButton.show();
            Telegram.WebApp.enableClosingConfirmation();

            document.getElementById("info-section").style.display = "none";
            document.getElementById("edit-section").style.display = "block";
    
            window.history.pushState("edit-section", "Edit", "/Web3Manager?section=edit");

            break;

        case "?section=edit":
            Telegram.WebApp.MainButton.showProgress();
            
            Telegram.WebApp.MainButton.hideProgress().setText("Edit");
            Telegram.WebApp.BackButton.show();

            break;
    }
});

Telegram.WebApp.BackButton.onClick(async () => {
    switch (window.location.search) {
        case "?section=search":
            Telegram.WebApp.BackButton.hide();

            break;

        case "?section=info":
            Telegram.WebApp.MainButton.setText("Search");
            Telegram.WebApp.BackButton.hide();

            document.getElementById("info-section").style.display = "none";
            document.getElementById("search-section").style.display = "block";
    
            window.history.back();

            break;

        case "?section=edit":
            Telegram.WebApp.MainButton.setText("Edit");
            Telegram.WebApp.BackButton.show();

            document.getElementById("edit-section").style.display = "none";
            document.getElementById("info-section").style.display = "block";
    
            window.history.back();

            break;
    }
});
