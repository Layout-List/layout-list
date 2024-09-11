import { store } from '../main.js';
import { embed } from '../util.js';
import { score, round, averageEnjoyment } from '../score.js';
import { fetchEditors, fetchList } from '../content.js';

import Spinner from '../components/Spinner.js';
import LevelAuthors from '../components/List/LevelAuthors.js';

const roleIconMap = {
    owner: 'crown',
    admin: 'user-gear',
    helper: 'user-shield',
    dev: 'code',
    trial: 'user-lock',
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
                                <span class="type-label-lg">{{ pack?.name || \`Error (\${err}.json)\` }}</span>
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
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Website layout on <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a>, made by DJ JDK & Blathers.</p>
                    </div>
                    <template v-if="editors">
                        <h3>LIST EDITORS</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>

                    <h3>Tags</h3>
                    <p>
                        (⭐ Rated )
                        (❌ Pending Removal )
                        (✨ Subject to Exemptions )
                        (🟢 To be Moved Up )
                        (🔴 To be Moved Down )
                    </p>
                    
                    <h3>Record Submission Requirements</h3>
                    <p>
                        You must have achieved the record without using hacks (including hacks that change the physics of the game, ie. physics bypass via MegaHack, however, "Click Between Frames" is allowed).
                    </p>
                    <p>
                        You must have achieved the record on the level that is listed on the site or on an approved bugfixed copy - please check the level ID before you submit a record!
                    </p>
                    <p>
                        The recording must have either source audio or clicks (visual tap indication if on mobile) for the record to be validated. Edited audio does not count.
                    </p>
                    <p>
                        Complete raw footage is required alongside your record for any layouts in Extreme Tier or above.
                    </p>
                    <p>
                        The recording must have a previous attempt and death animation shown before the completion, unless the completion is on the first attempt.
                    </p>
                    <p>
                        The recording must show the player hit the end-wall as well as present your end stats, or the completion will be invalidated.
                    </p>
                    <p>
                        Do not use secret routes, skips, or bug routes!
                    </p>
                    <p>
                        Cheat Indicator is required for all completions via Geode, MegaHack, or iCreate Pro. If you do not have Cheat Indicator on, your record will likely be invalidated (this is not 100% required for mobile as of yet due to mobile limitations).
                    </p>
                    
                    
                    <h4></h4>
                    <h4>DIFFICULTY RANKINGS</h4>
                    <p>
                        Impossible Layout = Top Extreme Demons (401 to 750 Points)
                    </p>
                    <p>
                        Legendary Layout = Mid Extreme Demons (201 to 400 Points)
                    </p>
                    <p>
                        Extreme Layout = Beginner Extreme Demons (101 to 200 Points)
                    </p>
                    <p>
                        Mythical Layout = High Insane Demons (71 to 100 Points)
                    </p>
                    <p>
                        Insane Layout = Insane Demons (41 to 70 Points)
                    </p>
                    <p>
                        Hard Layout = Hard Demons (21 to 40 Points)
                    </p>
                    <p>
                        Medium Layout = Medium Demons (11 to 20 Points)
                    </p>
                    <p>
                        Easy Layout = Easy Demons (6 to 10 Points)
                    </p>
                    <p>
                        Beginner Layout = Non Demons (1 to 5 Points)
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
        listlevels: 0,
        roleIconMap,
        store,
        toggledShowcase: false,
    }),
    computed: {
        selectedPack() {
            return this.packs[this.selected] || null;
        },
        level() {
            return this.list && this.list[this.selected] && this.list[this.selected][2];
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
        enjoyment() {
            let count = 0;
            let num = 0;
            for (let i = 0; i < this.records.length; i++) {
                switch (this.records[i].enjoyment) {
                    case 1:
                        total += this.records[i].enjoyment;
                        num += 1;
                        break;
                    case 2:
                        total += this.records[i].enjoyment;
                        num += 1;
                        break;
                    case 3:
                        total += this.records[i].enjoyment;
                        num += 1;
                        break;
                    case 4:
                        total += this.records[i].enjoyment;
                        num += 1;
                        break;
                    case 5:
                        total += this.records[i].enjoyment;
                        num += 1;
                        break;
                    case 6:
                        total += this.records[i].enjoyment;
                        num += 1;
                        break;
                    case 7:
                        total += this.records[i].enjoyment;
                        num += 1;
                        break;
                    case 8:
                        total += this.records[i].enjoyment;
                        num += 1;
                        break;
                    case 9:
                        total += this.records[i].enjoyment;
                        num += 1;
                        break;
                    case 10:
                        total += this.records[i].enjoyment;
                        num += 1;
                        break;
                    default:
                        break;
                }
            }
            if (num > 0) {
                return round(total / num);
            }
            return "?";
        }
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();            
        this.editors = await fetchEditors();
        this.packs = this.getPacks(this.list);

        /* console.log("new packs log: ", JSON.parse(JSON.stringify(this.packs)));

        console.log("Packs:", this.packs); */
        
        // Error handling
        if (!this.list) {
            this.errors = [
                'Failed to load list. Retry in a few minutes or notify list staff.',
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
            if (!this.packs) {
                this.errors.push('Failed to load list packs.');
            }
        }
        
        this.loading = false;
    },
    methods: {
        embed,
        score,
        averageEnjoyment,
        getPacks(list) {
            // Collect packs and their respective levels
            // console.log('list:', list);
            const packsMap = {};
        
            list.forEach(([level]) => {
                if (level && level.pack) {
                        packsMap[level.pack] = {
                            name: level.pack,
                            color: level.packColor,
                            levels: [],
                        };
                    
                    packsMap[level.pack].levels.push(level.name);
                }
            });
        
            // did it work Lets find out
            if (Object.keys(packsMap).length === 0) {
                // console.error("no packs created");
            }
        
            return Object.values(packsMap);
        }
        
    },
};
