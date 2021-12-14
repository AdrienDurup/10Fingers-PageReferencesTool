// extraireRenvoisJSX();
function extraireRenvoisJSX(info) {
    // alert('extraireRenvoisJSX() running...');
    // var thisScript = new ScriptObject($.fileName);
    // thisScript.logFolder = new Folder(thisScript.parentFolder.fsName + '\/' + 'log');
    // thisScript.logFileName = 'Extraction_Des_Renvois.tsv';
    // thisScript.logFile = new File(thisScript.logFolder + '\/' + thisScript.logFileName);
    try {
        // try {
        //     if (!thisScript.logFile.exists) {
        //         thisScript.logFile.create();
        //     };
        // } catch (e) {
        //     alert(e);
        // };

        //alert(thisScript.logFile.fsName);

        //var logName = 'Extraction_Des_Renvois.txt';
        var myDoc = app.activeDocument;
        //     var logFolder=myDoc.filePath;
        //     // if(!logFolder.exists){
        //     //     logFolder.create();
        //     // }
        // var extractionFile=new File(logFolder+"\/renvois\/"+myDoc.name+".extractionRenvoisBrute.txt");
        function isMulti(info, callb1, callb2) {
            if (info !== undefined && info.multi == true) {
                callb1();
            } else if (callb2 !== undefined) {
                callb2();
            };
        }
        var logFile, progressBox;
        isMulti(info,
            function() {
                logFile = info.logFile;
                progressBox = info.progressBox;
            },
            function() {
                logFile = new File(myDoc.fullName + ".extractionRenvoisBrute.tsv");
                progressBox = new ProgressBox2('fichier isolé : extraction des renvois');
            }
        );
        progressBox.ok = progressBox.add('button', undefined, 'ok');
        progressBox.ok.onClick = function() {
            progressBox.hide();
            progressBox.close();
        }
        progressBox.show();
        // progressBox.field.text = 'Initialisation...';

        var myPages = myDoc.spreads;
        var spreadsLen = myPages.length;
        var t1 = 0;
        var t2 = 0;

        var allItems = myDoc.allPageItems;
        var allTxtFrames = [];
        for (i = 0; i < allItems.length; i++) {
            if (allItems[i] instanceof TextFrame) {
                allTxtFrames.push(allItems[i]);
            };
        };
        allItems = allTxtFrames;
        //~ var allItems=myDoc.textFrames.everyItem().getElements();
        //$.writeln('NB textFrame items : ' + allItems.length);
        for (var i = 0; i < allItems.length; i++) {
            if (allItems[i].parentStory.contents !== '') {
                //    var styleToCheck=allItems[i].parentStory.appliedParagraphStyle.name;
                //         if(styleToCheck=='Texte mini'||styleToCheck=='acheter séparement texte de table'||styleToCheck=='Sous-titre produit'){//cherche certains types de texte seulement
                //RECHERCHE TOUS LES TEXTES QUI CONTIENNENT XXX
                var hasXXXre = new RegExp('XXX');
                var hasXXX = hasXXXre.test(allItems[i].parentStory.contents);
                if (hasXXX && allItems[i].parentPage !== null) {
                    //$.writeln(allItems[i].parentStory.contents);
                    //RECUP LE NUMERO DE PAGE 
                    var numPage = allItems[i].parentPage.name;
                    GetAndWrite(allItems[i].parentStory.contents, numPage);
                };

            };
            progressBox.update("Textes traités " + (i + 1) + '/' + allItems.length);
        };

        flashBox('Extraction terminée.', 100);

        function GetAndWrite(aTxt, pageNum) {
            //alert('GetAndWrite running');
            if (aTxt == '') {
                return false;
            };
            var aTxt = aTxt.replace('\n', '\ '); //remplace tous les retours à la ligne, forcés ou pas, par un espace

            //-------IMPOSSIBLE DE GERER "COMMENCE PAR DECO" DANS LA REGEXP----------
            //dans les lookahead et lookbehind, les caractères spécifiques à une langue ne fonctionnenent pas : exemple é et à. C'est pourquoi "Déco" et "créa" sont coupés 
            //en amont de la regex principale.
            //-------COUPER DECO AU DEBUT DU TEXTE :
            var getDecoRX = new RegExp('^((Déco)|(Créa)|(\\W*(Idée)(s)? créa)|(Acheter séparément)|(\\W+))', 'g');
            var cutTxt = aTxt.match(getDecoRX);
            if (cutTxt !== null) {
                aTxt = aTxt.substring(cutTxt[0].length);
            };
            //-------Fin de coupe----------------------------------------------------


            // var myRegex = new RegExp('[^):,\\s ][\\s\\S]*?((XXX\\W*?(à|et)[\\Wp]*?XXX)|(XXX))', 'g'); //ATTENTION : ULTRA ULTRA LENT. Tous les caractères avant XXX (a/et XXX) . Ne fonctionnent pas en inversant : (XXX)|(XXX à et XXX)=>  avec extendscript : devrait etre greedy mais est lazy
            var myRegex = new RegExp('[^):,\\s ][\\s\\S]*?XXX', 'g'); // cherche tous les XXX individuellement, on recollera ensuite les strings multi : [XXX] + [à XXX] et [XXX] + [et XXX]
            var arrTxt = aTxt.match(myRegex);
            if (arrTxt !== null && arrTxt.length != 0) {
                //t2++;$.writeln('modif n° : ' + t2);
                var isMultiPageRX = new RegExp('^\\W*(à|et)[\\Wp]*XXX', 'g'); //regex pour chercher si la ligne correspond à "à XXX" ou "et XXX"
                for (var i = 1; i < arrTxt.length; i++) { //Pour chaque élément de la story en cours, à partir de la deuxième occurrence:

                    var multiPageRes = isMultiPageRX.test(arrTxt[i]);
                    if (multiPageRes) { //si la ligne est du type à|et XXX
                        arrTxt[i - 1] += ' ' + arrTxt[i]; // la concaténer à la ligne précédente.
                        arrTxt[i] = ''; //vider la ligne courante devenue inutile
                    };
                }
                for (var i = 0; i < arrTxt.length; i++) { //Pour chaque élément de la story en cours :

                    if (arrTxt[i] !== '') { //Si la ligne n'est pas vide :
                        //arrTxt[i] = arrTxt[i].replace(/[\n\r]/g, '\ '); //élimine les retours à la ligne et retours forcés situés au milieu d'un élément
                        arrTxt[i] = arrTxt[i].replace(/[\n\r\t]/g, '\ '); //élimine les retours à la ligne et retours forcés et tabulation situés au milieu d'un élément
                        arrTxt[i] = arrTxt[i] + '\t' + pageNum; //Ajoute le numéro de page à la fin
                    };
                };
                var myString = arrTxt.join('\n') + '\n'; //convertit le tableau en chaîne de caractères
                myString = myString.replace(/\n{2,}/g, '\n'); // et supprime les doubles lignes crées par les entrées vides du tableau
                //remplacer les insécables (incompatibles avec l'écriture dans un fichier)
                myString = myString.replace(/[\ \ ]/g, '\ '); //remplace les espaces insécables et espaces insécables à chasse fixe par des espaces normaux.
                myString = myString.replace(/‑/g, '\-'); //remplace les tirets insécables par des tirets normaux.
                myString = myString.replace(/\/(m²|m2)/g, '\/m\u00B2'); //Au script de mise à jour, reappliquer lécrasement temporaire pour la correspondance des String pour comparaison
                myString = myString.replace(/\/(m³|m3)/g, '\/m\u00B3'); //Au script de mise à jour, reappliquer lécrasement temporaire pour la correspondance des String pour comparaison
                WriteLog2(logFile, myString, 'UTF-8');
            } else {
                //t1++;$.writeln('echec n° : ' + t1);
            };
        }

        // function GetAndWrite(aTxt, pageNum) {
        //     //alert('GetAndWrite running');
        //     if (aTxt == '') {
        //         return false;
        //     };
        //     var aTxt = aTxt.replace('\n', '\ '); //remplace tous les retours à la ligne, forcés ou pas, par un espace
        //     var desMots = "\(\[\\s\ 'ʼ\\-0\-9a\-zA\-ZàÀâÂäÄûÛüÜùÙîÎïÏéÉêÊèÈëËôÔöÖçÇœŒæÆ‑Øø\"\\n\]\|\,\(\?\=\\d\)\)\+"; //ATTENTION : Espace insécable invisible après \\s\ Les espaces insécables ne sont pas contenus dans \s. tiret insécable. tester \"
        //     var uneLettre = '\[0\-9a\-zA\-ZàÀâÂäÄûÛüÜùÙîÎïÏéÉêÊèÈëËôÔöÖçÇœŒæÆØø\]';
        //     var any = "\[\\s\ 'ʼ\\-\.,0\-9a\-zA\-ZàÀâÂäÄûÛüÜùÙîÎïÏéÉêÊèÈëËôÔöÖçÇœŒæÆ‑Øø\"\]\+"; //ATTENTION : Espace insécable invisible après le dernier \
        //     //TESTER RAJOUTER LES TAB et PAS DE PARENTHESE POUR LA GESTION DES PETITS TABLEAUX
        //     //var someTabs='\[\\t\]\*';
        //     var myRegex = new RegExp(uneLettre + desMots + '\\(' + any + 'XXX\\)', 'g');
        //     var arrTxt = aTxt.match(myRegex);
        //     if (arrTxt !== null) {
        //         t2++;
        //         //$.writeln('modif n° : ' + t2);
        //         for (var i = 0; i < arrTxt.length; i++) { //élimine les retours à la ligne et retours forcés situés au milieu d'un élément
        //             arrTxt[i] = arrTxt[i].replace(/[\n\r]/g, '\ ');
        //             arrTxt[i] = arrTxt[i] + '\t' + pageNum; //Ajoute le numéro de page à la fin
        //         };
        //         var myString = arrTxt.join('\n') + '\n';
        //         //remplacer les insécables (incompatibles avec l'écriture dans un fichier)
        //         myString = myString.replace(/[\ \ ]/g, '\ '); //remplace les espaces insécables et espaces insécables à chasse fixe par des espaces normaux.
        //         myString = myString.replace(/‑/g, '\-'); //remplace les tirets insécables par des tirets normaux.
        //         //$.writeln(myString);
        //         WriteLog(thisScript.logFolder, thisScript.logFileName, myString);
        //     } else {
        //         t1++;
        //         //$.writeln('echec n° : ' + t1);
        //     };
        // }
        // alert('done');

    } catch (e) {
        alert(e);
        progressBox.close();
        return;
    }

}