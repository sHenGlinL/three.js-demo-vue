<template>
  <div class="container" ref="container"></div>
  <div class="header">
    <div class="menu">
      <a href="https://www.cpengx.cn/" class="menuItem">首页</a>
      <a href="https://www.cpengx.cn/%e8%af%be%e7%a8%8b%e6%ba%90%e7%a0%81" class="menuItem">菜单1</a>
      <a href="https://www.cpengx.cn/moxing" class="menuItem">菜单2</a>
    </div>
  </div>
  <div class="pages" ref="pages">
    <div class="page">
      <h2 class="title">官网首页</h2>
      <p>轻松、好玩、有趣掌握前沿硬核前端技术</p>
    </div>
    <div class="page">
      <h2 class="title">WEB 3D可视化</h2>
      <p>领略WEB 3D的魅力，让页面无比酷炫</p>
    </div>
    <div class="page">
      <h2 class="title">ThreeJS框架</h2>
      <p>让前端开发3D效果更方便</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader' // gltf模型载入库
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { gsap } from 'gsap'

const { innerWidth, innerHeight } = window
// 创建场景
const scene = new THREE.Scene();
// 创建透视相机
const camera = new THREE.PerspectiveCamera(
  45,
  innerWidth / innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 10)
// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true // 抗锯齿
})
renderer.setSize(innerWidth, innerHeight)
// 渲染函数
const render = () => {
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}
const container = ref()
onMounted(() => {
  container.value.appendChild(renderer.domElement)
  render()
})

// 创建星空背景
const skyImg = new URL('../../assets/web/25s.jpg', import.meta.url).href
const skyTexture = new THREE.TextureLoader().load(skyImg)
skyTexture.mapping = THREE.EquirectangularReflectionMapping
scene.background = skyTexture
scene.environment = skyTexture

// 添加灯光
let light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 1);
scene.add(light);
let light2 = new THREE.DirectionalLight(0xffffff, 0.5);
light2.position.set(0, 0, -1);
scene.add(light2);
let light3 = new THREE.AmbientLight(0xffffff, 0.5);
light3.position.set(-1, 1, 1);
scene.add(light3);

// 加载模型
const dracoLoader = new DRACOLoader() // 解压
dracoLoader.setDecoderPath('./draco/') // 设置解压库路径
const gltfLoader = new GLTFLoader() // 模型载入
gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.load('./model/xz.glb', gltf => {
  const model = gltf.scene
  model.scale.set(0.1, 0.1, 0.1)
  model.position.x = 3
  scene.add(model)

  window.addEventListener('mousemove', e => {
    let x = (e.clientX / window.innerWidth) * 2 - 1;
    let y = (e.clientY / window.innerHeight) * 2 - 1;

    const timeline = gsap.timeline()
    timeline.to(model.rotation, {
      x: y,
      y: x,
      duration: 0.5
    })
  })
})
gltfLoader.load("./model/xq6.glb", (gltf) => {
  const model = gltf.scene
  model.scale.set(0.1, 0.1, 0.1);
  model.position.set(3, -12, 0);
  scene.add(model);

  window.addEventListener("mousemove", (e) => {
    let x = (e.clientX / window.innerWidth) * 2 - 1;
    let y = (e.clientY / window.innerHeight) * 2 - 1;

    let timeline = gsap.timeline();
    timeline.to(model.rotation, {
      x: y,
      y: x,
      duration: 0.5
    });
  });
});
gltfLoader.load("./model/horse.gltf", (gltf) => {
  const model = gltf.scene
  model.traverse(child => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: 'grey',
        opacity: 0.5,
        transparent: true,
        roughness: 0, // 粗糙度
      })
    }
  })
  model.position.set(3, -24 - 1, 0);
  scene.add(model);

  window.addEventListener("mousemove", (e) => {
    let x = (e.clientX / window.innerWidth) * 2 - 1;
    let y = (e.clientY / window.innerHeight) * 2 - 1;

    let timeline = gsap.timeline();
    timeline.to(model.rotation, {
      x: y,
      y: x,
      duration: 0.5
    });
  });
});

let pages = ref(null);
let page = 0;
let timeline2 = gsap.timeline();
window.addEventListener("mousewheel", (e) => {
  if (e.wheelDelta < 0) {
    page++;
    if (page > 2) {
      page = 2;
    }
  }
  if (e.wheelDelta > 0) {
    page--;
    if (page < 0) {
      page = 0;
    }
  }
  if (!timeline2.isActive()) {
    timeline2.to(camera.position, {
      y: page * -12,
      duration: 1,
    });
    gsap.to(pages.value, {
      y: -page * window.innerHeight,
      duration: 1,
    });
  }
});

// 加载月亮
gltfLoader.load("./model/moon.glb", (gltf) => {
  let moon = gltf.scene.children[0];
  for (let j = 0; j < 10; j++) { // 循环10次，创建10组月亮
    // 使用实例化 创建100个月亮
    let moonInstance = new THREE.InstancedMesh(
      moon.geometry,
      moon.material,
      100
    );
    for (let i = 0; i < 100; i++) {
      let x = Math.random() * 1000 - 500;
      let y = Math.random() * 1000 - 500;
      let z = Math.random() * 1000 - 500;

      let matrix = new THREE.Matrix4();
      // let size = Math.random() * 2.5;
      let size = Math.random() * 20 - 8;
      matrix.makeScale(size, size, size);
      matrix.makeTranslation(x, y, z);
      // matrix.setPosition(x, y, z)
      moonInstance.setMatrixAt(i, matrix);
    }

    gsap.to(moonInstance.position, {
      duration: Math.random() * 10 + 2, // 随机每一组月亮的速度
      z: -1000,
      ease: "linear",
      repeat: -1,
    });
    scene.add(moonInstance);
  }
});
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #f0f0f0;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu {
  margin-left: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-right: 50px;
}

.menuItem {
  padding: 0 15px;
  text-decoration: none;
  color: #fff;
  font-weight: 900;
  font-size: 15px;
}

.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url(./assets/loading.jpg);
  background-size: cover;
  filter: blur(50px);
  z-index: 100;
}

.progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 101;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  color: #fff;
}

.progress>img {
  padding: 0 15px;
}

/* .title {
  width: 380px;
  height: 40px;
  position: fixed;
  right: 100px;
  top: 50px;
  background-color: rgba(0, 0, 0, 0.5);
  line-height: 40px;
  text-align: center;
  color: #fff;
  border-radius: 5px;
  z-index: 110;
} */
.pages {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
}

.pages .page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  color: #fff;
  padding: 15%;
  box-sizing: border-box;
}

.pages .page .title {
  font-size: 50px;
  font-weight: 900;
  margin-bottom: 20px;
}

.pages .page p {
  font-size: 25px;
}
</style>
