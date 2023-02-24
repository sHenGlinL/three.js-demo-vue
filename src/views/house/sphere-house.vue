<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

const { innerWidth, innerHeight } = window
// 创建场景
const scene = new THREE.Scene();
// 创建透视相机
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 0.1)
// 创建渲染器
const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
// 渲染函数
const render = () => {
  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}
const container = ref()
onMounted(() => {
  container.value.appendChild(renderer.domElement)
  render()
})

// 添加球
const geometry = new THREE.SphereGeometry(5, 32, 32)
const rgbeLoader = new RGBELoader()
rgbeLoader.load('./hdr/house/Living.hdr', texture => {
  const material = new THREE.MeshBasicMaterial({ map: texture })
  const sphere = new THREE.Mesh(geometry, material)
  sphere.geometry.scale(1, 1, -1) // z轴颠倒可以查看内部
  scene.add(sphere)
})
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #f0f0f0;
}
</style>
