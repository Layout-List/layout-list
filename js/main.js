import routes from './routes.js';
import { fetchList, fetchLeaderboard } from './content.js';

// if the site finds a "listdata" object in cookies, convert it to an object and use it for list
// if not, 



function compressObject(obj) {
    const jsonString = JSON.stringify(obj);  // Convert object to JSON string
    const utf8Encoded = new TextEncoder().encode(jsonString);  // Convert to UTF-8 bytes
    const compressed = pako.gzip(utf8Encoded);  // Compress using Gzip
    return compressed;
}





  function decompressObject(compressedData) {
    const decompressed = pako.ungzip(compressedData, { to: 'string' });  // Decompress Gzip
    const obj = JSON.parse(decompressed);  // Convert back to object
    return obj;
}





if (!localStorage.getItem('listdata')) {
    let cookieList = await fetchList()

    console.log(cookieList)

    localStorage.setItem('listdata', JSON.stringify(cookieList))
}





if (!localStorage.getItem('leaderboarddata')) {
    let cookieList = await fetchList()
    let cookieLeaderboard = await fetchLeaderboard(cookieList)


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
});

let app = Vue.createApp({
    data: () => ({ store }),

    mounted() {
        this.runAfterMount();
    },

    methods: {
        async runAfterMount() {
            store.loaded = true
            try {
                const updatedList = await fetchList();
                const updatedLeaderboard = await fetchLeaderboard(updatedList);

                if (updatedList !== store.list || updatedLeaderboard !== store.leaderboard) {
                    localStorage.setItem('listdata', JSON.stringify(updatedList));
                    localStorage.setItem('leaderboarddata', JSON.stringify(updatedLeaderboard));
                }
                store.list = updatedList;
                store.leaderboard = updatedLeaderboard;
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