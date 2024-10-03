import { store } from '../main.js';
import { embed, rgbaBind } from '../util.js';
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
                <table class="list" v-if="list">
                    <tr v-for="([err, rank, level], i) in list">
                        <td class="rank">
                            <p v-if="rank === null" class="type-label-lg">&mdash;</p>
                            <p v-else class="type-label-lg">#{{ rank }}</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': err !== null }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || 'Error (' + err + '.json)' }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level && level.id!=0">
                    <h1>{{ level.name }}</h1>
                    <div class="pack" :style="{ 'background': store.dark ? rgbaBind(level.packs.dark) : rgbaBind(level.packs.light) }" v-if="level.packs !== undefined">{{ level.packs.name }}</div>
                </div>
                <div v-else-if="level.id==0" class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <h1>{{ level.name }}</h1>
                    <p>The levels below are {{ level.name.replace("(", "").replace(")", "") }}.</p>
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
                                <img :src="'/assets/' + roleIconMap[editor.role] + (store.dark ? '-dark' : '') + '.svg'" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 1,
        errors: [],
        listlevels: 0,
        roleIconMap,
        store,
        toggledShowcase: false,
    }),
  
    computed: {
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
},
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();            
        this.editors = await fetchEditors();
        
        
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
        }
            
        this.loading = false;
    },
    
    methods: {
        embed,
        score,
        averageEnjoyment,
        rgbaBind
},

};
