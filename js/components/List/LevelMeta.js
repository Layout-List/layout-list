import { score } from "../../config.js";
import { averageEnjoyment } from "../../content.js";
import { copyURL } from "../../util.js";

export default {
    props: {
        level: {
            type: Object,
            required: true  
        },
        list: {
            type: Array,
            required: true
        }
    },
    template: `
        <ul class="stats">
            <li>
                <div class="type-title-sm">Points</div>
                <p>{{ score(level.rank, level.difficulty, 100, level.percentToQualify, list) }}</p>
            </li>
            <li>
                <div class="type-title-sm">ID</div>
                <p class="director" style="cursor: pointer" @click="copyURL(level.id)">{{ level.id }}</p>
            </li>
            <li>
                <div class="type-title-sm">Password</div>
                <p>{{ level.password || 'Free to Copy' }}</p>
            </li>
            <li>
                <div class="type-title-sm">Enjoyment</div>
                <p>{{ averageEnjoyment(level.records) }}/10</p>
            </li>
        </ul>
        <ul class="stats">
            <li>
                <div class="type-title-sm">{{ level.songLink ? "NONG" : "Song" }}</div>
                <p class="director" v-if="level.songLink"><a target="_blank" :href="songDownload" >{{ level.song || 'Song missing, please alert a list mod!' }}</a></p>
                <p v-else>{{ level.song || 'Song missing, please alert a list mod!' }}</p>
            </li>
        </ul>
    `,
    methods: {
        copyURL,
        score,
        averageEnjoyment
    },
    computed: {
        songDownload() {
            if (!this.level.songLink.includes('drive.google.com')) return this.level.songLink;
            const id = this.level.songLink.match(/[-\w]{25,}/)?.[0];
            if (id === undefined) return this.level.songLink;
            return `https://drive.usercontent.google.com/uc?id=${id}&export=download`;
        },
    }
}
