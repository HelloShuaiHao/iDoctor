<template>
  <div id="Header">
    <!-- <svg
      class="header-bg-svg"
      width="100%"
      height="180"
      viewBox="0 0 1440 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    > -->
      <path fill="#e0f7fa" d="M0,80 C400,180 1040,0 1440,120 L1440,0 L0,0 Z" />
    </svg>
    <div class="top-left-edition">
      <span style="color: #21b3b9; font-weight: bold">
        <i class="el-icon-phone-outline" style="font-size: 23px"></i
        >免费咨询：e1221805@u.nus.edu
      </span>
      <span>
        <i class="el-icon-time" style="font-size: 23px"></i>工作时间：9:00-18:00
      </span>
    </div>
    <div id="word">
      <h1>{{ msg }}</h1>
    </div>
  </div>
</template>
<script>
export default {
  name: "Header",
  data() {
    return {
      msg: "肌少症诊断系统",
      activeIndex: "1",
    };
  },
  methods: {
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
  },
};
</script>
<style scoped>
.header-bg-svg {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 180px;
  pointer-events: none;
}
#Header {
  position: relative;
  width: 90%;
  margin: 0 auto;
  padding: 30px 0 0 0;
}
.top-left-edition,
#word {
  position: relative;
  z-index: 1;
}

#word {
  margin-left: 45%;
  margin-top: -35px;
  margin-bottom: 37px;
  height: 60px;
  line-height: 3.2em;
}

h1 {
  /*text-align: center;*/
  color: #21b3b9;
  letter-spacing: 30px;
  font-size: 2.3em;
}

.el-menu-demo {
  width: 80%;
  margin: 0px auto;
  padding: 0px auto;
}

.top-left-edition span i {
  float: left;
  margin-right: 10px;
}

i,
input,
label {
  vertical-align: middle;
}

i {
  border: 0;
  display: block;
  cursor: pointer;
}

.top-left-edition span {
  float: left;
  font-size: 16px;
  color: #999999;
  line-height: 24px;
  margin-right: 40px;
}
</style>