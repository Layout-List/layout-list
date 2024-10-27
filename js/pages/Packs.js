import { store } from "../main.js";
import { embed, rgbaBind } from "../util.js";
import { score, lightPackColor, darkPackColor, packScore } from "../config.js";
import { fetchList, fetchPacks, fetchPackRecords, averageEnjoyment } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

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
                            <tr v-for="(packLevel, availableIndex) in availableLevels" :key="availableIndex" v-if="selectedPackIndex == index" class="pack-level-list">
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
                <div class="level" v-else-if="selected !== null && selectedPackIndex !== null && selectedThreshold === undefined">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :hosts="level.hosts" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
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
                    <table class="records">
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
                <div class="level" v-else-if="selectedPackIndex !== null && selected === null && selectedRecords !== null">
                <h1>{{ selectedPack.name }}</h1>
                <h2 class="pack-score">Points: {{ selectedPack.score }}</h2>
                    <h3 v-if="!selectedPack.levels" class="threshold-message"> Beat any 5 layouts in the {{ ["beginner", "easy", "medium", "hard", "insane", "mythical", "extreme", "Supreme", "ethereal", "legendary", "silent", "impossible"][selectedPack.difficulty] }} tier that are not in any other packs</h3>
                    <h2 style="margin-bottom:1rem">Records ({{ selectedRecords.size }})</h2> <!-- im gonna kms -->
                    <p v-for="record in selectedRecords" style="margin-left:2rem">{{ record }} </p>
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
                    <h3>About packs</h3>
                    <p>Packs are sets of levels on the Layout List chosen by the staff team that share distinct commonalities and are within a close difficulty range (generally ± 1 difficulty tier).</p>
                    <p>If you have a suggestion for a new pack, feel free to share it with the list team in #list-discussion in our Discord server!</p>
                    <p>If you beat all the levels in a pack, it gets displayed on your profile in the leaderboard!  Furthermore, send a screenshot of your list profile in #list-support in our Discord server, and we will give you the roles for the packs you've completed!</p>
                    <h3>Points</h3>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        packs: [],
        availableLevels: [],
        loading: true,
        selected: null,
        selectedPack: null,
        selectedPackIndex: null,
        selectedThreshold: undefined,
        hoverIndex: null, // don't ask
        selectedRecords: [],
        errors: [],
        errored: null,
        roleIconMap,
        store
    }),
    computed: {

        level() {
            this.packs = this.store.packs;
            try {
                return this.packs[this.selectedPackIndex].levels[this.selected] || null;
            } catch (e) {
                this.errored = e; return;
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
        // Hide loading spinner
        this.list = this.store.list;
        this.packs = this.store.packs;
        this.records = await fetchPackRecords(this.packs, this.list);

        // Error handling
        if (!this.list || !this.packs) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.store.errors.forEach((err) => 
                this.errors.push(`Failed to load level. (${err}.json)`))
        }
        
        this.selectPack(0, this.packs[0]); 
        // its easier to initialize the site like this because
        // the levels are sent to the availableLevels array when this function is called
        // ie when the pack button is clicked

        
        this.loading = false;
    },
    methods: {
        embed,
        rgbaBind,
        score,
        averageEnjoyment,
        fetchPacks,
        fetchPackRecords,
        lightPackColor,
        darkPackColor,
        packScore,

        // initialize the selected pack
        // the levels shown to the user is based on the availableLevels array, it isn't
        // directly based on the pack selected but is set here after a pack is selected
        selectPack(index, pack) {
            this.errored = null;

            try {
                this.selected = null;
                this.selectedPack = pack;
                this.selectedPack['score'] = packScore(pack, this.list)
                this.selectedPackIndex = index;
                
                // retrieve the available levels based on the pack index
                if (pack.levels) {
                    this.availableLevels = pack.levels;
                    this.selectedThreshold = undefined;
                } else {
                    this.availableLevels = [];
                    this.selectedThreshold = pack;
                }
                
                this.selectedRecords = this.records[pack.name];
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
    watch: {
        'store.errors'(errors) {
            errors.forEach(err => {
                this.errors.push(`Failed to load level. (${err}.json)`);
            });
        }
    },
};