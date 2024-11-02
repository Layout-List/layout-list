import routes from "./routes.js";
import { fetchList, fetchLeaderboard, fetchPacks } from "./content.js";

console.clear();

// used for cache versioning, the idea is we can use this to refresh
// the cached data if we push changes that would conflict with the old data. 
// to prevent showing error messages.
export const version = 3.2

// Compresses data passed to the function using Gzip
function compressData(data) {
    const jsonData = JSON.stringify(data);
    const compressed = pako.gzip(jsonData);

    // Convert the Uint8Array to a binary string without exceeding the argument limit
    let binaryString = "";
    compressed.forEach((byte) => {
        binaryString += String.fromCharCode(byte);
    });
    return btoa(binaryString); // Convert binary to base64 for storage
}

// Decompressed data pased to the function using Gzip
function decompressData(compressedData) {
    const binaryString = atob(compressedData); // Decode base64
    const charData = Uint8Array.from(binaryString, (char) =>
        char.charCodeAt(0)
    );
    const decompressed = pako.ungzip(charData, { to: "string" });
    return JSON.parse(decompressed);
}

// Compare cache version
if (localStorage.getItem("version") !== version.toString()) {
    console.warn("Cache is out of date, reloading ALL data!");
    let cookieList = await fetchList();
    localStorage.setItem("listdata", compressData(cookieList));
    
    let cookieLeaderboard = await fetchLeaderboard(cookieList);
    localStorage.setItem("leaderboarddata", compressData(cookieLeaderboard));
    
    let cookiePacks = await fetchPacks(cookieList);
    localStorage.setItem("packsdata", compressData(cookiePacks));

    localStorage.setItem('version', version.toString())
}

// Compress and store list locally if it doesn't exist
if (!localStorage.getItem("listdata")) {
    console.warn("List not found in cache, refreshing...");
    let cookieList = await fetchList();
    localStorage.setItem("listdata", compressData(cookieList));
}

// Compress and store leaderboard locally if it doesn't exist
if (!localStorage.getItem("leaderboarddata")) {
    console.warn("Leaderboard not found in cache, refreshing...");
    let cookieList = localStorage.getItem("listdata")
        ? decompressData(localStorage.getItem("listdata"))
        : await fetchList();
    let cookieLeaderboard = await fetchLeaderboard(cookieList);

    localStorage.setItem("listdata", compressData(cookieList));
    localStorage.setItem("leaderboarddata", compressData(cookieLeaderboard));
}

// Compress and store packs locally if it doesn't exist
if (!localStorage.getItem("packsdata")) {
    console.warn("Packs not found in cache, refreshing...");
    let cookieList = localStorage.getItem("listdata")
        ? decompressData(localStorage.getItem("listdata"))
        : await fetchList();
    let cookiePacks = await fetchPacks(cookieList);

    localStorage.setItem("listdata", compressData(cookieList));
    localStorage.setItem("packsdata", compressData(cookiePacks));
}

// Decompress data when loading it from storage
export let store = Vue.reactive({
    loaded: false,
    dark: JSON.parse(localStorage.getItem("dark")) || false,
    toggleDark() {
        this.dark = !this.dark;
        localStorage.setItem("dark", JSON.stringify(this.dark));
    },

    list: localStorage.getItem("listdata")
        ? decompressData(localStorage.getItem("listdata"))
        : null,
    leaderboard: localStorage.getItem("leaderboarddata")
        ? decompressData(localStorage.getItem("leaderboarddata"))
        : null,
    packs: localStorage.getItem("packsdata")
        ? decompressData(localStorage.getItem("packsdata"))
        : null,
    errors: [],
    version
});

let app = Vue.createApp({
    data: () => ({ store }),

    mounted() {
        this.runAfterMount();
    },

    methods: {
        async runAfterMount() {
            console.log("Pre-load completed, checking for new data...");
            store.loaded = true;
            try {
                // Update list if it's different than what's stored locally
                const updatedList = await fetchList();
                if (JSON.stringify(updatedList) !== JSON.stringify(store.list)) {
                    console.log("Found new data in list! Overwriting...");
                    localStorage.setItem("listdata", compressData(updatedList));
                }
                // Update leaderboard if it's different than what's stored locally
                const updatedLeaderboard = await fetchLeaderboard(updatedList);
                if (JSON.stringify(updatedLeaderboard) !==JSON.stringify(store.leaderboard)) {
                    console.log("Found new data in leaderboard! Overwriting...");
                    localStorage.setItem("listdata", compressData(updatedList));
                    localStorage.setItem("leaderboarddata", compressData(updatedLeaderboard));
                }

                // Update packs if it's different than what's stored locally
                const updatedPacks = await fetchPacks(updatedList);
                if (JSON.stringify(updatedPacks) !== JSON.stringify(store.packs)) {
                    console.log("Found new data in packs! Overwriting...");
                    localStorage.setItem("listdata", compressData(updatedList));
                    localStorage.setItem("packsdata", compressData(updatedPacks));
                }

                store.list = updatedList;
                store.leaderboard = updatedLeaderboard;
                store.packs = updatedPacks;
                store.errors = updatedLeaderboard[1]; // Levels with errors are stored here
                console.log("Up to date!");
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },
    },
});

const router = VueRouter.createRouter({history: VueRouter.createWebHashHistory(), routes});


app.use(router);
app.mount("#app");