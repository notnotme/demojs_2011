
            /****************************************************************/
            /****************************************************************/
            var demojsCanvas;   // The canvas where the demo will be rendered
            var offscreenCanvas; // Off screen canvas used to achieve some effect
            var main3D;
            var offscreen3D;
            var timer = 0;
            var exit;

            // Music
            var player = new music("YM");
            //player.stereo(true);
            player.LoadAndRun('data/frazer-if_pics_could_fly_endtune.ym');
            // /Music

            // 1 *****************************
            var offscreenGradient;
            var gradientColor;
            var gradColor = 0;
            // /1 ****************************

            // 2 *****************************
            var star = [];
            var starVert = [];
            var starOpacity;
            var starY;
            // The star vertex coord by !!M (not very accurate ;))
            starVert =
                    [
                        {x:0,     y:-400, z:0},
                        {x:100,   y:-100, z:0},
                        {x:400,   y:-100, z:0},
                        {x:150,   y:080,  z:0},
                        {x:280,   y:400,  z:0},
                        {x:0,     y:200,  z:0},
                        {x:-280 , y:400,  z:0},
                        {x:-150,  y:080,  z:0},
                        {x:-400,  y:-100, z:0},
                        {x:-100,  y:-100, z:0}
                    ];

            star =
                [
                    {p1:1, p2:5, p3:9, params: new MeshBasicMaterial({ color: 0xff0090, opacity:1})},
                    {p1:9, p2:5, p3:7, params: new MeshBasicMaterial({ color: 0xff0090, opacity:1})},
                    {p1:5, p2:6, p3:7, params: new MeshBasicMaterial({ color: 0xff0090, opacity:1})},
                    {p1:7, p2:8, p3:9, params: new MeshBasicMaterial({ color: 0xff0090, opacity:1})},
                    {p1:0, p2:1, p3:9, params: new MeshBasicMaterial({ color: 0xff0090, opacity:1})},
                    {p1:1, p2:2, p3:3, params: new MeshBasicMaterial({ color: 0xff0090, opacity:1})},
                    {p1:1, p2:3, p3:5, params: new MeshBasicMaterial({ color: 0xff0090, opacity:1})},
                    {p1:3, p2:4, p3:5, params: new MeshBasicMaterial({ color: 0xff0090, opacity:1})}
                ];
            // /2 ****************************

            // 3 *********************
            var scrolltext;
            var tinyScrolltext;
            var font = new image('data/Charset_DNS_DDro_Live_Font_BL.png');
            var bottomMask = new image('data/bmask.png');
            var tinyFont = new image('data/043.png');
            // /3 ********************

            // 4 ******************
            var rastx = 0;
            var rasters = new image('data/rasters.png');
            // /4 *****************

            // 5 ***************
            var ball  = [];
            ball[0] = new image('data/ball.png');
            var ballVert = [];
            for(var i=0; i<64; i++)
            {
                ballVert[i] = {x:Math.sin(i/4)*2, y:-16+(i*0.5), z:Math.cos(i/4)*2, img: 0};
                ballVert[64+i] = {x:-Math.sin(i/4)*2, y:-16+(i*0.5), z:-Math.cos(i/4)*2, img: 0};
            }
            // /5 **************

            // 6 ***************
            var imageNot = new image('data/!.png');
            var imageM = new image('data/M.png');
            var quadNot = [];
            var quadM = [];
            var quadVert = [];
            // The quad vertex coord
            quadVert =
                    [
                        {x:-1.5,  y:-1.5, z:0},
                        {x:1.5,   y:-1.5, z:0},
                        {x:1.5,   y:1.5,  z:0},
                        {x:-1.5,  y:1.5,  z:0}
                    ];

            quadNot =
                    [
                        {p1:0, p2:1, p3:2, u1:0,v1:0, u2:1,v2:0, u3:1,v3:1 ,params: new MeshBasicMaterial({ map: new Texture( imageNot.img ) })},
                        {p1:2, p2:3, p3:0, u1:1,v1:1, u2:0,v2:1, u3:0,v3:0 ,params: new MeshBasicMaterial({ map: new Texture( imageNot.img ) })}
                    ];

            quadM =
                [
                    {p1:0, p2:1, p3:2, u1:0,v1:0, u2:1,v2:0, u3:1,v3:1 ,params: new MeshBasicMaterial({ map: new Texture( imageM.img ) })},
                    {p1:2, p2:3, p3:0, u1:1,v1:1, u2:0,v2:1, u3:0,v3:0 ,params: new MeshBasicMaterial({ map: new Texture( imageM.img ) })}
                ];
            // /6 **************

            // 7
            var enter;
            var topImage = new image('data/top.png');
            var topScale;
            var triggerScroll;
            var main3DOffsetX;
            var drawStar;
            // /7
            /*
             * Main loop. Called each frame.
             */
            function go()
            {
                timer++;

                // Offscreen Canvas =================================================
                // 2 *****************************
                offscreen3D.group.rotation.z+=0.01;
                offscreen3D.group.scale.x = 0.6 + Math.sin((timer*2)%180 * 3.14 / 180) * 0.5;
                offscreen3D.group.scale.y = 0.6 + Math.sin((timer*2)%180 * 3.14 / 180) * 0.5;
                offscreen3D.group.scale.z = 0.6 + Math.sin((timer*2)%180 * 3.14 / 180) * 0.5;
                if(drawStar)
                {
                    if(starY < 0)
                    {
                        starY+=3;
                    }
                    offscreen3D.group.position.y = starY;
                    offscreen3D.draw();
                }
                // /2 ****************************

                // 1 *****************************
                gradColor += 0.5;
                var blue = parseInt(gradColor < 127 ? gradColor : 127).toString();
                var red = parseInt(gradColor < 55 ? gradColor : 55).toString();
                var rasterY = 0.5 + Math.sin(timer * 3.14 / 180) * 0.45;
                gradientColor =
                [
                    {color: 'rgba('+blue+',0,'+red+', 0.9)' ,  offset:0},
                    {color: 'rgba(64, 0, 164, 0)',             offset:rasterY},
                    {color: 'rgba('+blue+',0,'+red+', 0.9)' ,  offset:1}
                ];
                offscreenGradient = new grad(offscreenCanvas, gradientColor);
                offscreenGradient.drawH();
                // /1 ****************************
                if(starOpacity < 1)
                {
                    starOpacity += 0.01;
                }
                offscreenCanvas.draw(demojsCanvas, 0,0, starOpacity, 0, 1, 1);
                // /Offscreen Canvas ================================================

                // 5 ***************
                if(triggerScroll)
                {
                    if(main3DOffsetX < -550)
                    {
                        main3DOffsetX+=3;
                    }
                }
                main3D.group.rotation.y += 0.01;
                main3D.group.position.y = Math.sin(timer/4 * 3.14 / 180) * 900;
                main3D.group.position.x = main3DOffsetX;
                main3D.draw();
                // / 5 *************

                // 6 ***************
                // Rrotation
                main3D.group.children[128].rotation.y = main3D.group.children[129].rotation.y = main3D.group.children[130].rotation.y = -main3D.group.rotation.y + 0.4;
                main3D.group.children[128].rotation.y = main3D.group.children[130].rotation.y += Math.cos(timer * 3.14 / 180);
                main3D.group.children[129].rotation.y += Math.cos(timer * 3.14 / 180)*1.1;
                // Movement (cancel)
                main3D.group.children[128].position.y = -(Math.sin(timer/4 * 3.14 / 180)*9)-4;
                main3D.group.children[129].position.y = -(Math.sin(timer/4 * 3.14 / 180)*9)-0.5;
                main3D.group.children[130].position.y = -(Math.sin(timer/4 * 3.14 / 180)*9)+3.0;
                main3D.group.children[128].position.y += Math.cos(timer * 3.14 / 180)*0.7;
                main3D.group.children[129].position.y += Math.cos(timer * 3.14 / 180)*1.1;
                main3D.group.children[130].position.y += Math.cos(timer * 3.14 / 180)*0.7;
                // /6 **************

                // Bar ****************************************
                // Bottom
                demojsCanvas.line(0, 464, 640, 464, 32, '#000020');
                if(triggerScroll)
                {
                    tinyScrolltext.draw(456);
                }
                bottomMask.draw(demojsCanvas, 0, 448);
                // 4 ********************
                if((rastx-=4) < -1008)
                {
                    rastx = 0;
                }
                rasters.draw(demojsCanvas, rastx, 448);
                // /4 *******************

                // Top
                demojsCanvas.line(0, 32, 640, 32, 64, '#000020');
                if(triggerScroll)
                {
                    scrolltext.draw(16);
                }

                // 4 ********************
                bottomMask.draw(demojsCanvas, 640, 482, 1, 180, 1, 1);
                rasters.draw(demojsCanvas, rastx, 64);
                // /4 *******************
                // /Bar *********************************************

                // 7
                if(enter)
                {
                    if(topScale > 0)
                    {
                        topScale -= 0.005;
                        for(var i=0; i<15; i+=1)
                        {
                            topImage.draw(demojsCanvas, 320, 240, 1, timer, topScale*i, topScale*i);
                        }
                    }
                    else
                    {
                        triggerScroll = true;
                    }
                    if(timer === 60*15)
                    {
                        drawStar = true;
                    }
                }
                else
                {
                    if(topScale <= 1.5)
                    {
                        topScale += 0.005;
                        for(var i=0; i<15; i+=1)
                        {
                            topImage.draw(demojsCanvas, 320, 240, 1, timer, topScale*i, topScale*i);
                        }
                    }
                    if(timer === 60*62)
                    {
                        exit = true;
                    }
                }
                // This is the end?
                if (timer === 60*60)
                {
                    enter = false;
                }
                // /7

                if(!exit)
                {
                    requestAnimFrame(go);
                }
                else
                {
                    window.location = '../index.html?team=!!m';
                }
            }
            /*
             * Wait until the player to be loaded
             */
            function wait()
            {
                if(player)
                {
                    go();
                }
                else
                {
                    requestAnimFrame(wait);
                }
            }
            /*
             * Initialize all the scenes. And go main loop.
             */
            function init()
            {
                demojsCanvas = new canvas(640, 480, "demojsCanvas");
                offscreenCanvas = new canvas(640, 480);
                main3D = new codef3D(demojsCanvas, 900, 60, 1, 1600);
                main3D.group.scale.x = main3D.group.scale.y = main3D.group.scale.z = 100;
                main3D.group.position.x = -550;
                main3D.group.position.z = -300;
                offscreen3D = new codef3D(offscreenCanvas, 900, 45, 1, 1600);
                // 2 *****************************
                offscreen3D.faces(starVert, star, true, true);
                offscreen3D.group.position.x = 150;
                offscreen3D.group.position.y = 30;
                offscreen3D.group.position.z = 60;
                offscreen3D.group.rotation.x = -40 * (3.14 / 180);
                offscreen3D.group.rotation.y = 135 * (3.14 / 180);
                // /2 ****************************

                // 3 ************************
                font.initTile(32,32, 32);
                scrolltext = new scrolltext_horizontal();
                scrolltext.scrtxt="DEMOJS 2K12 - HELLO THERE !! WE ARE HAPPY TO GIVE YOU THIS MEGAINTRO AND WE HOPE THAT WILL MOTIVATE PEOPLE ALL AROUND THE PLACE TO MAKE SOME NICE DEMOS ;) THIS ONE USE A LIB CALLED CODEF, IT'S VERY EASY TO USE AND YOU HAVE JUST TO HAVE SOME IMAGINATION TO MAKE THE MAGIC... THANX TO NONAMENO, YOU WRITE SOME VERY USEFULL LIB, AND IT'S COOL TO USE IT! ....                ";
                scrolltext.init(demojsCanvas, font, 4);

                tinyFont.initTile(16,16, 32);
                tinyScrolltext = new scrolltext_horizontal();
                tinyScrolltext.scrtxt = "SPECIAL THANKS TO : PUNKFLOYD .. ZUUL .. THETA .. C2G .... AND .... NONAMENO .. NOP .. LATORTUE .. MARACUJA .. PONCE .. SAM .. ZERKMAN .. RAHOW .. MSK .... AND .... SORRY FOR THE PEOPLE I FORGOT HERE YOU KNOW I SHOULD STOP SMOKING CRACK AND I WILL BE ABLE TO REMEMBER YOU AS WELL BUT YEAH SORRY ....      ";
                tinyScrolltext.init(demojsCanvas, tinyFont, 5);
                // /3 ***********************

                // 5 *****************
                main3D.vectorball_img(ballVert, ball);
                // /5 ****************

                // 6 *****************
                main3D.faces(quadVert, quadM, true, true);
                main3D.faces(quadVert, quadNot, true, true);
                main3D.faces(quadVert, quadNot, true, true);
                main3D.group.children[128].rotation.z = main3D.group.children[129].rotation.z = main3D.group.children[130].rotation.z = 180 * 3.14 / 180;
                ///6 *****************

                // 7
                enter = true;
                topImage.setmidhandle(true);
                topScale = 1.5;
                starOpacity = 0;
                triggerScroll = false;
                main3DOffsetX = -1500;
                drawStar = false;
                // /7

                exit = false;
                starY = -1000;
                wait();
            }

            /****************************************************************/
            /****************************************************************/
