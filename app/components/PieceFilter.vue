<script setup>
import filterOptions from '../utils/piece-filter-options.json';

const emit = defineEmits(['updateFilter']);

const { t } = useI18n();

const pieceFilter = usePieceFilterOptions();

watch(pieceFilter, () => {
    emit('updateFilter');
});

function resetFilter() {
    pieceFilter.reset();
}

const { title, key, meter, tempo, op, nr } = storeToRefs(pieceFilter);

const {
    meterOptions,
    keyOptions,
    titleOptions,
    tempoOptions,
    opOptions,
    nrOptions,
} = filterOptions;

const localizedKeyOptions = keyOptions.map(key => ({
    value: key,
    label: t(`keyNames.${key}`),
}));
</script>

<template>
    <UCard>
        <template #header>
            <div class="font-medium leading-5">
                {{ $t('filter') }}
            </div>
        </template>
        <div class="flex flex-wrap gap-2">
            <UFormField :label="$t('opus')" class="w-32">
                <USelectMenu
                    v-model="op"
                    multiple
                    class="w-full"
                    :search-input="false"
                    :items="opOptions"
                />
            </UFormField>
            <UFormField :label="$t('number')" class="w-32">
                <USelectMenu
                    v-model="nr"
                    multiple
                    class="w-full"
                    :search-input="false"
                    :items="nrOptions"
                />
            </UFormField>
            <UFormField :label="$t('title')" class="w-32">
                <USelectMenu
                    v-model="title"
                    multiple
                    class="w-full"
                    :search-input="false"
                    :items="titleOptions"
                />
            </UFormField>
            <UFormField :label="$t('tempo')" class="w-32">
                <USelectMenu
                    v-model="tempo"
                    multiple
                    class="w-full"
                    :search-input="false"
                    :items="tempoOptions"
                />
            </UFormField>
            <UFormField :label="$t('key')" class="w-32">
                <USelectMenu
                    v-model="key"
                    multiple
                    class="w-full"
                    :search-input="true"
                    value-key="value"
                    :items="localizedKeyOptions"
                />
            </UFormField>
            <UFormField :label="$t('meter')" class="w-32">
                <USelectMenu
                    v-model="meter"
                    multiple
                    class="w-full"
                    :search-input="false"
                    :items="meterOptions"
                />
            </UFormField>
            <UFormField label="&nbsp;" class="w-32">
                <UButton color="warning" variant="subtle" icon="i-lucide-funnel-x" @click="resetFilter">{{ $t('reset')}}</UButton>
            </UFormField>

        </div>
    </UCard>
</template>
