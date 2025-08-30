<template>
  <div id="Content">
    <!-- 左侧步骤栏 -->
    <aside class="flow-aside">
      <el-steps
        direction="vertical"
        :active="currentStep"
        finish-status="success"
      >
        <el-step title="步骤 1 上传图像">
          <template #description>
            <el-button
              type="primary"
              size="mini"
              :loading="uploading"
              @click="triggerUpload"
              >选择文件</el-button
            >
            <input
              ref="fileInput"
              type="file"
              multiple
              style="display: none"
              @change="handleUpload"
            />
            <p v-if="uploadedFiles.length" class="hint">
              已选 {{ uploadedFiles.length }} 个
            </p>
          </template>
        </el-step>
        <el-step title="步骤 2 选择L3切片" :disabled="currentStep < 2">
          <template #description>
            <p v-if="currentStep === 1" class="muted">等待上传完成</p>
            <p v-else>候选 {{ l3Candidates.length }} 张</p>
          </template>
        </el-step>
        <el-step title="步骤 3 面积计算" :disabled="currentStep < 3">
          <template #description>
            <p v-if="currentStep < 3" class="muted">等待选择</p>
            <p v-else>计算完成后显示结果</p>
          </template>
        </el-step>
      </el-steps>
    </aside>

    <!-- 右侧主区 -->
    <section class="flow-main">
      <!-- Step 1 -->
      <div v-if="currentStep === 1" class="panel">
        <div class="upload-box" @click="triggerUpload">
          <i class="el-icon-upload"></i>
          <h3>上传CT扫描图像</h3>
          <p>支持多文件 (DICOM / PNG)</p>
          <el-button type="primary" :loading="uploading">选择或拖拽</el-button>
        </div>
      </div>

      <!-- Step 2 -->
      <div v-else-if="currentStep === 2" class="panel">
        <div class="panel-header">
          <h3>L3候选切片 ({{ l3Candidates.length }})</h3>
          <div>
            <el-button size="mini" @click="backToUpload"
              >返回重新上传</el-button
            >
            <el-button
              type="primary"
              size="mini"
              :disabled="selectedIdx === -1"
              @click="goCalc"
              >确认并计算</el-button
            >
          </div>
        </div>
        <el-empty v-if="loadingL3" description="识别中..." />
        <div v-else class="grid">
          <div
            v-for="(img, i) in l3Candidates"
            :key="img.id || i"
            class="grid-item"
            :class="{ active: selectedIdx === i }"
            @click="selectCandidate(i)"
          >
            <el-image :src="img.url" fit="cover" lazy></el-image>
            <div class="meta">
              <span>切片 {{ i + 1 }}</span>
              <span class="conf">置信度 {{ img.confidence || "--" }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3 -->
      <div v-else-if="currentStep === 3" class="panel">
        <div class="panel-header">
          <h3>面积计算结果</h3>
          <div>
            <el-button size="mini" @click="backToSelect">返回选择</el-button>
          </div>
        </div>
        <div class="result-layout" v-loading="calculating">
          <div class="result-images">
            <h4>原始切片</h4>
            <el-image
              :src="selectedImage.originalUrl"
              fit="contain"
              class="result-img"
            />
            <h4>分割结果</h4>
            <el-image
              :src="selectedImage.segmentedUrl"
              fit="contain"
              class="result-img"
            />
          </div>
          <div class="result-metrics">
            <h4>指标</h4>
            <el-table
              :data="areaMetrics"
              size="small"
              stripe
              style="width: 100%"
            >
              <el-table-column prop="metric" label="名称" width="160" />
              <el-table-column prop="value" label="数值" />
              <el-table-column prop="unit" label="单位" width="80" />
            </el-table>
            <div class="diagnosis" v-if="diagnosis.title">
              <el-alert
                :title="diagnosis.title"
                :type="diagnosis.type"
                :description="diagnosis.description"
                show-icon
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 兜底 -->
      <el-empty v-else description="无内容" />
    </section>
  </div>
</template>

// <script>
// import axios from "axios";
// export default {
//   name: "Content",
//   data() {
//     return {
//       server_url: "http://127.0.0.1:5003",
//       currentStep: 1,
//       uploading: false,
//       uploadedFiles: [],
//       l3Candidates: [],
//       loadingL3: false,
//       selectedIdx: -1,
//       calculating: false,
//       selectedImage: {},
//       areaMetrics: [],
//       diagnosis: {},
//     };
//   },
//   methods: {
//     triggerUpload() {
//       this.$refs.fileInput.click();
//     },
//     async handleUpload(e) {
//       const files = Array.from(e.target.files || []);
//       if (!files.length) return;
//       this.uploading = true;
//       try {
//         const formData = new FormData();
//         files.forEach((f) => formData.append("files", f));
//         const res = await axios.post(
//           this.server_url + "/upload-batch",
//           formData
//         );
//         this.uploadedFiles = res.data.files || [];
//         this.currentStep = 2;
//         this.fetchL3();
//       } catch (err) {
//         this.$message.error("上传失败");
//       } finally {
//         this.uploading = false;
//       }
//     },
//     async fetchL3() {
//       this.loadingL3 = true;
//       this.l3Candidates = [];
//       this.selectedIdx = -1;
//       try {
//         const ids = this.uploadedFiles.map((f) => f.id);
//         const res = await axios.post(this.server_url + "/identify-l3", {
//           fileIds: ids,
//         });
//         this.l3Candidates = res.data.l3_slices || [];
//         this.$message.success("L3识别完成");
//       } catch (e) {
//         this.$message.error("L3识别失败");
//       } finally {
//         this.loadingL3 = false;
//       }
//     },
//     selectCandidate(i) {
//       this.selectedIdx = i;
//     },
//     backToUpload() {
//       this.currentStep = 1;
//       this.uploadedFiles = [];
//       this.l3Candidates = [];
//       this.selectedIdx = -1;
//     },
//     backToSelect() {
//       this.currentStep = 2;
//       this.areaMetrics = [];
//       this.diagnosis = {};
//     },
//     async goCalc() {
//       if (this.selectedIdx === -1) return;
//       this.currentStep = 3;
//       this.calculating = true;
//       try {
//         const sel = this.l3Candidates[this.selectedIdx];
//         const res = await axios.post(this.server_url + "/calculate-area", {
//           imageId: sel.id,
//         });
//         this.selectedImage = {
//           originalUrl: sel.url,
//           segmentedUrl: res.data.segmented_image_url,
//         };
//         this.areaMetrics = res.data.metrics || [];
//         this.diagnosis = res.data.diagnosis || {};
//         this.$message.success("计算完成");
//       } catch (e) {
//         this.$message.error("计算失败");
//       } finally {
//         this.calculating = false;
//       }
//     },
//   },
// };
//
</script>

// ...existing code...
<script>
// import axios from "axios"; // 仍为演示模式
export default {
  name: "Content",
  data() {
    return {
      currentStep: 1,
      uploading: false,
      uploadedFiles: [],
      l3Candidates: [],
      loadingL3: false,
      selectedIdx: -1,
      calculating: false,
      selectedImage: {},
      areaMetrics: [],
      diagnosis: {},
    };
  },
  methods: {
    triggerUpload() {
      this.$refs.fileInput && this.$refs.fileInput.click();
    },
    // 演示上传
    handleUpload(e) {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      this.uploading = true;
      setTimeout(() => {
        this.uploadedFiles = files.map((f, i) => ({
          id: "fake_" + i,
          name: f.name,
        }));
        this.currentStep = 2;
        this.uploading = false;
        this.clearFileInput(); // 关键：清空，确保后面还能重新选同一文件
        this.fetchL3();
      }, 400);
    },
    clearFileInput() {
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
    },
    fetchL3() {
      this.loadingL3 = true;
      this.l3Candidates = [];
      this.selectedIdx = -1;
      setTimeout(() => {
        const placeholder =
          "https://via.placeholder.com/240x160.png?text=L3+Slice";
        this.l3Candidates = Array.from({ length: 6 }).map((_, i) => ({
          id: "l3_" + i,
          url: placeholder + "+" + (i + 1),
          confidence: (90 - i * 3).toFixed(1),
        }));
        this.loadingL3 = false;
      }, 600);
    },
    selectCandidate(i) {
      this.selectedIdx = i;
    },
    backToUpload() {
      this.currentStep = 1;
      this.uploadedFiles = [];
      this.l3Candidates = [];
      this.selectedIdx = -1;
      this.areaMetrics = [];
      this.diagnosis = {};
      this.selectedImage = {};
      this.clearFileInput(); // 返回时也清空
    },
    backToSelect() {
      this.currentStep = 2;
      this.areaMetrics = [];
      this.diagnosis = {};
    },
    goCalc() {
      if (this.selectedIdx === -1) return;
      this.currentStep = 3;
      this.calculating = true;
      setTimeout(() => {
        const sel = this.l3Candidates[this.selectedIdx];
        this.selectedImage = {
          originalUrl: sel.url,
          segmentedUrl:
            "https://via.placeholder.com/240x160.png?text=Segmented",
        };
        this.areaMetrics = [
          { metric: "CSA", value: "132.4", unit: "cm²" },
          { metric: "SMA", value: "118.7", unit: "cm²" },
          { metric: "脂肪渗透率", value: "12.5", unit: "%" },
          { metric: "密度(HU)", value: "48.3", unit: "HU" },
        ];
        this.diagnosis = {
          title: "评估结果：正常范围",
          type: "success",
          description: "横截面积与密度处于参考区间，无明显异常。",
        };
        this.calculating = false;
      }, 800);
    },
  },
};
</script>
// ...existing code...

<style scoped>
#Content {
  width: 88%;
  max-width: 1400px;
  margin: 32px auto 80px;
  display: flex;
  gap: 48px;
  align-items: flex-start;
}
.flow-aside {
  width: 300px;
  background: #f8fafc;
  padding: 28px 20px 12px;
  border-radius: 18px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 24px;
  height: fit-content;
}
.flow-main {
  flex: 1;
  min-height: 560px;
}
.panel {
  background: #fff;
  border-radius: 18px;
  padding: 28px 32px 40px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
}
.upload-box {
  border: 2px dashed #b9e6ea;
  border-radius: 16px;
  text-align: center;
  padding: 90px 40px;
  cursor: pointer;
  transition: border-color 0.25s, background 0.25s;
  background: #fafdfe;
}
.upload-box:hover {
  border-color: #21b3b9;
  background: #f2fbfc;
}
.upload-box i {
  font-size: 48px;
  color: #21b3b9;
  margin-bottom: 12px;
  display: block;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 18px;
}
.grid-item {
  position: relative;
  border: 2px solid transparent;
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
}
.grid-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}
.grid-item.active {
  border-color: #21b3b9;
  box-shadow: 0 0 0 3px rgba(33, 179, 185, 0.25);
}
.grid-item .el-image {
  width: 100%;
  height: 140px;
  display: block;
}
.meta {
  padding: 6px 10px 10px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #3b5560;
}
.meta .conf {
  color: #21b3b9;
  font-weight: 500;
}
.result-layout {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}
.result-images,
.result-metrics {
  background: #f9fcfd;
  border-radius: 16px;
  padding: 20px 24px 28px;
  flex: 1 1 420px;
  min-width: 380px;
}
.result-images h4,
.result-metrics h4 {
  margin: 0 0 12px;
}
.result-img {
  width: 100%;
  height: 280px;
  border-radius: 12px;
  background: #fff;
  margin-bottom: 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
.hint {
  margin-top: 6px;
  font-size: 12px;
  color: #21b3b9;
}
.muted {
  font-size: 12px;
  color: #98a6ad;
}
.diagnosis {
  margin-top: 20px;
}
</style>


// ...existing code...
<style>
:root {
  --accent: #0a84ff; /* System Blue */
  --accent-press: #0067d1;
  --bg-1: #f7f9fc;
  --bg-2: #eef2f6;
  --text: #0b1a2b;
  --glass: rgba(255, 255, 255, 0.6);
  --glass-border: rgba(255, 255, 255, 0.38);
  --radius-lg: 18px;
  --radius-md: 14px;
}
html,
body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "Helvetica Neue", Arial, "PingFang SC", "Noto Sans SC", "Microsoft YaHei",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text);
}
body {
  background: radial-gradient(
      1200px 420px at 50% -260px,
      rgba(10, 132, 255, 0.18) 0%,
      transparent 60%
    ),
    linear-gradient(180deg, var(--bg-1) 0%, var(--bg-2) 100%);
  margin: 0;
  min-height: 100vh;
}
#app {
  min-height: 100vh;
}

