<template>
    <div class="free-page">
        <div class="card">
            <p class="top-notice">
                {{ $t('user.free.notice', { time: noticeTime }) }}
            </p>
            <h2>{{ $t('user.free.title') }}</h2>

            <p>{{ $t('user.free.tip1') }}</p>
            <p>{{ $t('user.free.tip2') }}</p>
            <p>{{ $t('user.free.tip3') }}</p>
            <p>{{ $t('user.free.tip4') }}</p>

            <div class="divider"></div>
            <p class="subtitle">{{ $t('user.free.subscription') }}</p>

            <div v-if="subscribeUrl" class="link-item">
                <div class="link-row">
                    <span
                        class="subscribe-url is-copy"
                        @click="copyText(subscribeUrl)"
                    >
                        {{ subscribeUrl }}
                    </span>
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
            <p v-else class="empty-text">
                {{ $t('user.free.emptySubscription') }}
            </p>

            <div class="divider"></div>
            <p class="subtitle">{{ $t('user.free.accountInfo') }}</p>
            <p>{{ $t('user.free.username') }}：{{ account.username || '-' }}</p>
            <p>{{ $t('user.free.password') }}：{{ account.password || '-' }}</p>
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
            <p class="subtitle">{{ $t('user.free.nodeLinks') }}</p>
            <div v-if="links.length > 0" class="links">
                <div
                    v-for="(link, index) in links"
                    :key="`${link}-${index}`"
                    class="link-item"
                >
                    <div class="link-row">
                        <span
                            class="subscribe-url is-copy"
                            @click="copyText(link)"
                        >
                            {{ index + 1 }}. {{ link }}
                        </span>
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
            <p v-else class="empty-text">{{ $t('user.free.emptyLinks') }}</p>

            <div class="divider"></div>
            <p class="subtitle">{{ $t('user.free.cta') }}</p>

            <div class="action-buttons">
                <el-button type="primary" @click="goLogin">{{
                    $t('user.free.login')
                }}</el-button>
                <el-button type="primary" @click="goUpgrade">{{
                    $t('user.free.upgradeButton')
                }}</el-button>
                <el-button
                    class="join-group-btn"
                    type="success"
                    @click="openTelegramChannel"
                    >{{ $t('user.free.telegramChannel') }}</el-button
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

        <div class="ad-float" :class="{ 'is-collapsed': adCollapsed }">
            <div class="ad-float-head">
                <p class="ad-float-title">{{ $t('user.free.noticeTitle') }}</p>
                <el-button
                    class="ad-toggle-btn"
                    type="primary"
                    link
                    @click="adCollapsed = !adCollapsed"
                >
                    {{ adCollapsed ? '+' : '-' }}
                </el-button>
            </div>
            <div v-show="!adCollapsed">
                <div
                    v-if="adNoticeHtml"
                    class="ad-content"
                    v-html="adNoticeHtml"
                ></div>
                <div v-else>
                    <p class="empty-text">
                        {{ $t('user.free.noticeLoadFail') }}
                    </p>
                    <a
                        class="subscribe-url"
                        :href="adNoticeApi"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {{ adNoticeApi }}
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { freeUserInfo } from '@/api/user'
import { readableBytes } from '@/utils/common'
import { Grid, Link as LinkIcon } from '@element-plus/icons-vue'
import QRCode from 'easyqrcodejs'
import { ElMessage } from 'element-plus'

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
            noticeTime: '',
            adNoticeApi: 'https://pp.flftuu.com/img/notice.json',
            adNoticeHtml: '',
            adCollapsed: false,
            qrcodeVisible: false,
            shareLink: '',
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
        this.noticeTime = this.formatNow()
        this.getAdNotice()
        this.getFreeUserInfo()
    },
    methods: {
        formatNow() {
            const now = new Date()
            const pad = (n) => String(n).padStart(2, '0')
            const yyyy = now.getFullYear()
            const mm = pad(now.getMonth() + 1)
            const dd = pad(now.getDate())
            const hh = pad(now.getHours())
            const mi = pad(now.getMinutes())
            return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
        },
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
        normalizeAdNotice(raw) {
            if (Array.isArray(raw) && raw.length > 0) {
                return this.normalizeAdNotice(raw[0])
            }
            if (typeof raw === 'string') {
                return raw
            }
            if (!raw || typeof raw !== 'object') {
                return ''
            }
            return raw.html || raw.content || raw.text || raw.notice || ''
        },
        async getAdNotice() {
            try {
                const response = await fetch(this.adNoticeApi, {
                    method: 'GET',
                })
                if (!response.ok) {
                    return
                }
                const raw = await response.json()
                this.adNoticeHtml = this.normalizeAdNotice(raw)
            } catch (error) {
                this.adNoticeHtml = ''
            }
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
        goUpgrade() {
            const start = encodeURIComponent(btoa('buy'))
            const url = `https://t.me/TrojanAccess_bot?start=${start}`
            window.open(url, '_blank')
        },
    },
}
</script>

