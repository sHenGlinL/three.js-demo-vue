<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader' // gltf模型载入库
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' // 模型解压库

const { innerWidth, innerHeight } = window
// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color('#fff')
// 创建透视相机
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 3)
// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true
})
renderer.setSize(innerWidth, innerHeight)
// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// 加载模型
const dracoLoader = new DRACOLoader() // 解压
dracoLoader.setDecoderPath('./draco/') // 设置解压库路径
const gltfLoader = new GLTFLoader() // 模型载入
gltfLoader.setDRACOLoader(dracoLoader)
let material // 文字材质
gltfLoader.loadAsync('./model/newyear.glb').then(gltf => {
  const textModel = gltf.scene.children[0]
  scene.add(textModel)

  const geometry = textModel.geometry // 获取几何体
  const position = geometry.attributes.position // 获取坐标
  const vertexCount = position.count // 获取坐标总数
  const triangleCount = vertexCount / 3 // 获取三角形总数

  const randomDirections = [] // 随机方向
  const randomStrengths = [] // 随机方向强度
  for (let i = 0; i < triangleCount; i++) {
    const dir = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    )
      .normalize() // 将该向量转换为单位向量
      .toArray() // 转换为数组
    randomDirections.push(...dir);

    const strengths = Math.random();
    randomStrengths.push(strengths, strengths, strengths);
  }
  // 把随机方向数据设置为几何体的属性
  const randomDirectionsAttribute = new THREE.Float32BufferAttribute(
    new Float32Array(randomDirections),
    3
  );
  geometry.setAttribute("randomDirection", randomDirectionsAttribute);
  // 把随机方向强度数据设置为几何体的属性
  const randomStrengthsAttribute = new THREE.Float32BufferAttribute(
    new Float32Array(randomStrengths),
    1
  );
  geometry.setAttribute("randomStrength", randomStrengthsAttribute);

  // 定义着色器材质
  material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 1 },
    },
    // 顶点着色器（控制位置）
    vertexShader: `
      attribute vec3 randomDirection;
      attribute float randomStrength;
      uniform float time;
      varying vec3 vPosition;

      void main() {
        vPosition = position;
        vec3 pos = position.xyz;
        pos += randomDirection * randomStrength * time;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);
      }
    `,
    // 片着色器（控制颜色）
    fragmentShader: `
      varying vec3 vPosition;
      void main() {
        vec3 color = normalize(vPosition)*0.5+0.5;
        color.z = color.z*3.0;
        gl_FragColor = vec4(color,1.0);
      }
    `,
    side: THREE.DoubleSide,
    transparent: true,
  });
  textModel.material = material;
})

let showText = false;
window.addEventListener("click", () => {
  showText = !showText;
});
// 渲染
let clock = new THREE.Clock();
let value = 0;
function render() {
  let delta = clock.getDelta();
  if (material) {
    if (showText) {
      value -= delta;
      value = Math.max(value, 0);
      material.uniforms.time.value = value;
    } else {
      value += delta;
      value = Math.min(value, 1);
      material.uniforms.time.value = value;
    }
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
const container = ref()
onMounted(() => {
  container.value.appendChild(renderer.domElement)
  render()
})
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #f0f0f0;
}
</style>
