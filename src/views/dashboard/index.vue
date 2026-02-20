<template>
    <div>
        <el-row v-if="isAdmin">
            <el-col :span='24'>
                <el-card shadow="hover">
                    <el-row>
                        <el-col :sm="24" :md="12">
                            <el-row>
                                <el-col :span="12" style="text-align: center">
                                    <el-progress type="dashboard" :percentage="cpu.percentage"
                                        :color="cpu.color"></el-progress>
                                    <div>CPU</div>
                                </el-col>
                                <el-col :span="12" style="text-align: center">
                                    <el-progress type="dashboard" :percentage="memory.percentage"
                                        :color="memory.color"></el-progress>
                                    <div>{{ $t('dashboard.memory') }}: {{ memory.used }}/{{ memory.total }}</div>
                                </el-col>
                            </el-row>
                        </el-col>
                        <el-col :sm="24" :md="12">
                            <el-row>
                                <el-col :span="12" style="text-align: center">
                                    <el-progress type="dashboard" :percentage="swap.percentage"
                                        :color="swap.color"></el-progress>
                                    <div>swap: {{ swap.used }}/{{ swap.total }}</div>
                                </el-col>
                                <el-col :span="12" style="text-align: center">
                                    <el-progress type="dashboard" :percentage="disk.percentage"
                                        :color="disk.color"></el-progress>
                                    <div>{{ $t('dashboard.disk') }}: {{ disk.used }}/{{ disk.total }}</div>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
        </el-row>
        <el-row>
            <el-col :sm="24" :md="12">
                <el-card class="home-card" shadow="hover">
                    <el-row>
                        <el-col :span="10">
                            <b>{{ $t('dashboard.trojanVersion') }}: </b>
                        </el-col>
                        <el-col :span="12" style="padding-top:1px">
                            {{ trojanVersion }}
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
            <el-col :sm="24" :md="12">
                <el-card class="home-card" shadow="hover">
                    <el-row>
                        <el-col :span="10">
                            <b>{{ $t('dashboard.trojanUser') }}:</b>
                        </el-col>
                        <el-col :span="12" style="padding-top:1px">
                            <el-link type='primary' @click="navigate('/user')">{{ userNum }}</el-link>
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
        </el-row>
        <el-row>
            <el-col :sm="24" :md="12">
                <el-card class="home-card" shadow="hover">
                    <el-row>
                        <el-col :span="10">
                            <b>{{ $t('dashboard.trojanUptime') }}:</b>
                        </el-col>
                        <el-col :span="12" style="padding-top:1px">
                            {{ trojanUptime }}
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
            <el-col :sm="24" :md="12" v-if="isAdmin">
                <el-card class="home-card" shadow="hover">
                    <el-row>
                        <el-col :span="10">
                            <b>{{ $t('dashboard.load') }}:</b>
                        </el-col>
                        <el-tooltip class="item" effect="dark" content="load1, load5, load15" placement="top-start">
                            <el-col :span="12" style="padding-top:1px">
                                {{ load }}
                            </el-col>
                        </el-tooltip>
                    </el-row>
                </el-card>
            </el-col>
        </el-row>
        <el-row>
            <el-col :sm="24" :md="12" v-if="isAdmin">
                <el-card class="home-card" shadow="hover">
                    <el-row>
                        <el-col :span="10">
                            <b>{{ $t('dashboard.netSpeed') }}:</b>
                        </el-col>
                        <el-col :span="12" style="padding-top:1px">
                            <i class="el-icon-top" style="margin-right: 8px">{{ netSpeed.up }}</i>
                            <i class="el-icon-bottom">{{ netSpeed.down }}</i>
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
            <el-col :sm="24" :md="12" v-if="isAdmin">
                <el-card class="home-card" shadow="hover">
                    <el-row>
                        <el-col :span="10">
                            <b>{{ $t('dashboard.netCount') }}:</b>
                        </el-col>
                        <el-tooltip class="item" effect="dark" content="tcp / udp" placement="top-start">
                            <el-col :span="12" style="padding-top:1px">
                                {{ netCount }}
                            </el-col>
                        </el-tooltip>
                    </el-row>
                </el-card>
            </el-col>
        </el-row>
        <el-row style="margin-top:10px">
            <el-col :span='7'>
                <el-card shadow="hover">
                    {{ $t('dashboard.upload') }}:
                    <el-tag effect="dark" type="success">{{ uploadData }}</el-tag>
                </el-card>
            </el-col>
            <el-col :span='7' :offset='1'>
                <el-card shadow="hover">
                    {{ $t('dashboard.download') }}:
                    <el-tag effect="dark" type="success">{{ downloadData }}</el-tag>
                </el-card>
            </el-col>
            <el-col :span='7' :offset='1'>
                <el-card shadow="hover">
                    {{ $t('dashboard.total') }}:
                    <el-tag effect="dark" type="success">{{ totalData }}</el-tag>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { version, serverInfo } from '@/api/common'
