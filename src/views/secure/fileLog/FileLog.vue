<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="操作类型" prop="operateType">
              <el-select v-model="queryParams.operateType" placeholder="请选择" clearable>
                <el-option label="上传" value="1" />
                <el-option label="下载" value="2" />
                <el-option label="分享" value="3" />
                <el-option label="删除" value="4" />
              </el-select>
            </el-form-item>
            <el-form-item label="操作人" prop="userName">
              <el-input v-model="queryParams.userName" placeholder="请输入操作人账号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="操作时间" style="width: 308px">
              <el-date-picker
                v-model="dateRange"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Document" disabled>文件日志</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
        </el-row>
      </template>

      <el-table v-loading="loading" :data="logList" border style="width: 100%">
        <el-table-column label="日志ID" align="center" prop="logId" width="80" />
        <el-table-column label="操作类型" align="center" prop="operateType" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.operateType === '1'" type="success">上传</el-tag>
            <el-tag v-else-if="row.operateType === '2'" type="primary">下载</el-tag>
            <el-tag v-else-if="row.operateType === '3'" type="warning">分享</el-tag>
            <el-tag v-else-if="row.operateType === '4'" type="danger">删除</el-tag>
            <span v-else>{{ row.operateType }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作人" align="center" prop="userName" min-width="120" show-overflow-tooltip />
        <el-table-column label="文件ID" align="center" prop="fileId" width="100" />
        <el-table-column label="操作IP" align="center" prop="ipaddr" min-width="140" show-overflow-tooltip />
        <el-table-column label="操作时间" align="center" prop="createTime" min-width="180">
          <template #default="{ row }">
            {{ proxy?.parseTime(row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}
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
  </div>
</template>

<script setup name="FileLog" lang="ts">
import { listFileLogs } from '@/api/secure/fileLog';
import { BizFileOperateLogVO } from '@/api/secure/fileLog/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const logList = ref<BizFileOperateLogVO[]>([]);
const loading = ref(true);
const total = ref(0);
const showSearch = ref(true);
const dateRange = ref<[string, string]>(['', '']);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  operateType: '',
  userName: ''
});

/** 查询文件日志列表 */
async function getList() {
  loading.value = true;
  try {
    const params: any = { ...queryParams.value };
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      params.beginTime = dateRange.value[0];
      params.endTime = dateRange.value[1];
    }
    const res = await listFileLogs(params);
    logList.value = res.rows ?? [];
    total.value = res.total ?? 0;
  } finally {
    loading.value = false;
  }
}

/** 搜索 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置 */
function resetQuery() {
  dateRange.value = ['', ''];
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
  queryParams.value.operateType = '';
  queryParams.value.userName = '';
  getList();
}

const queryFormRef = ref<ElFormInstance>();

onMounted(() => {
  getList();
});
</script>
