<template>
  <div class="container" ref="container"></div>

  <div class="car-config">
    <div class="title">汽车展示与选配</div>
    <div class="row">
      <div>选择车身颜色</div>
      <el-color-picker v-model="carColor" @active-change="carColorActiveChange" @change="carColorChange"/>
    </div>
    <div class="row">
      <div>选择贴膜材质</div>
      <el-button v-for="item in materialList" :key="item.name" @click="materialChange(item.value)">{{ item.name }}</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader' // gltf模型载入库
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' // 模型解压库

const { innerWidth, innerHeight } = window
// 创建场景
const scene = new THREE.Scene();
const sceneColor = new THREE.Color('#ccc')
scene.background = sceneColor
scene.environment = sceneColor
// 创建透视相机
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 7)
// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true // 抗锯齿
})
renderer.setSize(innerWidth, innerHeight)
// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
// 创建网格地面
const gridHelper = new THREE.GridHelper(10, 10)
gridHelper.material.opacity = 0.5
gridHelper.material.transparent = true
scene.add(gridHelper)
// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(500);
scene.add(axesHelper);
// 渲染函数
const render = () => {
  controls.update();
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}
const container = ref()
onMounted(() => {
  container.value.appendChild(renderer.domElement)
  render()
})
// 添加gltf汽车模型
const dracoLoader = new DRACOLoader() // 解压
dracoLoader.setDecoderPath('./draco/') // 设置解压库路径
const gltfLoader = new GLTFLoader() // 模型载入
gltfLoader.setDRACOLoader(dracoLoader)

const wheels = [] // 车轮毂
let carBody, frontCar, hoodCar, glassCar // 车部件
// 创建材质
const wheelsMaterial = new THREE.MeshPhysicalMaterial({
  color: 'red',
  metalness: 1, // 金属度
  roughness: 0.1, // 粗糙度
})
const bodyMaterial = new THREE.MeshPhysicalMaterial({
  color: 'red',
  metalness: 1, // 金属度
  roughness: 0.5, // 粗糙度
  clearcoat: 1, // 车漆
  clearcoatRoughness: 0, // 粗糙度
})
const frontMaterial = new THREE.MeshPhysicalMaterial({
  color: 'red',
  metalness: 1, // 金属度
  roughness: 0.5, // 粗糙度
  clearcoat: 1, // 车漆
  clearcoatRoughness: 0, // 粗糙度
})
const hoodMaterial = new THREE.MeshPhysicalMaterial({
  color: 'red',
  metalness: 1, // 金属度
  roughness: 0.5, // 粗糙度
  clearcoat: 1, // 车漆
  clearcoatRoughness: 0, // 粗糙度
})
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: '#fff',
  roughness: 0,
  transmission: 1,
  transparent: true
})

gltfLoader.load('./model/bmw01.glb', gltf => {
  const bmw = gltf.scene
  bmw.traverse(child => {
    if (child.isMesh) {
      if (child.name.includes('轮毂')) {
        child.material = wheelsMaterial
        wheels.push(child)
      }
      else if (child.name.includes('Mesh002')) {
        child.material = bodyMaterial
        carBody = child // 车身
      }
      else if (child.name.includes('前脸')) {
        child.material = frontMaterial
        frontCar = child // 前脸
      }
      else if (child.name.includes('引擎盖_1')) {
        child.material = hoodMaterial
        hoodCar = child // 引擎盖
      }
      else if (child.name.includes('挡风玻璃')) {
        child.material = glassMaterial
        glassCar = child // 挡风玻璃
      }
    }
  })
  scene.add(bmw)
})
// 添加灯光
const light1 = new THREE.DirectionalLight('#fff', 1)
light1.position.set(0, 0, 10)
const light2 = new THREE.DirectionalLight('#fff', 1)
light2.position.set(0, 0, -10)
const light3 = new THREE.DirectionalLight('#fff', 1)
light3.position.set(10, 0, 0)
const light4 = new THREE.DirectionalLight('#fff', 1)
light4.position.set(-10, 0, 0)
const light5 = new THREE.DirectionalLight('#fff', 0.3)
light5.position.set(0, 10, 0)
const light6 = new THREE.DirectionalLight('#fff', 0.3)
light6.position.set(5, 10, 0)
const light7 = new THREE.DirectionalLight('#fff', 0.3)
light7.position.set(0, 10, 5)
const light8 = new THREE.DirectionalLight('#fff', 0.3)
light8.position.set(0, 10, -5)
const light9 = new THREE.DirectionalLight('#fff', 0.3)
light9.position.set(-5, 10, 0)
scene.add(light1, light2, light3, light4, light5, light6, light7, light8, light9)
// 颜色选择
const carColor = ref('red')
const carColorChange = () => {
  wheelsMaterial.color.set(carColor.value)
  bodyMaterial.color.set(carColor.value)
  frontMaterial.color.set(carColor.value)
  hoodMaterial.color.set(carColor.value)
  glassMaterial.color.set(carColor.value)
}
const carColorActiveChange = (color) => {
  wheelsMaterial.color.set(color)
  bodyMaterial.color.set(color)
  frontMaterial.color.set(color)
  hoodMaterial.color.set(color)
  glassMaterial.color.set(color)
}
// 贴膜材质
const materialList = reactive([
  { name: '磨砂', value: 1 },
  { name: '冰晶', value: 0 }
])
const materialChange = (value) => {
  bodyMaterial.clearcoatRoughness = value
  frontMaterial.clearcoatRoughness = value
  hoodMaterial.clearcoatRoughness = value
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #f0f0f0;
}
.car-config {
  position: fixed;
  top: 28px;
  right: 28px;
  border: 2px solid #000;
  width: 300px;
  height: 500px;
  padding: 24px;
}
.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;
}
.row {
  display: flex;
  justify-content: space-between;
}
</style>
