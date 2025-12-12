import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { getIdFromFilename, getFiles } from './utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pathToKernScores = `${__dirname}/../corelli-trio-sonatas/kern/`;
const piecesYamlPath = `${__dirname}/../content/pieces/`;

function parseHumdrumReferenceRecords(humdrum) {
    let lines = humdrum.split(/\r?\n/);
    let output = {};
    for (let i = 0; i < lines.length; i++) {
        const matches = lines[i].match(/^!!!\s*([^:]+)\s*:\s*(.*)\s*$/);
        if (matches) {
            const existingValue = output[matches[1]];
            if (Array.isArray(existingValue)) {
                output[matches[1]].push(matches[2])
            } else if (!Array.isArray(existingValue) && typeof existingValue !== 'undefined') {
                output[matches[1]] = [existingValue, matches[2]]
            } else {
                output[matches[1]] = matches[2];
            }
        }
    }
    return output;
}

function parseHumdrumTandemInterpretation(humdrum, pattern) {
    const lines = humdrum.split(/\r?\n/);
    const results = [];

    for (const line of lines) {
        const match = line.match(pattern);
        if (match) {
            results.push(match[1]);
        }
    }

    return results;
}

execSync(`rm -rf ${piecesYamlPath}`);
execSync(`mkdir -p ${piecesYamlPath}`);

getFiles(pathToKernScores).forEach(file => {
    const id = getIdFromFilename(file);
    console.log(`✅ Extract metadata for ${id}`);

    const kern = fs.readFileSync(file, 'utf8');
    const referenceRecords = parseHumdrumReferenceRecords(kern);

    const key = kern.match(/\*([a-hA-H][\#\-]*):/)?.[1] ?? null;
    const meter = parseHumdrumTandemInterpretation(kern, /\*M(\d+\/\d+)/);
    const config = Object.assign({
        slug: id,
        title: referenceRecords.OTL ?? null,
        largerWorkTitle: referenceRecords.OPR ?? null,
        // movementDesignation: (Array.isArray(referenceRecords.OMD) ? [...new Set(referenceRecords.OMD)].join(' - ') : referenceRecords.OMD) ?? null,
        movementDesignation: [].concat(referenceRecords.OMD || []),
        urlScan: referenceRecords['URL-scan'],
        op: parseInt(referenceRecords.OPS.replaceAll(/\D/g, '')),
        nr: parseInt(referenceRecords.ONM.replaceAll(/\D/g, '')),
        mv: parseInt(referenceRecords.OMV.replaceAll(/\D/g, '')),
        largerWorkTitle: referenceRecords.OPR,
        composer: 'Arcangelo Corelli',
        key,
        meter,
        majorMinor: key === key?.toLowerCase() ? 'minor' : 'major',
    });

    const configFilename = `${id}.yaml`;
    fs.writeFileSync(`${piecesYamlPath}${configFilename}`, yaml.dump(config, {
        indent: 4,
        lineWidth: -1,
        sortKeys: true,
    }));
 
});
