<template>
  <div class="detail">
    <div class="head">
      <!-- 新增：返回上一页/返回列表 -->
      <el-button class="back" icon="el-icon-arrow-left" @click="goBack"
        >返回</el-button
      >
      <h2 class="title">{{ patient }} · {{ date }}</h2>
      <!-- <el-button type="text" @click="goList">返回列表</el-button> -->
    </div>

    <!-- 关键指标（精简） -->
    <section class="card" v-loading="loading">
      <div class="card-title">关键指标（HU 与面积）</div>

      <!-- 汇总（按行求平均） -->
      <div v-if="summary" class="summary">
        <div class="pill">
          <span class="k">Psoas HU(mean)</span>
          <span class="v">{{ fmt(summary.psoas_hu_mean) }}</span>
        </div>
        <div class="pill">
          <span class="k">Psoas 面积(mm²)</span>
          <span class="v">{{ fmt(summary.psoas_area_mm2) }}</span>
        </div>
        <div class="pill">
          <span class="k">Combo HU(mean)</span>
          <span class="v">{{ fmt(summary.combo_hu_mean) }}</span>
        </div>
        <div class="pill">
          <span class="k">Combo 面积(mm²)</span>
          <span class="v">{{ fmt(summary.combo_area_mm2) }}</span>
        </div>
      </div>

      <!-- 明细（仅保留关键列） -->
      <el-table
        v-if="rows.length"
        :data="rows"
        border
        size="small"
        style="width: 100%; margin-top: 10px"
      >
        <el-table-column prop="filename" label="切片" width="160" />
        <el-table-column
          prop="psoas_hu_mean"
          label="Psoas HU(mean)"
          :formatter="fmtCell"
        />
        <el-table-column
          prop="psoas_area_mm2"
          label="Psoas 面积(mm²)"
          :formatter="fmtCell"
        />
        <el-table-column
          prop="combo_hu_mean"
          label="Combo HU(mean)"
          :formatter="fmtCell"
        />
        <el-table-column
          prop="combo_area_mm2"
          label="Combo 面积(mm²)"
          :formatter="fmtCell"
        />
      </el-table>

      <el-empty v-else description="未解析到关键指标" />
    </section>

    <!-- 图片网格 -->
    <section class="card">
      <div class="card-title">关键图片（middle）</div>
      <div class="img-grid">
        <div v-for="img in middle_images" :key="img" class="img-item">
          <el-image
            :src="imageUrl(img)"
            fit="cover"
            :preview-src-list="previewList"
          />
          <div class="caption">{{ img }}</div>
        </div>
      </div>
    </section>

    <!-- L3 操作区，移到关键图片下方 -->
    <!-- L3 操作区（更新：使用手动标注弹窗） -->
    <section class="card" style="margin-bottom: 18px">
      <div class="card-title">L3 操作</div>
      <el-button type="primary" :loading="l3Detecting" @click="handleL3Detect"
        >检测 L3</el-button
      >

      <el-button style="margin-left: 12px" @click="openMaskEditor"
        >手动标注 L3 mask</el-button
      >

      <el-button
        type="success"
        :loading="l3Continuing"
        style="margin-left: 12px"
        @click="handleContinueAfterL3"
        >继续后续流程</el-button
      >

      <div v-if="l3ImageUrl" style="margin-top: 12px">
        <img :src="l3ImageUrl" style="max-width: 300px" />
        <div style="font-size: 12px; color: #888">L3 结果预览</div>
      </div>
    </section>

    <l3-mask-editor
      :patient="patient"
      :date="date"
      :visible.sync="maskEditorVisible"
      @uploaded="onMaskUploaded"
    />
  </div>
</template>

<script>
import {
  getKeyResults,
  getImageUrl,
  l3Detect,
  uploadL3Mask,
  continueAfterL3,
  getL3ImageUrl,
} from "@/api";
import L3MaskEditor from "./L3MaskEditor.vue";

