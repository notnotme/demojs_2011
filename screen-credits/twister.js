function Twister(gl, canvas, x, y, width, height, image) {
    this.canvas = canvas;
    this.gl = gl;
    this.cubesVerticesBuffer = null;
    this.mvMatrix = null;
    this.shaderProgram = null;
    this.vertexPositionAttribute = null;
    this.perspectiveMatrix = null;
    this.cubesVerticesTextureCoordsBuffer = null;
    this.cubesVerticesIndexBuffer = null;
    this.texture;
    this.image = image;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.triangleCount = 0;

    this.init = function() {
        var gl = this.gl;

        this.initMatrices();

        this.initTextures();

        this.initShaders();

        this.initBuffers();

        this.startTimestamp = Date.now();
    };

    this.initMatrices = function() {
        //this.perspectiveMatrix = makeOrtho(-1.0, 1.0, -1.0, 1.0, 0.1, 100.0);
        this.perspectiveMatrix = makePerspective(10, 640.0/480.0, 0.1, 100.0);

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
        // Create a buffer for the cube's vertices.
        this.cubesVerticesBuffer = gl.createBuffer();

        // Select the cubesVerticesBuffer as the one to apply vertex
        // operations to from here out.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubesVerticesBuffer);

        // Now create an array of vertices for the cubes. Note that the Z
        // coordinate is always 0 here.
        var unitX = 2.0 / this.canvas.width;
        var unitY = 2.0 / this.canvas.height;
        var x1 = this.x * unitX - 1.0;
        var x2 = x1 + this.width * unitX;
        var y1 = this.y * -unitY + 1.0;
        var y2 = y1 + this.height * -unitY;

        var vertices = [
            // Front face
            -0.35, -0.01,  0.35,
             0.35, -0.01,  0.35,
             0.35,  0.01,  0.35,
            -0.35,  0.01,  0.35,
            
            // Back face
            -0.35, -0.01, -0.35,
            -0.35,  0.01, -0.35,
             0.35,  0.01, -0.35,
             0.35, -0.01, -0.35,
            
            // Top face
            -0.35,  0.01, -0.35,
            -0.35,  0.01,  0.35,
             0.35,  0.01,  0.35,
             0.35,  0.01, -0.35,
            
            // Bottom face
            -0.35, -0.01, -0.35,
             0.35, -0.01, -0.35,
             0.35, -0.01,  0.35,
            -0.35, -0.01,  0.35,
            
            // Right face
             0.35, -0.01, -0.35,
             0.35,  0.01, -0.35,
             0.35,  0.01,  0.35,
             0.35, -0.01,  0.35,
            
            // Left face
            -0.35, -0.01, -0.35,
            -0.35, -0.01,  0.35,
            -0.35,  0.01,  0.35,
            -0.35,  0.01, -0.35
          ];

        // Now pass the list of vertices into WebGL to build the shape. We
        // do this by creating a Float32Array from the JavaScript array,
        // then use it to fill the current vertex buffer.
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


        // Create a buffer for the cube's vertices.
        this.cubesVerticesIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubesVerticesIndexBuffer);

        var indices = [];

        indices.push(0, 1, 2);
        indices.push(0, 2, 3);

        indices.push(4, 5, 6);
        indices.push(4, 6, 7);

        indices.push(8, 9, 10);
        indices.push(8, 10, 11);

        indices.push(12, 13, 14);
        indices.push(12, 14, 15);

        indices.push(16, 17, 18);
        indices.push(16, 18, 19);

        indices.push(20, 21, 22);
        indices.push(20, 22, 23);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);


        this.cubesVerticesTextureCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubesVerticesTextureCoordsBuffer);

        //TODO: get correct texCoords (or compute them inside the vertex shader ?)
        var texCoords = [];
        for (var i = 0; i < 6; i++) {
            texCoords.push(0.0, 1.0,
                            1.0, 1.0,
                            1.0, 0.0,
                            0.0, 0.0);
        }

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    };

    this.initShaders = function() {
        var gl = this.gl;
        var fragmentShader = getShader(gl, "twister-fs");
        var vertexShader = getShader(gl, "twister-vs");

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
        gl.enableVertexAttribArray(this.vertexPositionAttribute);

        this.textureCoordAttribute = gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(this.textureCoordAttribute);
    };

    this.draw = function(timestamp) {
        var gl = this.gl;

        this.mvMatrix = Matrix.I(4);
        var v = [0.9, 0.0, -15.0];
        this.mvMatrix = this.mvMatrix.x(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
        angle = timestamp / 50.0;
        var inRadians = angle * Math.PI / 180.0;
        this.mvMatrix = this.mvMatrix.x(Matrix.Rotation(inRadians, $V([0, 1, 0])).ensure4x4());

        gl.useProgram(this.shaderProgram);

        // Draw the cube by binding the array buffer to the cube's vertices
        // array, setting attributes, and pushing it to GL.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubesVerticesBuffer);
        gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubesVerticesTextureCoordsBuffer);
        gl.vertexAttribPointer(this.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "uImageSampler"), 0);

        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "time"), timestamp - this.startTimestamp);
        this.setMatrixUniforms();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubesVerticesIndexBuffer);
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    };
    
    this.setMatrixUniforms = function () {
        var gl = this.gl;
        var pUniform = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
        gl.uniformMatrix4fv(pUniform, false, new Float32Array(this.perspectiveMatrix.flatten()));

        var mvUniform = gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
        gl.uniformMatrix4fv(mvUniform, false, new Float32Array(this.mvMatrix.flatten()));
    };

}

