<template>
    <div class="pay-page">
        <div class="pay-container">
            <div class="card">
                <h2>{{ $t('user.free.planListTitle') }}</h2>
                <div class="divider"></div>

                <p class="subtitle">{{ $t('user.info.email') }}</p>
                <el-input
                    v-model="email"
                    type="email"
                    disabled
                    :placeholder="$t('user.free.planEmailPlaceholder')"
                />
                <p class="hint-text">
                    {{ $t('user.free.planEmailTip') }}
                </p>

                <div class="divider"></div>

                <div v-if="paidPlans.length > 0" class="plan-grid">
                    <div
                        v-for="plan in paidPlans"
                        :key="plan.name"
                        class="plan-card"
                        @click="openPlanDialog(plan)"
                    >
                        <p class="plan-label">{{ getPlanLabel(plan) }}</p>
                        <p v-if="getPlanDescription(plan)" class="plan-desc">
                            {{ getPlanDescription(plan) }}
                        </p>
                        <p class="plan-price">
                            ¥{{ formatPlanPrice(plan.price) }}
                        </p>
                        <p>
                            {{ $t('user.free.planDuration') }}:
                            {{ plan.duration_days }} {{ $t('user.days') }}
                        </p>
                        <p>
                            {{ $t('user.free.planTraffic') }}:
                            {{ plan.total_data_gb }}GB
                        </p>
                    </div>
                </div>
                <p v-else class="empty-text">
                    {{ $t('user.free.emptyPlans') }}
                </p>
            </div>
        </div>

        <el-dialog
            class="plan-dialog"
            :title="
                selectedPlan
                    ? getPlanLabel(selectedPlan)
                    : $t('user.free.planListTitle')
            "
            v-model="planDialogVisible"
            :width="planDialogWidth"
            :show-close="true"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
        >
            <div v-if="selectedPlan" class="plan-dialog-content">
                <p class="plan-dialog-price">
                    ¥{{ formatPlanPrice(selectedPlan.price) }}
                </p>

                <template v-if="!planOrderCreated">
                    <div class="plan-input-row">
                        <el-input
                            v-model="email"
                            type="email"
                            :placeholder="$t('user.free.planEmailPlaceholder')"
                            disabled
                        />
                        <el-button
                            type="primary"
                            class="plan-send-btn"
                            :disabled="planCodeSent && planResendCountdown > 0"
                            @click="handleGetPlanCode"
                        >
                            <span v-if="planCodeSent && planResendCountdown > 0"
                                >{{ planResendCountdown }}s</span
                            >
                            <span v-else>{{ $t('user.free.getCode') }}</span>
                        </el-button>
                    </div>
                    <p class="plan-dialog-tip">
                        {{ $t('user.free.planEmailTip') }}
                    </p>
                    <transition name="plan-fade">
                        <div v-if="planCodeSent" class="plan-code-section">
                            <div class="plan-code-row">
                                <input
                                    v-for="(_, index) in planCodeDigits"
                                    :key="`plan-code-${index}`"
                                    :ref="setPlanCodeRef"
                                    v-model="planCodeDigits[index]"
                                    class="plan-code-input"
                                    type="text"
                                    inputmode="numeric"
                                    maxlength="1"
                                    @input="handlePlanCodeInput(index, $event)"
                                    @keydown="
                                        handlePlanCodeKeydown(index, $event)
                                    "
                                    @paste="handlePlanCodePaste($event)"
                                />
                            </div>
                            <el-button
                                type="primary"
                                class="plan-submit-btn"
                                :disabled="!isPlanCodeComplete"
                                @click="handleCreatePlanOrder"
                            >
                                {{ $t('user.free.createOrder') }}
                            </el-button>
                        </div>
                    </transition>
                </template>

                <template v-else>
                    <div v-if="orderPollingState === 'pending'">
                        <div class="plan-order-status">
                            <div
                                v-if="selectedPlanImage"
                                class="plan-dialog-qrcode"
                            >
                                <img
                                    class="plan-dialog-image"
                                    :src="selectedPlanImage"
                                    :alt="getPlanLabel(selectedPlan)"
                                />
                            </div>
                            <div class="order-checking-row">
                                <span class="plan-order-spinner"></span>
                                <span>{{ $t('user.free.orderChecking') }}</span>
                            </div>
                            <p>{{ $t('user.free.paymentNote') }}</p>
                            <span
                                class="copy-value"
                                @click="copyText(orderName)"
                                >{{ orderName }}</span
                            >
                            <p>{{ $t('user.free.clickToCopyNote') }}</p>
                        </div>
                    </div>
                    <div
                        v-else-if="
                            orderPollingState === 'success' ||
                            orderPollingState === 'paid'
                        "
                        class="plan-order-status plan-success"
                    >
                        <div class="plan-success-icon">✓</div>
                        <p class="plan-success-title">
                            {{ $t('user.free.paySuccessTitle') }}
                        </p>
                        <p class="plan-success-desc">
                            {{ $t('user.free.paySuccessSent') }}
                            <strong>{{ email }}</strong>
                        </p>
                        <div class="plan-success-meta">
                            <p>{{ $t('user.free.paymentNote') }}</p>
                            <span
                                class="copy-value"
                                @click="copyText(orderName)"
                                >{{ orderName }}</span
                            >
                            <p>{{ $t('user.free.clickToCopyNote') }}</p>
                        </div>
                        <div class="plan-success-steps">
                            <p class="plan-success-steps-title">
                                {{ $t('user.free.paySuccessStepTitle') }}
                            </p>
                            <ol class="plan-success-steps-list">
                                <li>{{ $t('user.free.paySuccessStep1') }}</li>
                                <li>
                                    {{ $t('user.free.paySuccessStep2Prefix') }}
                                    <router-link
                                        class="inline-link"
                                        to="/login"
                                    >
                                        {{
                                            $t('user.free.paySuccessStep2Link')
                                        }}
                                    </router-link>
                                    {{ $t('user.free.paySuccessStep2Suffix') }}
                                </li>
                                <li>
                                    {{ $t('user.free.paySuccessStep3Prefix') }}
                                    <a
                                        class="inline-link"
                                        :href="supportBotLink"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {{
                                            $t('user.free.paySuccessStep3Link')
                                        }}
                                    </a>
                                    {{ $t('user.free.paySuccessStep3Suffix') }}
                                </li>
                            </ol>
                        </div>
                        <div class="plan-success-actions">
                            <el-button
                                type="primary"
                                @click="planDialogVisible = false"
                            >
                                {{ $t('user.free.paySuccessClose') }}
                            </el-button>
                        </div>
                    </div>
                    <div
                        v-else-if="isFailedOrderState"
                        class="plan-order-status"
                    >
                        <p>{{ $t('user.free.orderFail') }}</p>
                        <p class="order-status-label">
                            {{ $t('user.free.orderStatus') }}：{{
                                orderPollingState
                            }}
                        </p>
                    </div>
                </template>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { generateOrder, orderStatus, sendCode } from '@/api/email'
