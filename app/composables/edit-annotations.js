import { v4 as uuidv4 } from 'uuid';

export function useEditAnnotations(modulations, cadences, sequences) {
    const editedModulations = ref(modulations.map(m => ({
        id: uuidv4(),
        startLine: m.startLine,
        key: m.key,
    })));

    function removeModulation(id) {
        editedModulations.value = editedModulations.value.filter(c => c.id !== id);
    }

    function addModulation() {
        editedModulations.value.push({
            id: uuidv4(),
            startLine: 1,
            key: '',
        });
    }

    const editedCadences = ref(cadences.map(c => ({
        id: uuidv4(),
        startLine: c.startLine,
        endLine: c.endLine,
        tags: c.tags ? [...c.tags] : [],
    })))

    function removeCadence(id) {
        editedCadences.value = editedCadences.value.filter(c => c.id !== id);
    }

    function addCadence() {
        editedCadences.value.push({
            id: uuidv4(),
            startLine: 1,
            endLine: 1,
            tags: [],
        });
    }

    const editedSequences = ref(sequences.map(s => ({
        id: uuidv4(),
        startLine: s.startLine,
        endLine: s.endLine,
        tags: s.tags ? [...s.tags] : [],
    })))

    function removeSequence(id) {
        editedSequences.value = editedSequences.value.filter(s => s.id !== id);
    }

    function addSequence() {
        editedSequences.value.push({
            id: uuidv4(),
            startLine: 1,
            endLine: 1,
            tags: [],
        });
    }

    return {
        editedModulations,
        removeModulation,
        addModulation,
        editedCadences,
        removeCadence,
        addCadence,
        editedSequences,
        removeSequence,
        addSequence,
    };
}
