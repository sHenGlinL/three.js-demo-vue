<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { gsap } from 'gsap'

const lon2xyz = (R, longitude, latitude) => {
  let lon = (longitude * Math.PI) / 180; // 转弧度值
  const lat = (latitude * Math.PI) / 180; // 转弧度值
  lon = -lon; // js坐标系z坐标轴对应经度-90度，而不是90度

  // 经纬度坐标转球面坐标计算公式
  const x = R * Math.cos(lat) * Math.cos(lon);
  const y = R * Math.sin(lat);
  const z = R * Math.cos(lat) * Math.sin(lon);
  // 返回球面坐标
  return new THREE.Vector3(x, y, z);
};

const { innerWidth, innerHeight } = window
// 创建场景
const scene = new THREE.Scene();
// 创建透视相机
const camera = new THREE.PerspectiveCamera(
  45,
  innerWidth / innerHeight,
  0.1,
  100000
);
camera.position.set(0, 50, 300);
// 创建渲染器
const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.autoRotate = true;
// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(500);
scene.add(axesHelper);
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

// 创建星空的背景
scene.background = new THREE.Color(0x030311);
// 随机创建500个星星坐标
const vertices = [];
for (let i = 0; i < 500; i++) {
  const vertex = new THREE.Vector3();
  vertex.x = 800 * Math.random() - 400;
  vertex.y = 800 * Math.random() - 400;
  vertex.z = 800 * Math.random() - 400;
  vertices.push(vertex.x, vertex.y, vertex.z);
}

// 使用点几何体创建星空效果
let starsGeometry = new THREE.BufferGeometry();
starsGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(new Float32Array(vertices), 3)
);

// 加载点材质纹理
const starImg = new URL(`../../assets/earth/stars.png`, import.meta.url).href
const starsTexture = new THREE.TextureLoader().load(starImg);
const starsMaterial = new THREE.PointsMaterial({
  size: 2,
  sizeAttenuation: true, // 尺寸衰减
  color: 0x4d76cf,
  transparent: true,
  opacity: 1,
  map: starsTexture,
});

let stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// 创建地球
let earthGeometry = new THREE.SphereGeometry(50, 32, 32);

const earthImg = new URL(`../../assets/earth/map.jpg`, import.meta.url).href
let earthTexture = new THREE.TextureLoader().load(earthImg);
let earthMaterial = new THREE.MeshBasicMaterial({
  map: earthTexture,
});
let earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);
// 发光地球
let lightEarthGeometry = new THREE.SphereGeometry(53, 32, 32);
const lightImg = new URL(`../../assets/earth/earth.jpg`, import.meta.url).href
let lightTexture = new THREE.TextureLoader().load(lightImg);
let lightEarthMaterial = new THREE.MeshBasicMaterial({
  map: lightTexture,
  alphaMap: lightTexture,
  blending: THREE.AdditiveBlending,
  transparent: true,
});
let lightEarth = new THREE.Mesh(lightEarthGeometry, lightEarthMaterial);
scene.add(lightEarth);

// 添加地球内外发光精灵
const spriteImg = new URL(`../../assets/earth/glow.png`, import.meta.url).href
let spriteTexture = new THREE.TextureLoader().load(spriteImg);
let spriteMaterial = new THREE.SpriteMaterial({
  map: spriteTexture,
  color: 0x4d76cf,
  transparent: true,
  depthWrite: false,
  depthTest: false,
  blending: THREE.AdditiveBlending,
});
let sprite = new THREE.Sprite(spriteMaterial); // 精灵是一个总是面朝着摄像机的平面
sprite.scale.set(155, 155, 0);
scene.add(sprite);

// 内发光
const innerGlowImg = new URL(`../../assets/earth/innerGlow.png`, import.meta.url).href
let spriteTexture1 = new THREE.TextureLoader().load(innerGlowImg);
let spriteMaterial1 = new THREE.SpriteMaterial({
  map: spriteTexture1,
  color: 0x4d76cf,
  transparent: true,
  depthWrite: false,
  depthTest: false,
  blending: THREE.AdditiveBlending,
});
let sprite1 = new THREE.Sprite(spriteMaterial1); // 精灵是一个总是面朝着摄像机的平面
sprite1.scale.set(128, 128, 0);
scene.add(sprite1);

for (let i = 0; i < 30; i++) {
  // 实现光柱
  let lightPillarTexture = new THREE.TextureLoader().load(
    new URL(`../../assets/earth/light_column.png`, import.meta.url).href
  );
  let lightPillarGeometry = new THREE.PlaneGeometry(3, 20);
  let lightPillarMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: lightPillarTexture,
    alphaMap: lightPillarTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  let lightPillar = new THREE.Mesh(lightPillarGeometry, lightPillarMaterial);
  lightPillar.add(lightPillar.clone().rotateY(Math.PI / 2)); // 拷贝一个光柱，并且旋转90度，形成交叉

  // 创建波纹
  let circlePlane = new THREE.PlaneGeometry(6, 6);
  let circleTexture = new THREE.TextureLoader().load(new URL(`../../assets/earth/label.png`, import.meta.url).href);
  let circleMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: circleTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  let circleMesh = new THREE.Mesh(circlePlane, circleMaterial);
  circleMesh.rotation.x = -Math.PI / 2;
  circleMesh.position.set(0, -7, 0);

  lightPillar.add(circleMesh);
  // 波纹扩散动画
  gsap.to(circleMesh.scale, {
    duration: 1 + Math.random() * 0.5,
    x: 2,
    y: 2,
    z: 2,
    repeat: -1,
    delay: Math.random() * 0.5,
    yoyo: true,
    ease: "power2.inOut",
  });

  // 设置光柱的位置
  let lat = Math.random() * 180 - 90;
  let lon = Math.random() * 360 - 180;
  let position = lon2xyz(60, lon, lat);
  lightPillar.position.set(position.x, position.y, position.z);

  // 光柱从 010方向 旋转到 position向量的方向上
  lightPillar.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    position.clone().normalize()
  );
  scene.add(lightPillar);
}

// 绕地球运行的月球
let moonTexture = new THREE.TextureLoader().load(new URL(`../../assets/earth/moon.jpg`, import.meta.url).href);
let moonMaterial = new THREE.MeshStandardMaterial({
  map: moonTexture,
  emissive: 0xffffff,
  emissiveMap: moonTexture,
});
let moonGeometry = new THREE.SphereGeometry(5, 32, 32);
let moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.set(150, 0, 0);
scene.add(moon);

// 创建月球环
let moonRingTexture = new THREE.TextureLoader().load(
  new URL(`../../assets/earth/moon_ring.png`, import.meta.url).href
);
let moonRingMaterial = new THREE.MeshBasicMaterial({
  map: moonRingTexture,
  transparent: true,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
  depthWrite: false,
  opacity: 0.5,
});
let moonRingGeometry = new THREE.RingGeometry(145, 155, 64);
let moonRing = new THREE.Mesh(moonRingGeometry, moonRingMaterial);
moonRing.rotation.x = -Math.PI / 2;
scene.add(moonRing);

let time = {
  value: 0,
};
gsap.to(time, {
  value: 1,
  duration: 10,
  repeat: -1,
  ease: "linear",
  onUpdate: () => {
    moon.position.x = 150 * Math.cos(time.value * Math.PI * 2);
    moon.position.z = 150 * Math.sin(time.value * Math.PI * 2);
    moon.rotation.y = time.value * Math.PI * 8;
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
