<template>
    <header>
        <div class="main_header">
            <div class="container">
                <nav class="navbar navbar-expand-lg navbar-light">
                    <router-link class="navbar-brand" :to="{ name: 'index' }">LOAN SHARK</router-link>
                </nav>
            </div>
        </div>
    </header>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
    name: "Header",
    computed: {
        ...mapGetters(['lang'])
    },
    methods: {
        ...mapActions(['changeLang'])
    }
}
</script>

<style scoped>

</style>
