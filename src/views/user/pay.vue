<template>
  <div class="pay-page">
    <div class="pay-card">
      <h1>{{ $t('user.pay.title') }}</h1>
      <div v-if="orderQrImage" class="qrcode-wrap">
        <img :src="orderQrImage" :alt="`${orderName} qrcode`" class="qrcode-image" />
      </div>
      <div class="notice-block">
        <p>{{ $t('user.pay.notice1') }}</p>
        <p class="order-copy" @click="copyOrderName">{{ orderName || '-' }}</p>
        <p class="notice-sub">{{ $t('user.pay.notice1Sub') }}</p>
        <p class="notice-line">
          {{ $t('user.pay.notice2') }}
          <a class="notice-btn" :href="supportLink" target="_blank" rel="noopener noreferrer">
            {{ $t('user.pay.sendProof') }}
          </a>
        </p>
        <p class="notice-warn">{{ $t('user.pay.noticeWarn') }}</p>
        <p class="notice-sub">{{ $t('user.pay.noticeSub') }}</p>
      </div>

      <div v-if="loading" class="status">{{ $t('user.pay.loading') }}</div>
      <div v-else-if="error" class="status error">{{ error }}</div>
      <div v-else>
        <div class="section">
          <h2>{{ $t('user.pay.orderTitle') }}</h2>
          <div class="divider"></div>
          <p v-if="!orderName" class="empty">{{ $t('user.pay.emptyOrder') }}</p>
          <div v-else class="info-list">
            <p v-for="(row, index) in orderRows" :key="`order-${index}`">
              <span class="label">{{ row.label }}：</span>
              <span class="value">{{ row.value }}</span>
            </p>
            <p v-if="orderStatusText">
              <span class="label">{{ $t('user.pay.orderStatus') }}：</span>
              <span class="status-badge" :class="statusClass">{{ orderStatusText }}</span>
            </p>
          </div>
        </div>

        <div class="section">
          <h2>{{ $t('user.pay.planTitle') }}</h2>
          <div class="divider"></div>
          <p v-if="planRows.length === 0" class="empty">{{ $t('user.pay.emptyPlan') }}</p>
          <div v-else class="info-list">
            <p v-for="(row, index) in planRows" :key="`plan-${index}`">
              <span class="label">{{ row.label }}：</span>
              <span class="value">{{ row.value }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { orderInfo, planInfo } from '@/api/user'

const BASE_URL = import.meta.env.BASE_URL || '/'
const assetUrl = (filename) => `${BASE_URL}qrcodes/${filename}`

const QR_IMAGE_MAP = {
  'basic.jpeg': assetUrl('basic.jpeg'),
  'monthly.jpeg': assetUrl('monthly.jpeg'),
  'seasonal.jpeg': assetUrl('seasonal.jpeg'),
  'halfyear.jpeg': assetUrl('halfyear.jpeg'),
  'yearly.jpeg': assetUrl('yearly.jpeg'),
  'free.jpeg': assetUrl('free.jpeg')
}

export default {
  name: 'PayPage',
  data() {
    return {
      orderName: '',
      order: null,
      plan: null,
      loading: false,
      error: '',
      supportLink: 'https://t.me/TrojanAccess_bot',
      pollTimer: null,
      redirected: false
    }
  },
  computed: {
    orderRows() {
      if (!this.orderName) return []
      const order = this.order || {}
      const rows = [
        { label: this.$t('user.pay.orderName'), value: order.order_name || this.orderName },
        { label: this.$t('user.pay.orderPaidAt'), value: order.paid_at },
        { label: this.$t('user.pay.orderTg'), value: order.tg_username },
        { label: this.$t('user.pay.orderEmail'), value: order.email }
      ]
      return rows.filter(item => item.value !== undefined && item.value !== null && item.value !== '')
    },
    orderStatusText() {
      const order = this.order || {}
      const status = String(order.status || '').toLowerCase()
      if (!status) return ''
      const map = {
        pending: this.$t('user.pay.status.pending'),
        paid: this.$t('user.pay.status.paid'),
        success: this.$t('user.pay.status.success'),
        fail: this.$t('user.pay.status.fail'),
        expired: this.$t('user.pay.status.expired'),
        refunded: this.$t('user.pay.status.refunded')
      }
      return map[status] || order.status
    },
    statusClass() {
      const status = String(this.orderStatusText || '').toLowerCase()
      if (['paid', 'success', 'completed', 'done'].includes(status)) return 'success'
      if (['pending', 'processing', 'unpaid', 'created'].includes(status)) return 'pending'
      if (['failed', 'expired', 'canceled', 'cancelled'].includes(status)) return 'failed'
      return 'default'
    },
    planRows() {
      const plan = this.plan || {}
      const rows = [
        { label: this.$t('user.pay.planName'), value: plan.name },
        { label: this.$t('user.pay.planLabel'), value: plan.label },
        { label: this.$t('user.pay.planPrice'), value: this.formatAmount(plan.price) },
        { label: this.$t('user.pay.planPeriod'), value: this.formatDays(plan.duration_days) },
        { label: this.$t('user.pay.planTraffic'), value: this.formatTraffic(plan.total_data_gb) }
      ]
      return rows.filter(item => item.value !== undefined && item.value !== null && item.value !== '')
    },
    orderQrImage() {
      const order = this.order || {}
      const plan = this.plan || {}
      const path =
        order.image_path ||
        plan.image_path ||
        order.qrcode ||
        order.qrCode ||
        order.qrImage ||
        order.payQrCode ||
        ''
      if (!path) return ''
      const filename = String(path).split('/').pop()
      if (filename && QR_IMAGE_MAP[filename]) {
        return QR_IMAGE_MAP[filename]
      }
      if (/^https?:\/\//.test(path)) return path
      const base = window.location.origin
      return `${base}/${path}`.replace(/\/{2,}/g, '/').replace(':/', '://')
    },
  },
  created() {
    this.syncFromRoute()
  },
  beforeUnmount() {
    this.stopPolling()
  },
  watch: {
    '$route.fullPath'() {
      this.syncFromRoute()
    }
  },
  methods: {
    normalizeOrderName(value) {
      if (!value) return ''
      return String(value).trim()
    },
    syncFromRoute() {
      const routeOrder = this.$route.params.order
      this.orderName = this.normalizeOrderName(routeOrder)
      this.fetchDetail()
    },
    async copyOrderName() {
      if (!this.orderName) return
      try {
        await navigator.clipboard.writeText(this.orderName)
        this.$message.success(this.$t('user.pay.copySuccess'))
      } catch (error) {
        this.$message.error(this.$t('user.pay.copyFail'))
      }
    },
    startPolling() {
      this.stopPolling()
      if (!this.orderName) return
      setTimeout(() => {
        if (this.pollTimer || !this.orderName) return
        this.pollTimer = setInterval(() => {
          this.fetchDetail(true)
        }, 3000)
      }, 3000)
    },
    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },
    updatePollingByStatus(status) {
      const next = String(status || '').toLowerCase()
      if (next === 'pending') {
        if (!this.pollTimer) {
          this.startPolling()
        }
      } else {
        this.stopPolling()
      }
    },
    showSuccessNotice() {
      const status = String((this.order || {}).status || '').toLowerCase()
      if (status !== 'success') return
      if (this.redirected) return
      this.redirected = true
      this.$message.success(this.$t('user.pay.successTip'))
      window.location.hash = '#/login'
    },
    formatAmount(value) {
      if (value === undefined || value === null || value === '') return ''
      const num = Number(value)
      if (!Number.isFinite(num)) return value
      return num.toFixed(2)
    },
    formatDays(value) {
      if (value === undefined || value === null || value === '') return ''
      const num = Number(value)
      if (!Number.isFinite(num)) return value
      return this.$t('user.pay.dayUnit', { count: num })
    },
    formatTraffic(value) {
      if (value === undefined || value === null || value === '') return ''
      const num = Number(value)
      if (!Number.isFinite(num)) return value
      return `${num} GB`
    },
    isSuccess(result) {
      if (!result) return false
      if (result.message === 'success') return true
      return false
    },
    async fetchDetail(isPolling = false) {
      if (!this.orderName) {
        this.order = null
        this.plan = null
        this.error = ''
        return
      }
      if (!isPolling) {
        this.loading = true
        this.error = ''
      }
      try {
        const orderResult = await orderInfo(this.orderName)
        if (!this.isSuccess(orderResult)) {
          this.error = orderResult?.message || this.$t('user.pay.fetchOrderFail')
          this.order = null
          this.plan = null
          this.$router.replace('/login').catch(() => { })
          return
        }
        const orderData = orderResult.data || {}
        this.order = orderData || null
        this.showSuccessNotice()
        this.updatePollingByStatus(this.order?.status)
        if (!isPolling) {
          const planId = orderData.plan_id || ''
          if (!planId) {
            this.plan = null
            return
          }
          const planResult = await planInfo(planId)
          if (!this.isSuccess(planResult)) {
            this.plan = null
            return
          }
          const planData = planResult.data || {}
          this.plan = planData.plan || planData.info || planData || null
        }
      } catch (error) {
        this.error = this.$t('user.pay.fetchOrderFail')
      } finally {
        if (!isPolling) {
          this.loading = false
        }
      }
    }
  }
}
</script>

<style scoped>
.pay-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #2d3a4b;
}

