<template>
  <section id="buildings" class="buildings-section">
    <!-- 背景装饰 -->
    <div class="bg-pattern"></div>

    <div class="container">
      <!-- 标题 -->
      <div class="section-header reveal" ref="header">
        <span class="header-number">壹</span>
        <div class="header-text">
          <h2 class="section-title">经典建筑</h2>
          <p class="section-desc">六座代表性建筑，涵盖宫殿、祭祀、塔寺、桥梁五大类型</p>
        </div>
      </div>

      <!-- 筛选标签 -->
      <div class="filter-bar reveal" ref="filter">
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['filter-btn', { active: activeFilter === cat.id }]"
          @click="activeFilter = cat.id"
        >
          {{ cat.label }}
        </button>
      </div>

      <!-- 建筑卡片网格 -->
      <div class="buildings-grid">
        <div
          v-for="(building, index) in filteredBuildings"
          :key="building.id"
          class="building-card reveal"
          :ref="el => cardRefs[index] = el"
          :style="{ transitionDelay: `${index * 80}ms` }"
          @click="openDetail(building)"
        >
          <!-- 3D 预览区 -->
          <div class="card-3d-preview" :ref="el => canvasRefs[index] = el">
            <ThreePreview :building="building" />
          </div>

          <!-- 卡片内容 -->
          <div class="card-body">
            <div class="card-era">
              <span class="era-tag">{{ building.era }}</span>
              <span class="location-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {{ building.location }}
              </span>
            </div>
            <h3 class="card-name">{{ building.name }}</h3>
            <p class="card-pinyin">{{ building.pinyin }}</p>
            <p class="card-brief">{{ building.brief }}</p>

            <!-- 数据统计 -->
            <div class="card-stats">
              <div class="stat-chip" v-for="(value, key) in displayStats(building.stats)" :key="key">
                <span class="chip-label">{{ key }}</span>
                <span class="chip-value">{{ value }}</span>
              </div>
            </div>

            <!-- 标签 -->
            <div class="card-tags">
              <span class="tag" v-for="tag in building.tags.slice(0, 3)" :key="tag">{{ tag }}</span>
            </div>

            <!-- 悬停指示 -->
            <div class="card-hover-hint">
              <span>点击查看详情</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <Transition name="modal">
      <div class="detail-modal" v-if="selectedBuilding" @click.self="closeDetail">
        <div class="modal-panel">
          <button class="modal-close" @click="closeDetail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <div class="modal-header" :style="{ '--primary': selectedBuilding.colors.primary }">
            <div class="modal-3d">
              <ThreePreview :building="selectedBuilding" :large="true" />
            </div>
            <div class="modal-title-area">
              <span class="modal-era">{{ selectedBuilding.era }}</span>
              <h2 class="modal-name">{{ selectedBuilding.name }}</h2>
              <p class="modal-pinyin">{{ selectedBuilding.pinyin }}</p>
              <p class="modal-location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {{ selectedBuilding.location }}
              </p>
            </div>
          </div>

          <div class="modal-body">
            <div class="modal-stats-grid">
              <div class="stat-block" v-for="(value, key) in displayStats(selectedBuilding.stats)" :key="key">
                <div class="stat-block-value">{{ value }}</div>
                <div class="stat-block-label">{{ key }}</div>
              </div>
            </div>

            <div class="modal-desc-section">
              <h4 class="modal-section-title">建筑简介</h4>
              <p class="modal-desc">{{ selectedBuilding.fullDesc }}</p>
            </div>

            <div class="modal-desc-section">
              <h4 class="modal-section-title">建筑特色</h4>
              <ul class="feature-list">
                <li v-for="f in selectedBuilding.features" :key="f">
                  <span class="feature-dot"></span>{{ f }}
                </li>
              </ul>
            </div>

            <div class="modal-desc-section">
              <h4 class="modal-section-title">文化内涵</h4>
              <p class="modal-culture">{{ selectedBuilding.culture }}</p>
            </div>

            <div class="modal-tags">
              <span class="tag" v-for="tag in selectedBuilding.tags" :key="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { buildingsData } from '../data/buildings.js'
import ThreePreview from './ThreePreview.vue'

const header = ref(null)
const filter = ref(null)
const cardRefs = ref([])
const canvasRefs = ref([])
const activeFilter = ref('all')
const selectedBuilding = ref(null)

