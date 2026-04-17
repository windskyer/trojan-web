<template>
    <div class="reset-container">
        <el-form class="reset-form" @submit.prevent>
            <div class="title-container">
                <h3 class="title">{{ $t('resetPassword.title') }}</h3>
                <p class="subtitle">{{ $t('resetPassword.subtitle') }}</p>
            </div>

            <!-- token 无效 -->
            <div v-if="tokenInvalid" class="invalid-token">
                <p class="invalid-msg">
                    {{ $t('resetPassword.tokenInvalid') }}
                </p>
                <router-link class="extra-link" to="/login">
                    {{ $t('verify.goLogin') }}
                </router-link>
            </div>

            <!-- 表单 -->
            <template v-else>
                <el-form-item :class="{ 'is-error': passwordFormatError }">
                    <span class="svg-container">
                        <svg-icon icon-class="password" />
                    </span>
                    <el-input
                        ref="password"
                        v-model="form.password"
                        :type="showPass ? 'text' : 'password'"
                        :placeholder="$t('resetPassword.newPassword')"
                        @keyup.enter="handleSubmit"
                    />
                    <span class="show-pwd" @click="showPass = !showPass">
                        <svg-icon :icon-class="showPass ? 'eye-open' : 'eye'" />
                    </span>
                </el-form-item>
                <p v-if="passwordFormatError" class="field-tip error-tip">
                    {{ $t('passError') }}
                </p>
                <p v-else class="field-tip hint-tip">
                    {{ $t('resetPassword.passwordHint') }}
                </p>

                <el-form-item :class="{ 'is-error': passwordMismatch }">
                    <span class="svg-container">
                        <svg-icon icon-class="password" />
                    </span>
                    <el-input
                        v-model="form.confirmPassword"
                        :type="showConfirm ? 'text' : 'password'"
                        :placeholder="$t('resetPassword.confirmPassword')"
                        @keyup.enter="handleSubmit"
                    />
                    <span class="show-pwd" @click="showConfirm = !showConfirm">
                        <svg-icon
                            :icon-class="showConfirm ? 'eye-open' : 'eye'"
                        />
                    </span>
                </el-form-item>
                <p v-if="passwordMismatch" class="field-tip error-tip">
                    {{ $t('passDifferentError') }}
                </p>

                <el-button
                    type="primary"
                    style="width: 100%; margin-bottom: 20px; margin-left: 0"
                    :loading="loading"
                    :disabled="!canSubmit"
                    @click="handleSubmit"
                >
                    {{ $t('resetPassword.submit') }}
                </el-button>

                <div class="extra-links">
                    <router-link class="extra-link" to="/login">
                        {{ $t('verify.goLogin') }}
                    </router-link>
                </div>
            </template>
        </el-form>
    </div>
</template>

<script>
import { resetPasswordByToken } from '@/api/email'
import { useSettingsStore } from '@/store/settings'

export default {
    name: 'ResetPassword',

    setup() {
        const settingsStore = useSettingsStore()
        return { settingsStore }
    },

    data() {
        return {
            token: '',
            tokenInvalid: false,
            form: {
                password: '',
                confirmPassword: '',
            },
            showPass: false,
            showConfirm: false,
            loading: false,
        }
    },

    computed: {
        passwordFormatError() {
            if (!this.form.password) return false
            return !/^[a-zA-Z]\w{7,17}$/.test(this.form.password)
        },
        passwordMismatch() {
            return (
                this.form.confirmPassword.length > 0 &&
                this.form.confirmPassword !== this.form.password
            )
        },
        canSubmit() {
            return (
                !this.passwordFormatError &&
                this.form.password.length > 0 &&
                this.form.password === this.form.confirmPassword
            )
        },
    },

    created() {
        document.title = this.settingsStore.docTitle
        this.token = this.$route.query.token || ''
        if (!this.token) {
            this.tokenInvalid = true
        }
    },

    mounted() {
        this.$refs.password?.focus()
    },

    methods: {
        async handleSubmit() {
            if (!this.canSubmit) return
            if (this.form.password !== this.form.confirmPassword) {
                this.$message.error(this.$t('passDifferentError'))
                return
            }
            this.loading = true
            try {
                const formData = new FormData()
                formData.set('token', this.token)
                formData.set('password', btoa(this.form.password))
                const result = await resetPasswordByToken(formData)
                if (result.message === 'success') {
                    this.$message.success(this.$t('resetPassword.success'))
                    setTimeout(() => {
                        this.$router.replace('/login').catch()
                    }, 1500)
                } else {
                    this.$message.error(result.message || this.$t('resetPassword.failed'))
                }
            } catch {
                // error handled by request interceptor
            } finally {
                this.loading = false
            }
        },
    },
}
</script>

<style lang="scss">
$bg: #283443;
$light_gray: #fff;

.reset-container {
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
            border: 0;
            appearance: none;
            -webkit-appearance: none;
            border-radius: 0;
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

.reset-container {
    min-height: 100%;
    width: 100%;
    background-color: $bg;
    overflow: hidden;

    .reset-form {
        position: relative;
        width: 520px;
        max-width: 100%;
        padding: 160px 35px 0;
        margin: 0 auto;
        overflow: hidden;
    }

    .title-container {
        margin-bottom: 40px;
        text-align: center;

        .title {
            font-size: 26px;
            color: $light_gray;
            margin: 0 0 10px;
            font-weight: bold;
        }

        .subtitle {
            font-size: 13px;
            color: $dark_gray;
            margin: 0;
            line-height: 1.6;
        }
    }

    .svg-container {
        padding: 6px 5px 6px 15px;
        color: $dark_gray;
        vertical-align: middle;
        width: 30px;
        display: inline-block;
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

    .field-tip {
        margin: -14px 0 14px;
        font-size: 12px;
        line-height: 1.5;
    }

    .error-tip {
        color: #f56c6c;
    }
    .hint-tip {
        color: $dark_gray;
    }

    .el-form-item.is-error {
        border-color: rgba(245, 108, 108, 0.5);
    }

    .invalid-token {
        text-align: center;
        padding: 20px 0;

        .invalid-msg {
            color: #f56c6c;
            font-size: 14px;
            margin-bottom: 20px;
        }
    }

    .extra-links {
        text-align: center;
    }

    .extra-link {
        color: #00e0ff;
        font-size: 14px;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
}
</style>
