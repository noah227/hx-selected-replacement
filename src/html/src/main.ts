import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import mainFix from './main.fix'

mainFix()

createApp(App).use(router).mount('#app')
