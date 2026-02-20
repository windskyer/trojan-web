<template>
    <div class="register-container">

        <el-form class="register-form" :model="form" :rules="registerRules" ref="form" label-position="left">
            <div class="title-container">
                <h3 class="title">{{ $t('register') }}</h3>
            </div>

            <!-- 用户名 -->
            <el-form-item prop="username">
                <span class="svg-container">
                    <svg-icon icon-class="user" />
                </span>
                <el-input v-model="form.username" :placeholder="$t('inputName')" />
            </el-form-item>

            <!-- 密码 -->
            <el-form-item prop="password1">
                <span class="svg-container">
                    <svg-icon icon-class="password" />
                </span>
                <el-input ref="password1" v-model="form.password1" :type="passwordType1"
                    :placeholder="$t('inputPass')" />

                <span class="show-pwd" @click="togglePwd(1)">
                    <svg-icon :icon-class="passwordType1 === 'password' ? 'eye' : 'eye-open'" />
                </span>

            </el-form-item>

            <!-- 再次密码 -->
            <el-form-item prop="password2">
                <span class="svg-container">
                    <svg-icon icon-class="password" />
                </span>
                <el-input ref="password2" v-model="form.password2" :type="passwordType2"
                    :placeholder="$t('inputPassAgain')" />

                <span class="show-pwd" @click="togglePwd(2)">
                    <svg-icon :icon-class="passwordType2 === 'password' ? 'eye' : 'eye-open'" />
                </span>
            </el-form-item>

            <!-- 邮箱 -->
            <el-form-item prop="useremail">
                <span class="svg-container">
                    <svg-icon icon-class="email" />
                </span>
                <el-input v-model="form.useremail" :placeholder="$t('inputEmail')" />
            </el-form-item>

            <!-- 注册按钮 -->
            <el-form-item>
                <el-button type="primary" style="width:100%;" :loading="loading" @click.prevent="register">
                    {{ $t('register') }}
                </el-button>
            </el-form-item>

        </el-form>

        <!-- 注册成功弹窗 -->
        <el-dialog v-model="showTelegramDialog" center class="tg-dialog" :show-close="false">
            <div class="tg-popup">

                <!-- 成功图标 -->
                <div class="success-icon">
                    ✓
                </div>

                <h3 class="tg-title">
                    {{ $t('tgPopupTitle') }}
                </h3>

                <p class="tg-desc">
                    {{ $t('tgPopupDesc') }}
                    <br />
                    <span class="tg-highlight">{{ $t('tgPopupNote') }}</span>
                </p>
                <!-- Telegram 按钮行 -->
                <div class="tg-button-row">

                    <!-- Telegram 主按钮 -->
                    <el-button type="primary" class="tg-common-btn" @click="handleTelegramClick('popup')">
                        {{ $t('tgJoin') }}
                    </el-button>

                    <!-- 次按钮 -->
                    <el-button type="primary" class="tg-common-btn" @click="handleLoginClick()">
                        {{ $t('tgSkip') }}
                    </el-button>
                    <p class="redirect-text">
                        {{ $t('tgRedirectNote', { countdown: countdown }) }}
                    </p>
                </div>
            </div>
        </el-dialog>


        <!-- 右下角浮动按钮 -->
        <div class="telegram-float" @click="handleTelegramClick('register')"> <svg viewBox="0 0 24 24" class="icon">
                <path fill="#ffffff"
                    d="M9.993 15.674l-.396 5.578c.567 0 .813-.243 1.108-.534l2.662-2.547 5.517 4.03c1.012.556 1.733.264 1.999-.935l3.63-17.01.001-.001c.312-1.455-.526-2.024-1.514-1.656L1.064 9.435c-1.408.55-1.386 1.338-.241 1.69l5.623 1.756L19.51 4.72c.617-.37 1.179-.165.717.205" />
            </svg>
        </div>

    </div>
</template>

<script>
import { register } from '@/api/permission'
import { trackTelegramClick } from '@/api/track'
import { useSettingsStore } from '@/store/settings'

