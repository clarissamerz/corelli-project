<script setup>
definePageMeta({
    layout: 'faq',
});

//Daten holen - aber Synkopenketten sind in sequences.. vielleicht vorher noch extrahieren?
const { data: syncopationsData } = await useAsyncData('syncopations', () => queryCollection('syncopations').first(), {
    deep: false,
});

const { t } = useI18n();
const localePath = useLocalePath();

const syncopationsLength = 0;
const filteredSyncopationsLength = 0
</script>

<template>
    <div>
        <Heading>{{ $t('syncopations') }}</Heading>

        <p>
            Um für Bassstimmen unterhalb von Synkopenketten in eigenen Kompositionen
            im Stile Corellis eine geeignete Figuration zu wählen, wurde
            untersucht, welche Figurationen am häufigsten vorkommen.
            Dazu wurden alle Synkopenketten in den Corelli-Kompositionen identifiziert
            und auf ihre Bassstimme hin untersucht. Dabei haben sich folgende
            Patterns ergeben, die am häufigsten auftreten.
            
            Auf diese Weise wurden von insgesamt {{ syncopationsLength }}
            Synkopenketten {{ filteredSyncopationsLength }} Synkopenketten gefunden, bei
            denen die Bassstimme eine der unten aufgeführten Figurationen aufweist.
        </p>
        <p>
            Die erste Zahl im Voicing gibt die obere Stimme an, die zweite Zahl
            die mittlere Stimme. So bedeutet beispielsweise „5 3“ eine Quinte
            über dem Bass in Violine 1 und eine Terz über dem Bass in Violine 2.
        </p>

        <template v-for="syncopation in syncopationsData.bassFigurations">
            <Subheading>{{ syncopation.signature }}</Subheading>
            <div class="gap-2 flex flex-wrap">
                <UBadge v-for="id in syncopation.ids" :label="id" />
            </div>
        </template>

    </div>
</template>
