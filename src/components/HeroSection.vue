<template>
  <section id="hero" class="hero">
    <div id="hero-canvas" class="hero-canvas"></div>
    <!-- 墨迹装饰 -->
    <div class="ink-splash left"></div>
    <div class="ink-splash right"></div>

    <!-- 内容层 -->
    <div class="hero-content">
      <div class="hero-eyebrow reveal" ref="eyebrow">
        <span class="eyebrow-line"></span>
        <span class="eyebrow-text">弘扬中华优秀自然科学文明和优秀文化传承</span>
        <span class="eyebrow-line"></span>
      </div>
      <h1 class="hero-title reveal" ref="title">
        <span class="title-main">中国古代建筑</span>
        <span class="title-sub">千年营造 · 匠心永恒</span>
      </h1>
      <p class="hero-desc reveal" ref="desc">
        从故宫到应县木塔，从天坛到悬空寺<br/>
        探索中华建筑文明中的力学智慧与艺术之美
      </p>
      <div class="hero-actions reveal" ref="actions">
        <a href="#buildings" class="btn-primary">
          <span>探索建筑</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </a>
        <a href="#timeline" class="btn-ghost">历史脉络</a>
      </div>

      <!-- 底部统计 -->
      <div class="hero-stats reveal" ref="statsEl">
        <div class="stat-item" v-for="stat in statsData" :key="stat.label">
          <div class="stat-number" :data-target="stat.value">{{ stat.display }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- 向下滚动提示 -->
    <div class="scroll-indicator">
      <div class="scroll-line"></div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const eyebrow = ref(null)
const title = ref(null)
const desc = ref(null)
const actions = ref(null)
const statsEl = ref(null)

const statsData = [
  { value: 5000, display: '5000+', label: '年建筑史' },
  { value: 6, display: '6', label: '大建筑体系' },
  { value: 37, display: '37', label: '处世界遗产' },
  { value: 50, display: '50+', label: '种斗拱类型' }
]

let scene, camera, renderer, animationId, pagodaGroup, particles = []

function initThree() {
  const container = document.getElementById('hero-canvas')
  if (!container) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 3, 10)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  container.appendChild(renderer.domElement)

  // 灯光
  scene.add(new THREE.AmbientLight(0xfff5e0, 0.6))
  const dirLight = new THREE.DirectionalLight(0xffe0b0, 0.8)
  dirLight.position.set(5, 10, 7)
  scene.add(dirLight)
  const goldLight = new THREE.PointLight(0xc9a961, 0.4, 20)
  goldLight.position.set(-3, 2, 5)
  scene.add(goldLight)

  loadPagodaModel()
  createParticles()
  createGroundPlane()

  animate()
  window.addEventListener('resize', onResize)
}

function loadPagodaModel() {
  pagodaGroup = new THREE.Group()
  const loader = new GLTFLoader()
  
  loader.load(
    '/models/yingxian-pagoda.glb',
    (gltf) => {
      const model = gltf.scene
      
      // 自动计算合适的缩放和位置
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 8 / maxDim
      
      model.scale.set(scale, scale, scale)
      model.position.set(0, -2, 0)
      model.rotation.set(0, 0, 0)
      
      pagodaGroup.add(model)
      scene.add(pagodaGroup)
      
      console.log('✅ 应县木塔模型加载成功')
    },
    undefined,
    (error) => {
      console.log('ℹ️ 使用程序化佛塔模型')
      createPagodaFallback()
    }
  )
}