export default {
  name: "ResultDetail",
  components: { L3MaskEditor },
  data() {
    return {
      loading: true,
      csv_files: {},
      middle_images: [],
      rows: [],
      summary: null,
      previewList: [],
      l3Detecting: false,
      l3Continuing: false,
      l3ImageUrl: "",
      maskEditorVisible: false,
    };
  },
  computed: {
    patient() {
      return this.$route.params.patient;
    },
    date() {
      return this.$route.params.date;
    },
  },
  async created() {
    await this.fetchResults();
  },
  methods: {
    async fetchResults() {
      this.loading = true;
      try {
        const res = await getKeyResults(this.patient, this.date);
        const data = (res && res.data) || {};
        this.csv_files = data.csv_files || {};
        this.middle_images = data.middle_images || [];

        this.previewList = this.middle_images.map((n) => this.imageUrl(n));

        const keys = Object.keys(this.csv_files || {});
        const csvName = keys.find((n) => /middle[_-]?only/i.test(n)) || keys[0];

        if (csvName) {
          this.rows = this.extractKeyRows(this.csv_files[csvName]);
          this.summary = this.makeSummary(this.rows);
        } else {
          this.rows = [];
          this.summary = null;
        }
      } catch (e) {
        this.$message.error("获取结果失败");
      } finally {
        this.loading = false;
      }
    },
    openMaskEditor() {
      this.maskEditorVisible = true;
    },
    onMaskUploaded(payload) {
      if (payload && payload.overlay) {
        this.setL3Overlay(payload.overlay); // 统一刷新
      } else {
        this.$message.success("Mask 已上传，点击『继续后续流程』生成后续结果");
        this.loadL3Image(); // 默认文件名也强制刷新
      }
    },
    // 解析 CSV，并仅保留关键字段
    extractKeyRows(csvText) {
      if (!csvText) return [];
      const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) return [];

      const headers = lines[0].split(",").map((h) => h.trim());
      const idx = (name) =>
        headers.findIndex((h) => h.toLowerCase() === name.toLowerCase());

      // 关键列名（与后端 CSV 保持一致）
      const keyCols = {
        filename: "filename",
        psoas_hu_mean: "psoas_hu_mean",
        psoas_area_mm2: "psoas_area_mm2",
        combo_hu_mean: "combo_hu_mean",
        combo_area_mm2: "combo_area_mm2",
      };

      // 找列索引
      const col = {};
      for (const k in keyCols) col[k] = idx(keyCols[k]);

      return lines
        .slice(1)
        .map((line) => {
          const cells = line.split(",").map((c) => c.trim());
          const get = (i) => (i >= 0 && i < cells.length ? cells[i] : "");
          const num = (v) => (v === "" ? null : Number(v));
          return {
            filename: get(col.filename),
            psoas_hu_mean: num(get(col.psoas_hu_mean)),
            psoas_area_mm2: num(get(col.psoas_area_mm2)),
            combo_hu_mean: num(get(col.combo_hu_mean)),
            combo_area_mm2: num(get(col.combo_area_mm2)),
          };
        })
        .filter((r) => r.filename);
    },
    makeSummary(rows) {
      if (!rows.length) return null;
      const keys = [
        "psoas_hu_mean",
        "psoas_area_mm2",
        "combo_hu_mean",
        "combo_area_mm2",
      ];
      const s = {};
      for (const k of keys) {
        const vals = rows
          .map((r) => r[k])
          .filter((v) => typeof v === "number" && !Number.isNaN(v));
        s[k] = vals.length
          ? vals.reduce((a, b) => a + b, 0) / vals.length
          : null;
      }
      return s;
    },
    imageUrl(filename) {
      return getImageUrl(this.patient, this.date, filename);
    },
    fmt(n) {
      return n == null || Number.isNaN(n) ? "-" : Number(n).toFixed(2);
    },
    fmtCell(row, col, cellValue) {
      return this.fmt(cellValue);
    },
    goBack() {
      if (window.history.length > 1) this.$router.back();
      else this.$router.push("/results");
    },
    goList() {
      if (this.$route.path !== "/results") this.$router.push("/results");
    },

    async handleL3Detect() {
      this.l3Detecting = true;
      try {
        const res = await l3Detect(this.patient, this.date);
        this.$message.success("L3 检测完成");
        if (res && res.data && res.data.l3_overlay) {
          this.setL3Overlay(res.data.l3_overlay); // 强制刷新
        } else {
          this.loadL3Image();
        }
      } catch (e) {
        this.$message.error("L3 检测失败");
      } finally {
        this.l3Detecting = false;
      }
    },
    beforeMaskUpload(file) {
      if (!file.name.endsWith(".png")) {
        this.$message.error("请上传 PNG 格式的 mask");
        return false;
      }
      return true;
    },
    async customMaskUpload({ file, onSuccess, onError }) {
      try {
        await uploadL3Mask(this.patient, this.date, file);
        this.$message.success("L3 mask 上传成功");
        this.loadL3Image();
        onSuccess();
      } catch (e) {
        this.$message.error("上传失败");
        onError(e);
      }
    },
    onMaskUploadSuccess() {
      // 已在 customMaskUpload 处理
    },
    async handleContinueAfterL3() {
      this.l3Continuing = true;
      try {
        const res = await continueAfterL3(this.patient, this.date);
        this.$message.success("后续流程已完成");
        if (res && res.data && res.data.l3_overlay) {
          this.setL3Overlay(res.data.l3_overlay);
        } else {
          // 若接口不返回 overlay，尝试加载默认文件
          this.loadL3Image();
        }
        await this.fetchResults();
      } catch (e) {
        this.$message.error("后续流程失败");
      } finally {
        this.l3Continuing = false;
      }
    },
    loadL3Image() {
      this.l3ImageUrl = this.versionedL3Url("L3_overlay", "L3_clean.png");
    },
    setL3Overlay(relPath) {
      if (!relPath) return;
      const parts = relPath.split("/");
      const folder = parts.shift();
      const filename = parts.join("/") || "L3_clean.png";
      this.l3ImageUrl = this.versionedL3Url(folder, filename);
    },
    versionedL3Url(folder, filename) {
      const base = getL3ImageUrl(this.patient, this.date, folder, filename);
      return `${base}?t=${Date.now()}`;
    },
  },
};
</script>

<style scoped>
.detail {
  width: clamp(960px, 86vw, 1140px);
  margin: 24px auto 80px;
}

.title {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a; /* 深色文字 */
  font-weight: 800;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}
.head {
  margin-bottom: 12px;
}
.card {
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px 18px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  margin-bottom: 18px;
  color: #111827; /* 卡片内默认深色文字 */
}
.card-title {
  font-weight: 800;
  margin-bottom: 8px;
  color: #0f172a; /* 深色标题 */
}

.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px 12px;
}
.pill {
  background: #f6f9ff;
  border: 1px solid #e6eeff;
  border-radius: 999px;
  padding: 8px 14px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}
.pill .k {
  color: #5a6;
  opacity: 0.9;
}
.pill .v {
  font-weight: 700;
  color: #1f2;
}

.img-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
.img-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #f9fafb;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}
.img-item .el-image {
  width: 100%;
  height: 180px;
}
.caption {
  position: absolute;
  left: 8px;
  bottom: 8px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 999px;
}
</style>