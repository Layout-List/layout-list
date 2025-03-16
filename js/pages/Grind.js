import { store } from '../main.js'
import { localize } from '../util.js';
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
                <label for="username">Username:</label><br>
                <input type="text" id="username" name="username" class="search" v-model="loggingIn" autocomplete="off"><br><br>
                <div class="user-suggest">
                    <p v-for="(user, i) in filteredUsers">
                        <span 
                            @click.native.prevent="login(user)"
                            >
                            {{ user }}
                        </span>
                    </p>
                </div>
            </div>
            <div v-else class="grind-page-container-full">
                <div class="left-side">
                    <p>Logged in: {{ loggedIn }}</p>
                </div>
                <div class="main-grind-list">
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
    }),

    computed: {
        filteredUsers() {
            if (!this.loggingIn.trim()) return this.allUsers.slice(0, 25);

            const filtered = this.allUsers.filter((user) => user.toLowerCase().includes(this.loggingIn.toLowerCase()))

            return filtered;
        }
    },

    methods: { 
        localize,
        fetchUsers,
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

        console.log(this.allUsers)

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
        loggedIn: {
            handler(updated)  {
                localStorage.setItem("record_user", updated)
            }
        }
    },
};
