<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// 导入着色器代码
// import vertexShader from "./shader/vertexShader.glsl";
import fragmentShader from "./shader/fragmentShader.glsl?raw";

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
camera.position.set(0, 0, 5)
// 创建渲染器
const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// 添加平行光源
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(0, 10, 5);
// directionalLight.castShadow = true;
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight2.position.set(0, -10, -5);
// directionalLight2.castShadow = true;
scene.add(directionalLight, directionalLight2);

// 声明导弹、乌克兰地图、俄罗斯地图、导弹曲线
let missile, mapwkl, mapels, curvePath;
// 载入模型
const gltfLoader = new GLTFLoader();
gltfLoader.load("./model/guided/ew8.glb", (gltf) => {
  const model = gltf.scene
  mapels = model.children[0]; // 俄罗斯地图
  mapwkl = model.children[1]; // 乌克兰地图
  curvePath = model.children[2]; // 导弹曲线
  missile = model.children[3]; // 导弹
  scene.add(mapels, mapwkl, missile)

  // 根据点创建曲线
  const points = [];
  const curvePosition = curvePath.geometry.attributes.position
  for (let i = curvePosition.count - 1; i >= 0; i--) {
    points.push(
      new THREE.Vector3(
        curvePosition.array[i * 3],
        curvePosition.array[i * 3 + 1],
        curvePosition.array[i * 3 + 2]
      )
    );
  }
  curvePath = new THREE.CatmullRomCurve3(points); // 从一系列的点创建一条平滑的三维样条曲线
})

// 创建爆炸效果
// 添加一个sprite
const spriteMaterial = new THREE.SpriteMaterial({
  color: 0xffffff,
  blending: THREE.AdditiveBlending,
})
// 爆炸时间线
const iTime = {
  value: 0,
}
// 在onBeforeCompile函数中添加着色器代码
spriteMaterial.onBeforeCompile = function(shader) {
  // 替换common
  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    `
    #include <common>
    varying vec2 vUv;
    `
  )
  // 替换uv
  shader.vertexShader = shader.vertexShader.replace(
    "#include <uv_vertex>",
    `
    #include <uv_vertex>
    vUv = uv;
    `
  )
  // 替换片元着色器
  shader.fragmentShader = fragmentShader

  // 添加uniform变量
  shader.uniforms.iResolution = {
    value: new THREE.Vector2(window.innerWidth, window.innerHeight),
  };
  shader.uniforms.iTime = iTime;
  shader.uniforms.iMouse = {
    value: new THREE.Vector2(0, 0)
  }
  shader.uniforms.iChannel0 = {
    value: new THREE.TextureLoader().load(new URL('../../../assets/game/guided/ichannel0.png', import.meta.url).href),
  }
  shader.uniforms.iChannel1 = {
    value: new THREE.TextureLoader().load(new URL('../../../assets/game/guided/ichannel1.png', import.meta.url).href),
  }
  shader.uniforms.iChannel2 = {
    value: new THREE.TextureLoader().load(new URL('../../../assets/game/guided/ichannel2.png', import.meta.url).href),
  }
}
const sprite = new THREE.Sprite(spriteMaterial)
sprite.position.set(-5.5, 0.8, 0);
// scene.add(sprite)

// 添加爆炸声音
const listener = new THREE.AudioListener()
const sound = new THREE.Audio(listener)
const audioLoader = new THREE.AudioLoader()
audioLoader.load(new URL('../../../assets/game/guided/bomb.mp3', import.meta.url).href, (buffer) => {
  sound.setBuffer(buffer);
  sound.setVolume(0.5);
});

// 创建clock
const clock = new THREE.Clock();
// 渲染函数
const render = () => {
  // 导弹动画
  let t = clock.getElapsedTime() % 5;  // 设置5秒循环1次
  t = t / 5
  if (curvePath) {
    // const point = curvePath.getPointAt(t); // 根据弧长在曲线上的位置。必须在范围[0，1]内。
    missile.position.copy(curvePath.getPointAt(t)) // 设置导弹飞行坐标
    
    // 判断t+0.1是否小于1，如果小于1就设置导弹飞行方向
    if (t + 0.1 < 1) {
      missile.lookAt(curvePath.getPointAt(t + 0.01)) // 设置导弹飞行方向
    }
    // 设置爆炸效果和音效
    if (t > 0.95) {
      scene.add(sprite);
      // 判断声音是否播放，如果没有播放则播放
      if (!sound.isPlaying) {
        sound.play();
      }
    }
  }
  // 爆炸动画
  iTime.value = t * 10;

  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
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
