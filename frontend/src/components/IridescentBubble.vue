<template>
  <div 
    ref="container" 
    :class="className" 
    :style="{ width: size + 'px', height: size + 'px', ...customStyle }"
    class="relative rounded-full overflow-hidden"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  color: {
    type: Array,
    default: () => [1, 1, 1]
  },
  speed: {
    type: Number,
    default: 1.0
  },
  amplitude: {
    type: Number,
    default: 0.1
  },
  audioLevel: {
    type: Number,
    default: 0
  },
  className: String,
  customStyle: Object,
  size: {
    type: Number,
    default: 60
  }
})

const container = ref(null)

let gl = null
let program = null
let animationId = null
let startTime = Date.now()

const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`

const fragmentShaderSource = `
  precision mediump float;
  
  uniform float u_time;
  uniform vec3 u_color;
  uniform vec2 u_resolution;
  uniform float u_amplitude;
  uniform float u_speed;
  uniform float u_audioLevel;
  
  varying vec2 v_texCoord;
  
  void main() {
    vec2 uv = (v_texCoord * 2.0 - 1.0);
    
    float time = u_time * u_speed;
    float audioInfluence = u_audioLevel * 3.0;
    
    // Create multiple wave layers for fluid movement
    vec2 waveUv = uv;
    
    // Primary wave layer - large flowing movements
    waveUv.x += sin(time * 0.5 + uv.y * 2.0 + audioInfluence) * 0.3;
    waveUv.y += cos(time * 0.3 + uv.x * 1.5 + audioInfluence * 0.8) * 0.25;
    
    // Secondary wave layer - medium frequency waves
    waveUv.x += sin(time * 1.2 + uv.y * 4.0 + audioInfluence * 1.5) * 0.15;
    waveUv.y += cos(time * 0.8 + uv.x * 3.0 + audioInfluence * 1.2) * 0.2;
    
    // Tertiary wave layer - high frequency ripples
    waveUv.x += sin(time * 2.0 + uv.y * 8.0 + audioInfluence * 2.0) * 0.08;
    waveUv.y += cos(time * 1.5 + uv.x * 6.0 + audioInfluence * 1.8) * 0.1;
    
    // Audio-reactive circular waves
    float dist = length(uv);
    float circularWave = sin(dist * 10.0 - time * 2.0 + audioInfluence * 4.0) * 0.1;
    waveUv += normalize(uv) * circularWave * (1.0 + audioInfluence);
    
    float d = -time * 0.5;
    float a = 0.0;
    
    // Enhanced pattern generation with wave complexity
    for (float i = 0.0; i < 12.0; ++i) {
      float waveOffset = sin(time * 0.1 + i * 0.5) * audioInfluence * 2.0;
      a += cos(i - d - a * waveUv.x + waveOffset);
      d += sin(waveUv.y * i + a + waveOffset * 0.7);
      
      // Enhanced spiral wave motion with audio reactivity
      float spiral = atan(waveUv.y, waveUv.x) + time * 0.2 + audioInfluence * 3.0;
      a += sin(spiral * 3.0 + i + audioInfluence * 2.0) * 0.15;
    }

    d += time * 0.5;

    // Responsive flowing color patterns
    vec3 col = vec3(
      cos(waveUv * vec2(d + audioInfluence, a + audioInfluence * 0.5)) * 0.3 + 0.7, 
      cos(a + d + time * 0.3 + audioInfluence) * 0.2 + 0.8
    );

    // Enhanced cloud-like color patterns with audio reactivity
    float cloudiness = sin(time * 0.2 + dist * 3.0 + audioInfluence * 2.0) * 0.4 + 0.6;
    col = mix(
      vec3(0.7, 0.85, 1.0),  // Light blue base
      vec3(0.2, 0.5, 0.9),   // Deeper blue
      cos(col * cos(vec3(d + audioInfluence, a + audioInfluence * 0.8, 2.0 + cloudiness)) * 0.5 + 0.5)
    ) * u_color;

    // Brightness modulation based on audio
    col *= (0.9 + audioInfluence * 0.6 + cloudiness * 0.2);

    // Pulsing effect that responds to voice
    float pulse = sin(time * 1.0 + audioInfluence * 4.0) * (0.1 + audioInfluence * 0.2) + 0.9;
    col *= pulse;
    
    gl_FragColor = vec4(col, 1.0);
  }
`

function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  
  return shader
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  
  return program
}

function initWebGL() {
  if (!container.value) return false
  
  const canvas = document.createElement('canvas')
  canvas.width = props.size
  canvas.height = props.size
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  
  container.value.appendChild(canvas)
  
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  if (!gl) {
    console.error('WebGL not supported')
    return false
  }
  
  // Create shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
  
  if (!vertexShader || !fragmentShader) return false
  
  // Create program
  program = createProgram(gl, vertexShader, fragmentShader)
  if (!program) return false
  
  // Create geometry (full screen quad)
  const positions = new Float32Array([
    -1, -1,  0, 0,
     1, -1,  1, 0,
    -1,  1,  0, 1,
    -1,  1,  0, 1,
     1, -1,  1, 0,
     1,  1,  1, 1,
  ])
  
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
  
  // Set up attributes
  const positionLocation = gl.getAttribLocation(program, 'a_position')
  const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')
  
  gl.enableVertexAttribArray(positionLocation)
  gl.enableVertexAttribArray(texCoordLocation)
  
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0)
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8)
  
  return true
}

function render() {
  if (!gl || !program) return
  
  const currentTime = (Date.now() - startTime) * 0.001
  
  gl.viewport(0, 0, props.size, props.size)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  
  gl.useProgram(program)
  
  // Set uniforms
  const timeLocation = gl.getUniformLocation(program, 'u_time')
  const colorLocation = gl.getUniformLocation(program, 'u_color')
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
  const amplitudeLocation = gl.getUniformLocation(program, 'u_amplitude')
  const speedLocation = gl.getUniformLocation(program, 'u_speed')
  const audioLevelLocation = gl.getUniformLocation(program, 'u_audioLevel')
  
  gl.uniform1f(timeLocation, currentTime)
  gl.uniform3f(colorLocation, props.color[0], props.color[1], props.color[2])
  gl.uniform2f(resolutionLocation, props.size, props.size)
  gl.uniform1f(amplitudeLocation, props.amplitude)
  gl.uniform1f(speedLocation, props.speed)
  gl.uniform1f(audioLevelLocation, Math.max(0, Math.min(1, props.audioLevel || 0)))
  
  gl.drawArrays(gl.TRIANGLES, 0, 6)
  
  animationId = requestAnimationFrame(render)
}

function cleanup() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  
  if (gl) {
    const canvas = container.value?.querySelector('canvas')
    if (canvas) {
      container.value.removeChild(canvas)
    }
    
    const loseContextExtension = gl.getExtension('WEBGL_lose_context')
    if (loseContextExtension) {
      loseContextExtension.loseContext()
    }
    
    gl = null
    program = null
  }
}

onMounted(() => {
  if (initWebGL()) {
    render()
  }
})

onUnmounted(() => {
  cleanup()
})

// Watch for audio level changes
watch(() => props.audioLevel, () => {
  // Audio level updates are handled in the render loop
}, { immediate: false })
</script>

<style scoped>
canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style> 