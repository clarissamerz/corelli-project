import { defineStore, acceptHMRUpdate } from 'pinia';

function createDefaultPieceFilterOptions() {
    return {
        title: [],
        tempo: [],
        key: [],
        meter: [],
        op: [],
        nr: [],
    };
};

export const usePieceFilterOptions = defineStore('piece_filter_options', {
    state: () => (createDefaultPieceFilterOptions()),
    actions: {
        reset() {
            this.$patch(createDefaultPieceFilterOptions());
        },
    },
});

function queryBuidler(store, queryBuidler) {
    if (store.meter.length) {
        if (store.meter.length) {
            queryBuidler.orWhere(q => {
                store.meter.forEach(meter => q.where('meter', 'LIKE', `%${meter}%`))
                return q;
            });
        }
    }

    if (store.op.length) {
        queryBuidler.where('op', 'IN', [...store.op]);
    }

    if (store.tempo.length) {
        if (store.tempo.length) {
            queryBuidler.orWhere(q => {
                // TODO case insensitive
                store.tempo.forEach(tempo => q.where('movementDesignation', 'LIKE', `%${tempo}%`))
                return q;
            });
        }
    }

    if (store.key.length) {
        queryBuidler.where('key', 'IN', [...store.key]);
    }

    if (store.nr.length) {
        queryBuidler.where('nr', 'IN', [...store.nr]);
    }

    if (store.title.length) {
        // TODO case insensitive
        queryBuidler.where('title', 'IN', [...store.title]);
    }
    return queryBuidler;
};

export async function useAsyncDataPiecesCollection(options) {
    const store = usePieceFilterOptions();
    return await useAsyncData('filtered-pieces', () => {
        return queryBuidler(store, queryCollection('pieces')).all();
    }, {
        server: false, // used for nuxt generate deployment
        watch: [store.$state],
        // deep: true,
        ...options,
    });
};

export async function useAsyncDataCountPiecesCollection(options) {
    const store = usePieceFilterOptions();
    return await useAsyncData('count-filtered-pieces', () => {
        return queryBuidler(store, queryCollection('pieces')).count();
    }, {
        server: false, // used for nuxt generate deployment
        watch: [store.$state],
        // deep: true,
        ...options,
    });
};

export async function useAsyncDataPiecesCollectionSurroundings(path) {
    const store = usePieceFilterOptions();
    return await useAsyncData(`pieces/${path}/surroundings`, () => {
        return queryBuidler(store, queryCollectionItemSurroundings('pieces', path, {
            fields: ['slug'],
        }));
    }, {
        server: false, // used for nuxt generate deployment
        watch: [store.$state],
        // deep: true,
    });
};

export async function useAsyncDataCountPieces(options) {
    return await useAsyncData('count-pieces', () => {
        return queryCollection('pieces').count();
    }, options);
};

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useScoreOptions, import.meta.hot));
}
