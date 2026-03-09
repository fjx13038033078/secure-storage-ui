<template>
  <div class="app-container home">
    <div class="home-header">
      <h1 class="home-title">基于加密技术的文件共享系统</h1>
      <p class="home-subtitle">安全、可控、可审计的文件存储与共享平台</p>
    </div>

    <div class="home-intro">
      <h3>系统简介</h3>
      <div class="intro-content">
        <p><strong>用户模块：</strong>支持用户注册与登录，密码经 MD5 加密后安全存储。提供完整的文件管理能力，包括文件上传（自动加密存储）、下载（自动解密）、删除等操作。安全共享功能支持创建加密分享链接，可设置链接有效期与访问密码，并支持基于好友或学习小组的文件共享。系统支持为不同用户或群组配置差异化访问权限，如仅预览、可下载等。个人中心支持查看和修改个人信息、管理自己的文件及共享记录、修改登录密码。</p>
        <p><strong>管理功能：</strong>管理员可对用户账号进行审核、添加、修改、禁用或删除。文件审计模块记录并展示所有用户的文件上传、下载、共享等操作日志，便于追踪与审计。系统监控模块实时监控整体运行状态，对异常访问或潜在安全威胁进行告警。管理员可在个人中心修改自己的账户信息及密码。</p>
      </div>
    </div>

    <div class="home-nav">
      <h3>快速导航</h3>
      <div class="nav-grid">
        <a class="nav-card" href="#" @click.prevent="goTo('/system/user')">
          <span class="nav-icon">用户管理</span>
          <span class="nav-desc">审核、添加、修改、禁用或删除用户账号</span>
        </a>
        <a class="nav-card" href="#" @click.prevent="goTo('/system/role')">
          <span class="nav-icon">角色管理</span>
          <span class="nav-desc">配置角色与权限，分配数据权限</span>
        </a>
        <a class="nav-card" href="#" @click.prevent="goTo('/secure/fileLog')">
          <span class="nav-icon">文件审计</span>
          <span class="nav-desc">查看文件上传、下载、共享等操作日志</span>
        </a>
        <a class="nav-card" href="#" @click.prevent="goTo('/secure/userFile')">
          <span class="nav-icon">安全共享</span>
          <span class="nav-desc">我的文件、创建分享链接、下载与删除</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup name="Index" lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goTo(path: string) {
  router.push(path);
}
</script>

<style lang="scss" scoped>
.home {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.home-header {
  text-align: center;
  padding: 32px 0 40px;
  border-bottom: 2px solid #2c5f8d;
  margin-bottom: 32px;
}

.home-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a365d;
  margin: 0 0 12px;
  letter-spacing: 1px;
}

.home-subtitle {
  font-size: 15px;
  color: #4a5568;
  margin: 0;
}

.home-intro {
  margin-bottom: 40px;
}

.home-intro h3,
.home-nav h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.intro-content p {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.7;
  color: #4a5568;
}

.intro-content p:last-child {
  margin-bottom: 0;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.nav-card {
  display: block;
  padding: 20px;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.nav-card:hover {
  border-color: #2c5f8d;
  box-shadow: 0 4px 12px rgba(44, 95, 141, 0.15);
}

.nav-icon {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1a365d;
  margin-bottom: 8px;
}

.nav-desc {
  display: block;
  font-size: 13px;
  color: #718096;
  line-height: 1.5;
}
</style>
