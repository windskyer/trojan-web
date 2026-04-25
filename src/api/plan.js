
import request from '@/utils/request'

export function planList() {
   return request({
      url: '/trojan/user/planlist',
      method: 'get',
   })
}

export function planInfo(name) {
   return request.get(`/trojan/user/plan?name=${name}`)
}
