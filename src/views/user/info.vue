<template>
    <div class="info-page">
        <div class="card">
            <h2>{{ $t('user.info.accountTitle') }}</h2>
            <div class="divider"></div>
            <p>{{ $t('user.info.username') }}: {{ user.username }}</p>
            <p>{{ $t('user.info.email') }}: {{ user.email }}</p>
            <p>
                <el-icon class="label-icon"><Key /></el-icon>
                {{ $t('user.info.uuid') }}:
                {{ user.uuid }}
            </p>
            <p>{{ $t('user.info.tgUsername') }}: {{ user.tgUsername || '-' }}</p>
            <p>{{ $t('user.info.linkPassword') }}: {{ user.password }}</p>
        </div>

        <div class="card">
            <h2>{{ $t('user.info.trafficTitle') }}</h2>
            <div class="divider"></div>
            <p>{{ progressBar }} {{ usedPercent.toFixed(1) }}%</p>
            <p>
                {{ $t('user.info.used') }}: {{ formatBytes(user.usedBytes) }} /
                {{ $t('user.info.total') }}: {{ formatBytes(user.totalBytes) }}
            </p>
            <p>
                {{ $t('user.info.remaining') }}: {{ formatBytes(remainBytes) }}
            </p>
        </div>

        <div class="card">
            <h2>{{ $t('user.info.subscriptionTitle') }}</h2>
            <div class="divider"></div>

            <div v-if="subscribeUrl" class="link-block subscribe-block">
                <p>{{ $t('user.info.subscriptionAddress') }}</p>
                <div class="link-row">
                    <p class="link-text" @click="copyText(subscribeUrl)">
                        {{ subscribeUrl }}
                    </p>
                    <div class="link-actions">
                        <el-button
                            class="link-action"
                            type="primary"
                            plain
                            size="small"
                            @click="showQRCode(subscribeUrl)"
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
                            @click="openLink(subscribeUrl)"
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

            <p class="node-title">{{ $t('user.info.nodeLinks') }}</p>
            <div
                class="link-block node-block"
                v-for="(item, index) in normalizedLinks"
                :key="`${item.url}-${index}`"
            >
                <p>{{ item.name }}</p>
                <div class="link-row">
                    <p class="link-text" @click="copyText(item.url)">
                        {{ item.url }}
                    </p>
                    <div class="link-actions">
                        <el-button
                            class="link-action"
                            type="primary"
                            plain
                            size="small"
                            @click="showQRCode(item.url)"
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
                            @click="openLink(item.url)"
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
            <p v-if="normalizedLinks.length === 0">
                {{ $t('user.info.noLinks') }}
            </p>
        </div>

        <div class="card">
            <h2>{{ $t('user.info.planListTitle') }}</h2>
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
                    <p class="plan-price">¥{{ formatPlanPrice(plan.price) }}</p>
                    <p>
                        {{ $t('user.info.planDuration') }}:
                        {{ plan.duration_days }} {{ $t('user.days') }}
                    </p>
                    <p>
                        {{ $t('user.info.planTraffic') }}:
                        {{ plan.total_data_gb }}GB
                    </p>
                </div>
            </div>
            <p v-else>{{ $t('user.info.emptyPlans') }}</p>
        </div>

        <div class="card">
            <h2>{{ $t('user.info.expiryTitle') }}</h2>
            <div class="divider"></div>
            <p>{{ $t('user.info.expiryDate') }}: {{ user.expiryDate }}</p>
            <p>
                {{ $t('user.info.remainingDays') }}: {{ remainDays }}
                {{ $t('user.days') }}
            </p>
            <div class="expiry-actions">
                <el-button
                    :type="remainDays <= 7 ? 'danger' : 'primary'"
                    @click="openPlanListDialog"
                    >{{ renewButtonText }}</el-button
                >
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
            width="420px"
            :show-close="true"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
        >
            <div v-if="!selectedPlan">
                <div v-if="paidPlans.length > 0" class="plan-grid">
                    <div
                        v-for="plan in paidPlans"
                        :key="`dialog-${plan.name}`"
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

            <div v-else class="plan-dialog-content">
                <el-button
                    type="info"
                    plain
                    size="small"
                    class="plan-back-btn"
                    @click="backToPlanList"
                >
                    {{ $t('user.free.backToPlans') }}
                </el-button>

                <p class="plan-dialog-price">
                    ¥{{ formatPlanPrice(selectedPlan.price) }}
                </p>

                <template v-if="!planOrderCreated">
                    <el-input
                        v-model="user.email"
                        type="email"
                        :placeholder="$t('user.free.planEmailPlaceholder')"
                        disabled
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
                            {{ $t('user.free.paySuccessUpdated') }}
                        </p>
                        <p class="plan-success-desc">
                            {{ $t('user.free.paySuccessSent') }}
                            <strong>{{ user.email }}</strong>
                        </p>
                        <div class="plan-success-meta">
                            <p>{{ $t('user.free.paymentNote') }}</p>
                            <span
                                class="copy-value"
                                @click="copyText(orderName)"
                                >{{ orderName }}</span
                            >
                            <p>{{ $t('user.free.clickToCopyNote') }}</p>
                            <p class="plan-success-fresh">
                                {{ $t('user.info.expiryDate') }}:
                                <strong>{{ user.expiryDate || '-' }}</strong>
                            </p>
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
import { planList, userInfo } from '@/api/user'
import { readableBytes } from '@/utils/common'
import { Grid, Key, Link as LinkIcon } from '@element-plus/icons-vue'
import QRCode from 'easyqrcodejs'