import { userTotal } from '@/api/user'
import { readableBytes } from '@/utils/common'
import { useSettingsStore } from '@/store/settings'
import { useUserStore } from '@/store/user'

export default {
    name: 'DashboardIndex',
    setup() {
        const settingsStore = useSettingsStore()
        const userStore = useUserStore()
        return {
            settingsStore,
            userStore
        }
    },
    data() {
        return {
            timer: null,
            trojanVersion: '',
            trojanUptime: '',
            keyOffset: 0,
            valueOffset: 0,
            userList: [],
            userNum: 0,
            downloadData: 0,
            uploadData: 0,
            totalData: 0,
            cpu: { percentage: 0, color: '' },
            memory: { percentage: 0, used: 0, total: 0, color: '' },
            swap: { percentage: 0, used: 0, total: 0, color: '' },
            disk: { percentage: 0, used: 0, total: 0, color: '' },
            load: '',
            netSpeed: { up: '', down: '' },
            netCount: ''
        }
    },
    computed: {
        isAdmin() {
            return this.userStore.isAdmin
        }
    },
    created() {
        this.settingsStore.setNprogress(false)
        this.setOffset()
        this.getVersion()
        this.getUserTotal()
    },
    mounted() {
        if (this.isAdmin) {
            this.getServerInfo()
        }
        this.timer = setInterval(() => {
            if (this.isAdmin) {
                this.getServerInfo()
            }
            this.getVersion()
            this.getUserTotal()
        }, 6000)
        window.onresize = () => {
            return (() => {
                this.setOffset()
            })()
        }
    },
    unmounted() {
        this.settingsStore.setNprogress(true)
        clearInterval(this.timer)
    },
    methods: {
        setOffset() {
            const clientWith = document.body.clientWidth
            if (clientWith < 1000) {
                this.keyOffset = 1
                this.valueOffset = 2
                this.iconShow = false
            } else {
                this.keyOffset = 0
                this.valueOffset = 0
                this.iconShow = true
            }
        },
        navigate(path) {
            this.$router.push({ path: path })
        },
        getServerInfo() {
            serverInfo().then((res) => {
                const data = res.data
                this.cpu.percentage = parseFloat(data.cpu[0].toFixed(2))
                this.cpu.color = this.computeColor(this.cpu.percentage)
                this.memory = this.computePercent(data.memory)
                this.swap = this.computePercent(data.swap)
                this.disk = this.computePercent(data.disk)
                this.netSpeed.up = readableBytes(data.speed.Up) + '/s'
                this.netSpeed.down = readableBytes(data.speed.Down) + '/s'
                this.netCount = data.netCount.tcp + ' / ' + data.netCount.udp
                this.load = data.load.load1 + ', ' + data.load.load5 + ', ' + data.load.load15
            })
        },
        computePercent(data) {
            const percent = parseFloat(data.usedPercent.toFixed(2))
            return {
                percentage: percent,
                used: readableBytes(data.used),
                total: readableBytes(data.total),
                color: this.computeColor(percent)
            }
        },
        computeColor(percent) {
            if (percent < 80) {
                return '#67C23A'
            } else if (percent < 90) {
                return '#E6A23C'
            } else {
                return '#F56C6C'
            }
        },
        async getUserTotal() {
            const result = await userTotal()
            if (result.message === 'success') {
                this.userNum = result.data.total
                this.downloadData = readableBytes(result.data.download)
                this.uploadData = readableBytes(result.data.upload)
                this.totalData = readableBytes(result.data.download + result.data.upload)
            } else {
                this.$message.error(result.message)
            }
        },
        async getVersion() {
            const result = await version()
            const data = result.data
            this.trojanVersion = data.trojanType + '/' + data.trojanVersion
            this.trojanUptime = data.trojanUptime
        }
    }
}
</script>

<style lang="scss" scoped>
.home-icon {
    font-size: 32px;
    padding: 0;
}

.home-card {
    // margin-top:10px;
    padding: 3px;
}
</style>