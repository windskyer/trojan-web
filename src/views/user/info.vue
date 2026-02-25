<template>
  <div class="info-page">
    <div class="card">
      <h2>{{ $t('user.info.accountTitle') }}</h2>
      <div class="divider"></div>
      <p>{{ $t('user.info.username') }}: {{ user.username }}</p>
      <p>{{ $t('user.info.email') }}: {{ user.email }}</p>
      <p>{{ $t('user.info.linkPassword') }}: {{ user.password }}</p>
    </div>

    <div class="card">
      <h2>{{ $t('user.info.trafficTitle') }}</h2>
      <div class="divider"></div>
      <p>{{ progressBar }} {{ usedPercent.toFixed(1) }}%</p>
      <p>{{ $t('user.info.used') }}: {{ formatBytes(user.usedBytes) }} / {{ $t('user.info.total') }}: {{
        formatBytes(user.totalBytes) }}</p>
      <p>{{ $t('user.info.remaining') }}: {{ formatBytes(remainBytes) }}</p>
    </div>

    <div class="card">
      <h2>{{ $t('user.info.expiryTitle') }}</h2>
      <div class="divider"></div>
      <p>{{ $t('user.info.expiryDate') }}: {{ user.expiryDate }}</p>
      <p>{{ $t('user.info.remainingDays') }}: {{ remainDays }} {{ $t('user.days') }}</p>
      <div class="expiry-actions">
        <el-button :type="remainDays <= 7 ? 'danger' : 'primary'" @click="openRenewBot">{{ renewButtonText
          }}</el-button>
        <el-button type="info" plain @click="openDetailPage">{{ $t('user.info.viewDetail') }}</el-button>
      </div>
    </div>

    <div class="card">
      <h2>{{ $t('user.info.subscriptionTitle') }}</h2>
      <div class="divider"></div>

      <div class="link-block" v-for="(item, index) in normalizedLinks" :key="`${item.url}-${index}`">
        <p>{{ item.name }}</p>
        <p class="link-text" @click="copyText(item.url)">{{ item.url }}</p>
        <el-button type="primary" link @click="showQRCode(item.url)">{{ $t('user.info.qrcode') }}</el-button>
      </div>
      <p v-if="normalizedLinks.length === 0">{{ $t('user.info.noLinks') }}</p>
    </div>

    <el-dialog :title="$t('user.info.qrcodeTitle')" v-model="qrcodeVisible" width="420px" @close="closeQRCode">
      <div ref="qrcode" class="qrcodeCenter"></div>
      <p class="qrcodeCenter">{{ shareLink }}</p>
    </el-dialog>
  </div>
</template>

<script>
import { userInfo } from '@/api/user'
import { readableBytes } from '@/utils/common'
import QRCode from 'easyqrcodejs'

const BYTES_PER_GB = 1024 * 1024 * 1024

export default {
  name: 'UserInfo',
  data() {
    return {
      user: {
        username: '',
        email: '',
        password: '',
        usedBytes: 0,
        totalBytes: 0,
        usedGB: 0,
        totalGB: 0,
        expiryDate: '',
        links: [],
      },
      qrcodeVisible: false,
      shareLink: ''
    }
  },
  created() {
    this.getUserInfo()
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
            const name = protocol ? `${protocol.toUpperCase()} (${this.$t('user.info.clickToCopy')})` : `${this.$t('user.info.linkName')} ${index + 1}`
            return { name, url: item }
          }
          if (!item || typeof item !== 'object') {
            return null
          }
          const url = item.url || item.link || item.value || ''
          if (!url) {
            return null
          }
          const name = item.name || item.title || `${this.$t('user.info.linkName')} ${index + 1}`
          return { name, url }
        })
        .filter(Boolean)
    },
    renewButtonText() {
      return this.remainDays <= 7 ? this.$t('user.info.renewUrgent') : this.$t('user.info.renew')
    }
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
      const startParam = encodeURIComponent(this.encodeStartValue(`buy_${this.user.email}` || 'buy'))
      const url = `https://t.me/TrojanAccess_bot?start=${startParam}`
      window.open(url, '_blank')
    },
    openDetailPage() {
      const startValue = encodeURIComponent(this.encodeStartValue(this.user.email ? `me_${this.user.email}` : 'me'))
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
          this.$message.error(result.message || this.$t('user.info.fetchFail'))
          return
        }
        const userinfo = result.data.userinfo || {}
        const usedBytes = Number(userinfo.Download ?? userinfo.download ?? 0) + Number(userinfo.Upload ?? userinfo.upload ?? 0)
        const quotaBytes = Number(userinfo.Quota ?? userinfo.quota ?? 0)
        const usedGB = Number(userinfo.usedGB ?? userinfo.UsedGB ?? userinfo.used ?? userinfo.Used ?? this.bytesToGB(usedBytes))
        const totalGB = Number(userinfo.totalGB ?? userinfo.TotalGB ?? userinfo.total ?? userinfo.Total ?? this.bytesToGB(quotaBytes))
        this.user = {
          username: userinfo.username || userinfo.Username || '',
          email: userinfo.email || userinfo.Email || '',
          password: this.decodePassword(userinfo.password || userinfo.Password || ''),
          usedBytes: usedBytes || this.toBytes(usedGB),
          totalBytes: quotaBytes || this.toBytes(totalGB),
          usedGB,
          totalGB,
          expiryDate: userinfo.expiryDate || userinfo.ExpiryDate || '',
          links: result.data.links || [],
        }
      } catch (error) {
        this.$message.error(this.$t('user.info.fetchFail'))
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
    }
  }
}
</script>

<style scoped>
.info-page {
  max-width: 980px;
  margin: 20px auto;
  padding: 0 16px 24px;
}

.card {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e8e8e8;
}

.card h2 {
  margin: 0;
  font-size: 18px;
}

.divider {
  height: 1px;
  margin: 10px 0 12px;
  background: #ededed;
}

.card p {
  margin: 6px 0;
  line-height: 1.7;
  word-break: break-all;
}

.link-block+.link-block {
  margin-top: 14px;
}

.link-text {
  margin: 6px 0 0;
  color: #0d6efd;
  cursor: pointer;
  text-decoration: underline;
}

.expiry-actions {
  margin-top: 12px;
}

.qrcodeCenter {
  text-align: center;
}
</style>
