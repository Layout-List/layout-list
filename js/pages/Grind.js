import { store } from '../main.js'
import { localize, getThumbnailFromId, getYoutubeIdFromUrl } from '../util.js';
import { fetchUsers } from '../content.js'
import Spinner from '../components/Spinner.js';
import Copy from '../components/Copy.js'
import Copied from '../components/Copied.js'
import Scroll from '../components/Scroll.js'
import Btn from '../components/Btn.js';

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
                        <p>Logged in: {{ loggedIn }}</p>
                        <Btn @click="logout()">Logout</Btn>
                    </div>
                    <div class="player-container uncompleted-container">
                        <div v-for="[err, rank, level] in uncompletedList">
                            <div class="grind-level-container">
                                <!-- Current Level -->
                                <div class="level">
                                    <a :href="level.verification" v-if="level.verification" target="_blank" class="video">
                                        <img :src="getThumbnailFromId(getYoutubeIdFromUrl(level.verification))" alt="">
                                    </a>
                                    <div class="meta">
                                        <div>
                                            <div class="rank-container">
                                                <p>#{{ level.rank }}</p>
                                            </div>
                                            <div class="nong-container">
                                                <p v-if="level.songLink">Nong: <a class="director" :href="level.songLink" target="_blank">{{ level.song }}</a></p>
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
                                        <input type="number" placeholder="Enjoyment" min=1 max=10>
                                        <input type="number" placeholder="Percent" value="100" max=100>
                                        <Btn style="background-color:rgb(27, 134, 29);">Complete</Btn>
                                    </form>
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
        completed: {},
        loading: true,
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
        }
    },

    async mounted() {
        const cookiesUser = localStorage.getItem("record_user")
        if (cookiesUser) {
            this.loggedIn = cookiesUser;
        }

        this.list = this.store.list

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
