<template>
  <div class="list-page">
    <div class="card">
      <div class="card-head">
        <el-button icon="el-icon-arrow-left" @click="goBack">返回</el-button>
        <h2 class="title">已处理结果</h2>
        <div class="spacer"></div>
        <el-input
          v-model="keyword"
          size="small"
          clearable
          placeholder="搜索病人或日期"
          class="search"
        />
        <el-button
          size="small"
          type="primary"
          icon="el-icon-refresh"
          :loading="loading"
          @click="fetchPatients"
        >
          刷新
        </el-button>
      </div>

      <el-table
        :data="filteredRows"
        stripe
        border
        size="small"
        v-loading="loading"
        style="width: 100%"
        @row-dblclick="viewDetail"
      >
        <el-table-column prop="patient" label="病人" min-width="180" />
        <el-table-column prop="date" label="日期" width="140" />
        <el-table-column label="操作" width="140" align="center">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click.stop="viewDetail(scope.row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && filteredRows.length === 0"
        description="暂无匹配结果"
      />
    </div>
  </div>
</template>

<script>
import { listPatients } from "@/api";

export default {
  name: "ResultsList",
  data() {
    return {
      loading: false,
      rows: [], // { patient, date, display }
      keyword: "",
    };
  },
  created() {
    this.fetchPatients();
  },
  computed: {
    filteredRows() {
      const kw = (this.keyword || "").trim();
      if (!kw) return this.rows;
      return this.rows.filter(
        (r) => r.patient.includes(kw) || r.date.includes(kw)
      );
    },
  },
  methods: {
    async fetchPatients() {
      this.loading = true;
      try {
        const res = await listPatients();
        const list =
          res && res.data && res.data.patients ? res.data.patients : [];
        this.rows = list.map((item) => {
          const i = item.lastIndexOf("-");
          return {
            display: item,
            patient: item.slice(0, i),
            date: item.slice(i + 1),
          };
        });
      } catch (e) {
        this.$message.error("获取结果列表失败");
      } finally {
        this.loading = false;
      }
    },
    viewDetail(row) {
      this.$router.push(`/results/${row.patient}/${row.date}`);
    },
    goBack() {
      if (window.history.length > 1) this.$router.back();
      else this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.list-page {
  width: clamp(960px, 86vw, 1140px);
  margin: 24px auto 80px;
}

.card {
  background: #ffffff;
  border-radius: 14px;
  padding: 14px 16px 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.title {
  margin: 0 4px;
  color: #0f172a; /* 深色标题 */
  font-weight: 800;
}

.spacer {
  flex: 1;
}

.search {
  width: 240px;
}

/* 提升表格对比度 */
:deep(.el-table th) {
  background: #f8fafc;
  color: #0f172a;
  font-weight: 700;
}
:deep(.el-table .cell) {
  color: #111827;
}
</style>