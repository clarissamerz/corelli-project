/*
analyse der satzmodelle, die synkopation enthalten in bezug auf figuration (z.b. in terzfalltreppe, romanesca etc)
1. filtern der bassstimme: ist die bassstimme beteiligt an der Syncopatio oder nicht?
2. syncopatio filtern: lösch bassstimme raus, manche partituren haben 4 st. manche 3
    intervallsatz mit fb (figured bass) programm erstellen lassen (wozu dieser schritt?)
    https://doc.verovio.humdrum.org/filter/fb/ unter options kann ich mir anschauen, was es gibt
3. figurationen in syncopatio filtern oder gesondert analysieren (typischste figuration ist blabla)
// https://extras.humdrum.org/man/extractx/
*/

// Nutze die Funktion "import from", um verschiedene Inhalte zu laden.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

// Erstelle eine Konstante, die den absoluten Pfad des gesamten Projektes aufruft
const __dirname = dirname(fileURLToPath(import.meta.url));

// Erstelle Konstanten, die die absoluten Pfade von spezifischen Dateien im Projekt aufrufen
const pathToSequences = `${__dirname}/../content/sequences.yaml`;
const pathToKernScores = `${__dirname}/../corelli-trio-sonatas/kern/`;
const pathToSyncopationsYaml = `${__dirname}/../content/syncopations.yaml`;

// Erstelle eine Konstante, die mit der Funktion .readFileSync die Datei liest und mithilfe der Funktion .toString den Inhalt der Datei als String ausgibt
const sequencesAsString = fs.readFileSync(pathToSequences, 'utf8').toString();

// Erstelle eine Konstante, die mithilfe der Funktion .load die Inhalte des oben angelegten Strings ausgibt
const sequences = yaml.load(sequencesAsString);

// Erstelle eine Konstante, die mithilfe der Funktion .filter festgelegte Tags aus der YAML-Datei (sequences.yaml) filtert (hier unter der Bedingung, dass das Wort 'Synkopenkette' beinhaltet ist)
const Syncopatio = sequences.sequences.filter(s => s.tags.includes('Synkopenkette'));


// Erstelle eine Konstante, die erst später befüllt wird.
const voicingObj = {}

