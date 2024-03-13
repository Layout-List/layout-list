export default {
    props: {
        records: {
            type: Array,
            required: true,
        },
    },

    template: `
        <div class="level-enjoyment">
            <template v-if="records.length === 0">
                <div class="type-title-sm">Average Enjoyment</div>
                <p class="type-body">
                    <span>{{ "N/A" }}</span>
                </p>
            </template>
            <template v-else>
                <div class="type-title-sm">Average Enjoyment</div>
                <p class="type-body">
                    <span>{{ avgEnjoyment + " /10" }}</span>
                </p>
            </template>
        </div>
    `,

    computed: {
        avgEnjoyment() {
            return 5;
        },
    },
};
