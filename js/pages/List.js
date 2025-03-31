import { store } from '../main.js';
import { embed, rgbaBind, localize, copyURL } from '../util.js';
import { score, lightPackColor, darkPackColor, aprilFoolsVideos } from '../config.js';
import { averageEnjoyment, fetchHighestEnjoyment, fetchLowestEnjoyment, fetchTotalScore, fetchTierLength, fetchUsers, fetchStaff, fetchList } from '../content.js';
import Spinner from '../components/Spinner.js';
import Scroll from '../components/Scroll.js'
import Level from '../components/List/Level.js'
import TierInfo from '../components/List/TierInfo.js';
import CookiesDisclaimer from '../components/Sidebar/CookiesDisclaimer.js';
import DifficultyInfo from '../components/Sidebar/DifficultyInfo.js';
import RecordRules from '../components/Sidebar/RecordRules.js';
import TemplateDisclaimer from '../components/Sidebar/TemplateDisclaimer.js';
import Staff from '../components/Sidebar/Staff.js';
import Errors from '../components/Sidebar/Errors.js';

export default {
    components: { Spinner, Scroll, Level, TierInfo, CookiesDisclaimer, RecordRules, DifficultyInfo, TemplateDisclaimer, Staff, Errors },
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
                        <button @click="(disabledRandomSelect ? selected = index : selected = Math.floor(Math.random() * filteredLevels.length)); copied = false;">
                            <span class="type-label-lg">{{ level?.name || 'Error (' + err + '.json)' }}</span>
                        </button>
                    </td>
                </tr>
            </table>
            <p class="level" style="padding:1.1rem" v-else>No levels found.</p>
        </div>
            <div class="level-container">
                <div class="level" v-if="level && level.id!=0">
                    <div class="copy-container">
                        <h1 class="copy-name">  
                            {{ level.name }}
                        </h1>
                        <Copy v-if="!copied" @click="copyURL('https://laylist.pages.dev/#/level/' + level.path); copied = true"></Copy>
                        <Copied v-if="copied" @click="copyURL('https://laylist.pages.dev/#/level/' + level.path); copied = true"></Copied>
                    </div>
                    <div class="pack-container" v-if="level.packs.length > 1 || level.packs.length !== 0 && level.packs[0].levels">
                        <a class="pack" v-for="pack in level.packs" :style="{ 'background': store.dark ? rgbaBind(darkPackColor(pack.difficulty), 0.2) : rgbaBind(lightPackColor(pack.difficulty), 0.3), 'display': (!pack.levels || pack.wholeList) ? 'none' : 'inherit' }" :href="'https://laylist.pages.dev/#/packs/pack/' + pack.name.toLowerCase().replaceAll(' ', '_')">{{ pack.name }}</a>
                    </div>
                    <LevelAuthors :creators="[users[Math.floor(Math.random() * users.length)]]" :verifier="users[Math.floor(Math.random() * users.length)]" :enjoyment="0"></LevelAuthors>
                    <h3>Difficulty: {{["Beginner", "Easy", "Medium", "Hard", "Insane", "Mythical", "Extreme", "Supreme", "Ethereal", "Legendary", "Silent", "Impossible"][level.difficulty]}} layout</h3>
                    <div v-if="level.showcase" class="tabs">
                        <button class="tab type-label-lg" :class="{selected: !toggledShowcase}" @click="toggledShowcase = false">
                            <span class="type-label-lg">Verification</span>
                        </button>
                        <button class="tab" :class="{selected: toggledShowcase}" @click="toggledShowcase = true">
                            <span class="type-label-lg">Showcase</span>
                        </button>
                    </div>
                    <iframe class="video" id="videoframe" :src="embed(aprilFoolsVideos[Math.floor(Math.random() * aprilFoolsVideos.length)])" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points</div>
                            <p>{{ score(level.rank, level.difficulty, 100, level.percentToQualify, list) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p class="director" style="cursor: pointer" @click="copyURL(level.id)">{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Password</div>
                            <p>{{ level.password || 'Free to Copy' }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Enjoyment</div>
                            <p>0/10</p>
                        </li>
                    </ul>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">{{ level.songLink ? "NONG" : "Song" }}</div>
                            <p class="director" v-if="level.songLink"><a target="_blank" :href="songDownload" >{{ level.song || 'Song missing, please alert a list mod!' }}</a></p>
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
                                    <a :href="aprilFoolsVideos[Math.floor(Math.random() * aprilFoolsVideos.length)]" target="_blank" class="type-label-lg director">{{ users[Math.floor(Math.random() * users.length)] }}</a>
                                </div>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="'/assets/phone-landscape' + (store.dark ? '-dark' : '') + '.svg'" alt="Mobile">
                            </td>
                            <td class="enjoyment">
                                <p>0/10</p>
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}FPS</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else-if="level?.id==0" class="tier" style="height: 100%; justify-content: center; align-items: center;">
                    <h1>{{ level.name }}</h1>
                    <h2 style="padding-top:1rem"># of levels in tier: {{ fetchTierLength(list, level.difficulty) }}</h2>
                    <h2 style="padding-bottom:1rem">Points in tier: {{ localize(fetchTotalScore(list, level.difficulty)) }}</h2>
                    <tr style="justify-content: center; align-items: center;">
                        <td><h3 class="tier-info">Highest enjoyment: {{ fetchHighestEnjoyment(list, level.difficulty) }}</h3></td>
                    </tr>
                    <tr style="justify-content: center; align-items: center;">
                        <td><h3 class="tier-info" style="padding-bottom:0.5rem">Lowest enjoyment: {{ fetchLowestEnjoyment(list, level.difficulty) }}</h3></td>
                    </tr>
                    <p style="padding-top:1.5rem">The levels {{ descending ? 'below' : 'above' }} are {{ ["beginner", "easy", "medium", "hard", "insane", "mythical", "extreme", "supreme", "ethereal", "legendary", "silent", "impossible"][level.difficulty] }} layouts.</p>

                    <h3 v-if="level.difficulty > 5" style="padding-top:1.5rem"><a href="https://docs.google.com/spreadsheets/d/1tgwlKJpFMC2lEK8XjFPyKGP1-JJ0z2t6GsvCyojEeCw/">sn0w's extreme spreadsheet</a></h3>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <Errors :errors="errors" />
                    <input type="checkbox" id="randomSelect" v-model="disabledRandomSelect">
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
                    <CookiesDisclaimer />
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
        descending: true,
        disabledRandomSelect: false,
        aprilFoolsVideos,
        users: []
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
        console.log('fetchList')
        this.list = await fetchList();
        this.staff = await fetchStaff();
        
        this.selectFromParam()

        // Error handling
        if (!this.list) {
            this.errors = [
                'Failed to load list. Retry in a few minutes or notify list staff.',
            ];
        } else {
            /*
            this.store.errors.forEach((err) => 
                this.errors.push(`Failed to load level. (${err}.json)`))

            */
            if (!this.staff) {
                this.errors.push('Failed to load list staff.');
            }
        }

        this.users = await fetchUsers()

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
        /*
        store: {
            handler(updated) {
                this.list = updated.list;
                this.staff = updated.staff;

                updated.errors?.forEach(err => {
                    this.errors.push(`Failed to load level. (${err}.json)`);
                })
                this.selectFromParam()
            }, 
            deep: true
        }
            */
    },
};
