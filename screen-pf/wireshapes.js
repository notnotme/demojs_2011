function Wireshapes(gl, canvas, image) {
    this.canvas = canvas;
    this.gl = gl;
    this.shapesVBuffer = null;
    this.mvMatrix = null;
    this.shaderProgram = null;
    this.vertexPositionAttribute = null;
    this.perspectiveMatrix = null;
    this.shapesIBuffer = null;
    this.width = canvas.width;
    this.height = canvas.height;
    this.lineCount = 0;

    this.init = function() {
        var gl = this.gl;

        this.initMatrices();

        this.initShaders();

        this.initBuffers();

        this.startTimestamp = Date.now();
    };

    this.initMatrices = function() {
        this.perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);

    };

    this.initBuffers = function() {
        var gl = this.gl;
        // Create a buffer for the cube's vertices.
        this.shapesVBuffer = gl.createBuffer();

        // Select the shapesVBuffer as the one to apply vertex
        // operations to from here out.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.shapesVBuffer);

        var vertices = [];
        var indices  = [];

            var circle = this.circle(function (t) {
                                         return 0.5 + Math.sin(Math.PI * 50.0 * t) / 40.0; //0.0;
                                         //return 0.5;
                                     },
                                     function (t) {
                                         return Math.sin(Math.PI * 50.0 * t) / 40.0; //0.0;
                                     },
                                     1.0,
                                     true);

            for (var j = 0; j < circle["vertices"].length; j++) {
                vertices.push(circle["vertices"][j]);
            }
            for (var j = 0; j < circle["indices"].length; j++) {
                indices.push(circle["indices"][j]);
            }

            /*
            circle = this.circle(function (t) {
                                         return 0.3;
                                     },
                                     function (t) {
                                         return 0.5 * t;
                                     },
                                     2.0,
                                     false);

            // had the last parameter of the first call to circle been false, we
            // would not have indexed by (indices.length - 2) but (indices.length - 1)
            // 'cause then the last index would not be 0
            var offset = indices[indices.length - 2] + 1;

            for (var j = 0; j < circle["vertices"].length; j++) {
                vertices.push(circle["vertices"][j]);
            }

            for (var j = 0; j < circle["indices"].length; j++) {
                indices.push(circle["indices"][j] + offset);
            }
            */


        /* // cross
        var vertices = [
            -0.15, -0.05,  0.05,
            -0.05, -0.05,  0.05,
            -0.05, -0.15,  0.05,
             0.05, -0.15,  0.05,
             0.05, -0.05,  0.05,
             0.15, -0.05,  0.05,

            -0.15,  0.05,  0.05,
            -0.05,  0.05,  0.05,
            -0.05,  0.15,  0.05,
             0.05,  0.15,  0.05,
             0.05,  0.05,  0.05,
             0.15,  0.05,  0.05,

            -0.15, -0.05, -0.05,
            -0.05, -0.05, -0.05,
            -0.05, -0.15, -0.05,
             0.05, -0.15, -0.05,
             0.05, -0.05, -0.05,
             0.15, -0.05, -0.05,

            -0.15,  0.05, -0.05,
            -0.05,  0.05, -0.05,
            -0.05,  0.15, -0.05,
             0.05,  0.15, -0.05,
             0.05,  0.05, -0.05,
             0.15,  0.05, -0.05,
          ];
          */

        // Now pass the list of vertices into WebGL to build the shape. We
        // do this by creating a Float32Array from the JavaScript array,
        // then use it to fill the current vertex buffer.
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


        // Create a buffer for the cube's vertices.
        this.shapesIBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.shapesIBuffer);

        /* // cross
        var indices = [];
        indices.push(0, 1);
        indices.push(1, 2);
        indices.push(2, 3);
        indices.push(3, 4);
        indices.push(4, 5);

        indices.push(0, 6);
        indices.push(5, 11);

        indices.push(6, 7);
        indices.push(7, 8);
        indices.push(8, 9);
        indices.push(9, 10);
        indices.push(10, 11);

        
        indices.push(12, 13);
        indices.push(13, 14);
        indices.push(14, 15);
        indices.push(15, 16);
        indices.push(16, 17);

        indices.push(12, 18);
        indices.push(17, 23);

        indices.push(18, 19);
        indices.push(19, 20);
        indices.push(20, 21);
        indices.push(21, 22);
        indices.push(22, 23);


        indices.push(0, 12);
        indices.push(1, 13);
        indices.push(2, 14);
        indices.push(3, 15);
        indices.push(4, 16);
        indices.push(5, 17);
        indices.push(6, 18);
        indices.push(7, 19);
        indices.push(8, 20);
        indices.push(9, 21);
        indices.push(10, 22);
        indices.push(11, 23);
        */

        this.lineCount = indices.length;

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    };

    this.circle = function(radiusGenerator, zGenerator, count, close) {

        var vertices = [];
        var start = 0.0;
        var stop  = Math.PI * 2.0 * count;
        var t = 0.0;
        for (var angle = start; angle < stop; angle += 0.01) {
            t = (angle - start) / (stop - start);
            var sin = Math.sin(angle);
            var cos = Math.cos(angle);
            var x = 0.0 * cos - radiusGenerator(t) * sin;
            var y = 0.0 * sin + radiusGenerator(t) * cos;

            var z = zGenerator(t);

            vertices.push(x, y, z);
        }
        
        var indices = [];

        // circle
        for (var index = 0; index < (vertices.length / 3) - 1; index++) {
            indices.push(index, index + 1);
        }
        if (close === true) {
            indices.push(index, 0);
        }

        return { "vertices": vertices, "indices": indices };
    };


    this.initShaders = function() {
        var gl = this.gl;
        var fragmentShader = getShader(gl, "wireshapes-fs");
        var vertexShader = getShader(gl, "wireshapes-vs");

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
        var elapsedTime = timestamp - this.startTimestamp;

        if (elapsedTime >= 17000) {
            var gl = this.gl;

            gl.useProgram(this.shaderProgram);
            gl.enableVertexAttribArray(this.vertexPositionAttribute);

            // Draw the cube by binding the array buffer to the cube's vertices
            // array, setting attributes, and pushing it to GL.
            gl.bindBuffer(gl.ARRAY_BUFFER, this.shapesVBuffer);
            gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);


            for (var i = 0; i < 5; i++) {

                this.mvMatrix = Matrix.I(4);
                var v = [0.0, 0.0, -2.0 - i];
                this.mvMatrix = this.mvMatrix.x(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
                var angle = timestamp / 50.0 + (i * 10 * Math.sin(timestamp / 1000));
                var inRadians = angle * Math.PI / 180.0;
                this.mvMatrix = this.mvMatrix.x(Matrix.Rotation(inRadians, $V([1, 1, 0])).ensure4x4());

                this.setMatrixUniforms();

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.shapesIBuffer);
                gl.drawElements(gl.LINES, this.lineCount * Math.min(1.0, (elapsedTime - 17000) / 6000.0), gl.UNSIGNED_SHORT, 0);
            }
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

