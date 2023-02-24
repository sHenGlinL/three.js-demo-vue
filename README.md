# 笔记
## 常量 EquirectangularReflectionMapping 和 EquirectangularRefractionMapping 的区别
1. 都是球形全景纹理映射，用于等距圆柱投影的环境贴图，也被叫做经纬线映射贴图
2. 折射：EquirectangularRefractionMapping 反射：EquirectangularReflectionMapping

## 如何开启阴影
1. 材质要满足能对光照有反应
2. 设置渲染器开启阴影的计算 renderer.shadowMap.enabled = true
3. 设置光照投影阴影  directionalLight.castShadow = true
4. 设置物体投射阴影  sphere.castShadow = true
5. 设置物体接收阴影  plane.receiveShadow = true
