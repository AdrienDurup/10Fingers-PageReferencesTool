/* 1) Create an instance of CSInterface. */
var csInterface = new CSInterface();
/* 2) Make a reference to your HTML button and add a click handler. */

var extraireRenvoisB=document.querySelector("#extraireRenvois");
extraireRenvoisB.addEventListener("click",extraireRenvois);

var reduitRenvoisB=document.querySelector("#reduitRenvois");
reduitRenvoisB.addEventListener("click",reduitRenvois);

var majRenvoisB=document.querySelector("#majRenvois");
majRenvoisB.addEventListener("click",majRenvois);



/* 3) Write a helper function to pass instructions to the ExtendScript side. */
function extraireRenvois(){
  //alert('go1');
  try{
    csInterface.evalScript("extractAllJSX()");
  }catch(e){
    alert('erreur avec csInterface : '+e);
  };
}
function reduitRenvois(){
  //alert('go2');
  csInterface.evalScript("reduitRenvoisJSX()");
}
function majRenvois(){
  // alert('go2');
  csInterface.evalScript("majRenvoisJSX()");
}