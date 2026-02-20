<template>
    <div class="success-container">
        <div class="success-card">
            <div class="icon-container">
                <el-icon :size="64" color="#67C23A">
                    <CircleCheckFilled />
                </el-icon>
            </div>
            <h2 class="title">{{ $t('verify.successTitle') }}</h2>
            <p class="description">
                {{ $t('verify.successDescription') }}
            </p>

            <div class="action-buttons">
                <el-button type="primary" style="width:100%;" :disabled="redirecting" @click="goTelegram">
                    {{ $t('verify.goTelegram') }}
                </el-button>
                <p class="redirect-text">
                    {{ $t('verify.redirectNote', { countdown: countdown }) }}
                </p>
            </div>
        </div>

        <!-- 右下角浮动按钮 (与 verifyFail.vue 保持一致) -->
        <div class="telegram-float" @click="handleTelegramClick('verify_success')">
            <svg viewBox="0 0 24 24" class="icon">
                <path fill="#ffffff"
                    d="M9.993 15.674l-.396 5.578c.567 0 .813-.243 1.108-.534l2.662-2.547 5.517 4.03c1.012.556 1.733.264 1.999-.935l3.63-17.01.001-.001c.312-1.455-.526-2.024-1.514-1.656L1.064 9.435c-1.408.55-1.386 1.338-.241 1.69l5.623 1.756L19.51 4.72c.617-.37 1.179-.165.717.205" />
            </svg>
        </div>
    </div>
</template>

<script>
import { CircleCheckFilled } from '@element-plus/icons-vue'
import { trackTelegramClick, verifyToken } from '@/api/track'

export default {
    name: 'VerifySuccess',

    components: {
        CircleCheckFilled
    },

    data() {
        return {
            countdown: 5,
            timer: null,
            redirecting: false
        }
    },

    computed: {
        token() {
            return this.$route.query.token || ''
        }
    },

    created() {
        this.verify()
    },

    beforeMount() {
        this.clearTimer()
    },

    methods: {

        /* ---------------------------
         * 验证 token
         * --------------------------- */
        async verify() {
            if (!this.token) {
                this.$message.error(this.$t('verify.invalidToken'))
                return
            }

            try {
                const result = await verifyToken(this.token)

                if (result.message === 'success') {
                    this.$message.success({
                        message: this.$t('verify.successMsg'),
                        duration: 3000
                    })

                    this.startCountdown()
                } else {
                    this.$message.error(
                        result.message || this.$t('verify.invalidToken')
                    )
                }

            } catch (e) {
                this.$message.error(this.$t('verify.invalidToken'))
            }
        },

        /* ---------------------------
         * 倒计时
         * --------------------------- */
        startCountdown() {
            this.clearTimer()

            this.timer = setInterval(() => {
                if (this.countdown <= 1) {
                    this.clearTimer()
                    this.safeRedirect(this.goLogin)
                } else {
                    this.countdown--
                }
            }, 1000)
        },

        clearTimer() {
            if (this.timer) {
                clearInterval(this.timer)
                this.timer = null
            }
        },

        /* ---------------------------
         * 统一跳转控制（防重复）
         * --------------------------- */
        safeRedirect(callback) {
            if (this.redirecting) return
            this.redirecting = true
            callback()
        },

        goTelegram() {
            this.safeRedirect(() => {
                window.location.href =
                    `https://t.me/TrojanAccess_bot?start=${this.token}`
            })
        },

        goLogin() {
            this.safeRedirect(() => {
                this.$router.replace('/login').catch(() => { })
            })
        },

        /* ---------------------------
         * TG 浮动按钮点击
         * --------------------------- */
        handleTelegramClick(source) {
            const formData = new FormData()
            formData.set('channel', 'trojan100')
            formData.set('source', source)
            formData.set('lang', this.$i18n.locale)
            formData.set('user_agent', navigator.userAgent)

            trackTelegramClick(formData)

            window.open(
                'https://t.me/trojan100',
                '_blank'
            )
        }
    }
}
</script>


<style lang="scss" scoped>
$bg: #2d3a4b; // 保持与你的 Login.vue 和 verifyFail.vue 背景色一致
$light_gray: #eee;

.success-container {
    min-height: 100%;
    width: 100%;
    background-color: $bg;
    display: flex;
    justify-content: center;
    align-items: center;

    .success-card {
        width: 520px;
        max-width: 100%;
        padding: 40px 35px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        text-align: center;
    }

    .icon-container {
        margin-bottom: 20px;
    }

    .title {
        font-size: 26px;
        color: $light_gray;
        margin-bottom: 20px;
        font-weight: bold;
    }

    .description {
        font-size: 16px;
        color: #889aa4;
        line-height: 1.6;
        margin-bottom: 40px;
    }

    .redirect-text {
        color: #409EFF;
        font-weight: 500;
    }
}

// Telegram 浮动按钮的样式与 verifyFail.vue 完全相同
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