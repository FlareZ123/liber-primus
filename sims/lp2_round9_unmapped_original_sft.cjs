/**
 * Round9 image-template audit of independently derived GP glyph classes.
 *
 * Windows 11 / Node.js 22, CommonJS, no dependencies. Reads canonical local
 * source and the source-pinned external Stage2 JSON; never edits source files.
 * Confirms the exact 57 otherwise omitted glyph sites and two punctuation
 * disagreements against the original JP(E)G-backed main transcription.
 *
 * Source: Dukotah/cicada3301 commit 9087dc36b5aa64c1786428e32180261ab9420c29
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const RUNES = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const RUNE_MAP = new Map(RUNES.map((r, i) => [r, i]));
const RUNE_SET = new Set(RUNES);
const SOURCE_SHA = '9087dc36b5aa64c1786428e32180261ab9420c29';
const BASE = 'https://raw.githubusercontent.com/Dukotah/cicada3301/' +
    SOURCE_SHA + '/liber-primus/';
const EXTERNAL_RETRANSCRIBE = BASE + 'analysis/retranscribe/';

/**
 * @template T
 * @param {string} url
 * @returns {Promise<T>}
 */
async function fetchJSON(url) {
    const res = await fetch(url);
    assert.equal(res.status, 200, 'Pinned source unavailable: ' + url);
    return /** @type {Promise<T>} */ (res.json());
}

/**
 * @param {string} content
 * @returns {number[][]}
 */
function canonicalLines(content) {
    return content.split('%').flatMap(section =>
        section.split('/').map(line =>
            [...line].filter(ch => RUNE_SET.has(ch)).map(ch => RUNE_MAP.get(ch))
        ).filter(line => line.length > 0)
    );
}

/**
 * @param {string} content
 * @returns {{runes: string, separators: string[]}}
 */
function separateRuneStream(content) {
    let runes = '';
    let text = '';
    /** @type {string[]} */
    const separators = [];
    for (const ch of content) {
        if (RUNE_SET.has(ch)) {
            runes += ch;
            separators.push(text);
            text = '';
        } else {
            text += ch;
        }
    }
    separators.push(text);
    return { runes, separators };
}

/**
 * @typedef {{page:number,band:number,glyphs:[number,number,number][]}} SourceBand
 * @param {SourceBand[]} original
 * @param {number[][]} canon
 * @returns {[number,number][]}
 */
function alignExactLines(original, canon) {
    const na = original.length;
    const nb = canon.length;
    const width = nb + 1;
    const inf = 1000000000;
    const dp = new Int32Array((na + 1) * width).fill(inf);
    const back = new Int8Array((na + 1) * width);
    dp[0] = 0;

    /** @param {number} x @param {number} y @param {number} score @param {number} action */
    function update(x, y, score, action) {
        const index = x * width + y;
        if (score < dp[index]) {
            dp[index] = score;
            back[index] = action;
        }
    }

    for (let i = 0; i <= na; i++) {
        for (let j = 0; j <= nb; j++) {
            const cost = dp[i * width + j];
            if (cost === inf) continue;
            if (i < na && j < nb) {
                update(i + 1, j + 1,
                    cost + Math.abs(original[i].glyphs.length - canon[j].length), 1);
            }
            if (i < na) update(i + 1, j, cost + 15, 2);
            if (j < nb) update(i, j + 1, cost + 15, 3);
        }
    }

    let i = na;
    let j = nb;
    /** @type {[number,number][]} */
    const exact = [];
    while (i !== 0 || j !== 0) {
        const action = back[i * width + j];
        if (action === 1) {
            if (original[i - 1].glyphs.length === canon[j - 1].length) {
                exact.push([i - 1, j - 1]);
            }
            i--;
            j--;
        } else if (action === 2) {
            i--;
        } else {
            assert.equal(action, 3, 'Broken external line-count alignment');
            j--;
        }
    }
    exact.reverse();
    return exact;
}

