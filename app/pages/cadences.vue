<script setup>
const { data: filteredPiecesData } = await useAsyncDataPiecesCollection();

const { data: cadencesData } = await useAsyncData('cadences', () => queryCollection('cadences').all());

const localePath = useLocalePath();

const cadences = cadencesData.value;

const cadencesForPieceFilter = computed(() => {
    return cadencesData.value.filter(c => filteredPiecesData.value ? filteredPiecesData.value.map(p => p.slug).includes(c.pieceId) : true);
});

const uniqueTags = [...new Set(cadences.flatMap(cadence => cadence.tags || []))].toSorted();

const uniqueDegs = [...new Set(cadences.map(cadence => cadence.deg))].toSorted();

const uniqueEndBassDegs = [...new Set(cadences.map(cadence => cadence.endBassDeg))].toSorted();

const { filters, filteredCadences, resetFilters } = useCadenceFilter(cadencesForPieceFilter);
</script>

<template>
    <UContainer>
        <Heading>{{ $t('cadences') }}</Heading>

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
                <UFormField :label="$t('tags')" class="w-40">
                    <USelectMenu v-model="filters.tags" :items="uniqueTags" multiple class="w-full" :search-input="false" />
                </UFormField>
                <UFormField :label="$t('cadenceDeg')" class="w-32">
                    <USelectMenu v-model="filters.deg" :items="uniqueDegs" multiple class="w-full" :search-input="false" />
                </UFormField>
                <UFormField :label="$t('endBassDeg')" class="w-32">
                    <USelectMenu v-model="filters.endBassDeg" :items="uniqueEndBassDegs" multiple class="w-full" :search-input="false" />
                </UFormField>
                <UFormField label="&nbsp;" class="w-32">
                    <UButton icon="i-lucide-funnel-x" color="warning" variant="subtle" @click="resetFilters">
                        {{ $t('reset') }}
                    </UButton>
                </UFormField>
            </div>
        </UCard>

        <div class="my-4">
            {{ filteredCadences.length }} / {{ cadences.length }}
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="cadence in filteredCadences" :key="`${cadence.pieceId}-${cadence.startLine}-${cadence.endLine}`">
                <UCard class="h-full">
                    <template #header>
                        <NuxtLink :to="localePath({ name: 'piece-id', params: { id: cadence.pieceId } })">
                            {{ `${cadence.pieceId} ${cadence.startLine}-${cadence.endLine}` }}
                        </NuxtLink>
                    </template>
                    <HighlightedScore view-mode="horizontal" :piece-id="cadence.pieceId" :filters="[
                        `myank -l ${cadence.startLine}-${cadence.endLine}`,
                        `shed -e 's/fb/fba/gX'`,
                        `shed -e 's/^([A-Ha-h\#\-]+):$/${cadence.key}:/gI'`,
                        'deg -k1 -t --box',
                    ]" :verovio-options="{
                        scale: 35,
                        pageMarginLeft: 42,
                    }" />
                    <dl class="grid grid-cols-[auto_1fr] gap-x-4 mt-4">
                        <dt class="font-medium">{{ $t('cadenceDeg') }}</dt>
                        <dd>{{ cadence.deg }}</dd>

                        <dt class="font-medium">{{ $t('key') }}</dt>
                        <dd>{{ cadence.key }}</dd>

                        <dt class="font-medium">{{ $t('endBassDeg') }}</dt>
                        <dd>
                            <div class="inline-flex items-center justify-center w-[1.2em] h-[1.2em] rounded-full border border-gray-400 text-center">
                                {{ cadence.endBassDeg }}
                            </div>
                        </dd>
                    </dl>
                    <div v-if="cadence.tags?.length" class="flex flex-wrap gap-2">
                        <UBadge v-for="tag in cadence.tags" :label="tag" />
                    </div>
                </UCard>
            </div>
        </div>

    </UContainer>
</template>
