/* READ URL GET VARIABLE */
function getUrlVars() {
    var vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
var groupe = getUrlVars()["team"];
var test = (groupe || 0);
if(! test) {
    groupe="mainmenu";
}

/* TITLE */
var mytitle=new image('graphics/titre.png');
var mybgtitle=new image('graphics/bgtitle.jpg');
var mybgtitleX=0;
var mybgtitlemove=-1;

/* BACKGROUND */
var mybackground=new image('graphics/background.jpg');
var mybackgroundX=0;
var mybackgroundXmax=-1280;
var mybackgroundmove=-2;

/* SCROLLTEXT */
var myfont = new image('graphics/font.png');
var myscrolltext;

/* BACKGROUND SCROLLTEXT */
var mybgfont=new image('graphics/bgfont.jpg');
var mybgfontX=0;
var mybgfontmove=-4;

/* CHARLY */
var mycharly=new image('graphics/charly.png');
mycharly.setmidhandle();
mycharly.initTile(84,115);
var nbcharly=0;
var charlyX=320;
var charlyY=160;
var charlymove=0.1;
var charlymin=0;
var charlymax=8;
var myverticaldisplay=new Array(0, 8, 12, 15, 17, 19, 21, 22, 23, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 34, 35, 35, 36, 36, 37, 37, 38, 38, 38, 38, 38, 39, 39, 39, 39, 39, 39, 40, 40, 40, 40);
var myverticaloffset=0;
var myverticaloffsetplus=0.3;

/* CANVAS */
var mycanvas;

/* LOADING */
var mybigopacity=1;
var myloadingopacity=0;
var myloading = new image('graphics/loading.png');

 /* CREDITS/GREETINGS */
var mycreditsopacity=0;
var mycredits = new image('graphics/credits.png');
var mycreditscheck=0;
var mycreditsoffset=0.002;

/* CHANGE VARIABLES WITH TEAM */
if (groupe==="mainmenu") {
    var mybackgroundX=0;
    var mybackgroundXmax=-1280;
    var mybackgroundmove=-2;
    var charlymove=0.1;
    var nbcharly=0;
    var charlymin=0;
    var charlymax=8;
    var myurl="./screen-zuul/index.html";
    var mytext="    HOLA LOS BASTARDOS!  ";
    }
if (groupe==="!!m") {
    var mybackgroundX=0;
    var mybackgroundXmax=-960;
    var mybackgroundmove=-2;
    var charlymove=0.1;
    var nbcharly=0;
    var charlymin=0;
    var charlymax=8;
    var myurl="./screen-credits/index.html";
    var mytext="    !!M          ";
    }
if (groupe==="punkfloyd") {
    var mybackgroundX=-640;
    var mybackgroundXmax=0;
    var mybackgroundmove=2;
    var charlymove=0.1;
    var nbcharly=9;
    var charlymin=9;
    var charlymax=16;
    var myurl="./screen-!!m/index.html";
    var mytext="    PUNKFLOYD     ";
    }
if (groupe==="zuul") {
    var mybackgroundX=-1280;
    var mybackgroundXmax=-640;
    var mybackgroundmove=2;
    var charlymove=0.1;
    var nbcharly=9;
    var charlymin=9;
    var charlymax=16;
    var myurl="./screen-pf/index.html";
    var mytext="    ZUUL     ";
    }
if (groupe==="credits") {
    var mybackgroundX=0;
    var mybackgroundXmax=-1280;
    var mybackgroundmove=0;
    var charlymove=0.1;
    var nbcharly=0;
    var charlymin=0;
    var charlymax=8;
    var myurl="./screen-zuul/index.html";
    var mytext="    HOLA LOS BASTARDOS!  ";
    var mybigopacity=0;
    }

/* MUZAK */
var player = new music("YM");
player.LoadAndRun('music/Union Demo - Alloy Run.ym');

function go(){
	var mycharlyopacite = 0;

    /* CANVAS BACKGROUND : BLACK */
    mycanvas.fill('#000000');

    /* MOVE BACKGROUND TITLE */
    if (mycreditscheck===0) {
        mybgtitle.draw(mycanvas,mybgtitleX,6,mybigopacity);
        mybgtitleX+=mybgtitlemove;
        if (mybgtitleX<-614) {
            mybgtitleX=0;
        }
    }

    /* CREDITS & GREETINGS */
    if (mycreditscheck===1) {
        myloadingopacity=0;
        mycredits.draw(mycanvas,0,0,mycreditsopacity);
        mycreditsopacity += mycreditsoffset;
        if (mycreditsopacity>=1) {
            mycreditsoffset=-0.004;
        }
        if (mycreditsopacity<=0) {
            mycreditsoffset=0;
            mycreditsopacity=0;
        }
    }

    /* LOADING */
    myloading.draw(mycanvas,226,218,myloadingopacity);

    /* TITLE */
    if (mycreditscheck===0) {
        mytitle.draw(mycanvas,0,0,mybigopacity);
    }

    /* MOVE BACKGROUND */
    if (mycreditscheck===0) {
        mybackground.draw(mycanvas,mybackgroundX,140,mybigopacity);
        mybackgroundX+=mybackgroundmove;
    }

    /* TEAM ACTION */
    if (groupe==="mainmenu") {
        if(mybackgroundX<=mybackgroundXmax) {
            mybackgroundmove=0;
            mycharlyopacite=0;
            mybigopacity=0;
            myloadingopacity=1;
            document.location.href = myurl;
            return;
        }
    }

    if (groupe==="zuul") {
        if(mybackgroundX>=mybackgroundXmax) {
            mybackgroundmove=0;
            mycharlyopacite=0;
            mybigopacity=0;
            myloadingopacity=1;
            document.location.href = myurl;
            return;
        }
    }

    if (groupe==="punkfloyd") {
        if(mybackgroundX>=mybackgroundXmax) {
            mybackgroundmove=0;
            mycharlyopacite=0;
            mybigopacity=0;
            myloadingopacity=1;
            document.location.href = myurl;
            return;
        }
    }

    if (groupe==="!!m") {
        if(mybackgroundX<=mybackgroundXmax) {
            mybackgroundmove=0;
            mycharlyopacite=0;
            mybigopacity=0;
            myloadingopacity=1;
            //mycreditscheck=1;
            document.location.href = myurl;
            return;
        }
    }

    /* MOVE BACKGROUND SCROLLTEXT */
    if (mycreditscheck===0) {
        mybgfont.draw(mycanvas,mybgfontX,400,mybigopacity);
        mybgfontX+=mybgfontmove;
        if(mybgfontX<-1920) {
            mybgfontX=-960;
        }
    }

    /* MOVE SCROLLTEXT */
    if (mycreditscheck===0) {
        myscrolltext.draw(400);
    }

    /* MOVE CHARLY */
    if (mycreditscheck===0) {
        mycharly.drawTile(mycanvas,nbcharly,charlyX,charlyY,mybigopacity,0,1,1);
        nbcharly+=charlymove;
        if(nbcharly>=charlymax) {
            nbcharly=charlymin;
        }
    }

    /* VERTICAL DISPLAY */
    charlyY = 250 + myverticaldisplay[Math.round(myverticaloffset)];
    myverticaloffset += myverticaloffsetplus;
    if(myverticaloffset>39) {
        myverticaloffsetplus=0;
    }
    if (groupe==="!!m" || groupe==="mainmenu") {
        if(mybackgroundX<=mybackgroundXmax+262) myverticaloffsetplus=-0.3;
    }
    if (groupe==="punkfloyd" || groupe==="zuul") {
        if(mybackgroundX>=mybackgroundXmax-262) myverticaloffsetplus=-0.3;
    }

    requestAnimFrame( go );
}

function init(){
    mycanvas=new canvas(640,480,"main");
    myfont.initTile(64,32,32);
    myscrolltext = new scrolltext_horizontal();
    myscrolltext.scrtxt= mytext;
    myscrolltext.init(mycanvas,myfont,3,0 ,32, 32);

    go();
}
