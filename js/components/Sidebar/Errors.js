export default {
    props: {
        errors: {
            type: Array,
            required: true,
        }
    },
    template: `
        <template v-if="errors.length > 0">
            <div class="errors">
                <p class="error" v-for="error of errors" :key="error">{{ error }}</p>
            </div>
        </template>
    `,
}
