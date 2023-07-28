let tonweb, dnsCollection, dnsItem;

document.addEventListener("DOMContentLoaded", function () {
    TonAccess.getHttpEndpoint()
    .then((endpoint) => {
        tonweb = new TonWeb(new TonWeb.HttpProvider(endpoint));
    })
    .catch((error) => console.error(error));
    // window.history.replaceState("search-section", "Search", "/search");
});

async function next() {
    switch (window.location.pathname) {
        default:
            console.log("search");

            document.getElementById("info-section-domain").innerText = "";
            document.getElementById("info-section-status").innerText = "";
            document.getElementById("info-section-news").innerText = "";
        
            const domain = document.getElementById('domain').value.toLowerCase().trim();
            const zone = document.getElementById('zone').value;
        
            if (domain.length < 4 || domain.length > 126) {
                return console.log("Length error!");
            }
        
            const charArray = domain.split("");
            let i = 0;
            for await (const oneChar of charArray) {
                if (oneChar === ".") {
                    return console.log("Subdomains soon...");
                }
        
                const char = domain.charCodeAt(i);
                const isHyphen = char === 45;
                const isValidChar = (isHyphen && i > 0 && i < domain.length - 1) || (char >= 48 && char <= 57) || (char >= 97 && char <= 122);
                if (!isValidChar) {
                    return console.log("Invalid chars!");
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
                console.log("free");
    
                document.getElementById("info-section-domain").innerText = domain + zone;
                document.getElementById("info-section-status").innerText = "Status: Available";
                document.getElementById("info-section-news").innerText = "Soon...";
            } else if (ownerAddress) {
                console.log("busy");
    
                document.getElementById("info-section-domain").innerText = domain + zone;
                document.getElementById("info-section-status").innerText = "Status: Taken";
            } else {
                console.log("auction");
    
                document.getElementById("info-section-domain").innerText = domain + zone;
                document.getElementById("info-section-status").innerText = "Status: On auction";
                document.getElementById("info-section-news").innerText = "Soon...";
            }
    
            document.getElementById("search-section").style.display = "none";
            document.getElementById("info-section").style.display = "block";
    
            window.history.pushState("info-section", "Info", "/info");

            break;

        case "/info":
            console.log("info");

            document.getElementById("info-section").style.display = "none";
            document.getElementById("edit-section").style.display = "block";
    
            window.history.pushState("edit-section", "Edit", "/edit");

            break;

        case "/edit":
            console.log("edit");

            break;
    }
    // if (window.location.pathname == "/search") {
    //     document.getElementById("info-section-domain").innerText = "";
    //     document.getElementById("info-section-status").innerText = "";
    //     document.getElementById("info-section-news").innerText = "";
    
    //     const domain = document.getElementById('domain').value.toLowerCase().trim();
    //     const zone = document.getElementById('zone').value;
    
    //     if (domain.length < 4 || domain.length > 126) {
    //         return console.log("Length error!");
    //     }
    
    //     const charArray = domain.split("");
    //     let i = 0;
    //     for await (const oneChar of charArray) {
    //         if (oneChar === ".") {
    //             return console.log("Subdomains soon...");
    //         }
    
    //         const char = domain.charCodeAt(i);
    //         const isHyphen = char === 45;
    //         const isValidChar = (isHyphen && i > 0 && i < domain.length - 1) || (char >= 48 && char <= 57) || (char >= 97 && char <= 122);
    //         if (!isValidChar) {
    //             return console.log("Invalid chars!");
    //         }
    
    //         i++
    //     }
    
    //     dnsCollection = new TonWeb.dns.DnsCollection(tonweb.provider, {
    //         address: (await tonweb.dns.resolve(domain + zone, TonWeb.dns.DNS_CATEGORY_NEXT_RESOLVER, true)).toString(true, true, true)
    //     });
    
    //     const domainAddress = await dnsCollection.resolve(domain, TonWeb.dns.DNS_CATEGORY_NEXT_RESOLVER, true);
    //     const accountInfo = await tonweb.provider.getAddressInfo(domainAddress.toString(true, true, true));
    
    //     let domainExists = accountInfo.state === 'active'
    //     let ownerAddress = null
    
    //     if (domainExists) {
    //         dnsItem = new TonWeb.dns.DnsItem(tonweb.provider, {
    //             address: domainAddress,
    //         })
    //         const data = await dnsItem.methods.getData()
    //         if (!data.isInitialized) {
    //             domainExists = false
    //         } else {
    //             ownerAddress = data.ownerAddress
    //         }
    //     }
    //     let auctionInfo = null
    //     if (domainExists && !ownerAddress) {
    //         auctionInfo = await dnsItem.methods.getAuctionInfo()
    //         if (auctionInfo.auctionEndTime < Date.now() / 1000) {
    //             ownerAddress = auctionInfo.maxBidAddress
    //         }
    //     }
        
    //     if (!domainExists) {
    //         console.log("free");

    //         document.getElementById("info-section-domain").innerText = domain + zone;
    //         document.getElementById("info-section-status").innerText = "Status: Available";
    //         document.getElementById("info-section-news").innerText = "Soon...";
    //     } else if (ownerAddress) {
    //         console.log("busy");

    //         document.getElementById("info-section-domain").innerText = domain + zone;
    //         document.getElementById("info-section-status").innerText = "Status: Taken";
    //     } else {
    //         console.log("auction");

    //         document.getElementById("info-section-domain").innerText = domain + zone;
    //         document.getElementById("info-section-status").innerText = "Status: On auction";
    //         document.getElementById("info-section-news").innerText = "Soon...";
    //     }

    //     document.getElementById("search-section").style.display = "none";
    //     document.getElementById("info-section").style.display = "block";

    //     window.history.pushState("info-section", "Info", "/info");
    // }
    // if (window.location.pathname == "/info") {
    //     console.log("info");

    //     document.getElementById("info-section").style.display = "none";
    //     document.getElementById("edit-section").style.display = "block";

    //     window.history.pushState("edit-section", "Edit", "/edit");
    // }
    // if (window.location.pathname == "/edit") {
    //     console.log("edit");
    // }
}

async function back() {
    switch (window.location.pathname) {
        case "/search":
            console.log("search");

            break;

        case "/info":
            console.log("info");

            document.getElementById("info-section").style.display = "none";
            document.getElementById("search-section").style.display = "block";
    
            window.history.back();

            break;

        case "/edit":
            console.log("edit");

            document.getElementById("edit-section").style.display = "none";
            document.getElementById("info-section").style.display = "block";
    
            window.history.back();

            break;
    }
    // if (window.location.pathname == "/search") {
    //     console.log("search");
    // }
    // if (window.location.pathname == "/info") {
    //     console.log("info");

    //     document.getElementById("info-section").style.display = "none";
    //     document.getElementById("search-section").style.display = "block";

    //     window.history.back();
    // }
    // if (window.location.pathname == "/edit") {
    //     console.log("edit");

    //     document.getElementById("edit-section").style.display = "none";
    //     document.getElementById("info-section").style.display = "block";

    //     window.history.back();
    // }
}
