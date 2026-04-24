<template>
  <div class="three-preview" ref="container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const props = defineProps({
  building: { type: Object, default: null },
  large: { type: Boolean, default: false }
})

const container = ref(null)
let scene, camera, renderer, animationId, group

function init() {
  if (!container.value) return
  const el = container.value
  const w = el.clientWidth || 300
  const h = el.clientHeight || 240

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0d0d0d)

  camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100)
  camera.position.set(0, 1.5, 5)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  el.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const dir = new THREE.DirectionalLight(0xffeedd, 0.8)
  dir.position.set(3, 5, 3)
  scene.add(dir)
  const rim = new THREE.PointLight(0xc9a961, 0.3, 15)
  rim.position.set(-3, 2, 2)
  scene.add(rim)

  group = new THREE.Group()
  scene.add(group)

  if (props.building) loadBuildingModel(props.building.category)
  animate()
}

function loadBuildingModel(category) {
  const loader = new GLTFLoader()
  
  // 根据建筑类型映射到实际的模型文件
  const modelMap = {
    'palace': 'gugong.glb',
    'temple': 'tiantan.glb',
    'pagoda': 'yingxian-pagoda.glb',
    'fortress': 'potala-palace.glb',
    'cliff': 'xuankong-temple.glb',
    'bridge': 'zhaozhou-bridge.glb'
  }
  
  const modelName = modelMap[category] || `${category}.glb`
  const modelPath = `/models/${modelName}`
  
  console.log(`🔍 尝试加载：${modelPath}`)
  
  loader.load(
    modelPath,
    (gltf) => {
      console.log(`📦 模型数据结构:`, gltf)
      const model = gltf.scene
      
      // 自动计算合适的缩放
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 3 / maxDim
      
      model.scale.set(scale, scale, scale)
      model.position.set(0, 0, 0)
      model.rotation.set(0, Math.PI / 4, 0)
      group.add(model)
      console.log(`✅ ${modelName} 模型加载成功，尺寸：${maxDim.toFixed(2)}`)
    },
    (progress) => {
      if (progress.total !== 0) {
        const percent = ((progress.loaded / progress.total) * 100).toFixed(2)
        console.log(`📊 ${modelName} 加载进度：${percent}%`)
      }
    },
    (error) => {
      console.error(`❌ ${modelName} 加载错误:`, error)
      console.log(`ℹ️ 使用程序化 ${category} 模型`)
      buildModel(category)
    }
  )
}

