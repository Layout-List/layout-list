import { darkPackColor, lightPackColor } from "../../config.js";
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
            <a class="pack" v-for="pack in packs" :style="{ 'background': true ? rgbaBind(darkPackColor(pack.difficulty), 0.2) : rgbaBind(lightPackColor(pack.difficulty), 0.3), 'display': !pack.levels ? 'none' : 'inherit' }" :href="'https://laylist.pages.dev/#/packs/pack/' + pack.name.toLowerCase().replaceAll(' ', '_')">{{ pack.name }}</a>
        </div>
    `,
    methods: {
        rgbaBind,
        darkPackColor,
        lightPackColor
    }
}
