<template>
    <div class="spinner-square mx-auto">
        <div class="square-1 square"></div>
        <div class="square-2 square"></div>
        <div class="square-3 square"></div>
    </div>
</template>

<script>
    export default {
        name: 'SmallSpinner'
    };
</script>

<style scoped lang="scss">
    @import '../colours.scss';

    .spinner-square {
        display: flex;
        flex-direction: row;
        width: 20px;
        height: 30px;
    }

    .spinner-square > .square {
        width: 4px;
        height: 30px;
        margin: auto auto;
        border-radius: 4px;
    }

    .square-1 {
        animation: square-anim 1200ms cubic-bezier(0.445, 0.05, 0.55, 0.95) 0s infinite;
    }

    .square-2 {
        animation: square-anim 1200ms cubic-bezier(0.445, 0.05, 0.55, 0.95) 200ms infinite;
    }

    .square-3 {
        animation: square-anim 1200ms cubic-bezier(0.445, 0.05, 0.55, 0.95) 400ms infinite;
    }

    @keyframes square-anim {
        0% {
            height: 17px;
            background-color: $warning;
        }
        20% {
            height: 17px;
        }
        40% {
            height: 30px;
            background-color: $tertiary;
        }
        80% {
            height: 17px;
        }
        100% {
            height: 17px;
            background-color: $warning;
        }
    }
</style>
