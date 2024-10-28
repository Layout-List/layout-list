import { fetchChallengeLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: { Spinner },
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
                    <nav class="nav">
                        <div class="nav__actions2">
                             <router-link class="nav__cta2" type-label-lg to="/leaderboard">
                                <span class="type-label-lg">Full Levels</span>
                              </router-link>
                              <router-link class="nav__cta2" type-label-lg to="/challengeleaderboard">
                                <span class="type-label-lg">Challenges</span>
                            </router-link>
                        </div>
                    </nav>
                    <div class="notice" style="margin-bottom:22px;margin-top:-12px">
                        <p>The challenge list has been archived, effective 8/19/24.  Records will no longer be accepted.</p>
                    </div>
                    <table class="board">
                        <tr v-for="(ientry, i) in leaderboard">
                            <td class="rank">
                                <p class="type-label-lg">#{{ i + 1 }}</p>
                            </td>
                            <td class="total">
                                <p class="type-label-lg">{{ localize(ientry.total) }}</p>
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
                        <h2 v-if="entry.verified.length > 0">Verified</h2>
                        <table class="table">
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
                        <h2 v-if="entry.completed.length > 0">Completed</h2>
                        <table class="table">
                            <tr v-for="score in entry.completed">
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
                    </div>
                </div>
            </div>
        </main>
    `,

    data: () => ({
        loading: true,
        leaderboard: [],
        err: [],
        selected: 0,
    }),

    methods: {
        localize,
    },

    computed: {
        entry() {
            return this.leaderboard[this.selected];
        },
    },

    async mounted() {
        const [leaderboard, err] = await fetchChallengeLeaderboard();
        this.leaderboard = leaderboard;
        this.err = err;
        // Hide loading spinner
        this.loading = false;
    },
};