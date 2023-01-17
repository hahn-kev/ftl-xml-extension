<script lang="ts">
    export let x = 0;
    export let y = 0;
</script>
<div class="cross"
     style="--x: {x}px; --y: {y}px">
    <div class="firing-line"></div>
    <div class="firing-line horizontal"></div>
</div>

<!--suppress CssUnresolvedCustomProperty -->
<style>
    .horizontal {
        position: absolute;
        rotate: 90deg;
    }

    .firing-line {
        width: 1px;
        height: 50px;
        background: red;
    }

    .cross {
        display: grid;
        justify-items: center;
        width: 50px;
        height: 50px;
        position: absolute;
        left: calc(var(--x) - 50px / 2);
        top: calc(var(--y) - 50px / 2);
    }
</style>
