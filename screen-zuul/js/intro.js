
var zuul_introStandalone = false;
//music
var zuul_musicStopped = false;
var zuul_music;
// offscreen canvas
var zuul_offscreen_screen1;
// txt screen 1
var zuul_txt_screen1;
// scrolltext identifier screen 1
var zuul_scrolltext_screen1;
// logo
var zuul_logo_canvas;
var zuul_logo_fx;
// color line;
var zuul_rastx = 0;
var zuul_rasters;
var zuul_sinfx;
var zuul_myfxbg = [
                    {value: 0, amp: 8, inc:0.03, offset: -0.05},
                    {value: 0, amp: 4, inc:0.06, offset:  0.08}
                  ];


//canvas : main screen
var zuul_screen;
// top logo
// fonts image identifier screen 1
var zuul_fonts_screen1;
// moiray image
var zuul_moiray;
// frame counter
var zuul_count = 0;
//timestamp
var zuul_temps = 0;


var zuul_byebye = function() {
    if (!zuul_musicStopped && !zuul_introStandalone) {
        if (this.zuul_music) {
            this.zuul_music.pause();
        }
        window.location.href = '../index.html?team=zuul';
    }
};

var zuul_cassosKey = function() {
    if (window.addEventListener) {
        window.addEventListener("keydown", function(key) {
            if (key.keyCode === 32 || key.keyCode === 27) {
                this.zuul_byebye();
            }
        }, false);
    }
};

var zuul_isUndefined = function(v) {
    return v === undefined;
};

var zuul_createCanvas = function(w, h, id_name) {
    if (this.zuul_isUndefined(id_name)) {
        return new canvas(w, h);
    }
    return new canvas(w, h, id_name);
};

var zuul_initOffscreenScreen = function() {
    //play music
    if (!this.zuul_musicStopped) {
        this.zuul_music = document.getElementById('music');
        this.zuul_music.play();
    }
    // initialize offscreen canvas
    this.zuul_offscreen_screen1 = this.zuul_createCanvas(640, 480);
    this.zuul_sinfx = new FX(this.zuul_offscreen_screen1, this.zuul_screen, this.zuul_myfxbg);
    this.zuul_rasters = new image('effects/rasters.png');
    this.zuul_fonts_screen1 = new image("fonts/006.png");
    this.zuul_fonts_screen1.initTile(32,32,32);
    this.zuul_scrolltext_screen1 = new scrolltext_horizontal();
    this.zuul_scrolltext_screen1.scrtxt = "                      ZUUL AND !!M ARE PROUD TO PRESENT THIS LIL' PRODUCTION ... GREETS GOES TO: EL MATADORS, WAGANONO, PAPYTRAP, KR8VITY, TBX (TWITTER), MSUICHE (TWITTER), NICOLASBRULEZ (TWITTER), AND ALL DEMOJS SCENERS...                                ";
    this.zuul_scrolltext_screen1.init(this.zuul_offscreen_screen1, this.zuul_fonts_screen1, 3);

    // top logo
    this.zuul_fonts_screen1 = new image("fonts/map3.png");
    this.zuul_fonts_screen1.initTile(80,62,32);
    this.zuul_logo_canvas = this.zuul_createCanvas(640,80);
    this.zuul_logo_fx = new FX(this.zuul_logo_canvas, this.zuul_screen, this.zuul_myfxbg);
};

var zuul_init = function() {
    this.zuul_temps = Date.now();
    //addstats();
    if (!this.zuul_introStandalone) {
        this.zuul_cassosKey();
    }
    this.zuul_screen = this.zuul_createCanvas(640,480, "djs2012");
    this.zuul_moiray = new image('effects/anneaux.png');
    this.zuul_moiray.setmidhandle(true);
    this.zuul_initOffscreenScreen();
    this.zuul_render();
};

var zuul_renderOffscreenScreen = function() {
    this.zuul_offscreen_screen1.clear();

    // Bar ****************************************
    // Bottom
    this.zuul_offscreen_screen1.line(0, 480-32, 640, 480-32, 64, '#000000');
    if((this.zuul_rastx-=4) < -1008) this.zuul_rastx = 0;
    this.zuul_scrolltext_screen1.draw(480-32-16);
    this.zuul_rasters.draw(this.zuul_offscreen_screen1, this.zuul_rastx, 480-64);
    // /4 *******************

    // Top
    this.zuul_offscreen_screen1.line(0, 48, 640, 48, 96, '#000000');
    this.zuul_rasters.draw(this.zuul_offscreen_screen1, this.zuul_rastx, 96);
    // /Bar *********************************************
    this.zuul_sinfx.siny(0,0);
};

var zuul_render = function(time) {
    //console.log(time);

    //updatestats();

    this.zuul_count += 2;
    this.zuul_screen.fill('#000000');

    //console.log(time - temps);
    if (!this.zuul_introStandalone) {
        if (time - this.zuul_temps > 60 * 1.5 * 1000) {
            this.zuul_byebye();
            return;
        }
    }

    var x = Math.sin((this.zuul_count*1.5) * 3.14/180)*16;
    var y = Math.sin(this.zuul_count * 3.14/180)*16;
    var xx = Math.cos(this.zuul_count * 3.14/180)*16;
    var yy = Math.cos((this.zuul_count*1.5) * 3.14/180)*16;

    var s = 2.5 + (Math.cos((this.zuul_count*1.5) * 3.14/180) * 0.35);


    //this.zuul_moiray.draw(this.zuul_screen, 320-172+x, 240-172+y, 1, 0, s, 2.5);
    //this.zuul_moiray.draw(this.zuul_screen, 310-172+xx, 240-172+yy, 1, 0, 2.5, s);

    //this.zuul_moiray.draw(this.zuul_screen, 320-370+x, 240-410+y, 1, 0, s, 2.5);
    //this.zuul_moiray.draw(this.zuul_screen, 310-370+xx, 240-410+yy, 1, 0, 2.5, s);
    if (window.chrome) {
        this.zuul_moiray.draw(this.zuul_screen, 320-370+x, 240-410+y, 1, 0, s, 2.5);
        this.zuul_moiray.draw(this.zuul_screen, 310-370+xx, 240-410+yy, 1, 0, 2.5, s);
    } else {
        this.zuul_moiray.draw(this.zuul_screen, ((this.zuul_screen.width/2-this.zuul_moiray.img.width/2)+x)*s, ((this.zuul_screen.height/2-this.zuul_moiray.img.height/2)+y)*2.5, 1, 0, s, 2.5);
        this.zuul_moiray.draw(this.zuul_screen, ((this.zuul_screen.width/2-this.zuul_moiray.img.width/2)+xx)*2.5, ((this.zuul_screen.height/2-this.zuul_moiray.img.height/2)+yy)*s, 1, 0, 2.5, s);
    }

    //console.log("x = " + x + "y = " +y);
    //console.log("xx = " + xx + "yy = " + yy);

    this.zuul_screen.line(0, 480-16, 640, 480-16, 32, '#000000');
    this.zuul_screen.line(0, 0, 640, 0, 32, '#000000');
    this.zuul_renderOffscreenScreen();

    // top logo
    //screen.line(200, 48, 440, 48, 64, '#FF0000');
    this.zuul_logo_canvas.clear();
    this.zuul_logo_canvas.fill('#000000');
    this.zuul_fonts_screen1.print(this.zuul_logo_canvas, "ZUUL", (640 - (80 * 4)) / 2, 15 , 1, 0, undefined, 62);
    this.zuul_logo_fx.sinx(0,0);

    requestAnimFrame(this.zuul_render);
};

