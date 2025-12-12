import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import yaml from 'js-yaml';
import { getFiles } from './utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pieces = getFiles(`${__dirname}/../content/pieces`).map(file => {
    return yaml.load(fs.readFileSync(file, 'utf8'));
});

const meterOptions = [...new Set(pieces.flatMap(piece => piece.meter ?? []))].sort((a, b) => {
    const [numA, denA] = a.split('/').map(Number);
    const [numB, denB] = b.split('/').map(Number);
    return denA - denB || numA - numB;
});
const keyOptions = [...new Set(pieces.map(piece => piece.key).filter(Boolean))].sort((x, y) => {
    const weight = n => {
        const base = n[0].toLowerCase();
        // c=0, d=1, e=2, f=3, g=4, a=5, b=6, h=7
        let w;
        if (base >= 'c' && base <= 'g') w = base.charCodeAt(0) - 'c'.charCodeAt(0);
        else if (base === 'a') w = 5;
        else if (base === 'b') w = 6;
        else if (base === 'h') w = 7;

        if (n.includes('-')) w -= 0.5; // flat
        if (n.includes('#')) w += 0.5; // sharp
        
        if (n[0] === n[0].toUpperCase()) w -= 0.25;
        
        return w;
    };
    return weight(x) - weight(y);
});
const titleOptions = [...new Set(pieces.map(piece => piece.title).filter(Boolean))].sort();
const tempoOptions = [...new Set(pieces.flatMap(piece => piece.movementDesignation ?? []))].sort();
const opOptions = [...new Set(pieces.map(piece => piece.op).filter(Boolean))];
const nrOptions = [...new Set(pieces.map(piece => piece.nr).filter(Boolean))];

const json = {
    meterOptions,
    keyOptions,
    titleOptions,
    tempoOptions,
    opOptions,
    nrOptions,
};

console.log(json);

fs.writeFileSync(`${__dirname}/../app/utils/piece-filter-options.json`, JSON.stringify(json, null, '\t'), 'utf8');
