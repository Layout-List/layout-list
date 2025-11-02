import { store } from '../main.js'
import { localize, getThumbnailFromId, getYoutubeIdFromUrl, copyURL, round } from '../util.js';
import { fetchUsers, averageEnjoyment } from '../content.js'
import { compressData, decompressData } from '../main.js';
import Spinner from '../components/Spinner.js';
import Copied from '../components/Copied.js'
import Scroll from '../components/Scroll.js'
import Btn from '../components/Btn.js';
import { score } from '../config.js';

export default {
    components: { Spinner, Copied, Scroll, Btn },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="grind-page">
            <div v-if="store.errors.length > 0" class="login-container">
                <h1>Error</h1>
                <div class="user-suggest">
                    <h3>The list is currently broken, please contact a moderator to fix!</h3>
                </div>
            </div>
            <div v-else-if="!loggedIn" class="login-container">
                <h1>Enter username</h1>
                <input type="text" id="username" name="username" placeholder="Username" class="search" v-model="loggingIn" autocomplete="off"><br><br>
                <div class="user-suggest">
                    <Btn v-if="loggingIn !== '' && filteredUsers.length === 0" @click.native.prevent="login(loggingIn)">Start</Btn>
                    <h3 v-else-if="loggingIn !== ''" v-for="(user, i) in filteredUsers" class="director">
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

                        <Btn @click="submit()" v-if="completed.levels.length > 0">{{ submitLoading ? "Loading..." : "Submit" }}</Btn>
                        <br v-if="completed.levels.length > 0">

                        <Btn @click="reset()" style="background-color: #d50000;color: white;">Reset</Btn>

                        <br>
                        <p><a v-if="lastSubmission" class="director" :href="lastSubmission" style="text-decoration: underline;" target="_blank">Previous submission</a></p>
                        <br>
                        <h2 v-if="completed.levels.length > 0">Completed:</h2>
                        <div class="completed-levels-container">
                            <p v-for="level in completed.levels" >{{ level.name }} {{ level.percent }}%{{ level.enjoyment ? " (" + level.enjoyment + "/10)" : "" }} +{{ level.pts }}</p>
                        </div>
                        <br v-if="completed.levels.length > 0">
                        <h3 v-if="completed.levels.length > 0">Total: +{{ totalPoints }} pts</h3>
                        <br>
                        <h3 
                            class="director" 
                            @click="toggleInfoBox()"
                        >
                        What is this?
                        </h3>
                        <div v-if="clickedOnTheInfoThing" class="left-info-box">
                            <p>
                                This page keeps track of what you haven't completed on the list yet, and can make submitting many levels at once way easier.
                                When you beat a level, you can mark it as completed and set your enjoyment (and percentage, if it isn't 100%).
                            </p>
                            <p>
                                Your save data saves to your browser, but you can manually export it to a file as a backup above.
                            </p>
                            <p>
                                Once you submit, please reset your data with the "Reset" button above.
                            </p>

                        </div>
                        
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
                                                <p class="director" @click="hovered = null; hovered = i" v-if="!(completed.levels?.some((completedLevel) => level.path === completedLevel.path))">More info</p>
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
                                        <!-- this is a string so the site can handle people typing the other half of the fraction
                                             (since the text box itself won't stop a user from doing that) -->
                                        <input type="text" placeholder="Enjoyment" v-model="typedValues[level.path].enjoyment">
                                        <input type="number" placeholder="Percent" value="100" :min="level.percentToQualify" max=100 v-model="typedValues[level.path].percent">
                                        <Btn v-if="!completed.levels?.some((completedLevel) => level.path === completedLevel.path)" style="background-color:rgb(27, 134, 29);" @click.native.prevent="complete(level)">Complete</Btn>
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
                                    </div>
                                    <br v-if="hovered === i">
                                    <div class="extra-stats-container" v-if="hovered === i">
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
        formUrl: "https://docs.google.com/forms/d/e/1FAIpQLScIIsYaYQDl0di2AtCj1fiHwkScEAyxStFAPP_wtPoTDQxhig/viewform?usp=pp_url",
        loggingIn: "",
        typedValues: {},
        completed: {
            name: "",
            levels: []
        },
        loading: true,
        hovered: null,
        hideUncompleted: false,
        clickedOnTheInfoThing: false,
        lastScrollPosition: 0,
        lastSubmissionLink: null,
        submitLoading: false,
        shouldRefreshLastSubmitted: false,
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
        },
        totalPoints() {
            return round(this.completed.levels.reduce((total, level) => total + (level.pts || 0), 0));
        },
        lastSubmission() {
            this.shouldRefreshLastSubmitted;
            const lastSubmissionLink = localStorage.getItem("last_submission_link")
            console.log(lastSubmissionLink)
            return lastSubmissionLink
        }
    },

    methods: { 
        localize,
        fetchUsers,
        getThumbnailFromId,
        getYoutubeIdFromUrl,
        score,
        averageEnjoyment,
        copyURL,
        scrollToSelected() {
            this.$nextTick(() => {
                const selectedElement = this.$refs.selected;
                if (selectedElement && selectedElement[0] && selectedElement[0].firstChild) {
                    selectedElement[selectedElement.length - 1].firstChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        },
        login(toLogin) {
            if (this.completed.length > 0) {
                const invalidFile = this.completed.levels.some(level =>
                    !this.uncompletedList.some(uncompleted => uncompleted[2].path === level.path)
                );
                if (invalidFile) {
                    if (!confirm("WARNING: You already have records on some levels in your save file. Continuing will remove these levels from your save file. Are you sure you want to continue?")) {
                        return;
                    } else {
                        this.completed.levels = this.completed.levels.filter(level =>
                            this.uncompletedList.some(uncompleted => uncompleted[2].path === level.path)
                        );
                    }
                }
            }
            this.loggedIn = toLogin;
            localStorage.setItem("record_user", toLogin)
            this.loggingIn = "";
            return;
        },
        logout() {
            this.loggedIn = null;
            localStorage.removeItem("record_user");
            return;
        },
        complete(level) {
            this.hovered = null;
            const path = level.path

            if (!this.typedValues[path].percent)
                return;
            
            if (this.typedValues[path].percent < (level.percentToQualify || 100) ||
                this.typedValues[path].percent > 100)
                return;

            if (!Number.isInteger(this.typedValues[path].percent))
                return;
            
            if (this.typedValues[path].enjoyment) {
                
                const mainString = this.typedValues[path].enjoyment.trim()
                const enjoymentMatch = mainString.match(/^(\d+)(?:\s*\/\s*\d+)?$/);
                if (enjoymentMatch) {
                    this.typedValues[path].enjoyment = parseInt(enjoymentMatch[1], 10);
                } else {
                    return;
                }

                if (!Number.isInteger(this.typedValues[path].enjoyment))
                    return;
                    
                if (this.typedValues[path].enjoyment < 0) {
                        this.typedValues[path].enjoyment = 0;
                    }
                if (this.typedValues[path].enjoyment > 10) {
                        this.typedValues[path].enjoyment = 10
                    }
            }


            this.completed.levels.push({
                path: path,
                name: level.name,
                pts: score(level.rank, level.difficulty, this.typedValues[path].percent, level.percentToQualify, this.list),
                ...this.typedValues[path]
            })

            this.typedValues[path].enjoyment = null;
            this.typedValues[path].percent = null;
            return;
        },
        uncomplete(path) {
            const index = this.completed.levels.findIndex((level) => level.path === path);
            if (index !== -1) {
                this.completed.levels.splice(index, 1);
            }
            this.typedValues[path].percent = 100;
            return;
        },
        saveToFile() {
            const compresed = compressData(JSON.stringify(this.completed))
            const blob = new Blob([compresed], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.loggedIn + "_" + Date.now() + '.llsave';
            a.click();
            URL.revokeObjectURL(url);
        },
        async submit() {
            this.submitLoading = true;
            let completedOnSubmit = JSON.parse(JSON.stringify(this.completed));
            await completedOnSubmit.levels.map((level) => {
                delete level.pts
            })
            completedOnSubmit.levels = await completedOnSubmit.levels.filter((level) => {
                return !this.list.find(([err, rank, current]) => 
                    current.path === level.path && 
                    (current.verifier.toLowerCase().trim() === this.loggedIn.toLowerCase() ||
                    current.records.some(record => 
                        record.user.toLowerCase().trim() === this.loggedIn.toLowerCase() &&
                        record.percent === 100
                    ))
                )
            })
            completedOnSubmit.name = this.loggedIn
            const compressed = compressData(JSON.stringify(completedOnSubmit))
            const link = this.formUrl + `&entry.873982318=Yes&entry.82893587=${encodeURIComponent(compressed)}`
            localStorage.setItem("last_submission_link", link)
            this.shouldRefreshLastSubmitted = true;
            window.open(link, '_blank');
            this.submitLoading = false;
            return;
        },
        reset() {
            if (!confirm("Are you sure you want to reset? This action cannot be undone.")) {
                return;
            }
            localStorage.removeItem("grind_completed");
            this.completed = {
                name: this.loggedIn,
                levels: []
            }
            this,initTypedValues()
            return;
        },
        importFromFile() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.llsave';
            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const fileName = file.name;
                if (!fileName.endsWith('.llsave')) {
                    alert("This file is not a .llsave file! Maybe you uploaded the wrong one?");
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const decompressed = decompressData(e.target.result);
                        const parsed = JSON.parse(decompressed);
                        const invalidFile = parsed.levels.some(level => 
                            !this.uncompletedList.some(uncompleted => uncompleted[2].path === level.path)
                        );
                        if (!invalidFile)
                            this.completed = parsed;
                        else
                            alert("This file has levels you already have records on! Maybe you uploaded the wrong file?")
                    } catch (error) {
                        console.error(`Failed to import: ${error.message}`)
                        alert("Failed to import file, maybe you uploaded the wrong one?");
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        },
        getSongDownload(link) {
            if (!link.includes('drive.google.com')) return link;
            const id = link.match(/[-\w]{25,}/)?.[0];
            if (id === undefined) return link;
            return `https://drive.usercontent.google.com/uc?id=${id}&export=download`;
        },
        initTypedValues() {
            for (const [err, rank, level] of this.list) {
                if (!level.path) continue;
                this.typedValues[level.path] = {
                    enjoyment: null,
                    percent: 100,
                };
            }
        },
        toggleInfoBox() {
            const container = document.querySelector('.grind-meta');
            this.lastScrollPosition = container.scrollTop;
            this.clickedOnTheInfoThing = !this.clickedOnTheInfoThing;
            this.$nextTick(() => {
                container.scrollTop = this.lastScrollPosition;
            });
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

        const prev_submission = localStorage.getItem("last_submission_link")
        if (prev_submission && !prev_submission.startsWith("http")) {
            const newString = this.formUrl + `&entry.873982318=Yes&entry.82893587=${encodeURIComponent(prev_submission)}`
            localStorage.setItem("last_submission_link", newString)
        }

        this.list = this.store.list
        this.initTypedValues()

        const allUsers = await fetchUsers()
        this.allUsers = allUsers

        // Hide loading spinner
        this.loading = false;
    },

    watch: {
        store: {
            handler(updated) {
                this.list = updated.list;
                updated.errors.forEach(err => {
                    this.errors.push(`Failed to load level. (${err}.json)`);
                })
                return;
            },
            deep: true
        },
        completed: {
            handler(updated) {
                localStorage.setItem("grind_completed", compressData(JSON.stringify(this.completed)))
                return;
            },
            deep: true
        }
    },
};
