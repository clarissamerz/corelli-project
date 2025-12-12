<script setup>
const { t } = useI18n();

useHead({
    title: t('home'),
});


const id = 'op04n01a';
const { data: piece } = await useAsyncData(`pieces/${id}`, () => queryCollection('pieces').where('stem', '=', `pieces/${id}`).first());
const { data: pieces } = await useAsyncData(`pieces`, () => queryCollection('pieces').all());
const { data: cadencesData } = await useAsyncData(`cadences`, () => queryCollection('cadences').all());
const { data: demoPieceCadencesData } = await useAsyncData(`cadences/piece/${id}`, () => queryCollection('cadences').where('pieceId', '=', id).all());
const { data: sequencesData } = await useAsyncData(`sequences`, () => queryCollection('sequences').first());
const { data: modulationsData } = await useAsyncData(`modulations`, () => queryCollection('modulations').first());
const { data: reviewsData } = await useAsyncData(`reviews`, () => queryCollection('reviews').first());

const demoPieceCadences = demoPieceCadencesData.value;
const demoPieceSequences = sequencesData.value.sequences.filter(s => s.pieceId === id);
const demoPieceModulations = modulationsData.value.modulations.filter(m => m.pieceId === id);

const scoreOptions = useScoreOptions();
useScoreKeyboardShortcuts();
const { localScoreUrlGenerator, githubScoreUrlGenerator, vhvScoreUrlGenerator } = useScoreUrlGenerator();

const timelineValue = 2;
const timeline = [
    {
        icon: 'i-lucide-rocket',
        title: 'Projekt-Kickoff',
        description: 'Start des Projekts und Einführung in digitale Analysemethoden.',
        date: '1. Oktober 2025',
    },
    {
        icon: 'i-lucide-music',
        title: 'Aufbereitung der Partituren',
        description: 'Import und Aufbereitung der Kern-Partituren, sodass im Anschluss spezifische musikalische Parameter mit Humdrum automatisch berechnet werden können.',
        date: 'Oktober 2025',
    },
    {
        icon: 'i-lucide-pencil',
        title: 'Annotation',
        description: 'Erfassung und Markierung von Kadenzen, Sequenzen und Tonarten.',
        date: 'November 2025',
    },
    {
        icon: 'i-lucide-lightbulb',
        title: 'Forschungsfragen',
        description: 'Formulierung, digitale Aufbereitung und Programmierung der analytischen Fragestellungen.',
        date: 'Dezember 2025',
    },
    {
        icon: 'i-lucide-globe',
        title: 'Deployment',
        description: 'Veröffentlichung und Präsentation der Website.',
        date: 'Februar 2026',
    },
];

const progressTabs = [
    { label: 'Total', value: 'total', slot: 'total' },
    { label: 'Op. 1', value: 'op01', slot: 'op01' },
    { label: 'Op. 2', value: 'op02', slot: 'op02' },
    { label: 'Op. 3', value: 'op03', slot: 'op03' },
    { label: 'Op. 4', value: 'op04', slot: 'op04' },
];

const activeProgressTab = ref('total');

function filterPiecesByOp(data, prop = 'pieceId') {
    return activeProgressTab.value === 'total' ? true : data[prop]?.startsWith(activeProgressTab.value);
}

const totalPieces = computed(() => pieces.value.filter(item => filterPiecesByOp(item, 'slug'))?.length ?? 0);

const modulationCount = computed(() => {
    if (!pieces.value || !modulationsData.value) return 0;
    const mods = modulationsData.value.modulations.filter(item => filterPiecesByOp(item, 'pieceId'));
    const piecesWithMods = new Set(mods.map(m => m.pieceId));
    return pieces.value.filter(p => piecesWithMods.has(p.slug)).length;
});

const cadenceCount = computed(() => {
    if (!pieces.value || !cadencesData.value) return 0;
    const cads = cadencesData.value.filter(item => filterPiecesByOp(item, 'pieceId'));
    const piecesWithCadences = new Set(cads.map(c => c.pieceId));
    return pieces.value.filter(p => piecesWithCadences.has(p.slug)).length;
});

const sequenceCount = computed(() => {
    if (!pieces.value || !sequencesData.value) return 0;
    const seqs = sequencesData.value.sequences.filter(item => filterPiecesByOp(item, 'pieceId'));
    const piecesWithSequences = new Set(seqs.map(s => s.pieceId));
    return pieces.value.filter(p => piecesWithSequences.has(p.slug)).length;
});

