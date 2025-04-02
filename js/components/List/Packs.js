import { packColor } from "../../config.js";
import { rgbaBind } from "../../util.js";

export default {
    props: {
        packs: {
            type: Array,
            required: true
        }
    },
    template: `
        <div class="pack-container">
            <a class="pack" v-for="pack in packs" :style="{ 'background': rgbaBind(packColor(pack.difficulty), 0.2), 'display': !pack.levels ? 'none' : 'inherit' }" :href="'https://laylist.pages.dev/#/packs/pack/' + pack.name.toLowerCase().replaceAll(' ', '_')">{{ pack.name }}</a>
        </div>
    `,
    methods: {
        rgbaBind,
        packColor
    }
}
