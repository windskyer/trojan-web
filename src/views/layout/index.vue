<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <sidebar class="sidebar-container" />
    <div class="main-container">
      <div :class="{ 'fixed-header': true }">
        <navbar />
      </div>
      <app-main />
    </div>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain } from './components'
import ResizeMixin from './mixin/ResizeHandler'
import { useSettingsStore } from '@/store/settings'
import { useAppStore } from '@/store/app'

export default {
  name: 'IndexLayout',
  components: {
    Navbar,
    Sidebar,
    AppMain
  },
  setup() {
    const settingsStore = useSettingsStore()
    const appStore = useAppStore()
    return {
      settingsStore,
      appStore
    }
  },
  mixins: [ResizeMixin],
  computed: {
    sidebar() {
      return this.appStore.sidebar
    },
    device() {
      return this.appStore.device
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
  mounted() {
    this.setDialogWidth()
    window.onresize = () => {
      this.setDialogWidth()
    }
  },
  methods: {
    handleClickOutside() {
      this.appStore.closeSideBar(false)
    },
    setDialogWidth() {
      const clientWidth = document.body.clientWidth
      if (clientWidth < 600) {
        this.dialogWidth = '80%'
      } else if (clientWidth >= 600 && clientWidth < 1000) {
        this.dialogWidth = '50%'
      } else {
        this.dialogWidth = '25%'
      }
      this.settingsStore.setDialogWidth(this.dialogWidth)
    }
  }
}
</script>

<style lang="scss" scoped>
@use "@/styles/mixin.scss" as *;
@use "@/styles/variables.scss" as *;

.app-wrapper {
  // @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px)
}

.mobile .fixed-header {
  width: 100%;
}
</style>
