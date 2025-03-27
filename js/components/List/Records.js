export default {
    props: {
        records: {
            type: Array,
            required: true
        },
        percentToQualify: {
            type: Number,
            required: false,
        }
    },
    template: `
        <h2>Records ({{ records.length }})</h2>
        <p><strong>{{ percentToQualify }}%</strong> or better to qualify</p>
        <table class="records">
            <tr v-for="record in records" class="record">
                <td class="percent">
                    <p>{{ record.percent }}%</p>
                </td>
                <td class="user">
                    <div class="user-container">
                        <a :href="record.link" target="_blank" class="type-label-lg director">{{ record.user }}</a>
                        <img class="flag" v-if="record.flag" :src="'https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/' + (record.flag.toLowerCase()) + '.svg'" alt="flag">
                    </div>
                </td>
                <td class="mobile">
                    <img v-if="record.mobile" :src="'/assets/phone-landscape' + (true ? '-dark' : '') + '.svg'" alt="Mobile">
                </td>
                <td class="enjoyment">
                    <p v-if="record.enjoyment === undefined">?/10</p>
                    <p v-else>{{ record.enjoyment }}/10</p>
                </td>
                <td class="hz">
                    <p>{{ record.hz }}FPS</p>
                </td>
            </tr>
        </table>
    `,

}
