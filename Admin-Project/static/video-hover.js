const canvas = document.getElementById("gl");
const gl = canvas.getContext("webgl");

if (!gl) {
  alert("WebGL not supported");
}

// ================= RESIZE =================
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}
window.addEventListener("resize", resize);
resize();

// ================= SHADERS =================

// Vertex shader
const vertexSrc = `
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Fragment shader
const fragmentSrc = `
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uTime;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  float dist = distance(uv, uMouse);
  float strength = smoothstep(0.35, 0.0, dist);

  vec2 dir = normalize(uv - uMouse);
  uv += dir * strength * 0.08;

  uv.x += sin(uv.y * 10.0 + uTime * 0.5) * 0.003;

  vec4 color = texture2D(uTexture, uv);
  color.rgb *= 0.85;

  gl_FragColor = color;
}
`;

// ================= SHADER UTILS =================

function compile(type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

const program = gl.createProgram();
gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSrc));
gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSrc));
gl.linkProgram(program);
gl.useProgram(program);

// ================= GEOMETRY =================

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
     1,  1
  ]),
  gl.STATIC_DRAW
);

const posLoc = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

// ================= VIDEO TEXTURE =================

const texture = gl.createTexture();

const video = document.createElement("video");
video.src = "/static/flakes-video.mp4";        // 🔥 CHANGE PATH
video.autoplay = true;
video.loop = true;
video.muted = true;
video.playsInline = true;
video.crossOrigin = "anonymous";

video.addEventListener("canplay", () => {
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  video.play();
  animate();
});

// ================= UNIFORMS =================

const uMouse = gl.getUniformLocation(program, "uMouse");
const uTime = gl.getUniformLocation(program, "uTime");

let targetX = 0.5, targetY = 0.5;
let mouseX = 0.5, mouseY = 0.5;

window.addEventListener("mousemove", e => {
  targetX = e.clientX / window.innerWidth;
  targetY = 1.0 - e.clientY / window.innerHeight;
});

// ================= RENDER LOOP =================

let time = 0;

function animate() {
  time += 0.016;

  mouseX += (targetX - mouseX) * 0.08;
  mouseY += (targetY - mouseY) * 0.08;

  gl.uniform2f(uMouse, mouseX, mouseY);
  gl.uniform1f(uTime, time);

  // 🔥 UPDATE VIDEO FRAME
  if (video.readyState >= video.HAVE_CURRENT_DATA) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      video
    );
  }

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(animate);
}
