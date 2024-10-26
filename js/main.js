import routes from './routes.js';
import { fetchList, fetchLeaderboard } from './content.js';

if (!localStorage.getItem('listdata')) {
    let cookieList = await fetchList()

    localStorage.setItem('listdata', JSON.stringify(cookieList))
}

if (!localStorage.getItem('leaderboarddata')) {
    let cookieList = await fetchList()
    let cookieLeaderboard = await fetchLeaderboard(cookieList)

    localStorage.setItem('listdata', JSON.stringify(cookieList))
    localStorage.setItem('leaderboarddata', JSON.stringify(cookieLeaderboard))
}

export let store = Vue.reactive({
    loaded: false,
    dark: JSON.parse(localStorage.getItem('dark')) || false,
    toggleDark() {
        this.dark = !this.dark;
        localStorage.setItem('dark', JSON.stringify(this.dark));
    },

    list: JSON.parse(localStorage.getItem('listdata')),
    leaderboard: JSON.parse(localStorage.getItem('leaderboarddata')),
    errors: []
});

let app = Vue.createApp({
    data: () => ({ store }),

    mounted() {
        this.runAfterMount();
    },

    methods: {
        async runAfterMount() {
            console.clear();
            store.loaded = true
            try {
                const updatedList = await fetchList();
                const updatedLeaderboard = await fetchLeaderboard(updatedList);

                if (updatedList !== store.list || 
                    updatedLeaderboard !== store.leaderboard && 
                    updatedLeaderboard[1].length === 0) { // if there's no errors
                    localStorage.setItem('listdata', JSON.stringify(updatedList));
                    localStorage.setItem('leaderboarddata', JSON.stringify(updatedLeaderboard));
                } else {

                }
                store.list = updatedList;
                store.leaderboard = updatedLeaderboard;
                store.errors = updatedLeaderboard[1]
                console.log(store.errors)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    }
});

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

app.use(router);

app.mount('#app');