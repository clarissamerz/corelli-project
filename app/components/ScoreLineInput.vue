<script setup>
import { onKeyStroke } from '@vueuse/core';

const model = defineModel();

function clickHandler(event) {
    document.body.style.cursor = '';
    const noteElement = event.target.closest(`g[id^="note-L"], g[id^="rest-L"]`);
    console.log(noteElement, noteElement.id)
    if (!noteElement) return;
    const match = noteElement.id.match(/L(\d+)F/);
    const line = match ? match[1] : null;
    if (!line) return;
    model.value = parseInt(line, 10);
}

function addClickListener() {
    setTimeout(() => {
        document.body.style.cursor = 'crosshair';
        document.addEventListener('click', clickHandler, { once: true });
    }, 0);
}

onKeyStroke('Escape', () => {
    document.body.style.cursor = '';
    document.removeEventListener('click', clickHandler, { once: true });
});
</script>

<template>
    <div class="w-full flex gap-1">
        <div class="flex-1">
            <UInputNumber v-model="model" class="w-full" />
        </div>
        <div class="flex-none">
            <UButton icon="lucide:crosshair" @click="addClickListener" />
        </div>
    </div>
</template>
