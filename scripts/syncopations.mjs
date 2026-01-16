/*
analyse der satzmodelle, die synkopation enthalten in bezug auf figuration (z.b. in terzfalltreppe, romanesca etc)
1. filtern der bassstimme: ist die bassstimme beteiligt an der Syncopatio oder nicht?
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
console.log(sequences)

const Synkopenketten = sequences.sequences.filter(s => s.tags.includes('Synkopenkette'));


// Synkopenkette mit Bassbeteiligung oder ohne Bassbeteiligung

const voicingObj = {}

Synkopenketten.forEach(Syncopatio => {

    // generate an unique id for each syncopatio
    const id = `${Syncopatio.pieceId} ${Syncopatio.startLine}-${Syncopatio.endLine}`;

    voicingObj[id] = {
        Bassbeteiligung: false,
        ohneBassbeteiligung: false,
    };

// wo gibt's im Generalbass "2"? -> Tiefste klingende Stimme ist an Synkopenkette beteiligt
// find out if fbOutput contains "9 3" in the fb figured bass numbers

    const fbOutput = execSync(`cat ${pathToKernScores}${Syncopatio.pieceId}.krn \
        | myank -l ${Syncopatio.startLine}-${Syncopatio.endLine} \
        | extractxx -I '**fb' \
        | fb -cnl \
        | fb -cmn -k 2,3 -b 2 \
        | composite \
        | meter -tLr \
        | extractxx -s 2,3,7,11 \
        | ridxx -LGTMd \
        | ridx -I`).toString().trim();

console.log(fbOutput) 
    const fbRows = fbOutput.split('\n').map(line => line.split('\t')).map((columns) => {
        return {
            meterBeat: columns [0],
            meter: columns [1],
            fb: columns [2],
            fbUpperVoices: columns [3]
        }
    });

    // prüfe, ob Bassbeteiligung besteht oder nicht.
    let Bassbeteiligung = false;
    let ohneBassbeteiligung = false;

    for (let row of fbRows) {
        if (row.meter=== "4/4") {
            if ((row.meterBeat==="1" || row.meterBeat==="3") && row.fb.includes("2")) {
                Bassbeteiligung = true
                voicingObj[id].Bassbeteiligung = true;
            }
            if ((row.meterBeat==="1" || row.meterBeat==="3") && (row.fbUpperVoices.includes("2")|| row.fbUpperVoices.includes("7"))) {
                ohneBassbeteiligung = true
                voicingObj[id].ohneBassbeteiligung = true;
            }
        }
    }

fs.writeFileSync(pathToSyncopationsYaml, yaml.dump({
    voicing: voicingObj,
}, {
    indent: 4,
    lineWidth: -1,
    sortKeys: true,
}));

    /*

    // parse the basslines
    // const bassRows = bassOutput.split('\n').map(line => line.split('\t')).map((columns) => {
    //     return {
    //         note: columns [0],
    //         duration: columns [1],
    //         beat: columns [2]
    //     }
    // }); 



// Alle Sequenzen, die Synkopenketten beinhalten, nach Melodic Interval (mint) filtern.

// prepare an object that uses unique bass figurations as keys and stores the sequence item IDs as values:
/*
{
 //         "+2-2":   [
 //         "op04n02b 150-154",
 //         "op04n02b 161-165",
 //         usw.
//          ],
}
/*
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

    // // parse the figuration intervals
    // const figurationRows = figurationOutput.split('\n').map(line => line.split('\t')).map((columns) => {
    //     return {
    //         interval: columns [0],
    //         duration: columns [1],
    //         beat: columns [2],
    //     }
    // });

    // Ignore first element with the pitch, such as [GG]
    // const figurationRowsWithoutFirstElement = figurationRows.slice(1);
    
    // Example figurationRowsWithoutFirstElement:
    [
        { interval: 'M2', duration: '0.5', beat: '0' },
        { interval: '-m3', duration: '0.5', beat: '0.5' },

   // build pairs of 2 intervals to classify figuration types
    const figurationPairs = [];
    for (let i = 0; i < figurationRowsWithoutFirstElement.length - 1; i++) {
        const firstInterval = figurationRowsWithoutFirstElement[i].interval;
        const secondInterval = figurationRowsWithoutFirstElement[i + 1].interval;
        figurationPairs.push([firstInterval, secondInterval]);
    }
    // classify figuration types based on figuration pairs
    const figurationRowsClassified = figurationPairs.map(pair => {
        const first = pair[0];
        const second = pair[1];
        let figurationType = '';
        if (first === '-2' && second === '+2') {
            figurationType = '-2+2';
        } else if (first === '+2' && second === '-2') {
            figurationType = '+2-2';
        } else if (first === '-2' && second === '-2') {
            figurationType = '-2-2';
        } else if (first === '+2' && second === '+2') {
            figurationType = '+2+2';
        } else if (first === '1' && second === '1') {
            figurationType = '+1+1';
        } else if (first === '-1' && second === '-1') {
            figurationType = '-1-1';
        } else {
            figurationType = 'other';
      
        }
        return {
            pair: pair,
            type: figurationType
        }
    });
  
    // classify figuration types based on figuration pairs pattern
    const figurationPattern = figurationRowsClassified.map(r => {
        return r.type;
    }).join(';');

    // if uniqueFigurations does not yet have a property with figurationPattern as key
    // create a new empty array
    if (!uniqueFigurations[figurationPattern]) {
        uniqueFigurations[figurationPattern] = [];
    }
    
    // add the current syncopatio id to the uniqueFigurations array
    /* uniqueFigurations[figurationPattern].push(id);
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
// fs.writeFileSync(pathToSyncopationsYaml, yaml.dump({
    bassFigurations: sortedUniqueFigurations,
}));
*/ 
});