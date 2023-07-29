let tonweb, dnsCollection, dnsItem;
const a = "EQBeknN9S797M9Bi6Kktf8wREsaIbpMpVDG-EFM5OJ6UkJhp";

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

            document.getElementById("info-section-bid").innerText = "";
            document.getElementById("info-section-duration").innerText = "";

            document.getElementById("info-section-owner").innerText = "";
            document.getElementById("info-section-expire").innerText = "";

            document.getElementById("info-section-max-bid").innerText = "";
            document.getElementById("info-section-max-bid-address").innerText = "";
            document.getElementById("info-section-bid-step").innerText = "";
            document.getElementById("info-section-min-bid").innerText = "";

            document.getElementById("info-section-timer").innerText = "";

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
            let auctionInfo = null;
            if (domainExists && !ownerAddress) {
                auctionInfo = await dnsItem.methods.getAuctionInfo()
                if (auctionInfo.auctionEndTime < Date.now() / 1000) {
                    ownerAddress = auctionInfo.maxBidAddress
                }
            }
            let lastFillUpTime = 0;
            if (domainExists && ownerAddress) {
                lastFillUpTime = await dnsItem.methods.getLastFillUpTime();
            }

            document.getElementById("info-section-domain").innerText = domain + zone;
            if (!domainExists) {
                document.getElementById("info-section-status").innerText = "Status: Available";

                const getMinPriceConfig = (domainCharCount) => {
                    switch (domainCharCount) {
                        case 4: return ['1000', '100'];
                        case 5: return ['500', '50'];
                        case 6: return ['400', '40'];
                        case 7: return ['300', '30'];
                        case 8: return ['200', '20'];
                        case 9: return ['100', '10'];
                        case 10: return ['50', '5'];
                        default:
                            return ['10', '1'];
                    }
                }
                
                const getMinPrice = (domain) => {
                    const arr = getMinPriceConfig(domain.length);
                    let startMinPrice = TonWeb.utils.toNano(arr[0]);
                    const endMinPrice = TonWeb.utils.toNano(arr[1]);
                    const months = Math.floor((Math.floor(Date.now() / 1000) - 1659171600) / 2592000);
                    if (months > 21) {
                        return endMinPrice;
                    }
                    for (let index = 0; index < months; index++) {
                        startMinPrice = startMinPrice.mul(new TonWeb.utils.BN(90)).div(new TonWeb.utils.BN(100));
                    }
                    return startMinPrice;
                }

                document.getElementById("info-section-bid").innerText = "Bid: " + TonWeb.utils.fromNano(getMinPrice(domain));
                
                let months = Math.floor((Math.floor(Date.now() / 1000) - 1659171600) / 2592000);
                if (months > 12) {
                    months = 12;
                }

                document.getElementById("info-section-duration").innerText = "Duration: " + new Date(Date.now() + (60 * 60 * 24 * 7 - (60 * 60 * 24 * 7 - 60 * 60) * months / 12) * 1000).toISOString();
                
                Telegram.WebApp.MainButton.setText("Place a bid to start the auction");
            } else if (ownerAddress) {
                document.getElementById("info-section-status").innerText = "Status: Taken";

                document.getElementById("info-section-owner").innerText = "Owner: " + ownerAddress.toString(true, true, true);

                const expireDate = new Date(lastFillUpTime * 1000 + 31622400000);
                document.getElementById("info-section-expire").innerText = "Expire: " + expireDate.toISOString().replace("T", "-").slice(0,19).split('-').reverse().join(".").replace(".", " ").split(" ").reverse().join(" ");
                
                if (a == ownerAddress.toString(true, true, true)) {
                    console.log("You Owner");
                }
                
                Telegram.WebApp.MainButton.setText("Edit");
            } else {
                document.getElementById("info-section-status").innerText = "Status: On auction";
                document.getElementById("info-section-max-bid").innerText = "";
                document.getElementById("info-section-max-bid-address").innerText = "";
                document.getElementById("info-section-bid-step").innerText = "";
                document.getElementById("info-section-min-bid").innerText = "";
                
                Telegram.WebApp.MainButton.setText("Place a bid");
            }

            Telegram.WebApp.MainButton.hideProgress();
            Telegram.WebApp.BackButton.show();
            Telegram.WebApp.disableClosingConfirmation();

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
            
            Telegram.WebApp.MainButton.hideProgress().setText("Save");
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
            Telegram.WebApp.disableClosingConfirmation();

            document.getElementById("edit-section").style.display = "none";
            document.getElementById("info-section").style.display = "block";
    
            window.history.back();

            break;
    }
});
