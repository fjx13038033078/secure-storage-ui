<template>
  <div class="register">
    <div class="register-card">
      <div class="register-card-left">
        <div class="glass-content">
          <h2 class="glass-title">{{ title }}</h2>
          <p class="glass-desc">安全、可控、可审计的文件存储与共享平台</p>
        </div>
      </div>
      <div class="register-card-right">
        <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form" autocomplete="off">
          <h3 class="form-title">用户注册</h3>
          <!-- <el-form-item v-if="tenantEnabled" prop="tenantId">
            <el-select v-model="registerForm.tenantId" filterable :placeholder="proxy.$t('register.selectPlaceholder')" style="width: 100%">
              <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId"> </el-option>
              <template #prefix><svg-icon icon-class="company" class="el-input__icon input-icon" /></template>
            </el-select>
          </el-form-item> -->
          <el-form-item prop="username">
            <el-input v-model="registerForm.username" type="text" size="large" autocomplete="off" :placeholder="proxy.$t('register.username')">
              <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              size="large"
              autocomplete="new-password"
              :placeholder="proxy.$t('register.password')"
              @keyup.enter="handleRegister"
            >
              <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              size="large"
              autocomplete="new-password"
              :placeholder="proxy.$t('register.confirmPassword')"
              @keyup.enter="handleRegister"
            >
              <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item v-if="captchaEnabled" prop="code">
            <div class="captcha-row">
              <el-input
                v-model="registerForm.code"
                size="large"
                auto-complete="off"
                :placeholder="proxy.$t('register.code')"
                @keyup.enter="handleRegister"
              >
                <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
              </el-input>
              <img :src="codeUrl" class="register-code-img" @click="getCode" />
            </div>
          </el-form-item>
          <el-form-item>
            <el-button :loading="loading" size="large" type="primary" class="submit-btn" @click.prevent="handleRegister">
              <span v-if="!loading">{{ proxy.$t('register.register') }}</span>
              <span v-else>{{ proxy.$t('register.registering') }}</span>
            </el-button>
          </el-form-item>
          <div class="form-footer">
            <router-link class="link-type" :to="'/login'">{{ proxy.$t('register.switchLoginPage') }}</router-link>
          </div>
        </el-form>
      </div>
    </div>
    <!-- <div class="el-register-footer">
      <span>Copyright © 2018-2026 疯狂的狮子Li All Rights Reserved.</span>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { getCodeImg, register, getTenantList } from '@/api/login';
import { RegisterForm, TenantVO } from '@/api/types';
import { to } from 'await-to-js';
import { useI18n } from 'vue-i18n';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const title = import.meta.env.VITE_APP_TITLE;
const router = useRouter();
const { t } = useI18n();

const registerForm = ref<RegisterForm>({
  tenantId: '000000',
  username: '',
  password: '',
  confirmPassword: '',
  code: '',
  uuid: '',
  userType: 'sys_user'
});

const tenantEnabled = ref(false);

const equalToPassword = (rule: any, value: string, callback: any) => {
  if (registerForm.value.password !== value) {
    callback(new Error(t('register.rule.confirmPassword.equalToPassword')));
  } else {
    callback();
  }
};

const registerRules: ElFormRules = {
  tenantId: [{ required: true, trigger: 'blur', message: t('register.rule.tenantId.required') }],
  username: [
    { required: true, trigger: 'blur', message: t('register.rule.username.required') },
    { min: 2, max: 20, message: t('register.rule.username.length', { min: 2, max: 20 }), trigger: 'blur' }
  ],
  password: [
    { required: true, trigger: 'blur', message: t('register.rule.password.required') },
    { min: 5, max: 20, message: t('register.rule.password.length', { min: 5, max: 20 }), trigger: 'blur' },
    { pattern: /^[^<>"'|\\]+$/, message: t('register.rule.password.pattern', { strings: '< > " \' \\ |' }), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, trigger: 'blur', message: t('register.rule.confirmPassword.required') },
    { required: true, validator: equalToPassword, trigger: 'blur' }
  ],
  code: [{ required: true, trigger: 'change', message: t('register.rule.code.required') }]
};

const codeUrl = ref('');
const loading = ref(false);
const captchaEnabled = ref(true);
const registerRef = ref<ElFormInstance>();
const tenantList = ref<TenantVO[]>([]);

const handleRegister = () => {
  registerRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      const [err] = await to(register(registerForm.value));
      if (!err) {
        const username = registerForm.value.username;
        await ElMessageBox.alert('<span style="color: red; ">' + t('register.registerSuccess', { username }) + '</font>', '系统提示', {
          app: undefined,
          dangerouslyUseHTMLString: true,
          type: 'success'
        });
        await router.push('/login');
      } else {
        loading.value = false;
        if (captchaEnabled.value) {
          getCode();
        }
      }
    }
  });
};

const getCode = async () => {
  const res = await getCodeImg();
  const { data } = res;
  captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled;
  if (captchaEnabled.value) {
    registerForm.value.code = '';
    codeUrl.value = 'data:image/gif;base64,' + data.img;
    registerForm.value.uuid = data.uuid;
    registerForm.value.uuid = data.uuid;
  }
};

const initTenantList = async () => {
  const { data } = await getTenantList(false);
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  if (tenantEnabled.value) {
    tenantList.value = data.voList;
    if (tenantList.value != null && tenantList.value.length !== 0) {
      registerForm.value.tenantId = tenantList.value[0].tenantId;
    }
  } else {
    registerForm.value.tenantId = '000000';
  }
};

onMounted(() => {
  getCode();
  initTenantList();
});
</script>

<style lang="scss" scoped>
.register {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-image: url('../assets/images/login-background.jpg');
  background-size: cover;
  padding: 20px;
}

.register-card {
  display: flex;
  width: 720px;
  min-height: 480px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

.register-card-left {
  width: 42%;
  min-height: 480px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.glass-content {
  text-align: center;
}

.glass-title {
  font-size: 22px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.glass-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.6;
}

.register-card-right {
  flex: 1;
  padding: 40px 44px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.register-form {
  .form-title {
    font-size: 20px;
    font-weight: 600;
    color: #1e3a5f;
    margin: 0 0 28px;
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-input),
  :deep(.el-select) {
    height: 44px;

    .el-input__wrapper {
      height: 44px;
      padding: 0 14px;
      background: rgba(255, 255, 255, 0.7);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
  }

  .input-icon {
    height: 20px;
    width: 20px;
    margin-right: 8px;
  }

  .captcha-row {
    display: flex;
    gap: 12px;
    width: 100%;

    :deep(.el-input) {
      flex: 1;
    }
  }

  .register-code-img {
    width: 120px;
    height: 44px;
    cursor: pointer;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.5);
  }

  .submit-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }

  .form-footer {
    text-align: center;
    margin-top: 16px;

    .link-type {
      color: #2c5f8d;
      font-size: 14px;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.el-register-footer {
  margin-top: 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}
</style>
