<template>
    <div>
        <el-form :inline="true" label-width="80px">
            <el-form-item>
                <el-button-group>
                    <el-button type="primary" :icon="Refresh" @click="refresh()">{{ textShow($t('refresh')) }}
                    </el-button>
                    <el-button type="primary" :icon="Plus"
                        @click="commonType = 2; userInfo.username = ''; userInfo.password = ''; userInfo.email = ''; userVisible = true"
                        v-if="isAdmin">
                        {{ textShow($t('add')) }}</el-button>
                    <el-button type="primary" :icon="RefreshLeft"
                        @click="copySelection = multipleSelection; patchButton = true; commonType = 1; confirmVisible = true"
                        v-if="isAdmin">{{ textShow($t('user.reset')) }}</el-button>
                    <el-button type="primary" :icon="Scissor"
                        @click="copySelection = multipleSelection; patchButton = true; quotaVisible = true"
                        v-if="isAdmin">{{
                            textShow($t('user.limitData'))
                        }}</el-button>
                    <el-button type="danger" :icon="Delete"
                        @click="copySelection = multipleSelection; patchButton = true; commonType = 0; confirmVisible = true"
                        v-if="isAdmin">{{ textShow($t('delete')) }}</el-button>
                </el-button-group>
            </el-form-item>
        </el-form>
        <el-table :data="dataList.filter(data => !search || data.Username.toLowerCase().includes(search.toLowerCase()))"
            :height="clientHeight" @selection-change="handleSelectionChange" class="tableShow">
            <el-table-column type="selection" width="55" v-if="isAdmin">
            </el-table-column>
            <el-table-column :label="$t('username')" prop="Username">
            </el-table-column>
            <el-table-column :label="$t('user.email')" prop="Email">
            </el-table-column>
            <el-table-column :label="$t('user.uuid')" prop="UUID">
            </el-table-column>
            <el-table-column :label="$t('password')" :formatter="passwordFormatter">
            </el-table-column>
            <el-table-column :label="$t('user.upload')" :formatter="uploadFormatter" :sort-method="uploadSort" sortable>
            </el-table-column>
            <el-table-column :label="$t('user.download')" :formatter="downloadFormatter" :sort-method="downloadSort"
                sortable>
            </el-table-column>
            <el-table-column :label="$t('user.total')" :formatter="totalFormatter" :sort-method="totalSort" sortable>
            </el-table-column>
            <el-table-column :label="$t('user.quota')" :formatter="quotaFormatter">
            </el-table-column>
            <el-table-column :label="$t('user.expiryDate')">
                <template #default="scope">
                    <div v-if="scope.row.ExpiryDate === ''">{{ $t('user.unlimit') }}</div>
                    <el-popover trigger="hover" placement="top" v-else>
                        <p>{{ $t('user.remaining') }}: {{ calculateDay(scope.row.ExpiryDate) }}</p>
                        <template #reference>
                            <div class="name-wrapper">
                                <el-tag>{{ scope.row.ExpiryDate === '' ? $t('user.unlimit') : scope.row.ExpiryDate }}
                                </el-tag>
                            </div>
                        </template>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column width="170" align="center">
                <template #header>
                    <el-input v-model="search" :placeholder="$t('user.search')" v-if="isAdmin" />
                    <div v-if="!isAdmin">{{ $t('user.operate') }}</div>
                </template>
                <template #default="scope">
                    <el-dropdown v-if="isAdmin">
                        <el-button type="primary" link style="margin-top:2.6px">
                            {{ $t('edit') }}
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item
                                    @click="userItem = scope.row; patchButton = false; quotaVisible = true">{{
                                        $t('user.limitData')
                                    }}</el-dropdown-item>
                                <el-dropdown-item
                                    @click="userItem = scope.row; commonType = 1; patchButton = false; confirmVisible = true">{{
                                        $t('user.reset')
                                    }}</el-dropdown-item>
                                <el-dropdown-item @click="userItem = scope.row; handelEditUser()">{{
                                    $t('user.modifyUser')
                                }}</el-dropdown-item>
                                <el-dropdown-item
                                    @click="userItem = scope.row; expiryShow = $t('user.setExpire'); expiryVisible = true"
                                    v-if="scope.row.ExpiryDate === ''">{{ $t('user.setExpire') }}</el-dropdown-item>
                                <div v-else>
                                    <el-dropdown-item
                                        @click="userItem = scope.row; expiryShow = $t('user.editExpire'); expiryVisible = true">
                                        {{ $t('user.editExpire') }}</el-dropdown-item>
                                    <el-dropdown-item @click="userItem = scope.row; cancelUserExpire()">{{
                                        $t('user.cancelExpire')
                                        }}</el-dropdown-item>
                                </div>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <el-dropdown style="margin-left:5px">
                        <el-button type="primary" link style="margin-top:2.6px">
                            {{ $t('share') }}
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="userItem = scope.row; handleShare()">{{ $t('user.shareLink')
                                }}
                                </el-dropdown-item>
                                <el-dropdown-item @click="userItem = scope.row; handleClash()">{{ $t('user.importClash')
                                }}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <el-button style="margin-left:5px;" v-if="isAdmin" type="primary" link
                        @click="userItem = scope.row; commonType = 0; patchButton = false; confirmVisible = true">{{
                            $t('delete')
                        }}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 添加分页组件 -->
        <el-pagination class="responsive-pagination" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize" :layout="paginationLayout" :small="isMobile" :total="totalUsers" background>
        </el-pagination>
        <el-dialog :title="commonTitle" v-model="userVisible" :width="dialogWidth">
            <el-input type="text" v-model="userInfo.username" :placeholder="$root.$t('user.inputUsername')"
                @keyup.enter="commonType === 2 ? handleAddUser() : handleUpdateUser()" />
            <el-input type="email" v-model="userInfo.email" :placeholder="$root.$t('user.inputEmail')"
                @keyup.enter="commonType === 2 ? handleAddUser() : handleUpdateUser()" />
            <el-input type="text" v-model="userInfo.password" :placeholder="$root.$t('user.inputPassword')"
                @keyup.enter="commonType === 2 ? handleAddUser() : handleUpdateUser()" />
            <template #footer>
                <span class="dialog-footer">

                    <el-button @click="userVisible = false">{{ $root.$t('cancel') }}</el-button>
                    <el-button type="primary" @click="commonType === 2 ? handleAddUser() : handleUpdateUser()">{{
                        $root.$t('ok')
                    }}</el-button>
                </span>
            </template>
        </el-dialog>
        <el-dialog :title="commonTitle" v-model="confirmVisible" :width="dialogWidth">
            {{ editUser }}
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="confirmVisible = false; copySelection = [];">{{ $root.$t('cancel') }}</el-button>
                    <el-button type="primary"
                        @click="confirmVisible = false; patchButton ? handlePatchOpera() : handleOpera()">{{
                            $root.$t('ok')
                        }}</el-button>
                </span>
            </template>
        </el-dialog>
        <el-dialog :title="quotaText" v-model="quotaVisible" :width="dialogWidth">
            {{ editUser }}
            <el-divider v-if="editUser != ''"></el-divider>
            <el-tooltip effect="dark" :content="$t('user.meanUnlimit')" placement="top">
                <el-input-number v-model="quota" :min="-1" :precision="0"></el-input-number>
            </el-tooltip>
            <el-select v-model="quotaUnit" :placeholder="$t('choice')" style="margin-left: 5px; width:80px">
                <el-option v-for="item in quotaOptions" :key="item.value" :label="item.value" :value="item.value">
                </el-option>
            </el-select>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="quotaVisible = false">{{ $root.$t('cancel') }}</el-button>
                    <el-button type="primary" @click="quotaVisible = false; handleSetQuota()">{{ $root.$t('ok') }}
                    </el-button>
                </span>
            </template>
        </el-dialog>
        <el-dialog :title="$t('user.shareLink')" v-model="qrcodeVisible" :width="dialogWidth" @close="closeQRCode">
            <div id="qrcode" ref="qrcode" class="qrcodeCenter"></div>
            <p class="qrcodeCenter"> {{ shareLink }} </p>
        </el-dialog>
        <el-dialog :title="expiryShow" v-model="expiryVisible" :width="dialogWidth">
            <el-form>
                <el-form-item :label="$t('user.preset')">
                    <el-select v-model="useDays" :placeholder="$t('choice')" filterable style="width: 130px;">
                        <el-option v-for="item in expiryDateOptions" :key="item.label" :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('user.days')">
                    <el-input-number v-model="useDays" :min=0></el-input-number>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="expiryVisible = false">{{ $root.$t('cancel') }}</el-button>
                    <el-button type="primary" @click="expiryVisible = false; setUserExpire()">{{ $root.$t('ok') }}
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { pageUserList, addUser, delUser, updateUser, setExpire, cancelExpire } from '@/api/user'
import { Refresh, Plus, RefreshLeft, Scissor, Delete } from '@element-plus/icons-vue'
import { setQuota, cleanData } from '@/api/data'
import { setDomain, restart } from '@/api/trojan'
import { readablizeBytes, isValidIP } from '@/utils/common'
import { mapState } from 'vuex'
import * as QRCode from 'easyqrcodejs'
import dayjs from 'dayjs'

