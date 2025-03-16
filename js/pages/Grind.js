import { store } from '../main.js'
import { localize, getThumbnailFromId, getYoutubeIdFromUrl, copyURL } from '../util.js';
import { fetchUsers, averageEnjoyment } from '../content.js'
import { compressData, decompressData } from '../main.js';
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
                        <h2 style="margin-bottom: 1rem;">Logged in: </h2>
                        <p>{{ loggedIn }}</p>
                        <Btn @click="logout()">Logout</Btn>
                        <br>
                        <Btn @click="importFromFile()" style="margin-right: 0.3rem;">Import</Btn>
                        <Btn @click="saveToFile()" v-if="completed.levels.length > 0">Export</Btn>
                        <br>
                        <Btn @click="submit()">Submit</Btn>
                        <br>
                        <Btn @click="reset()" style="background-color: #d50000;">Reset</Btn>
                        <h2>Completed:</h2>
                        <p v-if="completed.length === 0">None!</p>
                        <p v-else v-for="level in completed.levels">{{ level.name }} {{ level.percent }}% ({{ level.enjoyment }}/10)</p>
                    </div>
                    <div class="player-container uncompleted-container">
                        <div v-for="([err, rank, level], i) in uncompletedList">
                            <div class="grind-level-container" @mouseleave="hovered = null" :class="{'stats-focused': hovered === i}">
                                <!-- Current Level -->
                                <div class="level" :class="{completed: completed.levels?.some((completedLevel) => level.path === completedLevel.path)}">
                                    <a :href="level.verification" v-if="level.verification" target="_blank" class="video">
                                        <img :src="getThumbnailFromId(getYoutubeIdFromUrl(level.verification))" alt="Verification video">
                                    </a>
                                    <div class="meta">
                                        <div>
                                            <div class="rank-container">
                                                <p>#{{ level.rank }} - {{["Beginner", "Easy", "Medium", "Hard", "Insane", "Mythical", "Extreme", "Supreme", "Ethereal", "Legendary", "Silent", "Impossible"][level.difficulty]}} layout</p>
                                            </div>
                                            <div class="nong-container">
                                                <p @mouseover="hovered = i" v-if="!(completed.levels?.some((completedLevel) => level.path === completedLevel.path))">More info</p>
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
                                        <Btn v-if="!completed.levels?.some((completedLevel) => level.path === completedLevel.path)" style="background-color:rgb(27, 134, 29);" @click.native.prevent="complete(level.path, level.name)">Complete</Btn>
                                        <Btn v-else style="background-color:rgb(196, 27, 27);" @click.native.prevent="uncomplete(level.path)">Uncomplete</Btn>
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
        completed: {
            name: "",
            mobile: false,
            video: "",
            levels: []
        },
        serverRes: {},
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

            if (!this.typedValues[path].enjoyment || 
                !this.typedValues[path].percent)
                return;

            if (this.typedValues[path].enjoyment < 0 ||
                this.typedValues[path].enjoyment > 10)
                return;

            if (!Number.isInteger(this.typedValues[path].enjoyment) || 
                !Number.isInteger(this.typedValues[path].percent))
                return;

            this.completed.levels.push({
                path: path,
                name: name,
                ...this.typedValues[path]
            })
            return;
        },
        initializeTypedValues(path) {
            this.typedValues[path] = {
                enjoyment: null,
                percent: null,
            };
        },
        uncomplete(path) {
            const index = this.completed.levels.findIndex((level) => level.path === path);
            if (index !== -1) {
                this.completed.levels.splice(index, 1);
            }
        },
        saveToFile() {
            const compresed = compressData(JSON.stringify(this.completed))
            const blob = new Blob([compresed], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'LL_grind_save_' + Date.now() + '.txt';
            a.click();
            URL.revokeObjectURL(url);
        },
        promptGlobalData() {
            
        },
        async submit() {
            const compressed = compressData(JSON.stringify(this.completed))
            const req = await fetch("https://file.io/", {
                method: "POST",
                body: {
                    file: compressed,
                    maxDownloads: 99,
                    autoDelete: false,
                },
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            const res = await req.json();
            if (res.success) {
                await copyURL(res.link)
                alert("File uploaded successfully: " + res.link);
            } else {
                alert("File upload failed: " + res.message);
            }
            return;
        },
        reset() {
            if (!confirm("Are you sure you want to reset? This action cannot be undone.")) {
                return;
            }
            localStorage.removeItem("grind_completed");
            this.completed = {
                name: "",
                mobile: false,
                video: "",
                levels: []
            }
            return;
        },
        importFromFile() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.txt';
            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const fileName = file.name;
                if (!fileName.startsWith("LL_grind_save_")) {
                    alert(`This file has an invalid name! If you renamed it, please change it to "LL_grind_save_"`)
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const decompressed = decompressData(e.target.result);
                        const parsed = JSON.parse(decompressed);
                        const invalidFile = parsed.levels.every(level => 
                            !this.uncompletedList.some(uncompleted => uncompleted[2].path === level.path)
                        );
                        if (!invalidFile)
                            this.completed = parsed;
                        else
                            alert("This file has levels you already have records on! Maybe you uploaded the wrong file?")
                    } catch (error) {
                        alert("Failed to import file: " + error.message);
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        }
    },

    async mounted() {
        const cookiesUser = localStorage.getItem("record_user")
        if (cookiesUser) {
            this.loggedIn = cookiesUser;
        }

        const cookiesSave = localStorage.getItem("grind_completed")
        if (cookiesSave) {
            const decomp = decompressData(cookiesSave)
            const parsed = JSON.parse(decomp)
            this.completed = parsed;
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
        completed: {
            handler(updated) {
                const compresed = 
                localStorage.setItem("grind_completed", compressData(JSON.stringify(this.completed)))
            },
            deep: true
        }
    },
};
