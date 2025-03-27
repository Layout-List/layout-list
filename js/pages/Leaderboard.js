import { store } from '../main.js';
import { localize, rgbaBind, copyURL } from '../util.js';
import { packColor } from '../config.js';
import Spinner from '../components/Spinner.js';
import Copy from '../components/Copy.js'
import Copied from '../components/Copied.js'
import Scroll from '../components/Scroll.js'

export default {
    components: { Spinner, Copy, Copied, Scroll },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-leaderboard-container">
            <div v-if="!leaderboard" class="page-leaderboard">
                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        {{ err[0] }}
                    </p>
                </div>
            </div>
            <div v-else class="page-leaderboard">
                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                    <p class="error" v-if="notFound !== undefined">
                        User {{ notFound }} not found.
                    </p>
                </div>
                <div class="board-container">
                    <div class="search-container">
                        <input
                            type="text"
                            class="search"
                            id="search-bar"
                            placeholder="Search..."
                            v-model="searchQuery"
                        />
                        <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search x-lb">x</button>
                    </div>
                    <div class="button-bar" style="padding-left: 2.5rem;" :class="true ? 'dark' : ''">
                        <Scroll alt="Scroll to selected" @click="scrollToSelected()" />
                        <select v-model="selectedNation">
                            <option :value="null">All nations</option>
                            <option v-for="flag in Object.keys(flagMap)" :value="flag">{{ flagMap[flag] }}</option>
                        </select>
                    </div>
                    <table class="board" v-if="filteredLeaderboard.length > 0">
                        <tr v-for="({ entry: ientry, index }, i) in filteredLeaderboard" :key="index">
                            <td class="rank">
                                <p class="type-label-lg">#{{ index + 1 }}</p>
                            </td>
                            <td class="total">
                                <p class="type-label-lg" v-if="ientry.total > 0">{{ localize(ientry.total) }}</p>
                                <p class="type-label-lg" v-if="ientry.total == 0">{{ "—" }}</p> 
                            </td>
                            <td class="user" :class="{ 'active': selected == index }" :ref="selected == index ? 'selected' : undefined">
                                <button @click="selected = index; copied = false;">
                                    <span class="type-label-lg">{{ ientry.user }}</span>
                                </button>
                            </td>
                        </tr>
                    </table>
                    <p class="user" v-else>No users found.</p>
                </div>
                <div class="player-container">
                    <div class="player">
                        <div class="copy-container">
                            <h1 class="copy-name" style="padding-right:0.3rem;">
                                #{{ selected + 1 }} {{ entry.user }}
                            </h1>
                            <img class="flag" v-if="entry.flag" :src="'https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/' + entry.flag.toLowerCase() + '.svg'" alt="flag" style="margin-right: 10px;width:50px">
                            <Copy
                                v-if="!copied"
                                @click="copyURL('https://laylist.pages.dev/#/leaderboard/user/' + entry.user.toLowerCase().replaceAll(' ', '_')); copied = true"
                            ></Copy>
                            <Copied
                                v-if="copied"
                                @click="copyURL('https://laylist.pages.dev/#/leaderboard/user/' + entry.user.toLowerCase().replaceAll(' ', '_')); copied = true"
                            ></Copied>
                        </div>
                        <h4>{{ localize(entry.total) + " / " + localize(entry.possibleMax) }}</h4>
                        <div class="pack-container" v-if="entry.userPacks.length > 0">
                            <a v-for="pack in entry.userPacks" class="pack" :style="{ 'background': rgbaBind(packColor(pack.difficulty), 0.2) }" :href="'https://laylist.pages.dev/#/packs/pack/' + pack.name.toLowerCase().replaceAll(' ', '_')">{{ pack.name }} (+{{ pack.score }})</a>
                        </div>
                        <h2 v-if="entry.created.length > 0">Created ({{ entry.created.length }})</h2>
                        <table class="table" v-if="entry.created.length > 0">
                            <tr v-for="score in entry.created">
                                <td class="rank">
                                    <p v-if="score.rank === null">&mdash;</p>
                                    <p v-else>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="director" class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length }})</h2>
                        <table class="table" v-if="entry.verified.length > 0">
                            <tr v-for="score in entry.verified">
                                <td class="rank">
                                    <p v-if="score.rank === null">&mdash;</p>
                                    <p v-else>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="director" class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.completed.length > 0">Completed ({{ entry.completed.length }})</h2>
                        <table class="table" v-if="entry.completed.length > 0">
                            <tr v-for="score in entry.completed">
                                <td class="rank">
                                    <p v-if="score.rank === null">&mdash;</p>
                                    <p v-else>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="director" class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <img v-if="score.mobile" :src="'/assets/phone-landscape' + (true ? '-dark' : '') + '.svg'" alt="Mobile">
                                </td>
                                <td class="score">
                                    <p v-if="score.rating !== undefined && score.rating !== '?'" class="type-label-lg">{{ score.rating }}/10</p>
                                    <p v-if="score.rating == undefined || score.rating == '?'" class="type-label-lg">{{ "?" }}/10</p>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.progressed.length > 0">Progressed ({{ entry.progressed.length }})</h2>
                        <table class="table" v-if="entry.progressed.length > 0">
                            <tr v-for="score in entry.progressed">
                                <td class="rank">
                                    <p v-if="score.rank === null">&mdash;</p>
                                    <p v-else>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="director" class="type-label-lg" target="_blank" :href="score.link">{{ score.level }} - {{ score.percent }}%</a>
                                </td>
                                <td class="score">
                                    <img v-if="score.mobile" :src="'/assets/phone-landscape' + (true ? '-dark' : '') + '.svg'" alt="Mobile">
                                </td>
                                <td class="score">
                                    <p v-if="score.rating !== undefined && score.rating !== '?'" class="type-label-lg">{{ score.rating }}/10</p>
                                    <p v-if="score.rating == undefined || score.rating == '?'" class="type-label-lg">{{ "?" }}/10</p>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    `,

    data: () => ({
        loading: true,
        leaderboard: [],
        err: [],
        notFound: undefined,
        selected: 0,
        store,
        searchQuery: '',
        copied: false,
        selectedNation: null,
        flags: {}
    }),

    methods: {
        localize,
        rgbaBind,
        packColor,
        copyURL,
        selectFromParam() {
            if (this.$route.params.user) {
                const returnedIndex = this.leaderboard.findIndex(
                    (entry) => 
                        entry.user.toLowerCase().replaceAll(" ", "_") === this.$route.params.user.toLowerCase()
                );
                if (returnedIndex !== -1) this.selected = returnedIndex;
                else {
                    this.notFound = this.$route.params.user;
                    console.log(this.notFound)
                }
            }
        },
        scrollToSelected() {
            this.$nextTick(() => {
                const selectedElement = this.$refs.selected;
                if (selectedElement && selectedElement[0] && selectedElement[0].firstChild) {
                    selectedElement[selectedElement.length - 1].firstChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
    },

    computed: {
        entry() {
            return this.leaderboard[this.selected];
        },

        filteredLeaderboard() {
            const query = this.searchQuery.toLowerCase().replace(/\s/g, '');
    
            // Map each entry with its original index and filter based on the user name
            return this.leaderboard
                .map((entry, index) => ({ index, entry }))
                .filter(({ entry }) =>
                    (this.searchQuery.trim() ? entry.user.toLowerCase().includes(query) : true) &&
                    (this.selectedNation ? entry.flag === this.selectedNation : true)
                );
        },
    },

    async mounted() {
        // Fetch leaderboard and errors from store
        const [leaderboard, err] = this.store.leaderboard;
        this.leaderboard = leaderboard;
        this.err = err;

        this.flags = await fetch("../../data/_flags.json")
            .then(async (res) => await res.json())
        this.flagMap = await fetch("../../data/_flagMap.json")
            .then(async (res) => await res.json())
        
        var ret = {};
        for (var key in this.flagMap) {
            ret[this.flagMap[key]] = key;
        }

        this.flagMap = Object.fromEntries(
            Object.entries(ret).filter(([key, value]) => Object.values(this.flags).includes(key))
        );
        
        this.selectFromParam()

        // Hide loading spinner
        this.loading = false;
    },

    watch: {
        store: {
            handler(updated) {
                this.leaderboard = updated.leaderboard[0]
                this.err = updated.errors
                this.selectFromParam()
            }, 
            deep: true
        }
    },
};
