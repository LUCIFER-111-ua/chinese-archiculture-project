<template>
  <footer class="footer">
    <div class="footer-pattern"></div>
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-logo">宫</div>
          <p class="footer-tagline">弘扬中华优秀自然科学文明和优秀文化传承</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4>主题板块</h4>
            <ul>
              <li><a href="#buildings">经典建筑</a></li>
              <li><a href="#timeline">历史脉络</a></li>
              <li><a href="#components">建筑构件</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4>建筑类型</h4>
            <ul>
              <li><a href="#buildings">宫殿建筑</a></li>
              <li><a href="#buildings">祭祀建筑</a></li>
              <li><a href="#buildings">塔寺建筑</a></li>
              <li><a href="#buildings">桥梁建筑</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4>技术亮点</h4>
            <ul>
              <li><a href="#">Three.js 3D 渲染</a></li>
              <li><a href="#">Vue 3 组件化</a></li>
              <li><a href="#">Vite 构建工具</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-bottom">
        <p class="copyright">© 2026 中国古代建筑文化 · Vue + Three.js 数字展示</p>
        <p class="footer-quote">「千年之屋，皆匠心所筑；万世之作，皆文化所托。」</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #0d0d0d;
  color: var(--paper);
  padding: 6rem 0 2rem;
  position: relative;
  overflow: hidden;
}
.footer-pattern {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 10% 80%, rgba(192,57,43,0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 90% 20%, rgba(201,169,97,0.04) 0%, transparent 50%);
  pointer-events: none;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 3rem;
  position: relative;
  z-index: 10;
}
.footer-top {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  margin-bottom: 4rem;
}
.footer-brand {}
.footer-logo {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 3.5rem;
  color: var(--gold);
  letter-spacing: 0.1em;
  line-height: 1;
  margin-bottom: 1rem;
}
.footer-tagline {
  font-family: 'Noto Serif SC', serif;
  font-size: 0.8rem;
  color: rgba(245,240,232,0.4);
  letter-spacing: 0.15em;
  line-height: 1.8;
  max-width: 220px;
}
.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
.link-group h4 {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 0.9rem;
  color: var(--gold);
  letter-spacing: 0.2em;
  margin-bottom: 1.2rem;
}
.link-group ul { list-style: none; }
.link-group li { margin-bottom: 0.6rem; }
.link-group a {
  text-decoration: none;
  font-size: 0.82rem;
  color: rgba(245,240,232,0.5);
  letter-spacing: 0.08em;
  transition: color 0.3s;
}
.link-group a:hover { color: var(--gold); }
.footer-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201,169,97,0.2), transparent);
  margin-bottom: 2rem;
}
.footer-bottom {
  text-align: center;
}
.copyright {
  font-size: 0.78rem;
  color: rgba(245,240,232,0.3);
  letter-spacing: 0.1em;
  margin-bottom: 0.8rem;
}
.footer-quote {
  font-family: 'ZCOOL XiaoWei', serif;
  font-size: 0.85rem;
  color: rgba(201,169,97,0.3);
  letter-spacing: 0.2em;
}
@media (max-width: 768px) {
  .container { padding: 0 1.5rem; }
  .footer-top { grid-template-columns: 1fr; gap: 2rem; }
  .footer-links { grid-template-columns: repeat(2, 1fr); }
}
</style>