function buildModel(category) {
  const mat = {
    gold: new THREE.MeshStandardMaterial({ color: 0xc9a961, roughness: 0.2, metalness: 0.8, emissive: 0xaa8844, emissiveIntensity: 0.1 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.7, metalness: 0.1 }),
    roof: new THREE.MeshStandardMaterial({ color: 0x2a1810, roughness: 0.6, metalness: 0.3 }),
    red: new THREE.MeshStandardMaterial({ color: 0x8b1a1a, roughness: 0.4, metalness: 0.3 }),
    white: new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.5 }),
    stone: new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.9 }),
    green: new THREE.MeshStandardMaterial({ color: 0x4a7c59, roughness: 0.5 }),
    base: new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9 }),
    pillar: new THREE.MeshStandardMaterial({ color: 0x8b1a1a, roughness: 0.4, metalness: 0.3 })
  }

  if (category === 'palace') {
    // 多层台基
    const base1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.25, 2.6), mat.base)
    base1.position.set(0, -1.3, 0)
    group.add(base1)
    const base2 = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.2, 2.4), mat.base)
    base2.position.set(0, -1.05, 0)
    group.add(base2)
    
    // 墙体
    const wall = new THREE.Mesh(new THREE.BoxGeometry(3, 1.4, 2), mat.red)
    wall.position.y = -0.2
    group.add(wall)
    
    // 窗棂
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.5 })
    for (let i = -1; i <= 1; i += 2) {
      const win1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.05), windowMat)
      win1.position.set(i * 0.8, 0.1, 1.01)
      group.add(win1)
      const win2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.05), windowMat)
      win2.position.set(i * 0.8, 0.1, -1.01)
      win2.rotation.y = Math.PI
      group.add(win2)
    }
    
    // 柱子
    const colGeo = new THREE.CylinderGeometry(0.1, 0.12, 1.8, 12)
    const colPos = [[-1.3, -0.3, -0.8], [-1.3, -0.3, 0.8], [1.3, -0.3, -0.8], [1.3, -0.3, 0.8]]
    colPos.forEach(([x, y, z]) => {
      const col = new THREE.Mesh(colGeo, mat.pillar)
      col.position.set(x, y, z)
      group.add(col)
      // 柱础
      const colBase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.25, 12), mat.base)
      colBase.position.set(x, -1.25, z)
      group.add(colBase)
      // 斗拱
      const dougong = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.4), mat.gold)
      dougong.position.set(x, 0.75, z)
      group.add(dougong)
    })
    
    // 屋顶（庑殿顶）
    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 3.0), mat.roof)
    roof.position.y = 0.65
    group.add(roof)
    
    const eaves = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.05, 3.4), mat.roof)
    eaves.position.y = 0.72
    group.add(eaves)
    
    // 屋脊
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 0.15), mat.gold)
    ridge.position.set(0, 0.95, 0)
    group.add(ridge)
    
    // 吻兽简化
    const chiwen = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), mat.gold)
    chiwen.position.set(1.35, 1.05, 0)
    group.add(chiwen)
    const chiwen2 = chiwen.clone()
    chiwen2.position.set(-1.35, 1.05, 0)
    group.add(chiwen2)
  } else if (category === 'temple') {
    // 三层汉白玉台基
    const platform1 = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 0.35, 32), mat.white)
    platform1.position.y = -1.4
    group.add(platform1)
    const platform2 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, 0.3, 32), mat.white)
    platform2.position.y = -1.05
    group.add(platform2)
    const platform3 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.25, 32), mat.white)
    platform3.position.y = -0.75
    group.add(platform3)
    
    // 殿身（圆形攒尖顶）
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, 2.0, 32), mat.white)
    body.position.y = 0.2
    group.add(body)
    
    // 柱子（红色环绕）
    const colGeo = new THREE.CylinderGeometry(0.08, 0.1, 2.2, 12)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const col = new THREE.Mesh(colGeo, mat.red)
      col.position.set(Math.cos(angle) * 1.15, 0.2, Math.sin(angle) * 1.15)
      group.add(col)
    }
    
    // 屋顶（绿色琉璃瓦攒尖顶）
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.2, 32), mat.green)
    roof.position.y = 1.6
    group.add(roof)
    
    // 宝顶
    const treasureBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.3, 16), mat.gold)
    treasureBase.position.y = 2.3
    group.add(treasureBase)
    const treasureTop = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), mat.gold)
    treasureTop.position.y = 2.55
    group.add(treasureTop)
    const treasureFinial = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.4, 16), mat.gold)
    treasureFinial.position.y = 2.75
    group.add(treasureFinial)
  } else if (category === 'pagoda') {
    // 多层石质台基
    const base1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.3, 2.6), mat.base)
    base1.position.y = -1.5
    group.add(base1)
    const base2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 2.4), mat.base)
    base2.position.y = -1.2
    group.add(base2)
    
    // 五层塔身
    for (let i = 0; i < 5; i++) {
      const s = 2.0 - i * 0.3
      const fh = i * 0.8 - 1.0
      const layerGroup = new THREE.Group()
      
      // 地板
      const floor = new THREE.Mesh(new THREE.BoxGeometry(s, 0.12, s), mat.wood)
      floor.position.y = fh
      group.add(floor)
      
      // 墙体
      const wall = new THREE.Mesh(new THREE.BoxGeometry(s * 0.92, 0.65, s * 0.92), mat.wood)
      wall.position.y = fh + 0.4
      group.add(wall)
      
      // 窗棂
      const windowMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.5 })
      for (let side = 0; side < 4; side++) {
        const angle = side * Math.PI / 2
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.04), windowMat)
        win.position.set(
          Math.cos(angle) * (s * 0.4),
          fh + 0.45,
          Math.sin(angle) * (s * 0.4)
        )
        win.rotation.y = -angle
        group.add(win)
      }
      
      // 屋檐
      const roof = new THREE.Mesh(new THREE.ConeGeometry(s * 1.05, 0.35, 8), mat.roof)
      roof.position.y = fh + 0.85
      group.add(roof)
      
      // 飞檐
      const eavesCurve = new THREE.Mesh(new THREE.TorusGeometry(s * 0.55, 0.025, 8, 4, Math.PI / 2), mat.roof)
      eavesCurve.rotation.x = Math.PI / 2
      eavesCurve.position.y = fh + 0.95
      group.add(eavesCurve)
      
      // 斗拱层
      const dougong = new THREE.Mesh(new THREE.BoxGeometry(s * 0.95, 0.15, s * 0.95), mat.gold)
      dougong.position.y = fh + 0.72
      group.add(dougong)
    }
    
    // 塔刹
    const spireBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.25, 8), mat.gold)
    spireBase.position.y = 2.8
    group.add(spireBase)
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.9, 8), mat.gold)
    spire.position.y = 3.2
    group.add(spire)
    const spireTop = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), mat.gold)
    spireTop.position.y = 3.7
    group.add(spireTop)
  } else if (category === 'fortress') {
    // 城墙台基
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 2.7), mat.stone)
    base.position.y = -1.2
    group.add(base)
    
    // 城墙主体（带垛口）
    const wall = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.5, 2.2), mat.stone)
    wall.position.y = 0.25
    group.add(wall)
    
    // 垛口（城垛）
    const merlonGeo = new THREE.BoxGeometry(0.3, 0.4, 0.3)
    for (let i = -2; i <= 2; i++) {
      const merlon1 = new THREE.Mesh(merlonGeo, mat.stone)
      merlon1.position.set(i * 0.6, 1.65, 1.1)
      group.add(merlon1)
      const merlon2 = new THREE.Mesh(merlonGeo, mat.stone)
      merlon2.position.set(i * 0.6, 1.65, -1.1)
      group.add(merlon2)
    }
    
    // 城楼
    const towerBase = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.3, 1.8), mat.wood)
    towerBase.position.y = 1.65
    group.add(towerBase)
    
    const tower = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.6), mat.red)
    tower.position.y = 2.6
    group.add(tower)
    
    // 城楼窗棂
    const towerWin = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.04), mat.wood)
    towerWin.position.set(0, 2.6, 0.81)
    group.add(towerWin)
    
    // 城楼屋顶（歇山顶简化）
    const towerRoof = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 2.2), mat.roof)
    towerRoof.position.y = 3.6
    group.add(towerRoof)
    
    const towerEaves = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.05, 2.6), mat.roof)
    towerEaves.position.y = 3.68
    group.add(towerEaves)
    
    // 城楼屋脊
    const towerRidge = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.12), mat.gold)
    towerRidge.position.set(0, 3.9, 0)
    group.add(towerRidge)
  } else if (category === 'cliff') {
    // 悬崖
    const cliffGeo = new THREE.BoxGeometry(4, 3, 2)
    const cliff = new THREE.Mesh(cliffGeo, mat.stone)
    cliff.position.y = -0.8
    group.add(cliff)
    // 悬挑建筑
    const building = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 0.8), mat.wood)
    building.position.set(0.3, 0.3, 0)
    group.add(building)
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 1.1), mat.roof)
    roof.position.set(0.3, 0.75, 0)
    group.add(roof)
    // 支撑柱
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.8, 6), mat.wood)
    pillar.position.set(0.3, -0.2, 0)
    group.add(pillar)
  } else if (category === 'bridge') {
    const span = 2.5
    const archGeo = new THREE.TorusGeometry(1.5, 0.25, 8, 24, Math.PI)
    const arch = new THREE.Mesh(archGeo, mat.stone)
    arch.rotation.z = Math.PI
    arch.position.y = -0.3
    group.add(arch)
    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 0.5), mat.stone)
    deck.position.y = 0.25
    group.add(deck)
    // 栏杆
    ;[-0.6, 0, 0.6].forEach(z => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.06, 0.05), mat.gold)
      rail.position.set(0, 0.38, z)
      group.add(rail)
    })
    // 桥墩
    ;[-1.2, 1.2].forEach(x => {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.6, 0.4), mat.stone)
      pier.position.set(x, -0.1, 0)
      group.add(pier)
    })
  }
}

function animate() {
  animationId = requestAnimationFrame(animate)
  if (group) group.rotation.y += 0.01
  if (renderer && scene && camera) renderer.render(scene, camera)
}

watch(() => props.building, (newVal) => {
  if (!group) return
  while (group.children.length) group.remove(group.children[0])
  if (newVal) buildModel(newVal.category)
})

onMounted(() => {
  init()
  const ro = new ResizeObserver(() => {
    if (!container.value || !renderer) return
    const w = container.value.clientWidth
    const h = container.value.clientHeight
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  })
  if (container.value) ro.observe(container.value)
  onUnmounted(() => {
    ro.disconnect()
    cancelAnimationFrame(animationId)
    
    // 清理 Three.js 资源
    if (group) {
      group.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose())
          } else {
            child.material?.dispose()
          }
        }
      })
      scene.remove(group)
    }
    
    if (renderer) {
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
    
    // 清理场景
    while(scene.children.length) {
      scene.remove(scene.children[0])
    }
  })
})
</script>

<style scoped>
.three-preview {
  width: 100%;
  height: 100%;
}
.three-preview canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
