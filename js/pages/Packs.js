import { store } from "../main.js";
import { embed, rgbaBind, opaque } from "../util.js";
import { score, averageEnjoyment } from "../score.js";
import { fetchEditors, fetchList, fetchPacks, fetchPackRecords } from "../content.js"; // haha pull up to the Export Function () be like LMAO! those who know:

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
                            <button @click="selectPack(index, pack.levels)" class="pack-name" :style="{ 'background': store.dark ? reactiveOpaque(pack.dark, index) : reactiveOpaque(pack.light, index),  }" :class="{ 'error': !pack }">
                                <span class="type-label-lg">
                                    {{ pack.name }}
                                </span>
                            </button>
                            <tr v-for="(packLevel, availableIndex) in availableLevels" :key="availableIndex" v-if="selectedPackIndex == index" class="pack-level-list">
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
            <div class="level-container">
                <div v-if="selectedPackIndex === null && selected === null" class="level" style="height: 100%; justify-content: center; align-items: center; text-align: center; text-wrap: pretty;">
                    <p>Click on a pack to display its levels!</p>
                    <p>You can request a role in the Discord server if you complete all levels in a pack.</p>
                </div>

                <div class="level" v-else-if="selected !== null && selectedPackIndex !== null">
                    <h1>{{ level.name }}</h1>
                    <div class="pack" :style="{ 'background': store.dark ? rgbaBind(level.packs.dark) : rgbaBind(level.packs.light) }" v-if="level.packs !== undefined">{{ level.packs.name }}</div>
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

                <div class="level" v-else-if="selectedPackIndex !== null && selected === null">
                    <h1>{{ selectedPack.name }}</h1>
                </div>
                
                
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
                        <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a></p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors" :key="editor.name">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Submission Requirements</h3>
                    <p>
                        Achieved the record without using hacks (however, FPS bypass is allowed, up to 360fps)
                    </p>
                    <p>
                        Achieved the record on the level that is listed on the site - please check the level ID before you submit a record
                    </p>
                    <p>
                        Have either source audio or clicks/taps in the video. Edited audio only does not count
                    </p>
                    <p>
                        The recording must have a previous attempt and entire death animation shown before the completion, unless the completion is on the first attempt. Everyplay records are exempt from this
                    </p>
                    <p>
                        The recording must also show the player hit the endwall, or the completion will be invalidated.
                    </p>
                    <p>
                        Do not use secret routes or bug routes
                    </p>
                    <p>
                        Do not use easy modes, only a record of the unmodified level qualifies
                    </p>
                    <p>
                        Once a level falls onto the Legacy List, we accept records for it for 24 hours after it falls off, then afterwards we never accept records for said level
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        packs: [],
        availableLevels: [],
        editors: [],
        loading: true,
        selected: null,
        selectedPackIndex: null,
        errors: [],
        roleIconMap,
        store
    }),
    computed: {

        // these functions return the info for either packs or levels
        // the handling for selecting these is below

        selectedPack() {
            return this.packs[this.selectedPackIndex] || null;
        },

        level() {
            return this.packs[this.selectedPackIndex].levels[this.selected] || null;
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
        this.list = await fetchList();
        this.editors = await fetchEditors();
        this.packs = await fetchPacks(this.list);
        this.records = await fetchPackRecords(this.packs)
        console.log(this.records)

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([err, _, __]) => err)
                    .map(([err, _, __]) => {
                        return `Failed to load level. (${err}.json)`;
                    }),
            );
            if (!this.editors) {
                this.errors.push('Failed to load list editors.');
            }
        }
        
        this.selectPack(0, this.packs[0].levels); 
        // its easier to initialize the site like this because
        // the levels are sent to the availableLevels array when this function is called
        // ie when the pack button is clicked

        this.loading = false;
    },
    methods: {
        embed,
        score,
        opaque,
        rgbaBind,
        fetchPacks,
        fetchPackRecords,
        averageEnjoyment,

        // initialize the selected pack
        // the levels shown to the user is based on the availableLevels array, it isn't
        // directly based on the pack selected but is set here after a pack is selected
        selectPack(index, levels) {
            if (this.selectedPackIndex === index) {
                this.selected = null;
                this.selectedPackIndex = null;
                this.availableLevels = [];
                return;

            }
            this.selected = null;
            this.selectedPackIndex = index;
            
            // retrieve the available levels based on the pack index
            this.availableLevels = levels;
            this.selected = 0
            return;
        },

        reactiveOpaque(color, index) {
            try {
                if (this.selectedPackIndex === index) {
                    return rgbaBind(color)
                } else {
                    return opaque(color);
                }

            } catch (e) {
                console.error("Failed to color pack: " + e);
                return `rgba(110, 110, 110, 0.7)`;
            }
        },
        
        
    }
};
