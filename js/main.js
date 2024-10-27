import routes from './routes.js';
import { fetchList, fetchLeaderboard, fetchPacks, fetchPackRecords } from './content.js';

console.clear();

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

// list
if (!localStorage.getItem('listdata')) {
    console.warn('List not found in cache, refreshing...')
    let cookieList = await fetchList();
    localStorage.setItem('listdata', compressData(cookieList));
}

// leaderboard (deps: list)
if (!localStorage.getItem('leaderboarddata')) {
    console.warn('Leaderboard not found in cache, refreshing...')
    let cookieList = localStorage.getItem('listdata') ? decompressData(localStorage.getItem('listdata')) : await fetchList();
    let cookieLeaderboard = await fetchLeaderboard(cookieList);

    localStorage.setItem('listdata', compressData(cookieList));
    localStorage.setItem('leaderboarddata', compressData(cookieLeaderboard));
}

// packs (deps: list)
if (!localStorage.getItem('packsdata')) {
    console.warn('Packs not found in cache, refreshing...')
    let cookieList = localStorage.getItem('listdata') ? decompressData(localStorage.getItem('listdata')) : await fetchList();
    let cookiePacks = await fetchPacks(cookieList);

    localStorage.setItem('listdata', compressData(cookieList));
    localStorage.setItem('packsdata', compressData(cookiePacks));
}


// pack records (deps: list, packs)
if (!localStorage.getItem('packrecorddata')) {
    let cookieList = localStorage.getItem('listdata') ? decompressData(localStorage.getItem('listdata')) : await fetchList();
    let cookiePacks = localStorage.getItem('packsdata') ? decompressData(localStorage.getItem('packsdata')) : await fetchPacks(cookieList);
    let cookiePackRecords = await fetchPackRecords(cookiePacks, cookieList);
    console.log(cookiePackRecords); // data is intact
    
    

    localStorage.setItem('listdata', compressData(cookieList));
    localStorage.setItem('packsdata', compressData(cookiePacks));
    localStorage.setItem('packrecorddata', cookiePackRecords);
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
    packs: localStorage.getItem('packsdata') ? decompressData(localStorage.getItem('packsdata')) : null,
    packRecords: localStorage.getItem('packrecorddata') ? localStorage.getItem('packrecorddata') : null,
    errors: []
});

let app = Vue.createApp({
    data: () => ({ store }),

    mounted() {
        this.runAfterMount();
    },

    methods: {
        async runAfterMount() {
            console.log('Pre-load completed, checking for new data...')
            store.loaded = true;
            try {
                // list
                const updatedList = await fetchList();
                if (JSON.stringify(updatedList) !== JSON.stringify(store.list)) {
                    console.log('Found new data in list! Overwriting...')
                    localStorage.setItem('listdata', compressData(updatedList));
                }
                // leaderboard
                const updatedLeaderboard = await fetchLeaderboard(updatedList);
                if (JSON.stringify(updatedLeaderboard) !== JSON.stringify(store.leaderboard)) {
                    console.log('Found new data in leaderboard! Overwriting...')
                    localStorage.setItem('listdata', compressData(updatedList));
                    localStorage.setItem('leaderboarddata', compressData(updatedLeaderboard));
                }

                // packs
                const updatedPacks = await fetchPacks(updatedList);
                if (JSON.stringify(updatedPacks) !== JSON.stringify(store.packs)) {
                    console.log('Found new data in packs! Overwriting...')
                    localStorage.setItem('listdata', compressData(updatedList));
                    localStorage.setItem('packsdata', compressData(updatedPacks));
                }


                const updatedPackRecords = await fetchPackRecords(updatedPacks, updatedList);
                if (JSON.stringify(updatedPackRecords) !== JSON.stringify(store.packRecords)) {
                    localStorage.setItem('listdata', compressData(updatedList));
                    localStorage.setItem('packsdata', compressData(updatedPacks));
                    localStorage.setItem('packrecorddata', updatedPackRecords);
                } 



                store.list = updatedList;
                store.leaderboard = updatedLeaderboard;
                store.packs = updatedPacks;
                store.packRecords = updatedPackRecords;
                store.errors = updatedLeaderboard[1]; // levels with errors are stored here
                console.log('Up to date!')
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