.pay-card {
  width: 100%;
  max-width: 760px;
  padding: 24px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
  text-align: left;
  position: relative;
}

h1 {
  margin: 0 0 10px;
}

.desc {
  margin: 0 0 16px;
  color: #667085;
}

.section {
  margin-top: 20px;
}

.section h2 {
  margin: 0 0 8px;
  font-size: 18px;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin-bottom: 12px;
}

.info-list p {
  margin: 6px 0;
  color: #475467;
}

.label {
  font-weight: 600;
  color: #1f2937;
}

.value {
  color: #475467;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.status-badge.pending {
  color: #b54708;
  background: #fffaeb;
}

.status-badge.pending::before {
  background: #f79009;
  box-shadow: 0 0 0 4px rgba(247, 144, 9, 0.2);
}

.status-badge.success {
  color: #027a48;
  background: #ecfdf3;
}

.status-badge.success::before {
  background: #12b76a;
  box-shadow: 0 0 0 4px rgba(18, 183, 106, 0.2);
}

.status-badge.failed {
  color: #b42318;
  background: #fef3f2;
}

.status-badge.failed::before {
  background: #f04438;
  box-shadow: 0 0 0 4px rgba(240, 68, 56, 0.2);
}

.status-badge.default {
  color: #475467;
  background: #f2f4f7;
}

.status-badge.default::before {
  background: #98a2b3;
}

.qrcode-wrap {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.qrcode-image {
  width: 300px;
  max-width: 100%;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.notice-block {
  margin: 16px 0 20px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #7c2d12;
  line-height: 1.6;
}

.notice-block p {
  margin: 6px 0;
}

.notice-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.order-copy {
  font-weight: 700;
  color: #9a3412;
  cursor: pointer;
  user-select: all;
}

.notice-sub {
  color: #9a3412;
  font-size: 12px;
}

.notice-warn {
  font-weight: 700;
}

.notice-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: #16a34a;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
}

.notice-btn:hover {
  background: #15803d;
}

.status {
  margin: 12px 0;
  color: #475467;
}

.status.error {
  color: #b42318;
}

.empty {
  color: #98a2b3;
}

.link {
  display: inline-block;
  margin-top: 10px;
  color: #2563eb;
  word-break: break-all;
}

@media (max-width: 600px) {
  .pay-card {
    padding: 16px;
  }

  .qrcode-image {
    width: 260px;
  }
}
</style>
