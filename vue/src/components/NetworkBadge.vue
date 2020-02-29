<template>
    <div v-if="chain">
        <span class="badge badge-info small">{{ chain.name }} [{{chain.chainId}}]</span>
    </div>
</template>

<script>
    export default {
        name: 'network-badge',
        props: ['chain']
    };
</script>

<style lang="scss" scoped></style>
