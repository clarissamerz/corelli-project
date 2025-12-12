export function useSequenceFilter(sequences, defaults = {}) {

    const defaultFilters = Object.assign({
        tags: [],
    }, defaults);
    
    const filters = reactive({
        ...defaultFilters,
    });

    const filteredSequences = computed(() => {
        return toValue(sequences).filter(sequence => filterTags(sequence, filters.tags));
    });

    function resetFilters() {
        Object.assign(filters, defaultFilters);
    }

    return {
        filteredSequences,
        filters,
        resetFilters,
    };

}

function filterTags(sequence, tags) {
    if (!tags?.length) return true;
    const sequenceTags = sequence.tags || [];
    return sequenceTags.some(tag => tags.includes(tag));
}