function createPagodaFallback() {
  pagodaGroup = new THREE.Group()
  
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.7, metalness: 0.1 })
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xc9a961, roughness: 0.2, metalness: 0.8, emissive: 0xaa8844, emissiveIntensity: 0.1 })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x2a1810, roughness: 0.6, metalness: 0.3 })
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9, metalness: 0.1 })

  const base1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.3, 4.2), baseMat)
  base1.position.set(0, -2.1, 0)
  pagodaGroup.add(base1)
  const base2 = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.25, 4.0), baseMat)
  base2.position.set(0, -1.85, 0)
  pagodaGroup.add(base2)
  const base3 = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.2, 3.8), baseMat)
  base3.position.set(0, -1.6, 0)
  pagodaGroup.add(base3)

  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x8b1a1a, roughness: 0.4, metalness: 0.3 })
  const colGeo = new THREE.CylinderGeometry(0.12, 0.14, 3.5, 12)
  const colPositions = [[-1.5, 0, -1.5], [-1.5, 0, 1.5], [1.5, 0, -1.5], [1.5, 0, 1.5]]
  colPositions.forEach(([x, y, z]) => {
    const col = new THREE.Mesh(colGeo, pillarMat)
    col.position.set(x, y, z)
    pagodaGroup.add(col)
  })

  for (let i = 0; i < 5; i++) {
    const s = 2.5 - i * 0.4
    const fh = i * 1.0 - 1.0
    const floor = new THREE.Mesh(new THREE.BoxGeometry(s, 0.15, s), woodMat)
    floor.position.y = fh
    pagodaGroup.add(floor)
    const wall = new THREE.Mesh(new THREE.BoxGeometry(s * 0.9, 0.8, s * 0.9), woodMat)
    wall.position.y = fh + 0.45
    pagodaGroup.add(wall)
    const roof = new THREE.Mesh(new THREE.ConeGeometry(s * 1.1, 0.4, 8), roofMat)
    roof.position.y = fh + 1.0
    pagodaGroup.add(roof)
  }

  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.08, 1.2, 8), goldMat)
  spire.position.y = 4.6
  pagodaGroup.add(spire)

  scene.add(pagodaGroup)
}

function createParticles() {
  const geo = new THREE.SphereGeometry(0.025, 6, 6)
  const mat = new THREE.MeshBasicMaterial({ color: 0xc9a961, transparent: true, opacity: 0.5 })
  for (let i = 0; i < 60; i++) {
    const p = new THREE.Mesh(geo, mat.clone())
    p.position.set((Math.random() - 0.5) * 20, Math.random() * 12 - 3, (Math.random() - 0.5) * 20)
    p.userData = { speed: Math.random() * 0.008 + 0.003, offset: Math.random() * Math.PI * 2 }
    scene.add(p)
    particles.push(p)
  }
}

function createGroundPlane() {
  const geo = new THREE.PlaneGeometry(30, 30)
  const mat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, transparent: true, opacity: 0.3, roughness: 1 })
  const plane = new THREE.Mesh(geo, mat)
  plane.rotation.x = -Math.PI / 2
  plane.position.y = -2.2
  scene.add(plane)
}

function animate() {
  animationId = requestAnimationFrame(animate)
  if (pagodaGroup) {
    pagodaGroup.rotation.y += 0.003
    pagodaGroup.position.y = Math.sin(Date.now() * 0.0005) * 0.15
  }
  particles.forEach(p => {
    p.position.y += Math.sin(Date.now() * 0.001 + p.userData.offset) * 0.004
    p.material.opacity = 0.2 + Math.sin(Date.now() * 0.002 + p.userData.offset) * 0.3
  })
  renderer.render(scene, camera)
}

