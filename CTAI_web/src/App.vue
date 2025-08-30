<template>
  <div id="app">
    <div class="hero-bg"></div>
    <app-header></app-header>
    <app-content></app-content>
    <app-footer></app-footer>
  </div>
</template>

<script>
import Header from "./components/Header";
import Footer from "./components/Footer";
import Content from "./components/Content";
export default {
  name: "肌少症诊断系统",
  data() {
    return {};
  },
  components: {
    "app-header": Header,
    "app-footer": Footer,
    "app-content": Content,
  },
  methods: {},
};
</script>

<style scope="this api replaced by slot-scope in 2.5.0+">
body {
  background: #f6fafd;
  margin: 0;
  padding: 0;
  min-height: 100vh;
}
#app {
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

/* 顶部大背景图 */
.hero-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh; /* 填满整个页面 */
  background: url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80&sat=100&exp=10")
    center center/cover no-repeat;
  z-index: 0;
  filter: brightness(0.97) blur(1px);
  pointer-events: none;
}

/* 让内容区悬浮在背景图上 */
#app > *:not(.hero-bg) {
  position: relative;
  z-index: 1;
}

.header,
.top-title {
  color: #222;
  text-shadow: 0 2px 6px #fff8;
}
</style>
