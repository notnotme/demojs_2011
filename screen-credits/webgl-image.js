function WebGLImage(gl, canvas, x, y, width, height, image) {
    this.canvas = canvas;
    this.gl = gl;
    this.squareVerticesBuffer = null;
    this.mvMatrix = null;
    this.shaderProgram = null;
    this.vertexPositionAttribute = null;
    this.perspectiveMatrix = null;
    this.squareVerticesTextureCoordsBuffer = null;
    this.texture;
    this.image = image;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.lastMove;
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
        this.perspectiveMatrix = makeOrtho(-1.0, 1.0, -1.0, 1.0, 0.1, 100.0);

        this.mvMatrix = Matrix.I(4);
        var v = [0.0, 0.0, -1.0];
        this.mvMatrix = this.mvMatrix.x(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
    };

    this.initTextures = function() {
        var gl = this.gl;

        this.texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
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
        var unitX = 2.0 / this.canvas.width;
        var unitY = 2.0 / this.canvas.height;
        var x1 = this.x * unitX - 1.0;
        var x2 = x1 + this.width * unitX;
        var y1 = this.y * -unitY + 1.0;
        var y2 = y1 + this.height * -unitY;

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
          640 / 1024, 480 / 512,
          0.0, 480 / 512,
          640 / 1024, 0.0,
          0.0, 0.0
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    };

    this.initShaders = function() {
        var gl = this.gl;
        var fragmentShader = getShader(gl, "image-fs");
        var vertexShader = getShader(gl, "image-vs");

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
            //this.isMoving = true;
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
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "uImageSampler"), 0);

        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "time"), timestamp - this.startTimestamp);

        this.mvMatrix = Matrix.I(4);
        var v;
        if (this.isMoving) {
            v = [0.0, Math.sin(4*this.currentMove)/this.currentMove/2.0 / 100.0, -1.0];
        }
        else {
            v = [0.0, 0.0, -1.0];
        }
        this.mvMatrix = this.mvMatrix.x(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
 
 
        this.setMatrixUniforms();

        //if (this.isMoving) {
        //    gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
        //}
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        //if (this.isMoving) {
        //    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        //}

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

