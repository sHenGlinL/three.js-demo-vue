<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { gsap } from 'gsap'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'

// 实例化纹理加载器
const textureLoader = new THREE.TextureLoader();

const { innerWidth, innerHeight } = window
// 创建场景
const scene = new THREE.Scene();
scene.background = textureLoader.load(new URL(`../../../assets/earth/star.jpg`, import.meta.url).href)
// 创建透视相机
const camera = new THREE.PerspectiveCamera(
  45,
  innerWidth / innerHeight,
  0.1,
  200
);
camera.position.set(10, 5, 20);
// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
renderer.shadowMap.enabled = true // 开启阴影
// 标签渲染器
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(innerWidth, innerHeight)
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
// 添加坐标轴辅助器
// const axesHelper = new THREE.AxesHelper(500);
// scene.add(axesHelper);
// 渲染函数
const render = () => {
  controls.update()
  labelRenderer.render(scene, camera)
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}
const container = ref()
onMounted(() => {
  container.value.appendChild(labelRenderer.domElement)
  container.value.appendChild(renderer.domElement)
  render()
})

// 创建聚光灯光源
const dirLight = new THREE.SpotLight(0xffffff);
dirLight.position.set(0, 0, 10);
dirLight.intensity = 2;
dirLight.castShadow = true;
scene.add(dirLight)
// 添加环境光
const aLight = new THREE.AmbientLight(0xffffff)
aLight.intensity = 0.3
scene.add(aLight)

// 创建月球
const MOON_RADIUS = 0.27; // 月球半径
const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 16, 16);
const moonMaterial = new THREE.MeshPhongMaterial({
  map: textureLoader.load(new URL(`../../../assets/earth/moon_1024.jpg`, import.meta.url).href)
})
const moon = new THREE.Mesh(moonGeometry, moonMaterial)
moon.receiveShadow = true;
moon.castShadow = true;
// 月球文字标签
const moonDiv = document.createElement('div');
moonDiv.className = 'label';
moonDiv.textContent = 'Moon';
const moonLabel = new CSS2DObject(moonDiv)
moonLabel.position.set(0, MOON_RADIUS + 0.5, 0);
moon.add(moonLabel)
scene.add(moon)
// 月球公转+自转动画
const moonGsap = {
  time: 0,
  rotationRadius: 5 // 公转半径
};
gsap.to(moonGsap, {
  time: 1,
  duration: 8,
  repeat: -1,
  ease: "linear",
  onUpdate: () => {
    const { time, rotationRadius } = moonGsap
    moon.position.x = rotationRadius * Math.cos(time * Math.PI * 2);
    moon.position.z = - rotationRadius * Math.sin(time * Math.PI * 2);
    moon.rotation.y = time * Math.PI * 8;
  },
});

// 创建地球
const EARTH_RADIUS = 2.5; // 地球半径
const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 16, 16);
const earthMaterial = new THREE.MeshPhongMaterial({
  shininess: 5, // 高亮的程度
  map: textureLoader.load(new URL(`../../../assets/earth/earth_atmos_2048.jpg`, import.meta.url).href),
  specularMap: textureLoader.load(new URL(`../../../assets/earth/earth_specular_2048.jpg`, import.meta.url).href),
  normalMap: textureLoader.load(new URL(`../../../assets/earth/earth_normal_2048.jpg`, import.meta.url).href)
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.receiveShadow = true;
earth.castShadow = true;
// 地球文字标签
const earthDiv = document.createElement('div');
earthDiv.className = 'label';
earthDiv.textContent = 'Earth';
const eartchLabel = new CSS2DObject(earthDiv)
eartchLabel.position.set(0, EARTH_RADIUS + 0.5, 0);
earth.add(eartchLabel)
scene.add(earth)
// 地球自转动画
const earthGsap = {
  time: 0
};
gsap.to(earthGsap, {
  time: 1,
  duration: 8,
  repeat: -1,
  ease: "linear",
  onUpdate: () => {
    earth.rotation.y = earthGsap.time * Math.PI * 2;
  },
});
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #f0f0f0;
}
</style>

<style>
.label {
  color: #fff;
  font-size: 16px;
}
</style>
