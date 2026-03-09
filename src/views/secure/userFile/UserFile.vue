<template>
  <div class="p-2">
    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-upload
              :action="uploadUrl"
              :headers="uploadHeaders"
              :before-upload="handleBeforeUpload"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :show-file-list="false"
            >
              <el-button type="primary" icon="Upload">上传文件</el-button>
            </el-upload>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
        </el-row>
      </template>

      <el-table v-loading="loading" :data="fileList" border>
        <el-table-column label="文件名" align="center" prop="fileName" min-width="200" show-overflow-tooltip />
        <el-table-column label="文件大小" align="center" prop="fileSize" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column label="上传时间" align="center" prop="createTime" width="180">
          <template #default="{ row }">
            {{ proxy?.parseTime(row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="下载" placement="top">
              <el-button link type="primary" icon="Download" @click="handleDownload(row)" />
            </el-tooltip>
            <el-tooltip content="分享" placement="top">
              <el-button link type="primary" icon="Share" @click="handleShare(row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click="handleDelete(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-card>

    <!-- 分享弹窗 -->
    <el-dialog
      v-model="shareDialog.visible"
      :title="shareDialog.title"
      width="480px"
      append-to-body
      destroy-on-close
      @close="resetShareForm"
    >
      <el-form v-if="!shareResult" ref="shareFormRef" :model="shareForm" :rules="shareRules" label-width="100px">
        <el-form-item label="有效期" prop="expireDays">
          <el-radio-group v-model="shareForm.expireDays">
            <el-radio :label="null">永久</el-radio>
            <el-radio :label="7">7天</el-radio>
            <el-radio :label="1">1天</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否加密" prop="needCode">
          <el-switch v-model="shareForm.needCode" />
          <span class="ml-2 text-gray-500">生成提取码</span>
        </el-form-item>
      </el-form>

      <!-- 分享结果展示 -->
      <div v-else class="share-result">
        <el-alert type="success" :closable="false" show-icon class="mb-4">
          <template #title>分享创建成功</template>
        </el-alert>
        <el-form label-width="100px">
          <el-form-item label="分享链接">
            <el-input v-model="shareResult.shareLink" readonly>
              <template #append>
                <el-button @click="copyToClipboard(shareResult.shareLink)">复制</el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item v-if="shareResult.extractCode" label="提取码">
            <el-input v-model="shareResult.extractCode" readonly>
              <template #append>
                <el-button @click="copyToClipboard(shareResult.extractCode!)">复制</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <template v-if="!shareResult">
            <el-button :loading="shareLoading" type="primary" @click="submitShare">确 定</el-button>
            <el-button @click="shareDialog.visible = false">取 消</el-button>
          </template>
          <template v-else>
            <el-button type="primary" @click="shareDialog.visible = false">关 闭</el-button>
          </template>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="UserFile" lang="ts">
import { listUserFiles, delUserFile } from '@/api/secure/userFile';
import { createShare } from '@/api/secure/share';
import { BizUserFileVO } from '@/api/secure/userFile/types';
import { BizFileShareVO } from '@/api/secure/share/types';
import { globalHeaders } from '@/utils/request';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const fileList = ref<BizUserFileVO[]>([]);
const loading = ref(true);
const total = ref(0);
const showSearch = ref(false);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10
});

const uploadUrl = import.meta.env.VITE_APP_BASE_API + '/secure/file/upload';
const uploadHeaders = globalHeaders();

const shareDialog = reactive({
  visible: false,
  title: '创建分享'
});

const shareForm = reactive({
  fileId: 0,
  expireDays: null as number | null,
  needCode: false
});

const shareRules = {};
const shareFormRef = ref<ElFormInstance>();
const shareLoading = ref(false);
const shareResult = ref<BizFileShareVO | null>(null);

/** 格式化文件大小 */
function formatFileSize(bytes?: number): string {
  if (bytes == null || bytes === 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return size.toFixed(2) + ' ' + units[i];
}

/** 查询文件列表 */
async function getList() {
  loading.value = true;
  try {
    const res = await listUserFiles(queryParams.value);
    fileList.value = res.rows ?? [];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

/** 上传前校验 */
function handleBeforeUpload() {
  proxy?.$modal.loading('正在上传文件，请稍候...');
  return true;
}

/** 上传成功 */
function handleUploadSuccess(res: any) {
  proxy?.$modal.closeLoading();
  if (res.code === 200) {
    proxy?.$modal.msgSuccess('上传成功');
    getList();
  } else {
    proxy?.$modal.msgError(res.msg || '上传失败');
  }
}

/** 上传失败 */
function handleUploadError() {
  proxy?.$modal.closeLoading();
  proxy?.$modal.msgError('上传失败');
}

/** 下载 */
function handleDownload(row: BizUserFileVO) {
  proxy?.$download.secureFile(row.fileId);
}

/** 分享 */
function handleShare(row: BizUserFileVO) {
  shareForm.fileId = row.fileId;
  shareForm.expireDays = null;
  shareForm.needCode = false;
  shareResult.value = null;
  shareDialog.visible = true;
  shareDialog.title = `分享文件：${row.fileName}`;
}

/** 提交分享 */
async function submitShare() {
  shareLoading.value = true;
  try {
    const res = await createShare(shareForm.fileId, shareForm.expireDays, shareForm.needCode);
    const data = (res as any).data ?? res;
    shareResult.value = {
      shareLink: buildShareLink(data.shareLink),
      extractCode: data.extractCode ?? undefined
    };
    proxy?.$modal.msgSuccess('分享创建成功');
  } catch {
    // 错误已由 request 拦截器处理
  } finally {
    shareLoading.value = false;
  }
}

/** 构建完整分享链接（前端访问地址） */
function buildShareLink(shortLink: string): string {
  const base = window.location.origin + (import.meta.env.VITE_APP_CONTEXT_PATH || '');
  return `${base}/share?link=${encodeURIComponent(shortLink)}`;
}

/** 复制到剪贴板 */
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    proxy?.$modal.msgSuccess('已复制到剪贴板');
  } catch {
    proxy?.$modal.msgError('复制失败');
  }
}

/** 重置分享表单 */
function resetShareForm() {
  shareResult.value = null;
  shareForm.fileId = 0;
  shareForm.expireDays = null;
  shareForm.needCode = false;
}

/** 删除 */
async function handleDelete(row: BizUserFileVO) {
  await proxy?.$modal.confirm(`是否确认删除文件"${row.fileName}"？`);
  loading.value = true;
  try {
    await delUserFile(row.fileId);
    proxy?.$modal.msgSuccess('删除成功');
    await getList();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.share-result {
  padding: 8px 0;
}
.ml-2 {
  margin-left: 8px;
}
.mb-4 {
  margin-bottom: 16px;
}
.text-gray-500 {
  color: #909399;
}
</style>
