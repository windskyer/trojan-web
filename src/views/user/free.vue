<template>
    <div class="free-page">
        <div class="info-page">
            <div class="card">
                <h2>{{ $t('user.free.title') }}</h2>

                <p>{{ $t('user.free.tip1') }}</p>
                <p>{{ $t('user.free.tip2') }}</p>
                <p>{{ $t('user.free.tip3') }}</p>
                <p>{{ $t('user.free.tip4') }}</p>
                <p>{{ $t('user.free.tip5') }}</p>
                <p>{{ $t('user.free.tip6') }}</p>
                <p>{{ $t('user.free.tip7') }}</p>

                <div class="divider"></div>
                <p class="subtitle">{{ $t('user.free.accountInfo') }}</p>
                <p>
                    {{ $t('user.free.password') }}：
                    <span
                        class="copy-value"
                        @click="account.password && copyText(account.password)"
                    >
                        {{ account.password || '-' }}
                    </span>
                </p>
                <p>
                    {{ $t('user.free.traffic') }}：{{ account.used }} /
                    {{ account.quota }}
                </p>
                <p>
                    {{ $t('user.free.expiryDate') }}：{{
                        account.expiryDate || '-'
                    }}
                </p>

                <div class="divider"></div>
                <p class="node-title">{{ $t('user.free.nodeLinks') }}</p>
                <div v-if="links.length > 0" class="links">
                    <div
                        v-for="(link, index) in links"
                        :key="`${link}-${index}`"
                        class="link-block node-block"
                    >
                        <p>{{ getLinkLabel(link, index) }}</p>
                        <div class="link-row">
                            <p class="link-text" @click="copyText(link)">
                                {{ link }}
                            </p>
                            <div class="link-actions">
                                <el-button
                                    class="link-action"
                                    type="primary"
                                    plain
                                    size="small"
                                    @click="showQRCode(link)"
                                >
                                    <el-tooltip
                                        :content="$t('user.info.qrcode')"
                                        placement="top"
                                    >
                                        <el-icon><Grid /></el-icon>
                                    </el-tooltip>
                                </el-button>
                                <el-button
                                    class="link-action"
                                    type="info"
                                    plain
                                    size="small"
                                    @click="openLink(link)"
                                >
                                    <el-tooltip
                                        :content="$t('user.info.openLink')"
                                        placement="top"
                                    >
                                        <el-icon><LinkIcon /></el-icon>
                                    </el-tooltip>
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>
                <p v-else class="empty-text">
                    {{ $t('user.free.emptyLinks') }}
                </p>

                <div class="divider"></div>
                <p class="subtitle">{{ $t('user.free.planListTitle') }}</p>
                <div v-if="paidPlans.length > 0" class="plan-grid">
                    <div
                        v-for="plan in paidPlans"
                        :key="plan.name"
                        class="plan-card"
                        @click="openPlanDialog(plan)"
                    >
                        <p class="plan-label">{{ getPlanLabel(plan) }}</p>
                        <p
                            v-if="getPlanDescription(plan)"
                            class="plan-desc"
                        >
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

                <div class="divider"></div>
                <p class="subtitle">{{ $t('user.free.cta') }}</p>

                <div class="action-buttons">
                    <el-button type="primary" plain @click="goLogin">{{
                        $t('user.free.login')
                    }}</el-button>
                    <el-button
                        class="join-group-btn"
                        type="success"
                        @click="openTelegramChannel"
                        >{{ $t('user.free.telegramChannel') }}</el-button
                    >
                </div>
            </div>
        </div>

        <el-dialog
            class="qrcode-dialog"
            title=""
            v-model="qrcodeVisible"
            width="280px"
            :show-close="false"
            :close-on-click-modal="true"
            @opened="renderQRCode"
            @close="closeQRCode"
        >
            <div ref="qrcode" class="qrcodeCenter"></div>
        </el-dialog>

        <el-dialog
            class="plan-dialog"
            :title="
                selectedPlan
                    ? getPlanLabel(selectedPlan)
                    : $t('user.free.planListTitle')
            "
            v-model="planDialogVisible"
            width="360px"
            :show-close="true"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
        >
            <div v-if="selectedPlan" class="plan-dialog-content">
                <p class="plan-dialog-price">
                    ¥{{ formatPlanPrice(selectedPlan.price) }}
                </p>
                <template v-if="!planOrderCreated">
                    <el-input
                        v-model="planEmail"
                        type="email"
                        :placeholder="$t('user.free.planEmailPlaceholder')"
                        clearable
                        @keyup.enter="handleCreatePlanOrder"
                    />
                    <p class="plan-dialog-tip">
                        {{ $t('user.free.planEmailTip') }}
                    </p>
                    <el-button
                        type="primary"
                        plain
                        class="plan-submit-btn"
                        @click="handleGetPlanCode"
                    >
                        {{ $t('user.free.getCode') }}
                    </el-button>
                    <div class="plan-code-row">
                        <input
                            v-for="(digit, index) in planCodeDigits"
                            :key="`plan-code-${index}`"
                            :ref="setPlanCodeRef"
                            v-model="planCodeDigits[index]"
                            class="plan-code-input"
                            type="text"
                            inputmode="numeric"
                            maxlength="1"
                            @input="handlePlanCodeInput(index, $event)"
                            @keydown="handlePlanCodeKeydown(index, $event)"
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
                </template>
                <template v-else>
                    <div v-if="orderPollingState === 'pending'">
                        <div
                            v-if="selectedPlanImage"
                            class="plan-dialog-qrcode"
                        >
                            <img
                                :src="selectedPlanImage"
                                :alt="getPlanLabel(selectedPlan)"
                                class="plan-dialog-image"
                            />
                        </div>
                        <p v-else class="empty-text">
                            {{ $t('user.free.planQrEmpty') }}
                        </p>
                        <div class="plan-order-status">
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
                        v-else-if="orderPollingState === 'success'"
                        class="plan-order-status plan-success"
                    >
                        <div class="plan-success-icon">✓</div>
                        <p class="plan-success-title">
                            {{ $t('user.free.paySuccessTitle') }}
                        </p>
                        <p class="plan-success-desc">
                            {{ $t('user.free.paySuccessSent') }}
                            <strong>{{ planEmail }}</strong>
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
                            <el-button type="primary" @click="goLogin">
                                {{ $t('user.free.paySuccessGoLogin') }}
                            </el-button>
                            <el-button plain @click="planDialogVisible = false">
                                {{ $t('user.free.paySuccessClose') }}
                            </el-button>
                        </div>
                    </div>
                    <div
                        v-else-if="orderPollingState === 'fail'"
                        class="plan-order-status"
                    >
                        <p>{{ $t('user.free.orderFail') }}</p>
                    </div>
                </template>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { generateOrder, orderStatus, sendCode } from '@/api/email'
