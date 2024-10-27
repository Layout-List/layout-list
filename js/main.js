import routes from './routes.js';
import { fetchList, fetchLeaderboard } from './content.js';

// Helper functions to compress and decompress data using Gzip
function compressData(data) {
    const jsonData = JSON.stringify(data);
    const compressed = pako.gzip(jsonData);

    // Convert the Uint8Array to a binary string without exceeding the argument limit
    let binaryString = '';
    compressed.forEach(byte => {
        binaryString += String.fromCharCode(byte);
    });
    return btoa(binaryString); // Convert binary to base64 for storage
}

function decompressData(compressedData) {
    const binaryString = atob(compressedData); // Decode base64
    const charData = Uint8Array.from(binaryString, char => char.charCodeAt(0));
    const decompressed = pako.ungzip(charData, { to: 'string' });
    return JSON.parse(decompressed);
}

// Store compressed data if it doesn't exist
if (!localStorage.getItem('listdata')) {
    let cookieList = await fetchList();
    localStorage.setItem('listdata', compressData(cookieList));
}

if (!localStorage.getItem('leaderboarddata')) {
    let cookieList = await fetchList();
    let cookieLeaderboard = await fetchLeaderboard(cookieList);

    localStorage.setItem('listdata', compressData(cookieList));
    localStorage.setItem('leaderboarddata', compressData(cookieLeaderboard));
}

// Decompress data when loading it from storage
export let store = Vue.reactive({
    loaded: false,
    dark: JSON.parse(localStorage.getItem('dark')) || false,
    toggleDark() {
        this.dark = !this.dark;
        localStorage.setItem('dark', JSON.stringify(this.dark));
    },

    list: localStorage.getItem('listdata') ? decompressData(localStorage.getItem('listdata')) : null,
    leaderboard: localStorage.getItem('leaderboarddata') ? decompressData(localStorage.getItem('leaderboarddata')) : null,
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
            store.loaded = true;
            try {
                const updatedList = await fetchList();
                const updatedLeaderboard = await fetchLeaderboard(updatedList);

                if (JSON.stringify(updatedList) !== JSON.stringify(store.list) || 
                    JSON.stringify(updatedLeaderboard) !== JSON.stringify(store.leaderboard)) {
                    localStorage.setItem('listdata', compressData(updatedList));
                    localStorage.setItem('leaderboarddata', compressData(updatedLeaderboard));
                }

                store.list = updatedList;
                store.leaderboard = updatedLeaderboard;
                store.errors = updatedLeaderboard[1];
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