import { planList } from '@/api/plan'
import { ElMessage } from 'element-plus'

const BASE_URL = import.meta.env.BASE_URL || '/'
const SUPPORT_BOT_LINK = 'https://t.me/TrojanAccess_bot?start=help'
const mailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default {
    name: 'PayPage',
    data() {
        return {
            viewportWidth: window.innerWidth || 1024,
            email: '',
            plans: [],
            selectedPlan: null,
            planDialogVisible: false,
            planOrderCreated: false,
            planCodeDigits: ['', '', '', '', '', ''],
            planCodeRefs: [],
            planCodeSent: false,
            planResendCountdown: 0,
            planResendTimer: null,
            orderPollingInterval: null,
            orderName: '',
            orderPollingState: 'idle',
        }
    },
    created() {
        this.getPlanList()
    },
    mounted() {
        this.syncEmailFromRoute()
        this.updateViewportWidth()
        window.addEventListener('resize', this.updateViewportWidth, {
            passive: true,
        })
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.updateViewportWidth)
        clearInterval(this.planResendTimer)
        this.stopOrderPolling()
    },
    watch: {
        '$route.params.emailB64'() {
            this.syncEmailFromRoute()
        },
        planDialogVisible(newVal) {
            if (!newVal) {
                this.resetPlanDialogState()
            }
        },
    },
    computed: {
        isFailedOrderState() {
            const state = this.orderPollingState
            return (
                state &&
                state !== 'idle' &&
                state !== 'pending' &&
                state !== 'success' &&
                state !== 'paid'
            )
        },
        planDialogWidth() {
            return this.viewportWidth <= 480 ? '92%' : '420px'
        },
        paidPlans() {
            return (this.plans || []).filter((plan) => {
                const name = String(plan?.name || '').toLowerCase()
                return name && name !== 'free'
            })
        },
        isPlanCodeComplete() {
            return this.planCodeDigits.join('').length === 6
        },
        selectedPlanImage() {
            return this.resolvePlanImage(this.selectedPlan?.image_path || '')
        },
        supportBotLink() {
            return SUPPORT_BOT_LINK
        },
    },
    methods: {
        updateViewportWidth() {
            this.viewportWidth = window.innerWidth || 1024
        },
        normalizeBase64Url(text) {
            const value = String(text || '')
                .trim()
                .replace(/-/g, '+')
                .replace(/_/g, '/')
            if (!value) return ''
            const mod = value.length % 4
            if (mod === 0) return value
            return `${value}${'='.repeat(4 - mod)}`
        },
        decodePayEmail(emailB64) {
            if (!emailB64) return ''
            try {
                return atob(this.normalizeBase64Url(emailB64))
            } catch (error) {
                return ''
            }
        },
        syncEmailFromRoute() {
            const encoded = this.$route?.params?.emailB64
            const decoded = this.decodePayEmail(encoded)
            if (decoded && mailReg.test(decoded)) {
                this.email = decoded
                return
            }
            this.email = ''
            if (encoded) {
                ElMessage.error(this.$t('mailError'))
            }
        },
        formatPlanPrice(price) {
            const value = Number(price)
            if (!Number.isFinite(value)) {
                return '0.00'
            }
            return value.toFixed(2)
        },
        resolvePlanImage(path) {
            if (!path) {
                return ''
            }
            if (/^https?:\/\//.test(path)) {
                return path
            }
            const normalizedBase = BASE_URL.endsWith('/')
                ? BASE_URL
                : `${BASE_URL}/`
            const normalizedPath = String(path).replace(/^\/+/, '')
            return `${normalizedBase}${normalizedPath}`
        },
        getCurrentLocale() {
            const locale = this.$i18n?.locale
            return typeof locale === 'string' ? locale : locale?.value || 'en'
        },
        isZhLocale() {
            return String(this.getCurrentLocale() || '')
                .toLowerCase()
                .startsWith('zh')
        },
        getPlanLabel(plan) {
            const zhLabel = plan?.label
            const enLabel = plan?.label_en
            const selected = this.isZhLocale() ? zhLabel : enLabel
            return selected || zhLabel || enLabel || ''
        },
        getPlanDescription(plan) {
            const zhDesc = plan?.description
            const enDesc = plan?.description_en
            const selected = this.isZhLocale() ? zhDesc : enDesc
            return selected || zhDesc || enDesc || ''
        },
        async copyText(text) {
            try {
                await navigator.clipboard.writeText(text)
                ElMessage.success(this.$t('user.info.copySuccess'))
            } catch (error) {
                ElMessage.error(this.$t('user.info.copyFail'))
            }
        },
        async getPlanList() {
            try {
                const result = await planList()
                if (result.code !== 200 || result.message !== 'success') {
                    return
                }
                this.plans = Array.isArray(result.data) ? result.data : []
            } catch (error) {
                this.plans = []
            }
        },
        resetPlanDialogState() {
            this.stopOrderPolling()
            this.selectedPlan = null
            this.planOrderCreated = false
            this.planCodeDigits = ['', '', '', '', '', '']
            this.planCodeRefs = []
            this.planCodeSent = false
            this.planResendCountdown = 0
            clearInterval(this.planResendTimer)
            this.orderName = ''
            this.orderPollingState = 'idle'
        },
        openPlanDialog(plan) {
            if (!this.email || !mailReg.test(this.email)) {
                ElMessage.error(this.$t('mailError'))
                return
            }
            if (!plan || String(plan.name || '').toLowerCase() === 'free') {
                return
            }
            this.resetPlanDialogState()
            this.selectedPlan = plan || null
            this.planDialogVisible = true
        },
        async handleGetPlanCode() {
            if (!this.email || !mailReg.test(this.email)) {
                ElMessage.error(this.$t('mailError'))
                return
            }
            const formData = new FormData()
            formData.set('email', this.email)
            const result = await sendCode(formData)
            if (result.code !== 200 || result.message !== 'success') {
                return
            }
            ElMessage.success(this.$t('user.free.codeSent'))
            this.planCodeSent = true
            this.planCodeDigits = ['', '', '', '', '', '']
            this.planCodeRefs = []
            this.startPlanResendCountdown()
            this.$nextTick(() => {
                const firstInput = this.planCodeRefs[0]
                if (firstInput?.focus) {
                    firstInput.focus()
                }
            })
        },
        startPlanResendCountdown() {
            this.planResendCountdown = 60
            clearInterval(this.planResendTimer)
            this.planResendTimer = setInterval(() => {
                if (this.planResendCountdown <= 1) {
                    clearInterval(this.planResendTimer)
                    this.planResendCountdown = 0
                } else {
                    this.planResendCountdown--
                }
            }, 1000)
        },
        setPlanCodeRef(el) {
            if (!el) {
                return
            }
            if (!this.planCodeRefs.includes(el)) {
                this.planCodeRefs.push(el)
            }
        },
        handlePlanCodeInput(index, event) {
            const value = String(event?.target?.value || '').replace(/\D/g, '')
            this.planCodeDigits[index] = value.slice(-1)
            if (value && index < this.planCodeRefs.length - 1) {
                this.planCodeRefs[index + 1]?.focus?.()
            }
        },
        handlePlanCodeKeydown(index, event) {
            if (
                event.key === 'Backspace' &&
                !this.planCodeDigits[index] &&
                index > 0
            ) {
                this.planCodeRefs[index - 1]?.focus?.()
            }
        },
        handlePlanCodePaste(event) {
            const text = (
                event.clipboardData || event.originalEvent?.clipboardData
            )
                ?.getData('text')
                .replace(/\D/g, '')
                .slice(0, 6)
            if (!text) return
            event.preventDefault()
            text.split('').forEach((ch, i) => {
                this.planCodeDigits[i] = ch
            })
            const nextIndex = Math.min(text.length, 5)
            this.$nextTick(() => this.planCodeRefs[nextIndex]?.focus?.())
        },
        async handleCreatePlanOrder() {
            if (!this.email || !mailReg.test(this.email)) {
                ElMessage.error(this.$t('mailError'))
                return
            }
            if (this.planCodeDigits.join('').length !== 6) {
                ElMessage.error(this.$t('user.free.codeInvalid'))
                return
            }
            if (!this.selectedPlan?.name) {
                return
            }
            const formData = new FormData()
            formData.set('email', this.email)
            formData.set('code', this.planCodeDigits.join(''))
            formData.set('plan_name', this.selectedPlan.name)
            try {
                const result = await generateOrder(formData)
                if (result.code !== 200 || result.message !== 'success') {
                    ElMessage.error(
                        result.message || this.$t('user.free.orderCreateFail'),
                    )
                    return
                }
                this.planOrderCreated = true
                this.orderName = result.data?.order_name || ''
                this.orderPollingState = 'pending'
                this.startOrderPolling()
            } catch (error) {
                ElMessage.error(this.$t('user.free.orderCreateFail'))
            }
        },
        startOrderPolling() {
            this.stopOrderPolling()
            this.checkOrderStatus()
            this.orderPollingInterval = setInterval(() => {
                this.checkOrderStatus()
            }, 5000)
        },
        stopOrderPolling() {
            if (this.orderPollingInterval) {
                clearInterval(this.orderPollingInterval)
                this.orderPollingInterval = null
            }
        },
        async checkOrderStatus() {
            if (
                !this.email ||
                !this.planCodeDigits.join('') ||
                !this.orderName
            ) {
                return
            }
            const formData = new FormData()
            formData.set('email', this.email)
            formData.set('code', this.planCodeDigits.join(''))
            formData.set('order_name', this.orderName)
            try {
                const result = await orderStatus(formData)
                if (result.code === 200 && result.message === 'success') {
                    const data = result.data || {}
                    const status = data.status
                    if (status === 'success' || status === 'paid') {
                        this.stopOrderPolling()
                        this.orderPollingState = status
                        ElMessage.success(
                            `${this.$t('user.free.paymentSuccess')}${String(this.email || '')}`,
                        )
                    } else if (status === 'pending') {
                        // 继续轮询，等待支付
                    } else {
                        // fail / expired / refunded 及其他终态，停止轮询并显示当前状态
                        this.stopOrderPolling()
                        this.orderPollingState = status
                        this.planOrderCreated = false
                        const statusMsgKey = `user.free.orderStatus${status.charAt(0).toUpperCase() + status.slice(1)}`
                        ElMessage.error(
                            this.$te(statusMsgKey)
                                ? this.$t(statusMsgKey)
                                : this.$t('user.free.orderFail'),
                        )
                        this.planDialogVisible = false
                    }
                }
            } catch (error) {
                console.error('Order status check failed:', error)
            }
        },
    },
}
</script>

