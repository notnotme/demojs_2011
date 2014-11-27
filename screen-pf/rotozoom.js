function Rotozoom(gl, canvas, x, y, width, height, textureImage) {
    this.canvas = canvas;
    this.gl = gl;
    this.squareVerticesBuffer = null;
    this.mvMatrix = null;
    this.shaderProgram = null;
    this.vertexPositionAttribute = null;
    this.perspectiveMatrix = null;
    this.squareVerticesTextureCoordsBuffer = null;
    this.checkerImage;
    this.checkerTexture;
    this.deformTexture;
    this.coords = [];
    this.textureImage = textureImage;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.init = function() {
        var gl = this.gl;

        this.initMatrices();

        this.initTextures();

        this.initShaders();

        this.initBuffers();

        this.startTimestamp = Date.now();
    };

    this.initMatrices = function() {
        this.perspectiveMatrix = makeOrtho(-1.0, 1.0, -1.0, 1.0, 0.1, 100.0);

        this.mvMatrix = Matrix.I(4);
        var v = [0.0, 0.0, -1.0];
        this.mvMatrix = this.mvMatrix.x(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
    };

    this.initTextures = function() {
        var gl = this.gl;

        this.checkerTexture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, this.checkerTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textureImage);
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

        var maxX = this.width / this.textureImage.width;
        var maxY = this.height / this.textureImage.height;

        var texCoords = [
          maxX, maxY,
          0.0, maxY,
          maxX, 0.0,
          0.0, 0.0
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    };

    this.initShaders = function() {
        var gl = this.gl;
        var fragmentShader = getShader(gl, "rotozoom-fs");
        var vertexShader = getShader(gl, "rotozoom-vs");

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
        gl.bindTexture(gl.TEXTURE_2D, this.checkerTexture);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "uSampler"), 0);

        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "sintime"), Math.sin(Math.sin(timestamp / 2000.0)));
        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "costime"), Math.cos(Math.sin(timestamp / 2000.0)));
        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "zoom"), (Math.sin(timestamp / 1000.0) + 1.0) / 3.0 + 0.6);
        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "centerX"), this.canvas.width / this.textureImage.width / 2.0);
        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "centerY"), this.canvas.height / this.textureImage.height / 2.0);

        this.setMatrixUniforms();

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    
    this.setMatrixUniforms = function () {
        var gl = this.gl;
        var pUniform = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
        gl.uniformMatrix4fv(pUniform, false, new Float32Array(this.perspectiveMatrix.flatten()));

        var mvUniform = gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
        gl.uniformMatrix4fv(mvUniform, false, new Float32Array(this.mvMatrix.flatten()));
    };

}

