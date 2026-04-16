<template>
    <div class="free-page">
        <div class="info-page">
            <div class="card">
                <h2>{{ $t('user.free.title') }}</h2>

                <p>{{ $t('user.free.tip1') }}</p>
                <p>{{ $t('user.free.tip2') }}</p>
                <p>{{ $t('user.free.tip3') }}</p>
                <p>{{ $t('user.free.tip4') }}</p>
                <p>{{ $t('user.free.tip5') }}</p>
                <p>{{ $t('user.free.tip6') }}</p>
                <p>{{ $t('user.free.tip7') }}</p>

                <div class="divider"></div>
                <div class="trial-card">
                    <p class="subtitle">{{ $t('user.free.trialTitle') }}</p>
                    <p class="trial-description">
                        {{ $t('user.free.trialDescription') }}
                    </p>
                    <div v-if="trialLink" class="link-row trial-row">
                        <p
                            class="link-text trial-link-text"
                            @click="copyText(trialLink)"
                        >
                            {{ trialLink }}
                        </p>
                        <div class="link-actions">
                            <el-button
                                class="link-action"
                                type="primary"
                                plain
                                size="small"
                                @click="handleTrialClick"
                            >
                                {{ $t('user.free.trialStart') }}
                            </el-button>
                            <el-button
                                class="link-action"
                                type="info"
                                plain
                                size="small"
                                @click="showQRCode(trialLink)"
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
                                type="success"
                                plain
                                size="small"
                                @click="openLink(trialLink)"
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
                    <p v-else class="empty-text">
                        {{ $t('user.free.trialNoLink') }}
                    </p>
                    <p class="trial-note">
                        {{
                            trialUsed
                                ? $t('user.free.trialRegisterHint')
                                : $t('user.free.trialLimitHint')
                        }}
                    </p>
                </div>

                <div class="divider"></div>
                <div class="tutorial-card">
                <p class="subtitle">{{ $t('user.free.tutorialTitle') }}</p>
                <div
                    v-if="subscribeUrl"
                    class="link-block subscribe-block tutorial-subscribe"
                >
                    <p class="subscribe-label">
                        {{ $t('user.free.subscriptionAddress') }}
                    </p>
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
                                @click="openClash(subscribeUrl)"
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
                <div class="tutorial-platform-row">
                    <div
                        class="tutorial-platform-btn"
                        :class="{ active: activeTutorial === 'ios' }"
                        @click="activeTutorial = activeTutorial === 'ios' ? null : 'ios'"
                    >{{ $t('user.free.tutorialTabIos') }}</div>
                    <div
                        class="tutorial-platform-btn"
                        :class="{ active: activeTutorial === 'windows' }"
                        @click="activeTutorial = activeTutorial === 'windows' ? null : 'windows'"
                    >{{ $t('user.free.tutorialTabWindows') }}</div>
                    <div
                        class="tutorial-platform-btn"
                        :class="{ active: activeTutorial === 'android' }"
                        @click="activeTutorial = activeTutorial === 'android' ? null : 'android'"
                    >{{ $t('user.free.tutorialTabAndroid') }}</div>
                </div>
                <div v-if="activeTutorial" class="tutorial-panel">
                    <template v-if="activeTutorial === 'ios'">
                        <div class="tutorial-download">
                            <p class="tutorial-download-label">
                                {{ $t('user.free.clientDownloadTitle') }}
                            </p>
                            <a
                                href="https://apps.apple.com/app/id932747118"
                                target="_blank"
                                rel="noopener noreferrer"
                                >{{
                                    $t('user.free.clientDownloadShadowrocket')
                                }}</a
                            >
                            <a
                                href="https://apps.apple.com/app/id1596063299"
                                target="_blank"
                                rel="noopener noreferrer"
                                >{{ $t('user.free.clientDownloadStash') }}</a
                            >
                        </div>
                        <div class="tutorial-client">
                            <p class="tutorial-client-title">
                                {{ $t('user.free.tutorialShadowrocketTitle') }}
                            </p>
                            <ol class="tutorial-steps">
                                <li>{{ $t('user.free.tutorialShadowrocketStep2') }}</li>
                                <li>{{ $t('user.free.tutorialShadowrocketStep3') }}</li>
                                <li>{{ $t('user.free.tutorialShadowrocketStep4') }}</li>
                                <li>{{ $t('user.free.tutorialShadowrocketStep5') }}</li>
                                <li>{{ $t('user.free.tutorialShadowrocketStep6') }}</li>
                            </ol>
                            <div v-if="tutorialImages.shadowrocket.length" class="tutorial-images">
                                <el-image
                                    v-for="(src, i) in tutorialImages.shadowrocket"
                                    :key="i" :src="src"
                                    :preview-src-list="tutorialImages.shadowrocket"
                                    :initial-index="i"
                                    class="tutorial-img" fit="contain"
                                />
                            </div>
                        </div>
                        <div class="tutorial-client">
                            <p class="tutorial-client-title">
                                {{ $t('user.free.tutorialStashTitle') }}
                            </p>
                            <ol class="tutorial-steps">
                                <li>{{ $t('user.free.tutorialStashStep2') }}</li>
                                <li>{{ $t('user.free.tutorialStashStep3') }}</li>
                                <li>{{ $t('user.free.tutorialStashStep4') }}</li>
                            </ol>
                            <div v-if="tutorialImages.stash.length" class="tutorial-images">
                                <el-image
                                    v-for="(src, i) in tutorialImages.stash"
                                    :key="i" :src="src"
                                    :preview-src-list="tutorialImages.stash"
                                    :initial-index="i"
                                    class="tutorial-img" fit="contain"
                                />
                            </div>
                        </div>
                    </template>
                    <template v-else-if="activeTutorial === 'windows'">
                        <div class="tutorial-download">
                            <p class="tutorial-download-label">
                                {{ $t('user.free.clientDownloadTitle') }}
                            </p>
                            <a
                                href="https://github.com/2rayN/v2rayN/releases"
                                target="_blank"
                                rel="noopener noreferrer"
                                >{{ $t('user.free.clientDownloadV2rayn') }}</a
                            >
                            <a
                                href="https://github.com/clash-verge-rev/clash-verge-rev/releases"
                                target="_blank"
                                rel="noopener noreferrer"
                                >{{ $t('user.free.clientDownloadClashVergeRev') }}</a
                            >
                        </div>
                        <div class="tutorial-client">
                            <p class="tutorial-client-title">
                                {{ $t('user.free.tutorialV2raynTitle') }}
                            </p>
                            <ol class="tutorial-steps">
                                <li>{{ $t('user.free.tutorialV2raynStep2') }}</li>
                                <li>{{ $t('user.free.tutorialV2raynStep3') }}</li>
                                <li>{{ $t('user.free.tutorialV2raynStep4') }}</li>
                                <li>{{ $t('user.free.tutorialV2raynStep5') }}</li>
                                <li>{{ $t('user.free.tutorialV2raynStep6') }}</li>
                            </ol>
                            <div v-if="tutorialImages.v2rayn.length" class="tutorial-images">
                                <el-image
                                    v-for="(src, i) in tutorialImages.v2rayn"
                                    :key="i" :src="src"
                                    :preview-src-list="tutorialImages.v2rayn"
                                    :initial-index="i"
                                    class="tutorial-img" fit="contain"
                                />
                            </div>
                        </div>
                        <div class="tutorial-client">
                            <p class="tutorial-client-title">
                                {{ $t('user.free.tutorialClashVergeTitle') }}
                            </p>
                            <ol class="tutorial-steps">
                                <li>{{ $t('user.free.tutorialClashVergeStep2') }}</li>
                                <li>{{ $t('user.free.tutorialClashVergeStep3') }}</li>
                                <li>{{ $t('user.free.tutorialClashVergeStep4') }}</li>
                                <li>{{ $t('user.free.tutorialClashVergeStep5') }}</li>
                                <li>{{ $t('user.free.tutorialClashVergeStep6') }}</li>
                            </ol>
                            <div v-if="tutorialImages.clashVerge.length" class="tutorial-images">
                                <el-image
                                    v-for="(src, i) in tutorialImages.clashVerge"
                                    :key="i" :src="src"
                                    :preview-src-list="tutorialImages.clashVerge"
                                    :initial-index="i"
                                    class="tutorial-img" fit="contain"
                                />
                            </div>
                        </div>
                    </template>
                    <template v-else-if="activeTutorial === 'android'">
                        <div class="tutorial-download">
                            <p class="tutorial-download-label">
                                {{ $t('user.free.clientDownloadTitle') }}
                            </p>
                            <a
                                href="https://github.com/2rayN/v2rayNG/releases"
                                target="_blank"
                                rel="noopener noreferrer"
                                >{{ $t('user.free.clientDownloadV2rayNG') }}</a
                            >
                            <a
                                href="https://github.com/MetaCubeX/ClashMetaForAndroid/releases"
                                target="_blank"
                                rel="noopener noreferrer"
                                >{{ $t('user.free.clientDownloadClashMeta') }}</a
                            >
                        </div>
                        <div class="tutorial-client">
                            <p class="tutorial-client-title">
                                {{ $t('user.free.tutorialV2rayNGTitle') }}
                            </p>
                            <ol class="tutorial-steps">
                                <li>{{ $t('user.free.tutorialV2rayNGStep2') }}</li>
                                <li>{{ $t('user.free.tutorialV2rayNGStep3') }}</li>
                                <li>{{ $t('user.free.tutorialV2rayNGStep4') }}</li>
                            </ol>
                            <div v-if="tutorialImages.v2rayng.length" class="tutorial-images">
                                <el-image
                                    v-for="(src, i) in tutorialImages.v2rayng"
                                    :key="i" :src="src"
                                    :preview-src-list="tutorialImages.v2rayng"
                                    :initial-index="i"
                                    class="tutorial-img" fit="contain"
                                />
                            </div>
                        </div>
                        <div class="tutorial-client">
                            <p class="tutorial-client-title">
                                {{ $t('user.free.tutorialClashMetaTitle') }}
                            </p>
                            <ol class="tutorial-steps">
                                <li>{{ $t('user.free.tutorialClashMetaStep2') }}</li>
                                <li>{{ $t('user.free.tutorialClashMetaStep3') }}</li>
                                <li>{{ $t('user.free.tutorialClashMetaStep4') }}</li>
                                <li>{{ $t('user.free.tutorialClashMetaStep5') }}</li>
                            </ol>
                            <div v-if="tutorialImages.clashMeta.length" class="tutorial-images">
                                <el-image
                                    v-for="(src, i) in tutorialImages.clashMeta"
                                    :key="i" :src="src"
                                    :preview-src-list="tutorialImages.clashMeta"
                                    :initial-index="i"
                                    class="tutorial-img" fit="contain"
                                />
                            </div>
                        </div>
                    </template>
                </div>
                </div>

                <div class="divider"></div>
                <p class="subtitle">{{ $t('user.free.accountInfo') }}</p>
                <div class="account-info">
                    <p>
                        {{ $t('user.free.password') }}：
                        <span
                            class="copy-value"
                            @click="
                                account.password && copyText(account.password)
                            "
                        >
                            {{ account.password || '-' }}
                        </span>
                    </p>
                    <p>
                        {{ $t('user.free.traffic') }}：{{ account.used }} /
                        {{ account.quota }}
                    </p>
                    <p>
                        {{ $t('user.free.expiryDate') }}：{{
                            account.expiryDate || '-'
                        }}
                    </p>
                </div>

                <div class="divider"></div>
                <p class="node-title">{{ $t('user.free.nodeLinks') }}</p>
                <div class="links">
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
                    <p v-if="!links.length" class="empty-text">
                        {{ $t('user.free.emptyLinks') }}
                    </p>
                </div>

                <div class="divider"></div>
                <p class="subtitle">{{ $t('user.free.planListTitle') }}</p>
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

                <div class="divider"></div>
                <p class="subtitle">{{ $t('user.free.cta') }}</p>

                <div class="action-buttons">
                    <el-button type="primary" plain @click="goLogin">{{
                        $t('user.free.login')
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

        <el-dialog
            class="plan-dialog"
            :title="
                selectedPlan
                    ? getPlanLabel(selectedPlan)
                    : $t('user.free.planListTitle')
            "
            v-model="planDialogVisible"
            width="360px"
            :show-close="true"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
        >
            <div v-if="selectedPlan" class="plan-dialog-content">
                <p class="plan-dialog-price">
                    ¥{{ formatPlanPrice(selectedPlan.price) }}
                </p>
                <template v-if="!planOrderCreated">
                    <div class="plan-input-row">
                        <el-input
                            v-model="planEmail"
                            type="email"
                            :placeholder="$t('user.free.planEmailPlaceholder')"
                            clearable
                        />
                        <el-button
                            type="primary"
                            class="plan-send-btn"
                            :disabled="planCodeSent && planResendCountdown > 0"
                            @click="handleGetPlanCode"
                        >
                            <span v-if="planCodeSent && planResendCountdown > 0">{{ planResendCountdown }}s</span>
                            <span v-else>{{ $t('user.free.getCode') }}</span>
                        </el-button>
                    </div>
                    <p class="plan-dialog-tip">
                        {{ $t('user.free.planEmailTip') }}
                    </p>
                    <transition name="plan-fade">
                        <div v-if="planCodeSent" class="plan-code-section">
                            <div class="plan-code-row">
                                <input
                                    v-for="(_, index) in planCodeDigits"
                                    :key="`plan-code-${index}`"
                                    :ref="setPlanCodeRef"
                                    v-model="planCodeDigits[index]"
                                    class="plan-code-input"
                                    type="text"
                                    inputmode="numeric"
                                    maxlength="1"
                                    @input="handlePlanCodeInput(index, $event)"
                                    @keydown="handlePlanCodeKeydown(index, $event)"
                                    @paste="handlePlanCodePaste($event)"
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
                        </div>
                    </transition>
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
                        v-else-if="orderPollingState === 'success' || orderPollingState === 'paid'"
                        class="plan-order-status plan-success"
                    >
                        <div class="plan-success-icon">✓</div>
                        <p class="plan-success-title">
                            {{ $t('user.free.paySuccessTitle') }}
                        </p>
                        <p class="plan-success-desc">
                            {{ $t('user.free.paySuccessSent') }}
                            <strong>{{ planEmail }}</strong>
                        </p>
                        <div class="plan-success-meta">
                            <p>{{ $t('user.free.paymentNote') }}</p>
                            <span
                                class="copy-value"
                                @click="copyText(orderName)"
                                >{{ orderName }}</span
                            >
                            <p>{{ $t('user.free.clickToCopyNote') }}</p>
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
                            <el-button type="primary" @click="goLogin">
                                {{ $t('user.free.paySuccessGoLogin') }}
                            </el-button>
                            <el-button plain @click="planDialogVisible = false">
                                {{ $t('user.free.paySuccessClose') }}
                            </el-button>
                        </div>
                    </div>
                    <div
                        v-else-if="isFailedOrderState"
                        class="plan-order-status"
                    >
                        <p>{{ $t('user.free.orderFail') }}</p>
                        <p class="order-status-label">{{ $t('user.free.orderStatus') }}：{{ orderPollingState }}</p>
                    </div>
                </template>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { generateOrder, orderStatus, sendCode } from '@/api/email'
import { freeUserInfo, planList } from '@/api/user'
import { readableBytes } from '@/utils/common'
import { Grid, Link as LinkIcon } from '@element-plus/icons-vue'
import QRCode from 'easyqrcodejs'
import { ElMessage } from 'element-plus'

const BASE_URL = import.meta.env.BASE_URL || '/'
const SUPPORT_BOT_LINK = 'https://t.me/TrojanAccess_bot?start=help'
const mailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default {
    name: 'FreePage',
    components: {
        Grid,
        LinkIcon,
    },
    data() {
        return {
            activeTutorial: null,
            subscribeUrl: '',
            links: [],
            plans: [],
            selectedPlan: null,
            planDialogVisible: false,
            planEmail: '',
            planOrderCreated: false,
            planCodeDigits: ['', '', '', '', '', ''],
            planCodeRefs: [],
            planCodeSent: false,
            planResendCountdown: 0,
            planResendTimer: null,
            qrcodeVisible: false,
            trialUsed: false,
            shareLink: '',
            orderPollingInterval: null,
            orderName: '',
            orderPollingState: 'idle',
            account: {
                username: '',
                uuid: '',
                password: '',
                used: '0 Bytes',
                quota: '0 Bytes',
                expiryDate: '',
            },
            // 教程截图配置：将截图放入 public/tutorial/ 目录后填写文件名
            tutorialImages: {
                shadowrocket: [
                    'https://raw.githubusercontent.com/shadowrocketHelp/help/master/ssrHelp/img/ios/ios4.png',
                    'https://raw.githubusercontent.com/shadowrocketHelp/help/master/ssrHelp/img/ios/ios5.png',
                ],
                stash: [
                    'https://raw.githubusercontent.com/Repcz/Repcz.github.io/main/docs/stash/Photo/s2.webp',
                    'https://raw.githubusercontent.com/Repcz/Repcz.github.io/main/docs/stash/Photo/s4.webp',
                ],
                v2rayn: [
                    'https://www.bwgss.org/wp-content/uploads/2025/07/v2rayn-paste-subscription.avif',
                    'https://www.bwgss.org/wp-content/uploads/2025/07/v2rayn-set-active-server.avif',
                ],
                clashVerge: [
                    'https://github.com/clashbk/clash/wiki/assets/1706242274-ClashVerge-Profiles-Import.jpg',
                    'https://github.com/clashbk/clash/wiki/assets/1706248489-ClashVerge-Enable-System-Proxy.jpg',
                ],
                v2rayng: [
                    'https://www.babeedu.net/wp-content/uploads/2026/03/zirulink-android-v2rayng-subscription-setup-tutorial-1024x741.png',
                ],
                clashMeta: [
                    'https://www.bwgss.org/wp-content/uploads/2025/10/cfa-paste-url-and-name.avif',
                    'https://www.bwgss.org/wp-content/uploads/2025/10/cfa-config-list-select.avif',
                ],
            },
        }
    },
    created() {
        this.getFreeUserInfo()
        this.getPlanList()
    },
    watch: {
        planDialogVisible(newVal) {
            if (!newVal) {
                this.stopOrderPolling()
            }
        },
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
        handleTrialClick() {
            if (!this.trialLink) {
                return
            }
            this.copyText(this.trialLink)
            this.trialUsed = true
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

            return `${label} ${this.$t('user.info.nodeSuffix')}(${this.$t('user.info.clickToCopy')})`
        },
        formatPlanPrice(price) {
            const value = Number(price)
            if (!Number.isFinite(value)) {
                return '0.00'
            }
            return value.toFixed(2)
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
        openPlanDialog(plan) {
            if (!plan || String(plan.name || '').toLowerCase() === 'free') {
                return
            }
            this.stopOrderPolling()
            this.selectedPlan = plan || null
            this.planEmail = ''
            this.planOrderCreated = false
            this.planCodeDigits = ['', '', '', '', '', '']
            this.planCodeRefs = []
            this.planCodeSent = false
            this.planResendCountdown = 0
            clearInterval(this.planResendTimer)
            this.orderName = ''
            this.planDialogVisible = true
        },
        async handleGetPlanCode() {
            if (!this.planEmail || !mailReg.test(this.planEmail)) {
                ElMessage.error(this.$t('mailError'))
                return
            }
            const formData = new FormData()
            formData.set('email', this.planEmail)
            const result = await sendCode(formData)
            if (result.code !== 200 || result.message !== 'success') {
                return
            }
            ElMessage.success(this.$t('user.free.codeSent'))
            this.planCodeSent = true
            this.planCodeDigits = ['', '', '', '', '', '']
            this.planCodeRefs = []
            this.startPlanResendCountdown()
            this.$nextTick(() => {
                const firstInput = this.planCodeRefs[0]
                if (firstInput?.focus) {
                    firstInput.focus()
                }
            })
        },

        startPlanResendCountdown() {
            this.planResendCountdown = 60
            clearInterval(this.planResendTimer)
            this.planResendTimer = setInterval(() => {
                if (this.planResendCountdown <= 1) {
                    clearInterval(this.planResendTimer)
                    this.planResendCountdown = 0
                } else {
                    this.planResendCountdown--
                }
            }, 1000)
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
        handlePlanCodePaste(event) {
            const text = (event.clipboardData || event.originalEvent?.clipboardData)
                ?.getData('text')
                .replace(/\D/g, '')
                .slice(0, 6)
            if (!text) return
            event.preventDefault()
            text.split('').forEach((ch, i) => {
                this.planCodeDigits[i] = ch
            })
            const nextIndex = Math.min(text.length, 5)
            this.$nextTick(() => this.planCodeRefs[nextIndex]?.focus?.())
        },
        async handleCreatePlanOrder() {
            if (!this.planEmail || !mailReg.test(this.planEmail)) {
                ElMessage.error(this.$t('mailError'))
                return
            }
            if (this.planCodeDigits.join('').length !== 6) {
                ElMessage.error(this.$t('user.free.codeInvalid'))
                return
            }
            const formData = new FormData()
            formData.set('email', this.planEmail)
            formData.set('code', this.planCodeDigits.join(''))
            formData.set('plan_name', this.selectedPlan.name)
            try {
                const result = await generateOrder(formData)
                if (result.code !== 200 || result.message !== 'success') {
                    ElMessage.error(
                        result.message || this.$t('user.free.orderCreateFail'),
                    )
                    return
                }
                this.planOrderCreated = true
                this.orderName = result.data?.order_name || ''
                this.orderPollingState = 'pending'
                this.startOrderPolling()
            } catch (error) {
                ElMessage.error(this.$t('user.free.orderCreateFail'))
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
        openClash(url) {
            if (!url) return
            window.location.href = `clash://install-config?url=${url}`
        },
        goLogin() {
            this.$router.push('/login').catch(() => {})
        },
        startOrderPolling() {
            this.stopOrderPolling() // 确保没有重复的轮询
            this.orderStatus() // 立即调用一次
            this.orderPollingInterval = setInterval(() => {
                this.orderStatus()
            }, 5000) // 每5秒调用一次
        },
        stopOrderPolling() {
            if (this.orderPollingInterval) {
                clearInterval(this.orderPollingInterval)
                this.orderPollingInterval = null
            }
        },
        async orderStatus() {
            if (
                !this.planEmail ||
                !this.planCodeDigits.join('') ||
                !this.orderName
            ) {
                return
            }
            const formData = new FormData()
            formData.set('email', this.planEmail)
            formData.set('code', this.planCodeDigits.join(''))
            formData.set('order_name', this.orderName)
            try {
                const result = await orderStatus(formData)
                if (result.code === 200 && result.message === 'success') {
                    const data = result.data || {}
                    const status = data.status
                    if (status === 'success' || status === 'paid') {
                        this.stopOrderPolling()
                        this.orderPollingState = status
                        const successMessage = `${this.$t('user.free.paymentSuccess')}${this.planEmail}`
                        ElMessage.success(successMessage)
                    } else if (status === 'pending') {
                        // 继续轮询，等待支付
                    } else {
                        // fail / expired / refunded 及其他终态，停止轮询并显示当前状态
                        this.stopOrderPolling()
                        this.orderPollingState = status
                        this.planOrderCreated = false
                        const statusMsgKey = `user.free.orderStatus${status.charAt(0).toUpperCase() + status.slice(1)}`
                        ElMessage.error(this.$te(statusMsgKey) ? this.$t(statusMsgKey) : this.$t('user.free.orderFail'))
                        this.planDialogVisible = false
                    }
                }
            } catch (error) {
                console.error('Order status check failed:', error)
            }
        },
    },
    computed: {
        isFailedOrderState() {
            const state = this.orderPollingState
            return state && state !== 'idle' && state !== 'pending' && state !== 'success' && state !== 'paid'
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
        trialLink() {
            return this.links[0] || this.subscribeUrl || ''
        },
        supportBotLink() {
            return SUPPORT_BOT_LINK
        },
    },
}
</script>

<style lang="scss" scoped>
:deep(.plan-dialog.el-dialog),
:deep(.plan-dialog .el-dialog) {
    max-width: calc(100vw - 32px);
    box-sizing: border-box;
}

.free-page {
    min-height: 100%;
    width: 100%;
    background-color: #2d3a4b;
    overflow-x: hidden;
}

.info-page {
    max-width: 860px;
    margin: 20px auto;
    padding: 0 16px 32px;
    font-size: 14px;
}

.card {
    margin-bottom: 16px;
    padding: 20px;
    border-radius: 12px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
}

.card h2 {
    margin: 0 0 12px;
    font-size: 17px;
    font-weight: 700;
}

.card p {
    margin: 6px 0;
    line-height: 1.75;
    word-break: break-all;
}

.subtitle {
    display: block;
    margin: 0 0 10px;
    font-size: 14px;
    font-weight: 700;
}

.divider {
    height: 1px;
    margin: 18px 0;
    background: var(--el-border-color-lighter);
}

.links {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.link-block {
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-extra-light);
}

.link-block + .link-block {
    margin-top: 8px;
}

.account-info {
    padding: 12px 14px;
    border-radius: 8px;
    border: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-extra-light);
}

.account-info p {
    margin: 4px 0;
}

.subscribe-block {
    margin-bottom: 0;
}

.subscribe-label,
.node-block > p {
    margin: 0 0 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
}

.download-guide {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}

.download-guide > .subtitle {
    grid-column: 1 / -1;
}

.download-item {
    padding: 12px 14px;
    border-radius: 8px;
    border: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-extra-light);
}

.download-platform {
    margin: 0 0 6px;
    font-weight: 600;
}

.download-item p {
    margin: 0;
    line-height: 1.9;
}

.download-item a {
    color: #0d6efd;
    text-decoration: underline;
}

.download-item a:hover {
    opacity: 0.8;
}

.tutorial-subscribe {
    margin-bottom: 12px;
}

.tutorial-download {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 14px;
    padding: 10px 14px;
    margin-bottom: 12px;
    border-radius: 8px;
    border: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-extra-light);
}

.tutorial-download-label {
    margin: 0;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    width: 100%;
}

.tutorial-download a {
    font-size: 13px;
    color: #0d6efd;
    text-decoration: underline;
}

.tutorial-download a:hover {
    opacity: 0.8;
}

.tutorial-card {
    padding: 16px;
    border-radius: 10px;
    border: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-extra-light);
}

.tutorial-card .subscribe-block {
    margin-bottom: 14px;
}

.tutorial-platform-row {
    display: flex;
    gap: 0;
    margin-top: 2px;
    border-bottom: 1px solid var(--el-border-color-lighter);
}

.tutorial-platform-btn {
    flex: 1;
    padding: 8px 0;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    border-right: 1px solid var(--el-border-color-lighter);
    margin-bottom: -1px;
    transition: color 0.2s, border-color 0.2s;
    user-select: none;
}

.tutorial-platform-btn:last-child {
    border-right: none;
}

.tutorial-platform-btn:hover {
    color: var(--el-color-primary);
}

.tutorial-platform-btn.active {
    color: var(--el-color-primary);
    border-bottom-color: var(--el-color-primary);
}

.tutorial-panel {
    margin-top: 12px;
}

.tutorial-client {
    padding: 12px 14px;
    border-radius: 8px;
    border: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-extra-light);
    margin-bottom: 10px;
}

.tutorial-client:last-child {
    margin-bottom: 0;
}

.tutorial-client-title {
    margin: 0 0 8px;
    font-size: 13px;
    font-weight: 700;
}

.tutorial-steps {
    margin: 0;
    padding-left: 18px;
    color: var(--el-text-color-regular);
    line-height: 1.9;
}

.tutorial-steps li {
    padding: 1px 0;
}

.tutorial-images {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 12px;
}

.tutorial-img {
    width: 100%;
    height: 240px;
    border-radius: 8px;
    border: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-lighter);
    cursor: zoom-in;
}

:deep(.tutorial-img .el-image__inner) {
    border-radius: 8px;
}

@media (max-width: 600px) {
    .tutorial-images {
        grid-template-columns: 1fr;
    }

    .tutorial-img {
        height: 200px;
    }
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

.trial-card {
    padding: 14px 16px;
    border-radius: 10px;
    border: 1px solid rgba(13, 110, 253, 0.2);
    background: rgba(13, 110, 253, 0.04);
}

.trial-description {
    margin: 6px 0 10px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
    line-height: 1.7;
}

.trial-note {
    margin: 8px 0 0;
    color: var(--el-text-color-secondary);
    font-size: 12px;
}

.trial-row .link-actions {
    opacity: 1;
    transform: none;
    pointer-events: auto;
    margin-left: 0;
}

.trial-link-text {
    white-space: normal;
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
    .card {
        padding: 14px;
    }

    .download-guide {
        grid-template-columns: 1fr;
    }

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

.link-label {
    margin: 0;
    color: #0d6efd;
    text-decoration: underline;
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

.copy-value {
    color: #0d6efd;
    cursor: pointer;
    text-decoration: underline;
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

.plan-dialog-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
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

.plan-input-row {
    display: flex;
    gap: 0;
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    overflow: hidden;

    :deep(.el-input__wrapper) {
        border-radius: 0;
        box-shadow: none !important;
    }

    .plan-send-btn {
        flex-shrink: 0;
        border-radius: 0 8px 8px 0;
        white-space: nowrap;
    }
}

.plan-code-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
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

@media (max-width: 360px) {
    .plan-code-row {
        flex-wrap: wrap;
        justify-content: center;
        gap: 6px;
    }

    .plan-code-input {
        width: 40px;
        height: 40px;
        border-radius: 9px;
        font-size: 16px;
    }
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

.action-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
}

.action-buttons :deep(.el-button) {
    text-transform: uppercase;
}

.join-group-btn {
    margin-left: auto;
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

    .plan-grid {
        grid-template-columns: 1fr;
    }

    .action-buttons :deep(.el-button) {
        width: 100%;
        margin-left: 0;
    }

    .join-group-btn {
        margin-left: 0;
    }
}

.plan-fade-enter-active,
.plan-fade-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}
.plan-fade-enter-from,
.plan-fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
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
