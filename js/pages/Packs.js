import { store } from "../main.js";
import { embed, rgbaBind, copyURL } from "../util.js";
import { score, packScore, lightPackColor, darkPackColor } from "../config.js";
import { averageEnjoyment } from "../content.js";
import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";
import Copy from "../components/Copy.js";
import Copied from "../components/Copied.js";

export default {
    components: { Spinner, LevelAuthors, Copy, Copied },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="packs && errored !== 'The pack data is malformed, please alert staff!'">
                    <tr v-for="(pack, index) in packs" :key="index">
                        <td class="level">
                            <button @click="selectPack(index, pack)" @mouseover="hoverIndex = index" @mouseleave="hoverIndex = null" class="pack-name" :style="{ 'background': store.dark ? reactiveOpaque(darkPackColor(pack.difficulty), index) : reactiveOpaque(lightPackColor(pack.difficulty), index) }" :class="{ 'error': !pack }">
                                <span class="type-label-lg">
                                    {{ pack.name }}
                                </span>
                            </button>
                            <tr v-if="selectedPack && selectedPackIndex == index" v-for="(packLevel, availableIndex) in selectedPack.levels" :key="availableIndex" class="pack-level-list">
                                <td class="rank pack-rank">
                                    <p v-if="packLevel.rank === null || packLevel.difficulty === -50" class="type-label-lg">&mdash;</p>
                                    <p v-else class="type-label-lg">#{{ packLevel.rank }}</p>
                                </td>
                                <td class="pack-level level" :class="{ 'active': availableIndex == selected, 'error': !packLevel || packLevel.difficulty === -50 }"> <!-- active when level is selected -->
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
                    <div class="copy-container">
                        <h1 class="copy-name">  
                            {{ level.name }}
                        </h1>
                        <Copy v-if="!copied" @click="copyURL('https://laylist.pages.dev/#/level/' + level.path); copied = true"></Copy>
                        <Copied v-if="copied" @click="copyURL('https://laylist.pages.dev/#/level/' + level.path); copied = true"></Copied>
                    </div>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier" :enjoyment="level.enjoyment || null"></LevelAuthors>
                    <h3>Difficulty: {{["Beginner", "Easy", "Medium", "Hard", "Insane", "Mythical", "Extreme", "Supreme", "Ethereal", "Legendary", "Silent", "Impossible"][level.difficulty]}} layout</h3>
                    <div v-if="level.showcase" class="tabs">
                        <button class="tab type-label-lg" :class="{selected: !toggledShowcase}" @click="toggledShowcase = false">
                            <span class="type-label-lg">Verification</span>
                        </button>
                        <button class="tab" :class="{selected: toggledShowcase}" @click="toggledShowcase = true">
                            <span class="type-label-lg">Showcase</span>
                        </button>
                    </div>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points</div>
                            <p>{{ score(level.rank, level.difficulty, 100, level.percentToQualify, list) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p style="cursor: pointer" @click="copyURL(level.id)">{{ level.id }}</p>
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
                            <p v-if="level.songLink"><a target="_blank" :href="songDownload" style="text-decoration: underline">{{ level.song || 'Song missing, please alert a list mod!' }}</a></p>
                            <p v-else>{{ level.song || 'Song missing, please alert a list mod!' }}</p>
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
                                <div class="user-container">
                                    <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                                    <img class="flag" v-if="record.flag" :src="'https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/' + (record.flag.toLowerCase()) + '.svg'" alt="flag">
                                </div>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="'/assets/phone-landscape' + (store.dark ? '-dark' : '') + '.svg'" alt="Mobile">
                            </td>
                            <td class="enjoyment">
                                <p v-if="record.enjoyment === undefined">?/10</p>
                                <p v-else>{{ record.enjoyment }}/10</p>
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}FPS</p>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- pack info page -->
                <div class="level" v-else-if="selectedPackIndex !== null && selected === null">
                <div class="copy-container">
                    <h1 class="copy-name">  
                        {{ selectedPack.name }}
                    </h1>
                    <Copy v-if="!copied" @click="copyURL('https://laylist.pages.dev/#/packs/pack/' + selectedPack.name.toLowerCase().replaceAll(' ', '_')); copied = true"></Copy>
                    <Copied v-if="copied" @click="copyURL('https://laylist.pages.dev/#/packs/pack/' + selectedPack.name.toLowerCase().replaceAll(' ', '_')); copied = true"></Copied>
                </div>
                    <h2>Difficulty: {{ ["Beginner", "Easy", "Medium", "Hard", "Insane", "Mythical", "Extreme", "Legendary"][selectedPack.difficulty] }}</h2>
                    <div class="pack-score">
                        <h3>Points: {{ selectedPack.score }}</h3>
                    </div>
                    <h2 v-if="selectedPack.levels">Levels ({{ selectedPack.levels.length }})</h2>
                    <h2 v-if="!selectedPack.levels">Levels (5)</h2>
                    <p v-if="selectedPack.levels" class="type-body">
                        <template v-for="(level, index) in selectedPack.levels">
                            <a :href="'https://laylist.pages.dev/#/level/' + level.path">{{ level.name }}</a>
                            <span v-if="index < selectedPack.levels.length - 1">, </span>
                        </template>
                    </p>
                    <p v-if="!selectedPack.levels && selectedPack.difficulty < 7"> Beat any 5 layouts in the {{ ["beginner", "easy", "medium", "hard", "insane", "mythical", "extreme"][selectedPack.difficulty] }} tier that are not in any other packs</p>
                    <p v-if="!selectedPack.levels && selectedPack.difficulty >= 7"> Beat any 5 layouts in the supreme tier or above that are not in any other packs</p>
                    <h2>Records ({{ selectedPack.records.length }})</h2>
                    <div class="pack-records">
                        <p v-for="record in selectedPack.records"><a  :href="'https://laylist.pages.dev/#/leaderboard/user/' + record.toLowerCase().replaceAll(' ', '_')">{{ record }}</a></p>
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
                    <hr class="divider">
                    <h3>About Packs</h3>
                    <div class="right-text">
                        <p>Packs are sets of levels on the Layout List chosen by the staff team that share distinct commonalities and are within a close difficulty range (generally ± 1 difficulty tier).</p>
                        <p>If you have a suggestion for a new pack, feel free to share it with the list team in #list-discussion in our Discord server!</p>
                        <p>If you beat all the levels in a pack, it gets displayed on your profile in the leaderboard!  Furthermore, send a screenshot of your list profile in #list-support in our Discord server, and we will give you the roles for the packs you've completed!</p>
                    </div>
                    <hr class="divider">
                    <h3>Difficulty Rankings</h3>
                    <div class="right-text">
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
                    <hr class="divider">
                    <div class="right-text">
                        <p>
                            For your convenience, the Layout List caches the data for the list in your browser.
                        </p>
                        <p>
                            By using the site, you agree to the storage of this data in your browser. 
                            You can disable this in your browser's settings (turn off local storage), however this will cause 
                            the site to load very slowly and is not recommended.
                        </p>
                    </div>
                    <p>
                        No data specific to you is collected or shared, and you can <u><a target="_blank" href="https://github.com/layout-list/layout-list/">view the site's source code here</a></u>.
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
        toggledShowcase: false,
        copied: false,
    }),

    methods: {
        embed,
        score,
        packScore,
        averageEnjoyment,
        rgbaBind,
        lightPackColor,
        darkPackColor,
        copyURL,

        // initialize the selected pack
        selectPack(index, pack) {
            this.errored = null;

            if (!Array.isArray(pack) && this.packs[0] !== "err") {
                try {
                    this.selected = null;
                    this.selectedPack = pack;
                    this.selectedPack["score"] = packScore(pack);
                    this.selectedPackIndex = index;

                    if (pack.levels) {
                        let erroredIndex = pack.levels.findIndex(
                            (level) => typeof level === "string"
                        );

                        if (erroredIndex !== -1) {
                            this.errors.push(
                                `${pack.levels[erroredIndex]}.json not found`
                            );
                            pack.levels[erroredIndex] = {
                                name: `Not found: ${pack.levels[erroredIndex]}.json`,
                                difficulty: -50,
                            };
                        }
                    }
                    return;
                } catch (e) {
                    this.errored = e;
                    return;
                }
            } else {
                this.errored =
                    "The pack data is malformed, please alert staff!";
                return;
            }
        },
        selectFromParam() {
            if (this.$route.params.pack) {
                const returnedIndex = this.packs.findIndex(
                    (pack) =>
                        pack.name.toLowerCase().replaceAll(" ", "_") ===
                        this.$route.params.pack
                );

                if (returnedIndex === -1)
                    this.errors.push(
                        `The pack ${this.$route.params.pack} does not exist, please double check the URL.`
                    );
                else this.selectPack(returnedIndex, this.packs[returnedIndex]);
            }
        },
        reactiveOpaque(color, index) {
            try {
                if (this.selectedPackIndex === index) {
                    return rgbaBind(color, 0.1);
                } else if (this.hoverIndex === index) {
                    return rgbaBind(color, 0.45);
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
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },

        songDownload() {
            if (!this.level.songLink.includes('drive.google.com')) {
                return this.level.songLink;
            }
            const id = this.level.songLink.match(/[-\w]{25,}/)?.[0];
            if (!id) {
                return this.level.songLink;
            }
            return `https://drive.usercontent.google.com/uc?id=${id}&export=download`;
        },
    },

    async mounted() {
        // Fetch list and packs from store
        this.list = this.store.list;
        this.packs = this.store.packs;

        // Error handling
        if (!this.list || !this.packs || this.packs[0] === "err") {
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

        this.selectFromParam();

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
                this.selectFromParam();
                updated.errors.forEach((err) =>
                    this.errors.push(`Failed to load level. (${err}.json)`)
                );
            },
            deep: true,
        },
    },
};
