import Vue from 'vue'
import VueI18n from 'vue-i18n'
import ElementLocale from 'element-ui/lib/locale'
import zhCN from 'element-ui/lib/locale/lang/zh-CN'
import enUS from 'element-ui/lib/locale/lang/en'

Vue.use(VueI18n)

const STORAGE_KEY = 'lang'

function detectLocale() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return saved
    const nav = (navigator.language || 'zh').toLowerCase()
    return nav.startsWith('zh') ? 'zh' : 'en'
}

export const messages = {
    zh: {
        app: { title: '肌少症诊断系统' },
        nav: {
            upload: '上传与处理',
            results: '结果列表',
            detail: '结果详情'
        },
        upload: {
            uploadZipTitle: '上传 CT 扫描压缩包（ZIP）',
            selectedPrefix: '已选：'
        },
        actions: {
            upload: '上传',
            process: '开始处理',
            viewResult: '查看结果',
            viewAll: '查看所有结果',
            back: '返回',
            retry: '重新生成',
            detectL3: '检测 L3',
            manualL3: '手动标注 L3 mask',
            continue: '继续后续流程',
            saveUpload: '保存上传',
            cancel: '取消',
            refresh: '刷新',
            chooseFile: '选择文件',
            prevStep: '返回上一步',
            action: '操作',
            undo: '撤销',
            clear: '清空'
        },
        form: {
            patientName: '病人姓名',
            studyDate: '检查日期',
            zipFile: 'ZIP 文件',
            patientNamePlaceholder: '例如：张三',
            studyDatePlaceholder: '例如：20250915'
        },
        steps: {
            step1: '步骤 1 上传 DICOM ZIP',
            step2: '步骤 2 处理数据',
            step3: '步骤 3 查看结果'
        },
        result: {
            keyMetrics: '关键指标（HU 与面积）',
            keyImages: '关键图片（middle）',
            l3Ops: 'L3 操作',
            l3Preview: 'L3 结果预览',
            emptyMetrics: '未解析到关键指标',
            processedList: '已处理结果',
            noMatch: '暂无匹配结果',
            searchPlaceholder: '搜索病人或日期'
        },
        fields: {
            slice: '切片',
            psoasHu: 'Psoas HU(mean)',
            psoasArea: 'Psoas 面积(mm²)',
            comboHu: 'Combo HU(mean)',
            comboArea: 'Combo 面积(mm²)',
            patient: '病人',
            date: '日期'
        },
        editor: {
            l3MaskTitle: 'L3 Mask 标注',
            noSagittal: '未获取到侧视图',
            tips: '拖动鼠标绘制多个矩形，可撤销/清空，保存会生成白色区域、黑色背景的二值 mask。'
        },
        messages: {
            uploadSuccess: '上传成功',
            uploadFail: '上传失败',
            processSuccess: '处理完成',
            processFail: '处理失败',
            fetchFail: '获取结果失败',
            l3DetectSuccess: 'L3 检测完成',
            l3DetectFail: 'L3 检测失败',
            l3ContinueSuccess: '后续流程已完成',
            l3ContinueFail: '后续流程失败',
            pngOnly: '请上传 PNG 格式的 mask',
            sagittalFail: '生成侧视图失败',
            maskUploadSuccess: 'L3 mask 上传成功',
            maskUploadFail: '上传失败',
            waitUpload: '等待上传完成',
            clickProcessHint: '点击“开始处理”调用后端推理',
            waitProcess: '等待处理完成',
            enterResultHint: '可进入结果详情或结果列表',
            processApiTip: '调用后端 /process 接口处理刚上传的数据',
            noContent: '无内容',
            needOneRect: '请先绘制至少一个矩形'
        },
        footer: {
            copyright: 'Copyright {year} © 肌少症诊断系统 版权所有'
        }
    },
    en: {
        app: { title: 'Sarcopenia Diagnosis System' },
        nav: {
            upload: 'Upload & Process',
            results: 'Results List',
            detail: 'Result Detail'
        },
        upload: {
            uploadZipTitle: 'Upload CT Scan Archive (ZIP)',
            selectedPrefix: 'Selected:'
        },
        actions: {
            upload: 'Upload',
            process: 'Start Processing',
            viewResult: 'View This Result',
            viewAll: 'All Results',
            back: 'Back',
            retry: 'Regenerate',
            detectL3: 'Detect L3',
            manualL3: 'Manual L3 Mask',
            continue: 'Continue Pipeline',
            saveUpload: 'Save & Upload',
            cancel: 'Cancel',
            refresh: 'Refresh',
            chooseFile: 'Choose File',
            prevStep: 'Previous Step',
            action: 'Action',
            undo: 'Undo',
            clear: 'Clear'
        },
        form: {
            patientName: 'Patient Name',
            studyDate: 'Study Date',
            zipFile: 'ZIP File',
            patientNamePlaceholder: 'e.g. John Doe',
            studyDatePlaceholder: 'e.g. 20250915'
        },
        steps: {
            step1: 'Step 1 Upload DICOM ZIP',
            step2: 'Step 2 Process Data',
            step3: 'Step 3 View Results'
        },
        result: {
            keyMetrics: 'Key Metrics (HU & Area)',
            keyImages: 'Key Images (middle)',
            l3Ops: 'L3 Operations',
            l3Preview: 'L3 Preview',
            emptyMetrics: 'No key metrics parsed',
            processedList: 'Processed Results',
            noMatch: 'No matched records',
            searchPlaceholder: 'Search patient or date'
        },
        fields: {
            slice: 'Slice',
            psoasHu: 'Psoas HU(mean)',
            psoasArea: 'Psoas Area(mm²)',
            comboHu: 'Combo HU(mean)',
            comboArea: 'Combo Area(mm²)',
            patient: 'Patient',
            date: 'Date'
        },
        editor: {
            l3MaskTitle: 'L3 Mask Annotation',
            noSagittal: 'No sagittal view available',
            tips: 'Drag to draw multiple rectangles. Undo/Clear supported. Save to build a binary mask (white ROIs on black background).'
        },
        messages: {
            uploadSuccess: 'Upload succeeded',
            uploadFail: 'Upload failed',
            processSuccess: 'Processing finished',
            processFail: 'Processing failed',
            fetchFail: 'Fetch failed',
            l3DetectSuccess: 'L3 detection finished',
            l3DetectFail: 'L3 detection failed',
            l3ContinueSuccess: 'Pipeline finished',
            l3ContinueFail: 'Pipeline failed',
            pngOnly: 'Please upload a PNG mask',
            sagittalFail: 'Generate sagittal view failed',
            maskUploadSuccess: 'Mask uploaded',
            maskUploadFail: 'Upload failed',
            waitUpload: 'Waiting for upload',
            clickProcessHint: 'Click "Start Processing" to run backend inference',
            waitProcess: 'Waiting for processing',
            enterResultHint: 'Go to detail or results list',
            processApiTip: 'Calls backend /process API for the uploaded data',
            noContent: 'No content',
            needOneRect: 'Draw at least one rectangle first'
        },
        footer: {
            copyright: 'Copyright {year} © Sarcopenia Diagnosis System. All rights reserved.'
        }
    }
}


const locale = detectLocale()

export const i18n = new VueI18n({
    locale,
    fallbackLocale: 'zh',
    messages,
    silentFallbackWarn: true
})

ElementLocale.use(locale === 'en' ? enUS : zhCN)

export function setLocale(lang) {
    if (i18n.locale === lang) return
    i18n.locale = lang
    localStorage.setItem(STORAGE_KEY, lang)
    ElementLocale.use(lang === 'en' ? enUS : zhCN)
    document.title = i18n.t('app.title')
}

export function getLocale() {
    return i18n.locale
}