import { freeUserInfo, planList } from '@/api/user'
import { readableBytes } from '@/utils/common'
import { Grid, Link as LinkIcon } from '@element-plus/icons-vue'
import QRCode from 'easyqrcodejs'
import { ElMessage } from 'element-plus'

const BASE_URL = import.meta.env.BASE_URL || '/'
const SUPPORT_BOT_LINK = 'https://t.me/TrojanAccess_bot?start=help'
const mailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default {
    name: 'FreePage',
    components: {
        Grid,
        LinkIcon,
    },
    data() {
        return {
            subscribeUrl: '',
            links: [],
            plans: [],
            selectedPlan: null,
            planDialogVisible: false,
            planEmail: '',
            planOrderCreated: false,
            planCodeDigits: ['', '', '', '', '', ''],
            planCodeRefs: [],
            qrcodeVisible: false,
            shareLink: '',
            orderPollingInterval: null,
            orderName: '',
            orderPollingState: 'idle',
            account: {
                username: '',
                uuid: '',
                password: '',
                used: '0 Bytes',
                quota: '0 Bytes',
                expiryDate: '',
            },
        }
    },
    created() {
        this.getFreeUserInfo()
        this.getPlanList()
    },
    watch: {
        planDialogVisible(newVal) {
            if (!newVal) {
                this.stopOrderPolling()
            }
        },
    },
    methods: {
        decodeBase64(text) {
            if (!text) {
                return ''
            }
            try {
                return atob(text)
            } catch (error) {
                return text
            }
        },
        async copyText(text) {
            try {
                await navigator.clipboard.writeText(text)
                ElMessage.success(this.$t('user.info.copySuccess'))
            } catch (error) {
                ElMessage.error(this.$t('user.info.copyFail'))
            }
        },
        buildSubscribeUrl(username, encodedPassword) {
            if (!username || !encodedPassword) {
                return ''
            }
            const decodedPassword = this.decodeBase64(encodedPassword)
            const userInfo = btoa(
                `{"user": "${username}", "pass": "${decodedPassword}"}`,
            )
            return `${window.location.origin}/trojan/user/subscribe?token=${userInfo}`
        },
        getLinkLabel(link, index) {
            const protocol = String(link || '')
                .split('://')[0]
                .trim()
                .toLowerCase()

            const protocolMap = {
                trojan: 'TROJAN',
                vless: 'VLESS',
                hysteria2: 'HYSTERIA2',
                hy2: 'HYSTERIA2',
            }

            const label =
                protocolMap[protocol] ||
                `${this.$t('user.info.linkName')} ${index + 1}`

            return `${label} (${this.$t('user.info.clickToCopy')})`
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
        async getFreeUserInfo() {
            try {
                const result = await freeUserInfo()
                if (result.code !== 200 || result.message !== 'success') {
                    ElMessage.error(
                        result.message || this.$t('user.free.fetchFail'),
                    )
                    return
                }
                const data = result.data || {}
                const userinfo = data.userinfo || {}
                const links = Array.isArray(data.links) ? data.links : []
                const upload = Number(userinfo.Upload ?? 0)
                const download = Number(userinfo.Download ?? 0)
                const used = upload + download
                const quota = Number(userinfo.Quota ?? 0)
                this.links = links
                this.subscribeUrl =
                    this.buildSubscribeUrl(
                        userinfo.Username || '',
                        userinfo.Password || '',
                    ) ||
                    links[0] ||
                    ''
                this.account = {
                    username: userinfo.Username || '',
                    uuid: userinfo.UUID || '',
                    password: this.decodeBase64(userinfo.Password || ''),
                    used: readableBytes(used),
                    quota:
                        quota === -1
                            ? this.$t('user.unlimit')
                            : readableBytes(quota),
                    expiryDate: userinfo.ExpiryDate || '',
                }
            } catch (error) {
                ElMessage.error(this.$t('user.free.fetchFail'))
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
        openPlanDialog(plan) {
            if (!plan || String(plan.name || '').toLowerCase() === 'free') {
                return
            }
            this.stopOrderPolling()
            this.selectedPlan = plan || null
            this.planEmail = ''
            this.planOrderCreated = false
            this.planCodeDigits = ['', '', '', '', '', '']
            this.planCodeRefs = []
            this.orderName = ''
            this.planDialogVisible = true
        },
        async handleGetPlanCode() {
            if (!this.planEmail || !mailReg.test(this.planEmail)) {
                ElMessage.error(this.$t('mailError'))
                return
            }
            const formData = new FormData()
            formData.set('email', this.planEmail)
            const result = await sendCode(formData)
            if (result.code !== 200 || result.message !== 'success') {
                return
            }
            ElMessage.success(this.$t('user.free.codeSent'))
            this.$nextTick(() => {
                const firstInput = this.planCodeRefs[0]
                if (firstInput?.focus) {
                    firstInput.focus()
                }
            })
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
        async handleCreatePlanOrder() {
            if (!this.planEmail || !mailReg.test(this.planEmail)) {
                ElMessage.error(this.$t('mailError'))
                return
            }
            if (this.planCodeDigits.join('').length !== 6) {
                ElMessage.error(this.$t('user.free.codeInvalid'))
                return
            }
            const formData = new FormData()
            formData.set('email', this.planEmail)
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
        openTelegramChannel() {
            window.open('https://t.me/trojan100', '_blank')
        },
        showQRCode(url) {
            this.shareLink = url
            this.qrcodeVisible = true
        },
        renderQRCode() {
            this.$nextTick(() => {
                if (!this.$refs.qrcode || !this.shareLink) {
                    return
                }
                this.$refs.qrcode.innerHTML = ''
                // eslint-disable-next-line no-new
                new QRCode(this.$refs.qrcode, {
                    width: 220,
                    height: 220,
                    text: this.shareLink,
                })
            })
        },
        closeQRCode() {
            if (this.$refs.qrcode) {
                this.$refs.qrcode.innerHTML = ''
            }
            this.shareLink = ''
        },
        openLink(url) {
            if (!url) return
            window.open(url, '_blank')
        },
        goLogin() {
            this.$router.push('/login').catch(() => {})
        },
        startOrderPolling() {
            this.stopOrderPolling() // 确保没有重复的轮询
            this.orderStatus() // 立即调用一次
            this.orderPollingInterval = setInterval(() => {
                this.orderStatus()
            }, 5000) // 每5秒调用一次
        },
        stopOrderPolling() {
            if (this.orderPollingInterval) {
                clearInterval(this.orderPollingInterval)
                this.orderPollingInterval = null
            }
        },
        async orderStatus() {
            if (
                !this.planEmail ||
                !this.planCodeDigits.join('') ||
                !this.orderName
            ) {
                return
            }
            const formData = new FormData()
            formData.set('email', this.planEmail)
            formData.set('code', this.planCodeDigits.join(''))
            formData.set('order_name', this.orderName)
            try {
                const result = await orderStatus(formData)
                if (result.code === 200 && result.message === 'success') {
                    const data = result.data || {}
                    const status = data.status
                    if (status === 'success') {
                        this.stopOrderPolling()
                        this.orderPollingState = 'success'
                        const successMessage = `${this.$t('user.free.paymentSuccess')}${this.planEmail}`
                        ElMessage.success(successMessage)
                    } else if (status === 'fail' || status === 'expired') {
                        this.stopOrderPolling()
                        this.orderPollingState = 'fail'
                        this.planOrderCreated = false
                        ElMessage.error(this.$t('user.free.orderFail'))
                    }
                    // 如果是 pending 或其他状态，继续轮询
                }
            } catch (error) {
                console.error('Order status check failed:', error)
            }
        },
    },
    computed: {
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
}
</script>

<style lang="scss" scoped>
:deep(.plan-dialog.el-dialog),
:deep(.plan-dialog .el-dialog) {
    max-width: calc(100vw - 32px);
    box-sizing: border-box;
}

.free-page {
    min-height: 100%;
    width: 100%;
    background-color: #2d3a4b;
    overflow: hidden;
}

.info-page {
    max-width: 980px;
    margin: 20px auto;
    padding: 0 16px 24px;
    font-size: 14px;
}

.card {
    margin-bottom: 16px;
    padding: 16px;
    border-radius: 10px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
}

.card h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}

.card p {
    margin: 6px 0;
    line-height: 1.7;
    word-break: break-all;
}

.subtitle {
    font-weight: 600;
}

.divider {
    height: 1px;
    margin: 10px 0 12px;
    background: var(--el-border-color-lighter);
}

.links {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.node-block + .node-block {
    margin-top: 8px;
}

.link-block + .link-block {
    margin-top: 8px;
}

.subscribe-block {
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px dashed var(--el-border-color-lighter);
}

.link-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: nowrap;
}

.link-actions {
    display: flex;
    gap: 2px;
    flex-wrap: nowrap;
    margin-top: 2px;
    margin-left: auto;
    opacity: 0;
    transform: translateY(-2px);
    pointer-events: none;
    transition:
        opacity 0.15s ease,
        transform 0.15s ease;
}

.link-action {
    padding: 0 6px;
    min-width: 30px;
}

.link-action :deep(.el-icon) {
    margin-right: 0;
}

.link-row:hover .link-actions,
.link-row:focus-within .link-actions {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

@media (max-width: 768px) {
    .link-row {
        flex-wrap: wrap;
        align-items: flex-start;
    }

    .link-text {
        white-space: normal;
        overflow: visible;
        text-overflow: clip;
    }

    .link-actions {
        opacity: 1;
        transform: none;
        pointer-events: auto;
    }
}

.node-title {
    margin-top: 4px;
    font-weight: 600;
}

.link-text {
    margin: 0;
    color: #0d6efd;
    cursor: pointer;
    text-decoration: underline;
    flex: 1 1 auto;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.empty-text {
    color: var(--el-text-color-secondary);
}

.copy-value {
    color: #0d6efd;
    cursor: pointer;
    text-decoration: underline;
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

.plan-submit-btn {
    width: 100%;
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
    margin: 0 0 6px;
    font-weight: 700;
}

.plan-success-steps-list {
    margin: 0;
    padding-left: 18px;
    color: var(--el-text-color-regular);
    line-height: 1.6;
}

.plan-success-actions {
    width: 100%;
    display: flex;
    gap: 10px;
}

.plan-success-actions :deep(.el-button) {
    flex: 1 1 0;
}

.inline-link {
    color: #00e0ff;
    text-decoration: underline;
}

.inline-link:hover {
    opacity: 0.85;
}

.order-checking-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.plan-order-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(13, 110, 253, 0.2);
    border-top-color: #0d6efd;
    border-radius: 50%;
    animation: plan-spin 0.9s linear infinite;
}

.action-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
}

.action-buttons :deep(.el-button) {
    text-transform: uppercase;
}

.join-group-btn {
    margin-left: auto;
}

.qrcodeCenter {
    text-align: center;
    word-break: break-all;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}

.qrcode-dialog :deep(.el-dialog__header) {
    padding: 8px 8px 0;
}

.qrcode-dialog :deep(.el-dialog__body) {
    padding: 8px;
    display: flex;
    justify-content: center;
}

@media (max-width: 768px) {
    .action-buttons {
        width: 100%;
        flex-direction: column;
        align-items: stretch;
    }

    .plan-grid {
        grid-template-columns: 1fr;
    }

    .action-buttons :deep(.el-button) {
        width: 100%;
        margin-left: 0;
    }

    .join-group-btn {
        margin-left: 0;
    }
}

@keyframes plan-spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>
