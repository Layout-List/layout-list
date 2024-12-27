import { store } from '../main.js';
import { getThumbnailFromId, getYoutubeIdFromUrl, shuffle } from '../util.js';
import Spinner from '../components/Spinner.js';
import Btn from '../components/Btn.js';


export default {
    components: { Spinner, Btn },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-roulette">
            <div class="sidebar">
                <p class="type-label-md" style="color: #aaa">
                    Shameless copy of the Extreme Demon Roulette by <a href="https://matcool.github.io/extreme-demon-roulette/" target="_blank">matcool</a>.
                </p>
                <form class="options">
                    <div class="check">
                        <input type="checkbox" id="main" value="Main List" v-model="useMainList">
                        <label for="main">Top 100 levels</label>
                    </div>
                    <div class="check">
                        <input type="checkbox" id="extended" value="Extended List" v-model="useExtendedList">
                        <label for="extended">Levels below top 100</label>
                    </div>
                    <Btn @click.native.prevent="onStart">{{ levels.length === 0 ? 'Start' : 'Restart'}}</Btn>
                </form>
                <p class="type-label-md" style="color: #aaa">
                    The roulette saves automatically.
                </p>
                <form class="save">
                    <p>Manual Load/Save</p>
                    <div class="btns">
                        <Btn @click.native.prevent="onImport">Import</Btn>
                        <Btn :disabled="!isActive" @click.native.prevent="onExport">Export</Btn>
                    </div>
                </form>
            </div>
            <section class="levels-container">
                <div class="levels">
                    <template v-if="levels.length > 0">
                        <!-- Completed Levels -->
                        <div class="level" v-for="(level, i) in levels.slice(0, progression.length)">
                            <a :href="level.video" class="video">
                                <img :src="getThumbnailFromId(getYoutubeIdFromUrl(level.video))" alt="">
                            </a>
                            <div class="meta">
                                <p>#{{ level.rank }}</p>
                                <h2><a :href="'https://laylist.pages.dev/#/level/' + level.path" target="_blank">{{ level.name }}</a></h2>
                                <p style="color: #00b54b; font-weight: 700">{{ progression[i] }}%</p>
                            </div>
                        </div>
                        <!-- Current Level -->
                        <div class="level" v-if="!hasCompleted">
                            <a :href="currentLevel.video" target="_blank" class="video">
                                <img :src="getThumbnailFromId(getYoutubeIdFromUrl(currentLevel.video))" alt="">
                            </a>
                            <div class="meta">
                                <div class="copy-container">
                                    <p class="copy-name">
                                        #{{ currentLevel.rank }}
                                    </p>
                                    
                                    <div v-if="currentLevel.songlink !== null">
                                        <p class="nong-text">
                                            <a
                                                :href="currentLevel.songlink"
                                                target="_blank"
                                                class="nong-text"
                                            >Nong: {{ currentLevel.songname }}
                                            </a>
                                        </p>
                                    </div>
                                </div>
                                <h2><a :href="'https://laylist.pages.dev/#/level/' + currentLevel.path" target="_blank">{{ currentLevel.name }}</a></h2>
                                <p>{{ currentLevel.id }}</p>
                            </div>
                            <form class="actions" v-if="!givenUp">
                                <input type="number" v-model="percentage" :placeholder="placeholder" :min="currentPercentage + 1" max=100>
                                <Btn @click.native.prevent="onDone">Done</Btn>
                                <Btn @click.native.prevent="onGiveUp" style="background-color: #e91e63;">Give Up</Btn>
                            </form>
                        </div>
                        <!-- Results -->
                        <div v-if="givenUp || hasCompleted" class="results">
                            <h1>Results</h1>
                            <p>Number of levels: {{ progression.length }}</p>
                            <p>Highest percent: {{ currentPercentage }}%</p>
                            <Btn v-if="currentPercentage < 99 && !hasCompleted" @click.native.prevent="showRemaining = true">Show remaining levels</Btn>
                        </div>
                        <!-- Remaining Levels -->
                        <template v-if="givenUp && showRemaining">
                            <div class="level" v-for="(level, i) in levels.slice(progression.length + 1, levels.length - currentPercentage + progression.length)">
                                <a :href="level.video" target="_blank" class="video">
                                    <img :src="getThumbnailFromId(getYoutubeIdFromUrl(level.video))" alt="">
                                </a>
                                <div class="meta">
                                    <p>#{{ level.rank }}</p>
                                    <h2><a :href="'https://laylist.pages.dev/#/level/' + level.path" target="_blank">{{ level.name }}</a></h2>
                                    <p style="color: #d50000; font-weight: 700">{{ currentPercentage + 2 + i }}%</p>
                                </div>
                            </div>
                        </template>
                    </template>
                </div>
            </section>
            <div class="toasts-container">
                <div class="toasts">
                    <div v-for="toast in toasts" class="toast">
                        <p>{{ toast }}</p>
                    </div>
                </div>
            </div>
        </main>
    `,

    data: () => ({
        loading: false,
        levels: [],
        progression: [],
        toasts: [],
        fileInput: undefined,
        useMainList: true,
        useExtendedList: true,
        percentage: undefined,
        givenUp: false,
        showRemaining: false,
        store,
        nongClicked: false,
    }),

    methods: {
        shuffle,
        getThumbnailFromId,
        getYoutubeIdFromUrl,
        async onStart() {
            if (this.isActive) {
                this.showToast('Give up before starting a new roulette.');
                return;
            }

            if (!this.useMainList && !this.useExtendedList) {
                return;
            }

            this.loading = true;

            const fullList = (this.store.list).filter(([_, pos, __]) => pos !== null);


            if (fullList.filter(([err, _]) => err).length > 0) {
                this.loading = false;
                this.showToast(
                    'The list is currently broken. Wait until it\'s fixed to start a roulette.',
                );
                return;
            }

            const fullListMapped = fullList.map(([_, __, lvl], i) => ({
                rank: i + 1,
                id: lvl.id,
                name: lvl.name,
                video: lvl.verification,
                path: lvl.path,
                songname: lvl.song ? lvl.song : null,
                songlink: lvl.songLink ? lvl.songLink : null,
            }));

            const list = [];
            if (this.useMainList) {
                list.push(...fullListMapped.slice(0, 100));
            }
            if (this.useExtendedList) {
                list.push(...fullListMapped.slice(100));
            }

            // Random 100 levels
            this.levels = shuffle(list).slice(0, 100);
            this.showRemaining = false;
            this.givenUp = false;
            this.progression = [];
            this.percentage = undefined;

            this.loading = false;
        },
        save() {
            localStorage.setItem(
                'roulette',
                JSON.stringify({
                    levels: this.levels,
                    progression: this.progression,
                }),
            );
        },
        onDone() {
            if (!this.percentage) {
                return;
            }

            if (
                this.percentage <= this.currentPercentage ||
                this.percentage > 100
            ) {
                this.showToast('Invalid percentage.');
                return;
            }

            this.progression.push(this.percentage);
            this.percentage = undefined;

            this.save();
        },
        onGiveUp() {
            this.givenUp = true;

            // Save progress
            localStorage.removeItem('roulette');
        },
        onImport() {
            if (
                this.isActive &&
                !window.confirm('This will overwrite the currently running roulette. Continue?')
            ) {
                return;
            }

            this.fileInput.showPicker();
        },
        async onImportUpload() {
            if (this.fileInput.files.length === 0) return;

            const file = this.fileInput.files[0];

            if (file.type !== 'application/json') {
                this.showToast('Invalid file.');
                return;
            }

            try {
                const roulette = JSON.parse(await file.text());

                if (!roulette.levels || !roulette.progression) {
                    this.showToast('Invalid file.');
                    return;
                }

                this.levels = roulette.levels;
                this.progression = roulette.progression;
                this.save();
                this.givenUp = false;
                this.showRemaining = false;
                this.percentage = undefined;
            } catch {
                this.showToast('Invalid file.');
                return;
            }
        },
        onExport() {
            const file = new Blob(
                [JSON.stringify({
                    levels: this.levels,
                    progression: this.progression,
                })],
                { type: 'application/json' },
            );
            const a = document.createElement('a');
            a.href = URL.createObjectURL(file);
            a.download = 'layoutlist_roulette';
            a.click();
            URL.revokeObjectURL(a.href);
        },
        showToast(msg) {
            this.toasts.push(msg);
            setTimeout(() => {
                this.toasts.shift();
            }, 3000);
        },
    },

    computed: {
        currentLevel() {
            return this.levels[this.progression.length];
        },
        currentPercentage() {
            return this.progression[this.progression.length - 1] || 0;
        },
        placeholder() {
            return `At least ${this.currentPercentage + 1}%`;
        },
        hasCompleted() {
            return (
                this.progression[this.progression.length - 1] >= 100 ||
                this.progression.length === this.levels.length
            );
        },
        isActive() {
            return (
                this.progression.length > 0 &&
                !this.givenUp &&
                !this.hasCompleted
            );
        },
    },

    mounted() {
        // Create file input
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.multiple = false;
        this.fileInput.accept = '.json';
        this.fileInput.addEventListener('change', this.onImportUpload);

        // Load progress from local storage
        const roulette = JSON.parse(localStorage.getItem('roulette'));

        if (!roulette) {
            return;
        }

        this.levels = roulette.levels;
        this.progression = roulette.progression;
    },

    watch: {
        store: {
            handler(updated) {
                this.list = updated.list
                updated.errors.forEach(err => this.errors.push(`Failed to load level. (${err}.json)`))
            },
            deep: true
        }
    },
};