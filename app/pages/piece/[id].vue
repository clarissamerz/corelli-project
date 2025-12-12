<script setup>
import { useClipboard } from '@vueuse/core';
const toast = useToast();
const { t } = useI18n();

const localePath = useLocalePath();
const { params: { id } } = useRoute();
const { data: piece } = await useAsyncData(`pieces/${id}`, () => queryCollection('pieces').where('stem', '=', `pieces/${id}`).first());
const { data: cadencesData } = await useAsyncData(`cadences/piece/${id}`, () => queryCollection('cadences').where('pieceId', '=', id).all());
const { data: modulationsData } = await useAsyncData(`modulations`, () => queryCollection('modulations').first());
const { data: sequencesData } = await useAsyncData(`sequences`, () => queryCollection('sequences').first());

const cadences = cadencesData.value;
const modulations = modulationsData.value.modulations.filter(m => m.pieceId === id);
const sequences = sequencesData.value.sequences.filter(s => s.pieceId === id);

if (!piece.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Page Not Found',
    });
}

const { data: surroundData } = await useAsyncDataPiecesCollectionSurroundings(piece.value.path);
const prevPiece = computed(() => surroundData.value?.[0] ?? null);
const nextPiece = computed(() => surroundData.value?.[1] ?? null);

const { localScoreUrlGenerator, githubScoreUrlGenerator, vhvScoreUrlGenerator } = useScoreUrlGenerator();

const scoreOptions = useScoreOptions();

useScoreKeyboardShortcuts({
    prevPiece,
    nextPiece,
});

const { copy, copied } = useClipboard();

function copyId() {
    copy(id);
};

async function redirectToFirstFilteredPiece() {
    const { data: filteredPieces } = await useAsyncDataPiecesCollection({ server: false });
    const pieces = filteredPieces.value ?? [];

    const isCurrentPieceFiltered = pieces.some(p => p.slug === id);

    const toastDuration = 3000;

    if (!isCurrentPieceFiltered) {
        const firstPiece = pieces[0];

        if (!firstPiece) {
            toast.add({
                title: t('noPiecesFound'),
                icon: 'i-lucide-alert-circle',
                duration: toastDuration,
            });
        } else {
            toast.add({
                title: t('pieceNotInFilterResultTitle', { id }),
                description: t('pieceNotInFilterResultDescription'),
                icon: 'i-lucide-alert-circle',
                duration: toastDuration,
            });
            await new Promise(resolve => setTimeout(resolve, toastDuration));
            navigateTo(localePath({ name: 'piece-id', params: { id: firstPiece.slug } }));
        }
    }
}

const {
    editedModulations,
    removeModulation,
    addModulation,
    editedCadences,
    removeCadence,
    addCadence,
    editedSequences,
    removeSequence,
    addSequence,
} = useEditAnnotations(modulations, cadences, sequences);

const editAnnotations = ref(false);

const highlightedSections = computed(() => {
    const currentCadences = editAnnotations.value ? editedCadences.value : cadences;
    const currentSequences = editAnnotations.value ? editedSequences.value : sequences;
    return [
        {
            items: scoreOptions.showCadences ? currentCadences.map(c => ({
                startLine: c.startLine,
                endLine: c.endLine,
                label: c.tags?.join(', '),
            })) : [],
        },
        {
            color: 'rgb(59 130 246 / 0.4)',
            items: scoreOptions.showSequences ? currentSequences.map(s => ({
                startLine: s.startLine,
                endLine: s.endLine,
                label: s.tags?.join(', '),
            })) : [],
        },
    ];
});

const highlightedLines = computed(() => {
    const currentModulations = editAnnotations.value ? editedModulations.value : modulations;

    return scoreOptions.showModulations ? [{
        items: currentModulations.map(m => ({
            lineNumber: m.startLine,
            label: {
                value: scoreOptions.showModulationsDegLabel ? m.deg : m.key,
                position: 'bottom',
            },
        })),
        color: 'rgb(34 197 94 / 0.4)',
    }] : [];
});

