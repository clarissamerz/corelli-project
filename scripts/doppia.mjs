import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

// prepare the path variables for later use.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pathToCadences = `${__dirname}/../content/cadences`;
const pathToKernScores = `${__dirname}/../corelli-trio-sonatas/kern/`;

// read all .yaml files in content/cadences/*.yaml
const cadenceFiles = fs.readdirSync(pathToCadences).filter(file => file.endsWith('.yaml'));

// prepate an array with all doppie objects
let doppie = [];

for (const file of cadenceFiles) {
    // read cadence file from file system
    const fileContent = fs.readFileSync(path.resolve(pathToCadences, file), 'utf8');
    // convert file content (string) to a JavaScript object
    const cadence = yaml.load(fileContent);
    // filter cadences, we only want doppie
    if (cadence.tags.includes('doppia')) {
        doppie.push(cadence);
    }
}

// prepare an object that uses unique bass strings as keys and stores the
// cadence item IDs as values.
/*
{
    "5;1;5;5;1": [
        "op04n02b 150-154",
        "op04n02b 161-165",
        "op04n02b 213-218",
        // ...
    ],
}
*/
const uniqueBass = {}

// add .splice(0, 1) if you want to test with only 1 doppia
doppie.forEach(cadenzaDoppia => {

    // generate a unique id for each cadence
    const id = `${cadenzaDoppia.pieceId} ${cadenzaDoppia.startLine}-${cadenzaDoppia.endLine}`;

    // Apply humdrum/humlib tools to extract the relevant information from the
    // cadence, such as isolating the score by the cadence’s startLine/endLine,
    // extracting only the bass, removing figured-bass numbers, note durations,
    // manually add the key of the cadence, beat positions, and scale degrees.
    const output = execSync(`cat ${pathToKernScores}${cadenzaDoppia.pieceId}.krn \
        | myank -l ${cadenzaDoppia.startLine}-${cadenzaDoppia.endLine} \
        | extractxx -k1 | extractxx -i '**kern' \
        | ridxx -LGTMd \
        | sed '/^\\*\\*kern$/a\\
*${cadenzaDoppia.key}:' \
        | beat -ca | beatx -fd -u 4 \
        | degx \
        | ridx -I`).toString().trim();

    // example output
/* 
8FL	0.5	0	4
8G	0.5	0.5	5
8A	0.5	1	6
8FJ	0.5	1.5	4
4G	1	2	5
4GG	1	3	5
4C	1	4	1
*/

    // convert this output string to a JS readable array
    // split by new line (=rows), then each line by tab (=columns)
    const rows = output.split('\n').map(line => line.split('\t')).map((columns) => {
        const token = columns[0];
        const duration = columns[1];
        const beat = columns[2];
        const deg = columns[3];
        return {
            token: token,
            duration: duration,
            beat: beat,
            deg: deg,
        }
    });

    // example output
/*
[
  { token: '8FL', duration: '0.5', beat: '0', deg: '4' },
  { token: '8G', duration: '0.5', beat: '0.5', deg: '5' },
  { token: '8A', duration: '0.5', beat: '1', deg: '6' },
  { token: '8FJ', duration: '0.5', beat: '1.5', deg: '4' },
  { token: '4G', duration: '1', beat: '2', deg: '5' },
  { token: '4GG', duration: '1', beat: '3', deg: '5' },
  { token: '4C', duration: '1', beat: '4', deg: '1' }
]
*/

    // make a unique string this only the scale degrees of each 
    const uniqueStrings = rows.map(r => `${r.deg}`).join(';');

    // if uniqueBass does not yet have an property with uniqueStrings as key
    // create a new empty array
    if (!uniqueBass[uniqueStrings]) {
        uniqueBass[uniqueStrings] = [];
    }
    
    // add the current cadence id to the uniqueBass array associated
    // with the corresponding uniqueStrings key.
    uniqueBass[uniqueStrings].push(id);

});

// convert the uniqueBass object into an array of objects, each containing:
// signature, count, and ids. Then sort that array by count (descending).
const sortedUniqueBass = Object.entries(uniqueBass).map((entry) => {
    const signature = entry[0]; // the key
    const ids = entry[1]; // the value (array of cadence ids)

    return {
        signature: signature,
        count: ids.length,
        ids: ids
    };
}).sort((a, b) => {
    return b.count - a.count;
});

console.log(sortedUniqueBass);
