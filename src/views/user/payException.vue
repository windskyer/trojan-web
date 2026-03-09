<template>
    <div class="pay-exception-page">
        <div class="pay-exception-card">
            <h1>{{ $t('user.payException.title') }}</h1>
            <p class="desc">{{ $t('user.payException.desc') }}</p>
            <p v-if="loading" class="desc">{{ $t('user.pay.loading') }}</p>
            <p v-else-if="error" class="desc error">{{ error }}</p>
            <p v-else class="status-line">
                <span class="label">{{ $t('user.pay.orderStatus') }}：</span>
                <span class="status-badge">{{ statusText }}</span>
            </p>
            <p v-if="!loading && orderName" class="order-line">
                <span class="label">{{ $t('user.pay.orderName') }}：</span>
                <span>{{ orderName }}</span>
            </p>
            <p v-if="!loading && showRepurchase" class="repurchase-tip">
                {{ $t('user.payException.repurchaseTip') }}
            </p>
            <div v-if="!loading" class="actions">
                <a
                    v-if="showSupport"
                    class="btn action-btn"
                    :href="supportLink"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {{ $t('user.pay.sendProof') }}
                </a>
                <a
                    v-if="showRepurchase"
                    class="btn action-btn"
                    :href="repurchaseLink"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {{ $t('user.payException.repurchase') }}
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import { orderInfo } from '@/api/user'

export default {
    name: 'PayException',
    data() {
        return {
            supportLink: 'https://t.me/TrojanAccess_bot',
            loading: false,
            error: '',
            status: '',
        }
    },
    computed: {
        orderName() {
            return String(this.$route.query.order || '').trim()
        },
        statusText() {
            const map = {
                fail: this.$t('user.pay.status.fail'),
                expired: this.$t('user.pay.status.expired'),
                refunded: this.$t('user.pay.status.refunded'),
            }
            return map[this.status] || this.status || '-'
        },
        showRepurchase() {
            return ['expired', 'refunded'].includes(this.status)
        },
        showSupport() {
            return this.status === 'fail'
        },
        repurchaseLink() {
            return 'https://t.me/TrojanAccess_bot?start=YnV5'
        },
    },
    created() {
        this.fetchStatus()
    },
    watch: {
        '$route.fullPath'() {
            this.fetchStatus()
        },
    },
    methods: {
        isSuccess(result) {
            if (!result) return false
            return result.message === 'success'
        },
        async fetchStatus() {
            if (!this.orderName) {
                this.$router.replace('/login').catch(() => {})
                return
            }
            this.loading = true
            this.error = ''
            try {
                const result = await orderInfo(this.orderName)
                if (!this.isSuccess(result)) {
                    this.error =
                        result?.message || this.$t('user.pay.fetchOrderFail')
                    return
                }
                const status = String(result?.data?.status || '').toLowerCase()
                this.status = status
                if (status === 'pending') {
                    this.$router
                        .replace(`/pay/${encodeURIComponent(this.orderName)}`)
                        .catch(() => {})
                    return
                }
                if (status === 'success') {
                    this.$router.replace('/login').catch(() => {})
                    return
                }
            } catch (error) {
                this.error = this.$t('user.pay.fetchOrderFail')
            } finally {
                this.loading = false
            }
        },
    },
}
</script>

<style scoped>
.pay-exception-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background-color: #2d3a4b;
}

.pay-exception-card {
    width: 100%;
    max-width: 560px;
    padding: 24px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
}

h1 {
    margin: 0 0 10px;
}

.desc {
    margin: 0 0 16px;
    color: #475467;
}

.desc.error {
    color: #b42318;
}

.status-line,
.order-line {
    margin: 8px 0;
    color: #1f2937;
}

.label {
    font-weight: 700;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    background: #fef3f2;
    color: #b42318;
    font-weight: 700;
    font-size: 12px;
}

.actions {
    margin-top: 18px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.btn {
    border: 1px solid #d0d5dd;
    background: #fff;
    color: #344054;
    border-radius: 8px;
    height: 36px;
    padding: 0 14px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.repurchase-tip {
    margin: 12px 0 0;
    color: #b54708;
    font-weight: 600;
}

.action-btn {
    border-color: #16a34a;
    background: #16a34a;
    color: #fff;
}

.action-btn:hover {
    background: #15803d;
    border-color: #15803d;
}
</style>
