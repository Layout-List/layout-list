export default {
    props: {
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
                    <a class="director" class="link" :href="'https://laylist.pages.dev/#/leaderboard/user/' + creators[0].toLowerCase().replaceAll(' ', '_')">{{ creators[0] }}<span v-if="enjoyment"> ({{ enjoyment }}/10)</span></a>
                </p>
            </template>
            <template v-else-if="creators.length === 1">
                <div class="type-title-sm">Creator</div>
                <p class="type-body">
                    <a class="director" class="link" :href="'https://laylist.pages.dev/#/leaderboard/user/' + creators[0].toLowerCase().replaceAll(' ', '_')">{{ creators[0] }}</a>
                </p>
                <div class="type-title-sm">Verifier</div>
                <p class="type-body">
                    <a class="director" class="link" :href="'https://laylist.pages.dev/#/leaderboard/user/' + verifier.toLowerCase().replaceAll(' ', '_')">{{ verifier }}<span v-if="enjoyment"> ({{ enjoyment }}/10)</span></a>
                </p>
            </template>
            <template v-else>
                <div class="type-title-sm">Creators</div>
                <p class="type-body">
                    <template v-for="(creator, index) in creators">
                        <a class="director" class="link" :href="'https://laylist.pages.dev/#/leaderboard/user/' + creator.toLowerCase().replaceAll(' ', '_')">{{ creator }}</a>
                        <span v-if="index < creators.length - 1">, </span>
                    </template>
                </p>
                <div class="type-title-sm">Verifier</div>
                <p class="type-body">
                    <a class="director" class="link" :href="'https://laylist.pages.dev/#/leaderboard/user/' + verifier.toLowerCase().replaceAll(' ', '_')">{{ verifier }}<span v-if="enjoyment"> ({{ enjoyment }}/10)</span></a>
                </p>
            </template>
        </div>
    `,

    computed: {
        selfVerified() {
            return this.creators[0] === this.verifier && this.creators.length === 1;
        },
    },
};