<style scoped>
:deep(.plan-dialog.el-dialog),
:deep(.plan-dialog .el-dialog) {
    max-width: calc(100vw - 32px);
    box-sizing: border-box;
}

.pay-page {
    min-height: 100%;
    width: 100%;
    background-color: #2d3a4b;
    overflow-x: hidden;
}

.pay-container {
    max-width: 860px;
    margin: 20px auto;
    padding: 0 16px 32px;
    font-size: 14px;
}

.card {
    margin-bottom: 16px;
    padding: 20px;
    border-radius: 12px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
}

.card h2 {
    margin: 0 0 12px;
    font-size: 17px;
    font-weight: 700;
}

.card p {
    margin: 6px 0;
    line-height: 1.75;
    word-break: break-all;
}

.subtitle {
    display: block;
    margin: 0 0 10px;
    font-size: 14px;
    font-weight: 700;
}

.divider {
    height: 1px;
    margin: 18px 0;
    background: var(--el-border-color-lighter);
}

.hint-text {
    margin-top: 8px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
}

.plan-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
}

.plan-card {
    padding: 14px;
    border-radius: 10px;
    border: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-extra-light);
    cursor: pointer;
    transition:
        transform 0.15s ease,
        box-shadow 0.15s ease,
        border-color 0.15s ease;
}

