import { store } from '../main.js'
import { localize, getThumbnailFromId, getYoutubeIdFromUrl } from '../util.js';
import { fetchUsers, averageEnjoyment } from '../content.js'
import Spinner from '../components/Spinner.js';
import Copy from '../components/Copy.js'
import Copied from '../components/Copied.js'
import Scroll from '../components/Scroll.js'
import Btn from '../components/Btn.js';
import { score } from '../config.js';

export default {
    components: { Spinner, Copy, Copied, Scroll, Btn },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="grind-page">
            <div v-if="!loggedIn" class="login-container">
                <h1>Login</h1>
                <input type="text" id="username" name="username" placeholder="Username" class="search" v-model="loggingIn" autocomplete="off"><br><br>
                <div class="user-suggest">
                    <h3 v-for="(user, i) in filteredUsers" class="suggested-user">
                        <span 
                            @click.native.prevent="login(user)"
                            >
                            {{ user }}
                        </span>
                    </h3>
                </div>
            </div>
            <div v-else class="grind-page-container-full">
                <div class="page-leaderboard">
                    <div class="board-container grind-meta">
                        <h2>Logged in: </h2>
                        <p>{{ loggedIn }}</p>
                        <Btn @click="logout()">Logout</Btn>
                        <br>
                        <h2>Completed:</h2>
                        <p v-if="completed.length === 0">None!</p>
                        <p v-else v-for="level in completed">{{ level.name }}</p>
                    </div>
                    <div class="player-container uncompleted-container">
                        <div v-for="([err, rank, level], i) in uncompletedList">
                            <div class="grind-level-container" @mouseleave="hovered = null" :class="{'stats-focused': hovered === i}">
                                <!-- Current Level -->
                                <div class="level">
                                    <a :href="level.verification" v-if="level.verification" target="_blank" class="video">
                                        <img :src="getThumbnailFromId(getYoutubeIdFromUrl(level.verification))" style="border-radius: 0.5rem;" alt="">
                                    </a>
                                    <div class="meta">
                                        <div>
                                            <div class="rank-container">
                                                <p>#{{ level.rank }}</p>
                                            </div>
                                            <div class="nong-container">
                                                <p @mouseover="hovered = i">More info</p>
                                            </div>
                                        </div>
                                        <h2><a class="director" :href="'https://laylist.pages.dev/#/level/' + level.path" target="_blank">{{ level.name }}</a></h2>
                                        <div>
                                            <div style="display: inline-block; width: 50%;">
                                                <p class="director" style="cursor: pointer" @click="copyURL(level.id)">{{ level.id }}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <form class="actions grind-actions">
                                        <input type="number" placeholder="Enjoyment" min=1 max=10 v-model="typedValues[level.path].enjoyment">
                                        <input type="number" placeholder="Percent" value="100" :min="level.percentToQualify" max=100 v-model="typedValues[level.path].percent">
                                        <Btn style="background-color:rgb(27, 134, 29);" @click="complete(level.path, level.name)">Complete</Btn>
                                    </form>
                                    <div class="extra-stats-container" v-if="hovered === i">
                                        <ul class="extra-stats">
                                            <li>
                                                <div class="type-title-sm">Points</div>
                                                <p>{{ score(level.rank, level.difficulty, 100, level.percentToQualify, list) }}</p>
                                            </li>
                                            <li>
                                                <div class="type-title-sm">List%</div>
                                                <p>{{ level.percentToQualify }}%</p>
                                            </li>
                                            <li>
                                                <div class="type-title-sm">Enjoyment</div>
                                                <p>{{ averageEnjoyment(level.records) }}/10</p>
                                            </li>
                                        </ul>
                                        <br>
                                        <ul class="extra-stats">
                                            <li>
                                                <div class="type-title-sm">{{ level.songLink ? "NONG" : "Song" }}</div>
                                                <p class="director" v-if="level.songLink"><a target="_blank" :href="songDownload" >{{ level.song || 'Song missing, please alert a list mod!' }}</a></p>
                                                <p v-else>{{ level.song || 'Song missing, please alert a list mod!' }}</p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    `,

    data: () => ({
        store,
        list: [],
        allUsers: [],
        loggedIn: null,
        loggingIn: "",
        typedValues: {},
        completed: {},
        loading: true,
        hovered: null,
        listLoading: true,
    }),

    computed: {
        filteredUsers() {
            if (!this.loggingIn.trim()) return this.allUsers.slice(0, 25);

            const filtered = this.allUsers.filter((user) => user.toLowerCase().includes(this.loggingIn.toLowerCase()))

            return filtered;
        },
        uncompletedList() {
            if (!this.loggedIn) return;
            let list = this.list;
            list = list.filter(([err, rank, level]) => {
                if (!rank) return false;
                const selfVerified = level.verifier.toLowerCase().trim() === this.loggedIn.toLowerCase()
                const hasRecord = level.records.some(
                    (record) => 
                        record.user.toLowerCase().trim() === this.loggedIn.toLowerCase() &&
                        record.percent === 100
                )

                if (!selfVerified && !hasRecord) return true;
            })

            return list.reverse();
        }
    },

    methods: { 
        localize,
        fetchUsers,
        getThumbnailFromId,
        getYoutubeIdFromUrl,
        score,
        averageEnjoyment,
        scrollToSelected() {
            this.$nextTick(() => {
                const selectedElement = this.$refs.selected;
                if (selectedElement && selectedElement[0] && selectedElement[0].firstChild) {
                    selectedElement[selectedElement.length - 1].firstChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        },
        login(toLogin) {
            this.loggedIn = toLogin;
            localStorage.setItem("record_user", toLogin)
            return;
        },
        logout() {
            this.loggedIn = null;
            localStorage.removeItem("record_user");
            return;
        },
        complete(path, name) {
            this.completed.push({
                path: path,
                ...this.typedValues[path]
            })
        },
        initializeTypedValues(path) {
            console.log('test')
            this.typedValues[path] = {
                enjoyment: null,
                percent: null,
            };
        },
        uncomplete(path) {
            delete this.completed[path];
        }
    },

    async mounted() {
        const cookiesUser = localStorage.getItem("record_user")
        if (cookiesUser) {
            this.loggedIn = cookiesUser;
        }

        this.list = this.store.list
        for (const [err, rank, level] of this.list) {
            if (!level.path) continue;
            this.initializeTypedValues(level.path)
        }

        const allUsers = await fetchUsers()
        this.allUsers = allUsers

        // Hide loading spinner
        this.loading = false;
    },

    watch: {
        store: {
            handler(updated) {
                this.list = updated.list;
                this.staff = updated.staff;
                updated.errors.forEach(err => {
                    this.errors.push(`Failed to load level. (${err}.json)`);
                })
            },
            deep: true
        },
    },
};
