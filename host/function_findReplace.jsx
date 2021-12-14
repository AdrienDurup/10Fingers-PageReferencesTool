function findReplaceEasy(story, whatStr, withStr) {//MODIFIER AVEC GREP et gestion de tableau et cibler une story particulière

    app.findTextPreferences = NothingEnum.nothing; // now empty the find what field!!! that's important!!!
    app.changeTextPreferences = NothingEnum.nothing; // empties the change to field!!! that's important!!!

    // some settings
    app.findChangeGrepOptions.includeFootnotes = true;
    app.findChangeGrepOptions.includeHiddenLayers = false;
    app.findChangeGrepOptions.includeLockedLayersForFind = false;
    app.findChangeGrepOptions.includeLockedStoriesForFind = true;
    app.findChangeGrepOptions.includeMasterPages = true;

    app.findGrepPreferences.findWhat = whatStr;
    //app.changeGrepPreferences.changeTo = withStr;
    // story.changeGrep();//Change All
    // and now hit the button
    try{
    var target=story.findGrep()[0].contents=withStr;
    }catch(e){
alert('erreur avec withStr : '+withStr);
    };
    app.findGrepPreferences = NothingEnum.nothing; // now empty the find what field!!! that's important!!!
    app.changeGrepPreferences = NothingEnum.nothing; // empties the change to field!!! that's important!!!
    // we are done
};

function findReplaceAll(whatStr, withStr) {//MODIFIER AVEC GREP et gestion de tableau et cibler une story particulière

    app.findTextPreferences = NothingEnum.nothing; // now empty the find what field!!! that's important!!!
    app.changeTextPreferences = NothingEnum.nothing; // empties the change to field!!! that's important!!!

    // some settings
    app.findChangeGrepOptions.includeFootnotes = true;
    app.findChangeGrepOptions.includeHiddenLayers = false;
    app.findChangeGrepOptions.includeLockedLayersForFind = false;
    app.findChangeGrepOptions.includeLockedStoriesForFind = true;
    app.findChangeGrepOptions.includeMasterPages = true;

    app.findGrepPreferences.findWhat = whatStr;
    app.changeGrepPreferences.changeTo = withStr;

    // and now hit the button
    app.activeDocument.changeGrep();

    app.findGrepPreferences = NothingEnum.nothing; // now empty the find what field!!! that's important!!!
    app.changeGrepPreferences = NothingEnum.nothing; // empties the change to field!!! that's important!!!
    // we are done
};