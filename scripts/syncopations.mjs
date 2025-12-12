/*
analyse der satzmodelle, die synkopation enthalten in bezug auf figuration (z.b. in terzfalltreppe, romanesca etc)
1. filtern der bassstimme in bezug auf "mint" (melodic interval) (oder auf scale degrees: deg)
2. syncopatio filtern: lösch bassstimme raus, manche partituren haben 4 st. manche 3
    intervallsatz mit fb (figured bass) programm erstellen lassen (wozu dieser schritt?)
    https://doc.verovio.humdrum.org/filter/fb/ unter options kann ich mir anschauen, was es gibt
3. figurationen in syncopatio filtern oder gesondert analysieren (typischste figuration ist blabla)
*/

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pathToKernScores = `${__dirname}/../corelli-trio-sonatas/kern/`;
const pathToSequences = `${__dirname}/../content/sequences.yaml`;
const pathToSyncopationsYaml = `${__dirname}/../content/syncopations.yaml`;

const sequencesAsString = fs.readFileSync(pathToSequences, 'utf8').toString();

const sequences = yaml.load(sequencesAsString);

const Synkopenketten = sequences.sequences.filter(s => s.tags.includes('Synkopenkette'));

// 1. Alle Sequenzen, die Synkopenketten beinhalten, nach Melodic Interval (mint) filtern.


// prepare an object that uses unique bass figurations as keys and stores the sequence item IDs as values:
/*
{
 //         "scaleup, thirddown":   [
 //         "op04n02b 150-154",
 //         "op04n02b 161-165",
 //         usw.
//          ],
}
*/

const uniqueFigurations = {}

Synkopenketten.forEach(Syncopatio => {

    // generate a unique id for each syncopatio
    const id = `${Syncopatio.pieceId} ${Syncopatio.startLine}-${Syncopatio.endLine}`;

    // Apply humdrum/humlib tools to extract the relevant information from the
    // syncopatio, such as isolating the score by the syncopatio’s startLine/endLine,
    // extracting only the bass, removing figured-bass numbers, note durations,
    // manually add the key of the syncopatio, beat positions, and melodic intervals.
    const figurationOutput = execSync(`cat ${pathToKernScores}${Syncopatio.pieceId}.krn \
        | myank -l ${Syncopatio.startLine}-${Syncopatio.endLine} \
        | extractxx -k1 | extractxx -i '**kern' \
        | ridxx -LGTMd \
        | sed '/^\\*\\*kern$/a\\
*${Syncopatio.key}:' \
        | beat -ca | beatx -fd -u 4 \
        | mint -d \
        | ridx -I`).toString().trim();

    // parse the figuration intervals
    const figurationRows = figurationOutput.split('\n').map(line => line.split('\t')).map((columns) => {
        return {
            interval: columns [0],
            duration: columns [1],
            beat: columns [2],
        }
    });
    // Ignore first element with the pitch, such as [GG]
    const figurationRowsWithoutFirstElement = figurationRows.slice(1);
    // classify figuration types based on interval patterns
    const figurationPattern = figurationRowsWithoutFirstElement.map(r => {
        return r.interval;
    }).join(';');
 
    // if uniqueFigurations does not yet have a property with figurationPattern as key
    // create a new empty array
    if (!uniqueFigurations[figurationPattern]) {
        uniqueFigurations[figurationPattern] = [];
    }
    
    // add the current syncopatio id to the uniqueFigurations array
    uniqueFigurations[figurationPattern].push(id);

})

//convert the uniqueFigurations object into a sorted array for better readability then
//sort by count descending
const sortedUniqueFigurations = Object.entries(uniqueFigurations).map((entry) => {
    const signature = entry[0];
    const ids = entry[1];
    return {
        signature: signature,
        count: ids.length,
        ids: ids
    };
}).sort((a, b) => b.count - a.count);

// Filter to only show patterns with exactly 2 elements
const twoPatternFigurations = sortedUniqueFigurations.filter(entry => {
    const patternParts = entry.signature.split(';').length;
    return patternParts === 2;
});

//convert the twoPatternFigurations object into a sorted array for better readability then
//sort by count descending
const sortedTwoPatternFigurations = Object.entries(twoPatternFigurations).map((entry) => {
    const signature = entry[0];
    const ids = entry[1];
    return {
        signature: signature,
        count: ids.length,
        ids: ids
    };
}).sort((a, b) => b.count - a.count);

// Output the sorted unique figuration patterns

console.log(sortedUniqueFigurations);

fs.writeFileSync(pathToSyncopationsYaml, yaml.dump({
    bassFigurations: sortedUniqueFigurations,
}));