.plan-card:hover {
    transform: translateY(-2px);
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 10px 24px rgba(13, 110, 253, 0.08);
}

.plan-label {
    margin: 0 0 6px;
    font-weight: 600;
}

.plan-desc {
    margin: 0 0 8px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 1.6;
}

.plan-price {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 700;
    color: #0d6efd;
}

.empty-text {
    color: var(--el-text-color-secondary);
}

.copy-value {
    color: #0d6efd;
    cursor: pointer;
    text-decoration: underline;
}

.plan-dialog-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.plan-dialog-price {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #0d6efd;
    text-align: center;
}

.plan-dialog-tip {
    margin: -4px 0 0;
    color: var(--el-text-color-secondary);
    font-size: 12px;
}

.plan-input-row {
    display: flex;
    gap: 0;
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    overflow: hidden;
}

.plan-input-row :deep(.el-input__wrapper) {
    border-radius: 0;
    box-shadow: none !important;
}

.plan-send-btn {
    flex-shrink: 0;
    border-radius: 0 8px 8px 0;
    white-space: nowrap;
}

.plan-code-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.plan-submit-btn {
    width: 100%;
}

.plan-fade-enter-active,
.plan-fade-leave-active {
    transition:
        opacity 0.25s ease,
        transform 0.25s ease;
}
.plan-fade-enter-from,
.plan-fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

