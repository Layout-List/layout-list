import { store } from '../main.js';
import { localize, rgbaBind } from '../util.js';
import { lightPackColor, darkPackColor } from '../config.js';
import { Spinner } from '../components/Spinner.js';


export default {
    components: {
        Spinner,
    },
    data: () => ({
        store,
        leaderboard: [],
        loading: true,
        selected: 0,
        err: [],
        store,
    }),
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
                </div>
                <div class="board-container">
                    <table class="board">
                        <tr v-for="(ientry, i) in leaderboard">
                            <td class="rank">
                                <p class="type-label-lg">#{{ i + 1 }}</p>
                            </td>
                            <td class="total">
                                <p class="type-label-lg" v-if="ientry.total > 0">{{ localize(ientry.total) }}</p>
                                <p class="type-label-lg" v-if="ientry.total == 0">{{ "—" }}</p> 
                            </td>
                            <td class="user" :class="{ 'active': selected == i }">
                                <button @click="selected = i">
                                    <span class="type-label-lg">{{ ientry.user }}</span>
                                </button>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="player-container">
                    <div class="player">
                        <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
                        <h4>{{ localize(entry.total) + " / " + localize(entry.possibleMax) }}</h4>
                        <div class="pack-container" v-if="entry.userPacks.length > 0">
                            <div v-for="pack in entry.userPacks" class="pack" :style="{ 'background': store.dark ? rgbaBind(darkPackColor(pack.difficulty), 0.2) : rgbaBind(lightPackColor(pack.difficulty), 0.3) }">{{ pack.name }} +{{ pack.score }}</div>
                        </div>
                        <h2 v-if="entry.created.length > 0">Created ({{ entry.created.length }})</h2>
                        <table class="table" v-if="entry.created.length > 0">
                            <tr v-for="score in entry.created">
                                <td class="rank">
                                    <p v-if="score.rank === null">&mdash;</p>
                                    <p v-else>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
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
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
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
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
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
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }} - {{ score.percent }}%</a>
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
    computed: {
        entry() {
            this.leaderboard = this.store.leaderboard[0];
            return this.leaderboard[this.selected];
        },
    },
    async mounted() {
        const list = this.store.list;
        const [leaderboard, err] = this.store.leaderboard;
        this.leaderboard = leaderboard;
        this.err = err;
        // Hide loading spinner
        this.loading = false;
    },
    methods: {
        localize,
        rgbaBind,
        lightPackColor,
        darkPackColor,
    },
    watch: {
        'store'(updated) {
            this.list = updated.list;
            this.leaderboard = updated.leaderboard[0]
            this.err = updated.errors
        }
    },
};
