import request from '@/utils/request'

export function userTotal() {
   return request.get('/trojan/user/total')
}

export function userList() {
   return request.get('/trojan/user')
}

export function pageUserList(curPage, pageSize) {
    return request({
        url: '/trojan/user/page', // 修改为后端分页接口的路径
        method: 'get',
        params: { curPage, pageSize } // 将分页参数作为查询参数传递
    })
}

export function addUser(data) {
    return request.post('/trojan/user', data)
}

export function updateUser(data) {
    return request.post('/trojan/user/update', data)
}

export function delUser(id) {
    return request.delete(`/trojan/user?id=${id}`)
}

export function setExpire(data) {
    return request.post('/trojan/user/expire', data)
}

export function cancelExpire(id) {
    return request.delete(`/trojan/user/expire?id=${id}`)
}
