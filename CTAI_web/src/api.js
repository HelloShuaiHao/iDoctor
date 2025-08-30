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

// 获取图片 URL（直接用于 <img> 或 el-image 的 :src）
export function getImageUrl(patient_name, study_date, filename) {
    return `${BASE_URL}/get_image/${encodeURIComponent(patient_name)}/${study_date}/${filename}`
}

export { BASE_URL }