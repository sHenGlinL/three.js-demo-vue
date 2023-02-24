<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Water } from 'three/examples/jsm/objects/Water2'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader' // gltf模型载入库
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' // 模型解压库
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

const { innerWidth, innerHeight } = window
// 创建场景
const scene = new THREE.Scene();
// 创建透视相机
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  2000
);
camera.position.set(-50, 50, 130) // 设置相机位置
// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true, // 抗锯齿
  logarithmicDepthBuffer: true // 设置对数深度缓冲区
})
renderer.outputEncoding = THREE.sRGBEncoding // 设置渲染器输出编码
renderer.setSize(innerWidth, innerHeight)

const container = ref()

const render = () => {
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

onMounted(() => {
  // 添加轨道控制器
  const controls = new OrbitControls(camera, container.value)
  controls.enableDamping = true

  container.value.appendChild(renderer.domElement)
  render()
})

// 监听画面的变化，更新渲染画面
window.addEventListener("resize", () => {
  // 1.更新摄像头
  camera.aspect = window.innerWidth / window.innerHeight; // 更新宽高比
  camera.updateProjectionMatrix(); // 更新投影矩阵
  // 2.更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 创建天空球体
const skyGeometry = new THREE.SphereGeometry(1000, 60, 60)
const skyImg = new URL('../../assets/island/textures/sky.jpg', import.meta.url).href
const skyTexture = new THREE.TextureLoader().load(skyImg)
const skyMaterial = new THREE.MeshBasicMaterial({
  map: skyTexture
})
const skySphere = new THREE.Mesh(skyGeometry, skyMaterial)
skySphere.geometry.scale(1, 1, -1)
scene.add(skySphere)
// 创建视频纹理
const video = document.createElement('video')
video.src = new URL('../../assets/island/textures/sky.mp4', import.meta.url).href
video.loop = true
window.addEventListener('click', e => {
  if (video.paused) {
    video.play()
    skyMaterial.map = new THREE.VideoTexture(video)
  }
})
// 创建环境纹理hdr
const hdrLoader = new RGBELoader()
hdrLoader.loadAsync('./hdr/island/050.hdr').then(texture => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  // scene.background = texture
  scene.environment = texture
})

// 添加平行光
const light = new THREE.DirectionalLight('#fff', 1)
light.position.set(-100, 100, 10)
scene.add(light)

// 创建水面
const waterGeometry = new THREE.CircleGeometry(300, 64)
const textureLoader = new THREE.TextureLoader();
const water = new Water(waterGeometry, {
  textureWidth: 1024,
  textureHight: 1024,
  color: '#eeeeff',
  flowDirection: new THREE.Vector2(1, 1), // 流向
  scale: 2, // 水面波纹大小
  normalMap0: textureLoader.load(new URL('../../assets/water/Water_1_M_Normal.jpg', import.meta.url).href),
  normalMap1: textureLoader.load(new URL('../../assets/water/Water_2_M_Normal.jpg', import.meta.url).href),
})
water.position.y = 3
water.rotation.x = - Math.PI / 2 // 水面旋转至水平
scene.add(water)

// 添加小岛模型
const dracoLoader = new DRACOLoader() // 解压
dracoLoader.setDecoderPath('./draco/') // 设置解压库路径
const gltfLoader = new GLTFLoader() // 模型载入
gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.load('./model/island.glb', gltf => {
  scene.add(gltf.scene)
})

// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(500);
scene.add(axesHelper);
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #f0f0f0;
}
</style>