const editTabItems = [
    { label: t('modulations'), value: 'modulations', slot: 'modulations' },
    { label: t('cadences'), value: 'cadences',slot: 'cadences' },
    { label: t('sequences'), value: 'sequences',slot: 'sequences' },
];

const activeEditTab = ref('modulations');

watch(activeEditTab, (value) => {
    if (value === 'modulations') scoreOptions.showModulations = true;
    if (value === 'cadences') scoreOptions.showCadences = true;
    if (value === 'sequences') scoreOptions.showSequences = true;
}, { immediate: true });

const editedAnnotationsString = computed(() => {
    return JSON.stringify({
        pieceId: id,
        commitSha: useRuntimeConfig().public.corelliTrioSonatasSha,
        modulations: editedModulations.value.map(i => ({
            startLine: i.startLine,
            key: i.key,
        })).sort((a, b) => a.startLine - b.startLine),
        cadences: editedCadences.value.map(i => ({
            startLine: i.startLine,
            endLine: i.endLine,
            tags: i.tags,
        })).sort((a, b) => a.startLine - b.startLine),
        sequences: editedSequences.value.map(i => ({
            startLine: i.startLine,
            endLine: i.endLine,
            tags: i.tags,
        })).sort((a, b) => a.startLine - b.startLine),
    }, null, 4);
});

const githubIssueUrl = computed(() => {
    const body = `\`\`\`json
${editedAnnotationsString.value}
\`\`\``;

    const encodedBody = encodeURIComponent(body);
    return `https://github.com/WolfgangDrescher/corelli-trio-sonatas/issues/new?title=${id}&body=${encodedBody}`;
});

