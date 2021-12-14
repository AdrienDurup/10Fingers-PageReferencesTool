//UPDATE LES RENVOIS DE PAGE
//BUG : au moment du remplacement, applique le style de paragraphe...//TOUJOURS DANS CETTE VERSION ?
//AJOUTER UN CONTROLE SUR LE FORMAT DECRITURE DES PAGES DANS LE LOG (numeros seuls, séparés par des virgules)
//Séparation des cellules dans le fichier de renvois : <TAB> au lieu de ';'. plus simple quand on utilise googlesheet
var debug = {
    '1': true
};

function majRenvoisJSX() {
    app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Importer les renvois de page");
}

function main() {
    //alert('maj running');
    try {
        var majRenvoisJSXScript = new ScriptObj($.fileName);
        majRenvoisJSXScript.initializeConfigFile();
        majRenvoisJSXScript.log1 = majRenvoisJSXScript.initializeLogFile();
        var myMajFile = File.openDialog();
        if (myMajFile == undefined) {
            return;
        };
        myMajFile.ext();
        if (myMajFile.ext !== ('tsv' || 'TSV')) {
            alert('Ce format de fichier n\'est pas compatible. Choisissez un fichier TSV.');
            return;
        };

        // var logName = myMajFile.shortName();
        // alert(logName);

        var sep = '\t'; //SEPARATEUR de cellules
        //~ var sep=';';
        var myDoc = app.activeDocument;
        //~ var allItems=myDoc.textFrames.everyItem().getElements();
        var allItems = myDoc.allPageItems;
        var allTxtFrames = [];
        for (i = 0; i < allItems.length; i++) {
            if (allItems[i] instanceof TextFrame) {
                allTxtFrames.push(allItems[i]);
            };
        }
        allItems = allTxtFrames.slice();
        // debugln('dernier index : ' + allItems.length, 1);
        var myFileContent = importRenvois();
        // debugln('texte index 520 : ' + allItems[520].parentStory.contents, 1);
        // debugln('texte index 521 : ' + allItems[521].parentStory.contents, 1);
        // debugln('texte index 529 : ' + allItems[529].parentStory.contents, 1);
        for (var i = 0; i < allItems.length; i++) {
            // debugln('index : ' + i, 1);
            if (allItems[i].parentStory.contents !== '') {
                var styleToCheck = allItems[i].parentStory.appliedParagraphStyle.name;
                // if (styleToCheck == 'Texte mini' || styleToCheck == 'acheter séparement texte de table') { //POURQUOI LIMITER LES STYLES ? A VOIR PLUS TARD.... (souci pour les focus...)
                //     try {
                GetAndUpdate(allItems[i].parentStory);
                // } catch (e) {
                //     debugln('erreur : ' + e, 1);
                // };
                //};
            };
        };

        alert('Mise à jour terminée.');

        function importRenvois() {
            if (!myMajFile.exists) {
                alert('Opération impossible. Fichier introuvable.');
                return false;
            };
            myMajFile.open('r');
            readResult = myMajFile.read();
            myMajFile.close();
            readResult = readResult.split('\n');
            if (readResult[readResult.length - 1] == '') {
                readResult.pop();
            };
            //debugln(readResult,1);
            return readResult;
        }

        function GetAndUpdate(aStory) { //EN COURS DE MODIF

            // LE SPLUS SIMPLE : FAIRE UN TABLEAU DES RENVOIS et faire un RECHERCHER MODIFIER
            // debugln('GetAndUpdate() started', 1);
            if (aStory !== null) {
                // debugln('story object not null', 1);
                var aTxt = aStory.contents;
                //var rxXXX = /(XXX)(\s?(et))/;
                //var arrContent=aStory.contents.split();
                var arrTxt = formatStoryElements(aTxt);
                // debugln(arrTxt.join('\n'),1);
            };
            if (arrTxt !== null) {
                var arrRenvois = [];
                for (var i = 0; i < arrTxt.length; i++) { //pour chaque élément d'une story
                    // debugln('arrTxt with length '+arrTxt.length+' = '+arrTxt.join('\n'), 1);
                    var found = false;
                    loop1: for (var j = 0; j < myFileContent.length; j++) { //pour chaque ligne du log
                        var tmpArr = myFileContent[j].split(sep);
                        var tmpString = tmpArr[0];
                        var tmpString2 = arrTxt[i];
                        //debugln(encodeURIComponent(tmpString2)+' = '+encodeURIComponent(tmpString),1);//POUR VERIFIER S'IL Y A DES PROBLEMES DE CARACTERES NON GERES

                        if (tmpString == tmpString2) { //Si élément de story = élément[0] de ligne de log
                            debugln('tmpString2 is found : ' + (tmpString == tmpString2), 1);
                            //Essayons de savoir combien de XXX sont attendus normalement :
                            var caseXxx;
                            var rxWhichXxxCase = /(XXX)([\sàa,etp\.]*)(XXX)?/; //A TESTER (attention permet XXXXXX tout collé mais on a besoin des 3 groupes de capture. on pourait faire des sous groupes mais ça complique pour pas grand chose)
                            var whichCaseArr = arrTxt[i].match(rxWhichXxxCase);
                            //Essayons de savoir si on doit modifier cet état
                            var testR = new RegExp(/^r:/);
                            var newElement = arrTxt[i].toString();
                            var replacementToken = testR.test(tmpArr[1]);
                            var nbXxx = tmpArr[1].split(',').length;
                            if (whichCaseArr !== null && !replacementToken) { //Sans token r: 
                                // debugln('Pas de token r: . whichCaseArr[0] = ' + whichCaseArr[0], 1);
                                // debugln('whichCaseArr[1] = ' + whichCaseArr[1], 1);
                                // debugln('whichCaseArr[2] = ' + whichCaseArr[2], 1);
                                // debugln('whichCaseArr[3] = ' + whichCaseArr[3], 1);
                                // debugln('whichCaseArr[4] = ' + whichCaseArr[4], 1);
                                if (whichCaseArr[3] == undefined && nbXxx == 1) { //OK
                                    debugln('case un seul XXX', 1);
                                    arrRenvois.push(tmpArr[1]);
                                } else if (whichCaseArr[3] !== undefined && nbXxx == 2) { //OK
                                    debugln('case deux XXX', 1);
                                    var myNums = tmpArr[1].split(',');
                                    arrRenvois.push(myNums[0] + whichCaseArr[2] + myNums[1]); // ex : 321 + à + 322 (les espaces sont contenus dans whichCaseArr[2])
                                } else {
                                    debugln('Chérie, ça va breaker !', 1);
                                    break loop1;
                                };

                            } else if (whichCaseArr !== null && replacementToken) { //Avec token r:
                                arrRenvois.push(tmpArr[1].split(':')[1]);
                            }; //FIN ELSE IF

                            found = true;
                            break loop1;
                        };
                    }; //FIN FOR
                    //PREVOYONS UN CAS VIDE POUR SAUTER UN REMPLACEMENT, SI IL N YA PAS EU DE CORRESPONDANCE ou autre
                    if (!found) {
                        arrRenvois.push('ZZZ');
                        debugln('push ZZZ !', 1);
                    };
                }; //FIN FOR
                // debugln("arrRenvois length : "+arrRenvois.length+' ==> '+ arrRenvois.join('\n'),1);

                var rxGetXxx = /XXX([\sàa,etp.]+XXX)?/; //OK
                var rxGetXxxStr = "XXX([\\sàa,etp.]+XXX)?"; //OK
                for (var i = 0; i < arrRenvois.length; i++) {
                    //REMPLACER PAR FINDREPLACE !
                    findReplaceEasy(aStory, rxGetXxxStr, arrRenvois[i]);
                    //aStory.contents = aStory.contents.replace(rxGetXxx, arrRenvois[i]);//OK
                    //aStory.contents = aStory.contents.replace(/ZZZ/g,'XXX');//OK remettre POUR LA PROD ?
                };
                findReplaceAll('ZZZ', 'XXX');
                debugln(aStory.contents, 1);
            }; //FIN IF
        }
    } catch (e) {
        alert(e);
    };
}