<template>
  <section id="timeline" class="timeline-section">
    <div class="container">
      <div class="section-header reveal" ref="header">
        <span class="header-number">贰</span>
        <div class="header-text">
          <h2 class="section-title">历史脉络</h2>
          <p class="section-desc">从新石器时代到明清，六千年建筑文明的演进之路</p>
        </div>
      </div>

      <div class="timeline">
        <div
          v-for="(item, index) in timelineData"
          :key="item.era"
          class="timeline-item reveal"
          :class="{ right: index % 2 !== 0 }"
          :style="{ transitionDelay: `${index * 100}ms` }"
          :ref="el => itemRefs[index] = el"
        >
          <div class="timeline-dot"></div>
          <div class="timeline-card">
            <div class="timeline-era-badge">{{ item.era }}</div>
            <h3 class="timeline-title">{{ item.title }}</h3>
            <span class="timeline-period">{{ item.period }}</span>
            <p class="timeline-desc">{{ item.desc }}</p>
            <div class="timeline-buildings">
              <span class="buildings-label">代表建筑</span>
              <div class="buildings-tags">
                <span v-for="b in item.keyBuildings" :key="b" class="building-tag">{{ b }}</span>
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
import { timelineData } from '../data/buildings.js'

const header = ref(null)
const itemRefs = ref([])

onMounted(() => {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active') })
  }, { threshold: 0.2 })

  document.querySelectorAll('.timeline-section .reveal').forEach(el => obs.observe(el))
})
</script>

<style scoped>
.timeline-section {
  background: var(--paper);
  padding: 8rem 0;
  position: relative;
}
.container {
  max-width: 1000px;
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
.timeline {
  position: relative;
  padding: 2rem 0;
}
.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom, transparent, var(--vermilion), var(--vermilion), transparent);
}
.timeline-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 4rem;
  position: relative;
}
.timeline-item .timeline-card {
  width: 45%;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 6px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  transition: all 0.4s;
}
.timeline-item .timeline-card:hover {
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  transform: translateY(-3px);
}
.timeline-item .timeline-dot {
  position: absolute;
  left: 50%;
  top: 1.5rem;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--vermilion);
  border: 3px solid var(--paper);
  box-shadow: 0 0 0 2px var(--vermilion);
  z-index: 2;
}
.timeline-item.right {
  flex-direction: row-reverse;
}
.timeline-item.right .timeline-card {
  text-align: right;
}
.timeline-item.right .buildings-tags {
  justify-content: flex-end;
}
.timeline-era-badge {
  display: inline-block;
  padding: 0.2rem 0.8rem;
  background: var(--vermilion);
  color: #fff;
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  border-radius: 2px;
  margin-bottom: 0.8rem;
}
.timeline-title {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 1.3rem;
  color: var(--ink);
  letter-spacing: 0.1em;
  margin-bottom: 0.3rem;
}
.timeline-period {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  color: var(--gold);
  letter-spacing: 0.15em;
  display: block;
  margin-bottom: 0.8rem;
}
.timeline-desc {
  font-size: 0.85rem;
  line-height: 1.9;
  color: var(--ink-light);
  letter-spacing: 0.03em;
  margin-bottom: 1rem;
}
.timeline-buildings { display: flex; flex-direction: column; gap: 0.4rem; }
.buildings-label {
  font-size: 0.7rem;
  color: rgba(0,0,0,0.35);
  letter-spacing: 0.15em;
}
.buildings-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.building-tag {
  padding: 0.15rem 0.6rem;
  border: 1px solid rgba(192,57,43,0.2);
  color: var(--vermilion-dark);
  font-size: 0.7rem;
  border-radius: 2px;
  letter-spacing: 0.08em;
}
@media (max-width: 768px) {
  .container { padding: 0 1.5rem; }
  .timeline::before { left: 20px; }
  .timeline-item .timeline-card { width: calc(100% - 50px); margin-left: 50px; }
  .timeline-item.right { flex-direction: unset; }
  .timeline-item.right .timeline-card { text-align: left; }
  .timeline-item.right .buildings-tags { justify-content: flex-start; }
  .timeline-item .timeline-dot { left: 20px; }
}
</style>
