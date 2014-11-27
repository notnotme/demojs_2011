function FadeOut(gl, canvas) {
    this.canvas = canvas;
    this.gl = gl;
    this.squareVerticesBuffer = null;
    this.mvMatrix = null;
    this.shaderProgram = null;
    this.vertexPositionAttribute = null;
    this.perspectiveMatrix = null;
    this.fadeValue = 0.0;

    this.init = function() {
        var gl = this.gl;

        this.initMatrices();

        this.initShaders();

        this.initBuffers();
    };

    this.setValue = function(value) {
        this.fadeValue = value;
    };

    this.initMatrices = function() {
        this.perspectiveMatrix = makeOrtho(0.0, 640.0, 0.0, 480.0, 0.1, 100.0);

        this.mvMatrix = Matrix.I(4);
        var v = [0.0, 0.0, -1.0];
        this.mvMatrix = this.mvMatrix.x(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
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
        var x1 = 0.0;
        var x2 = 640.0;
        var y1 = 0.0;
        var y2 = 480.0;

        var vertices = [
        x2, y2, 0.0,
        x1, y2, 0.0,
        x2, y1, 0.0,
        x1, y1, 0.0
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    };

    this.initShaders = function() {
        var gl = this.gl;
        var fragmentShader = getShader(gl, "fadeout-fs");
        var vertexShader = getShader(gl, "fadeout-vs");

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
    };

    this.draw = function(timestamp) {
        var gl = this.gl;

        gl.useProgram(this.shaderProgram);

        gl.enableVertexAttribArray(this.vertexPositionAttribute);

        // Draw the square by binding the array buffer to the square's vertices
        // array, setting attributes, and pushing it to GL.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVerticesBuffer);
        gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "fade"), this.fadeValue);

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