export default {
    name: 'UserIndex', // 添加这一行，定义组件名为 'UserIndex'
    setup() {
        return {
            Refresh,
            Plus,
            RefreshLeft,
            Scissor,
            Delete
        }
    },
    data() {
        return {
            search: '',
            domain: '',
            port: 0,
            shareLink: '',
            dataList: [],
            multipleSelection: [],
            copySelection: [],
            clientHeight: 0,
            userVisible: false,
            confirmVisible: false,
            quotaVisible: false,
            qrcodeVisible: false,
            expiryVisible: false,
            expiryShow: '',
            patchButton: false,
            // 确认框类型: 0删除, 1重置流量, 2新增用户, 3修改用户
            commonType: 0,
            userItem: null,
            quota: -1,
            quotaUnit: 'MB',
            useDays: 7,
            quotaOptions: [
                {
                    value: 'MB'
                },
                {
                    value: 'GB'
                }
            ],
            expiryDateOptions: [
                {
                    label: this.$t('user.week'),
                    value: 7
                },
                {
                    label: this.$t('user.month'),
                    value: 30
                },
                {
                    label: this.$t('user.season'),
                    value: 90
                },
                {
                    label: this.$t('user.halfYear'),
                    value: 183
                },
                {
                    label: this.$t('user.year'),
                    value: 365
                }
            ],
            userInfo: {
                username: '',
                email: '',
                password: ''
            },
            // 分页相关数据
            currentPage: 1, // 当前页码，默认第一页
            pageSize: 10,   // 每页显示数量，与后端默认值保持一致
            totalUsers: 0,  // 总用户数，从后端获取
            // 响应式分页
            isMobile: false,
            paginationLayout: 'prev, pager, next',
        }
    },
    computed: {
        ...mapState(['dialogWidth', 'isAdmin']),
        commonTitle: function () {
            let text = ''
            if (this.commonType === 2) {
                text = this.$t('user.addUser')
            } else if (this.commonType === 3) {
                text = this.$t('user.modifyUser2') + this.userItem.Username + this.$t('user.userpass')
            } else if (this.commonType === 0) {
                if (this.patchButton) {
                    text = this.$t('user.patchDelUser')
                } else if (this.userItem !== null) {
                    text = this.$t('user.delUser') + this.userItem.Username + ' ?'
                }
            } else if (this.commonType === 1) {
                if (this.patchButton) {
                    text = this.$t('user.patchReset')
                } else if (this.userItem !== null) {
                    text = this.$t('user.resetUser') + this.userItem.Username + this.$t('user.data')
                }
            }
            return text
        },
        editUser: function () {
            if (this.patchButton) {
                let result = ''
                for (let i = 0; i < this.copySelection.length; i++) {
                    result += ', ' + this.copySelection[i].Username
                }
                return result.substring(1)
            } else {
                return ''
            }
        },
        quotaText: function () {
            if (this.patchButton) {
                return `${this.$t('user.patchLimitUser')}`
            } else {
                if (this.userItem !== null) {
                    return `${this.$t('user.limitUser')} ${this.userItem.Username} ${this.$t('user.data')}`
                } else {
                    return ''
                }
            }
        }
    },
    created() {
        this.refresh()
        // this.clientHeight = document.body.clientHeight - 120
        this.updateClientHeight()
    },
    mounted() {
        window.onresize = () => {
            // this.clientHeight = document.body.clientHeight - 120
            this.updateClientHeight()
        }
    },
    methods: {
        handleSelectionChange(val) {
            this.multipleSelection = val
        },
        passwordFormatter(row) {
            return atob(row.Password)
        },
        quotaFormatter(row) {
            return row.Quota === -1 ? this.$t('user.unlimit') : readablizeBytes(row.Quota)
        },
        expiryFormatter(row) {
            return row.ExpiryDate === '' ? this.$t('user.unlimit') : row.ExpiryDate
        },
        uploadFormatter(row) {
            return readablizeBytes(row.Upload)
        },
        downloadFormatter(row) {
            return readablizeBytes(row.Download)
        },
        totalFormatter(row) {
            return readablizeBytes(row.Download + row.Upload)
        },
        uploadSort(a, b) {
            return a.Upload - b.Upload
        },
        downloadSort(a, b) {
            return a.Download - b.Download
        },
        totalSort(a, b) {
            return (a.Download + a.Upload) - (b.Download + b.Upload)
        },
        handleShare() {
            let remark = encodeURIComponent(`${this.domain}:${this.port}`)
            this.shareLink = `trojan://${atob(this.userItem.Password)}@${this.domain}:${this.port}#${remark}`
            this.$nextTick(() => {
                // eslint-disable-next-line
                new QRCode(this.$refs.qrcode, {
                    width: 200,
                    height: 200,
                    text: this.shareLink
                })
            })
            this.qrcodeVisible = true
        },
        handleClash() {
            let userInfo = btoa(`{"user": "${this.userItem.Username}", "pass": "${atob(this.userItem.Password)}"}`)
            let url = `${window.location.origin}/trojan/user/subscribe?token=${userInfo}`
            window.location.href = `clash://install-config?url=${url}`
        },
        handelEditUser() {
            this.userInfo.username = this.userItem.Username
            this.userInfo.email = this.userItem.Email
            this.userInfo.password = atob(this.userItem.Password)
            this.commonType = 3
            this.userVisible = true
        },
        textShow(text) {
            if (this.dialogWidth === '80%') {
                return ''
            } else {
                return text
            }
        },
        closeQRCode() {
            this.$refs.qrcode.innerHTML = ''
        },
        calculateDay(day) {
            return dayjs(day).diff(dayjs(dayjs().format('YYYY-MM-DD')), 'day')
        },
        async setUserExpire() {
            const formData = new FormData()
            formData.set('id', this.userItem.ID)
            formData.set('useDays', this.useDays)
            const result = await setExpire(formData)
            if (result.Msg === 'success') {
                this.$message({
                    message: `${this.$t('user.setExpireSuccess')}`,
                    type: 'success'
                })
            } else {
                this.$message.error(result.Msg)
            }
            this.userItem = null
            this.refresh()
        },
        async cancelUserExpire() {
            const result = await cancelExpire(this.userItem.ID)
            if (result.Msg === 'success') {
                this.$message({
                    message: `${this.$t('user.cancelExpireSuccess')}`,
                    type: 'success'
                })
            } else {
                this.$message.error(result.Msg)
            }
            this.userItem = null
            this.refresh()
        },
        async requestQuota() {
            const formData = new FormData()
            formData.set('id', this.userItem.ID)
            formData.set('quota', this.quota)
            const result = await setQuota(formData)
            if (result.Msg === 'success') {
                this.$message({
                    message: `${this.$t('user.limitUser2')} ${this.userItem.Username} ${this.$t('user.limitSuccess')}`,
                    type: 'success'
                })
            } else {
                this.$message.error(result.Msg)
            }
        },
        async handleSetQuota() {
            if (this.quota !== -1) {
                if (this.quotaUnit === 'MB') {
                    this.quota = this.quota * 1024 * 1024
                } else if (this.quotaUnit === 'GB') {
                    this.quota = this.quota * 1024 * 1024 * 1024
                }
            }
            if (this.patchButton) {
                for (let i = 0; i < this.copySelection.length; i++) {
                    this.userItem = this.copySelection[i]
                    await this.requestQuota()
                }
            } else {
                await this.requestQuota()
            }
            this.userItem = null
            this.quota = 0
            this.refresh()
        },
        async handlePatchOpera() {
            let successText = ''
            let result = null
            if (this.commonType === 0) {
                this.$store.commit('SET_NOERROR', true)
            }
            for (let i = 0; i < this.copySelection.length; i++) {
                this.userItem = this.copySelection[i]
                if (this.commonType === 0) {
                    try {
                        result = await delUser(this.userItem.ID)
                    } catch {
                        result = { Msg: 'success' }
                    }
                    successText = `${this.$t('user.delUser1')}${this.userItem.Username}${this.$t('user.success')}`
                } else if (this.commonType === 1) {
                    result = await cleanData(this.userItem.ID)
                    successText = `${this.$t('user.resetUser1')}${this.userItem.Username}${this.$t('user.success')}`
                }
                if (result.Msg === 'success') {
                    this.$message({
                        message: successText,
                        type: 'success'
                    })
                    this.userItem = null
                } else {
                    this.$message.error(result.Msg)
                }
            }
            if (this.commonType === 0) {
                this.$store.commit('SET_NOERROR', false)
            }
            this.refresh()
        },
        async handleOpera() {
            let successText = ''
            let result = null
            if (this.commonType === 0) {
                this.$store.commit('SET_NOERROR', true)
                try {
                    result = await delUser(this.userItem.ID)
                } catch {
                    result = { Msg: 'success' }
                }
                this.$store.commit('SET_NOERROR', false)
                successText = `${this.$t('user.delUser1')}${this.userItem.Username}${this.$t('user.success')}`
            } else if (this.commonType === 1) {
                result = await cleanData(this.userItem.ID)
                successText = `${this.$t('user.resetUser1')}${this.userItem.Username}${this.$t('user.success')}`
            }
            if (result.Msg === 'success') {
                this.$message({
                    message: successText,
                    type: 'success'
                })
            } else {
                this.$message.error(result.Msg)
            }
            this.refresh()
        },
        async handleUpdateUser() {
            if (this.userInfo.username === '' || this.userInfo.password === '') {
                this.$message.error(this.$t('inputNotNull'))
                return
            }
            if (this.userInfo.username === 'admin') {
                this.$message.error(this.$t('user.limitAdmin'))
                return
            }
            const formData = new FormData()
            formData.set('id', this.userItem.ID)
            formData.set('username', this.userInfo.username)
            formData.set('email', this.userInfo.email)
            try {
                formData.set('password', btoa(this.userInfo.password))
            } catch (e) {
                this.$message.error(this.$t('user.passLimit'))
                return
            }
            const result = await updateUser(formData)
            this.userVisible = false
            this.refresh()
            if (result.Msg === 'success') {
                this.$message({
                    message: `${this.$t('user.modifyUser2')}${this.userInfo.username}${this.$t('user.success')}`,
                    type: 'success'
                })
                this.$store.commit('SET_NOERROR', true)
                try {
                    await restart().catch()
                } catch (e) {
                    this.$store.commit('SET_NOERROR', false)
                }
            } else {
                this.$message.error(result.Msg)
            }
        },
        async handleAddUser() {
            if (this.userInfo.username === '' || this.userInfo.password === '') {
                this.$message.error(this.$t('inputNotNull'))
                return
            }
            if (this.userInfo.username === 'admin') {
                this.$message.error(this.$t('user.limitAdmin'))
                return
            }
            const formData = new FormData()
            formData.set('username', this.userInfo.username)
            formData.set('email', this.userInfo.email)
            try {
                formData.set('password', btoa(this.userInfo.password))
            } catch (e) {
                this.$message.error(this.$t('user.passLimit'))
                return
            }
            const result = await addUser(formData)
            if (result.Msg === 'success') {
                this.$message({
                    message: `${this.$t('user.addUser2')}${this.userInfo.username}${this.$t('user.success')}`,
                    type: 'success'
                })
                this.userInfo.username = ''
                this.userInfo.password = ''
                this.userInfo.email = ''
            } else {
                this.$message.error(result.Msg)
            }
            this.userVisible = false
            this.refresh()
        },
        refresh() {
            this.dataList = []
            this.domain = ''
            this.currentPage = 1 // 刷新时重置页码到第一页
            this.getUserList()
            // 刷新时也更新一下高度，确保最新状态
            this.updateClientHeight()
        },

        async getUserList() {
            // 调用修改后的 userList 函数，传入当前页码和每页大小
            const result = await pageUserList(this.currentPage, this.pageSize)
            if (result.Msg === 'success') {
                // 根据后端返回的结构，分页数据在 result.Data.pageData 中
                const pageData = result.Data.pageData
                this.dataList = pageData.DataList || [] // 更新表格数据为当前页的数据
                this.totalUsers = pageData.Total || 0   // 更新总用户数

                this.port = result.Data.port
                if (result.Data.domain !== '') {
                    this.domain = result.Data.domain
                } else {
                    const hostname = window.location.hostname
                    if (!isValidIP(hostname)) {
                        this.domain = hostname
                        const formData = new FormData()
                        formData.set('domain', this.domain)
                        this.$store.commit('SET_NPROGRESS', false)
                        this.$store.commit('SET_NOERROR', true)
                        try {
                            await setDomain(formData)
                        } catch (e) {
                            this.$store.commit('SET_NPROGRESS', false)
                            this.$store.commit('SET_NOERROR', false)
                        }
                    }
                }
            } else {
                this.$message.error(result.Msg)
            }
        },
        // 处理每页显示数量变化
        handleSizeChange(val) {
            this.pageSize = val
            this.currentPage = 1 // 切换每页大小后，通常将当前页重置为第一页
            this.getUserList()
        },
        // 处理当前页码变化
        handleCurrentChange(val) {
            this.currentPage = val
            this.getUserList()
        },
        // 新增一个方法来更新 clientHeight
        updateClientHeight() {
            // 减去页面顶部和底部的固定元素高度（例如 header, footer）
            // 再减去分页组件的高度和其上方的 margin-top
            // 假设页面顶部有固定的导航栏等占据约 80px 的空间，加上分页组件大概 60px
            // 这里的 120 应该是指除了表格以外的其他固定元素高度。
            // 那么现在分页组件也成为固定元素，需要额外减去它的高度和间隔。
            const paginationHeight = 60; // 预估分页组件及其margin-top的高度
            const otherFixedElementsHeight = 120; // 页面其他固定元素的高度
            this.clientHeight = document.body.clientHeight - otherFixedElementsHeight - paginationHeight;

            // 根据窗口宽度切换分页的展示模式
            const w = window.innerWidth || document.documentElement.clientWidth;
            // 统一去掉 total / sizes / jumper（Go to）
            this.isMobile = w <= 600
            this.paginationLayout = 'prev, pager, next'
        },
    }
}
</script>

