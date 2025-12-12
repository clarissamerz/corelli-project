<script setup>
const { data: allPieces } = await useAsyncData('all-pieces', () => queryCollection('pieces').all());
const { data: filteredPieces } = await useAsyncDataPiecesCollection();
const { data: countPieces } = await useAsyncDataCountPieces();

const { t } = useI18n();
const localePath = useLocalePath();

const pieces = computed(() => {
    // TODO workaround to solve problems where the linker in nuxt generate does
    // not have access to all pieces because useAsyncDataPiecesCollection is
    // server=false because of nuxt generate issues
    const base = filteredPieces.value ?? allPieces.value ?? [];
    return base.map(item => ({
        // composer: item.composer,
        key: item.key ? t(`keyNames.${item.key}`) : null,
        // largerWorkTitle: item.largerWorkTitle,
        majorMinor: item.majorMinor,
        meter: item.meter,
        movementDesignation: item.movementDesignation,
        mv: item.mv,
        nr: item.nr,
        op: item.op,
        slug: item.slug,
        opnr: `${item.op} / ${item.nr}`,
        title: item.body.title,
    }));
});

const columns = [
    { accessorKey: 'audio', header: '' },
    { accessorKey: 'id', header: t('id') },
    { accessorKey: 'opnr', header: t('opNr') },
    { accessorKey: 'movementDesignation', header: t('movement') },
    { accessorKey: 'title', header: t('title') },
    { accessorKey: 'key', header: t('key')  },
    { accessorKey: 'majorMinor', header: t('majorMinor') },
    { accessorKey: 'meter', header: t('meter') },
    { accessorKey: 'actions', header: '' },
];

const { localScoreUrlGenerator, vhvScoreUrlGenerator } = useScoreUrlGenerator();

const pieceFilter = usePieceFilterOptions();

function toggleMeter(meter) {
    const index = pieceFilter.$state.meter.indexOf(meter);
    if (index > -1) {
        pieceFilter.$state.meter.splice(index, 1);
    } else {
        pieceFilter.$state.meter.push(meter);
    }
}

function toggleTempo(tempo) {
    const index = pieceFilter.$state.tempo.indexOf(tempo);
    if (index > -1) {
        pieceFilter.$state.tempo.splice(index, 1);
    } else {
        pieceFilter.$state.tempo.push(tempo);
    }
}
</script>

<template>
    <UContainer>
        <div class="flex flex-col gap-8">
            <Heading>{{ $t('pieces') }}</Heading>
            <PieceFilter />
            <div>
                {{ pieces.length }} / {{ countPieces }}
            </div>
            <UTable :data="pieces" :columns="columns" :get-row-id="(item) => item.slug" class="mt-8">
                <template #audio-cell="{ row }">
                    <MidiPlayer :url="localScoreUrlGenerator(row.original.slug)" class="text-2xl"/>
                </template>
                <template #id-cell="{ row }">
                    <NuxtLink :to="localePath({ name: 'piece-id', params: { id: row.original.slug } })">
                        <UBadge color="neutral" variant="outline" class="font-mono w-[11ch] inline-flex items-center justify-center text-center" :label="row.original.slug" />
                    </NuxtLink>
                </template>
                <template #movementDesignation-cell="{ row }">
                    <div class="flex gap-2">
                        <div class="shrink-0">{{ row.original.mv }}.</div>
                        <div class="flex flex-wrap gap-2">
                            <UBadge
                                v-for="(omd, index) in row.original.movementDesignation"
                                :key="index"
                                :label="omd"
                                :variant="pieceFilter.$state.tempo.includes(omd) ? 'solid' : 'soft'"
                                class="cursor-pointer"
                                @click="toggleTempo(omd)"
                            />
                        </div>
                    </div>
                </template>
                <template #title-cell="{ row }">
                    <NuxtLink :to="localePath({ name: 'piece-id', params: { id: row.original.slug } })">
                        {{ row.original.title ?? '' }}
                    </NuxtLink>
                </template>
                <template #meter-cell="{ row }">
                    <div class="flex flex-wrap gap-2">
                        <UBadge
                            v-for="(meter, index) in row.original.meter"
                            :key="index"
                            :label="meter"
                            :variant="pieceFilter.$state.meter.includes(meter) ? 'solid' : 'soft'"
                            class="cursor-pointer"
                            @click="toggleMeter(meter)"
                        />
                    </div>
                </template>
                <template #actions-cell="{ row }">
                    <div class="flex gap-1 justify-end">
                        <UButton size="sm" color="primary" variant="solid" :label="t('vhv')" :to="vhvScoreUrlGenerator(row.original.slug)" target="_blank" />
                        <UButton size="sm" color="primary" variant="solid" :label="t('view')" :to="localePath({ name: 'piece-id', params: { id: row.original.slug } })" />
                    </div>
                </template>
            </UTable>
        </div>
    </UContainer>
</template>
