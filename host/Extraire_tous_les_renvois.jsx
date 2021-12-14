///////////////////// CORRIGER LA PROGRESSBAR pour qu'elle ferme auto/////////////////////////
function extractAllJSX() {
    // alert('function controlOnRefJSX() running');
    try{

        var savedPref = saveAndDisableLinkCheckPref();
    var ln = 'length';
    var oMyFuncJSX = new ScriptObject($.fileName);
    var myBook = app.activeBook;
    var logFolder=new Folder(myBook.filePath+"\/renvois");
        if(!logFolder.exists){
        logFolder.create();
    }
var extractionFile=setBookLogFile(myBook,LOG_CHILD_FOLDER,myBook.name+EXTRACT_LOG_PREFIX);
extractionFile.reset();

    var myBookContents = myBook.bookContents;
                    var openedArr=getOpenedBookContentNames(myBookContents);
                        if (openedArr.length != 0) {
            throw ('Veuillez fermer tous les documents du livre à traiter :\n' + openedArr.join('\n'));
        };
    debugln('step1', 1);
    var myProgBox = new ProgressBox2('Extraire les renvois',{multiline:false});
    myProgBox.grp2 = myProgBox.add('group');
    myProgBox.grp2.alignment='fill';
    myProgBox.field2=myProgBox.grp2.add('statictext',undefined,undefined);
        myProgBox.field.preferredSize.width=300;
    myProgBox.field2.preferredSize.width=300;
    myProgBox.field.text="Initialisation...";
    myProgBox.field.alignment='left';
// myProgBox.field2.justify='right';
        myLoop: for (var i = 0; i < myBookContents[ln]; i++) {
            var info={
                multi:true,
                index:i,
                indexMax:myBookContents[ln],
                bookContent:myBookContents[i],
                logFile:extractionFile,
                progressBox:myProgBox
            };
               info.progressBox.field2.text=  info.bookContent.name + " : " + (info.index+1).toString() + "\/" + info.indexMax;        
                //   info.progressBox.layout.layout();
            // alert(info.progressBox.field2.text);
            app.open(myBookContents[i].fullName,true);// FALSE PERMET D'OUVRIR LE FICHIER SANS OUVRIR DE FENETRE MAIS CE N EST PAS COMPATIBLE AVEC LE FONCTIONNEMENT DU SCRIPT
            var extractionRes = extraireRenvoisJSX(info);//Multi = true permet d'apporter des modifs à l'intérieur de controlOnRefCopyPasteJSX()
            var myDoc = app.activeDocument;
            myDoc.close(SaveOptions.NO);
        }; //FOR
        myProgBox.show();
        // myProgBox.hide();
        // myProgBox.close();
    }
    catch (e) {
        alert(e);
    }finally {
                delete myProgBox;
        restoreLinkCheckPref(savedPref);
    };

    // }
    //openExtractClose(progCounter);
    //progWin.close();
}

function extractAllJSX_OLD() {
    // alert('extractAllJSX() running');
    var oExtractAllJSX = new ScriptObject($.fileName);
    var debug = {
        '1': true
    };
    //var logName='Extraction_Des_Renvois.txt';
    var myBook = app.activeBook;
    var myBookContents = myBook.bookContents;

    function setProgWin() {
        var w = new Window('palette', 'Extraction des renvois (maintenir \'Esc\' pour arrêter)');
        w.labelFile = w.add('statictext', undefined, myBookContents[0].name);
        w.progBar = w.add('progressbar', undefined, 0, myBookContents.length);
        w.progBar.preferredSize.width = 300;

        //Pour pouvoir faire un cancel, il faut remplacer la loop par un enchainement avec callback et recursion....
        w.closeStatus = false;
        //~     var cancelBut=w.add('button',undefined,'Cancel');
        //~     cancelBut.onClick=function(){w.closeStatus=true;w.close();};
        return w;
    };

    var progWin = setProgWin();
    progWin.show();

    var progCounter = 0;
    var myKeyState = ScriptUI.environment.keyboardState;


    function openExtractClose(i) {

        for (var u = 0; u < 500; u++) { // BOUCLE FOR pour tester l'appui sur ESC et quitter
            myKeyState = ScriptUI.environment.keyboardState;
            if (myKeyState.keyName == 'Escape') {
                debugln('myKeyState =' + myKeyState.keyName, 1);
                progWin.closeStatus = true;
                break;
            };
            $.sleep(1);
        };
try{
        if (!progWin.closeStatus) {
            progWin.labelFile.text = myBookContents[i].name;
            debugln(progWin.labelFile.text, 1);
            app.open(myBookContents[i].fullName);
            var extractionRes = $.evalFile(oExtractAllJSX.JSXFolder + '\/Extraire_les_renvois.jsx');
            var myDoc = app.activeDocument;
            myDoc.close();
            i++;
            debugln('WWWWWWWWWWWWWWWWWW = ' + i, 1);
            progWin.progBar.value = i;
            if (i < myBookContents.length) {
                //alert('test');
                return openExtractClose(i);
            } else {
                progWin.hide();
                progWin.close();
            };

        };
        }catch(e){alert(e);};

    }
    openExtractClose(progCounter);
    //progWin.close();
}