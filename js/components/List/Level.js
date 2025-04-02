import { copyURL } from "../../util.js";
import LevelAuthors from "./LevelAuthors.js";
import Copy from "../Copy.js";
import Copied from "../Copied.js";
import LevelMeta from "./LevelMeta.js";
import Verification from "./Verification.js";
import Records from "./Records.js";
import Packs from "./Packs.js";

export default {
    props: {
        level: {
            type: Object,
            required: true,
        },
        // for score function UGH
        list: {
            type: Array,
            required: true,
        },
        fromPacksPage: {
            type: Boolean,
            required: false,
        }
    },
    components: { LevelAuthors, Copy, Copied, LevelMeta, Verification, Records, Packs },
    data: () => ({
        copied: false,
    }),
    template: `
        <div class="level">
            <div class="copy-container">
                <h1 class="copy-name">
                    {{ level.name }}
                </h1>
                <Copy v-if="!copied" @click="copyURL('https://laylist.pages.dev/#/level/' + level.path); copied = true"></Copy>
                <Copied v-if="copied" @click="copyURL('https://laylist.pages.dev/#/level/' + level.path); copied = true"></Copied>
            </div>
            <Packs :packs="level.packs" v-show="!fromPacksPage" v-if="level.packs.length > 1 || level.packs.length !== 0 && level.packs[0].levels" />
            <LevelAuthors :creators="level.creators" :verifier="level.verifier" :enjoyment="level.enjoyment"></LevelAuthors>
            <h3>Difficulty: {{["Beginner", "Easy", "Medium", "Hard", "Insane", "Mythical", "Extreme", "Supreme", "Ethereal", "Legendary", "Silent", "Impossible"][level.difficulty]}} layout</h3>
            <Verification :verification="level.verification" :showcase="level.showcase || null" />
            <LevelMeta :level="level" :list="list" />
            <Records :records="level.records" :percentToQualify="(level.difficulty>3) ? level.percentToQualify : 100" />
        </div>
    `,
    methods: {
        copyURL,
    },
}
