<template>
  <div id="Content">
    <!-- 左侧步骤栏 -->
    <aside class="flow-aside">
      <el-steps
        direction="vertical"
        :active="currentStep"
        finish-status="success"
      >
        <el-step title="步骤 1 上传 DICOM ZIP">
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
              accept=".zip"
              style="display: none"
              @change="handleFile"
            />
            <p v-if="fileName" class="hint">已选：{{ fileName }}</p>
          </template>
        </el-step>
        <el-step title="步骤 2 处理数据" :disabled="currentStep < 2">
          <template #description>
            <p v-if="currentStep === 1" class="muted">等待上传完成</p>
            <p v-else>点击“开始处理”调用后端推理</p>
          </template>
        </el-step>
        <el-step title="步骤 3 查看结果" :disabled="currentStep < 3">
          <template #description>
            <p v-if="currentStep < 3" class="muted">等待处理完成</p>
            <p v-else>进入结果详情或结果列表</p>
          </template>
        </el-step>
      </el-steps>
    </aside>

    <!-- 右侧主区 -->
    <section class="flow-main">
      <!-- Step 1: 上传 -->
      <div v-if="currentStep === 1" class="panel">
        <h3>上传 CT 扫描压缩包（ZIP）</h3>
        <el-form label-width="100px" :model="form">
          <el-form-item label="病人姓名">
            <el-input
              v-model="form.patient_name"
              placeholder="例如：张三"
              clearable
            />
          </el-form-item>
          <el-form-item label="检查日期">
            <el-input
              v-model="form.study_date"
              placeholder="例如：20230831"
              clearable
            />
          </el-form-item>
          <el-form-item label="ZIP 文件">
            <el-button @click="triggerUpload" :loading="uploading"
              >选择文件</el-button
            >
            <span v-if="fileName" style="margin-left: 8px">{{ fileName }}</span>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :disabled="!canUpload"
              :loading="uploading"
              @click="uploadZip"
            >
              上传
            </el-button>
            <el-button type="text" @click="goResultList"
              >查看已有结果</el-button
            >
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 2: 处理 -->
      <div v-else-if="currentStep === 2" class="panel">
        <div class="panel-header">
          <h3>处理数据</h3>
        </div>
        <el-alert
          title="将调用后端 /process 接口，对刚上传的数据进行处理"
          type="info"
          show-icon
          style="margin-bottom: 16px"
        />
        <el-button type="primary" :loading="processing" @click="processData">
          开始处理
        </el-button>
        <el-button type="text" style="margin-left: 8px" @click="backToUpload">
          返回上一步
        </el-button>
      </div>

      <!-- Step 3: 查看结果 -->
      <div v-else-if="currentStep === 3" class="panel">
        <div class="panel-header">
          <h3>处理完成</h3>
        </div>
        <el-result icon="success" title="已完成处理">
          <template #extra>
            <el-button type="primary" @click="goResultDetail"
              >查看本次结果</el-button
            >
            <el-button @click="goResultList" style="margin-left: 8px"
              >查看所有结果</el-button
            >
            <el-button
              type="text"
              style="margin-left: 8px"
              @click="backToProcess"
              >返回上一步</el-button
            >
          </template>
        </el-result>
      </div>

      <el-empty v-else description="无内容" />
    </section>
  </div>
</template>

<script>
import { uploadDicomZip, processCase } from "@/api";

function todayYMD() {
  const d = new Date();
  const pad = (n) => (n < 10 ? "0" + n : "" + n);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

export default {
  name: "Content",
  data() {
    return {
      currentStep: 1,
      uploading: false,
      processing: false,
      fileObj: null,
      fileName: "",
      form: {
        patient_name: "",
        study_date: todayYMD(),
      },
    };
  },
  computed: {
    canUpload() {
      return !!(this.form.patient_name && this.form.study_date && this.fileObj);
    },
  },
  methods: {
    triggerUpload() {
      this.$refs.fileInput && this.$refs.fileInput.click();
    },
    handleFile(e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      this.fileObj = f;
      this.fileName = f.name;
      // 允许重复选择同一文件
      this.$nextTick(() => (this.$refs.fileInput.value = ""));
    },
    async uploadZip() {
      if (!this.canUpload) return;
      this.uploading = true;
      try {
        await uploadDicomZip({
          patient_name: this.form.patient_name,
          study_date: this.form.study_date,
          file: this.fileObj,
        });
        this.$message.success("上传成功");
        this.currentStep = 2;
      } catch (e) {
        console.error(e);
        this.$message.error("上传失败");
      } finally {
        this.uploading = false;
      }
    },
    async processData() {
      this.processing = true;
      try {
        await processCase(this.form.patient_name, this.form.study_date);
        this.$message.success("处理完成");
        this.currentStep = 3;
      } catch (e) {
        console.error(e);
        this.$message.error("处理失败");
      } finally {
        this.processing = false;
      }
    },
    goResultDetail() {
      // 路由到结果详情页，注意中文参数在结果页里会再做编码调用 API
      this.$router.push(
        `/results/${this.form.patient_name}/${this.form.study_date}`
      );
    },
    goResultList() {
      this.$router.push("/results");
    },
    backToUpload() {
      this.currentStep = 1;
    },
  },
};
</script>


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
  color: #222; /* 深色 */
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