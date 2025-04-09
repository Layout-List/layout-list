import routes from "./routes.js";
import { fetchList, fetchLeaderboard, fetchPacks, fetchStaff } from "./content.js";

console.clear();

// used for cache versioning, the idea is we can use this to refresh
// the cached data if we push changes that would conflict with the old data, 
// to prevent showing a billion error messages.
export const version = 3.2
const debug = false;

export let store;

// Compresses data passed to the function using Gzip
export function compressData(data) {
    const jsonData = JSON.stringify(data);
    const compressed = pako.gzip(jsonData);

    let binaryString = "";
    compressed.forEach((byte) => {
        binaryString += String.fromCharCode(byte);
    });
    return btoa(binaryString); // Convert binary to base64 for storage
}

// Decompressed data passed to the function using Gzip
export function decompressData(compressedData) {
    const binaryString = atob(compressedData); // Decode base64
    const charData = Uint8Array.from(binaryString, (char) =>
        char.charCodeAt(0)
    );
    const decompressed = pako.ungzip(charData, { to: "string" });
    return JSON.parse(decompressed);
}

if (!debug) {
    // Compare cache version
    if (localStorage.getItem("version") !== version.toString()) {
        console.warn("Cache is out of date, reloading ALL data!");
        let cookieList = await fetchList();
        localStorage.setItem("listdata", compressData(cookieList));
    
        let cookieLeaderboard = await fetchLeaderboard(cookieList);
        localStorage.setItem("leaderboarddata", compressData(cookieLeaderboard));
    
        let cookiePacks = await fetchPacks(cookieList);
        localStorage.setItem("packsdata", compressData(cookiePacks));

        let cookieStaff = await fetchStaff();
        localStorage.setItem("staffdata", compressData(cookieStaff));

        localStorage.setItem('version', version.toString())
    }

    // Compress and store staff locally if it doesn't exist
    if (!localStorage.getItem("staffdata")) {
        console.warn("Staff not found in cache, refreshing...");
        let cookieStaff = await fetchStaff();
        localStorage.setItem("staffdata", compressData(cookieStaff));
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
    store = Vue.reactive({
        loaded: false,
        dark: JSON.parse(localStorage.getItem("dark")) || false,
        toggleDark() {
            this.dark = !this.dark;
            localStorage.setItem("dark", JSON.stringify(this.dark));
        },

        list: localStorage.getItem("listdata")
            ? decompressData(localStorage.getItem("listdata"))
            : null,
        staff: localStorage.getItem("staffdata")
            ? decompressData(localStorage.getItem("staffdata"))
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
} else {
    const list = await fetchList();
    const leaderboard = await fetchLeaderboard(list);
    const packs = await fetchPacks(list);
    const staff = await fetchStaff();
    store = Vue.reactive({
        loaded: false,
        dark: JSON.parse(localStorage.getItem("dark")) || false,
        toggleDark() {
            this.dark = !this.dark;
            localStorage.setItem("dark", JSON.stringify(this.dark));
        },

        list,
        staff,
        packs,
        leaderboard,
        errors: [],
        version
    });
}

let app = Vue.createApp({
    data: () => ({ store, selectedColor: '' }),

    async mounted() {
        const cookieColor = localStorage.getItem("color");
        if (cookieColor) {
            this.selectedColor = cookieColor;
        }

        const submissionLink = localStorage.getItem("last_submission_link")
        

        // this looks sick u gotta admit
        if (
            submissionLink && (
                submissionLink
                    .includes("filebin")
            )
        ) localStorage
            .removeItem(
                "last_submission_link"
            );

        console.info("Pre-load completed, checking for new data...");
        store.loaded = true;
        // Update list if it's different than what's stored locally
        const updatedList = await fetchList();
        if (JSON.stringify(updatedList) !== JSON.stringify(store.list)) {
            console.info("Found new data in list! Overwriting...");
            localStorage.setItem("listdata", compressData(updatedList));
        }
        // Update staff if it's different than what's stored locally
        const updatedStaff = await fetchStaff();
        if (JSON.stringify(updatedStaff) !== JSON.stringify(store.staff)) {
            console.info("Found new staff! Overwriting...");
            localStorage.setItem("staffdata", compressData(updatedStaff));
        }
        // Update leaderboard if it's different than what's stored locally
        const updatedLeaderboard = await fetchLeaderboard(updatedList);
        if (JSON.stringify(updatedLeaderboard) !== JSON.stringify(store.leaderboard)) {
            console.info("Found new data in leaderboard! Overwriting...");
            localStorage.setItem("listdata", compressData(updatedList));
            localStorage.setItem("leaderboarddata", compressData(updatedLeaderboard));
        }
        // Update packs if it's different than what's stored locally
        const updatedPacks = await fetchPacks(updatedList);
        if (JSON.stringify(updatedPacks) !== JSON.stringify(store.packs)) {
            console.info("Found new data in packs! Overwriting...");
            localStorage.setItem("listdata", compressData(updatedList));
            localStorage.setItem("packsdata", compressData(updatedPacks));
        }

        store.list = updatedList;
        store.staff = updatedStaff;
        store.leaderboard = updatedLeaderboard;
        store.packs = updatedPacks;
        store.errors = updatedLeaderboard[1]; // Levels with errors are stored here
        console.info("Up to date!");
    },
    watch: {
        selectedColor: {
            handler(newColor) {
                const site = document.getElementById("app");
                // don't ask me what this does because i don't know
                const rgb = parseInt(newColor.slice(1), 16);
                const r = (rgb >> 16) & 0xff;
                const g = (rgb >> 8) & 0xff;
                const b = rgb & 0xff;
                const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                if (luminance > 0.5) {
                    this.store.dark = false
                    site.style.setProperty("--color-on-primary", "#000000");
                } else {
                    this.store.dark = true;
                    site.style.setProperty("--color-on-primary", "#ffffff");
                }
                site.style.setProperty("--color-primary", newColor)
                site.style.setProperty("--color-background-hover", newColor + "30")
                localStorage.setItem("color", newColor)
            }
        }
    }
});

const router = VueRouter.createRouter({history: VueRouter.createWebHashHistory(), routes});


app.use(router);
app.mount("#app");
