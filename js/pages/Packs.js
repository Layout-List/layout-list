import { store } from "../main.js";
import { embed, rgbaBind } from "../util.js";
import { score, packScore, lightPackColor, darkPackColor } from "../config.js";
import { averageEnjoyment } from "../content.js";
import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";


export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="packs">
                    <tr v-for="(pack, index) in packs" :key="index">
                        <td class="level">
                            <button @click="selectPack(index, pack)" @mouseover="hoverIndex = index" @mouseleave="hoverIndex = null" class="pack-name" :style="{ 'background': store.dark ? reactiveOpaque(darkPackColor(pack.difficulty), index) : reactiveOpaque(lightPackColor(pack.difficulty), index) }" :class="{ 'error': !pack }">
                                <span class="type-label-lg">
                                    {{ pack.name }}
                                </span>
                            </button>
                            <tr v-if="selectedPack" v-for="(packLevel, availableIndex) in selectedPack.levels" :key="availableIndex" v-if="selectedPackIndex == index" class="pack-level-list">
                                <td class="rank pack-rank">
                                    <p v-if="packLevel.rank === null" class="type-label-lg">&mdash;</p>
                                    <p v-else class="type-label-lg">#{{ packLevel.rank }}</p>
                                </td>
                                <td class="pack-level level" :class="{ 'active': availableIndex == selected, 'error': !packLevel }"> <!-- active when level is selected -->
                                    <button class="type-label-lg" @click="selected = availableIndex">
                                        {{ packLevel.name }}
                                    </button>
                                </td>
                            </tr>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- super secret error handling! -->
            <div class="level-container">
                <div v-if="errored !== null" class="level" style="height: 100%; justify-content: center; align-items: center; text-align: center; text-wrap: pretty;">
                    <img src="https://uploads.dailydot.com/2023/10/Shocked-Meme.jpg?auto=compress&fm=pjpg" style=height:13rem;margin-bottom:3rem;>
                    <h2>Error detected, loser!</h2>
                    <p>Please let a list mod know that the pack you just clicked on might be broken, and show them this message (if there is one):</p>
                    <p>{{ errored }}</p>
                </div>
                    
                <!-- level page :shocked: -->
                <div class="level" v-else-if="selected !== null && selectedPackIndex !== null && selectedPack.levels">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <h3>Difficulty: {{["Beginner", "Easy", "Medium", "Hard", "Insane", "Mythical", "Extreme", "Supreme", "Ethereal", "Legendary", "Silent", "Impossible"][level.difficulty]}} layout</h3>
                    
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points</div>
                            <p>{{ score(level.rank, level.difficulty, 100, level.percentToQualify, list) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Password</div>
                            <p>{{ level.password || 'Free to Copy' }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Enjoyment</div>
                            <p>{{ averageEnjoyment(level.records) }}/10</p>
                        </li>
                    </ul>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Song</div>
                            <p><a target="_blank" :href="(level.songLink===undefined)?'#':level.songLink" :style="{'text-decoration':(level.songLink===undefined)?'none':'underline'}">{{ level.song || 'insert here' }}</a></p>
                        </li>
                    </ul>
                    <h2>Records ({{ level.records.length }})</h2>
                    <p><strong>{{ (level.difficulty>3)?level.percentToQualify:100 }}%</strong> or better to qualify</p>
                    <table class="pack-records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="enjoyment">
                                <p v-if="record.enjoyment === undefined">?/10</p>
                                <p v-else>{{ record.enjoyment }}/10</p>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="'/assets/phone-landscape' + (store.dark ? '-dark' : '') + '.svg'" alt="Mobile">

                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}FPS</p>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- pack info page -->
                <div class="level" v-else-if="selectedPackIndex !== null && selected === null">
                    <h1>{{ selectedPack.name }}</h1>
                    <h2>Difficulty: {{ ["Beginner", "Easy", "Medium", "Hard", "Insane", "Mythical", "Extreme", "Legendary"][selectedPack.difficulty] }} Pack</h2>
                    <div class="pack-score">
                        <h3>Points: {{ selectedPack.score }}</h3>
                    </div>
                    <h2 v-if="selectedPack.levels">Levels ({{ selectedPack.levels.length }})</h2>
                    <h2 v-if="!selectedPack.levels">Levels (5)</h2>
                    <p v-if="selectedPack.levels" class="type-body">
                        <template v-for="(level, index) in selectedPack.levels">
                            <span>{{ level.name }}</span>
                            <span v-if="index < selectedPack.levels.length - 1">, </span>
                        </template>
                    </p>
                    <p v-if="!selectedPack.levels && selectedPack.difficulty < 7"> Beat any 5 layouts in the {{ ["beginner", "easy", "medium", "hard", "insane", "mythical", "extreme"][selectedPack.difficulty] }} tier that are not in any other packs</p>
                    <p v-if="!selectedPack.levels && selectedPack.difficulty >= 7"> Beat any 5 layouts in the supreme tier or above that are not in any other packs</p>
                    <h2>Records ({{ selectedPack.records.length }})</h2>
                    <div class="pack-records">
                        <p v-for="record in selectedPack.records">{{ record }}</p>
                    </div>
                </div>
                <!-- whatever this is -->
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors" :key="error">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Some of website layout made by <a href="https://tsl.pages.dev/" target="_blank">The Shitty List</a>, Layout List originally created by DJ JDK & Blathers.</p>
                    </div>
                    <p>----------------------------------------</p>
                    <h3>About Packs</h3>
                    <p>Packs are sets of levels on the Layout List chosen by the staff team that share distinct commonalities and are within a close difficulty range (generally ± 1 difficulty tier).</p>
                    <p>If you have a suggestion for a new pack, feel free to share it with the list team in #list-discussion in our Discord server!</p>
                    <p>If you beat all the levels in a pack, it gets displayed on your profile in the leaderboard!  Furthermore, send a screenshot of your list profile in #list-support in our Discord server, and we will give you the roles for the packs you've completed!</p>
                    <p>----------------------------------------</p>
                    <h3>Difficulty Rankings</h3>
                    <p>
                        Legendary Packs = Packs with levels from the supreme tier and above (200 points)
                    </p>
                    <p>
                        Extreme Packs = Packs with levels from the extreme tier and above (150 points)
                    </p>
                    <p>
                        Mythical Packs = Packs with levels from the mythical tier (100 points)
                    </p>
                    <p>
                        Insane Packs = Packs with levels from the insane tier (70 points)
                    </p>
                    <p>
                        Hard Packs = Packs with levels from the hard tier (50 points)
                    </p>
                    <p>
                        Medium Packs = Packs with levels from the medium tier (30 points)
                    </p>
                    <p>
                        Easy Packs = Packs with levels from the easy tier (15 points)
                    </p>
                    <p>
                        Beginner Packs = Packs with levels from the beginner tier (5 points)
                    </p>
                </div>
            </div>
        </main>
    `,

    data: () => ({
        loading: true,
        list: [],
        packs: [],
        errors: [],
        errored: null,
        hoverIndex: null,
        selectedPackIndex: null,
        selectedPack: null,
        selected: null,
        store,
    }),

    methods: {
        embed,
        score,
        packScore,
        averageEnjoyment,
        rgbaBind,
        lightPackColor,
        darkPackColor,

        // initialize the selected pack
        selectPack(index, pack) {
            this.errored = null;

            try {
                this.selected = null;
                this.selectedPack = pack;
                this.selectedPack["score"] = packScore(pack);
                this.selectedPackIndex = index;
                return;
            } catch (e) {
                this.errored = e;
                return;
            }
        },

        reactiveOpaque(color, index) {
            try {
                if (this.selectedPackIndex === index) {
                    return rgbaBind(color, 0);
                } else if (this.hoverIndex === index) {
                    return rgbaBind(color, 0.35);
                } else {
                    return rgbaBind(color, 0.6);
                }
            } catch (e) {
                console.error(`Failed to color pack: ${e}`);
                return `rgba(110, 110, 110, 0.7)`;
            }
        },
    },

    computed: {
        level() {
            this.packs = this.store.packs;
            try {
                return (
                    this.packs[this.selectedPackIndex].levels[this.selected] ||
                    null
                );
            } catch (e) {
                this.errored = e;
                return;
            }
        },

        video() {
            return embed(
                this.level.showcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },

    async mounted() {
        // Fetch list and packs from store
        this.list = this.store.list;
        this.packs = this.store.packs;

        // Error handling
        if (!this.list || !this.packs) {
            this.errors = [
                "Failed to load list or packs. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.store.errors.forEach((err) =>
                this.errors.push(`Failed to load level. (${err}.json)`)
            );
        }

        // It's easier to initialize the site like this
        this.selectPack(0, this.packs[0]);

        // Hide loading spinner
        this.loading = false;
    },

    watch: {
        store: {
            handler(updated) {
                this.list = updated.list;
                this.packs = updated.packs;
                this.selectPack(
                    this.selectedPackIndex,
                    this.packs[this.selectedPackIndex]
                );
                updated.errors.forEach((err) =>
                    this.errors.push(`Failed to load level. (${err}.json)`)
                );
            }, 
            deep: true
        }
    },
};