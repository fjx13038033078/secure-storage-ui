<template>
  <div class="share-page">
    <div class="share-card">
      <h2 class="share-title">分享文件</h2>

      <template v-if="!shareLink">
        <el-alert type="error" :closable="false" show-icon>
          <template #title>链接无效</template>
          <template #default>请使用完整的分享链接访问</template>
        </el-alert>
      </template>

      <template v-else-if="!extractResult">
        <el-form v-loading="extracting" label-width="80px" class="share-form">
          <el-form-item v-if="needExtractCode" label="提取码">
            <el-input
              v-model="extractCode"
              placeholder="请输入4位提取码"
              maxlength="4"
              show-word-limit
              clearable
              @keyup.enter="doExtract"
            />
          </el-form-item>
          <el-form-item v-if="!needExtractCode && !extracting">
            <el-button type="primary" :loading="extracting" @click="doExtract">获取文件</el-button>
          </el-form-item>
          <el-form-item v-else-if="needExtractCode">
            <el-button type="primary" :loading="extracting" @click="doExtract">提取文件</el-button>
          </el-form-item>
        </el-form>
        <el-alert v-if="extractError" type="error" :closable="false" show-icon class="mt-3">
          {{ extractError }}
        </el-alert>
      </template>

      <template v-else>
        <el-alert type="success" :closable="false" show-icon class="mb-4">
          <template #title>文件信息</template>
          <template #default>
            <div>{{ extractResult.fileName }}</div>
            <div v-if="extractResult.fileSize" class="text-muted">
              {{ formatFileSize(extractResult.fileSize) }}
            </div>
          </template>
        </el-alert>
        <el-button type="primary" size="large" :loading="downloading" @click="doDownload">
          <el-icon class="mr-1"><Download /></el-icon>
          下载文件
        </el-button>
      </template>
    </div>
  </div>
</template>

<script setup name="Share" lang="ts">
import { useRoute } from 'vue-router';
import { extractShare } from '@/api/secure/share';
import { ShareExtractVO } from '@/api/secure/share/types';
import axios from 'axios';
import FileSaver from 'file-saver';
import { blobValidate } from '@/utils/ruoyi';

const route = useRoute();
const shareLink = ref<string>('');
const extractCode = ref('');
const needExtractCode = ref(false);
const extracting = ref(false);
const extractError = ref('');
const extractResult = ref<ShareExtractVO | null>(null);
const downloading = ref(false);

const baseURL = import.meta.env.VITE_APP_BASE_API;

function formatFileSize(bytes?: number): string {
  if (bytes == null || bytes === 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return size.toFixed(2) + ' ' + units[i];
}

async function doExtract() {
  if (!shareLink.value) return;
  extracting.value = true;
  extractError.value = '';
  try {
    const res = await extractShare(shareLink.value, extractCode.value || undefined);
    const data = (res as any).data ?? res;
    extractResult.value = {
      fileName: data.fileName,
      fileSize: data.fileSize,
      downloadToken: data.downloadToken
    };
  } catch (e: any) {
    const msg = e?.response?.data?.msg || e?.message || '提取失败';
    extractError.value = msg;
    if (msg.includes('提取码')) {
      needExtractCode.value = true;
    }
  } finally {
    extracting.value = false;
  }
}

async function doDownload() {
  if (!extractResult.value || !shareLink.value) return;
  downloading.value = true;
  try {
    const url = `${baseURL}/secure/share/download?shareLink=${encodeURIComponent(shareLink.value)}&token=${encodeURIComponent(extractResult.value.downloadToken)}`;
    const res = await axios({
      method: 'get',
      url: url,
      responseType: 'blob'
    });
    const isBlob = blobValidate(res.data);
    if (isBlob) {
      const blob = new Blob([res.data], { type: 'application/octet-stream' });
      const filename = res.headers['download-filename']
        ? decodeURIComponent(res.headers['download-filename'] as string)
        : extractResult.value.fileName || 'download';
      FileSaver.saveAs(blob, filename);
    } else {
      ElMessage.error('下载失败');
    }
  } catch (e) {
    console.error(e);
    ElMessage.error('下载失败');
  } finally {
    downloading.value = false;
  }
}

onMounted(() => {
  const link = route.query.link as string;
  shareLink.value = link ? decodeURIComponent(link) : '';
  if (shareLink.value) {
    doExtract();
  }
});
</script>

<style scoped lang="scss">
.share-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.share-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.share-title {
  margin: 0 0 24px;
  font-size: 24px;
  text-align: center;
  color: #303133;
}

.share-form {
  margin-top: 16px;
}

.mt-3 {
  margin-top: 12px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mr-1 {
  margin-right: 6px;
}

.text-muted {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}
</style>
