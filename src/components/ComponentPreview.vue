<template>
  <div class="comp-preview" ref="container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  component: { type: Object, default: null }
})

const container = ref(null)
let scene, camera, renderer, animationId, group

function init() {
  if (!container.value) return
  const el = container.value
  const w = el.clientWidth || 380
  const h = el.clientHeight || 400

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0d0d0d)
  camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100)
  camera.position.set(0, 1, 5)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)
  el.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const dir = new THREE.DirectionalLight(0xffeedd, 0.8)
  dir.position.set(3, 5, 3)
  scene.add(dir)

  group = new THREE.Group()
  scene.add(group)

  if (props.component) buildModel(props.component.name)
  animate()
}

function buildModel(name) {
  const wood = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.6 })
  const gold = new THREE.MeshStandardMaterial({ color: 0xc9a961, roughness: 0.3, metalness: 0.6 })
  const roof = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 })

  if (name === '斗拱') {
    // 斗（方形木块）
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const dou = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.3), wood)
        dou.position.set((col - 1) * 0.35, row * 0.3 - 0.4, 0)
        group.add(dou)
      }
    }
    // 拱（弓形横木）
    for (let i = 0; i < 2; i++) {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-1, 0.2 + i * 0.3, 0),
        new THREE.Vector3(0, 0.5 + i * 0.3, 0),
        new THREE.Vector3(1, 0.2 + i * 0.3, 0)
      )
      const pts = curve.getPoints(20)
      const geo = new THREE.TubeGeometry(curve, 20, 0.04, 6, false)
      const arch = new THREE.Mesh(geo, gold)
      group.add(arch)
    }
    // 昂（斜撑）
    const ang = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.2, 0.08), wood)
    ang.rotation.z = -0.3
    ang.position.set(0.4, 0.3, 0)
    group.add(ang)
  } else if (name === '榫卯') {
    // 卯孔（凹）
    const socket = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.5), wood)
    socket.position.set(0, 0, 0)
    group.add(socket)
    // 卯内凹槽
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.52), new THREE.MeshStandardMaterial({ color: 0x3d3d3d }))
    slot.position.set(0, 0.05, 0)
    group.add(slot)
    // 榫头（凸）
    const tenon = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.45), wood)
    tenon.position.set(0.9, 0.05, 0)
    group.add(tenon)
    // 榫头尖端
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.2, 4), wood)
    tip.rotation.z = -Math.PI / 2
    tip.position.set(1.4, 0.05, 0)
    group.add(tip)
    // 连接件示意
    const conn = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.55), wood)
    conn.position.set(0, 0, 0)
    group.add(conn)
    const slot2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.32, 0.57), new THREE.MeshStandardMaterial({ color: 0x3d3d3d }))
    slot2.position.set(0, 0.05, 0)
    group.add(slot2)
  } else if (name === '飞檐') {
    // 屋面
    const roofBody = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 2), roof)
    roofBody.position.y = 0.3
    group.add(roofBody)
    // 飞檐曲线（使用多段）
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-1.25, 0.3, -1),
      new THREE.Vector3(-1.8, 0.15, -1.5),
      new THREE.Vector3(-2.2, -0.1, -2)
    )
    const roofGeo = new THREE.TubeGeometry(curve, 20, 0.06, 6, false)
    const eave = new THREE.Mesh(roofGeo, roof)
    group.add(eave)
    // 对称侧
    const curve2 = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-1.25, 0.3, 1),
      new THREE.Vector3(-1.8, 0.15, 1.5),
      new THREE.Vector3(-2.2, -0.1, 2)
    )
    const eave2 = new THREE.Mesh(new THREE.TubeGeometry(curve2, 20, 0.06, 6, false), roof)
    group.add(eave2)
    // 椽
    ;[-1, 0, 1].forEach(z => {
      const rafter = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 1.5, 6), wood)
      rafter.rotation.z = Math.PI / 2 - 0.3
      rafter.position.set(-0.5, 0.15, z * 0.7)
      group.add(rafter)
    })
  }
}

function animate() {
  animationId = requestAnimationFrame(animate)
  if (group) {
    group.rotation.y += 0.008
    group.position.y = Math.sin(Date.now() * 0.001) * 0.1
  }
  renderer?.render(scene, camera)
}

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
    renderer?.dispose()
  })
})
</script>

<style scoped>
.comp-preview { width: 100%; height: 100%; }
.comp-preview canvas { display: block; width: 100% !important; height: 100% !important; }
</style>
