//TRIE ELIMINE LES DOUBLONS ET ECRIT DANS UN FICHIER DE LOG TEMPORAIRE
function reduitRenvoisJSX() {
    // alert('reduitRenvoisJSX');
    try {
        var reduitRenvoisJSX = new ScriptObj($.fileName);
            var myBook = app.activeBook;
        var extractionRes = setBookLogFile(myBook,LOG_CHILD_FOLDER,myBook.name+EXTRACT_LOG_PREFIX);
        var sortAndCleanRes = setBookLogFile(myBook,LOG_CHILD_FOLDER,myBook.name+SORTANDCLEAN_LOG_PREFIX);

        SortAndReduce(extractionRes, sortAndCleanRes);


        function SortAndReduce(logFile1, logFile2) {
            try {
                // alert('SortAndReduce running');
                //alert(logFile1);
                if (!logFile1.exists) {
                    alert('Opération impossible. Fichier introuvable.');
                    return false;
                };
                //if(logFile.exists){$.writeln('logFile.exists = '+logFile.exists);};   
                logFile1.open('r');
                var myFileContent = logFile1.read();
                logFile1.close();

                myFileContent = myFileContent.split('\n');
                //alert(myFileContent[0]);
                if (myFileContent[myFileContent.length - 1] == '') {
                    myFileContent.pop();
                };
                //alert(myFileContent.constructor==Array);
                myFileContent = myFileContent.sortAndUniqueSubStr();
                myFileContent = myFileContent.join('\r');
                // alert(myFileContent);

                reWriteLog(logFile2.parent, logFile2.name, myFileContent, 'UTF-8');
                flashBox("Nettoyage terminé.", 1000);

            } catch (e) {
                alert(e)
            };
        }
    } catch (e) {
        alert(e);
        return;
    };

}

Array.prototype.sortAndUniqueSubStr = function() {
    try {
        this.sort();
        var tmpArr = [this[0]];
        for (var i = 1; i < this.length; i++) {
            var priorLineArray = this[i].split('\t');
            var tmpLineArray = tmpArr[tmpArr.length - 1].split('\t');
            var PriorSubstr = priorLineArray[0];
            var tmpSubstr = tmpLineArray[0];
            if (PriorSubstr != tmpSubstr) {
                $.write('pushing line...');
                tmpArr.push(this[i]);
                $.writeln('pushed');
            } else {
                var PriorPageNum = priorLineArray[1];
                var tmpPageNums = tmpLineArray[1];
                var numRx = new RegExp(PriorPageNum);
                var numTest = numRx.test(tmpPageNums);
                $.writeln('page ' + PriorPageNum + ' already added for "' + tmpArr[tmpArr.length - 1] + '" ?...' + numTest);
                if (!numTest) {
                    $.write('updating page numbers...');
                    tmpArr[tmpArr.length - 1] = tmpArr[tmpArr.length - 1] + ', ' + priorLineArray[1];
                    $.writeln('page numbers updated \n');
                }; //IF
            }; //else
        }; //for
        return tmpArr;
    } //try
    catch (error) {
        $.writeln('uniqueVal() method failed : ' + error);
    };
} //func