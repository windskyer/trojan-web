<template>
    <div class="analytics-page">
        <!-- 日期选择器 & 操作 -->
        <el-row class="toolbar" align="middle">
            <el-col :span="12">
                <el-date-picker
                    v-model="selectedDate"
                    type="date"
                    :placeholder="$t('analytics.selectDate')"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    :disabled-date="disableFuture"
                    @change="loadStats"
                />
            </el-col>
            <el-col :span="12" style="text-align: right">
                <el-button
                    type="primary"
                    :loading="sending"
                    @click="sendReport"
                >
                    📤 {{ $t('analytics.sendReport') }}
                </el-button>
            </el-col>
        </el-row>

        <!-- 汇总卡片 -->
        <el-row :gutter="12" class="summary-row">
            <el-col :xs="12" :sm="6">
                <el-card shadow="hover" class="stat-card">
                    <div class="stat-num blue">{{ totalPageViews }}</div>
                    <div class="stat-label">{{ $t('analytics.pageViews') }}</div>
                </el-card>
            </el-col>
            <el-col :xs="12" :sm="6">
                <el-card shadow="hover" class="stat-card">
                    <div class="stat-num green">{{ stats.visitors.length }}</div>
                    <div class="stat-label">{{ $t('analytics.uniqueVisitors') }}</div>
                </el-card>
            </el-col>
            <el-col :xs="12" :sm="6">
                <el-card shadow="hover" class="stat-card">
                    <div class="stat-num orange">{{ stats.newVisitors }}</div>
                    <div class="stat-label">{{ $t('analytics.newVisitors') }}</div>
                </el-card>
            </el-col>
            <el-col :xs="12" :sm="6">
                <el-card shadow="hover" class="stat-card">
                    <div class="stat-num purple">{{ stats.returningVisitors }}</div>
                    <div class="stat-label">{{ $t('analytics.returningVisitors') }}</div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="12">
            <!-- 左侧：热门页面 + 小时分布 -->
            <el-col :xs="24" :md="14">
                <!-- 热门页面 -->
                <el-card shadow="hover" class="section-card">
                    <template #header>
                        <span>📄 {{ $t('analytics.topPages') }}</span>
                    </template>
                    <div v-if="topPages.length === 0" class="empty-tip">{{ $t('analytics.noData') }}</div>
                    <div v-for="(item, i) in topPages" :key="item.path" class="bar-row">
                        <span class="bar-rank">{{ i + 1 }}</span>
                        <span class="bar-label" :title="item.path">{{ item.path }}</span>
                        <div class="bar-track">
                            <div
                                class="bar-fill blue-fill"
                                :style="{ width: pct(item.count, topPages[0].count) + '%' }"
                            ></div>
                        </div>
                        <span class="bar-count">{{ item.count }}</span>
                    </div>
                </el-card>

                <!-- 24小时访问分布 -->
                <el-card shadow="hover" class="section-card">
                    <template #header>
                        <span>🕐 {{ $t('analytics.hourlyDistribution') }}</span>
                    </template>
                    <div class="hourly-chart">
                        <div
                            v-for="h in 24"
                            :key="h - 1"
                            class="hour-col"
                            :title="`${h - 1}:00 — ${hourly[h - 1] || 0} ${$t('analytics.pageViews')}`"
                        >
                            <div
                                class="hour-bar"
                                :style="{ height: hourlyBarHeight(h - 1) + 'px' }"
                            ></div>
                            <div class="hour-label">
                                {{ h - 1 % 6 === 0 ? (h - 1) + 'h' : '' }}
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <!-- 右侧：设备 / 浏览器 / OS -->
            <el-col :xs="24" :md="10">
                <!-- 设备类型 -->
                <el-card shadow="hover" class="section-card">
                    <template #header>
                        <span>📱 {{ $t('analytics.devices') }}</span>
                    </template>
                    <div v-if="deviceList.length === 0" class="empty-tip">{{ $t('analytics.noData') }}</div>
                    <div v-for="item in deviceList" :key="item.name" class="bar-row">
                        <span class="bar-label">{{ $t('analytics.device.' + item.name) || item.name }}</span>
                        <div class="bar-track">
                            <div
                                class="bar-fill green-fill"
                                :style="{ width: pct(item.count, deviceList[0].count) + '%' }"
                            ></div>
                        </div>
                        <span class="bar-count">{{ item.count }}</span>
                    </div>
                </el-card>

                <!-- 浏览器 -->
                <el-card shadow="hover" class="section-card">
                    <template #header>
                        <span>🌐 {{ $t('analytics.browsers') }}</span>
                    </template>
                    <div v-if="browserList.length === 0" class="empty-tip">{{ $t('analytics.noData') }}</div>
                    <div v-for="item in browserList" :key="item.name" class="bar-row">
                        <span class="bar-label">{{ item.name }}</span>
                        <div class="bar-track">
                            <div
                                class="bar-fill orange-fill"
                                :style="{ width: pct(item.count, browserList[0].count) + '%' }"
                            ></div>
                        </div>
                        <span class="bar-count">{{ item.count }}</span>
                    </div>
                </el-card>

                <!-- 操作系统 -->
                <el-card shadow="hover" class="section-card">
                    <template #header>
                        <span>💻 {{ $t('analytics.os') }}</span>
                    </template>
                    <div v-if="osList.length === 0" class="empty-tip">{{ $t('analytics.noData') }}</div>
                    <div v-for="item in osList" :key="item.name" class="bar-row">
                        <span class="bar-label">{{ item.name }}</span>
                        <div class="bar-track">
                            <div
                                class="bar-fill purple-fill"
                                :style="{ width: pct(item.count, osList[0].count) + '%' }"
                            ></div>
                        </div>
                        <span class="bar-count">{{ item.count }}</span>
                    </div>
                </el-card>

                <!-- 来源 -->
                <el-card shadow="hover" class="section-card">
                    <template #header>
                        <span>🔗 {{ $t('analytics.referrers') }}</span>
                    </template>
                    <div v-if="referrerList.length === 0" class="empty-tip">{{ $t('analytics.noData') }}</div>
                    <div v-for="item in referrerList" :key="item.name" class="bar-row">
                        <span class="bar-label">{{ item.name }}</span>
                        <div class="bar-track">
                            <div
                                class="bar-fill blue-fill"
                                :style="{ width: pct(item.count, referrerList[0].count) + '%' }"
                            ></div>
                        </div>
                        <span class="bar-count">{{ item.count }}</span>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 近7天趋势 -->
        <el-card shadow="hover" class="section-card">
            <template #header>
                <span>📈 {{ $t('analytics.weekTrend') }}</span>
            </template>
            <div class="week-chart">
                <div v-for="day in weekStats" :key="day.date" class="week-col">
                    <div class="week-bars">
                        <div
                            class="week-bar pv-bar"
                            :style="{ height: weekBarHeight(day.pageViews, maxWeekPV) + 'px' }"
                            :title="`${day.date}\n${$t('analytics.pageViews')}: ${day.pageViews}`"
                        ></div>
                        <div
                            class="week-bar uv-bar"
                            :style="{ height: weekBarHeight(day.uniqueVisitors, maxWeekPV) + 'px' }"
                            :title="`${day.date}\n${$t('analytics.uniqueVisitors')}: ${day.uniqueVisitors}`"
                        ></div>
                    </div>
                    <div class="week-label">{{ day.date.slice(5) }}</div>
                </div>
            </div>
            <div class="week-legend">
                <span class="legend-dot pv-dot"></span>{{ $t('analytics.pageViews') }}
                &nbsp;&nbsp;
                <span class="legend-dot uv-dot"></span>{{ $t('analytics.uniqueVisitors') }}
            </div>
        </el-card>
    </div>
