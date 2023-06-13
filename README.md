# 笔记

## 创建大量几何体
### BufferGeometry
1. 创建大量的几何体，可用BufferGeometry
2. 需要创建Float32Array + BufferAttribute设置所有几何体的属性（如position）
3. 最后使用Points创建
### InstancedMesh
1. 创建大量的几何体，也可以使用实例化创建
2. 使用矩阵Matrix4设置position等属性，方便操作（位移、旋转、缩放）

## 几何体叠加的时候可能用到的属性
1. depthWrite 渲染此材质是否对深度缓冲区有任何影响
2. blending 设置叠加算法
## 物体交互
1. 使用投射光线 Raycaster
## 着色器 
- precision lowp float 设置浮点数精度 highp mediump lowp
- Attributes 与每个顶点关联的变量
- Uniforms是所有顶点都具有相同的值的变量
- Varyings 是从顶点着色器传递到片元着色器的变量
### ShaderMaterial 着色器材质
1. 至少设置 顶点着色器vertesShader 和片元着色器fragmentShader（分别编写两个.glsl文件）
- vertesShader 设置gl_position
```
# 投影矩阵 * 视图矩阵 * 模型矩阵 * 顶点坐标
gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 )
```
### rawShaderMaterial 原始着色器材质
## 材质的mapping属性
- 常量 EquirectangularReflectionMapping 和 EquirectangularRefractionMapping 的区别
1. 都是球形全景纹理映射，用于等距圆柱投影的环境贴图，也被叫做经纬线映射贴图
2. 折射：EquirectangularRefractionMapping 反射：EquirectangularReflectionMapping

## 如何开启阴影
1. 材质要满足能对光照有反应
2. 设置渲染器开启阴影的计算 renderer.shadowMap.enabled = true
3. 设置光照投影阴影  directionalLight.castShadow = true
4. 设置物体投射阴影  sphere.castShadow = true
5. 设置物体接收阴影  plane.receiveShadow = true

## 物理引擎的使用
- 使用 cannon 物理引擎库
1. 实际上是创造一个物理世界
2. 把渲染物体（初始状态）复制到物理世界得到虚拟物体，进行物理交互
3. 把物理交互后的虚拟物体复制回Scene，得到渲染物体（结束状态）