/* 胶囊主按钮（ElementUI） */
.el-button--primary {
  background: var(--accent);
  border-color: transparent;
  color: #fff;
  border-radius: 999px;
  padding: 10px 18px;
  box-shadow: 0 6px 16px rgba(10, 132, 255, 0.25);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.2s ease;
}
.el-button--primary:hover {
  box-shadow: 0 10px 24px rgba(10, 132, 255, 0.35);
}
.el-button--primary:active {
  background: var(--accent-press);
  transform: translateY(1px) scale(0.99);
}

/* Steps 主色同步 */
.el-steps .el-step__head.is-process,
.el-steps .el-step__head.is-success {
  border-color: var(--accent);
  color: var(--accent);
}
.el-steps .el-step__line {
  background: rgba(10, 132, 255, 0.15);
}
.el-steps .el-step__line-inner {
  background: var(--accent) !important;
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-1: #0f1220;
    --bg-2: #0a0d19;
    --text: #e8ebf0;
    --glass: rgba(22, 24, 32, 0.55);
    --glass-border: rgba(255, 255, 255, 0.14);
  }
  body {
    background: radial-gradient(
        1200px 420px at 50% -260px,
        rgba(10, 132, 255, 0.22) 0%,
        transparent 60%
      ),
      linear-gradient(180deg, var(--bg-1) 0%, var(--bg-2) 100%);
  }
}
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>

