<template>
  <section class="quote-section">
    <div class="quote-bg"></div>
    <div class="quote-inner reveal" ref="quoteEl">
      <div class="quote-mark">❝</div>
      <blockquote class="quote-text">
        尺之木必有节目<br/>
        寸之玉必有瑕疵
      </blockquote>
      <div class="quote-meta">
        <span class="quote-source">—— 先秦《吕氏春秋》</span>
        <p class="quote-ctx">此言原喻人才之完备，借以言建筑——中国古代建筑亦如良材美玉，虽历千年而风骨犹存，每一构件皆承载着先人的智慧与匠心。</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const quoteEl = ref(null)
onMounted(() => {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) quoteEl.value?.classList.add('active') })
  }, { threshold: 0.4 })
  if (quoteEl.value) obs.observe(quoteEl.value)
})
</script>

<style scoped>
.quote-section {
  position: relative;
  padding: 8rem 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.quote-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, #2d1810 0%, #1a1a1a 60%, #0a0a0a 100%);
}
.quote-inner {
  position: relative;
  z-index: 10;
  max-width: 700px;
  text-align: center;
}
.quote-mark {
  font-size: 5rem;
  color: var(--gold);
  opacity: 0.3;
  font-family: Georgia, serif;
  line-height: 1;
  margin-bottom: 1rem;
}
.quote-text {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: clamp(2rem, 6vw, 3.5rem);
  color: var(--paper);
  letter-spacing: 0.2em;
  line-height: 1.8;
  margin-bottom: 2.5rem;
  font-style: normal;
}
.quote-meta {
  border-top: 1px solid rgba(201,169,97,0.2);
  padding-top: 2rem;
}
.quote-source {
  font-family: 'Cinzel', serif;
  font-size: 0.85rem;
  color: var(--gold);
  letter-spacing: 0.3em;
  display: block;
  margin-bottom: 1rem;
}
.quote-ctx {
  font-family: 'Noto Serif SC', serif;
  font-size: 0.9rem;
  color: rgba(245,240,232,0.5);
  line-height: 2;
  letter-spacing: 0.05em;
}
</style>
