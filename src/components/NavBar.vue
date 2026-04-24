<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="nav-container">
      <a href="#hero" class="nav-logo">
        <span class="logo-text">宫</span>
        <span class="logo-sub">· 中国古代建筑</span>
      </a>
      <ul class="nav-links">
        <li v-for="section in sections" :key="section.id">
          <a :href="`#${section.id}`" :class="{ active: activeSection === section.id }">
            {{ section.label }}
          </a>
        </li>
      </ul>
      <button class="nav-toggle" @click="toggleMenu" :class="{ open: menuOpen }">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  sections: {
    type: Array,
    default: () => []
  }
})

const isScrolled = ref(false)
const activeSection = ref('hero')
const menuOpen = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 80
  const sections = document.querySelectorAll('section[id], div[id]')
  sections.forEach(section => {
    const top = section.offsetTop - 200
    if (window.scrollY >= top) {
      activeSection.value = section.id
    }
  })
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  menuOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1.2rem 3rem;
  transition: all 0.4s ease;
  background: transparent;
}
.navbar.scrolled {
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(20px);
  padding: 0.8rem 3rem;
  box-shadow: 0 2px 30px rgba(0,0,0,0.3);
}
.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav-logo {
  text-decoration: none;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
.logo-text {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 2rem;
  color: var(--gold);
  letter-spacing: 0.1em;
  line-height: 1;
}
.logo-sub {
  font-family: 'Noto Serif SC', serif;
  font-size: 0.8rem;
  color: rgba(245,240,232,0.6);
  letter-spacing: 0.2em;
}
.nav-links {
  list-style: none;
  display: flex;
  gap: 2.5rem;
}
.nav-links a {
  text-decoration: none;
  font-family: 'Noto Serif SC', serif;
  font-size: 0.9rem;
  color: rgba(245,240,232,0.7);
  letter-spacing: 0.15em;
  position: relative;
  transition: color 0.3s;
  padding-bottom: 0.3rem;
}
.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--gold);
  transition: width 0.3s;
}
.nav-links a:hover,
.nav-links a.active {
  color: var(--gold);
}
.nav-links a:hover::after,
.nav-links a.active::after {
  width: 100%;
}
.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}
.nav-toggle span {
  width: 25px;
  height: 2px;
  background: var(--paper);
  transition: all 0.3s;
  display: block;
}
@media (max-width: 768px) {
  .navbar { padding: 1rem 1.5rem; }
  .nav-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(26,26,26,0.98);
    flex-direction: column;
    padding: 2rem;
    gap: 1.5rem;
    text-align: center;
  }
  .nav-links.open { display: flex; }
  .nav-toggle { display: flex; }
  .nav-toggle.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
  .nav-toggle.open span:nth-child(2) { opacity: 0; }
  .nav-toggle.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
}
</style>
