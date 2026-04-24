<template>
  <section id="components" class="components-section">
    <div class="container">
      <div class="section-header reveal" ref="header">
        <span class="header-number">叁</span>
        <div class="header-text">
          <h2 class="section-title">建筑构件</h2>
          <p class="section-desc">斗拱、榫卯、飞檐——三大核心构件的力学智慧</p>
        </div>
      </div>

      <div class="components-grid">
        <div
          v-for="(comp, index) in componentsData"
          :key="comp.id"
          class="component-card reveal"
          :style="{ transitionDelay: `${index * 120}ms` }"
          :ref="el => cardRefs[index] = el"
        >
          <!-- 3D 构件展示 -->
          <div class="component-3d">
            <ComponentPreview :component="comp" />
          </div>

          <!-- 构件信息 -->
          <div class="component-info">
            <h3 class="comp-name">{{ comp.name }}</h3>
            <p class="comp-pinyin">{{ comp.pinyin }}</p>
            <p class="comp-brief">{{ comp.brief }}</p>

            <!-- 参数表 -->
            <div class="specs-table">
              <div class="spec-row" v-for="(val, key) in comp.specs" :key="key">
                <span class="spec-key">{{ key }}</span>
                <span class="spec-val">{{ val }}</span>
              </div>
            </div>

            <div class="comp-principle">
              <h4>力学原理</h4>
              <p>{{ comp.principle }}</p>
            </div>

            <div class="comp-apps">
              <span class="apps-label">应用场景</span>
              <div class="apps-tags">
                <span v-for="app in comp.applications" :key="app" class="app-tag">{{ app }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { componentsData } from '../data/buildings.js'
import ComponentPreview from './ComponentPreview.vue'

const header = ref(null)
const cardRefs = ref([])

onMounted(() => {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active') })
  }, { threshold: 0.15 })
  document.querySelectorAll('.components-section .reveal').forEach(el => obs.observe(el))
})
</script>

<style scoped>
.components-section {
  background: linear-gradient(180deg, var(--paper) 0%, #e8e0d0 100%);
  padding: 8rem 0;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 3rem;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 4rem;
}
.header-number {
  font-family: 'Ma Shan Zheng', serif;
  font-size: 4rem;
  color: var(--vermilion);
  opacity: 0.4;
  line-height: 1;
}
.header-text { flex: 1; }
.section-title {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: clamp(2rem, 5vw, 3rem);
  color: var(--ink);
  letter-spacing: 0.15em;
  margin-bottom: 0.5rem;
}
.section-desc {
  font-size: 0.95rem;
  color: var(--ink-light);
  letter-spacing: 0.08em;
}
.components-grid {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}
.component-card {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 3rem;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  transition: all 0.5s;
}
.component-card:hover {
  box-shadow: 0 12px 40px rgba(0,0,0,0.1);
  transform: translateY(-4px);
}
.component-card:nth-child(even) {
  grid-template-columns: 1fr 380px;
}
.component-card:nth-child(even) .component-3d {
  order: 2;
}
.component-3d {
  height: 400px;
  background: linear-gradient(135deg, #1a1a1a, #2d1810);
  overflow: hidden;
}
.component-3d canvas { width: 100% !important; height: 100% !important; }
.component-info {
  padding: 2.5rem 2.5rem 2.5rem 0;
}
.component-card:nth-child(even) .component-info {
  padding: 2.5rem 0 2.5rem 2.5rem;
}
.comp-name {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 2rem;
  color: var(--ink);
  letter-spacing: 0.2em;
  margin-bottom: 0.3rem;
}
.comp-pinyin {
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  color: var(--vermilion);
  letter-spacing: 0.2em;
  margin-bottom: 1rem;
}
.comp-brief {
  font-size: 0.9rem;
  line-height: 1.9;
  color: var(--ink-light);
  letter-spacing: 0.03em;
  margin-bottom: 1.5rem;
}
.specs-table {
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}
.spec-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.spec-row:last-child { border-bottom: none; }
.spec-key {
  padding: 0.5rem 0.8rem;
  font-size: 0.72rem;
  color: rgba(0,0,0,0.4);
  letter-spacing: 0.1em;
  background: rgba(0,0,0,0.02);
  border-right: 1px solid rgba(0,0,0,0.05);
}
.spec-val {
  padding: 0.5rem 0.8rem;
  font-size: 0.82rem;
  color: var(--ink);
  letter-spacing: 0.03em;
}
.comp-principle {
  background: rgba(192,57,43,0.04);
  border-left: 3px solid var(--vermilion);
  padding: 0.8rem 1rem;
  border-radius: 0 4px 4px 0;
  margin-bottom: 1.2rem;
}
.comp-principle h4 {
  font-family: 'Noto Serif SC', serif;
  font-size: 0.75rem;
  color: var(--vermilion);
  letter-spacing: 0.15em;
  margin-bottom: 0.4rem;
}
.comp-principle p {
  font-size: 0.85rem;
  line-height: 1.8;
  color: var(--ink-light);
  letter-spacing: 0.03em;
}
.comp-apps { display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; }
.apps-label {
  font-size: 0.72rem;
  color: rgba(0,0,0,0.35);
  letter-spacing: 0.1em;
}
.app-tag {
  padding: 0.2rem 0.8rem;
  border: 1px solid rgba(74,124,89,0.3);
  color: var(--celadon-dark);
  font-size: 0.72rem;
  border-radius: 2px;
  letter-spacing: 0.08em;
}
@media (max-width: 900px) {
  .container { padding: 0 1.5rem; }
  .component-card,
  .component-card:nth-child(even) {
    grid-template-columns: 1fr;
  }
  .component-card:nth-child(even) .component-3d { order: 0; }
  .component-3d { height: 280px; }
  .component-info,
  .component-card:nth-child(even) .component-info { padding: 1.5rem; }
}
</style>
