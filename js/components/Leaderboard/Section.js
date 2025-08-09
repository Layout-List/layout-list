import { localize } from "../../util.js"

export default {
    props: {
        label: {
            type: String,
            required: true,
        },
        scores: {
            type: Array,
            required: true,
        }
    },
    template: `
        <template v-if="scores.length > 0">
            <h2>{{ label }} ({{ scores.length }})</h2>
            <table class="table">
                <tr v-for="score in scores">
                    <td class="rank">
                        <p v-if="score.rank === null">&mdash;</p>
                        <p v-else>#{{ score.rank }}</p>
                    </td>
                    <td class="level">
                        <a class="type-label-lg" target="_blank" :href="score.link">
                            <span class="director">{{ score.level }}</span>
                            <span v-if="score.percent">&nbsp;{{ score.percent }}%</span
                        </a>
                    </td>
                    <td class="score">
                        <p v-if="score.rating !== undefined">{{ score.rating }}/10</p>
                    </td>
                    <td class="score" v-if="score.score !== undefined">
                        <p v-if="score.score">+{{ localize(score.score) }}</p>
                        <p v-else>-</p>
                    </td>
                </tr>
            </table>
        </template
    `,
    methods: {
        localize,
    }
}
