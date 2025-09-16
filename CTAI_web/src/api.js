import axios from "axios"

const BASE_URL = "http://ai.bygpu.com:55303"

// 上传 DICOM ZIP 文件
export async function uploadDicomZip({ patient_name, study_date, file }) {
    const formData = new FormData()
    formData.append("patient_name", patient_name)
    formData.append("study_date", study_date)
    formData.append("file", file)
    return axios.post(`${BASE_URL}/upload_dicom_zip`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })
}

// 处理数据
export async function processCase(patient_name, study_date) {
    return axios.post(`${BASE_URL}/process/${encodeURIComponent(patient_name)}/${study_date}`)
}

// 获取所有已处理病人-日期列表
export async function listPatients() {
    return axios.get(`${BASE_URL}/list_patients`)
}

// 获取关键结果（csv内容和图片名）
export async function getKeyResults(patient_name, study_date) {
    return axios.get(`${BASE_URL}/get_key_results/${encodeURIComponent(patient_name)}/${study_date}`)
}

//添加时间戳
export function getImageUrl(patient_name, study_date, filename) {
    return `${BASE_URL}/get_image/${encodeURIComponent(patient_name)}/${study_date}/${filename}?t=${Date.now()}`;
}

// ...existing code...

// L3 检测
export async function l3Detect(patient_name, study_date) {
    return axios.post(`${BASE_URL}/l3_detect/${encodeURIComponent(patient_name)}/${study_date}`);
}

// 手动上传 L3 mask
export async function uploadL3Mask(patient, date, file) {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post(`${BASE_URL}/upload_l3_mask/${encodeURIComponent(patient)}/${date}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
}

// L3 之后的流程
export async function continueAfterL3(patient_name, study_date) {
    return axios.post(`${BASE_URL}/continue_after_l3/${encodeURIComponent(patient_name)}/${study_date}`);
}

// 获取 L3 相关图片
export function getL3ImageUrl(patient_name, study_date, folder, filename) {
    return `${BASE_URL}/get_output_image/${encodeURIComponent(patient_name)}/${study_date}/${folder}/${filename}`;
}

// 生成侧视图（sagittal）
export async function generateSagittal(patient_name, study_date, force = 0) {
    return axios.post(`${BASE_URL}/generate_sagittal/${encodeURIComponent(patient_name)}/${study_date}?force=${force}`);
}

export function getAxisalImageUrl(patient_name, study_date, filename) {
    return getL3ImageUrl(patient_name, study_date, 'Axisal', filename)
}

// 手动上传 Middle 原图的 psoas/combo mask
export async function uploadMiddleManualMask(patient, date, psoasFile, comboFile) {
    const fd = new FormData()
    if (psoasFile) fd.append('psoas_mask', psoasFile)
    if (comboFile) fd.append('combo_mask', comboFile)
    try {
        const res = await axios.post(
            `${BASE_URL}/upload_middle_manual_mask/${encodeURIComponent(patient)}/${encodeURIComponent(date)}`,
            fd,
            { headers: { 'Accept': 'application/json' } }
        )
        return res
    } catch (e) {
        // 让调用方能看到服务器的错误信息
        if (e.response) {
            console.error('[uploadMiddleManualMask] server error:', e.response.status, e.response.data)
            throw new Error((_t.response.data && _t.response.data.error) || 'HTTP ' + _t.response.status);
        } else {
            console.error('[uploadMiddleManualMask] network error:', e)
            throw e
        }
    }
}
export { BASE_URL }