</template>

<script>
import { triggerDailyReport } from '@/api/analytics'
import { getStatsForDate, getWeekStats } from '@/utils/visitStats'

export default {
    name: 'AnalyticsIndex',
    data() {
        const today = new Date().toISOString().slice(0, 10)
        return {
            selectedDate: today,
            stats: this.emptyStats(),
            weekStats: [],
            sending: false,
        }
    },
    computed: {
        totalPageViews() {
            return Object.values(this.stats.pageViews).reduce((a, b) => a + b, 0)
        },
        topPages() {
            return Object.entries(this.stats.pageViews)
                .map(([path, count]) => ({ path, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
        },
        hourly() {
            return this.stats.hourly || {}
        },
        maxHourly() {
            return Math.max(1, ...Object.values(this.hourly))
        },
        deviceList() {
            return this.sortedList(this.stats.devices)
        },
        browserList() {
            return this.sortedList(this.stats.browsers)
        },
        osList() {
            return this.sortedList(this.stats.os)
        },
        referrerList() {
            return this.sortedList(this.stats.referrers)
        },
        maxWeekPV() {
            return Math.max(1, ...this.weekStats.map((d) => d.pageViews))
        },
    },
    created() {
        this.loadStats()
        this.weekStats = getWeekStats()
    },
    methods: {
        emptyStats() {
            return {
                pageViews: {},
                visitors: [],
                newVisitors: 0,
                returningVisitors: 0,
                hourly: {},
                devices: {},
                browsers: {},
                os: {},
                referrers: {},
            }
        },
        loadStats() {
            this.stats = getStatsForDate(this.selectedDate)
            this.weekStats = getWeekStats()
        },
        disableFuture(date) {
            return date > new Date()
        },
        sortedList(obj) {
            return Object.entries(obj || {})
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
        },
        pct(val, max) {
            return max === 0 ? 0 : Math.round((val / max) * 100)
        },
        hourlyBarHeight(h) {
            const v = this.hourly[h] || 0
            return Math.round((v / this.maxHourly) * 60)
        },
        weekBarHeight(val, max) {
            return Math.round((val / max) * 80)
        },
        async sendReport() {
            this.sending = true
            try {
                await triggerDailyReport(this.selectedDate)
                this.$message.success(this.$t('analytics.reportSent'))
            } catch {
                this.$message.error(this.$t('analytics.reportFailed'))
            } finally {
                this.sending = false
            }
        },
    },
}
</script>

<style scoped>
.analytics-page {
    padding: 4px 0;
}

.toolbar {
    margin-bottom: 12px;
}

.summary-row {
    margin-bottom: 12px;
}

.stat-card {
    text-align: center;
    padding: 8px 0;
}

.stat-num {
    font-size: 32px;
    font-weight: 700;
    line-height: 1.2;
}

.stat-label {
    font-size: 13px;
    color: #909399;
    margin-top: 4px;
}

.blue   { color: #409eff; }
.green  { color: #67c23a; }
.orange { color: #e6a23c; }
.purple { color: #9b59b6; }

.section-card {
    margin-bottom: 12px;
}

.bar-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;
    gap: 8px;
}

.bar-rank {
    width: 18px;
    color: #c0c4cc;
    flex-shrink: 0;
    text-align: right;
}

.bar-label {
    width: 120px;
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #606266;
}

.bar-track {
    flex: 1;
    height: 10px;
    background: #f0f2f5;
    border-radius: 5px;
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    border-radius: 5px;
    transition: width 0.4s;
}

.blue-fill   { background: #409eff; }
.green-fill  { background: #67c23a; }
.orange-fill { background: #e6a23c; }
.purple-fill { background: #9b59b6; }

.bar-count {
    width: 36px;
    text-align: right;
    color: #606266;
    flex-shrink: 0;
}

/* Hourly chart */
.hourly-chart {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 90px;
}

.hour-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
}

.hour-bar {
    width: 100%;
    background: #409eff;
    border-radius: 2px 2px 0 0;
    min-height: 2px;
    transition: height 0.3s;
}

.hour-label {
    font-size: 9px;
    color: #c0c4cc;
    margin-top: 2px;
    text-align: center;
    min-height: 12px;
}

/* Week trend */
.week-chart {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 100px;
}

.week-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
}

.week-bars {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    width: 100%;
    justify-content: center;
}

.week-bar {
    width: 10px;
    border-radius: 2px 2px 0 0;
    min-height: 2px;
    transition: height 0.3s;
}

.pv-bar { background: #409eff; }
.uv-bar { background: #67c23a; }

.week-label {
    font-size: 11px;
    color: #909399;
    margin-top: 4px;
}

.week-legend {
    margin-top: 8px;
    font-size: 12px;
    color: #606266;
    display: flex;
    align-items: center;
}

.legend-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    margin-right: 4px;
}

.pv-dot { background: #409eff; }
.uv-dot { background: #67c23a; }

.empty-tip {
    color: #c0c4cc;
    text-align: center;
    padding: 12px 0;
    font-size: 13px;
}
</style>
