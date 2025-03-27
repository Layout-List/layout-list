import { fetchStaff } from "../../content.js"
import { store } from '../../main.js'
import Spinner from "../Spinner.js";

export default {
    data: () => ({
        staff: [],
        roleIconMap: {
            owner: 'crown',
            admin: 'user-gear',
            helper: 'user-shield',
            dev: 'code',
            trial: 'user-lock',
        }
    }),
    components: { Spinner },
    template: `
        <template v-if="staff">
            <h3>List Staff</h3>
            <ol class="staff">
                <li v-for="editor in staff">
                    <img :src="'/assets/' + roleIconMap[editor.role] + (true ? '-dark' : '') + '.svg'" :alt="editor.role">
                    <a class="type-label-lg link director" target="_blank" :href="editor.link">{{ editor.name }}</a>
                </li>
            </ol>
        </template>
        <Spinner v-else />
    `,
    async mounted() {
        this.staff = store.staff;
    }
}
