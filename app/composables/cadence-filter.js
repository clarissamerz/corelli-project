export function useCadenceFilter(cadences, defaults = {}) {

    const defaultFilters = Object.assign({
        deg: [],
        endBassDeg: [],
        tags: [],
    }, defaults);
    
    const filters = reactive({
        ...defaultFilters,
    });

    const filteredCadences = computed(() => {
        return toValue(cadences).filter(cadence => {
            return filterDeg(cadence, filters.deg)
                && filterEndBassDeg(cadence, filters.endBassDeg)
                && filterTags(cadence, filters.tags)
            ;
        });
    });

    function resetFilters() {
        Object.assign(filters, defaultFilters);
    }

    return {
        filteredCadences,
        filters,
        resetFilters,
    };

}

function filterDeg(cadence, deg) {
    if (!deg?.length) return true;
    return deg.includes(cadence.deg);
}

function filterEndBassDeg(cadence, endBassDeg) {
    if (!endBassDeg?.length) return true;
    return endBassDeg.includes(cadence.endBassDeg);
}

function filterTags(cadence, tags) {
    if (!tags?.length) return true;
    const cadenceTags = cadence.tags || [];
    return cadenceTags.some(tag => tags.includes(tag));
}
