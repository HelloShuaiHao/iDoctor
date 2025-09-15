
import Vue from 'vue'
import App from './App'
import VueRouter from 'vue-router'
import axios from 'axios'
import Element from 'element-ui'
import echarts from "echarts"

import Content from './components/Content.vue'
import ResultsList from './components/ResultList.vue'
import ResultDetail from './components/ResultDetail.vue'

Vue.prototype.$echarts = echarts
import '../node_modules/element-ui/lib/theme-chalk/index.css'
import '../src/assets/style.css'
import './theme/index.css'

import { i18n } from './i18n'


Vue.use(Element)
Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.prototype.$http = axios

const router = new VueRouter({
    routes: [
        { path: '/', component: Content, meta: { title: '上传与处理' } },
        { path: '/results', component: ResultsList, meta: { title: '结果列表' } },
        { path: '/results/:patient/:date', component: ResultDetail, meta: { title: '结果详情' } },
        { path: '*', redirect: '/' }
    ],
    // 为避免服务器未配 history 重写导致 404，建议开发用 hash 模式
    mode: 'hash'
})

// 全局注册（可选）
Vue.component('App', App)

new Vue({
    el: '#app',
    router,
    i18n,
    render: h => h(App)
})
