import { onKeyStroke } from '@vueuse/core';

function ignoreIfInput () {
    const el = document.activeElement;
    return el && (['input', 'textarea'].includes(el.tagName.toLowerCase()) || el.isContentEditable);
};

export function useScoreKeyboardShortcuts(options = {}) {
    const route = useRoute();
    const scoreOptions = useScoreOptions();
    const localePath = useLocalePath();

    const { prevPiece, nextPiece } = options ?? {};
    const prev = computed(() => unref(prevPiece));
    const next = computed(() => unref(nextPiece));

    onKeyStroke('ArrowLeft', () => {
        if (ignoreIfInput() || !prev.value) return;
        navigateTo(localePath({ name: 'piece-id', params: { id: prev.value.slug }, hash: route.hash }));
    });

    onKeyStroke('ArrowRight', () => {
        if (ignoreIfInput() || !next.value) return;
        navigateTo(localePath({ name: 'piece-id', params: { id: next.value.slug }, hash: route.hash }));
    });

    onKeyStroke('c', () => {
        if (ignoreIfInput()) return;
        scoreOptions.showCadences = !scoreOptions.showCadences;
    });

    onKeyStroke('s', () => {
        if (ignoreIfInput()) return;
        scoreOptions.showSequences = !scoreOptions.showSequences;
    });

    onKeyStroke('m', () => {
        if (ignoreIfInput()) return;
        scoreOptions.showModulations = !scoreOptions.showModulations;
    });

    onKeyStroke('h', () => {
        if (ignoreIfInput()) return;
        scoreOptions.showHorizontalViewMode = !scoreOptions.showHorizontalViewMode;
    });

    onKeyStroke('+', () => {
        if (ignoreIfInput()) return;
        scoreOptions.zoomIn();
    });

    onKeyStroke('-', () => {
        if (ignoreIfInput()) return;
        scoreOptions.zoomOut();
    });

    onKeyStroke('0', () => {
        if (ignoreIfInput()) return;
        scoreOptions.resetZoom();
    });

    onKeyStroke('r', () => {
        if (ignoreIfInput()) return;
        scoreOptions.reset();
    });
}
