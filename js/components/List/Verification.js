import { embed } from "../../util.js";

export default {
    props: {
        verification: {
            type: String,
            required: true,
        },
        showcase: {
            type: String,
            required: false,
        }
    },
    data: () => ({
        toggledShowcase: false,
    }),
    template: `
        <div v-if="showcase" class="tabs">
            <button class="tab type-label-lg" :class="{selected: !toggledShowcase}" @click="toggledShowcase = false">
                <span class="type-label-lg">Verification</span>
            </button>
            <button class="tab" :class="{selected: toggledShowcase}" @click="toggledShowcase = true">
                <span class="type-label-lg">Showcase</span>
            </button>
        </div>
        <iframe class="video" id="videoframe" :src="video" frameborder="0" allowfullscreen allow="fullscreen"></iframe>
    `,
    computed: {
        video() {
            if (!this.showcase) {
                return embed(this.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.showcase
                    : this.verification
            );
        },
    },
}
