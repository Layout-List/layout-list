import { store } from '../main.js';
import { averageEnjoyment } from '../content.js';
import Spinner from '../components/Spinner.js';
import Scroll from '../components/Scroll.js'
import Level from '../components/List/Level.js'
import TierInfo from '../components/List/TierInfo.js';
import CacheDisclaimer from '../components/Sidebar/CacheDisclaimer.js';
import DifficultyInfo from '../components/Sidebar/DifficultyInfo.js';
import RecordRules from '../components/Sidebar/RecordRules.js';
import TemplateDisclaimer from '../components/Sidebar/TemplateDisclaimer.js';
import Staff from '../components/Sidebar/Staff.js';
import Errors from '../components/Sidebar/Errors.js';

export default {
    components: { Spinner, Scroll, Level, TierInfo, CacheDisclaimer, RecordRules, DifficultyInfo, TemplateDisclaimer, Staff, Errors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
        <div class="list-container">
            <div class="search-container">
                <input
                    type="text"
                    class="search"
                    id="search-bar"
                    placeholder="Search..."
                    v-model="searchQuery"
                />
                <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">x</button>
            </div>
            <div class="button-bar" :class="true ? 'dark' : ''">
                <Scroll alt="Scroll to selected" @click="scrollToSelected()" />
                <select v-model="sortOption">
                    <option value="0">Ranking</option>
                    <option value="1">Enjoyment</option>
                    <option value="2">Popularity</option>
                </select>
                <p style="font-size: 9.5px; opacity: 30%;" class="director" @click="descending = !descending">{{ descending === true ? 'Descending' : 'Ascending' }}</p>
            </div>
            <table class="list" v-if="filteredLevels.length > 0">
                <tr v-for="({ item: [err, rank, level], index }, i) in filteredLevels" :key="index">
                    <td class="rank">
                        <p v-if="rank === null" class="type-label-lg" style="width:2.7rem">&mdash;</p>
                        <p v-else class="type-label-lg" style="width:2.7rem">#{{ rank }}</p>
                    </td>
                    <td class="level" :class="{ 'active': selected == index, 'error': err !== null }" :ref="selected == index ? 'selected' : undefined">
                        <button @click="selected = index">
                            <span class="type-label-lg">{{ level?.name || 'Error (' + err + '.json)' }}</span>
                        </button>
                    </td>
                </tr>
            </table>
            <p class="level" style="padding:1.1rem" v-else>No levels found.</p>
        </div>
            <div class="level-container">
                <Level :level="level" :list="list" :key="level.rank" v-if="level && level.id!=0" />
                <TierInfo :level="level" :list="list" :descending="descending" v-else-if="level?.id==0" />
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <Errors :errors="errors" />
                    <TemplateDisclaimer />
                    <hr class="divider">
                    <Staff />
                    <hr class="divider">
                    <h3>Tags</h3>
                    <p class="director" @click="search('⭐')">⭐ Rated</p>
                    <p class="director" @click="search('✨')">✨ Subject to Exemptions</p>
                    <p class="director" @click="search('💫')">💫 Accepted Under Old Standards</p>
                    <p class="director" @click="search('🎖️')">🎖️ Creator Contest Winner</p>
                    <p class="director" @click="search('❌')">❌ Pending Removal</p>
                    <hr class="divider">
                    <RecordRules />
                    <hr class="divider">
                    <DifficultyInfo />
                    <hr class="divider">
                    <CacheDisclaimer />
                </div>
            </div>
        </main>
    `,

    data: () => ({
        loading: true,
        list: [],
        staff: [],
        errors: [],
        selected: 1,
        store,
        searchQuery: '',
        sortOption: 0,
        descending: true
    }),

    methods: {
        // used for the ability to deselect tag filters
        search(query) {
            if (this.searchQuery === query) {
                this.searchQuery = '';
            } else {
                this.searchQuery = query;
            }
        },
        selectFromParam() {
            if (this.$route.params.level) {
                const returnedIndex = this.list.findIndex(
                    ([err, rank, lvl]) => 
                        lvl.path === this.$route.params.level 
                );
                
                if (returnedIndex === -1) this.errors.push(`The level ${this.$route.params.level} does not exist, please double check the URL.`);
                else this.selected = returnedIndex;
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
        level() {
            return this.list && this.list[this.selected] && this.list[this.selected][2];
        },
        filteredLevels() {
            const query = this.searchQuery.toLowerCase();
            let list = this.list
            // this was a lot of fun!
            let sortOption = parseInt(this.sortOption)

            // use the separate indexing for searching Shenanigans
            list = list.map((item, index) => ({ index, item }));
            
            // search logic
            if (query.trim()) {
                list = list.filter(({ item: [err, rank, level] }) =>
                    (level?.name.toLowerCase())
                        .includes(query) &&
                    level?.id !== 0
                )
            }

            // sort based on value of dropdown menu
            if (sortOption === 1) {
                list = list.filter(({ item }) =>
                            item[2]?.id !== 0 &&
                            averageEnjoyment(item[2]?.records) !== "?"
                        )
                    .sort((a, b) => {
                            const enjoymentA = averageEnjoyment(a.item[2].records);
                            const enjoymentB = averageEnjoyment(b.item[2].records);

                            return enjoymentB - enjoymentA;
                        })
                        
            } else if (sortOption === 2) {
                list = list.filter(({ item }) =>
                        item[2].id !== 0
                    )
                .sort((a, b) => {
                    const recordLenA = a.item[2].records.length;
                    const recordLenB = b.item[2].records.length;
                    return recordLenB - recordLenA;
                })
                
            }

            // by default the list should be in descending order
            if (!this.descending) {
                list = list.reverse()
            }

            return list
        },
    },

    async mounted() {
        // Fetch list from store
        this.list = this.store.list;
        this.staff = store.staff;
        
        this.selectFromParam()

        // Error handling
        if (!this.list) {
            this.errors = [
                'Failed to load list. Retry in a few minutes or notify list staff.',
            ];
        } else {
            this.store.errors.forEach((err) => 
                this.errors.push(`Failed to load level. (${err}.json)`))

            if (!this.staff) {
                this.errors.push('Failed to load list staff.');
            }
        }

        // Hide loading spinner
        this.loading = false;

        // tests for incorrect difficulties and duplicate records
        let i = 0
        let currentdiff, newdiff;
        while (i < this.list.length) {
            if (this.list[i][2]) {
                let templevel = this.list[i][2]

                newdiff = templevel.difficulty 
                if (templevel.id === 0) {
                    if (templevel.difficulty !== currentdiff - 1 && currentdiff !== undefined) {
                        console.error(`Found incorrect divider difficulty! Please set ${templevel.path}'s difficulty to ${currentdiff - 1}.`)
                    }
                    currentdiff = templevel.difficulty
                }
                
                if (newdiff !== currentdiff) console.warn(`Found incorrect difficulty! ${templevel.name} (${templevel.path}.json) is set to ${newdiff}, please set it to ${currentdiff}.`)
                
                
                const foundusers = []
                for (const record of templevel.records) {
                    if (record.enjoyment && (typeof record.enjoyment === "string" && record.enjoyment !== "?")) {
                        console.warn(`Found wrong type of enjoyment on level ${templevel.name} (${record.enjoyment})! Please set enjoyment to a number or '?'`)
                    }
                    if (foundusers.includes(record.user) || record.user === templevel.verifier) {
                        console.warn(`Found duplicate record! ${record.user} has a duplicate record on ${templevel.name} (${templevel.path}.json).`)
                    } else {
                        foundusers.push(record.user)
                    }

                    if (record.enjoyment && (templevel.creators.includes(record.user))) {
                        console.warn(`Invalid enjoyment on ${templevel.name}: ${record.enjoyment}/10 by ${record.user}!`)
                    }

                }
            }
            i++
        }
    },

    watch: {        
        store: {
            handler(updated) {
                this.list = updated.list;
                this.staff = updated.staff;
                updated.errors.forEach(err => {
                    this.errors.push(`Failed to load level. (${err}.json)`);
                })
                this.selectFromParam()
            }, 
            deep: true
        }
    },
};
