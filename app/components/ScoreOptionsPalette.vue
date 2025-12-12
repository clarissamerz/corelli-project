<script setup>
const open = defineModel('open', { type: Boolean });

onMounted(() => {
    const handler = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
            e.preventDefault();
            e.stopPropagation();
            open.value = true;
        }
    };
    window.addEventListener('keydown', handler, { capture: true });
    onBeforeUnmount(() => {
        window.removeEventListener('keydown', handler, { capture: true });
    });
});

const { t } = useI18n();

const scoreOptions = useScoreOptions();

const showOnlyActive = ref(false);

const groups = computed(() => {
    const allGroups = [
        {
            id: 'highlights',
            label: t('highlights'),
            items: [
                {
                    label: t('showCadences'),
                    onSelect: () => (scoreOptions.showCadences = !scoreOptions.showCadences),
                    active: scoreOptions.showCadences,
                    kbd: 'C',
                },
                {
                    label: t('showSequences'),
                    onSelect: () => (scoreOptions.showSequences = !scoreOptions.showSequences),
                    active: scoreOptions.showSequences,
                    kbd: 'S',
                },
                {
                    label: t('showModulations'),
                    onSelect: () => (scoreOptions.showModulations = !scoreOptions.showModulations),
                    active: scoreOptions.showModulations,
                    kbd: 'M',
                },
                {
                    label: t('showModulationsDegLabel'),
                    onSelect: () => (scoreOptions.showModulationsDegLabel = !scoreOptions.showModulationsDegLabel),
                    active: scoreOptions.showModulationsDegLabel,
                },
            ],
        },
        {
            id: 'humdrum-filters',
            label: t('humdrumFilters'),
            items: [
                {
                    label: t('showMeter'),
                    cmd: scoreOptions.humdrumFilterMap.showMeter,
                    onSelect: () => (scoreOptions.showMeter = !scoreOptions.showMeter),
                    active: scoreOptions.showMeter,
                },
                {
                    label: t('bassstufen'),
                    cmd: scoreOptions.humdrumFilterMap.bassstufen,
                    onSelect: () => (scoreOptions.bassstufen = !scoreOptions.bassstufen),
                    active: scoreOptions.bassstufen,
                },
                {
                    label: t('hideFiguredbass'),
                    cmd: scoreOptions.humdrumFilterMap.hideFiguredbass,
                    onSelect: () => (scoreOptions.hideFiguredbass = !scoreOptions.hideFiguredbass),
                    active: scoreOptions.hideFiguredbass,
                },
                {
                    label: t('showFiguredbassAbove'),
                    cmd: scoreOptions.humdrumFilterMap.showFiguredbassAbove,
                    onSelect: () => (scoreOptions.showFiguredbassAbove = !scoreOptions.showFiguredbassAbove),
                    active: scoreOptions.showFiguredbassAbove,
                },
                {
                    label: t('hideInstrumentNames'),
                    cmd: scoreOptions.humdrumFilterMap.hideInstrumentNames,
                    onSelect: () => (scoreOptions.hideInstrumentNames = !scoreOptions.hideInstrumentNames),
                    active: scoreOptions.hideInstrumentNames,
                },
                {
                    label: t('showIntervallsatz'),
                    cmd: scoreOptions.humdrumFilterMap.showIntervallsatz,
                    onSelect: () => (scoreOptions.showIntervallsatz = !scoreOptions.showIntervallsatz),
                    active: scoreOptions.showIntervallsatz,
                },
            ],
        },
        {
            id: 'dcml',
            label: t('dcmlOptions'),
            items: [
                {
                    label: t('showDcmlAnnotations'),
                    // icon: 'i-heroicons-chat-bubble-bottom-center-text',
                    onSelect: () => (scoreOptions.showDcmlAnnotations = !scoreOptions.showDcmlAnnotations),
                    active: scoreOptions.showDcmlAnnotations,
                },
            ],
        },
        {
            id: 'verovio',
            label: t('verovioOptions'),
            items: [
                {
                    label: t('zoomIn'),
                    icon: 'i-lucide-zoom-in',
                    kbd: '+',
                    onSelect: () => {
                        scoreOptions.zoomIn();
                    },
                },
                {
                    label: t('zoomOut'),
                    icon: 'i-lucide-zoom-out',
                    kbd: '-',
                    onSelect: () => {
                        scoreOptions.zoomOut();
                    },
                },
                {
                    label: t('resetZoom'),
                    icon: 'i-lucide-image-upscale',
                    kbd: '0',
                    onSelect: () => {
                        scoreOptions.resetZoom();
                    },
                },
                {
                    label: t('showHorizontalViewMode'),
                    onSelect: () => (scoreOptions.showHorizontalViewMode = !scoreOptions.showHorizontalViewMode),
                    active: scoreOptions.showHorizontalViewMode,
                    showCheckbox: true,
                    kbd: 'H',
                },
            ],
        },
        {
            id: 'reset',
            label: t('reset'),
            items: [
                {
                    label: t('resetAllVerovioOptions'),
                    // icon: 'i-lucide-refresh-ccw',
                    onSelect: () => {
                        scoreOptions.resetVerovio();
                    },
                },
                {
                    label: t('resetAllHumdrumFilters'),
                    // icon: 'i-lucide-refresh-ccw',
                    onSelect: () => {
                        scoreOptions.resetHumdrumFilters();
                    },
                },
                {
                    label: t('resetAllHighlights'),
                    // icon: 'i-lucide-refresh-ccw',
                    onSelect: () => {
                        scoreOptions.resetHighlights();
                    },
                },
                {
                    label: t('resetAll'),
                    // icon: 'i-lucide-refresh-ccw',
                    kbd: 'R',
                    onSelect: () => {
                        scoreOptions.reset();
                    },
                },
            ],
        },
    ];

    if (showOnlyActive.value) {
        return allGroups.map(g => ({
            ...g,
            items: g.items.filter(item => item.active),
        })).filter(g => g.items.length > 0);
    }

    return allGroups;
});
</script>

<template>
    <UModal v-model:open="open" @after:leave="showOnlyActive = false">
        <UChip :text="scoreOptions.countTotal" :show="scoreOptions.countTotal > 0" size="3xl">
            <UButton
                :label="$t('scoreCommandPalette')"
                variant="soft"
                icon="i-lucide-terminal"
            >
                <template #trailing>
                    <div class="hidden sm:flex gap-1">
                        <UKbd value="meta" />
                        <UKbd color="neutral" class="font-mono">P</UKbd>
                    </div>
                </template>
            </UButton>
        </UChip>
        
        <template #content>
            <UCommandPalette
                :placeholder="$t('searchCommandsAndScoreOptions')"
                :groups="groups"
            >
                <template #item-leading="{ item }">
                    <UCheckbox v-if="['humdrum-filters', 'highlights', 'dcml'].includes(item.group) || item.showCheckbox" v-model="item.active" />
                </template>
                <template #item-trailing="{ item }">
                    <div v-if="item.cmd" class="font-mono text-[0.55rem] text-gray-500 translate-y-1">{{ item.cmd }}</div>
                    <template v-if="item.kbd">
                        <UKbd v-for="kbd in Array.isArray(item.kbd) ? item.kbd : [item.kbd]" :value="kbd" size="sm" class="font-mono translate-y-0.5" />
                    </template>
                </template>
                <template #footer>
                    <UCheckbox v-model="showOnlyActive" size="xs" :label="$t('showOnlyActiveFilters')" />
                </template>
            </UCommandPalette>
        </template>
    </UModal>
</template>
