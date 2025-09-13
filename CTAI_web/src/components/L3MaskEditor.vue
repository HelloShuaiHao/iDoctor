<template>
  <el-dialog
    :visible.sync="innerVisible"
    append-to-body
    width="640px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    title="L3 Mask 标注"
    @closed="handleClosed"
  >
    <div
      ref="container"
      style="
        position: relative;
        width: 500px;
        height: 500px;
        border: 1px solid #999;
        background: #222;
        margin: 0 auto;
      "
    >
      <img
        :src="imageUrl"
        ref="img"
        style="
          position: absolute;
          left: 0;
          top: 0;
          width: 500px;
          height: 500px;
          pointer-events: none;
          opacity: 0.9;
        "
        @load="onImgLoad"
      />
      <canvas
        ref="canvas"
        width="500"
        height="500"
        style="
          position: absolute;
          left: 0;
          top: 0;
          z-index: 2;
          cursor: crosshair;
        "
        @mousedown="onDown"
        @mousemove="onMove"
        @mouseup="onUp"
        @mouseleave="onUp"
      ></canvas>
    </div>

    <div
      style="margin-top: 10px; font-size: 12px; color: #888; text-align: center"
    >
      拖动鼠标绘制矩形；多次可叠加；右下角按钮生成 mask。
    </div>

    <span
      slot="footer"
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <div>
        <el-button size="mini" @click="addTestRect">测试矩形</el-button>
        <el-button size="mini" @click="undo" :disabled="!rects.length"
          >撤销</el-button
        >
        <el-button size="mini" @click="clearRects" :disabled="!rects.length"
          >清空</el-button
        >
      </div>
      <div>
        <el-button size="mini" @click="close">取消</el-button>
        <el-button
          type="primary"
          size="mini"
          :disabled="!rects.length || saving"
          :loading="saving"
          @click="save"
        >
          保存上传
        </el-button>
      </div>
    </span>
  </el-dialog>
</template>

<script>
import { uploadL3Mask } from "@/api";

export default {
  name: "L3MaskEditor",
  props: {
    visible: { type: Boolean, default: false },
    src: { type: String, default: "" },
    patient: { type: String, required: false },
    date: { type: String, required: false },
    filename: { type: String, default: "sagittal_midResize.png" },
  },
  data() {
    return {
      innerVisible: this.visible,
      imageUrl: this.src || "https://via.placeholder.com/500",
      drawing: false,
      start: null,
      rects: [],
      current: null,
      saving: false,
    };
  },
  watch: {
    visible(v) {
      this.innerVisible = v;
      if (v) {
        this.drawing = false;
        this.current = null;
      }
    },
    innerVisible(v) {
      this.$emit("update:visible", v);
    },
    src(v) {
      if (v) this.imageUrl = v;
    },
  },
  methods: {
    onImgLoad() {
      this.redraw();
    },
    getPos(e) {
      const rect = this.$refs.canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    onDown(e) {
      const { x, y } = this.getPos(e);
      this.drawing = true;
      this.start = { x, y };
      this.current = null;
    },
    onMove(e) {
      if (!this.drawing) return;
      const { x, y } = this.getPos(e);
      this.current = { x1: this.start.x, y1: this.start.y, x2: x, y2: y };
      this.redraw();
    },
    onUp() {
      if (this.drawing && this.current) {
        const r = this.normalize(this.current);
        if (r.x2 - r.x1 > 3 && r.y2 - r.y1 > 3) this.rects.push(r);
      }
      this.drawing = false;
      this.current = null;
      this.redraw();
    },
    normalize(r) {
      return {
        x1: Math.min(r.x1, r.x2),
        y1: Math.min(r.y1, r.y2),
        x2: Math.max(r.x1, r.x2),
        y2: Math.max(r.y1, r.y2),
      };
    },
    redraw() {
      const c = this.$refs.canvas;
      if (!c) return;
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.lineWidth = 2;
      // 已完成
      ctx.strokeStyle = "#16a34a";
      ctx.fillStyle = "rgba(22,163,74,0.18)";
      for (const r of this.rects) {
        ctx.strokeRect(r.x1, r.y1, r.x2 - r.x1, r.y2 - r.y1);
        ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, r.y2 - r.y1);
      }
      // 当前
      if (this.current) {
        const r = this.normalize(this.current);
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = "#2563eb";
        ctx.strokeRect(r.x1, r.y1, r.x2 - r.x1, r.y2 - r.y1);
        ctx.setLineDash([]);
      }
    },
    addTestRect() {
      this.rects.push({ x1: 40, y1: 50, x2: 230, y2: 260 });
      this.redraw();
    },
    undo() {
      if (this.rects.length) {
        this.rects.pop();
        this.redraw();
      }
    },
    clearRects() {
      this.rects = [];
      this.current = null;
      this.redraw();
    },
    async save() {
      if (!this.rects.length || !this.patient || !this.date) {
        this.$message.warning("缺少矩形或病人/日期信息");
        return;
      }
      this.saving = true;
      try {
        const blob = await this.buildMaskBlob();
        await uploadL3Mask(this.patient, this.date, blob, this.filename);
        this.$message.success("Mask 上传成功");
        this.$emit("uploaded");
        this.close();
      } catch {
        this.$message.error("上传失败");
      } finally {
        this.saving = false;
      }
    },
    buildMaskBlob() {
      return new Promise((resolve) => {
        const c = document.createElement("canvas");
        c.width = 500;
        c.height = 500;
        const ctx = c.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = "white";
        for (const r of this.rects) {
          ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, r.y2 - r.y1);
        }
        c.toBlob((b) => resolve(b), "image/png", 1);
      });
    },
    close() {
      this.innerVisible = false;
    },
    handleClosed() {
      this.current = null;
      this.drawing = false;
    },
  },
};
</script>