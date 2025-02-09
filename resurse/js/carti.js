window.addEventListener("load", function () {

    document.getElementById('sorteaza').onclick = function () {
        function sorteaza(semn) {
            let carti = document.getElementsByClassName("carte");
            let v_carti = Array.from(carti);

            v_carti.sort(function (a, b) {
                let medie_a = parseFloat(a.querySelector(".val-media").textContent.trim());
                let medie_b = parseFloat(b.querySelector(".val-media").textContent.trim());

             
                if (medie_a === medie_b) {
                    let titlu_a = a.querySelector(".val-nume").textContent.trim();
                    let titlu_b = b.querySelector(".val-nume").textContent.trim();
                    return semn * titlu_a.localeCompare(titlu_b);
                }

                return semn * (medie_a - medie_b);
            });

           
            let container = document.querySelector(".grid-carti");
            v_carti.forEach(carte => container.appendChild(carte));
        }

        let optiune = document.getElementById('inp-select').value.toLowerCase().trim();
        if (optiune === "ascendent") {
            sorteaza(1);
        } else {
            sorteaza(-1);
        }
    };

});
