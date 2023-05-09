/*
 * @Author: mouse
 * @Date: 2023-01-11 12:42:21
 * @LastEditTime: 2023-04-19 17:58:52
 * @LastEditors: mouse
 * @Description:
 * @FilePath: /mixmarvel-sdk-web/src/components/toastPluals/api.js
 * @project:
 */
import in18 from '@/locales/index'
import Toaster from './index.vue'
import eventBus from './helpers/event-bus.js'
import mount from './helpers/mount-component'

const Api = (globalOptions = {}) => {
  let active = false
  eventBus.$on('close', () => {
    active = false
  })
  return {
    show(message, options = {}) {
      active = true
      let localOptions = { message, ...options }
      const c = mount(Toaster, {
        props: { ...globalOptions, ...localOptions }
      })
      return c
    },
    clear() {
      eventBus.$emit('toast-clear')
    },
    success(message, options = {}) {
      options.type = 'success'
      return this.show(message, options)
    },
    error(message, options = {}) {
      options.type = 'error'
      return this.show(message, options)
    },
    info(message, options = {}) {
      options.type = 'info'
      return this.show(message, options)
    },
    warning(message, options = {}) {
      options.type = 'warning'
      return this.show(message, options)
    },
    loading(message = 'loading', options = {}) {
      message = in18.global.t('Common.loading')
      options.type = 'loading'
      return this.show(message, options)
    },
    // 区别于loading,这个是有蒙层的
    loadingAll(message = 'loadingAll', options = {}) {
      message = in18.global.t('Common.loading')
      options.type = 'loadingAll'
      return this.show(message, options)
    },
    isActive() {
      return active
    }
  }
}

export default Api