/* ===========================
   表单校验函数（抽离）
=========================== */
const usernameReg = /^(?![^A-Za-z]+$)(?![^0-9]+$)[0-9A-Za-z_]{4,15}$/
const passwordReg = /^[a-zA-Z]\w{8,18}$/
const mailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default {
    name: 'LoginRegister',

    setup() {
        const settingsStore = useSettingsStore()
        return { settingsStore }
    },

    data() {
        return {
            form: {
                username: '',
                password1: '',
                password2: '',
                useremail: ''
            },

            registerRules: {
                username: [
                    { required: true, validator: this.validateUser, trigger: 'blur' }
                ],
                password1: [
                    { required: true, validator: this.validatePass, trigger: 'blur' }
                ],
                password2: [
                    { required: true, validator: this.validatePassAgain, trigger: 'blur' }
                ],
                useremail: [
                    { required: true, validator: this.validateMail, trigger: 'blur' }
                ]
            },

            loading: false,
            passwordType1: 'password',
            passwordType2: 'password',
            showTelegramDialog: false,
            countdown: 10
        }
    },

    computed: {
        docTitle() {
            return this.settingsStore.docTitle
        }
    },

    created() {
        document.title = this.settingsStore.docTitle
    },

    methods: {
        /* ===========================
           校验方法
        =========================== */

        validateUser(rule, value, callback) {
            if (!value || !usernameReg.test(value)) {
                callback(new Error(this.$t('userError')))
            } else {
                callback()
            }
        },

        validatePass(rule, value, callback) {
            if (!value || !passwordReg.test(value)) {
                callback(new Error(this.$t('passError')))
            } else {
                callback()
            }
        },

        validatePassAgain(rule, value, callback) {
            if (!value || !passwordReg.test(value)) {
                callback(new Error(this.$t('passError')))
            } else if (value !== this.form.password1) {
                callback(new Error(this.$t('passDifferentError')))
            } else {
                callback()
            }
        },

        validateMail(rule, value, callback) {
            if (!value || !mailReg.test(value)) {
                callback(new Error(this.$t('mailError')))
            } else {
                callback()
            }
        },

        /* ===========================
           密码显示切换
        =========================== */

        togglePwd(index) {
            const key = index === 1 ? 'passwordType1' : 'passwordType2'
            const ref = index === 1 ? 'password1' : 'password2'

            this[key] = this[key] === 'password' ? 'text' : 'password'

            this.$nextTick(() => {
                this.$refs[ref]?.focus()
            })
        },

        /* ===========================
           注册逻辑（async 重构）
        =========================== */

        async register() {
            try {
                const valid = await this.$refs.form.validate()
                if (!valid) return

                this.loading = true

                const formData = new FormData()
                formData.set('username', this.form.username)
                formData.set('password', btoa(this.form.password1))
                formData.set('useremail', this.form.useremail)

                const result = await register(formData)

                if (result.message === 'success') {
                    this.$message.success(this.$t('checkEmailActivation'))

                    // 显示弹窗

                    this.showTelegramDialog = true

                    // 开始倒计时
                    this.countdownTimer = setInterval(() => {
                        this.countdown--
                        if (this.countdown <= 0) {
                            clearInterval(this.countdownTimer)
                            this.handleLoginClick()
                        }
                    }, 1000)
                } else {
                    this.$message.error(result.message || this.$t('registerFailed'))
                }

            } catch (err) {
                console.error(err)
                this.$message.error(this.$t('registerFailed'))
            } finally {
                this.loading = false
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

        handleLoginClick() {
            this.$router.push('/login').catch(() => { })
        }
    }
}
</script>


<style lang="scss">
$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

/* reset element-ui css */
.register-container {
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

/* ===== 强制覆盖 ElementUI Dialog ===== */

.el-dialog {
    background: #243244 !important;
    border-radius: 14px;
    padding: 30px 25px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
    width: 90% !important;
    max-width: 420px !important;
}

.el-dialog__header {
    display: none !important;
}

.el-dialog__body {
    background: #243244 !important;
    padding: 0 !important;
}

.v-modal {
    background: rgba(0, 0, 0, 0.75) !important;
}
</style>


<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.register-container {
    min-height: 100%;
    width: 100%;
    background-color: $bg;
    overflow: hidden;

    .register-form {
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

    .redirect-text {
        margin-top: 20px;
        font-size: 14px;
        color: #5a6d7a;
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

.tg-popup {
    text-align: center;
    padding: 10px 10px 20px;
}

/* 成功圆形图标 */
.success-icon {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b4b61, #1f2a38);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: white;
    font-size: 34px;
    font-weight: bold;
    line-height: 70px;
    margin: 0 auto 20px;
    animation: popIn 0.4s ease-out;
}

/* 标题 */
.tg-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #fff;
}

/* 描述 */
.tg-desc {
    font-size: 14px;
    opacity: 0.8;
    margin-bottom: 25px;
    line-height: 1.6;
    color: #94a3b8;
}

/* Telegram 主按钮 */
.tg-button-row {
    display: flex;
    justify-content: center; // 水平居中
    gap: 12px; // 两个按钮之间的间距
    margin-bottom: 12px; // 按钮行与下方文本的间距
    flex-wrap: wrap; // 允许按钮在小屏幕上换行
    padding: 0 10px; // 为按钮行增加左右内边距，使其不贴边
}

/* 通用按钮样式 */
.tg-common-btn {
    width: 48%; // 设置为48%宽度，留出2%的间隙，这样两个按钮加上gap就能很好地在max-width: 420px的弹窗内显示
    max-width: 130px; // 限制每个按钮的最大宽度
    height: 45px;
    font-size: 15px;
    border-radius: 10px;
    background: linear-gradient(135deg, #2b6fa3, #1e4f73);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    color: #ffffff !important; // 确保文字颜色为白色
    transition: all 0.3s ease; // 添加过渡效果
}

.tg-common-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5); // 悬停时略微增强阴影
}

/* 动效 */
@keyframes popIn {
    0% {
        transform: scale(0.5);
        opacity: 0;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.tg-highlight {
    color: #00e0ff;
    font-weight: 500;
}
</style>