function downloadAnnotationsFile() {
    const blob = new Blob([editedAnnotationsString.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function copyJsonToClipboard() {
    copy(editedAnnotationsString.value);
}
</script>

<template>
    <UContainer>
        <div class="flex flex-col gap-8">
            <div>
                <Heading>
                    {{ `${piece.largerWorkTitle} Op. ${piece.op} №${piece.nr}` }}
                    <div class="text-2xl flex gap-2">
                        <div>
                            {{ `${piece.mv}. ${piece.body.title ? `${piece.title}: ` : ''} ${piece.movementDesignation}`}}
                        </div>
                        <div class="flex items-center">
                            <UBadge color="neutral" size="sm" variant="outline" class="font-mono cursor-pointer select-none w-[11ch] inline-flex items-center justify-center text-center" @click="copyId" :label="copied ? $t('copied') : id" />
                        </div>
                    </div>
                    <div class="text-base font-normal">
                        {{ piece.composer }}
                    </div>
                </Heading>
                <div class="flex gap-2">
                    <UButton :disabled="!prevPiece" :to="localePath({ name: 'piece-id', params: { id: prevPiece?.slug }, hash: $route.hash })" size="xs">
                        <template #leading>
                            <UKbd color="neutral">
                                <UIcon name="lucide:arrow-left" />
                            </UKbd>
                        </template>
                        {{ $t('previous') }}
                    </UButton>
                    <UButton :disabled="!nextPiece" :to="localePath({ name: 'piece-id', params: { id: nextPiece?.slug }, hash: $route.hash })" size="xs">
                        {{ $t('next') }}
                        <template #trailing>
                            <UKbd color="neutral">
                                <UIcon name="lucide:arrow-right" />
                            </UKbd>
                        </template>
                    </UButton>
                    <PieceFilterModal @after:leave="redirectToFirstFilteredPiece" />
                </div>
            </div>

            <div class="flex flex-col md:flex-row items-center gap-4">
                <div>
                    <ScoreOptionsPalette />
                </div>
                <div class="shrink-0 flex gap-2 ml-auto md:order-2">
                    <MidiPlayer :url="localScoreUrlGenerator(piece.slug)" class="text-2xl"/>
                    <UButton :to="githubScoreUrlGenerator(piece.slug)" target="_blank">
                        {{ $t('github') }}
                    </UButton>
                    <UButton :to="vhvScoreUrlGenerator(piece.slug)" target="_blank">
                        {{ $t('vhv') }}
                    </UButton>
                </div>
            </div>

            <HighlightedScore
                :piece-id="piece.slug"
                :horizontal="scoreOptions.showHorizontalViewMode"
                :verovio-options="{
                    ...scoreOptions.verovioOptions,
                    header: true,
                    spacingSystem: 15,
                    pageMarginLeft: 50,
                    pageMarginRight: 0,
                    pageMarginTop: 50,
                    pageMarginBottom: 50,
                }"
                :sections="highlightedSections"
                :lines="highlightedLines"
                :filters="scoreOptions.humdrumFilters"
            />

            <USwitch v-model="editAnnotations" :label="$t('editAnnotations')" />

            <div v-if="editAnnotations">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div class="lg:col-span-2">
                        <UTabs v-model="activeEditTab" :items="editTabItems">
                            <template #modulations>
                                <div class="grid grid-cols-1 gap-4">
                                    <div class="flex gap-4" v-for="modulation in editedModulations" :key="modulation.id">
                                        <div class="w-25">
                                            <UInput v-model="modulation.key" class="w-full"/>
                                        </div>
                                        <div class="w-35">
                                            <ScoreLineInput v-model="modulation.startLine" />
                                        </div>
                                        <div>
                                            <UButton @click="removeModulation(modulation.id)" icon="i-lucide-trash" color="error" variant="soft" />
                                        </div>
                                    </div>
                                    <div>
                                        <UButton @click="addModulation" :label="$t('addModulation')" />
                                    </div>
                                </div>
                            </template>

                            <template #cadences>
                                <div class="grid grid-cols-1 gap-4">
                                    <div class="flex gap-4" v-for="cadence in editedCadences" :key="cadence.id">
                                        <div class="w-75">
                                            <UInputTags v-model="cadence.tags" class="w-full"/>
                                        </div>
                                        <div class="w-35">
                                            <ScoreLineInput v-model="cadence.startLine" />
                                        </div>
                                        <div class="w-35">
                                            <ScoreLineInput v-model="cadence.endLine" />
                                        </div>
                                        <div>
                                            <UButton @click="removeCadence(cadence.id)" icon="i-lucide-trash" color="error" variant="soft" />
                                        </div>
                                    </div>
                                    <div>
                                        <UButton @click="addCadence" :label="$t('addCadence')" />
                                    </div>
                                </div>
                            </template>

                            <template #sequences>
                                <div class="grid grid-cols-1 gap-4">
                                    <div class="flex gap-4" v-for="sequence in editedSequences" :key="sequence.id">
                                        <div class="w-75">
                                            <UInputTags v-model="sequence.tags" class="w-full"/>
                                        </div>
                                        <div class="w-35">
                                            <ScoreLineInput v-model="sequence.startLine" />
                                        </div>
                                        <div class="w-35">
                                            <ScoreLineInput v-model="sequence.endLine" />
                                        </div>
                                        <div>
                                            <UButton @click="removeSequence(sequence.id)" icon="i-lucide-trash" color="error" variant="soft" />
                                        </div>
                                    </div>
                                    <div>
                                        <UButton @click="addSequence" :label="$t('addSequence')" />
                                    </div>
                                </div>
                            </template>
                        </UTabs>
                    </div>
                    <UCard>
                        <div class="flex gap-2 flex-wrap justify-end mb-4">
                            <UButton @click="downloadAnnotationsFile" :label="$t('downloadAnnotationsFile')" />
                            <UButton :to="githubIssueUrl" target="_blank" :label="$t('createGithubIssue')" />
                        </div>
                        <div class="relative">
                            <div class="absolute right-4 top-2">
                                <UTooltip :text="$t('copied')" :open="copied">
                                    <UButton icon="lucide:copy" @click="copyJsonToClipboard" size="xs" color="neutral" variant="soft" />
                                </UTooltip>
                            </div>
                            <pre v-text="editedAnnotationsString" class="text-xs max-h-100 overflow-x-auto scrollbar-gutter-stable bg-gray-50 rounded p-4"></pre>
                        </div>
                    </UCard>
                </div>
            </div>

        </div>
    </UContainer>
</template>
