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
        enjoyment: {
            type: Number,
            required: false,
        },
    },

    template: `
        <div class="level-authors">
            <template v-if="selfVerified">
                <div class="type-title-sm">Creator & Verifier</div>
                <p class="type-body">
                    <a class="link" :href="'https://laylist.pages.dev/#/leaderboard/user/' + author.toLowerCase().replaceAll(' ', '_')">{{ author }}<span v-if="enjoyment"> ({{ enjoyment }}/10)</span></a>
                </p>
            </template>
            <template v-else-if="creators.length === 0 || creators.length === 1 && creators[0] === author">
                <div class="type-title-sm">Creator</div>
                <p class="type-body">
                    <a class="link" :href="'https://laylist.pages.dev/#/leaderboard/user/' + author.toLowerCase().replaceAll(' ', '_')">{{ author }}</a>
                </p>
                <div class="type-title-sm">Verifier</div>
                <p class="type-body">
                    <a class="link" :href="'https://laylist.pages.dev/#/leaderboard/user/' + verifier.toLowerCase().replaceAll(' ', '_')">{{ verifier }}<span v-if="enjoyment"> ({{ enjoyment }}/10)</span></a>
                </p>
            </template>
            <template v-else>
                <div class="type-title-sm">Creators</div>
                <p class="type-body">
                    <template v-for="(creator, index) in [author, ...creators]" :key="\`creator-\$\{creator\}\`">
                        <a class="link" :href="'https://laylist.pages.dev/#/leaderboard/user/' + creator.toLowerCase().replaceAll(' ', '_')">{{ creator }}</a>
                        <span v-if="index < creators.length">, </span>
                    </template>
                </p>
                <div class="type-title-sm">Verifier</div>
                <p class="type-body">
                    <a class="link" :href="'https://laylist.pages.dev/#/leaderboard/user/' + verifier.toLowerCase().replaceAll(' ', '_')">{{ verifier }}<span v-if="enjoyment"> ({{ enjoyment }}/10)</span></a>
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
