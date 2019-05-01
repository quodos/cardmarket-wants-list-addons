// ==UserScript==
// @name         cardmarket.com wants list addons
// @namespace    http://tampermonkey.net/
// @version      0.0.2
// @description  Tampermonkey script that adds several additional functionality to cardmarket.com wants lists.
// @author       Thomas Wilhelm <https://thomaswilhelm.at>
// @include      https://www.cardmarket.com/en/Magic/MainPage/showWants*
// @include      https://www.cardmarket.com/de/Magic/MainPage/showWants*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /// ----------------------------------------
    /// Table changes

    const rows = document.querySelectorAll('table.MKMTable.wantsTable tbody tr');
    let totalPrice = 0.0;
    let totalPriceWithoutBasics = 0.0;
    let cardsString = '';

    if (rows.length) {
        /// ----------------------------------------
        /// Calculate the total price of all the cards in the wants list and write it into the footer
        Array.prototype.forEach.call(rows, function(el, i){
            const cells = el.children;
            let amount = parseInt(cells[10].textContent);
            if (!amount || amount === NaN) {
                amount = 1;
            }
            const value = parseFloat(cells[12].querySelector('div').textContent.replace(',', '.')) * amount;
            totalPrice += value;

            // Ingore cards matching this regex
            const basicLands = /^(island|insel|forest|wald|mountain|gebirge|plains|ebene|swamp|sumpf)(\s\(version\s[0-9]\))?$/gi;
            const cardName = cells[2].querySelector('a').textContent;
            if (basicLands.test(cardName) === false) {
                totalPriceWithoutBasics += value;
            }

            cardsString += `${amount} ${cardName}\n`;
        });

        const footer = document.querySelector('table.MKMTable.wantsTable tfoot tr td');
        footer.style.textAlign = 'right';
        footer.colSpan = "11";
        if (totalPrice === totalPriceWithoutBasics) {
            footer.innerHTML = `Gesamtpreis: <strong>&euro; ${totalPrice.toFixed(2)}</strong>`;
        } else {
            footer.innerHTML = `Gesamtpreis: <strong>&euro; ${totalPrice.toFixed(2)}</strong> / Ohne Standardländer: <strong>&euro; ${totalPriceWithoutBasics.toFixed(2)}</strong>`;
        }

        console.log(totalPrice, totalPriceWithoutBasics);

        /// ----------------------------------------
        /// Add a "Download deck list" button to the table footer
        const tfoot = footer.parentElement;
        const linkContainer = document.createElement('td');
        linkContainer.colSpan = "3";
        tfoot.insertBefore(linkContainer, footer);

        const downloadLink = document.createElement('a');
        downloadLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(cardsString));
        downloadLink.setAttribute('download', 'deck');
        downloadLink.innerHTML = 'Download deck...';
        linkContainer.appendChild(downloadLink);
    }
})();
