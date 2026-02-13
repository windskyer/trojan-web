<template>
    <div class="fail-container">
        <div class="fail-card">
            <div class="icon-container">
                <el-icon :size="64" color="#f56c6c">
                    <CircleCloseFilled />
                </el-icon>
            </div>
            <h2 class="title">{{ $t('verify.failTitle') }}</h2>
            <p class="description">
                {{ $t('verify.failDescription') }}
            </p>

            <div class="action-buttons">
                <el-button type="primary" style="width:100%;" @click="goLogin">
                    {{ $t('verify.goLogin') }}
                </el-button>
                <p class="retry-text">
                    {{ $t('verify.retryNote') }}
                </p>
            </div>
        </div>
    </div>
</template>

<script>
// 如果你使用的是 Element Plus，需要引入图标
import { CircleCloseFilled } from '@element-plus/icons-vue'

export default {
    name: 'VerifyFail',
    components: {
        CircleCloseFilled
    },
    methods: {
        goLogin() {
            this.$router.replace('/login').catch(() => { })
        }
    },
    mounted() {
        // 5秒后自动跳转到登录页
        setTimeout(() => {
            this.goLogin()
        }, 5000)
    }
}
</script>

<style lang="scss" scoped>
$bg: #2d3a4b; // 保持与你的 Login.vue 背景色一致
$light_gray: #eee;

.fail-container {
    min-height: 100%;
    width: 100%;
    background-color: $bg;
    display: flex;
    justify-content: center;
    align-items: center;

    .fail-card {
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

    .retry-text {
        margin-top: 20px;
        font-size: 14px;
        color: #5a6d7a;
    }
}
</style>
