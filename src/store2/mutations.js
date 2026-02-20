const persistToLocalStorage = (key, value) => {
  if (value === undefined || value === null) {
    localStorage.removeItem(key)
  } else {
    localStorage.setItem(key, value)
  }
}

export default {
  LOGIN_IN(state, token) {
    state.UserToken = token
  },
  LOGIN_OUT(state) {
    state.UserToken = ''
    state.isAdmin = false
  },
  SET_ADMIN(state, bool) {
    state.isAdmin = !!bool
  },
  SET_TITLE(state, title) {
    state.docTitle = title || ''
    persistToLocalStorage('docTitle', state.docTitle)
  },
  SET_WIDTH(state, width) {
    state.dialogWidth = width || '25%'
  },
  SET_NPROGRESS(state, bool) {
    state.nprogress = !!bool
  },
  SET_NOERROR(state, bool) {
    state.noerror = !!bool
  },
  SET_LINE(state, line) {
    state.line = Number(line) || 300
    persistToLocalStorage('line', state.line)
  },
  SET_LOGLEVEL(state, loglevel) {
    state.loglevel = Number(loglevel) || 1
    persistToLocalStorage('loglevel', state.loglevel)
  },
  SET_TYPE(state, type) {
    state.type = type || 'sing-box'
    persistToLocalStorage('type', state.type)
  }
}
