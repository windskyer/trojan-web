<template>
    <div class="info-page">
        <div class="card">
            <h2>{{ $t('user.info.accountTitle') }}</h2>
            <div class="divider"></div>
            <p>{{ $t('user.info.username') }}: {{ user.username }}</p>
            <p>{{ $t('user.info.email') }}: {{ user.email }}</p>
            <p>
                {{ $t('user.info.uuid') }}:
                {{ user.uuid }}
            </p>
            <p>{{ $t('user.info.tgUsername') }}: {{ user.tgUsername }}</p>
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

            <div v-if="plans.length > 0" class="plan-grid">
                <div v-for="plan in plans" :key="plan.name" class="plan-card">
                    <p class="plan-label">{{ plan.label }}</p>
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
                    @click="openRenewBot"
                    >{{ renewButtonText }}</el-button
                >
                <el-button type="info" plain @click="openDetailPage">{{
                    $t('user.info.viewDetail')
                }}</el-button>
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
    </div>
</template>

<script>
import { planList, userInfo } from '@/api/user'
import { readableBytes } from '@/utils/common'
import { Grid, Link as LinkIcon } from '@element-plus/icons-vue'
import QRCode from 'easyqrcodejs'

const BYTES_PER_GB = 1024 * 1024 * 1024

export default {
    name: 'UserInfo',
    components: {
        Grid,
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
        }
    },
    created() {
        this.getUserInfo()
        this.getPlanList()
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
        encodeStartValue(value) {
            if (!value) {
                return ''
            }
            try {
                return btoa(value)
            } catch (error) {
                return ''
            }
        },
        async copyText(text) {
            try {
                await navigator.clipboard.writeText(text)
                this.$message.success(this.$t('user.info.copySuccess'))
            } catch (error) {
                this.$message.error(this.$t('user.info.copyFail'))
            }
        },
        openRenewBot() {
            const startParam = encodeURIComponent(
                this.encodeStartValue(`buy_${this.user.email}` || 'buy'),
            )
            const url = `https://t.me/TrojanAccess_bot?start=${startParam}`
            window.open(url, '_blank')
        },
        openDetailPage() {
            const startValue = encodeURIComponent(
                this.encodeStartValue(
                    this.user.email ? `me_${this.user.email}` : 'me',
                ),
            )
            const url = `https://t.me/TrojanAccess_bot?start=${startValue}`
            window.open(url, '_blank')
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
}

.plan-label {
    margin: 0 0 6px;
    font-weight: 600;
}

.plan-price {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 700;
    color: #0d6efd;
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
</style>
