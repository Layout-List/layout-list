import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

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
                        <td class="level" :class="{ 'active': selected == index, 'error': !pack }">
                            <button @click="selected = index">
                                <span class="type-label-lg">{{ pack.name }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="selectedPack">
                    <h1>{{ selectedPack.name }}</h1>
                    <ul>
                        <h3 v-for="level in selectedPack.levels" :key="level">{{ level }}</h3>
                    </ul>
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
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store
    }),
    computed: {
        selectedPack() {
            return this.packs[this.selected] || null;
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();
        this.packs = await this.getPacks(this.list);

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

        this.loading = false;
    },
    methods: {
        embed,
        score,
        async getPacks(list) {
            // Collect packs and their respective levels
            const packsMap = {};
            let packs = [];
            list.forEach((object) => { // list is an array > array with length of 3 > usually null (probably errors if any), level rank, level object
                let level = object[2]; // why

                if (level.packs) { // if the level is in a pack

                    if (!packs[level.packs]) {

                        packsMap[level.packs] = {
                            name: level.packs.name,
                            light: level.packs.light,
                            dark: level.packs.dark,
                            levels: [level.packs.levels],
                        };

                        packs.push(packsMap[level.packs]);
                }
            }
            });
            console.log(packs)

            return packs;
        },
    },
};