<template>
    <div class="register-container">
        <el-form class="register-form" :model="form" :rules="registerRules" ref="form" label-position="left">
            <div class="title-container">
                <h3 class="title">{{ $t('registerUser') }}</h3>
            </div>
            <el-form-item prop="username">
                <span class="svg-container">
                    <svg-icon icon-class="user" />
                </span>
                <el-input ref="username" name="username" type="text" v-model="form.username"
                    :placeholder="$t('inputName')" />
            </el-form-item>
            <el-form-item prop="password1">
                <span class="svg-container">
                    <svg-icon icon-class="password" />
                </span>
                <el-input name="password1" :type="pwdType" v-model="form.password1" :placeholder="$t('inputPass')"
                    show-password />
            </el-form-item>
            <el-form-item prop="password2">
                <span class="svg-container">
                    <svg-icon icon-class="password"></svg-icon>
                </span>
                <el-input name="password2" :type="pwdType" @keyup.enter="register" v-model="form.password2"
                    :placeholder="$t('inputPassAgain')" show-password />
            </el-form-item>
            <el-form-item prop="useremail">
                <span class="svg-container">
                    <svg-icon icon-class="email" />
                </span>
                <el-input ref="useremail" name="useremail" type="text" v-model="form.useremail"
                    :placeholder="$t('inputEmail')" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" style="width:100%;" :loading="loading" @click.prevent="register">
                    {{ $t('register') }}
                </el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { registerUser } from '@/api/permission'
export default {
    name: 'LoginRegister',
    data() {
        const validateUser = (rule, value, callback) => {
            const reg = /^(?![^A-Za-z]+$)(?![^0-9]+$)[0-9A-Za-z_]{4,15}$/;
            if (value.length < 4) {
                callback(new Error(this.$t('userError')))
            } else if (!reg.test(value)) {
                callback(new Error(this.$t('userError')))
            } else {
                callback()
            }
        }
        const validatePass = (rule, value, callback) => {
            const reg = /^[a-zA-Z]\w{8,18}$/;
            if (value.length < 8) {
                callback(new Error(this.$t('passError')))
            } else if (!reg.test(value)) {
                callback(new Error(this.$t('passError')))
            } else {
                callback()
            }
        }
        const validateMail = (rule, value, callback) => {
            const reg = /^(([a-zA-Z0-9_.-]+)@([a-zA-Z0-9_.-]+)\.([a-zA-Z]{2,5}){1,25})$/
            if (!value) {
                callback(new Error(this.$t('mailError')))
            } else if (!reg.test(value)) {
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
                username: [
                    { required: true, trigger: 'blur', validator: validateUser }
                ],
                password1: [
                    { required: true, trigger: 'blur', validator: validatePass }
                ],
                password2: [
                    { required: true, trigger: 'blur', validator: validatePass }
                ],
                useremail: [
                    { required: true, trigger: 'blur', validator: validateMail }
                ]
            },
            loading: false,
            pwdType: 'password'
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
                const result = await registerUser(formData)
                if (result.code === 200 && result.Msg === 'success') {
                    this.$message.success(this.$t('registerSuccess'))
                    this.$router.replace('/login').catch()
                } else {
                    this.$message.error(result.Msg || this.$t('registerFailed'))
                }
                this.loading = false
            })
        }
    }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

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

        .el-input__suffix {
            background: $bg;
        }

        input {
            background: $bg;
            border: 0px;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
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
}
</style>
