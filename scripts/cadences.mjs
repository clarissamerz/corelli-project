import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { dirname, resolve as pathResolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { romanize } from '../app/utils/romanize.js';
import { getIdFromFilename, getFiles, parseTimepoint } from './utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pathToKernScores = `${__dirname}/../corelli-trio-sonatas/kern`;
const pathToCadenceData = `${__dirname}/../corelli-trio-sonatas/cadences.yaml`;
const pathToCadences = `${__dirname}/../content/cadences`;

const cadencesYaml = yaml.load(fs.readFileSync(pathToCadenceData, 'utf8').toString());

if (fs.existsSync(pathToCadences)) {
    fs.rmSync(pathToCadences, { recursive: true, force: true });
}
fs.mkdirSync(pathToCadences);

getFiles(pathToKernScores).forEach(file => {
    const id = getIdFromFilename(file);


    const pieceCadences = cadencesYaml[id];

    if (!pieceCadences || pieceCadences.length === 0) {
        console.warn(`❌ No cadences found for ${id}`);
        return;
    }
    
    console.log(`✅ Cadences found for ${id}`);

    const kern = execSync(`cat ${file} | lnnr | beat -ca | meter | degx --resolve-null -t`).toString().trim();

    const newCadences = pieceCadences.map(([a, b, tags]) => ({
        tags: tags == null ? [] : [].concat(tags),
        pieceId: id,
    }));

    pieceCadences.forEach((pieceCadence, cadenceIndex) => {
        const [startPoint, endPoint] = pieceCadence;
        const start = parseTimepoint(startPoint);
        const end = parseTimepoint(endPoint);

        const kernLines = kern.split('\n');
        let currentMeasure = null;
        let currentKey = null;
        let currentBeat = null;
        let currentLineNumber = null;
        let currentAbsb = null;
        let currentBassScaleDegree = null;
        let pieceKey = null;
        const headerCols = [];

        for (let i = 0; i < kernLines.length; i++) {
            const line = kernLines[i];
            const tokens = line.split('\t');
        
            if (line.startsWith('**')) {
                headerCols.push(...tokens);
            }

            // Detect current measure number (=N)
            const measureMatch = line.match(/^=(\d+)/);
            if (measureMatch) {
                currentMeasure = parseInt(measureMatch[1], 10);
            }

            // Detect current line number (does not match i because humlib programms can add lines)
            currentLineNumber = null;
            for (let j = 0; j < tokens.length; j++) {
                const header = headerCols[j];
                if (!header || !header.includes('**lnnr')) continue;
                const v = tokens[j]?.trim();
                if (v && v !== '.' && !v.startsWith('*') && !v.startsWith('!') && !v.startsWith('=')) {
                    currentLineNumber = parseInt(v, 10);
                    break;
                }
            }

            // Detect current beat (meter -f)
            currentBeat = null;
            for (let j = 0; j < tokens.length; j++) {
                const header = headerCols[j];
                if (!header || !header.includes('**cdata-beat')) continue;
                const v = tokens[j]?.trim();
                if (v && v !== '.' && !v.startsWith('*') && !v.startsWith('!') && !v.startsWith('=')) {
                    currentBeat = v;
                    break;
                }
            }

            // Detect current changes (e.g. *E-:)
            const keyMatch = line.match(/\*([A-Ha-h\#\-]+):/);
            if (keyMatch) {
                currentKey = keyMatch[1];
                if (pieceKey === null) {
                    pieceKey = currentKey;
                }
            }

            // Detect toatal beat count from beginning of piece (beat -ca)
            currentAbsb = null;
            for (let j = 0; j < tokens.length; j++) {
                const header = headerCols[j];
                if (!header || !header.includes('**absb')) continue;
                const v = tokens[j]?.trim();
                if (v && v !== '.' && !v.startsWith('*') && !v.startsWith('!') && !v.startsWith('=')) {
                    currentAbsb = parseInt(v, 10);
                    break;
                }
            }

            currentBassScaleDegree = null;
            for (let j = 0; j < tokens.length; j++) {
                const header = headerCols[j];
                if (!header || !header.includes('**deg')) continue;
                const v = tokens[j]?.trim();
                if (v && v !== '.' && !v.startsWith('*') && !v.startsWith('!') && !v.startsWith('=')) {
                    currentBassScaleDegree = v;
                    break;
                }
            }

            if (currentMeasure === start.measure && currentBeat === start.beat) {
                newCadences[cadenceIndex].startLine = currentLineNumber;
                newCadences[cadenceIndex].startBeat = currentAbsb;
            }
            
            if (currentMeasure === end.measure && currentBeat === end.beat) {
                newCadences[cadenceIndex].endLine = currentLineNumber;
                newCadences[cadenceIndex].endBeat = currentAbsb;
                newCadences[cadenceIndex].key = currentKey;
                newCadences[cadenceIndex].endBassDeg = currentBassScaleDegree;

                const degScore = `**kern
*${pieceKey}:
1${currentKey.toLowerCase()}`;

                const stdout = execSync(`echo "${degScore}" | degx | extractxx -i deg | ridx -I`).toString().trim();
                let deg = romanize(stdout);
                deg = currentKey === currentKey.toLowerCase() ? deg.toLowerCase() : deg.toUpperCase();
                newCadences[cadenceIndex].deg = deg;
            }
        }

    });

    newCadences.filter(c => c.pieceId).forEach(cadence => {
        if (cadence.startBeat > cadence.endBeat) {
            throw new Error(`❌ ${cadence.pieceId}-${cadence.startBeat}-${cadence.endBeat} has wrong start and end annotation`);
        }
        const slug = `${cadence.pieceId}-${cadence.startBeat}-${cadence.endBeat}`;
        if (['.', '+', '/'].some(v => slug.includes(v))) {
            throw new Error(`❌ ${cadence.pieceId}-${cadence.startBeat}-${cadence.endBeat} has a bad slug`);
        }
        fs.writeFileSync(pathResolve(pathToCadences, `${slug}.yaml`), yaml.dump({...cadence, slug}, {
            indent: 4,
            lineWidth: -1,
            sortKeys: true,
        }));
    });

});
