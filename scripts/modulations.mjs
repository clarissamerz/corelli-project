import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { romanize } from '../app/utils/romanize.js';
import { getIdFromFilename, getFiles } from './utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pathToKernScores = `${__dirname}/../corelli-trio-sonatas/kern/`;
const pathToModulations = `${__dirname}/../corelli-trio-sonatas/modulations.yaml`;
const modulationsYamlPath = `${__dirname}/../content/modulations.yaml`;
const transitionsYamlPath = `${__dirname}/../content/transitions.yaml`;

const modulationAnnotations = yaml.load(fs.readFileSync(pathToModulations, 'utf8').toString());

const modulationsResult = [];

getFiles(pathToKernScores).forEach(file => {

    const id = getIdFromFilename(file);

    if (!modulationAnnotations[id] || modulationAnnotations[id].length === 0) {
        console.warn(`❌ No modulations found for ${id}`);
        return;
    }

    console.log(`✅ Modulations found for ${id}`);

    const kernScore = fs.readFileSync(file, 'utf8');

    const stdout = execSync(`lnnr | beat -cp | beat -dp | beat -da --attacks 0 | extractxx -I '**fb' | extractxx -I '**dynam' | ridx -LGMd | sed '/^\*[^:]*$/d' | sed -n '/^\*/{p;n;p;}'`, {
        input: kernScore,
    }).toString().trim();
    const maxBeatStdout = execSync(`lnnr | beat -cp | beat -dp | beat -da --attacks 0 | extractxx -I '**fb' | extractxx -I '**dynam' | ridx -LGTMId | sed -n '$p'`, {
        input: kernScore,
    }).toString().trim();
    const lines = stdout.trim().split('\n');

    // Find the exclusive interpretation line (column headers: **kern, **cdata-beat, etc.)
    const headerLine = kernScore.split('\n').find(l => l.startsWith('**'));
    if (!headerLine) throw new Error(`No exclusive interpretation found in ${id}`);
    const headers = headerLine.split('\t');
    const kernCount = headers.filter(h => h.startsWith('**kern')).length;
    
    const indexMap = {
        beatDur: 0,
        beat: 1,
        lineNumber: 2 + kernCount,
        beatDurAttacksNull: 3 + kernCount,
    };

    let maxBeat = parseFloat(maxBeatStdout.split('\t')[indexMap.beat]);

    let lastBeatDur = parseFloat(maxBeatStdout.split('\t')[indexMap.beatDur])
        || parseFloat(maxBeatStdout.split('\t')[indexMap.beatDurAttacksNull])
        || 0;

    maxBeat += lastBeatDur;

    const modulations = [];

    let pieceKey = null;

    for (let i = 0; i < lines.length; i += 2) {
        const line = lines[i];
        
        const matches = line.match(/\*([A-Ha-h\#\-]+):/);

        if (!matches) {
            console.error(`No tandem inderpretation for key designation found in ${id}`);
            continue;
        }

        const [, key] = matches;
        
        pieceKey ??= key;

        const tokens = lines[i + 1].split('\t');
        let beat = tokens[indexMap.beat];
        let lineNumber = tokens[indexMap.lineNumber];
        
        beat = parseFloat(beat);
        lineNumber = parseInt(lineNumber, 10);
        
        const degScore = `**kern
*${pieceKey}:
1${key.toLowerCase()}`;

        const stdout = execSync(`echo "${degScore}" | degx | extractxx -i deg | ridx -I`).toString().trim();
        const nonDigits = stdout.replaceAll(/\d/g, '');
        let deg = romanize(stdout.replaceAll(/\D/g, ''));
        deg = key === key.toLowerCase() ? deg.toLowerCase() : deg.toUpperCase();
        deg += nonDigits;
        
        modulations.push({
            key,
            deg,
            startBeat: beat,
            endBeat: null,
            startLine: lineNumber,
            endLine: null,
            pieceId: id,
        });
    }

    modulations.forEach((modulation, index) => {
        modulation.endBeat = modulations[index + 1]?.startBeat ?? maxBeat;
        modulation.endLine = modulations[index + 1]?.startLine ?? lines.length;
    });

    modulationsResult.push(...modulations);

});

const transitionsMap = {};


const pieces = modulationsResult.reduce((acc, modulation) => {
    const { pieceId } = modulation;
    acc[pieceId] ??= [];
    acc[pieceId].push(modulation);
    return acc;
}, {});

for (const piece in pieces) {
    const degs = pieces[piece];

    for (let i = 0; i < degs.length - 1; i++) {
        const currentDeg = degs[i].deg;
        const nextDeg = degs[i + 1].deg;
        const nextStartBeat = degs[i + 1].startBeat;
        const nextStartLine = degs[i + 1].startLine;

        transitionsMap[currentDeg] ??= {};
        transitionsMap[currentDeg][nextDeg] ??= [0, []];
        transitionsMap[currentDeg][nextDeg][0]++;
        transitionsMap[currentDeg][nextDeg][1].push([piece, nextStartBeat, nextStartLine])
    }
}

const transitions = [];
for (const currentDeg in transitionsMap) {
    for (const nextDeg in transitionsMap[currentDeg]) {
        transitions.push({
            currentDeg,
            nextDeg,
            count: transitionsMap[currentDeg][nextDeg][0],
            items: transitionsMap[currentDeg][nextDeg][1].map(item => ({id: item[0], beat: item[1], lineNumber: item[2]})),
        });
    }
}

fs.writeFileSync(modulationsYamlPath, yaml.dump({modulations: modulationsResult}, {
    indent: 4,
    lineWidth: -1,
    sortKeys: true,
}));

fs.writeFileSync(transitionsYamlPath, yaml.dump({transitions}, {
    indent: 4,
    lineWidth: -1,
    sortKeys: true,
}));
