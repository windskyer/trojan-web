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
                <el-input :type="pwdType" v-model="form.password1" :placeholder="$t('inputPass')" show-password />
            </el-form-item>

            <!-- 再次密码 -->
            <el-form-item prop="password2">
                <span class="svg-container">
                    <svg-icon icon-class="password" />
                </span>
                <el-input :type="pwdType" v-model="form.password2" :placeholder="$t('inputPassAgain')" show-password
                    @keyup.enter="register" />
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
        <el-dialog v-model:visible="showTelegramDialog" width="400px" center>
            <div class="tg-popup">
                <svg-icon icon-class="telegram" />
                <h3>{{ $t('tgPopupTitle') }}</h3>
                <p>{{ $t('tgPopupDesc') }}</p>

                <el-button type="primary" style="width:100%;margin-top:15px" @click="handleTelegramClick('popup')">
                    {{ $t('tgJoin') }}
                </el-button>
            </div>
        </el-dialog>

        <!-- 右下角浮动按钮 -->
        <div class="telegram-float" @click="handleTelegramClick('float')">
            <svg-icon icon-class="telegram" />
        </div>

    </div>
</template>

<script>
import { mapState } from 'vuex'
import { register } from '@/api/permission'
import { trackTelegramClick } from '@/api/track'


export default {
    name: 'LoginRegister',

    data() {

        const validateUser = (rule, value, callback) => {
            const reg = /^(?![^A-Za-z]+$)(?![^0-9]+$)[0-9A-Za-z_]{4,15}$/;
            if (!value || !reg.test(value)) {
                callback(new Error(this.$t('userError')))
            } else {
                callback()
            }
        }

        const validatePass = (rule, value, callback) => {
            const reg = /^[a-zA-Z]\w{8,18}$/;
            if (!value || !reg.test(value)) {
                callback(new Error(this.$t('passError')))
            } else {
                callback()
            }
        }

        const validateMail = (rule, value, callback) => {
            const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!value || !reg.test(value)) {
                callback(new Error(this.$t('mailError')))
            } else {
                callback()
            }
        }

        return {
            form: {
                username: '',
                password1: '',
                password2: '',
                useremail: ''
            },
            registerRules: {
                username: [{ required: true, validator: validateUser, trigger: 'blur' }],
                password1: [{ required: true, validator: validatePass, trigger: 'blur' }],
                password2: [{ required: true, validator: validatePass, trigger: 'blur' }],
                useremail: [{ required: true, validator: validateMail, trigger: 'blur' }]
            },
            loading: false,
            pwdType: 'password',
            showTelegramDialog: false
        }
    },

    computed: {
        ...mapState(['docTitle'])
    },

    created() {
        document.title = this.docTitle
    },

    methods: {

        async register() {

            this.$refs.form.validate(async (valid) => {

                if (!valid) return

                if (this.form.password1 !== this.form.password2) {
                    this.$message.error(this.$t('passDifferentError'))
                    return
                }

                const formData = new FormData()
                formData.set('username', this.form.username)
                formData.set('password', btoa(this.form.password1))
                formData.set('useremail', this.form.useremail)

                this.loading = true

                const result = await register(formData)

                if (result.Msg === 'success') {

                    this.$message.success(this.$t('checkEmailActivation'))

                    setTimeout(() => {
                        this.showTelegramDialog = true
                    }, 1000)

                    setTimeout(() => {
                        this.$router.replace('/login').catch(() => { })
                    }, 8000)

                } else {
                    this.$message.error(result.Msg || this.$t('registerFailed'))
                }

                this.loading = false
            })
        },

        async handleTelegramClick(source) {

            // 异步统计
            trackTelegramClick({
                channel: 'trojan100',
                source: source,
                user_agent: navigator.userAgent
            }).catch(() => { })

            window.open(
                `https://t.me/@trojan100`,
                '_blank'
            )
        }

    }
}
</script>

<style lang="scss" scoped>
.telegram-float {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 55px;
    height: 55px;
    border-radius: 50%;
    background: #0088cc;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(0, 136, 204, 0.4);
    transition: all 0.3s ease;
    z-index: 999;
}

.telegram-float:hover {
    transform: scale(1.1);
}

.tg-popup {
    text-align: center;
}

.tg-popup h3 {
    margin-top: 15px;
    font-size: 18px;
}

.tg-popup p {
    font-size: 14px;
    opacity: 0.8;
}
</style>