const categories = [
  { id: 'all', label: '全部' },
  { id: 'palace', label: '宫殿' },
  { id: 'temple', label: '祭祀' },
  { id: 'pagoda', label: '塔寺' },
  { id: 'cliff', label: '崖壁' },
  { id: 'bridge', label: '桥梁' }
]

const filteredBuildings = computed(() => {
  if (activeFilter.value === 'all') return buildingsData
  return buildingsData.filter(b => b.category === activeFilter.value)
})

function displayStats(stats) {
  if (!stats) return {}
  const labels = { area: '占地面积', buildings: '建筑规模', rooms: '房间数', height: '高度', length: '桥长', span: '跨度', arch: '拱矢', floors: '层数', material: '主要材料', lifespan: '历史', diameter: '直径' }
  return Object.fromEntries(
    Object.entries(stats).map(([k, v]) => [labels[k] || k, v])
  )
}

function openDetail(building) {
  selectedBuilding.value = building
  document.body.style.overflow = 'hidden'
}

function closeDetail() {
  selectedBuilding.value = null
  document.body.style.overflow = ''
}

// 滚动触发动画
function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active')
      }
    })
  }, { threshold: 0.15 })

  document.querySelectorAll('.buildings-section .reveal').forEach(el => observer.observe(el))
}

onMounted(() => {
  nextTick(() => setupReveal())
})
</script>

<style scoped>
.buildings-section {
  background: var(--ink);
  color: var(--paper);
  padding: 8rem 0;
  position: relative;
  overflow: hidden;
}
.bg-pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(192,57,43,0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(201,169,97,0.03) 0%, transparent 50%);
  pointer-events: none;
}
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
}
.header-number {
  font-family: 'Ma Shan Zheng', serif;
  font-size: 4rem;
  color: var(--vermilion);
  opacity: 0.5;
  line-height: 1;
}
.header-text { flex: 1; }
.section-title {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: clamp(2rem, 5vw, 3rem);
  color: var(--paper);
  letter-spacing: 0.15em;
  margin-bottom: 0.5rem;
}
.section-desc {
  font-family: 'Noto Serif SC', serif;
  font-size: 0.95rem;
  color: rgba(245,240,232,0.5);
  letter-spacing: 0.1em;
}
/* 筛选栏 */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 3rem;
}
.filter-btn {
  padding: 0.5rem 1.5rem;
  background: rgba(245,240,232,0.05);
  border: 1px solid rgba(201,169,97,0.2);
  color: rgba(245,240,232,0.6);
  font-family: 'Noto Serif SC', serif;
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.3s;
}
.filter-btn:hover,
.filter-btn.active {
  background: rgba(201,169,97,0.15);
  border-color: var(--gold);
  color: var(--gold);
}
/* 网格 */
.buildings-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
.building-card {
  background: rgba(245,240,232,0.03);
  border: 1px solid rgba(201,169,97,0.12);
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.4,0,0.2,1);
  position: relative;
}
.building-card:hover {
  transform: translateY(-8px);
  border-color: rgba(201,169,97,0.4);
  box-shadow: 0 20px 50px rgba(0,0,0,0.4), 0 0 30px rgba(201,169,97,0.06);
}
/* 3D 预览 */
.card-3d-preview {
  height: 240px;
  background: linear-gradient(180deg, #1a1a1a, #0d0d0d);
  overflow: hidden;
}
.card-3d-preview canvas {
  width: 100% !important;
  height: 100% !important;
}
/* 卡片内容 */
.card-body {
  padding: 1.5rem;
}
.card-era {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.8rem;
}
.era-tag {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  color: var(--vermilion);
}
.location-tag {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: rgba(245,240,232,0.4);
}
.location-tag svg { width: 12px; height: 12px; }
.card-name {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 1.6rem;
  color: var(--paper);
  letter-spacing: 0.2em;
  margin-bottom: 0.2rem;
}
.card-pinyin {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  color: var(--gold);
  letter-spacing: 0.15em;
  margin-bottom: 0.8rem;
}
.card-brief {
  font-size: 0.85rem;
  line-height: 1.8;
  color: rgba(245,240,232,0.6);
  letter-spacing: 0.03em;
  margin-bottom: 1.2rem;
}
/* 数据统计 */
.card-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.stat-chip {
  background: rgba(201,169,97,0.06);
  border: 1px solid rgba(201,169,97,0.1);
  border-radius: 3px;
  padding: 0.4rem 0.6rem;
}
.chip-label {
  display: block;
  font-size: 0.65rem;
  color: rgba(245,240,232,0.4);
  letter-spacing: 0.1em;
  margin-bottom: 0.15rem;
}
.chip-value {
  display: block;
  font-size: 0.8rem;
  color: var(--gold);
  letter-spacing: 0.05em;
  font-weight: 600;
}
/* 标签 */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1rem;
}
.tag {
  padding: 0.2rem 0.8rem;
  border: 1px solid rgba(201,169,97,0.3);
  color: var(--gold);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  border-radius: 2px;
}
/* 悬停提示 */
.card-hover-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem;
  border-top: 1px solid rgba(201,169,97,0.1);
  font-size: 0.75rem;
  color: rgba(245,240,232,0.3);
  letter-spacing: 0.15em;
  opacity: 0;
  transform: translateY(5px);
  transition: all 0.3s;
}
.card-hover-hint svg { width: 14px; height: 14px; }
.building-card:hover .card-hover-hint {
  opacity: 1;
  transform: translateY(0);
}
/* ===== 弹窗 ===== */
.detail-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.modal-panel {
  background: var(--ink);
  border: 1px solid rgba(201,169,97,0.2);
  border-radius: 8px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}
