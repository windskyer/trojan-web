<template>
  <div :class="{ 'has-logo': false }" class="sidebar-shell">
    <el-scrollbar wrap-class="scrollbar-wrapper" class="menu-scroll">
      <el-menu :default-active="activeMenu" :collapse="isCollapse" background-color="#304156" text-color="#bfcbd9"
        :unique-opened="false" active-text-color="#409EFF" :collapse-transition="false" mode="vertical">
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
        <el-menu-item class="telegram-channel-item" index="telegram-channel" @click="openTelegramChannel">
          <svg-icon icon-class="telegram" :class-name="isCollapse ? 'telegram-icon collapsed' : 'telegram-icon'" />
          <span v-show="!isCollapse">{{ $t('sidebar.telegramChannel') }}</span>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>
    <div class="customer-entry" :class="{ collapsed: isCollapse }" @click="openTelegramBot">
      <svg-icon icon-class="customer-service" :class-name="isCollapse ? 'customer-icon collapsed' : 'customer-icon'" />
      <span v-show="!isCollapse">{{ $t('sidebar.customerService') }}</span>
    </div>
  </div>
</template>

<script>
import SidebarItem from './SidebarItem'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { userCheck } from '@/api/user'

export default {
  name: 'SidebarIndex',
  components: { SidebarItem },

  setup() {
    const appStore = useAppStore()
    const userStore = useUserStore()
    return { appStore, userStore }
  },
  data() {
    return {
      currentUserEmail: '',
      currentUsername: ''
    }
  },
  created() {
    this.loadCurrentUser()
  },

  computed: {
    sidebar() {
      return this.appStore.sidebar
    },
    routes() {
      const routes = this.$router.options.routes || []
      if (this.userStore.isAdmin) {
        return this.filterForAdmin(routes)
      }
      return this.filterForNonAdmin(routes)
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  methods: {
    encodeStartValue(value) {
      if (!value) {
        return ''
      }
      try {
        return btoa(value)
      } catch (error) {
        return ''
      }
    },
    async loadCurrentUser() {
      try {
        const result = await userCheck()
        const info = result?.data?.userinfo || result?.data || {}
        this.currentUserEmail = info.email || info.Email || ''
        this.currentUsername = info.username || info.Username || ''
      } catch (error) {
        this.currentUserEmail = ''
        this.currentUsername = ''
      }
    },
    openTelegramChannel() {
      window.open('https://t.me/trojan100', '_blank')
    },
    openTelegramBot() {
      const startParam = encodeURIComponent(this.encodeStartValue(this.currentUserEmail || ''))
      const url = startParam
        ? `https://t.me/TrojanAccess_bot?start=${startParam}`
        : 'https://t.me/TrojanAccess_bot?start'
      window.open(url, '_blank')
    },
    filterForAdmin(routes = []) {
      return routes
        .map(route => {
          const copied = { ...route }
          if (copied.children && copied.children.length > 0) {
            copied.children = copied.children.filter(child => child.meta?.isAdmin !== false)
          }
          return copied
        })
        .filter(route => {
          if (!route.children) {
            return true
          }
          return route.children.length > 0
        })
    },
    filterForNonAdmin(routes = []) {
      return routes
        .map(route => {
          const copied = { ...route }
          if (copied.children && copied.children.length > 0) {
            copied.children = copied.children.filter(child => child.meta?.isAdmin !== true)
          }
          return copied
        })
        .filter(route => {
          if (route.meta?.isAdmin === true) {
            return false
          }
          if (!route.children) {
            return true
          }
          return route.children.length > 0
        })
    }
  }
}
</script>

<style scoped>
.sidebar-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.menu-scroll {
  flex: 1;
  min-height: 0;
}

.customer-entry {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  font-size: 14px;
  height: 50px;
  line-height: 50px;
  padding: 0 20px;
  color: #bfcbd9;
  border-top: 1px solid rgba(191, 203, 217, 0.2);
  background: #304156;
  cursor: pointer;
  user-select: none;
}

.customer-entry.collapsed {
  justify-content: flex-start;
  padding: 0;
}

.customer-entry:hover {
  color: #409EFF;
}

.telegram-icon {
  margin-right: 16px;
}

.customer-icon {
  margin-right: 16px;
}

.telegram-icon.collapsed,
.customer-icon.collapsed {
  margin-left: 20px;
  margin-right: 0;
}

.telegram-channel-item {
  display: flex;
  align-items: center;
}

:deep(.el-menu--collapse .telegram-channel-item) {
  justify-content: flex-start;
  padding: 0 !important;
}
</style>