function onResize() {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

onMounted(() => {
  initThree()
  // 触发动画
  setTimeout(() => {
    [eyebrow.value, title.value, desc.value, actions.value, statsEl.value].forEach((el, i) => {
      if (el) setTimeout(() => el.classList.add('active'), i * 150)
    })
  }, 500)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
  
  // 清理 Three.js 资源
  if (pagodaGroup) {
    pagodaGroup.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose())
        } else {
          child.material?.dispose()
        }
      }
    })
    scene.remove(pagodaGroup)
  }
  
  // 清理粒子
  particles.forEach(p => {
    p.geometry?.dispose()
    p.material?.dispose()
    scene.remove(p)
  })
  particles = []
  
  // 清理场景
  while(scene.children.length) {
    scene.remove(scene.children[0])
  }
  
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer.domElement.remove()
  }
})
</script>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 700px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 60%, #1a120a 0%, #0a0a0a 60%, #000 100%);
}
.hero-canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 1;
}
.ink-splash {
  position: absolute;
  width: 40%;
  height: 60%;
  pointer-events: none;
  z-index: 2;
  opacity: 0.06;
}
.ink-splash.left {
  top: 5%; left: -5%;
  background: radial-gradient(ellipse, #c9a961 0%, transparent 70%);
}
.ink-splash.right {
  bottom: 5%; right: -5%;
  background: radial-gradient(ellipse, #c0392b 0%, transparent 70%);
}
.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 0 2rem;
  max-width: 900px;
}
.hero-eyebrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.eyebrow-line {
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}
.eyebrow-text {
  font-family: 'Noto Serif SC', serif;
  font-size: 0.8rem;
  color: var(--gold);
  letter-spacing: 0.3em;
  white-space: nowrap;
}
.hero-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}
.title-main {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: clamp(3rem, 10vw, 6rem);
  color: var(--paper);
  letter-spacing: 0.15em;
  line-height: 1.1;
  text-shadow: 0 0 60px rgba(201,169,97,0.3);
}
.title-sub {
  font-family: 'Noto Serif SC', serif;
  font-size: clamp(1rem, 3vw, 1.5rem);
  color: var(--gold);
  letter-spacing: 0.5em;
  margin-top: 0.8rem;
  font-weight: 300;
}
.hero-desc {
  font-family: 'Noto Serif SC', serif;
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  color: rgba(245,240,232,0.65);
  line-height: 2;
  letter-spacing: 0.08em;
  margin-bottom: 3rem;
}
.hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 4rem;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 2.5rem;
  background: var(--vermilion);
  color: var(--paper);
  text-decoration: none;
  font-family: 'Noto Serif SC', serif;
  font-size: 0.9rem;
  letter-spacing: 0.2em;
  border-radius: 2px;
  transition: all 0.3s;
}
.btn-primary svg {
  width: 16px; height: 16px;
}
.btn-primary:hover {
  background: var(--vermilion-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(192,57,43,0.3);
}
.btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 0.9rem 2rem;
  border: 1px solid rgba(201,169,97,0.4);
  color: var(--gold);
  text-decoration: none;
  font-family: 'Noto Serif SC', serif;
  font-size: 0.9rem;
  letter-spacing: 0.2em;
  border-radius: 2px;
  transition: all 0.3s;
}
.btn-ghost:hover {
  background: rgba(201,169,97,0.1);
  border-color: var(--gold);
}
.hero-stats {
  display: flex;
  justify-content: center;
  gap: 4rem;
}
.stat-item {
  text-align: center;
}
.stat-number {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 2.5rem;
  color: var(--gold);
  letter-spacing: 0.05em;
  line-height: 1;
}
.stat-label {
  font-family: 'Noto Serif SC', serif;
  font-size: 0.75rem;
  color: rgba(245,240,232,0.5);
  letter-spacing: 0.2em;
  margin-top: 0.5rem;
}
.scroll-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}
.scroll-line {
  width: 1px;
  height: 50px;
  background: linear-gradient(to bottom, var(--gold), transparent);
  animation: scrollPulse 2s ease-in-out infinite;
}
@keyframes scrollPulse {
  0%, 100% { opacity: 0.3; transform: scaleY(0.5); transform-origin: top; }
  50% { opacity: 1; transform: scaleY(1); }
}
/* 响应式 */
@media (max-width: 768px) {
  .hero-stats { gap: 2rem; flex-wrap: wrap; }
  .stat-number { font-size: 2rem; }
  .hero-actions { flex-direction: column; gap: 1rem; }
}
</style>