async function main() {
    const transcriptPath = path.join(ROOT, 'resources', 'liber-primus', 'lp2-transcription.txt');
    const canonical = fs.readFileSync(transcriptPath, 'utf8').replace(/\r\n/g, '\n');
    const [sourceLines, diffReport, externalTranscription] = await Promise.all([
        fetchJSON(EXTERNAL_RETRANSCRIBE + 'read_lines.json'),
        fetchJSON(EXTERNAL_RETRANSCRIBE + 'diff_report.json'),
        fetch(BASE + 'data/krisyotam_runes.txt').then(async res => {
            assert.equal(res.status, 200, 'Pinned external transcript unavailable');
            return res.text();
        })
    ]);

    const lines = canonicalLines(canonical);
    const source = /** @type {SourceBand[]} */ (sourceLines);
    console.log('Canonical lines:', lines.length, 'External image bands:', source.length);
    assert.equal(lines.length, 604);
    assert.equal(source.length, 646);

    const exact = alignExactLines(source, lines);
    assert.equal(exact.length, 232);
    const mapping = diffReport.mapping;
    let matches = 0;
    let mappedDisagreements = 0;
    /** @type {string[]} */
    const omitted = [];
    const classes = {};
    for (const [bandIndex, lineIndex] of exact) {
        const line = source[bandIndex];
        const expected = lines[lineIndex];
        for (let k = 0; k < expected.length; k++) {
            const [id, x, cost] = line.glyphs[k];
            const assigned = mapping[String(id)];
            if (assigned === undefined) {
                const rune = RUNES[expected[k]];
                omitted.push([
                    line.page, line.page + 17, bandIndex,
                    lineIndex, k, id, x, cost, rune
                ].join('\t'));
                const key = id + '->' + rune;
                classes[key] = (classes[key] || 0) + 1;
            } else if (assigned === expected[k]) {
                matches++;
            } else {
                mappedDisagreements++;
            }
        }
    }
    console.log('Exact aligned lines:', exact.length);
    console.log('Matching assigned classes:', matches);
    console.log('Mapped mismatches:', mappedDisagreements);
    console.log('Unassigned class sites:', omitted.length);
    console.log('Unassigned class→rune counts:', JSON.stringify(classes));
    assert.equal(matches, 5047);
    assert.equal(mappedDisagreements, 103);
    assert.equal(omitted.length, 57);
    assert.deepEqual(classes, { '31->ᚱ': 55, '31->ᚠ': 1, '0->ᛞ': 1 });
    assert.equal(matches + mappedDisagreements + omitted.length, 5207);

    const header = 'physical_page\tarchive_jpg\timage_band\tcanonical_global_line\t' +
        'rune_index_in_line\tunmapped_class\tx_px\tcost\tcanonical_rune';
    const preserved = fs.readFileSync(
        path.join(ROOT, 'im-results', 'lp2-round9-unmapped-source-sites.tsv'), 'utf8'
    ).trimEnd();
    assert.deepEqual(preserved.replace(/\r\n/g, '\n').split('\n').sort(),
        [header, ...omitted].sort());
    console.log('Preserved 57-row original-page coordinate manifest: exact match');


    const floralHeader = 'physical_page\tarchive_jpg\timage_band\tcanonical_page_line\t' +
        'rune_index_in_line\tx_px\timage_class\tpixel_cost\tline_mean_cost\t' +
        'canonical_rune\timage_class_assignment';
    const floralRows = [];
    const knownGlobalPairs = new Set(exact.map(([a, b]) => source[a].band + '/' + b));
    let sectionsOffset = 0;
    let rescuedExact = 0;
    let rescuedNew = 0;
    let rescuedMatched = 0;
    let rescuedWrong = 0;
    let rescuedUnmapped = 0;
    let highCostLines = 0;
    const originalSections = canonical.split('%');
    for (let p = 0; p < 49; p++) {
        const sectionLines = canonicalLines(originalSections[p]);
        if (p >= 40) {
            const physical = source.filter(line => line.page === p);
            const cropped = physical.map(line => ({
                ...line,
                glyphs: line.glyphs.filter(g => g[1] >= 580 && g[1] <= 1800)
            }));
            const rescued = alignExactLines(cropped, sectionLines);
            console.log('Floral p' + p + ': cropped exact lines ' + rescued.length +
                '/' + sectionLines.length);
            rescuedExact += rescued.length;
            for (const [a, b] of rescued) {
                const row = cropped[a];
                if (!knownGlobalPairs.has(row.band + '/' + (sectionsOffset + b))) {
                    rescuedNew++;
                }
                const original = sectionLines[b];
                const mean = Math.round(row.glyphs.reduce((sum, g) => sum + g[2], 0) /
                    row.glyphs.length);
                if (mean > 300) highCostLines++;
                for (let k = 0; k < original.length; k++) {
                    const [id, x, cost] = row.glyphs[k];
                    const mapped = mapping[String(id)];
                    if (mapped === original[k]) {
                        rescuedMatched++;
                        continue;
                    }
                    if (mapped === undefined) {
                        rescuedUnmapped++;
                    } else {
                        rescuedWrong++;
                    }
                    floralRows.push([
                        p, p + 17, row.band, b, k, x, id, cost, mean,
                        RUNES[original[k]], mapped === undefined ? 'UNMAPPED' : RUNES[mapped]
                    ].join('\t'));
                }
            }
        }
        sectionsOffset += sectionLines.length;
    }
    assert.equal(rescuedExact, 82);
    assert.equal(rescuedNew, 79);
    assert.equal(rescuedMatched, 1801);
    assert.equal(rescuedWrong, 30);
    assert.equal(rescuedUnmapped, 34);
    assert.equal(highCostLines, 6);
    assert.equal(floralRows.length, 64);
    const floralFile = fs.readFileSync(path.join(ROOT, 'im-results',
        'lp2-round9-floral-text-crop-disagreement-sites.tsv'), 'utf8').trimEnd();
    assert.deepEqual(floralFile.replace(/\r\n/g, '\n').split('\n').sort(),
        [floralHeader, ...floralRows].sort());
    console.log('Floral source-column recovery: 82 exact lines, 79 additional band/line pairs');
    console.log('Floral image identities: 1801 matches, 30 mapped mismatches, 34 unlabeled');
    console.log('All 64 original-image disagreements: pinned coordinate manifest exact match');

    const our = separateRuneStream(canonical);
    const other = separateRuneStream(externalTranscription);
    assert.equal(our.runes, other.runes, 'Rune identity stream differs from external copy');
    assert.equal(our.runes.length, 13136);
    const separatorDifferences = [];
    for (let i = 0; i < our.separators.length; i++) {
        if (our.separators[i] !== other.separators[i]) {
            separatorDifferences.push({
                beforeRune: i, canonical: our.separators[i], external: other.separators[i]
            });
        }
    }
    assert.deepEqual(separatorDifferences.map(v => v.beforeRune), [1886, 9648]);
    assert.deepEqual(separatorDifferences.map(v => v.canonical), ['.', '.']);
    assert.deepEqual(separatorDifferences.map(v => v.external), ['-', '-']);
    console.log('Rune stream identical across 13,136 originals');
    console.log('Non-rune punctuation differences:', JSON.stringify(separatorDifferences));
    console.log('PASS: original-image map, 57 missing classes, 82 restored floral lines and two punctuation boundaries');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