.plan-code-row {
    display: flex;
    gap: 8px;
    justify-content: space-between;
}

.plan-code-input {
    width: 44px;
    height: 44px;
    border: 1px solid var(--el-border-color);
    border-radius: 10px;
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    background: var(--el-bg-color);
    color: var(--el-text-color-primary);
    outline: none;
}

.plan-code-input:focus {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.15);
}

@media (max-width: 360px) {
    .plan-code-row {
        flex-wrap: wrap;
        justify-content: center;
        gap: 6px;
    }

    .plan-code-input {
        width: 40px;
        height: 40px;
        border-radius: 9px;
        font-size: 16px;
    }
}

.plan-dialog-qrcode {
    display: flex;
    justify-content: center;
}

.plan-dialog-image {
    width: 220px;
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    border: 1px solid var(--el-border-color-lighter);
}

.plan-order-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #0d6efd;
    font-weight: 600;
}

.plan-success {
    color: var(--el-text-color-primary);
    font-weight: 500;
}

.plan-success-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b4b61, #1f2a38);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #ffffff;
    font-size: 30px;
    font-weight: 800;
    line-height: 60px;
    text-align: center;
    margin-top: 6px;
}

.plan-success-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #1f7afc;
    text-align: center;
}

.plan-success-desc {
    margin: 0;
    text-align: center;
    color: var(--el-text-color-regular);
}

.plan-success-desc strong {
    font-weight: 800;
    color: #0b558e;
}

.plan-success-meta {
    width: 100%;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-extra-light);
    text-align: center;
}

.plan-success-meta p {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-weight: 500;
}

.plan-success-steps {
    width: 100%;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
}

.plan-success-steps-title {
    margin: 0 0 8px;
    font-weight: 700;
    font-size: 13px;
}

.plan-success-steps-list {
    margin: 0;
    padding-left: 18px;
    color: var(--el-text-color-regular);
    line-height: 1.8;
}

.inline-link {
    color: #0d6efd;
    text-decoration: underline;
}

.plan-success-actions {
    width: 100%;
    display: flex;
    justify-content: center;
}

.order-checking-row {
    display: flex;
    align-items: center;
    gap: 10px;
}

.plan-order-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(13, 110, 253, 0.2);
    border-top-color: #0d6efd;
    border-radius: 50%;
    animation: plan-spin 0.9s linear infinite;
}

.order-status-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
}

@keyframes plan-spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
