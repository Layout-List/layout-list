/* export default {
    props: {
        author: {
            type: String,
            required: true,
        },
        hosts: {
            type: Array,
            required: true,
        },
        creators: {
            type: Array,
            required: true,
        },
        verifier: {
            type: String,
            required: true,
        },
    },

    template: `
        <div class="level-authors">
            <template v-if="selfVerified">
                <div class="type-title-sm">Creator & Verifier</div>
                <p class="type-body">
                    <span>{{ author }}</span>
                </p>
            </template>
            <template v-else-if="creators.length === 0">
                <div class="type-title-sm">Creator</div>
                <p class="type-body">
                    <span>{{ author }}</span>
                </p>
                <div class="type-title-sm">Verifier</div>
                <p class="type-body">
                    <span>{{ verifier }}</span>
                </p>
            </template>
            <template v-else-if=”hosts.length === 1”>
	            <div class=”type-title-sm”>Host</div>
	            <p class=”type-body”>
	                <span>{{ hosts }} </span>
                <div class="type-title-sm">Creators</div>
                <p class="type-body">
                    <template v-for="(creator, index) in [author, ...creators]" :key="\`creator-\$\{creator\}\`">
                        <span>{{ creator }}</span>
                        <span v-if="index < creators.length">, </span>
                    </template>
                </p>
                <div class="type-title-sm">Verifier</div>
                <p class="type-body">
                    <span>{{ verifier }}</span>
                </p>
            </template>
	        <template v-else-if=”hosts.length > 1”>
	            <div class=”type-title-sm”>Hosts</div>
	            <p class="type-body">
                    <template v-for="(host, index) in [hosts]" :key="\`host-\$\{host\}\`">
                        <span>{{ host }}</span>
                        <span v-if="index < hosts.length">, </span>
                    </template>
                <div class="type-title-sm">Creators</div>
                <p class="type-body">
                    <template v-for="(creator, index) in [author, ...creators]" :key="\`creator-\$\{creator\}\`">
                        <span>{{ creator }}</span>
                        <span v-if="index < creators.length">, </span>
                    </template>
                </p>
                <div class="type-title-sm">Verifier</div>
                <p class="type-body">
                    <span>{{ verifier }}</span>
                </p>
            </template>
	        <template v-else>
                <div class="type-title-sm">Creators</div>
                <p class="type-body">
                    <template v-for="(creator, index) in [author, ...creators]" :key="\`creator-\$\{creator\}\`">
                        <span>{{ creator }}</span>
                        <span v-if="index < creators.length">, </span>
                    </template>
                </p>
                <div class="type-title-sm">Verifier</div>
                <p class="type-body">
                    <span>{{ verifier }}</span>
                </p>
            </template>
        </div>
    `,

    computed: {
        selfVerified() {
            return this.author === this.verifier && this.creators.length === 0;
        },
    },
}; */

export default {
    props: {
        author: {
            type: String,
            required: true,
        },
        hosts: {
            type: Array,
            required: true,
        },
        creators: {
            type: Array,
            required: true,
        },
        verifier: {
            type: String,
            required: true,
        },
    },

    template: `
        <div class="level-authors">
            <template v-if="selfVerified">
                <div class="type-title-sm">Creator & Verifier</div>
                <p class="type-body">
                    <span>{{ author }}</span>
                </p>
            </template>
            <template v-else-if="creators.length === 0">
                <div class="type-title-sm">Creator</div>
                <p class="type-body">
                    <span>{{ author }}</span>
                </p>
                <div class="type-title-sm">Verifier</div>
                <p class="type-body">
                    <span>{{ verifier }}</span>
                </p>
            </template>
            <template v-else>
                <div class="type-title-sm">Creators</div>
                <p class="type-body">
                    <template v-for="(creator, index) in [author, ...creators]" :key="\`creator-\$\{creator\}\`">
                        <span>{{ creator }}</span>
                        <span v-if="index < creators.length">, </span>
                    </template>
                </p>
                <div class="type-title-sm">Verifier</div>
                <p class="type-body">
                    <span>{{ verifier }}</span>
                </p>
            </template>
        </div>
    `,

    computed: {
        selfVerified() {
            return this.author === this.verifier && this.creators.length === 0;
        },
    },
};