// ...existing code...
<style scoped>
#Content {
  width: clamp(960px, 86vw, 1140px);
  margin: 32px auto 80px;
  display: flex;
  gap: 48px;
  align-items: flex-start;
}

/* 玻璃化侧栏与卡片 */
.flow-aside,
.panel,
.result-images,
.result-metrics {
  background: var(--glass);
  -webkit-backdrop-filter: saturate(180%) blur(18px);
  backdrop-filter: saturate(180%) blur(18px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 26px rgba(16, 38, 73, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.6) inset;
}
.flow-aside {
  width: 300px;
  padding: 28px 20px 12px;
  position: sticky;
  top: 24px;
  height: fit-content;
}
.panel {
  padding: 28px 32px 40px;
}

/* 上传框：更轻的胶囊风 */
.upload-box {
  border: 1.5px dashed rgba(10, 132, 255, 0.35);
  background: rgba(255, 255, 255, 0.55);
  border-radius: 16px;
  text-align: center;
  padding: 90px 40px;
  cursor: pointer;
  transition: border-color 0.25s, background 0.25s, transform 0.2s;
}
.upload-box:hover {
  border-color: var(--accent);
  background: rgba(255, 255, 255, 0.7);
  transform: translateY(-2px);
}
.upload-box i {
  font-size: 48px;
  color: var(--accent);
  margin-bottom: 12px;
  display: block;
}

/* 网格卡片微动效 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 18px;
}
.grid-item {
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.65);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
}
.grid-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.1);
}
.grid-item.active {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.22);
}
.grid-item .el-image {
  width: 100%;
  height: 140px;
  display: block;
}

/* 结果区图片与表格 */
.result-layout {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}
.result-img {
  width: 100%;
  height: 280px;
  border-radius: 12px;
  background: #fff;
  margin-bottom: 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
.result-metrics .el-table {
  background: transparent;
}
.result-metrics .el-table th,
.result-metrics .el-table td {
  background: transparent;
}

/* 微文案颜色 */
.hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--accent);
}
.muted {
  font-size: 12px;
  color: #98a6ad;
}

/* 标题行 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
</style>

// ...existing code...
<style scoped>
#Footer {
  width: clamp(960px, 86vw, 1140px);
  margin: 24px auto 60px;
  height: 72px;
  background: var(--glass);
  -webkit-backdrop-filter: saturate(180%) blur(18px);
  backdrop-filter: saturate(180%) blur(18px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
p {
  color: var(--text);
  margin: 0;
  opacity: 0.9;
}
</style>