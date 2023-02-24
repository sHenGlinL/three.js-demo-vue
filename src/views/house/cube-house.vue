<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

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

// 添加立方体
const geometry = new THREE.BoxGeometry(10, 10, 10)
// const material = new THREE.MeshBasicMaterial({ color: '#00ff00' })
// 客厅贴图
const livingImgs = ['4_l', '4_r', '4_u', '4_d', '4_b', '4_f', ]
const textureLoader = new THREE.TextureLoader();
const boxMaterials = livingImgs.map(item => {
  const img = new URL(`../../assets/house/living/${item}.jpg`, import.meta.url).href
  const texture = textureLoader.load(img) // 加载贴图
  if (item === '4_u' || item === '4_d') {
    texture.rotation = Math.PI
    texture.center = new THREE.Vector2(0.5, 0.5)
  }
  return new THREE.MeshBasicMaterial({ map: texture }) // 创建材质
})
// 创建立方体
const cube = new THREE.Mesh(geometry, boxMaterials)
cube.geometry.scale(1, 1, -1) // z轴颠倒可以查看内部
scene.add(cube)
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #f0f0f0;
}
</style>
