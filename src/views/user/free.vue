<template>
    <div class="free-page">
        <div class="info-page">
            <div class="card">
                <h2>{{ $t('user.free.title') }}</h2>

                <p>{{ $t('user.free.tip1') }}</p>
                <p>{{ $t('user.free.tip2') }}</p>
                <p>{{ $t('user.free.tip3') }}</p>
                <p>{{ $t('user.free.tip4') }}</p>

                <div class="divider"></div>
                <p class="node-title">{{ $t('user.info.subscriptionTitle') }}</p>

                <div v-if="subscribeUrl" class="link-block subscribe-block">
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
                <p v-else class="empty-text">{{ $t('user.free.emptyLinks') }}</p>

                <div class="divider"></div>
                <p class="subtitle">{{ $t('user.free.cta') }}</p>

                <div class="action-buttons">
                    <el-button type="primary" plain @click="goLogin">{{
                        $t('user.free.login')
                    }}</el-button>
                    <el-button type="primary" plain @click="goRegister">{{
                        $t('user.free.registerButton')
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
        this.getFreeUserInfo()
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
        goRegister() {
            this.$router.push('/register').catch(() => {})
        },
    },
}
</script>

<style lang="scss" scoped>
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

.action-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
}

.action-buttons :deep(.el-button) {
    text-transform: uppercase;
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

    .action-buttons :deep(.el-button) {
        width: 100%;
        margin-left: 0;
    }
}
</style>