.modal-close {
  position: sticky;
  top: 1rem;
  float: right;
  margin: 1rem 1rem -3rem 0;
  background: rgba(245,240,232,0.05);
  border: 1px solid rgba(201,169,97,0.2);
  color: var(--paper);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s;
}
.modal-close svg { width: 16px; height: 16px; }
.modal-close:hover { background: var(--vermilion); border-color: var(--vermilion); }
.modal-header {
  background: linear-gradient(135deg, #1a1a1a, #2d1810);
  padding: 2rem;
  display: flex;
  gap: 2rem;
  align-items: center;
}
.modal-3d {
  width: 280px;
  height: 220px;
  background: #0d0d0d;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}
.modal-3d canvas { width: 100% !important; height: 100% !important; }
.modal-title-area { flex: 1; }
.modal-era {
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  color: var(--vermilion);
}
.modal-name {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 2.5rem;
  color: var(--paper);
  letter-spacing: 0.2em;
  margin: 0.5rem 0;
}
.modal-pinyin {
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  color: var(--gold);
  letter-spacing: 0.15em;
  margin-bottom: 0.5rem;
}
.modal-location {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: rgba(245,240,232,0.5);
}
.modal-location svg { width: 14px; height: 14px; }
.modal-body { padding: 2rem; }
.modal-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}
.stat-block {
  background: rgba(201,169,97,0.06);
  border: 1px solid rgba(201,169,97,0.1);
  border-radius: 4px;
  padding: 1rem;
  text-align: center;
}
.stat-block-value {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 1.1rem;
  color: var(--gold);
  letter-spacing: 0.05em;
  margin-bottom: 0.3rem;
}
.stat-block-label {
  font-size: 0.7rem;
  color: rgba(245,240,232,0.4);
  letter-spacing: 0.1em;
}
.modal-desc-section { margin-bottom: 1.5rem; }
.modal-section-title {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 1.1rem;
  color: var(--vermilion);
  letter-spacing: 0.15em;
  margin-bottom: 0.8rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(201,169,97,0.1);
}
.modal-desc, .modal-culture {
  font-size: 0.9rem;
  line-height: 2;
  color: rgba(245,240,232,0.75);
  letter-spacing: 0.03em;
}
.feature-list {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.feature-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.88rem;
  color: rgba(245,240,232,0.7);
  line-height: 1.6;
}
.feature-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--vermilion);
  margin-top: 0.5rem;
  flex-shrink: 0;
}
.modal-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }
/* 过渡 */
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-panel { animation: slideUp 0.3s ease; }
@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
/* 响应式 */
@media (max-width: 1024px) {
  .buildings-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .container { padding: 0 1.5rem; }
  .buildings-grid { grid-template-columns: 1fr; }
  .modal-header { flex-direction: column; }
  .modal-3d { width: 100%; height: 180px; }
  .modal-stats-grid { grid-template-columns: repeat(2, 1fr); }
  .feature-list { grid-template-columns: 1fr; }
}
</style>