<style lang="scss">
.qrcodeCenter {
    margin: 0 auto;
    width: 200px;
}

.tableShow {
    ::-webkit-scrollbar {
        display: none;
    }

    &:hover {
        ::-webkit-scrollbar {
            display: inline;
        }
    }
}

/* 添加响应式分页样式 */
.responsive-pagination {
    margin: 10px 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    /* 不换行，防止分页按钮换行；必要时横向滚动 */
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    white-space: nowrap;
    padding-bottom: 4px;
    /* 给横向滚动留一点空间 */
}

/* 保持分页整体不被压缩，按钮固定最小宽度 */
.responsive-pagination .el-pagination__button,
.responsive-pagination .el-pager li,
.responsive-pagination .el-pager li>button {
    flex: 0 0 auto;
    white-space: nowrap;
}

/* 调整 pager 容器为横向排列，避免内部元素换行 */
.responsive-pagination .el-pagination__pager,
.responsive-pagination .el-pager {
    display: flex;
    gap: 6px;
    align-items: center;
    flex: 0 0 auto;
}

/* 每个页码/省略号保持最小宽度，不随容器收缩 */
.responsive-pagination .el-pager li {
    min-width: 34px;
    text-align: center;
}

/* 省略号按钮保持与页码一致宽度 */
.responsive-pagination .el-pager li.more {
    min-width: 34px;
}

/* 箭头、更多图标保持不换行 */
.responsive-pagination .el-icon-more,
.responsive-pagination .el-icon-arrow-right,
.responsive-pagination .el-icon-arrow-left {
    flex: 0 0 auto;
    white-space: nowrap;
}

/* 保证跳转区域（若存在）不会换行，但这里已移除 jumper */
.responsive-pagination .el-pagination__jump {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 0 0 auto;
    white-space: nowrap;
}

/* 小屏时仍不换行，只允许横向滚动展示全部按钮 */
@media (max-width: 600px) {
    .responsive-pagination {
        justify-content: center;
        padding: 8px 6px;
        gap: 6px;
    }

    .responsive-pagination .el-pagination__button {
        padding: 0 8px;
        font-size: 13px;
    }
}
</style>