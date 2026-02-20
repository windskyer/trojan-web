<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" class="login-form" autocomplete="on" label-position="left">

      <div class="title-container">
        <h3 class="title"> {{ title }} </h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input ref="username" v-model="loginForm.username" placeholder="Username" name="username" type="text"
          tabindex="1" auto-complete="on" />
      </el-form-item>

      <el-tooltip v-model:visible="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input :key="passwordType" ref="password" v-model="loginForm.password" :type="passwordType"
            placeholder="Password" name="password" tabindex="2" auto-complete="on" @keyup="checkCapslock"
            @blur="capsTooltip = false" @keyup.enter="handleLogin" />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-tooltip>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;margin-left:0px"
        @click.prevent="handleLogin">
        {{ $t('login') }}
      </el-button>
      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;margin-left:0px"
        @click.prevent="register">
        {{ $t('register') }}
      </el-button>

    </el-form>

    <!-- 右下角浮动按钮 -->
    <div class="telegram-float" @click="handleTelegramClick('login')"> <svg viewBox="0 0 24 24" class="icon">
        <path fill="#ffffff"
          d="M9.993 15.674l-.396 5.578c.567 0 .813-.243 1.108-.534l2.662-2.547 5.517 4.03c1.012.556 1.733.264 1.999-.935l3.63-17.01.001-.001c.312-1.455-.526-2.024-1.514-1.656L1.064 9.435c-1.408.55-1.386 1.338-.241 1.69l5.623 1.756L19.51 4.72c.617-.37 1.179-.165.717.205" />
      </svg>
    </div>
  </div>
</template>

<script>
import CryptoJS from 'crypto-js'
import { check, login } from '@/api/permission'
import { trackTelegramClick } from '@/api/track'
import { useSettingsStore } from '@/store/settings'
import { useUserStore } from '@/store/user'

export default {
  name: 'IndexLogin',

  setup() {
    const settingsStore = useSettingsStore()
    const userStore = useUserStore()
    return {
      settingsStore,
      userStore
    }
  },

  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loading: false,
      capsTooltip: false,
      passwordType: 'password',
      title: ''
    }
  },
  created() {
    document.title = this.settingsStore.docTitle
    this.title = this.settingsStore.docTitle
    check().then((res) => {
      if (res.code === 201) {
        this.$router.replace('/register').catch()
      } else {
        document.title = res.data.title
        this.title = res.data.title
        this.settingsStore.setDocTitle(res.data.title)
      }
    })
  },
  computed: {
    docTitle() {
      return this.settingsStore.docTitle
    }
  },
  mounted() {
    this.$refs.password.focus()
  },
  methods: {
    register() {
      this.$router.push('/register').catch()
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    async handleLogin() {
      if (this.loginForm.username === '' || this.loginForm.password === '') {
        this.$message.error(this.$t('inputNotNull'))
        return
      }
      const loginInfo = Object.assign({}, this.loginForm)
      loginInfo.password = CryptoJS.SHA224(this.loginForm.password).toString()
      try {
        const data = await login(loginInfo)
        const token = data.token
        let isAdmin = false
        if (this.loginForm.username === 'admin') {
          isAdmin = true
        }
        this.userStore.setIsAdmin(isAdmin)
        this.userStore.setToken(token)

        this.$router.replace(isAdmin ? '/' : '/user/info').catch()
      } catch (error) {
        // 假设后端返回 403 代表邮箱未验证
        if (error.response && error.response.status === 403) {
          this.$alert(this.$t('emailNotVerified'), this.$t('Tip'), {
            confirmButtonText: this.$t('Sure'),
            type: 'warning'
          })
        }
      }
    },
    /* ===========================
      Telegram 统计 + 跳转
      =========================== */
    async handleTelegramClick(source) {
      trackTelegramClick({
        channel: 'trojan100',
        source,
        user_agent: navigator.userAgent
      }).catch(() => { })

      // 注意不要带 @
      window.open('https://t.me/trojan100', '_blank')
    },
  }
}
</script>

<style lang="scss">
$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

/* reset element-ui css */
.login-container {
  .el-input {
    height: 47px;
    width: 92%;
    position: static;

    .el-input__wrapper {
      padding: 0;
      box-shadow: none;
    }

    input {
      background: $bg;
      border: 0px;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;

      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}

.telegram-float {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #229ED9; // 官方 TG 蓝 
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(34, 158, 217, 0.45);
  transition: all 0.3s ease;
  z-index: 9999;
}

.telegram-float:hover {
  transform: scale(1.08);
}

.telegram-float .icon {
  width: 26px;
  height: 26px;
}
</style>