const BYTES_PER_GB = 1024 * 1024 * 1024
const BASE_URL = import.meta.env.BASE_URL || '/'
const SUPPORT_BOT_LINK = 'https://t.me/TrojanAccess_bot?start=help'
const mailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default {
    name: 'UserInfo',
    components: {
        Grid,
        Key,
        LinkIcon,
    },
    data() {
        return {
            user: {
                username: '',
                uuid: '',
                email: '',
                tgUsername: '',
                password: '',
                usedBytes: 0,
                totalBytes: 0,
                usedGB: 0,
                totalGB: 0,
                expiryDate: '',
                links: [],
            },
            plans: [],
            qrcodeVisible: false,
            shareLink: '',
            planDialogVisible: false,
            selectedPlan: null,
            planOrderCreated: false,
            planCodeDigits: ['', '', '', '', '', ''],
            planCodeRefs: [],
            orderPollingInterval: null,
            orderName: '',
            orderPollingState: 'idle',
        }
    },
    created() {
        this.getUserInfo()
        this.getPlanList()
    },
    watch: {
        planDialogVisible(newVal) {
            if (!newVal) {
                this.resetPlanDialogState()
            }
        },
    },
    computed: {
        usedPercent() {
            if (!this.user.totalBytes) return 0
            return (this.user.usedBytes / this.user.totalBytes) * 100
        },
        remainGB() {
            return Math.max(this.user.totalGB - this.user.usedGB, 0)
        },
        remainBytes() {
            return Math.max(this.user.totalBytes - this.user.usedBytes, 0)
        },
        remainDays() {
            const now = new Date()
            const end = new Date(this.user.expiryDate + 'T23:59:59')
            const diff = end.getTime() - now.getTime()
            return Math.max(Math.ceil(diff / (24 * 60 * 60 * 1000)), 0)
        },
        progressBar() {
            const total = 10
            const filled = Math.round((this.usedPercent / 100) * total)
            return `${'■'.repeat(filled)}${'□'.repeat(total - filled)}`
        },
        normalizedLinks() {
            return (this.user.links || [])
                .map((item, index) => {
                    if (typeof item === 'string') {
                        const protocol = item.split('://')[0] || ''
                        const name = protocol
                            ? `${protocol.toUpperCase()} (${this.$t('user.info.clickToCopy')})`
                            : `${this.$t('user.info.linkName')} ${index + 1}`
                        return { name, url: item }
                    }
                    if (!item || typeof item !== 'object') {
                        return null
                    }
                    const url = item.url || item.link || item.value || ''
                    if (!url) {
                        return null
                    }
                    const name =
                        item.name ||
                        item.title ||
                        `${this.$t('user.info.linkName')} ${index + 1}`
                    return { name, url }
                })
                .filter(Boolean)
        },
        subscribeUrl() {
            const username = this.user.username
            const password = this.user.password
            if (!username || !password) {
                return ''
            }
            try {
                const userInfo = btoa(
                    JSON.stringify({ user: username, pass: password }),
                )
                return `${window.location.origin}/trojan/user/subscribe?token=${userInfo}`
            } catch (error) {
                return ''
            }
        },
        renewButtonText() {
            return this.remainDays <= 7
                ? this.$t('user.info.renewUrgent')
                : this.$t('user.info.renew')
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
        bytesToGB(bytes) {
            const value = Number(bytes)
            if (!Number.isFinite(value) || value <= 0) {
                return 0
            }
            return value / BYTES_PER_GB
        },
        toBytes(gb) {
            const value = Number(gb)
            if (!Number.isFinite(value) || value <= 0) {
                return 0
            }
            return value * BYTES_PER_GB
        },
        formatBytes(bytes) {
            return readableBytes(Number(bytes || 0))
        },
        formatPlanPrice(price) {
            const value = Number(price)
            if (!Number.isFinite(value)) {
                return '0.00'
            }
            return value.toFixed(2)
        },
        decodePassword(password) {
            if (!password) {
                return ''
            }
            try {
                return atob(password)
            } catch (error) {
                return password
            }
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
                this.$message.success(this.$t('user.info.copySuccess'))
            } catch (error) {
                this.$message.error(this.$t('user.info.copyFail'))
            }
        },
        resetPlanDialogState() {
            this.stopOrderPolling()
            this.planDialogVisible = false
            this.selectedPlan = null
            this.planOrderCreated = false
            this.planCodeDigits = ['', '', '', '', '', '']
            this.planCodeRefs = []
            this.orderName = ''
            this.orderPollingState = 'idle'
        },
        openPlanListDialog() {
            this.resetPlanDialogState()
            this.planDialogVisible = true
        },
        backToPlanList() {
            this.stopOrderPolling()
            this.selectedPlan = null
            this.planOrderCreated = false
            this.planCodeDigits = ['', '', '', '', '', '']
            this.planCodeRefs = []
            this.orderName = ''
            this.orderPollingState = 'idle'
        },
        openPlanDialog(plan) {
            if (!plan || String(plan.name || '').toLowerCase() === 'free') {
                return
            }
            this.stopOrderPolling()
            this.selectedPlan = plan || null
            this.planOrderCreated = false
            this.planCodeDigits = ['', '', '', '', '', '']
            this.planCodeRefs = []
            this.orderName = ''
            this.orderPollingState = 'idle'
            this.planDialogVisible = true
        },
        async handleGetPlanCode() {
            const email = String(this.user.email || '')
            if (!email || !mailReg.test(email)) {
                this.$message.error(this.$t('mailError'))
                return
            }
            const formData = new FormData()
            formData.set('email', email)
            const result = await sendCode(formData)
            if (result.code !== 200 || result.message !== 'success') {
                return
            }
            this.$message.success(this.$t('user.free.codeSent'))
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
            const email = String(this.user.email || '')
            if (!email || !mailReg.test(email)) {
                this.$message.error(this.$t('mailError'))
                return
            }
            if (this.planCodeDigits.join('').length !== 6) {
                this.$message.error(this.$t('user.free.codeInvalid'))
                return
            }
            if (!this.selectedPlan?.name) {
                return
            }
            const formData = new FormData()
            formData.set('email', email)
            formData.set('code', this.planCodeDigits.join(''))
            formData.set('plan_name', this.selectedPlan.name)
            try {
                const result = await generateOrder(formData)
                if (result.code !== 200 || result.message !== 'success') {
                    this.$message.error(
                        result.message || this.$t('user.free.orderCreateFail'),
                    )
                    return
                }
                this.planOrderCreated = true
                this.orderName = result.data?.order_name || ''
                this.orderPollingState = 'pending'
                this.startOrderPolling()
            } catch (error) {
                this.$message.error(this.$t('user.free.orderCreateFail'))
            }
        },
        startOrderPolling() {
            this.stopOrderPolling()
            this.checkOrderStatus()
            this.orderPollingInterval = setInterval(() => {
                this.checkOrderStatus()
            }, 60000)
        },
        stopOrderPolling() {
            if (this.orderPollingInterval) {
                clearInterval(this.orderPollingInterval)
                this.orderPollingInterval = null
            }
        },
        async checkOrderStatus() {
            if (
                !this.user.email ||
                !this.planCodeDigits.join('') ||
                !this.orderName
            ) {
                return
            }
            const formData = new FormData()
            formData.set('email', String(this.user.email || ''))
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
                        this.$message.success(
                            `${this.$t('user.free.paymentSuccess')}${String(this.user.email || '')}`,
                        )
                        this.getUserInfo()
                    } else if (status === 'fail' || status === 'expired') {
                        this.stopOrderPolling()
                        this.orderPollingState = 'fail'
                        this.planOrderCreated = false
                        this.$message.error(this.$t('user.free.orderFail'))
                    }
                }
            } catch (error) {
                console.error('Order status check failed:', error)
            }
        },
        async getUserInfo() {
            try {
                const params = {}
                if (this.$route.query.username) {
                    params.username = this.$route.query.username
                }
                const result = await userInfo(params)
                if (result.message !== 'success') {
                    this.$message.error(
                        result.message || this.$t('user.info.fetchFail'),
                    )
                    return
                }
                const userinfo = result.data.userinfo || {}
                const usedBytes =
                    Number(userinfo.Download ?? userinfo.download ?? 0) +
                    Number(userinfo.Upload ?? userinfo.upload ?? 0)
                const quotaBytes = Number(userinfo.Quota ?? userinfo.quota ?? 0)
                const usedGB = Number(
                    userinfo.usedGB ??
                        userinfo.UsedGB ??
                        userinfo.used ??
                        userinfo.Used ??
                        this.bytesToGB(usedBytes),
                )
                const totalGB = Number(
                    userinfo.totalGB ??
                        userinfo.TotalGB ??
                        userinfo.total ??
                        userinfo.Total ??
                        this.bytesToGB(quotaBytes),
                )
                this.user = {
                    uuid: userinfo.uuid || userinfo.UUID || '',
                    username: userinfo.username || userinfo.Username || '',
                    email: userinfo.email || userinfo.Email || '',
                    tgUsername:
                        userinfo.TG_Username ||
                        userinfo.tg_username ||
                        userinfo.tgUsername ||
                        '',
                    password: this.decodePassword(
                        userinfo.password || userinfo.Password || '',
                    ),
                    usedBytes: usedBytes || this.toBytes(usedGB),
                    totalBytes: quotaBytes || this.toBytes(totalGB),
                    usedGB,
                    totalGB,
                    expiryDate:
                        userinfo.expiryDate || userinfo.ExpiryDate || '',
                    links: result.data.links || [],
                }
            } catch (error) {
                this.$message.error(this.$t('user.info.fetchFail'))
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
    },
}
</script>

<style scoped>
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

.divider {
    height: 1px;
    margin: 10px 0 12px;
    background: var(--el-border-color-lighter);
}

.card p {
    margin: 6px 0;
    line-height: 1.7;
    word-break: break-all;
}

.label-icon {
    margin-right: 4px;
    vertical-align: -2px;
    color: var(--el-text-color-secondary);
}

.link-block + .link-block {
    margin-top: 8px;
}

.subscribe-block {
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px dashed var(--el-border-color-lighter);
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

.expiry-actions {
    margin-top: 12px;
    display: flex;
    justify-content: flex-end;
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

.plan-back-btn {
    align-self: flex-start;
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

.plan-success-fresh {
    margin-top: 8px !important;
}

.plan-success-fresh strong {
    font-weight: 800;
    color: #0b558e;
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

.qrcodeCenter {
    text-align: center;
    margin: 0;
    word-break: break-all;
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

.node-block {
    padding: 4px 0;
    border-top: 1px dashed rgba(0, 0, 0, 0.2);
    border-bottom: 1px dashed rgba(0, 0, 0, 0.2);
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
