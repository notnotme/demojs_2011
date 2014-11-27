function Plasma(gl, canvas, x, y, width, height, paletteImage) {
    this.canvas = canvas;
    this.gl = gl;
    this.squareVerticesBuffer = null;
    this.mvMatrix = null;
    this.shaderProgram = null;
    this.vertexPositionAttribute = null;
    this.perspectiveMatrix = null;
    this.squareVerticesTextureCoordsBuffer = null;
    this;deformTexture = null;
    this.paletteTexture;
    this.paletteImage = paletteImage;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.isMoving = false;
    this.currentMove = 0.0;
    this.moveDuration = 200.0; // in ms
    this.moveFrequency = 949 // in ms



    this.init = function() {
        var gl = this.gl;

        this.initMatrices();

        this.initTextures();

        this.initShaders();

        this.initBuffers();

        this.startTimestamp = Date.now();
        this.lastMove = Date.now();
    };

    this.initMatrices = function() {
        this.perspectiveMatrix = makeOrtho(0.0, 640.0, 480.0, 0.0, 0.1, 100.0);

        this.mvMatrix = Matrix.I(4);
        var v = [0.0, 0.0, -1.0];
        this.mvMatrix = this.mvMatrix.x(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
    };

    this.initTextures = function() {
        var gl = this.gl;

        this.paletteTexture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.paletteImage);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
 
        // data texture
        var coords = [];
        // precalc for plasma
        var width = 1024;
        var halfWidth = width >> 1;
        var height = 128;
        var halfHeight = height >> 1;
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var r = (1.0 + Math.sin(Math.sqrt( Math.pow(halfWidth - x, 2) + Math.pow(halfHeight - y, 2) ) / 12)) / 2.0;
                var g = (1.0 + Math.sin(x/(37+15*Math.cos(y/74))) * Math.cos(y/(31+11*Math.sin(x/57))) ) / 2.0;

                coords.push(r, g, 0.0);
            }
        }

        this.deformTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.deformTexture);
       gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1024, 128, 0, gl.RGB, gl.FLOAT, new Float32Array(coords));
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    };

    this.initBuffers = function() {
        var gl = this.gl;
        // Create a buffer for the square's vertices.
        this.squareVerticesBuffer = gl.createBuffer();

        // Select the squareVerticesBuffer as the one to apply vertex
        // operations to from here out.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVerticesBuffer);

        // Now create an array of vertices for the square. Note that the Z
        // coordinate is always 0 here.
        var x1 = 0.0;//this.x;
        var x2 = this.canvas.width;//x1 + this.width;
        var y1 = 0.0;//this.y;
        var y2 = this.canvas.height; //y1 + this.height;

        var vertices = [
        x2, y2, 0.0,
        x1, y2, 0.0,
        x2, y1, 0.0,
        x1, y1, 0.0
        ];

        // Now pass the list of vertices into WebGL to build the shape. We
        // do this by creating a Float32Array from the JavaScript array,
        // then use it to fill the current vertex buffer.
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        this.squareVerticesTextureCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVerticesTextureCoordsBuffer);

        var texCoords = [
          1.0, 1.0,
          0.0, 1.0,
          1.0, 0.0,
          0.0, 0.0
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    };

    this.initShaders = function() {
        var gl = this.gl;
        var fragmentShader = getShader(gl, "plasma-fs");
        var vertexShader = getShader(gl, "plasma-vs");

        // Create the shader program

        this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, vertexShader);
        gl.attachShader(this.shaderProgram, fragmentShader);
        gl.linkProgram(this.shaderProgram);

        // If creating the shader program failed, alert

        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            alert("Unable to initialize the shader program.");
        }


        this.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");

        this.textureCoordAttribute = gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
    };

    this.draw = function(timestamp) {
        var gl = this.gl;

        if (timestamp - this.lastMove > this.moveFrequency) {
            this.isMoving = true;
            this.currentMove = 0.0;
            this.lastMove = timestamp;
        }

        if (this.isMoving) {
            this.currentMove = (timestamp - this.lastMove) / this.moveDuration * 2.0;
            if (this.currentMove == 0.0) {
                this.currentMove = 0.001;
            }
        }

        gl.useProgram(this.shaderProgram);

        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.textureCoordAttribute);

        // Draw the square by binding the array buffer to the square's vertices
        // array, setting attributes, and pushing it to GL.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVerticesBuffer);
        gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVerticesTextureCoordsBuffer);
        gl.vertexAttribPointer(this.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.paletteTexture);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "uPaletteSampler"), 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.deformTexture);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "uPlasmaSampler"), 1);

        var elapsedTime = timestamp - this.startTimestamp;
        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "time"), elapsedTime);

        var colorbarTop = -1.0; // 480.0 - this.y;
        var colorbarBottom = -1.0; // 480.0 - (this.y + this.height);
        var colorbarOpacity = 1.0;
        var plasmaTop = 480.0 - this.y;
        var plasmaBottom = 480.0 - (this.y + this.height);
        var plasmaOpacity = 0.0;

        if (elapsedTime > 6000) {
            var offset = 0;0;
            if (this.isMoving) {
                offset = Math.sin(4*this.currentMove)/this.currentMove/2.0 * 3.0 ;
            }

            colorbarTop = 480.0 - this.y + offset;
            plasmaTop = colorbarTop;
            colorbarBottom = 480.0 - (this.y + this.height + offset);
            plasmaBottom = colorbarBottom;

            plasmaOpacity = 1.0;
        }
        else if (elapsedTime > 5000) {
            colorbarTop = 480.0 - (this.y / 1000.0 * (elapsedTime - 5000));
            colorbarBottom = (480.0 - (this.y + this.height)) / 1000.0 * (elapsedTime - 5000);

            // value = -c*(t/d)*(t-2)+b
            // t time
            // b beginning pos
            // c total change
            // d duration

            colorbarTop = 480.0 - (-this.y*((elapsedTime - 5000) / 1000.0)*((elapsedTime-5000)/1000.0-2)+0);
            colorbarBottom = (-(480.0-(this.y+this.height))*((elapsedTime - 5000) / 1000.0)*((elapsedTime-5000)/1000.0-2)+0);

            plasmaOpacity = (elapsedTime - 5000) / 1000.0;
        }
        

        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "colorbarTop"), colorbarTop);
        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "colorbarBottom"), colorbarBottom);
        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "colorbarOpacity"), colorbarOpacity);
        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "plasmaTop"), plasmaTop);
        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "plasmaBottom"), plasmaBottom);
        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "plasmaOpacity"), plasmaOpacity);

        this.setMatrixUniforms();

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        if (this.currentMove >= 2.0) {
            this.isMoving = false;
        }
     };
    
    this.setMatrixUniforms = function () {
        var gl = this.gl;
        var pUniform = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
        gl.uniformMatrix4fv(pUniform, false, new Float32Array(this.perspectiveMatrix.flatten()));

        var mvUniform = gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
        gl.uniformMatrix4fv(mvUniform, false, new Float32Array(this.mvMatrix.flatten()));
    };

}

