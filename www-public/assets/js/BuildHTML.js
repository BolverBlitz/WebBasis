/**
 * Will create the header based on active and persmissions
 * @param {string} active Current HTML
 * @returns {Promise}
 * User: Startseite | Shopping | Strom  
 * Admin: Gäste | Bestellungen
 */
function createHeaderLinks(active) {
    var HeaderHTML = "";

    if (active.toLowerCase() === "Index".toLowerCase()) {
        HeaderHTML += `<li><a href="/" class="active">${translate('Header.Links.Index')}</a></li>`
    } else {
        HeaderHTML += `<li><a href="/">${translate('Header.Links.Index')}</a></li>`
    }

    if (checkPermission(JSON.parse(localStorage.getItem('permssions')), 'app.web.audio.read').result) {
        if (active.toLowerCase() === "Audio".toLowerCase()) {
            HeaderHTML += `<li><a href="/audio" class="active">${translate('Header.Links.Audio')}</a></li>`
        } else {
            HeaderHTML += `<li><a href="/audio">${translate('Header.Links.Audio')}</a></li>`
        }
    }

    HeaderHTML += `<li><p id="logout" onclick="logout()">${translate('Header.Links.Logout')}</p></li>`

    $("#LinksList").html(HeaderHTML);
}

/**
 * Will create the wlcome message on top left side
 * @returns {Promise}
 */
function createHeaderMessage() {
    let SofwareName = "Project Izzy" //Chance this if your event has a diffrent Name
    let HeaderHTML = `${SofwareName}: ${translate('Header.Willkommen')} ${localStorage.getItem('username')}`;

    $("#HeaderWelcome").text(HeaderHTML);
}

/**
 * Will create the web title
 * @returns {Promise}
 */
function createSiteTitle() {
    let SofwareName = "Project Izzy" //Chance this if your event has a diffrent Name
    let HeaderHTML = `${SofwareName}: ${localStorage.getItem('username')}`;

    $("#SideTile").text(HeaderHTML);
}

/**
 * This function will convert cents to Euro ISO 
 * @param {string} value
 * @returns {string}
 */
function CentToEuro(value) {
    var euro = value / 100;
    return euro.toLocaleString("de-De", { style: "currency", currency: "EUR" });
}