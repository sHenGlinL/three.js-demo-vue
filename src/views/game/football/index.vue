<template>
  <div class="container" ref="container"></div>
  <h1>{{ percentage }}</h1>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import * as CANNON from "cannon-es";
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const { innerWidth, innerHeight } = window
// 创建场景
const scene = new THREE.Scene();
// 创建透视相机
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  100
);
camera.position.set(4, 2, 0)
// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true, // 抗锯齿
  logarithmicDepthBuffer: true // 是否使用对数深度缓存。如果要在单个场景中处理巨大的比例差异，就有必要使用
})
renderer.setSize(innerWidth, innerHeight)
renderer.toneMapping = THREE.ACESFilmicToneMapping // 渲染器色调映射
renderer.toneMappingExposure = 0.5 // 色调映射曝光度
renderer.shadowMap.enabled = true // 开启阴影
renderer.shadowMap.type = THREE.PCFSoftShadowMap // 阴影类型 软阴影（效果更好）
// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
// 渲染函数
const clock = new THREE.Clock();
function render() {
  // 更新物理世界
  const delta = clock.getDelta();
  world.step(delta);
  // 更新渲染球的位置和旋转四元数
  if (ball && physicsBall) {
    ball.position.copy(physicsBall.position);
    ball.quaternion.copy(physicsBall.quaternion);
  }
  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}
const container = ref()
onMounted(() => {
  container.value.appendChild(renderer.domElement)
  render()
})

// 纹理加载器
const textureLoader = new THREE.TextureLoader();
// 设置场景背景
const backgroundImg = new URL('../../../assets/game/football/outdoor.jpg', import.meta.url).href
const backgroundTexture = textureLoader.load(backgroundImg);
backgroundTexture.mapping = THREE.EquirectangularReflectionMapping;
scene.background = backgroundTexture;
scene.environment = backgroundTexture;
scene.backgroundBlurriness = 0.3;

// 添加聚光灯
const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(10, 50, 0);
spotLight.intensity = 2;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.camera.near = 0.5;
spotLight.shadow.camera.far = 500;
spotLight.shadow.camera.fov = 30;
spotLight.shadow.bias = -0.00008;
scene.add(spotLight);

// 初始化物理世界
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // 设置重力

// 创建模型
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath("./draco/")
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let ball // 渲染的球
let physicsBall // 物理世界的球 

gltfLoader.load("./model/playground02.glb", (gltf) => {
  const model = gltf.scene
  model.traverse((child) => {
    // 找到非球的物体
    if (child.isMesh && child.name.search(/Solid/) == -1) {
      child.castShadow = true;
      child.receiveShadow = true;

      // trimesh类型（不规则形状的物体）
      const trimesh = new CANNON.Trimesh(
        child.geometry.attributes.position.array, // 坐标
        child.geometry.index.array // 顶点索引
      );
      // // 创建刚体
      const trimeshBody = new CANNON.Body({
        mass: 0,
        shape: trimesh,
      });
      // 获取渲染世界位置和旋转给到物理世界
      trimeshBody.position.copy(child.getWorldPosition(new THREE.Vector3()));
      trimeshBody.quaternion.copy(
        child.getWorldQuaternion(new THREE.Quaternion())
      );
      // 添加刚体到物理世界
      world.addBody(trimeshBody);

      // if (child.name == "door") {
      //   child.material = new THREE.MeshBasicMaterial({
      //     color: 0x000000,
      //     opacity: 0,
      //     transparent: true,
      //   });
      // }
    }
    
    // 找到足球模型
    if (child.name == "Soccer_Ball") {
      ball = child; // 记录渲染球
      // 创建物理球体
      const ballShape = new CANNON.Sphere(0.15);
      // 创建刚体
      physicsBall = new CANNON.Body({
        mass: 1, // 质量
        position: new CANNON.Vec3(0, 15, 0),
        shape: ballShape,
      });
      // 添加刚体到物理世界
      world.addBody(physicsBall);
    }
    // 位置复原
    setTimeout(() => {
      physicsBall.position.set(0, 15, 0);
      physicsBall.velocity.set(0, 0, 0);
      physicsBall.angularVelocity.set(0, 0, 0);
    }, 2000);

    // 隐藏门
    if (child.name == "door") {
      child.material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0,
        transparent: true,
      });
    }
  });
  scene.add(model)
})

// 鼠标点击踢球
const percentage = ref(30) // 力度百分比
gsap.to(percentage, {
  value: 100,
  duration: 1,
  ease: "linear",
  repeat: -1,
  onUpdate: () => {
    percentage.value = Math.floor(percentage.value);
  },
});
let isClick = false;
window.addEventListener("click", () => {
  if (isClick) return;
  isClick = true;
  // 施加力
  physicsBall.applyForce(
    new CANNON.Vec3(
      -10 * percentage.value,
      6 * percentage.value,
      (Math.random() - 0.5) * percentage.value
    ), // 力的方向大小
    physicsBall.position // 力的位置
  );
  setTimeout(() => {
    isClick = false;
    physicsBall.position.set(0, 15, 0);
    physicsBall.velocity.set(0, 0, 0); // 速度
    physicsBall.angularVelocity.set(0, 0, 0); // 角速度
  }, 5000);
});
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #f0f0f0;
}
h1 {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10;
  color: #fff;
}
</style>
