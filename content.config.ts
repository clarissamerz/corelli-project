import { defineCollection, defineContentConfig, z } from '@nuxt/content';

export default defineContentConfig({
    collections: {
        pieces: defineCollection({
            source: 'pieces/**/*.yaml',
            type: 'page',
            schema: z.object({
                composer: z.string(),
                key: z.string(),
                largerWorkTitle: z.string(),
                majorMinor: z.string(),
                meter: z.array(z.string()),
                movementDesignation: z.array(z.string()),
                mv: z.number(),
                nr: z.number(),
                op: z.number(),
                slug: z.string(),
                title: z.string(),
            }),
        }),
        chords: defineCollection({
            source: 'chords.yaml',
            type: 'data',
            schema: z.object({
                chords: z.array(z.object({
                    beat: z.number(),
                    fb: z.string(),
                    hint: z.string(),
                    deg: z.string(),
                    lineNumber: z.number(),
                    pieceId: z.string(),
                    nextDeg: z.string(),
                    meterWeight: z.string(),
                })),
            }),
        }),
        modulations: defineCollection({
            source: 'modulations.yaml',
            type: 'data',
            schema: z.object({
                modulations: z.array(z.object({
                    deg: z.string(),
                    endBeat: z.number(),
                    endLine: z.number(),
                    key: z.string(),
                    pieceId: z.string(),
                    startBeat: z.number(),
                    startLine: z.number(),
                })),
            }),
        }),
        transitions: defineCollection({
            source: 'transitions.yaml',
            type: 'data',
            schema: z.object({}).passthrough(),
        }),
        cadences: defineCollection({
            source: 'cadences/*.yaml',
            type: 'data',
            schema:z.object({
                slug: z.string(),
                deg: z.string(),
                endBassDeg: z.string(),
                endBeat: z.number(),
                endLine: z.number(),
                key: z.string(),
                pieceId: z.string(),
                startBeat: z.number(),
                startLine:z.number(),
                tags: z.array(z.string()),
            }),
        }),
        sequences: defineCollection({
            source: 'sequences.yaml',
            type: 'data',
            schema: z.object({
                sequences: z.array(z.object({
                    endBeat: z.number(),
                    endLine: z.number(),
                    pieceId: z.string(),
                    startBeat: z.number(),
                    startLine:z.number(),
                    tags: z.array(z.string()),
                })),
            }),
        }),
        reviews: defineCollection({
            source: 'reviews.yaml',
            type: 'data',
            schema: z.object({
                reviews: z.array(z.object({
                    pieceId: z.string(),
                    date: z.date(),
                    needsReview: z.boolean(),
                })),
            }),
        }),
        initialVoicings: defineCollection({
            source: 'initial-voicings.yaml',
            type: 'data',
            schema: z.object({
                initialVoicings: z.array(z.object({
                    fb: z.string(),
                    pieceId: z.string(),
                })),
            }),
        }),
    },
});
