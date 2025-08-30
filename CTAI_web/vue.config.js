module.exports = {
  lintOnSave: undefined,
  publicPath: './',
  outputDir: undefined,
  assetsDir: undefined,
  runtimeCompiler: undefined,
  productionSourceMap: undefined,
  parallel: false,
  css: undefined,
  devServer: {
    port: 7500,
    host: '0.0.0.0',
    allowedHosts: 'all', // 允许所有主机访问
    // 或使用下面这个（旧版 vue-cli）
    // disableHostCheck: true
  }
}
