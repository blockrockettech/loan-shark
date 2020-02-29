<template>
    <div id="app">
        <Header/>
        <main>
            <router-view name="banner"/><router-view/>
        </main>
        <Footer/>
    </div>
</template>

<script>
import { ethers } from 'ethers'
import Header from './components/Header'
import Footer from './components/Footer'

export default {
    name: 'App',
    components: {Footer, Header},
    async created() {
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(web3.currentProvider);
        const signer = provider.getSigner();

        const chain = await provider.getNetwork();

        await this.$store.dispatch('bootstrapWeb3', {provider, signer, chain});
    }
}
</script>

<style lang="scss">
    @import '../node_modules/bootstrap/scss/bootstrap';
</style>
