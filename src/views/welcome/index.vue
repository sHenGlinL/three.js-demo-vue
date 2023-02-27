<template>
    <div class="welcome">
      <div class="welcome__title" @click="goBack">welcome</div>
      
      <transition name="slide-fade">
        <div class="welcome__main" v-if="nextMenu.length === 0" >
          <div class="welcome__main__modules" v-for="item in modules" :key="item.name" @click="clickModule(item)">
            {{item.name}}
          </div>
        </div>
        <div class="welcome__main" v-else>
          <div class="welcome__main__modules" v-for="item in nextMenu" :key="item.name" @click="toPage(item)">
            {{item.name}}
          </div>
        </div>
      </transition>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const allRoutes = router.getRoutes()
const modules = router.options.routes.slice(1)

const nextMenu = ref([])
function clickModule(module) {
  if (module.children) {
    nextMenu.value = module.children
  } else {
    toPage(module)
  }
}

function toPage({ name }) {
  const path = allRoutes.find(route => route.name === name)?.path
  if (path) {
    const routeData = router.resolve({ path })
    window.open(routeData.href, '_blank')
  } else {
    ElMessage.warning('无此路由，请检查路由配置')
  }
}

function goBack() {
  nextMenu.value = []
}
</script>

<style lang="scss" scoped>
.welcome{
  color: #fff;
  background-color: #000;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .welcome__title{
    font-size: 125px;
    width: 100%;
    text-align: center;
    transition: all .3s;
    cursor: pointer;

    &:hover {
      transform: scale(1.2);
    }
    &:active {
      transform: translateY(-10px);
    }
  }
  .welcome__main{
    flex: 1;
    display: grid;
    padding: 120px;
    grid-template-columns: repeat(5, 1fr);
    gap: 44px;
    .welcome__main__modules{
      font-size: 32px;
      border: 3px solid #fff;
      border-radius: 10px;
      height: 140px;
      line-height: 140px;
      text-align: center;
      text-overflow:ellipsis;
      white-space: nowrap;
      overflow: hidden;
      cursor: pointer;
      transition: all .3s;

      &:hover {
        transform: scale(1.2);
      }
      &:active {
        transform: translateY(-10px);
      }
    }
    .welcome__main__back{
      position: absolute;
      right: 0;
      bottom: 0;
    }
  }
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
</style>