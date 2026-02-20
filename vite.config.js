import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path, { resolve } from 'path'

import viteSvgIcons from 'vite-plugin-svg-icons'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build'

  // 读取 .env 文件
  const env = loadEnv(mode, process.cwd())
  console.log('command:', command)
  console.log('mode:', mode)
  console.log('api:', env.VITE_API)

  return {
    base: './',

    plugins: [
      vue(),

      // 自动按需加载 Element Plus
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),

      Components({
        resolvers: [ElementPlusResolver()],
        dts: true
      }),

      // SVG 图标
      viteSvgIcons({
        iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
        symbolId: 'icon-[name]'
      }),

      // 仅 build 时开启包体积分析
      isBuild &&
        visualizer({
          open: true,
          gzipSize: true,
          brotliSize: true
        })
    ].filter(Boolean),

    resolve: {
      alias: {
        '~': resolve(__dirname, './'),
        '@': resolve(__dirname, 'src')
      },
      extensions: ['.js', '.ts', '.vue', '.json']
    },

    server: {
      host: '127.0.0.1',
      port: 8324,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        },
        '/ws': {
          target: env.VITE_API,
          changeOrigin: true,
          ws: true,
          rewrite: path => path.replace(/^\/ws/, '')
        }
      }
    },

    build: {
      assetsDir: 'static',
      sourcemap: !isBuild,

      minify: isBuild ? 'terser' : false,

      terserOptions: isBuild
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true
            }
          }
        : undefined,

      chunkSizeWarningLimit: 1500,

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // 自动按包拆分
              return id
                .toString()
                .split('node_modules/')[1]
                .split('/')[0]
            }
          }
        }
      }
    }
  }
})
