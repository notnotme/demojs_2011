function Scrolltext (gl, canvas, charWidth, charHeight, font, firstChar, fontWidth, fontHeight, text, y) {
    this.canvas = canvas;
    this.gl = gl;
    this.charWidth = charWidth;
    this.charHeight = charHeight;
    this.font = font;
    this.text = text;
    this.currentChar = 0;
    this.currentShift = 0;
    this.shiftAmount = 120 / 1000.0; // 120 pixels per second, but we express it as pixels per ms
    this.fontCoords = [];
    this.firstChar = firstChar.charCodeAt();
    this.charsOnScreen;
    this.verticesBuffer;
    this.indicesBuffer;
    this.texCoordsBuffer;
    this.backdropVB;
    this.backdropIB;
    this.indicesBuffer;
    this.perspectiveMatrix;
    this.mvMatrix;
    this.shaderProgram;
    this.vertexPositionAttribute; 
    this.textureCoordAttribute;
    this.texture;
    this.fontWidth = fontWidth;
    this.fontHeight = fontHeight;
    this.previousTime = 0;
    this.y = y;

    this.init = function () {
        this.charsOnScreen = this.canvas.width / this.charWidth + 1;
        
        // Compute each char's texture coordinates and store it in an array
        this.computeTexCoords();

        // Geometry = 1 vertex/index buffer with enough squares to fill the screen + 1
        this.initBuffers();

        this.initMatrices();

        this.initTextures();

        this.initShaders();

        this.startTimestamp = Date.now();

    };

    this.computeTexCoords = function () {
        var fontWidth = this.fontWidth;
        var fontHeight = this.fontHeight;

        for (var y = 0; y < fontHeight; y += this.charHeight) {
            for (var x = 0; x < fontWidth; x += this.charWidth) {
                this.fontCoords.push(x / this.font.width, y / this.font.height);
                this.fontCoords.push((x + this.charWidth) / this.font.width, y / this.font.height);
                this.fontCoords.push(x / this.font.width, (y + this.charHeight) / this.font.height);
                this.fontCoords.push((x + this.charWidth) / this.font.width, (y + this.charHeight) / this.font.height);
            }
        }
    };

    this.initBuffers = function () {
        var vertices = [];
        var indices = [];

        for (var x = 0; x < this.charsOnScreen; x++) {
            var coords = this.genSquare(x * this.charWidth, this.y, this.charWidth);

            for (var i = 0; i < coords[0].length; i++) {
                vertices.push(coords[0][i]);
            }
            for (var i = 0; i < coords[1].length; i++) {
                indices.push(coords[1][i] + 4 * x); // 4 vertices per letter
            }
        }

        this.verticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        this.indicesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.texCoordsBuffer = gl.createBuffer();
        this.setTexCoords();


        var coords = this.genSquare(0.0, this.y + 5.0, this.charWidth);

        for (var i = 0; i < coords[0].length; i++) {
            vertices.push(coords[0][i]);
        }
        for (var i = 0; i < coords[1].length; i++) {
            indices.push(coords[1][i] + 4 * x); // 4 vertices per letter
        }

        this.backdropVB = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.backdropVB);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        this.backdropIB = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.backdropIB);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    };

    this.initMatrices = function() {
        this.perspectiveMatrix = makeOrtho(0.0, 640.0, 480.0, 0.0, 0.1, 100.0);

        this.mvMatrix = Matrix.I(4);
        var v = [0.0, 0.0, -1.0];
        this.mvMatrix = this.mvMatrix.x(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
    };

    this.initShaders = function() {
        var gl = this.gl;
        var fragmentShader = getShader(gl, "scrolltext-fs");
        var vertexShader = getShader(gl, "scrolltext-vs");

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

    this.initTextures = function() {
        var gl = this.gl;

        this.texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.font);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    };


    this.genSquare = function (x, y, width) {
        var vertices = [x, y, 0.0,
                        x + width, y, 0.0,
                        x, y + width, 0.0,
                        x + width, y + width, 0.0];


        var indices = [0, 1, 2,
                       2, 1, 3];

        return [vertices, indices];
         
    };

    this.backdropsDone = [false, false, false, false, false, false, false, false, false, false];
    this.currentWidth = 0;
    this.backdropCount = 0;
    this.backdropDelay = 0;
    this.backdropsStartTime = [];
    this.lastFrame = Date.now();

    this.drawBackdrop = function (time) {
        var gl = this.gl;
        gl.enableVertexAttribArray(this.vertexPositionAttribute);

        gl.useProgram(this.shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.backdropVB);
        gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        var elapsedTime = time - this.startTimestamp;
        this.backdropDelay += time - this.lastFrame;
        this.lastFrame = time;

        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "backdrop"), true);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.backdropIB);

        this.mvMatrix = Matrix.I(4);
        var v = [0.0, 0.0, -1.0];
        this.mvMatrix = this.mvMatrix.x(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
        this.setMatrixUniforms();

        if (elapsedTime >= 2000) {
        if (elapsedTime < 16000) {

            var increment = Math.PI / 10.0;

            if (this.backdropDelay >= 100 && this.backdropCount < 10) {
                this.backdropCount++;
                this.backdropDelay = 0;
            }

            for (var i = 0; i < this.backdropCount; i++) {
                if (this.backdropsDone[i] === false) {

                    if (this.backdropsStartTime.length <= i) {
                        this.backdropsStartTime.push(elapsedTime);
                    }

                    var currentSin = -increment * ((elapsedTime - this.backdropsStartTime[i]) / 150.0);

                    var width = (this.charsOnScreen - 1) / 2.0 * Math.abs(Math.sin(currentSin)) * this.charWidth;

                    var vertices = [];
                    vertices.push(0.0, i * 40.0 + 80, 0.0);
                    vertices.push(width, i * 40.0 + 80, 0.0);
                    vertices.push(0.0, i * 40.0 + 80 + this.charWidth, 0.0);
                    vertices.push(width, i * 40.0 + 80 + this.charWidth, 0.0);

                    gl.bindBuffer(gl.ARRAY_BUFFER, this.backdropVB);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

                    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

                    vertices[0] = 640 - width;
                    vertices[3] = 640;
                    vertices[6] = 640 - width;
                    vertices[9] = 640;

                    gl.bindBuffer(gl.ARRAY_BUFFER, this.backdropVB);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

                    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

                    if (elapsedTime > 14000) {
                        if (i < 9 && width <= 5) 
                        {
                            this.backdropsDone[i] = true;
                        }
                        else if (i === 9 && width >= 300)
                        {
                            this.backdropsDone[i] = true;
                        }
                    }
                }
                else if (i === 9) {
                    var vertices = [];
                    vertices.push(0.0, 9 * 40.0 + 80, 0.0);
                    vertices.push(640, 9 * 40.0 + 80, 0.0);
                    vertices.push(0.0, 9 * 40.0 + 80 + this.charWidth, 0.0);
                    vertices.push(640, 9 * 40.0 + 80 + this.charWidth, 0.0);

                    gl.bindBuffer(gl.ARRAY_BUFFER, this.backdropVB);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

                    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
                }
            }

        }
        else
        {
            var vertices = [];
            vertices.push(0.0, 9 * 40.0 + 80, 0.0);
            vertices.push(640, 9 * 40.0 + 80, 0.0);
            vertices.push(0.0, 9 * 40.0 + 80 + this.charWidth, 0.0);
            vertices.push(640, 9 * 40.0 + 80 + this.charWidth, 0.0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.backdropVB);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        }
        }
    };

    this.draw = function (time) {
        if (this.previoustime === 0) {
            this.previoustime = time;
        }

        var elapsedTime = time - this.previousTime;
        this.previousTime = time;
 
        // if cumulated shift > char width, reset position and advance position in text
        this.currentShift += this.shiftAmount * elapsedTime;
        if (this.currentShift >= this.charWidth) {
            this.currentShift = 0;
            this.currentChar++;
            // Don't forget to loop when we reach the end of the text
            if (this.currentChar >= this.text.length) {
                this.currentChar = 0;
            }

            this.setTexCoords();
        }

        var gl = this.gl;
        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.textureCoordAttribute);

        gl.useProgram(this.shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
        gl.vertexAttribPointer(this.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "uFontSampler"), 0);

        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "currentShift"), this.currentShift);

        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "time"), time - this.startTimestamp);

        this.setMatrixUniforms();

        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "backdrop"), false);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
        gl.drawElements(gl.TRIANGLES, this.charsOnScreen * 6, gl.UNSIGNED_SHORT, 0);

        gl.disableVertexAttribArray(this.textureCoordAttribute);
    };

    this.setTexCoords = function () {
        var texCoords = [];

        for (var i = 0; i < this.charsOnScreen; i++) {
            var index = (i + this.currentChar) % (this.text.length - 1);
            var coords = this.getCharTexCoords(this.text.charCodeAt(index));
            for (var j = 0; j < coords.length; j++) {
                texCoords.push(coords[j]);
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    };

    this.getCharTexCoords = function (charCode) {
        var index = (charCode - this.firstChar) * 2 * 4; // 4 coords couple per letter
        return [this.fontCoords[index], this.fontCoords[index + 1],
                this.fontCoords[index + 2], this.fontCoords[index + 3],
                this.fontCoords[index + 4], this.fontCoords[index + 5],
                this.fontCoords[index + 6], this.fontCoords[index + 7]
               ];
    };

    this.setMatrixUniforms = function () {
        var gl = this.gl;
        var pUniform = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
        gl.uniformMatrix4fv(pUniform, false, new Float32Array(this.perspectiveMatrix.flatten()));

        var mvUniform = gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
        gl.uniformMatrix4fv(mvUniform, false, new Float32Array(this.mvMatrix.flatten()));
    };




}

