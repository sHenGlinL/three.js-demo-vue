<template>
  <div class="container" ref="container"></div>
  <div
    class="scenes"
    style="
      position: fixed;
      left: 0;
      top: 0;
      z-index: 10;
      pointer-events: none;
      transition: all 1s;
    "
    :style="{
      transform: `translate3d(0, ${-index * 100}vh, 0)`,
    }"
  >
    <div v-for="item in scenes" style="width: 100vw; height: 100vh">
      <h1 style="padding: 100px 50px; font-size: 50px; color: #fff">
        {{ item.text }}
      </h1>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader' // gltf模型载入库
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' // 模型解压库
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { Water } from 'three/examples/jsm/objects/Water2'
import gsap from 'gsap'

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
camera.position.set(-3.23, 2.98, 4.06)
// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true
})
renderer.setSize(innerWidth, innerHeight)
renderer.outputEncoding = THREE.sRGBEncoding // 输出色调编码
renderer.toneMapping = THREE.ACESFilmicToneMapping // 渲染器色调映射
renderer.toneMappingExposure = 0.5 // 色调映射曝光度
renderer.shadowMap.enabled = true // 开启阴影
renderer.physicallyCorrectLights = true // 物理光照模式
// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(-8, 2, 0)
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

// 添加环境纹理
const hdrLoader = new RGBELoader()
hdrLoader.loadAsync('./hdr/card/sky.hdr').then(texture => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.background = texture
  scene.environment = texture
})

// 设置水面效果
const waterGeometry = new THREE.CircleGeometry(300, 32)
const textureLoader = new THREE.TextureLoader();
const water = new Water(waterGeometry, {
  textureWidth: 1024,
  textureHight: 1024,
  color: '#eeeeff',
  flowDirection: new THREE.Vector2(1, 1), // 流向
  scale: 100, // 水面波纹大小
  normalMap0: textureLoader.load(new URL('../../assets/water/Water_1_M_Normal.jpg', import.meta.url).href),
  normalMap1: textureLoader.load(new URL('../../assets/water/Water_2_M_Normal.jpg', import.meta.url).href),
})
water.rotation.x = - Math.PI / 2 // 水面旋转至水平
water.position.y = -0.4
scene.add(water)

// 添加gltf模型
const dracoLoader = new DRACOLoader() // 解压
dracoLoader.setDecoderPath('./draco/') // 设置解压库路径
const gltfLoader = new GLTFLoader() // 模型载入
gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.load('./model/scene.glb', gltf => {
  const model = gltf.scene
  model.traverse(child => {
    if (child.name === 'Plane') {
      child.visible = false // 隐藏地面
    }
    // 为模型的所有元素开启阴影效果
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  scene.add(model)
})

// 添加平行光
const directionalLight = new THREE.DirectionalLight('#fff', 1)
directionalLight.position.set(0, 50, 0)
scene.add(directionalLight)
// 添加点光源
const pointLight = new THREE.PointLight('#fff', 50)
pointLight.position.set(0.1, 2.4, 0)
pointLight.castShadow = true
scene.add(pointLight)
// 创建3个球点光源组
const pointLightGroup = new THREE.Group()
const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32)
const sphereMaterial = new THREE.MeshStandardMaterial({
  color: '#fff',
  emissive: '#fff',
  emissiveIntensity: 10
})
const radius = 3 // 围着半径为3画圆
for (let i=0; i<3; i++) {
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.position.set(
    radius * Math.cos((i * 2 * Math.PI) / 3),
    Math.cos((i * 2 * Math.PI) / 3),
    radius * Math.sin((i * 2 * Math.PI) / 3)
  )
  const pointLight = new THREE.PointLight('#fff', 50)
  sphere.add(pointLight)
  pointLightGroup.add(sphere)
}
pointLightGroup.position.set(-8, 2.5, -1.5)
scene.add(pointLightGroup)

// 使用补间函数，从0到2pai，使灯泡旋转
let options = {
  angle: 0
}
gsap.to(options, {
  angle: Math.PI * 2,
  duration: 10,
  repeat: -1,
  ease: 'linear',
  onUpdate: () => {
    pointLightGroup.rotation.y = options.angle // 旋转
    pointLightGroup.children.forEach((item, index) => {
      item.position.y =  Math.cos((index * 2 * Math.PI) / 3 + options.angle * 5) // 上下摆动
    })
  }
})

// 切换摄像机位置
let scenes = [
  {
    text: "圣诞快乐",
    callback: () => {
      // 执行函数切换位置
      translateCamera(new THREE.Vector3(-3.23, 3, 4.06), new THREE.Vector3(-8, 2, 0));
    },
  },
  {
    text: "感谢在这么大的世界里遇见了你",
    callback: () => {
      // 执行函数切
      translateCamera(new THREE.Vector3(7, 0, 23), new THREE.Vector3(0, 0, 0));
    },
  },
  {
    text: "愿与你探寻世界的每一个角落",
    callback: () => {
      // 执行函数切
      translateCamera(new THREE.Vector3(10, 3, 0), new THREE.Vector3(5, 2, 0));
    },
  },
  {
    text: "愿将天上的星星送给你",
    callback: () => {
      // 执行函数切
      translateCamera(new THREE.Vector3(7, 0, 23), new THREE.Vector3(0, 0, 0));
      makeHeart();
    },
  },
  {
    text: "愿疫情结束，大家健康快乐！",
    callback: () => {
      // 执行函数切
      translateCamera(new THREE.Vector3(-20, 1.3, 6.6), new THREE.Vector3(5, 2, 0));
    },
  },
];

// 使用补间动画移动相机
let timeLine1 = gsap.timeline();
let timeline2 = gsap.timeline();

// 定义相机移动函数
function translateCamera(position, target) {
  timeLine1.to(camera.position, {
    x: position.x,
    y: position.y,
    z: position.z,
    duration: 1,
    ease: "power2.inOut",
  });

  timeline2.to(controls.target, {
    x: target.x,
    y: target.y,
    z: target.z,
    duration: 1,
    ease: "power2.inOut",
  });
}

let index = ref(0);
let isAnimate = false;
// 监听鼠标滚轮事件
window.addEventListener(
  "wheel",
  (e) => {
    if (isAnimate) return;
    isAnimate = true;
    if (e.deltaY > 0) {
      index.value++;
      if (index.value > scenes.length - 1) {
        index.value = 0;
        resetHeart();
      }
    }
    scenes[index.value].callback();
    setTimeout(() => {
      isAnimate = false;
    }, 1000);
  },
  false
);

// 实例化创建满天星星
const starsInstance = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.1, 32, 32),
  new THREE.MeshStandardMaterial({
    color: '#fff',
    emissive: '#fff',
    emissiveIntensity: 10
  }),
  100
)
// 随机分布到天上
const startPositionArr = [] // 起始星星位置
const endPositionArr = [] // 结束星星位置
for (let i=0; i < 100; i++) {
  const x = Math.random() * 100 - 50;
  const y = Math.random() * 100 - 50;
  const z = Math.random() * 100 - 50;
  startPositionArr.push(new THREE.Vector3(x, y, z));

  // 创建矩阵 方便操作（位移、旋转、缩放）
  const matrix = new THREE.Matrix4();
  matrix.setPosition(x, y, z);
  starsInstance.setMatrixAt(i, matrix)
}
scene.add(starsInstance);

