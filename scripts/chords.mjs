import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { meterWeights } from '../app/utils/meter-weights.js';
import { getIdFromFilename, getFiles } from './utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pathToKernScores = `${__dirname}/../corelli-trio-sonatas/kern`;
const pathToModulations = `${__dirname}/../corelli-trio-sonatas/modulations.yaml`;
const dataFile = `${__dirname}/../content/chords.yaml`;

function getBeatWeight(tsig, beat) {
    if (!tsig) return 'error';
    if (beat === '.') return '.';

    const meterDef = meterWeights.find(m => m.meter === tsig);
    if (!meterDef) return 'none';

    const beatDef = meterDef.beats.find(b => b[0] === beat);
    if (!beatDef) return 'none';

    return beatDef[1];
}

const result = [];

const modulations = yaml.load(fs.readFileSync(pathToModulations, 'utf8').toString());

getFiles(pathToKernScores).forEach(file => {

    const id = getIdFromFilename(file);

    if (!modulations[id] || modulations[id].length === 0) {
        console.warn(`❌ [chords] No modulations found for ${id}`);
        return;
    }

    console.log(`✅ [chords] Modulations found for ${id}`);

    const cmd = `cat ${file} | lnnr -p | beat -cp | fb -cnl | fb -cnlr | fb -cnl --hint | degx --resolve-null -t | composite | meter -tLr | shed -s 2 -e "s/beat/beat-composite/X" | shed -s 3 -e "s/tsig/tsig-composite/X" | extractxx -I '**kern' | extractxx -I '**text' | extractxx -I '**dynam' | extractxx -I '**kern-comp' | extractxx -I '**cdata-beat' | extractxx -I '**cdata-tsig' | ridx -LGTMId`;
    const stdout = execSync(cmd).toString().trim();

    const lines = stdout.trim().split('\n');

    const indexMap = {
        meterBeat: 0,
        meterTsig: 1,
        beat: 2,
        lineNumber: 3,
        fbOriginal: 4,
        fb: 5,
        fbReduced: 6,
        hint: 7,
        degBass: 8,
        degTenor: 9,
        degAlto: 10,
        degSoprano: 11,
    };

    lines.forEach(line => {
        const tokens = line.split('\t');
        let beat = tokens[indexMap.beat];
        const fb = tokens[indexMap.fb];
        const fbReduced = tokens[indexMap.fbReduced];
        const hint = tokens[indexMap.hint];
        const meterBeat = tokens[indexMap.meterBeat].replace('r', '');
        const meterTsig = tokens[indexMap.meterTsig];
        let deg = null;
        let lineNumber = tokens[indexMap.lineNumber];
        
        beat = parseFloat(beat);
        lineNumber = parseInt(lineNumber, 10);

        let degSpineIndex = 0;
        const degTokenList = [
            tokens[indexMap.degBass],
            tokens[indexMap.degTenor],
            tokens[indexMap.degAlto],
            tokens[indexMap.degSoprano],
        ];
        while ((deg === 'r' ||  deg === null) && degSpineIndex < degTokenList.length) {
            deg = degTokenList[degSpineIndex]?.split(' ')[0].replace('_', '');
            degSpineIndex++;
        }

        const meterWeight = getBeatWeight(meterTsig, meterBeat);

        if (fb === '.'/*|| meterBeat === '.'*/) {
            return;
        }

        result.push({
            beat: beat ?? 'ERROR',
            fb: fb ?? 'ERROR',
            hint: hint ?? 'ERROR',
            deg: deg ?? 'ERROR',
            timeSig: meterTsig ?? 'ERROR',
            lineNumber: lineNumber ?? 'ERROR',
            pieceId: id,
            nextDeg: null,
            fbReduced: fbReduced ?? 'ERROR',
            meterWeight: meterWeight ?? 'ERROR',
        });
    });
 
});

for (let i = 0; i < result.length; i++) {
    const item = result[i];
    let ni = i + 1;
    while (result[ni] && result[ni].id === item.id && result[ni] && result[ni].fbReduced === item.fbReduced && result[ni].deg === item.deg) {
        ni++;
    }
    if (result[ni] && result[ni]?.id === item.id) {
        item.nextDeg = result[ni].deg ?? null;
    }
}

result.forEach(elem => delete elem.fbReduced);

fs.writeFileSync(dataFile, yaml.dump({chords: result}, {
    indent: 4,
    lineWidth: -1,
    sortKeys: true,
    flowLevel: 2,
}));
