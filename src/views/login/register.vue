<template>
    <div class="register-container">
        <el-form class="register-form" @submit.prevent>
            <div class="title-container">
                <h3 class="title">{{ $t('register') }}</h3>
            </div>

            <!-- 邮箱输入 -->
            <div class="input-row">
                <el-input
                    v-model="email"
                    :placeholder="$t('inputEmail')"
                    :disabled="codeSent"
                />
                <el-button
                    type="primary"
                    class="send-btn"
                    :loading="sending"
                    :disabled="codeSent && resendCountdown > 0"
                    @click="handleSendCode"
                >
                    <span v-if="codeSent && resendCountdown > 0">{{ resendCountdown }}s</span>
                    <span v-else>{{ $t('user.free.getCode') }}</span>
                </el-button>
            </div>

            <!-- 6位验证码输入（发送后显示） -->
            <transition name="fade">
                <div v-if="codeSent" class="code-section">
                    <p class="code-hint">{{ $t('user.free.codeSent') }}</p>
                    <div class="code-boxes">
                        <input
                            v-for="(_, i) in codeDigits"
                            :key="i"
                            :ref="el => setCodeRef(el, i)"
                            v-model="codeDigits[i]"
                            class="code-box"
                            maxlength="1"
                            inputmode="numeric"
                            @input="handleCodeInput(i, $event)"
                            @keydown="handleCodeKeydown(i, $event)"
                            @paste="handleCodePaste($event)"
                        />
                    </div>

                    <el-button
                        type="primary"
                        style="width: 100%; margin-top: 24px"
                        :loading="registering"
                        @click="handleRegister"
                    >
                        {{ $t('register') }}
                    </el-button>
                </div>
            </transition>

            <div class="extra-links">
                <router-link class="extra-link" to="/login">
                    {{ $t('verify.goLogin') }}
                </router-link>
            </div>
        </el-form>

        <!-- 注册成功弹窗 -->
        <el-dialog
            v-model="showDialog"
            center
            class="tg-dialog"
            :show-close="false"
        >
            <div class="tg-popup">
                <div class="success-icon">✓</div>
                <h3 class="tg-title">{{ $t('tgPopupTitle') }}</h3>
                <div class="tg-button-row">
                    <el-button
                        type="primary"
                        style="width: 100%"
                        :disabled="redirecting"
                        @click="goLogin"
                    >
                        {{ $t('verify.goLogin') }}
                    </el-button>
                    <p class="redirect-text">
                        {{ $t('tgRedirectNote', { countdown: dialogCountdown }) }}
                    </p>
                </div>
            </div>
        </el-dialog>

        <!-- 右下角浮动按钮 -->
        <div class="telegram-float" @click="openTelegram">
            <svg viewBox="0 0 24 24" class="icon">
                <path
                    fill="#ffffff"
                    d="M9.993 15.674l-.396 5.578c.567 0 .813-.243 1.108-.534l2.662-2.547 5.517 4.03c1.012.556 1.733.264 1.999-.935l3.63-17.01.001-.001c.312-1.455-.526-2.024-1.514-1.656L1.064 9.435c-1.408.55-1.386 1.338-.241 1.69l5.623 1.756L19.51 4.72c.617-.37 1.179-.165.717.205"
                />
            </svg>
        </div>
    </div>
</template>

<script>
import { sendCode } from '@/api/email'
import { register } from '@/api/permission'
import { useSettingsStore } from '@/store/settings'

const mailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default {
    name: 'LoginRegister',

    setup() {
        const settingsStore = useSettingsStore()
        return { settingsStore }
    },

    data() {
        return {
            email: '',
            codeSent: false,
            codeDigits: ['', '', '', '', '', ''],
            codeRefs: [],
            sending: false,
            registering: false,
            resendCountdown: 0,
            resendTimer: null,
            showDialog: false,
            dialogCountdown: 10,
            dialogTimer: null,
            redirecting: false,
        }
    },

    created() {
        document.title = this.settingsStore.docTitle
    },

    beforeUnmount() {
        clearInterval(this.resendTimer)
        clearInterval(this.dialogTimer)
    },

    methods: {
        /* ---------- 发送验证码 ---------- */
        async handleSendCode() {
            if (!mailReg.test(this.email)) {
                this.$message.error(this.$t('mailError'))
                return
            }
            this.sending = true
            try {
                const formData = new FormData()
                formData.set('email', this.email)
                const result = await sendCode(formData)
                if (result.code !== 200 || result.message !== 'success') {
                    this.$message.error(result.message || this.$t('registerFailed'))
                    return
                }
                this.codeSent = true
                this.$message.success(this.$t('user.free.codeSent'))
                this.startResendCountdown()
                this.$nextTick(() => this.codeRefs[0]?.focus())
            } catch {
                this.$message.error(this.$t('registerFailed'))
            } finally {
                this.sending = false
            }
        },

        startResendCountdown() {
            this.resendCountdown = 60
            clearInterval(this.resendTimer)
            this.resendTimer = setInterval(() => {
                if (this.resendCountdown <= 1) {
                    clearInterval(this.resendTimer)
                    this.resendCountdown = 0
                } else {
                    this.resendCountdown--
                }
            }, 1000)
        },

        /* ---------- 验证码输入框 ---------- */
        setCodeRef(el, i) {
            if (el) this.codeRefs[i] = el
        },

        handleCodeInput(index, event) {
            const val = String(event.target.value || '').replace(/\D/g, '')
            this.codeDigits[index] = val.slice(-1)
            if (val && index < 5) {
                this.codeRefs[index + 1]?.focus()
            }
        },

        handleCodeKeydown(index, event) {
            if (event.key === 'Backspace' && !this.codeDigits[index] && index > 0) {
                this.codeRefs[index - 1]?.focus()
            }
        },

        handleCodePaste(event) {
            const text = (event.clipboardData || event.originalEvent?.clipboardData)
                ?.getData('text')
                .replace(/\D/g, '')
                .slice(0, 6)
            if (!text) return
            event.preventDefault()
            text.split('').forEach((ch, i) => {
                this.codeDigits[i] = ch
            })
            const nextIndex = Math.min(text.length, 5)
            this.$nextTick(() => this.codeRefs[nextIndex]?.focus())
        },

        /* ---------- 注册 ---------- */
        async handleRegister() {
            if (!mailReg.test(this.email)) {
                this.$message.error(this.$t('mailError'))
                return
            }
            const code = this.codeDigits.join('')
            if (code.length !== 6) {
                this.$message.error(this.$t('user.free.codeInvalid'))
                return
            }
            this.registering = true
            try {
                const formData = new FormData()
                formData.set('useremail', this.email)
                formData.set('code', code)
                const result = await register(formData)
                if (result.message === 'success') {
                    this.showDialog = true
                    this.startDialogCountdown()
                } else {
                    this.$message.error(result.message || this.$t('registerFailed'))
                }
            } catch {
                this.$message.error(this.$t('registerFailed'))
            } finally {
                this.registering = false
            }
        },

        startDialogCountdown() {
            this.dialogCountdown = 10
            clearInterval(this.dialogTimer)
            this.dialogTimer = setInterval(() => {
                if (this.dialogCountdown <= 1) {
                    clearInterval(this.dialogTimer)
                    this.goLogin()
                } else {
                    this.dialogCountdown--
                }
            }, 1000)
        },

        goLogin() {
            if (this.redirecting) return
            this.redirecting = true
            this.$router.push('/login').catch(() => {})
        },

        openTelegram() {
            window.open('https://t.me/trojan100', '_blank')
        },
    },
}
</script>

<style lang="scss">
$bg: #283443;
$light_gray: #fff;

.register-container {
    .el-input {
        height: 47px;

        .el-input__wrapper {
            padding: 0;
            box-shadow: none;
            background: $bg;
            border-radius: 0;
        }

        input {
            background: $bg;
            border: 0;
            padding: 12px 5px 12px 15px;
            color: $light_gray;
            height: 47px;
            caret-color: $light_gray;

            &:-webkit-autofill {
                box-shadow: 0 0 0px 1000px $bg inset !important;
                -webkit-text-fill-color: $light_gray !important;
            }
        }
    }
}

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

    .title-container {
        .title {
            font-size: 26px;
            color: $light_gray;
            margin: 0 auto 40px;
            text-align: center;
            font-weight: bold;
        }
    }

    /* 邮箱 + 发送按钮同行 */
    .input-row {
        display: flex;
        gap: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        overflow: hidden;
        margin-bottom: 20px;

        .el-input {
            flex: 1;
        }

        .send-btn {
            flex-shrink: 0;
            height: 47px;
            border-radius: 0 5px 5px 0;
            white-space: nowrap;
        }
    }

    /* 验证码区域 */
    .code-section {
        .code-hint {
            font-size: 13px;
            color: $dark_gray;
            margin-bottom: 14px;
            text-align: center;
        }

        .code-boxes {
            display: flex;
            justify-content: center;
            gap: 10px;
        }

        .code-box {
            width: 44px;
            height: 52px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.2);
            color: $light_gray;
            font-size: 22px;
            font-weight: bold;
            text-align: center;
            outline: none;
            caret-color: transparent;
            transition: border-color 0.2s;

            &:focus {
                border-color: #409eff;
            }
        }
    }

    .extra-links {
        margin-top: 20px;
        text-align: center;

        .extra-link {
            color: #00e0ff;
            font-size: 14px;
            text-decoration: none;

            &:hover {
                text-decoration: underline;
            }
        }
    }
}

/* 淡入动效 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

/* 成功弹窗 */
.tg-popup {
    text-align: center;
    padding: 10px 10px 20px;
}

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

.tg-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #fff;
}

.tg-button-row {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.redirect-text {
    margin-top: 16px;
    font-size: 14px;
    color: #5a6d7a;
}

@keyframes popIn {
    0% { transform: scale(0.5); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

/* 右下角 Telegram 浮动按钮 */
.telegram-float {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: #229ed9;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(34, 158, 217, 0.45);
    transition: all 0.3s ease;
    z-index: 9999;

    &:hover { transform: scale(1.08); }

    .icon {
        width: 26px;
        height: 26px;
    }
}
</style>
