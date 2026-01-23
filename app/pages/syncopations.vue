<script setup>
const { data: filteredPiecesData } = await useAsyncDataPiecesCollection();

const { data: sequencesData } = await useAsyncData('sequences', () => queryCollection('sequences').first());

const localePath = useLocalePath();

const sequences = sequencesData.value.sequences;

const sequencesForPieceFilter = computed(() => {
    return sequencesData.value.sequences.filter(c => filteredPiecesData.value ? filteredPiecesData.value.map(p => p.slug).includes(c.pieceId) : true);
});

const uniqueTags = [...new Set(sequences.flatMap(sequence => sequence.tags || []))].toSorted();

const { filters, filteredSequences, resetFilters } = useSequenceFilter(sequencesForPieceFilter);

const uniquePieces = computed(() => {
    return [...new Set(filteredSequences.value.flatMap(s => s.pieceId))].toSorted();
});
</script>

<template>
    <UContainer>
        <Heading>{{ $t('sequences') }}</Heading>

        <div class="my-4">
            <PieceFilterModal />
        </div>

        <UCard>
            <template #header>
                <div class="font-medium leading-5">
                    {{ $t('filter') }}
                </div>
            </template>
            <div class="flex flex-wrap gap-2">
                <UFormField :label="$t('tags')" class="w-64">
                    <USelectMenu v-model="filters.tags" :items="uniqueTags" multiple class="w-full" />
                </UFormField>
                <UFormField label="&nbsp;" class="w-32">
                    <UButton icon="i-lucide-funnel-x" color="warning" variant="subtle" @click="resetFilters">
                        {{ $t('reset') }}
                    </UButton>
                </UFormField>
            </div>
        </UCard>

        <div class="my-4">
            {{ $t('sequencesFilterCountTitle', {
                count: filteredSequences.length,
                total: sequences.length,
                piecesCount: uniquePieces.length,
            }) }}
        </div>

        <div class="grid grid-cols-1 gap-4">
            <div v-for="pieceId in uniquePieces" :key="`${pieceId}-${filteredSequences.filter(s => s.pieceId === pieceId).map(s => `${s.startBeat}${s.endBeat}`).join('-')}`">
                <UCard >
                    <template #header>
                        <NuxtLink :to="localePath({ name: 'piece-id', params: { id: pieceId } })">
                            <div class="inline font-bold">{{ pieceId }}</div>
                            ({{ $t('countSequencesInPiece', filteredSequences.filter(s => s.pieceId === pieceId).length) }})
                        </NuxtLink>
                    </template>
                    <HighlightedScore
                        :horizontal="true"
                        :piece-id="pieceId"
                        :verovio-options="{
                            scale: 35,
                            pageMarginLeft: 42,
                            pageMarginTop: 120,
                        }"
                        :sections="[
                            {
                                color: 'rgb(59 130 246 / 0.4)',
                                items: filteredSequences.filter(s => s.pieceId === pieceId).map(s => ({
                                    startLine: s.startLine,
                                    endLine: s.endLine,
                                    label: s.tags?.join(', '),
                                })),
                            }
                        ]"
                        :scroll-to-first-section="true"
                    />
                </UCard>
            </div>
        </div>

    </UContainer>
</template>