/* Mit der folgenden Schleife werden die Stellen, die Synkopenketten beinhalten, daraufhin überprüft, ob der Bass an der Synkopenkette beteiligt ist oder nicht.
1.1 Dafür wird für jede Synkopenkette eine spezifische id erstellt, also eine Bezeichnung, die die Opuszahl, die Werknummer und die Takte angibt. Bsp: op04n12a_78-95.
1.2 Außerdem legen wir die Konstante voicingObj darauf fest, dass sie die id der Synkopenkette nennt, und unter bassInvolved "false" ausgibt, sowie unter bassNotInvolved auch.
2.1 Mithilfe von Humdrum werden nun die Noten generiert und analyisiert. Ziel ist es, nur die Takte darzustellen, die die Synkopenketten beinhalten. Außerdem 
sollen die Noten so aufbereitet sein, dass man sie sinnvoll filtern kann. An dieser Stelle soll das Script ausgeben, wann die Generalbassbezifferungen eine "2" enthalten.
Auf diese Weise lässt sich feststellen, ob der Bass beteiligt ist, oder nicht.
2.2. Damit das Ganze besser lesbar ist, wird der String aufgeteilt und mit Kategorien benannt.
Bsp: { meterBeat: '3', meter: '3/4', fb: '6 3', fbUpperVoices: '4' }. 
3. Bassbeteiligung prüfen.
*/
Syncopatio.forEach(syncopatio => {

    // 1.1 Erstelle eine Konstante, die nach einem bestimmten Schema jeder Synkopenkette ihre eigene id zuweist. Dafür werden die Tags aus sequences.yaml bezogen.
    const id = `${syncopatio.pieceId}_${syncopatio.startBeat}-${syncopatio.endBeat}`;
    console.log(id)
    // 1.2 Lege nun mithilfe der id die Struktur für die Konstante voicingObj an.
    voicingObj[id] = {
        bassInvolved: false,
        bassNotInvolved: false,
    };

    /* 2.1 Erstelle eine Konstante, die die Kern-Datei der jeweligen Synkopenkette aufruft.
    Speichere den Inhalt mithilfe der Funktion .toString in einen String.
    */

    const fbOutput = execSync(`cat ${pathToKernScores}${syncopatio.pieceId}.krn \
        | myank -l ${syncopatio.startLine}-${syncopatio.endLine} \
        | extractxx -I '**fb' \
        | fb -cnl \
        | fb -cmn -k 2,3 -b 2 \
        | composite \
        | meter -tLr \
        | extractxx -s 2,3,7,11 \
        | ridxx -LGTMd \
        | ridx -I`).toString().trim();
    // 2.2 Erstelle nun eine Konstante, die den oben erstellten String aufteilt und den jeweiligen Unterstrings bestimmte Spalten der gefilterten Kern-Datei zuweist. (0 ist die erste Spalte)
    const fbRows = fbOutput.split('\n').map(line => line.split('\t')).map((columns) => {
        return {
            meterBeat: columns [0],
            meter: columns [1],
            fb: columns [2],
            fbUpperVoices: columns [3]
        }
    });
console.log(fbRows)
    /* 3. In dieser Schleife werden die Konstanten bassInvolved und bassNotInvolved als Booleans auf "false" festgelegt. 
    Dann wird mit for if überprüft, was die einzelnen Tags der fbRows beinhalten. Hier werden in der ersten Schleife nur diejenigen Synkopenketten untersucht,
    die in Takten mit der Taktart 4/4 vorkommen. Ist diese Bedingung erfüllt, wird überprüft, ob auf den Zählzeiten 1 und 3 die Generalbassbezifferung "2" vorkommt.
    Ist dies der Fall, wird (das ist dann das gedachte "then" von "if then") der Boolean bassInvolved auf "true" gesetzt und dieses Ergebnis in das voicingObj gepusht/gespeichert. */
    let bassInvolved = false;
    let bassNotInvolved = false;

    for (let row of fbRows) {
        if (row.meter=== "4/4") {
            if ((row.meterBeat==="1" || row.meterBeat==="3") && row.fb.includes("2")|| row.fb.includes("7")) {
                bassInvolved = true
                voicingObj[id].bassInvolved = true;
            }
            if ((row.meterBeat==="1" || row.meterBeat==="3") && (row.fbUpperVoices.includes("2")|| row.fbUpperVoices.includes("7"))) {
                bassNotInvolved = true
                voicingObj[id].bassNotInvolved = true;
            }
        }
        if (row.meter== "3/4") {
            if ((row.meterBeat==="1") && (row.fb.includes("2")|| row.fb.includes("7"))) {
                bassInvolved = true
                voicingObj[id].bassInvolved = true;
            }
            if ((row.meterBeat==="1") && (row.fbUpperVoices.includes("2")|| row.fbUpperVoices.includes("7"))) {
                bassNotInvolved = true
                voicingObj[id].bassNotInvolved = true;
            }
        }
        if (row.meter=== "2/2") {
            if (row.fb.includes("2")) {
                bassInvolved = true
                voicingObj[id].bassInvolved = true;
            }
            if ((row.fbUpperVoices.includes("2")|| row.fbUpperVoices.includes("7"))) {
                bassNotInvolved = true
                voicingObj[id].bassNotInvolved = true;
            }
        }

    }
    console.log('bassNotInvolved',bassNotInvolved)
    console.log('bassInvolved',bassInvolved)

    /* In syncopations.yaml werden nun die Ergebnisse gespeichert. Wenn beide Booleans false ergeben, deutet das
    darauf hin, dass das Stück nicht im 4/4-Takt steht, die Voraussetzung also nicht erfüllt sind, um in die Schleife zu gehen
    Es gibt hier einen Sonderfall: op04n10d_21-34 hat bei beiden Booleans "true" stehen. Das liegt daran, dass es eine Stelle gibt,
    an der mit der Bassstimme und der Synkopenkette in den Oberstimmen ein Sekundakkord entsteht. RIP.  */

fs.writeFileSync(pathToSyncopationsYaml, yaml.dump({
    voicing: voicingObj,
}, {
    indent: 4,
    lineWidth: -1,
    sortKeys: true,
}));

//21.1.26: "2 Viertel Gruppen prüfen. Nach dieser Viertelgruppe kann der Bass zum nächsten Basston mit folgenden Möglichkeiten fortschreiten."

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

//{
 //         "+2-2":   [
 //         "op04n02b 150-154",
 //         "op04n02b 161-165",
 //         usw.
//          ],
//}
/*
const uniqueFigurations = {}

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
    
    // Example figurationRowsWithoutFirstElement:
    //[
        // { interval: 'M2', duration: '0.5', beat: '0' },
        // { interval: '-m3', duration: '0.5', beat: '0.5' },

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