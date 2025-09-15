<template>
  <header id="Header">
    <!-- 背景可留 / 可移除 -->
    <div class="bg-arc"></div>

    <div class="bar">
      <div class="brand">
        <i class="el-icon-collection-tag icon"></i>
        <span class="brand-text">{{ $t("app.title") }}</span>
      </div>

      <div class="info">
        <span class="time">
          <i class="el-icon-time"></i>
          9:00-18:00
        </span>
        <el-select
          v-model="lang"
          size="mini"
          class="lang-select"
          @change="changeLang"
          popper-class="lang-popper"
        >
          <el-option label="中文" value="zh" />
          <el-option label="English" value="en" />
        </el-select>
      </div>
    </div>

    <!-- 居中放大的标题 -->
    <div class="hero">
      <h1 class="hero-title">
        {{ $t("app.title") }}
      </h1>
      <p class="hero-sub" v-if="subtitle">
        {{ subtitle }}
      </p>
    </div>
  </header>
</template>

<script>
import { getLocale, setLocale } from "@/i18n";
export default {
  name: "Header",
  data() {
    return {
      lang: getLocale(),
      subtitle: "", // 可加副标题 key
    };
  },
  methods: {
    changeLang(v) {
      setLocale(v);
    },
  },
};
</script>

<style scoped>
/* 布局 */
#Header {
  position: relative;
  width: 100%;
  padding: 14px 40px 42px;
  box-sizing: border-box;
  overflow: hidden;
}

/* 背景柔和弧形 */
.bg-arc {
  position: absolute;
  inset: 0;
  background: radial-gradient(
      at 20% 25%,
      rgba(10, 132, 255, 0.25),
      rgba(10, 132, 255, 0) 55%
    ),
    radial-gradient(
      at 85% 70%,
      rgba(52, 199, 89, 0.28),
      rgba(52, 199, 89, 0) 60%
    ),
    linear-gradient(180deg, #f1f9ff 0%, #ffffff 60%);
  -webkit-mask: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.9),
    rgba(0, 0, 0, 0)
  );
  mask: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0));
  pointer-events: none;
  z-index: 0;
}

/* 顶部条 */
.bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 6px 20px;
  backdrop-filter: saturate(160%) blur(14px);
  -webkit-backdrop-filter: saturate(160%) blur(14px);
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 18px;
  box-shadow: 0 6px 24px -8px rgba(0, 0, 0, 0.1);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 0.5px;
  color: #0a84ff;
}

.brand .icon {
  font-size: 22px;
  color: #0a84ff;
}

.info {
  display: flex;
  align-items: center;
  gap: 22px;
  font-size: 14px;
  color: #46515f;
}

.time i {
  margin-right: 4px;
  font-size: 16px;
  color: #0a84ff;
}

/* 中心主标题块 */
.hero {
  position: relative;
  z-index: 1;
  margin-top: 34px;
  text-align: center;
  padding: 8px 16px 12px;
}

.hero-title {
  margin: 0;
  font-size: clamp(34px, 5.2vw, 56px);
  line-height: 1.08;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: linear-gradient(100deg, #0a84ff 0%, #0a6dff 45%, #005ac8 100%);
  -webkit-background-clip: text;
  color: transparent;
  filter: drop-shadow(0 4px 14px rgba(10, 132, 255, 0.25));
}

.hero-sub {
  margin: 10px 0 0;
  font-size: 15px;
  color: #51606f;
  letter-spacing: 0.5px;
}

/* 语言选择器 */
.lang-select ::v-deep .el-input__inner {
  border-radius: 999px;
  padding: 0 14px;
  height: 32px;
  line-height: 32px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: background 0.2s, border-color 0.2s;
}
.lang-select ::v-deep .el-input__inner:hover {
  background: #ffffff;
}

/* 响应式 */
@media (max-width: 900px) {
  #Header {
    padding: 12px 18px 40px;
  }
  .bar {
    flex-wrap: wrap;
    gap: 14px;
  }
  .hero-title {
    font-size: clamp(32px, 9vw, 50px);
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .bg-arc {
    background: radial-gradient(
        at 18% 25%,
        rgba(10, 132, 255, 0.35),
        rgba(10, 132, 255, 0) 55%
      ),
      radial-gradient(
        at 85% 70%,
        rgba(52, 199, 89, 0.35),
        rgba(52, 199, 89, 0) 60%
      ),
      linear-gradient(180deg, #1c2530 0%, #11181f 60%);
  }
  .bar {
    background: rgba(30, 40, 52, 0.55);
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 6px 28px -10px rgba(0, 0, 0, 0.6);
  }
  .info {
    color: #b7c3d1;
  }
  .hero-sub {
    color: #8fa2b4;
  }
  .lang-select ::v-deep .el-input__inner {
    background: rgba(55, 65, 78, 0.55);
    color: #e6f1ff;
    border-color: rgba(255, 255, 255, 0.15);
  }
}
</style>