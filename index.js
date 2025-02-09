const express = require("express");
const path = require("path");
const fs = require("fs"); // citesc continutul fisierului json
const sharp = require("sharp") // procesare imagini
const pg = require("pg"); // postgreSql

const Client = pg.Client;
client = new Client({
    database: "proiect",
    user: "vlad",
    password: "vlad",
    host: "localhost",
    port: 5432
});

client.connect();
client.query("select * from produse_electronice", function(err,rez){  // functia va intoarce eroare daca avem, daca nu va intoarce rezultatul
    console.log(err);
    console.log(rez);
})


app = express();
 
vectorFoldere = ["temp", "poze_uploadate" , "temp1", "backup"]  //rulez la fiecare pornire a server
for(let folder of vectorFoldere){      // daca folderul nu exista il creez
    let folderAbsolutePath = path.join(__dirname, folder)
    if(!fs.existsSync(folderAbsolutePath))
        fs.mkdirSync(folderAbsolutePath)

}


app.use("/resurse", express.static(path.join(__dirname, "resurse")));
//cand e o cerere cu /resurse, express.static cauta fisierul la calea respectiva 

app.get("/favicon.ico", function(req,res){
    res.sendFile(path.join(__dirname, "resurse/favicon/favicon.svg"))
})


app.get(["/", "/index", "/home"], function(req, res){
    res.render("pagini/index", {ip: req.ip, imagini: obGlobal.obImagini.imagini}) // parsez ip catre pagina de home.
})

app.get(["/galerie_statica",], function(req, res){
    res.render("pagini/galerie_statica", {imagini: obGlobal.obImagini.imagini}) 
})


app.set("view engine", "ejs");
console.log("Folder index.js : ", __dirname);
console.log("Folder curent : ", process.cwd());
console.log("Calea fisierului : ", __filename);


obGlobal ={
    obErori: null,
    obImagini:null
}

// app.get("/ceva", function(req,res){
//     res.send("altceva");
// })

// app.get("/pagina", function(req,res){
//     res.write("pagina 1");
//     res.end();
// })

app.get(/^\/resurse\/[a-z0-9A-Z\/]*\/$/, function(req,res){
    afisareEroare(res, 403);
})

app.get("/*.ejs", function(req, res){
    afisareEroare(res,400);
})

app.get("/produse", function(req,res){
    console.log(req.query)
    var conditieQuery ="";
    if(req.query.tip){
        conditieQuery = ` where categorie= '${req.query.tip}'`
    }

    client.query("select * from unnest(enum_range(null::categ_produs))", function(err, rezOptiuni){
        console.log(rezOptiuni);
        console.log(err);
        
        client.query(`select * from produse_electronice ${conditieQuery}`, function(err,rez){
            if(err){
                console.log(err);
                afisareEroare(res, 2);
            }
            else{
                res.render("pagini/produse", {produse: rez.rows, optiuni: rezOptiuni.rows})
            }
        })

    })
})

app.get("/produs/:id", function(req, res){
    client.query(`select * from produse_electronice where id=${req.params.id}`, function(err, rez){
        if(err){
            console.log(err);
            afisareEroare(res, 2);
        }
        else{
            res.render("pagini/produs", {prod:rez.rows[0]})
        }
    })
})


app.get("/*", function(req, res){
    try{
        res.render("pagini"+req.url, function(err, rezRandare){
        // req.url => daca am localhost:8080/ceva, req.url = "ceva"
        // daca am eroare, va fi setat err; daca totul e bine, va fi setat rezRandare

        if(err){
            if(err.message.startsWith("Failed to lookup view"))
            afisareEroare(res, 404, "pagina negasita!", "Verificati URL-ul!!!")
            
            else {
                afisareEroare(res,-1);
            }
        }
        else{
            res.send(rezRandare);
        }   

        })
    }
    catch (err1){
        if (err1.message.startsWith("Cannot find module")){
            afisareEroare(res, 404, "Pagina negasita","Verificati URL-ul");

        }
        else{
            afisareEroare(res, -1);
        }
    }

})


function initErori(){
    let continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8"); //Sync -> nu trece la urmatoarea instructiune pana nu termina de citit
    console.log(continut);

    obGlobal.obErori = JSON.parse(continut) // transform in obiect
    

    obGlobal.obErori.eroare_default.imagine = path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)

    for(eroare of obGlobal.obErori.info_erori){
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    console.log(obGlobal.obErori)

}

initErori()

function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare= obGlobal.obErori.info_erori.find(function(elem){ 
                        return elem.identificator==identificator
                    });
    if(eroare){
        if(eroare.status)
            res.status(identificator)
        var titluCustom=titlu || eroare.titlu;
        var textCustom=text || eroare.text;
        var imagineCustom=imagine || eroare.imagine;


    }
    else{
        var err=obGlobal.obErori.eroare_default
        var titluCustom=titlu || err.titlu;
        var textCustom=text || err.text;
        var imagineCustom=imagine || err.imagine;


    }
    res.render("pagini/eroare", { //transmit obiectul locals
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom
})

}


function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;

    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini){
        [numeFis, ext]=imag.fisier.split(".");
        let caleFisAbs=path.join(caleAbs,imag.fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )
        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier )
        
    }
    console.log(obGlobal.obImagini)
}
initImagini();

app.listen(8080);