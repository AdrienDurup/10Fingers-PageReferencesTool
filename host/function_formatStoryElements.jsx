function formatStoryElements(aTxt){//RETOURNE UN TABLEAU
            // debugln('formatStoryElements() running',1);
if(aTxt==null){
    return null;
};

        if (aTxt == '') {
            return false;
        };
        var aTxt = aTxt.replace(/\n/g, '\ '); //remplace tous les retours à la ligne et tabulation, forcés ou pas, par un espace

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

        var myRegex = new RegExp('[^):,\\s ][\\s\\S]*?XXX', 'g'); // cherche tous les XXX individuellement, on recollera ensuite les strings multi : [XXX] + [à XXX] et [XXX] + [et XXX]
        var arrTxt = aTxt.match(myRegex);
        if (arrTxt !== null && arrTxt.length != 0) {
            //t2++;$.writeln('modif n° : ' + t2);
            var isMultiPageRX = new RegExp('^\\W*(à|et)[\\Wp]*XXX', 'g');//regex pour chercher si la ligne correspond à "à XXX" ou "et XXX"
            for (var i = 1; i < arrTxt.length; i++) { //Pour chaque élément de la story en cours, à partir de la deuxième occurrence:

                var multiPageRes = isMultiPageRX.test(arrTxt[i]);
                if (multiPageRes) { //si la ligne est du type à|et XXX
                    arrTxt[i - 1] += ' ' + arrTxt[i]; // la concaténer à la ligne précédente.
                    arrTxt[i] = ''; //vider la ligne courante devenue inutile
                };
            }
            for (var i = 0; i < arrTxt.length; i++) { //Pour chaque élément de la story en cours :

                if (arrTxt[i] !== '') { //Si la ligne n'est pas vide :
                    arrTxt[i] = arrTxt[i].replace(/[\n\r\t]/g, '\ '); //élimine les retours à la ligne et retours forcés et tabulation situés au milieu d'un élément. EST CE QU CA NE FAIT PAS DOUBLON AVEC REGEX DU DEBUT sur aTxt
                };
            };
            var myString = arrTxt.join('\n') + '\n'; //convertit le tableau en chaîne de caractères
            myString = myString.replace(/\n{2,}/g, '\n'); // et supprime les doubles lignes crées par les entrées vides du tableau
            //remplacer les insécables (incompatibles avec l'écriture dans un fichier)
            //RAJOUTER LA GESTION DES ESPACES \uE2082 ? Pas besoin, pris en compte dans les espaces normaux
            myString = myString.replace(/[\u202F\u00a0]/g, ' '); //remplace les espaces insécables et espaces insécables à chasse fixe par des espaces normaux.
            // myString = myString.replace(/[\ \ ]/g, '\ '); //remplace les espaces insécables et espaces insécables à chasse fixe par des espaces normaux.
            myString = myString.replace(/‑/g, '\-'); //remplace les tirets insécables par des tirets normaux.
           myString = myString.replace(/\/(m²|m2)/g,'\/m\u00B2');//Au script de mise à jour, reappliquer lécrasement temporaire pour la correspondance des String pour comparaison
           myString = myString.replace(/\/(m³|m3)/g,'\/m\u00B3');//Au script de mise à jour, reappliquer lécrasement temporaire pour la correspondance des String pour comparaison
var finalArray = myString.split('\n');
if(finalArray[finalArray.length-1]==''){
    finalArray.pop();
};
return finalArray;
        } else {
            return null;
            //t1++;$.writeln('echec n° : ' + t1);
        };

}