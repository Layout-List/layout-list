export default {
    props: {
        author: {
            type: String,
            required: true,
        },
        creators: {
            type: Array,
            required: true,
        },
        verifier: {
            type: String,
            required: true,
        },
    },

    template: `
        <div class="level-authors">
            <template v-if="selfVerified">
                <div class="type-title-sm">Creator & Verifier</div>
                <p class="type-body">
                    <a :href="'https://laylist.pages.dev/#/leaderboard/user/' + author.toLowerCase().replaceAll(' ', '_')">{{ author }}</a>
                </p>
            </template>
            <template v-else-if="creators.length === 0">
                <div class="type-title-sm">Creator</div>
                <p class="type-body">
                    <a :href="'https://laylist.pages.dev/#/leaderboard/user/' + author.toLowerCase().replaceAll(' ', '_')">{{ author }}</:href=>
                </p>
                <div class="type-title-sm">Verifier</div>
                <p class="type-body">
                <a :href="'https://laylist.pages.dev/#/leaderboard/user/' + verifier.toLowerCase().replaceAll(' ', '_')">{{ verifier }}</a>
                </p>
            </template>
            <template v-else>
                <div class="type-title-sm">Creators</div>
                <p class="type-body">
                    <template v-for="(creator, index) in [author, ...creators]" :key="\`creator-\$\{creator\}\`">
                        <a :href="'https://laylist.pages.dev/#/leaderboard/user/' + creator.toLowerCase().replaceAll(' ', '_')">{{ creator }}</a>
                        <span v-if="index < creators.length">, </span>
                    </template>
                </p>
                <div class="type-title-sm">Verifier</div>
                <p class="type-body">
                    <a :href="'https://laylist.pages.dev/#/leaderboard/user/' + verifier.toLowerCase().replaceAll(' ', '_')">{{ verifier }}</a>
                </p>
            </template>
        </div>
    `,

    computed: {
        selfVerified() {
            return this.author === this.verifier && this.creators.length === 0;
        },
    },
};
