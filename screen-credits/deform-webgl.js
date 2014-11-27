function Deform(gl, canvas, x, y, width, height, textureImage) {
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
 
        // data texture
        //var coords = [];
        var width = 512;
        var height = 512;
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var x2 = -1 + 2*x/width;
                var y2 = -1 + 2*y/height;
                var d = Math.sqrt( Math.pow(x2, 2) + Math.pow(y2, 2) );
                var a = Math.atan2( y2, x2 );

                // magic formulas here
                var u = (Math.cos( a )/d) % 1.0; // d*Math.cos(a+d); //0.3/(d+0.5*x2);
                var v = (Math.sin( a )/d) % 1.0; // d*Math.sin(a+d); //3*a/Math.PI;

                this.coords.push(u, v, 0.0);
            }
        }

        this.deformTexture= gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.deformTexture);
       gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 512, 512, 0, gl.RGB, gl.FLOAT, new Float32Array(this.coords));
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
          1.0, 1.0,
          0.0, 1.0,
          1.0, 0.0,
          0.0, 0.0
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    };

    this.initShaders = function() {
        var gl = this.gl;
        var fragmentShader = getShader(gl, "deform-fs");
        var vertexShader = getShader(gl, "deform-vs");

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

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.deformTexture);
        gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "uDeformSampler"), 1);

        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "time"), timestamp - this.startTimestamp);

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

