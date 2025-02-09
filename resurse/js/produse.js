window.addEventListener("load", function () {
    document.getElementById("inp-pret").onchange = function () {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
    };

    document.getElementById("filtrare").onclick = function () {
        var inpNume = document.getElementById("inp-nume").value.toLowerCase().trim();
        var produse = document.getElementsByClassName("produs");
        var inpPret = parseInt(document.getElementById("inp-pret").value);
        var inpBrand = document.getElementById("inp-brand").value.toLowerCase().trim();
        var inpCat = document.getElementById("inp-categorie").value.toLowerCase().trim();

        for (let produs of produse) {
            let valNume = produs.querySelector(".val-nume").textContent.toLowerCase().trim();
            let cond1 = valNume.includes(inpNume);
            

            let valPret = parseFloat(produs.getElementsByClassName("val-pret")[0].innerHTML)
            let cond2 = valPret > inpPret;

            let valBrand = produs.querySelector(".val-brand").textContent.toLowerCase().trim();
            let cond3 = valBrand.includes(inpBrand);
            if (inpBrand == 'toate'){
                cond3 = true;
            }

            let valCat = produs.querySelector(".val-categorie").textContent.toLowerCase().trim();
            let cond4 = valCat.includes(inpCat);
            if (inpCat == 'toate'){
                cond4 = true;
            }

            let valResigilat = produs.querySelector(".val-resigilat").textContent.toLowerCase().trim() === "resigilat";

            let cond5;
            if (document.getElementById("toate").checked) {
                cond5 = true;
            } else if (document.getElementById("nou").checked) {
                cond5 = !valResigilat; // afisez produsele noi
            } else if (document.getElementById("resigilat").checked) {
                cond5 = valResigilat; // afisez doar produsele resigilate
            }


            if (cond1 && cond2 && cond3 && cond4 && cond5) {
                produs.style.display = "block";
            } else {
                produs.style.display = "none";
            }
        }
    };

    document.getElementById("resetare").onclick = function () {
        document.getElementById("inp-nume").value = "";
        document.getElementById("inp-pret").value = 0;
        document.getElementById("infoRange").innerHTML = `(0)`
        document.getElementById("inp-brand").value = "";
        document.getElementById("inp-categorie").value = "toate";
        document.getElementById("toate").checked= true;
        
        var produse = document.getElementsByClassName("produs");
        for (let produs of produse) {
            produs.style.display = "block";
        }
    };
    

    function sorteaza(semn){
        let produse = document.getElementsByClassName("produs");
        let v_produse = Array.from(produse);
    
        v_produse.sort(function(a,b){
            let cat_a = a.getElementsByClassName("val-categorie")[0].innerHTML
            let cat_b = b.getElementsByClassName("val-categorie")[0].innerHTML
            
            if(cat_a == cat_b){
                
                let pret_a = parseInt(a.getElementsByClassName("val-pret")[0].innerHTML);
                let pret_b = parseInt(b.getElementsByClassName("val-pret")[0].innerHTML);
                return semn * (pret_a - pret_b);
                
            }
            return semn * cat_a.localeCompare(cat_b);
            
        });
    
        for (let prod of v_produse){
            prod.parentNode.appendChild(prod);
        }
    }
    
    document.getElementById("sortCrescNume").onclick = function(){
        sorteaza(1);
    }
    document.getElementById("sortDescrescNume").onclick = function(){
        sorteaza(-1);
    }




    window.onkeydown = function(e) {
        if (e.key === 'c' && e.altKey) {
            var suma = 0;
            var produse = document.getElementsByClassName("produs");
    
            for (let produs of produse) {
                var stil = getComputedStyle(produs);
                if (stil.display !== "none") { // Se iau în calcul doar produsele vizibile
                    suma += parseFloat(produs.getElementsByClassName("val-pret")[0].innerHTML);
                }
            }
    
            if (!document.getElementById("par_suma")) {
                let p = document.createElement("p");
                p.innerHTML = `Suma produselor afișate: ${suma} RON`;
                p.id = "par_suma";
                
                let container = document.getElementById("p-suma");
                container.insertBefore(p, container.children[0]);
    
                setTimeout(function() {
                    var pgf = document.getElementById("par_suma");
                    if (pgf) {
                        pgf.remove();
                    }
                }, 2000);
            }
        }
    };
    

});