const reviewsCount = computed(() => {
    if (!pieces.value || !reviewsData.value) return 0;
    const seqs = reviewsData.value.reviews.filter(item => filterPiecesByOp(item, 'pieceId'));
    const piecesWithSequences = new Set(seqs.map(s => s.pieceId));
    return pieces.value.filter(p => piecesWithSequences.has(p.slug)).length;
});
</script>

 <template>
    <UContainer>
        <section class="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
                <Heading>Digitale Perspektiven auf Corellis Triosonaten</Heading>
            </div>
        </section>
        <div class="grid grid-cols-1 gap-8">
            <section class="grid gap-12 lg:grid-cols-2 lg:items-start">
                <div class="flex flex-col gap-6">
                    <p>
                        Die Plattform vereint Analysen, Materialien und
                        Werkzeuge, die im Rahmen des Seminars
                        <em>Digitale Methoden zur Analyse von Corellis
                        Triosonaten</em> im Wintersemester 2025/26 an der
                        Hochschule für Musik Freiburg entstanden.

                        Auf Grundlage fachlicher Analysen der Triosonaten mit
                        Annotationen von Kadenzen, Sequenzen und Tonarten werden
                        die Werke mit digitalen Methoden aufbereitet und
                        ausgewertet.

                        Mit Tools wie Humdrum und Verovio lassen sich die
                        analytischen Ergebnisse direkt auf der Website in einer
                        interaktiven Partitur sowie über Charts und
                        Filtermöglichkeiten erkunden.
                        
                        Das Ziel ist es, Studierende beim Erforschen dieser
                        Stücke mit einem Fokus auf den Generalbass zu
                        unterstützen und sie zu motivieren, eigene
                        Untersuchungen zu spezifischen Parametern dieser Musik
                        durchzuführen, sowie handwerkliche Kriterien zu
                        vermitteln, die es ihnen ermöglichen, eigene
                        Kompositionen im Stil dieser Triosonaten anzufertigen.
                    </p>
                </div>
                <UCard>
                    <Subheading :level="2">Was Sie hier finden</Subheading>
                    <ul class="space-y-1">
                        <li class="grid grid-cols-[auto_1fr] gap-2 items-start">
                            <span class="block h-2 w-2 translate-y-2 rounded-full bg-primary-500"></span>
                            <span>
                                Interaktive Darstellung von Kadenzen,
                                Satzmodellen und Modulationen direkt in der
                                Partitur.
                            </span>
                        </li>
                        <li class="grid grid-cols-[auto_1fr] gap-2 items-start">
                            <span class="block h-2 w-2 translate-y-2 rounded-full bg-primary-500"></span>
                            <span>
                                Digitale Aufbereitung konkreter Forschungsfragen
                                zu diesem Korpus.
                            </span>
                        </li>
                        <li class="grid grid-cols-[auto_1fr] gap-2 items-start">
                            <span class="block h-2 w-2 translate-y-2 rounded-full bg-primary-500"></span>
                            <span>
                                Diagramme zu Tonartenverhältnissen und
                                Modulationsvorgängen.
                            </span>
                        </li>
                        <li class="grid grid-cols-[auto_1fr] gap-2 items-start">
                            <span class="block h-2 w-2 translate-y-2 rounded-full bg-primary-500"></span>
                            <span>
                                Filtermöglichkeiten zur gezielten Auswahl
                                bestimmter musikalischer Parameter wie Akkorden
                                und Kadenzen.
                            </span>
                        </li>
                    </ul>
                </UCard>
            </section>
            <section class="grid gap-10 lg:grid-cols-2">
                <div class="flex flex-col gap-4">
                    <Subheading :level="2">Analytische und digitale Arbeitsweisen im Seminar</Subheading>
                    <p>
                        Die Studierenden erproben, wie digitale Methoden
                        musiktheoretische Analyseverfahren erweitern und
                        präzisieren können.
                        
                        Im Mittelpunkt steht die systematische Erfassung und
                        Auswertung struktureller Merkmale in Corellis
                        Triosonaten, etwa von Kadenzen, Sequenzen und
                        Modulationen.
                        
                        Durch den Einsatz datenbasierter Verfahren werden
                        musikalische Muster sichtbar, die in traditionellen
                        Analysen oft unberücksichtigt bleiben.
                        
                        Auf diese Weise entstehen neue Ansätze, um
                        kompositorische Prinzipien des Barock empirisch zu
                        untersuchen und für Lehre und Forschung nutzbar zu
                        machen.

                        Ein zentraler Bestandteil des Seminars ist die
                        Auseinandersetzung mit der Annotation musikalischer
                        Parameter. Die Studierenden entwickeln Strategien, wie
                        sich bestimmte Phänomene eindeutig erfassen und im
                        YAML-Format innerhalb des Repositoriums dokumentieren
                        lassen.

                        Darauf aufbauend erfolgt die Systematisierung der
                        Annotationen. Dabei werden Begriffe und Kriterien
                        definiert, etwa die Frage, wann eine Wendung als Kadenz
                        gilt oder in welchem Verhältnis kadenzielle Strukturen
                        innerhalb von Sequenzen stehen.

                        Anschließend werden die benötigten Daten mit Humdrum,
                        Humlib und verschiedenen Filteroptionen aufbereitet, um
                        relevante Parameter als Rohdaten zu extrahieren.

                        Diese Rohdaten dienen schließlich als Grundlage für
                        visuelle und interaktive Darstellungen auf der
                        Projektwebsite. Mit Vue.js und Nuxt.js entstehen
                        Diagramme, Filter und Ansichtsseiten, die die
                        Analyseergebnisse anschaulich und nachvollziehbar
                        machen.
                    </p>
                </div>
                <div class="flex flex-col gap-4">
                    <UTimeline :items="timeline" v-model="timelineValue" color="primary" />
                </div>
            </section>
            <section class="grid gap-10 lg:grid-cols-2">
                <div>
                    <Subheading :level="2">Beispielpartitur</Subheading>
                    <p>
                        Die folgende Partitur zeigt ein Beispiel für die interaktive
                        Darstellung der im Seminar entwickelten Analysetools.
                        Kadenzen, Sequenzen und Modulationen können direkt in der
                        Notendarstellung erkundet und über verschiedene Filter und
                        Visualisierungen ausgewertet werden.
    
                        Probieren Sie die Befehlspalette aus, um für Sie
                        interessante Phänomene in der Partitur anzuzeigen.
                    </p>
                </div>
                <div>
                    <UCard>
                        <template #header>Projektfortschritt</template>
                        <UTabs v-model="activeProgressTab" :items="progressTabs" />
                        <div class="space-y-6 mt-4">
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span>Modulationen</span>
                                    <span>{{ modulationCount }} / {{ totalPieces }}</span>
                                </div>
                                <UProgress v-model="modulationCount" :max="totalPieces" height="8px" />
                            </div>
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span>Kadenzen</span>
                                    <span>{{ cadenceCount }} / {{ totalPieces }}</span>
                                </div>
                                <UProgress v-model="cadenceCount" :max="totalPieces" height="8px" />
                            </div>
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span>Satzmodelle</span>
                                    <span>{{ sequenceCount }} / {{ totalPieces }}</span>
                                </div>
                                <UProgress v-model="sequenceCount" :max="totalPieces" height="8px" />
                            </div>
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span>Reviews</span>
                                    <span>{{ reviewsCount }} / {{ totalPieces }}</span>
                                </div>
                                <UProgress v-model="reviewsCount" :max="totalPieces" height="8px" color="info" />
                            </div>
                        </div>
                    </UCard>
                </div>
            </section>
            <section>
                <div class="flex flex-col sm:flex-row items-center gap-4 mb-4">
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
                    :verovio-options="{
                        ...scoreOptions.verovioOptions,
                        header: true,
                        spacingSystem: 15,
                        pageMarginLeft: 50,
                        pageMarginRight: 0,
                        pageMarginTop: 10,
                        pageMarginBottom: 10,
                    }"
                    :sections="[
                        {
                            items: scoreOptions.showCadences ? demoPieceCadences.map(c => ({
                                startLine: c.startLine,
                                endLine: c.endLine,
                                label: c.tags?.join(', '),
                            })) : []
                        },
                        {
                            color: 'rgb(59 130 246 / 0.4)',
                            items: scoreOptions.showSequences ? demoPieceSequences.map(s => ({
                                startLine: s.startLine,
                                endLine: s.endLine,
                                label: s.tags?.join(', '),
                            })) : []
                        }
                    ]"
                    :lines="scoreOptions.showModulations ? [{
                        items: demoPieceModulations.map(m => ({
                            lineNumber: m.startLine,
                            label: {
                                value: scoreOptions.showModulationsDegLabel ? m.deg : m.key,
                                position: 'bottom',
                            },
                        })),
                        color: 'rgb(34 197 94 / 0.4)',
                    }] : []"
                    :filters="scoreOptions.humdrumFilters"
                />
            </section>
        </div>
    </UContainer>
</template>