<style lang="scss" scoped>
.free-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background-color: #2d3a4b;
}

.card {
    width: 100%;
    max-width: 860px;
    background: rgba(255, 251, 245, 0.96);
    border-radius: 12px;
    padding: 24px;
    border: 1px solid #e8dcc9;
    box-shadow: 0 12px 30px rgba(90, 66, 44, 0.14);
    line-height: 1.9;
    color: #3d3124;
    word-break: break-word;
}

h2 {
    margin: 0 0 12px 0;
    font-size: 24px;
}

p {
    margin: 6px 0;
}

.top-notice {
    margin: 0 0 10px;
    text-align: center;
    font-weight: 600;
    color: #8b5e34;
}

.subtitle {
    font-weight: 600;
}

.divider {
    height: 1px;
    margin: 10px 0 12px;
    background: #ededed;
}

.links {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.link-item {
    display: block;
}

.link-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    flex-wrap: wrap;
}

.link-actions {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    margin-top: 4px;
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
    .link-actions {
        opacity: 1;
        transform: none;
        pointer-events: auto;
    }
}

.subscribe-url {
    display: block;
    color: #8a5a32;
    text-decoration: none;
    word-break: break-all;
    flex: 1 1 100%;
}

.subscribe-url.is-copy {
    cursor: pointer;
    text-decoration: underline;
}

.subscribe-url:hover {
    text-decoration: underline;
    color: #6f451f;
}

.empty-text {
    color: #9a8268;
}

.action-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.join-group-btn {
    margin-left: auto;
}

.ad-float {
    position: fixed;
    right: 20px;
    top: 20px;
    width: 320px;
    height: auto;
    max-height: 320px;
    padding: 12px;
    border-radius: 12px;
    background: rgba(255, 250, 243, 0.98);
    border: 1px solid #e6d8c3;
    box-shadow: 0 14px 30px rgba(90, 66, 44, 0.2);
    z-index: 999;
    overflow: auto;
    animation: noticeFloat 3.2s ease-in-out infinite;
}

.ad-float-title {
    margin: 0;
    font-weight: 600;
    color: #8b5e34;
}

.ad-float-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
}

.ad-toggle-btn {
    font-size: 20px;
    line-height: 1;
    padding: 0;
}

.ad-float.is-collapsed {
    height: auto;
}

.ad-content {
    text-align: center;
    word-break: break-word;
}

.ad-content :deep(a) {
    color: #6f451f;
    font-weight: 600;
    text-decoration: underline;
}

.ad-content :deep(h1),
.ad-content :deep(h2),
.ad-content :deep(h3),
.ad-content :deep(p),
.ad-content :deep(div) {
    margin: 6px 0;
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

@keyframes noticeFloat {
    0% {
        transform: translateY(0);
        box-shadow: 0 14px 30px rgba(90, 66, 44, 0.2);
    }

    50% {
        transform: translateY(-14px);
        box-shadow: 0 18px 34px rgba(90, 66, 44, 0.24);
    }

    100% {
        transform: translateY(0);
        box-shadow: 0 14px 30px rgba(90, 66, 44, 0.2);
    }
}

@media (max-width: 768px) {
    .free-page {
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
        padding: 12px;
    }

    .card {
        max-width: none;
    }

    .ad-float {
        position: sticky;
        top: 10px;
        order: -1;
        width: 100%;
        height: auto;
        max-height: 220px;
        margin-bottom: 12px;
        animation: none;
        z-index: 20;
    }

    .ad-float.is-collapsed {
        max-height: none;
    }
}
</style>
