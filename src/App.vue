<template>
  <div class="app">
    <!-- 导航栏 -->
    <NavBar :sections="navSections" />

    <!-- Hero 全屏 -->
    <HeroSection />

    <!-- 引言区 -->
    <QuoteSection />

    <!-- 经典建筑 -->
    <BuildingsSection />

    <!-- 历史脉络 -->
    <TimelineSection />

    <!-- 建筑构件 -->
    <ComponentsSection />

    <!-- 页脚 -->
    <FooterSection />
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import HeroSection from './components/HeroSection.vue'
import QuoteSection from './components/QuoteSection.vue'
import BuildingsSection from './components/BuildingsSection.vue'
import TimelineSection from './components/TimelineSection.vue'
import ComponentsSection from './components/ComponentsSection.vue'
import FooterSection from './components/FooterSection.vue'

const navSections = [
  { id: 'hero', label: '首页' },
  { id: 'buildings', label: '经典建筑' },
  { id: 'timeline', label: '历史脉络' },
  { id: 'components', label: '建筑构件' }
]
</script>

<style scoped>
.app {
  overflow-x: hidden;
}
</style>
