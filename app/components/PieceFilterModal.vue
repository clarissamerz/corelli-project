<script setup>
const { data: countPieces } = await useAsyncDataCountPieces();
const { data: countFilteredPieces } = await useAsyncDataCountPiecesCollection();
</script>

<template>
    <UModal v-if="countFilteredPieces !== undefined">
        <UButton :label="`${$t('filterPieces')} ${countPieces === countFilteredPieces ? '' : `(${countFilteredPieces}/${countPieces})`}`" color="neutral" variant="subtle" size="xs" icon="i-lucide-funnel" />
        <template #content>
            <PieceFilter />
        </template>
    </UModal>
</template>
