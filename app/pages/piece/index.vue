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
        key: item.key,
        // largerWorkTitle: item.largerWorkTitle,
        majorMinor: item.majorMinor,
        meter: item.meter,
        movementDesignation: item.movementDesignation,
        mv: item.mv,
        nr: item.nr,
        op: item.op,
        slug: item.slug,
        opnr: `${item.op} / ${item.nr}`,
        mvAndDesignation: `${item.mv}. ${item.movementDesignation}`,
        title: item.body.title,
    }));
});

const columns = [
    { accessorKey: 'audio', header: '' },
    { accessorKey: 'opnr', header: t('opNr') },
    { accessorKey: 'mvAndDesignation', header: t('movement') },
    { accessorKey: 'title', header: t('title') },
    { accessorKey: 'key', header: t('key')  },
    { accessorKey: 'majorMinor', header: t('majorMinor') },
    { accessorKey: 'meter', header: t('meter') },
    { accessorKey: 'actions', header: '' },
];

const { localScoreUrlGenerator, vhvScoreUrlGenerator } = useScoreUrlGenerator();
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
                <template #title-cell="{ row }">
                    <NuxtLink :to="localePath({ name: 'piece-id', params: { id: row.original.slug } })">
                        {{ row.original.title ?? '' }}
                    </NuxtLink>
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
