import type { App, Component } from 'vue'
import './theme/index.scss'
import prefixCls from './prefix'
export default {
  install(app: App) {
    const moduleFilesTs = import.meta.globEager('./*/index.ts')
    console.log(moduleFilesTs)
    Object.keys(moduleFilesTs).forEach((key: string) => {
      const componentOptions: Record<string, Component> = moduleFilesTs[key]
      const exclude = ['./lazy', './tooltip']
      const replaceKey = key.replace(/\/index.ts/, '')
      if (exclude.includes(replaceKey)) {
        switch (replaceKey) {
          case './tooltip':
            app.use(componentOptions.default as () => void)
            break
        }
      } else {
        if (componentOptions) {
          Object.keys(componentOptions).forEach((el: string) => {
            app.component(prefixCls + el, componentOptions[el])
          })
        }
      }
    })
  }
}
