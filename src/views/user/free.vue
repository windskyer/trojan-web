<template>
    <div class="free-page">
        <div class="card">
            <p class="top-notice">{{ $t('user.free.notice', { time: noticeTime }) }}</p>
            <h1>{{ $t('user.free.title') }}</h1>

            <p>{{ $t('user.free.tip1') }}</p>
            <p>{{ $t('user.free.tip2') }}</p>
            <p>{{ $t('user.free.tip3') }}</p>
            <p>{{ $t('user.free.tip4') }}</p>

            <div class="separator">──────────</div>
            <p class="subtitle">{{ $t('user.free.subscription') }}</p>

            <div v-if="subscribeUrl" class="link-item">
                <a class="subscribe-url" :href="subscribeUrl" target="_blank" rel="noopener noreferrer">
                    {{ subscribeUrl }}
                </a>
                <el-button class="qrcode-btn" type="primary" link @click="showQRCode(subscribeUrl)">
                    {{ $t('user.info.qrcode') }}
                </el-button>
            </div>
            <p v-else class="empty-text">{{ $t('user.free.emptySubscription') }}</p>

            <div class="separator">──────────</div>
            <p class="subtitle">{{ $t('user.free.accountInfo') }}</p>
            <p>{{ $t('user.free.username') }}：{{ account.username || '-' }}</p>
            <p>{{ $t('user.free.uuid') }}：{{ account.uuid || '-' }}</p>
            <p>{{ $t('user.free.password') }}：{{ account.password || '-' }}</p>
            <p>{{ $t('user.free.traffic') }}：{{ account.used }} / {{ account.quota }}</p>
            <p>{{ $t('user.free.expiryDate') }}：{{ account.expiryDate || '-' }}</p>

            <div class="separator">──────────</div>
            <p class="subtitle">{{ $t('user.free.nodeLinks') }}</p>
            <div v-if="links.length > 0" class="links">
                <div v-for="(link, index) in links" :key="`${link}-${index}`" class="link-item">
                    <a class="subscribe-url" :href="link" target="_blank" rel="noopener noreferrer">
                        {{ index + 1 }}. {{ link }}
                    </a>
                    <el-button class="qrcode-btn" type="primary" link @click="showQRCode(link)">
                        {{ $t('user.info.qrcode') }}
                    </el-button>
                </div>
            </div>
            <p v-else class="empty-text">{{ $t('user.free.emptyLinks') }}</p>

            <div class="separator">──────────</div>
            <p class="subtitle">{{ $t('user.free.cta') }}</p>

            <el-button type="primary" @click="goUpgrade">{{ $t('user.free.upgradeButton') }}</el-button>
        </div>

        <el-dialog :title="$t('user.info.qrcodeTitle')" v-model="qrcodeVisible" width="420px" @close="closeQRCode">
            <div ref="qrcode" class="qrcodeCenter"></div>
            <p class="qrcodeCenter">{{ shareLink }}</p>
        </el-dialog>

        <div class="ad-float">
            <p class="ad-float-title">{{ $t('user.free.noticeTitle') }}</p>
            <div v-if="adNoticeHtml" class="ad-content" v-html="adNoticeHtml"></div>
            <div v-else>
                <p class="empty-text">{{ $t('user.free.noticeLoadFail') }}</p>
                <a class="subscribe-url" :href="adNoticeApi" target="_blank" rel="noopener noreferrer">
                    {{ adNoticeApi }}
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { freeUserInfo } from '@/api/user'
import { readableBytes } from '@/utils/common'
import QRCode from 'easyqrcodejs'

export default {
    name: 'FreePage',
    data() {
        return {
            subscribeUrl: '',
            links: [],
            noticeTime: '',
            adNoticeApi: 'https://pp.flftuu.com/img/notice.json',
            adNoticeHtml: '',
            qrcodeVisible: false,
            shareLink: '',
            account: {
                username: '',
                uuid: '',
                password: '',
                used: '0 Bytes',
                quota: '0 Bytes',
                expiryDate: ''
            }
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
        buildSubscribeUrl(username, encodedPassword) {
            if (!username || !encodedPassword) {
                return ''
            }
            const decodedPassword = this.decodeBase64(encodedPassword)
            const userInfo = btoa(`{"user": "${username}", "pass": "${decodedPassword}"}`)
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
                const response = await fetch(this.adNoticeApi, { method: 'GET' })
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
                    ElMessage.error(result.message || this.$t('user.free.fetchFail'))
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
                this.subscribeUrl = this.buildSubscribeUrl(userinfo.Username || '', userinfo.Password || '') || links[0] || ''
                this.account = {
                    username: userinfo.Username || '',
                    uuid: userinfo.UUID || '',
                    password: this.decodeBase64(userinfo.Password || ''),
                    used: readableBytes(used),
                    quota: quota === -1 ? this.$t('user.unlimit') : readableBytes(quota),
                    expiryDate: userinfo.ExpiryDate || ''
                }
            } catch (error) {
                ElMessage.error(this.$t('user.free.fetchFail'))
            }
        },
        showQRCode(url) {
            this.shareLink = url
            this.qrcodeVisible = true
            this.$nextTick(() => {
                if (!this.$refs.qrcode) {
                    return
                }
                this.$refs.qrcode.innerHTML = ''
                // eslint-disable-next-line no-new
                new QRCode(this.$refs.qrcode, {
                    width: 220,
                    height: 220,
                    text: this.shareLink
                })
            })
        },
        closeQRCode() {
            if (this.$refs.qrcode) {
                this.$refs.qrcode.innerHTML = ''
            }
            this.shareLink = ''
        },
        goUpgrade() {
            this.$router.push('/login').catch(() => { })
        }
    }
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

h1 {
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

.separator {
    margin: 14px 0;
    color: #a08a73;
}

.links {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.link-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
}

.subscribe-url {
    display: block;
    color: #8a5a32;
    text-decoration: none;
    word-break: break-all;
}

.subscribe-url:hover {
    text-decoration: underline;
    color: #6f451f;
}

.empty-text {
    color: #9a8268;
}

.qrcode-btn {
    margin: 0;
}

.ad-float {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 320px;
    height: 320px;
    padding: 12px;
    border-radius: 12px;
    background: rgba(255, 250, 243, 0.98);
    border: 1px solid #e6d8c3;
    box-shadow: 0 14px 30px rgba(90, 66, 44, 0.2);
    z-index: 999;
    overflow: auto;
}

.ad-float-title {
    margin: 0 0 8px;
    font-weight: 600;
    text-align: center;
    color: #8b5e34;
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
}

@media (max-width: 768px) {
    .ad-float {
        right: 10px;
        left: 10px;
        bottom: 10px;
        width: auto;
        height: 220px;
    }
}
</style>
