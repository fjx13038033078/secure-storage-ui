<template>
  <div class="login">
    <div class="login-card">
      <div class="login-card-left">
        <div class="glass-content">
          <h2 class="glass-title">{{ title }}</h2>
          <p class="glass-desc">安全、可控、可审计的文件存储与共享平台</p>
        </div>
      </div>
      <div class="login-card-right">
        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
          <h3 class="form-title">账号登录</h3>
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" type="text" size="large" auto-complete="off" :placeholder="proxy.$t('login.username')">
              <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              size="large"
              auto-complete="off"
              :placeholder="proxy.$t('login.password')"
              @keyup.enter="handleLogin"
            >
              <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item v-if="captchaEnabled" prop="code">
            <div class="captcha-row">
              <el-input
                v-model="loginForm.code"
                size="large"
                auto-complete="off"
                :placeholder="proxy.$t('login.code')"
                @keyup.enter="handleLogin"
              >
                <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
              </el-input>
              <img :src="codeUrl" class="login-code-img" @click="getCode" />
            </div>
          </el-form-item>
          <div class="form-options">
            <el-checkbox v-model="loginForm.rememberMe">{{ proxy.$t('login.rememberPassword') }}</el-checkbox>
          </div>
          <el-form-item>
            <el-button :loading="loading" size="large" type="primary" class="submit-btn" @click.prevent="handleLogin">
              <span v-if="!loading">{{ proxy.$t('login.login') }}</span>
              <span v-else>{{ proxy.$t('login.logging') }}</span>
            </el-button>
          </el-form-item>
          <div class="form-footer">
            <router-link class="link-type" :to="'/register'">{{ proxy.$t('login.switchRegisterPage') }}</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg, getTenantList } from '@/api/login';
import { authRouterUrl } from '@/api/system/social/auth';
import { useUserStore } from '@/store/modules/user';
import { LoginData, TenantVO } from '@/api/types';
import { to } from 'await-to-js';
import { HttpStatus } from '@/enums/RespEnum';
import { useI18n } from 'vue-i18n';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const title = import.meta.env.VITE_APP_TITLE;
const userStore = useUserStore();
const router = useRouter();
const { t } = useI18n();

const loginForm = ref<LoginData>({
  tenantId: '000000',
  username: 'zhangsan',
  password: '123456',
  rememberMe: false,
  code: '',
  uuid: ''
} as LoginData);

const loginRules: ElFormRules = {
  tenantId: [{ required: true, trigger: 'blur', message: t('login.rule.tenantId.required') }],
  username: [{ required: true, trigger: 'blur', message: t('login.rule.username.required') }],
  password: [{ required: true, trigger: 'blur', message: t('login.rule.password.required') }],
  code: [{ required: true, trigger: 'change', message: t('login.rule.code.required') }]
};

const codeUrl = ref('');
const loading = ref(false);
const captchaEnabled = ref(true);
const tenantEnabled = ref(false);
const register = ref(true);
const redirect = ref('/');
const loginRef = ref<ElFormInstance>();
const tenantList = ref<TenantVO[]>([]);

watch(
  () => router.currentRoute.value,
  (newRoute: any) => {
    redirect.value = newRoute.query && newRoute.query.redirect && decodeURIComponent(newRoute.query.redirect);
  },
  { immediate: true }
);

const handleLogin = () => {
  loginRef.value?.validate(async (valid: boolean, fields: any) => {
    if (valid) {
      loading.value = true;
      if (loginForm.value.rememberMe) {
        localStorage.setItem('tenantId', String(loginForm.value.tenantId));
        localStorage.setItem('username', String(loginForm.value.username));
        localStorage.setItem('password', String(loginForm.value.password));
        localStorage.setItem('rememberMe', String(loginForm.value.rememberMe));
      } else {
        localStorage.removeItem('tenantId');
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('rememberMe');
      }
      const [err] = await to(userStore.login(loginForm.value));
      if (!err) {
        const redirectUrl = redirect.value || '/';
        await router.push(redirectUrl);
        loading.value = false;
      } else {
        loading.value = false;
        if (captchaEnabled.value) {
          await getCode();
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
    loginForm.value.code = '';
    codeUrl.value = 'data:image/gif;base64,' + data.img;
    loginForm.value.uuid = data.uuid;
  }
};

const getLoginData = () => {
  const tenantId = localStorage.getItem('tenantId');
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  const rememberMe = localStorage.getItem('rememberMe');
  loginForm.value = {
    tenantId: tenantId === null ? String(loginForm.value.tenantId) : tenantId,
    username: username === null ? String(loginForm.value.username) : username,
    password: password === null ? String(loginForm.value.password) : String(password),
    rememberMe: rememberMe === null ? false : Boolean(rememberMe)
  } as LoginData;
};

const initTenantList = async () => {
  const { data } = await getTenantList(false);
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  if (tenantEnabled.value) {
    tenantList.value = data.voList;
    if (tenantList.value != null && tenantList.value.length !== 0) {
      loginForm.value.tenantId = tenantList.value[0].tenantId;
    }
  }
};

const doSocialLogin = (type: string) => {
  authRouterUrl(type, loginForm.value.tenantId).then((res: any) => {
    if (res.code === HttpStatus.SUCCESS) {
      window.location.href = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  });
};

onMounted(() => {
  getCode();
  initTenantList();
  getLoginData();
});
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-image: url('../assets/images/login-background.jpg');
  background-size: cover;
  padding: 20px;
}

.login-card {
  display: flex;
  width: 720px;
  min-height: 420px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

.login-card-left {
  width: 42%;
  min-height: 420px;
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

.login-card-right {
  flex: 1;
  padding: 48px 44px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.login-form {
  .form-title {
    font-size: 20px;
    font-weight: 600;
    color: #1e3a5f;
    margin: 0 0 32px;
  }

  :deep(.el-form-item) {
    margin-bottom: 22px;
  }

  :deep(.el-input) {
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

  .login-code-img {
    width: 120px;
    height: 44px;
    cursor: pointer;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.5);
  }

  .form-options {
    margin: -8px 0 20px;
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
</style>