// 使用【贝塞尔曲线】创建爱心路径
let heartShape = new THREE.Shape();
heartShape.moveTo(25, 25);
heartShape.bezierCurveTo(25, 25, 20, 0, 0, 0);
heartShape.bezierCurveTo(-30, 0, -30, 35, -30, 35);
heartShape.bezierCurveTo(-30, 55, -10, 77, 25, 95);
heartShape.bezierCurveTo(60, 77, 80, 55, 80, 35);
heartShape.bezierCurveTo(80, 35, 80, 0, 50, 0);
heartShape.bezierCurveTo(35, 0, 25, 25, 25, 25);

// 根据爱心路径获取结束坐标点
for (let i = 0; i < 100; i++) {
  let point = heartShape.getPoint(i / 100); // Shape获取的是Vector2
  // endPositionArr.push(new THREE.Vector3(point.x, point.y, point.z))
  endPositionArr.push(
    new THREE.Vector3(
      point.x * 0.1 - 2.3,
      point.y * 0.1 + 2,
      10
    )
  );
}
// 创建爱心动画
const makeHeart = () => {
  let params = {
    time: 0
  }
  gsap.to(params, {
    time: 1,
    duration: 1,
    onUpdate: () => {
      for (let i = 0; i < 100; i++) {
        let x = startPositionArr[i].x + (endPositionArr[i].x - startPositionArr[i].x) * params.time;
        let y = startPositionArr[i].y + (endPositionArr[i].y - startPositionArr[i].y) * params.time;
        let z = startPositionArr[i].z + (endPositionArr[i].z - startPositionArr[i].z) * params.time;
        const matrix = new THREE.Matrix4();
        matrix.setPosition(x, y, z);
        starsInstance.setMatrixAt(i, matrix)
      }
      starsInstance.instanceMatrix.needsUpdate = true // 实例化网格更新矩阵
    }
  })
}
// 复原爱心动画
const resetHeart = () => {
  let params = {
    time: 0
  }
  gsap.to(params, {
    time: 1,
    duration: 1,
    onUpdate: () => {
      for (let i = 0; i < 100; i++) {
        let x = endPositionArr[i].x + (startPositionArr[i].x - endPositionArr[i].x) * params.time;
        let y = endPositionArr[i].y + (startPositionArr[i].y - endPositionArr[i].y) * params.time;
        let z = endPositionArr[i].z + (startPositionArr[i].z - endPositionArr[i].z) * params.time;
        const matrix = new THREE.Matrix4();
        matrix.setPosition(x, y, z);
        starsInstance.setMatrixAt(i, matrix)
      }
      starsInstance.instanceMatrix.needsUpdate = true // 实例化网格更新矩阵
    }
  })
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #f0f0f0;
}
</style>
