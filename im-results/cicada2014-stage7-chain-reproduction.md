# 2014 Stage 7 signed-hex → Interconnectedness → OpenPuff reproduction

**Status: complete as a composite, exact-byte reproduction (20 November 2026). Historical control only; no LP2 cipher inference.**

## Reproduced chain

The chain is established across two native Windows runs joined by the exact MP3 Git blob hash. It is not necessary for every stage to execute in one workflow: the output of the signed-hex stage is byte-identical to the input of the successful OpenPuff stage.

### 1. Signed page → hexadecimal payload → MP3

[Run 44708710753](https://github.com/FlareZ123/liber-primus/actions/runs/44708710753) verifies the original clear-signed Stage 7 page with GnuPG under Cicada fingerprint:

`6D854CD7933322A601C3286D181F01E57A35090F`

The verified page is 13,526,359 bytes with Git blob SHA-1 `afb1ae7b8ffe2def6d1cd7a2f7ce961e550331b9`. Its 13,303,746 hexadecimal characters decode to an MP3 with:

- Size: **6,651,873 bytes**
- Git blob SHA-1: **`09fe068192b76a3697c47ec1d604b527703db798`**
- The decoded MP3 matches both pinned Stage 7 archive copies byte-for-byte.

The two community archives are pinned at `cijhho123/cicada3301` commit `d360ad97d39c4719e42dc88b0cbbb81ed54aa02c` and `scream314/cicada3301` commit `10733feb487bb8beb9966d534727ee5897aa54fc`. Their copied files are useful byte controls, not independent first-party witnesses; the PGP signature authenticates the signed page content.

### 2. MP3 → OpenPuff → exact squares

[Run 43662139707](https://github.com/FlareZ123/liber-primus/actions/runs/43662139707), Windows job `positive-control (33011033)`, successfully runs the original OpenPuff v4.00 tool against the archived 2014 Interconnectedness MP3. The workflow verifies that input independently:

- Pinned source: `iBotPeaches/cicada_3301` commit `a0a616d85717af59f8b806875b43d51e06e1e874`
- Size: **6,651,873 bytes**
- Git blob SHA-1: **`09fe068192b76a3697c47ec1d604b527703db798`**
- MD5: **`7638414d35f416084b7ddcc94aa53685`**

This is the exact MP3 produced in step 1.

The original OpenPuff v4.00 files are pinned from `codejanus/ToolSuite` commit `1eaf6d006d31ba842f6cc6b16e9d82dbf904aaf5` and verified by Git blob SHA-1:

| File | Git blob SHA-1 |
|---|---|
| `OpenPuff.exe` | `466e03c792075313ce533a5dc7a789e8a41209f9` |
| `libObfuscate.dll` | `f3b1c3315f8286346416fefd6141410f422f2454` |
| `OpenPuff_license.txt` | `b0bab97d3c9906caada26fbb890a2a6fe028baa4` |

The executable reports PE file version **4.0.0.0**. The successful native settings are:

- Password A: **`33011033`**
- Passwords B and C: disabled
- Carrier: the 2014 Interconnectedness MP3
- Bit format: `Mp3 (Audio)`
- Bit selection: `Maximum (1/2)` (50%)

OpenPuff recovered the exact `magicsquares.txt`:

- Size: **745 bytes**
- SHA-256: **`9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f`**
- OpenPuff-native CRC32: **`6A8C41E3`**
- The extracted bytes are identical to `resources/cicada2014-openpuff-magic-squares.txt`.

Use the OpenPuff-native CRC, not zlib's standard CRC32: for these exact bytes zlib gives `5E547914`, while the OpenPuff-native MSB-first checksum gives the historical `6A8C41E3`. The exact successful output and original GUI evidence are preserved in [artifact 14141021011](https://github.com/FlareZ123/liber-primus/actions/runs/43662139707/artifacts/14141021011).

The alternate `33011103` matrix job failed at a file-picker stage before extraction. It is **untested**, not a password rejection. The successful `33011033` run is sufficient for the source-documented Stage 7 route.

### 2a. Passphrase answer and serialization audit (#3332)

The password is a real OpenPuff A-field input, not an answer submitted in a URL or web form. The contemporaneous [2014 Stage 7 transcript, Part 8](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_8) records A=`33011033`, B/C disabled, the Interconnectedness MP3, and the recovered `magicsquares.txt`. The preceding [Part 7 transcript](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_7) lists the portrait's two partial columns: left `181, 7, 15, 16, 456, 351, 7` (sum **1033**, seven entries) and right `966, 1071, 626, 204, 434` (sum **3301**, five entries). The 2014 log identifies these as a 7×7 square's first column and a 5×5 square's last column. Direct summation confirms 1033 and 3301.

The exact extracted payload in `resources/cicada2014-openpuff-magic-squares.txt` is ordered 5×5, 7×7, 5×5, with magic constants 3301, 1033, 1033. The strongest source-constrained solve-path reconstruction is therefore to serialize the two visible partial-square constants in square order—5×5 first, then 7×7—rather than portrait left-to-right: `3301 || 1033 = 33011033`. The receiver consumes the eight ASCII digit bytes `33 33 30 31 31 30 33 33` in Password A. This is a real, independently reproduced passphrase handoff; the answer-to-passphrase derivation is a strong reconstruction, not an explicit first-party instruction. The signed page authenticates the MP3 bytes, while the portrait is a later onion-page image and the transcript/archive are community records; the contemporaneous transcript records the password use, not why that ordering was chosen.

The natural portrait left-to-right alternative is `10333301`; the competing transcription `33011103` is also not the concatenation of the two documented constants. Neither alternative has a completed native rejection: the prior `33011103` matrix job stopped at the file-picker stage, and the new manual workflow matrix now includes both `10333301` and `33011103` but was not dispatched in this invocation. Do not describe either as a tested negative. The recovered square order and the explicit signed-page `3301` support the chosen `3301 || 1033` order, but a native wrong-password control remains open.

### 3. Exact ordered 99-number stream

[Run 44806886086](https://github.com/FlareZ123/liber-primus/actions/runs/44806886086) re-fetches the pinned Stage 7 archive copies and verifies that:

- The `cijhho` `magicsquares.txt` is 721 bytes.
- The `scream314` `magicsquares.txt` is 745 bytes and has Git blob SHA-1 `0cff0a94f16a8603443619b6338def411c9f7bd5`.
- The local 745-byte reference has the same Git blob SHA-1.
- Both archive copies produce the same **ordered 99-number stream** as the local reference.

The 24-byte difference between the two text files is formatting; the numeric stream is identical. The native OpenPuff output matches the 745-byte local reference exactly, so the exact output and the 99-number comparison are both established.

## Reproduction entry points

- Signed-page and hex-decoding workflow: `.github/workflows/manual-stage7-reproduction.yml`
- Native OpenPuff workflow: `.github/workflows/openpuff-v400-ui-probe.yml`
- Native OpenPuff driver: `sims/openpuff_v400_extract.py`
- Existing exact output: `resources/cicada2014-openpuff-magic-squares.txt`
- Historical Stage 7 instructions: [cicada-solvers / fifth onion](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/2014/007-fifth-onion/README.md)

The failed Midas acquisition is retired. `https://mir.cr/05EYEMXF` redirects to `https://www.mirrored.to/files/05EYEMXF/` and returns HTML, not the expected ZIP. Runs [44806886086](https://github.com/FlareZ123/liber-primus/actions/runs/44806886086) and [44826560629](https://github.com/FlareZ123/liber-primus/actions/runs/44826560629) diagnose that obsolete mirror path; they do not invalidate the already successful native OpenPuff run. Do not repeat generic mirror searches or rerun the extraction merely to obtain a single-workflow transcript.

## Evidence boundary

This closes the documented **2014 Stage 7 media-to-squares handoff**. The fifth-onion README says the extracted squares' use was unknown at that stage; the subsequent Stage10 form resolves their role as qualification inputs: paste the three matrices into the labelled textareas and submit them to `/cgi-bin/squares`, alongside a participant-controlled Tor URL. The separate instructions specify a CGI upload endpoint (`/cgi-bin/upload`, field `file`) and the participant's own GnuPG public key at `/key.asc`. The archive records three further LP pages after submission. This is a source-authenticated **submission receiver**, not a square-to-text decoder or key/index receiver for LP2 p33.

Nothing in this reproduction recovers unknown LP2 plaintext, selects an LP2 key schedule, identifies an LP2 reversible transform, or resolves the final Cicada destination. Keep the historical control separate from all LP2 cryptanalytic claims.

### LP2 key-selector gate (#3011): no selector found

The exact 99-cell stream has a source-selected order only for Stage10 submission: the 745-byte Stage7 payload already separates it into 5×5, 7×7, 5×5 matrices, and the Stage10 form labels the corresponding fields 53301, 71033, 51033. Its form action is /cgi-bin/squares. The separate /cgi-bin/upload endpoint and /key.asc requirement concern the participant's own service and communication key. No first-party text instructs solvers to consume the 99 cells as an LP2 key or index stream.

The fifth-onion README in the public reconstruction says the squares' use was “currently unknown”; the later Stage10 form supplies the human-visible next step—submit the three matrices. The examined 2012/2013 operations (book code, RSA/PGP, OutGuess, bytewise XOR, prime echo) do not select a magic-square cell-order receiver for LP2. The p33 sum correspondence is the separate #3005 investigation; this gate does not repeat it, and that arithmetic relation does not choose a reversible operation.

**Decision:** no source-selected LP2 receiver exists in the examined first-party chain. Retire the 99-cell key/index hypothesis; preserve the matrices as Stage10 qualification inputs only. No arbitrary flattening, permutation, shift, modulo map or other LP2 transform was tested. No plaintext or key was recovered.

### Human-readable passphrase transfer gate (#3332): no source-selected LP2 receiver

The strongest source-visible LP2 text candidate is the known p57 phrase **“FIND THE DIVINITY WITHIN”**, frozen as the eight-byte ASCII A-password `DIVINITY` (`44 49 56 49 4e 49 54 59`). The most motivated original recipient is the floral JPEG sequence p40–p55, ending at original `72.jpg` (p55). Native OpenPuff v4.00 tested this exact A-password on the full 16-image source-ordered sequence at Medium and Maximum; each complete run first recovered the known 35-byte JPEG positive control, then returned `corrupted stream` and zero output for the LP2 chain. See [the calibrated source gate](lp2-original-center8-divinity-native-openpuff-source-gate.md), especially runs [43696936143](https://github.com/FlareZ123/liber-primus/actions/runs/43696936143) and [43697657991](https://github.com/FlareZ123/liber-primus/actions/runs/43697657991). This rejects that fixed phrase/chain candidate only; it does not reject all LP2 steganography. A p55-only `DIVINITY` run was not completed.

No original LP2 instruction selects OpenPuff, maps `DIVINITY` to Password A, or names the floral JPEG sequence as its receiver. The historical receiver is MP3 audio, while LP2 supplies JPEG pages, so this is also a cross-media transfer. The p33 values 1033/3301 belong to the already-audited magic-square/form-validation branch, and the p50 center-eight `0s0D202n` is raw printed token material; neither is a new human-readable passphrase branch. The exact missing typed operand is a source-authenticated LP2 rule specifying both (1) the answer-to-A-password serialization and (2) the original carrier/page order. No such LP2 pair is presently supported. Close this transfer branch; do not expand into a sweep of other solved words.

## Direct Stage7 → Stage10 square-form match (#3001)

The 99 entries are not an ungrouped sequence or eleven 3×3 blocks: the exact extracted 745-byte text (blob 0cff0a94f16a8603443619b6338def411c9f7bd5) already has three blank-line-separated matrices, of orders 5, 7, 5. Split on original blank lines, preserve row and column order, parse decimal integers, and sum every row, column, and both main diagonals. All 12, 16, and 12 sums respectively equal 3301, 1033, 1033. The three matches are uniquely typed by the actual [Stage10 form](../resources/historical/cicada2014-stage10-neuro-form.html), in source order: `53301`, `71033`, `51033`. No permutation or key search is needed. The original payload's three center entries are 809, 331, 91; all three matrices have 180-degree rotational symmetry. No new LP2 significance is claimed for those properties.

Controls: for each matrix, seeded xorshift32 (initial state 0x33011033, carried across trials/matrices) drove 10,000 Fisher–Yates full-entry shuffles and 10,000 row-only shuffles (interleaved full then row per trial). All three full-entry controls yielded 0/10,000 exact magic hits; row-only hits were 168, 4, 174 respectively. The latter controls preserve existing row/column sums, so only the diagonal conditions discriminate. They are descriptive controls, not statistical attribution evidence. Original unmodified groups pass all conditions.

The direct historical input triple was already established in #2017 and this report; #3001 resolves the newer mistaken 3×3 premise with the explicit dimension/sum check. The three values are source-selected form inputs, not a captured POST body or proof of server acceptance, and no LP2 plaintext/key or p56 hash preimage follows. Do not redo extraction or construct further square partitions. #2989 can now restrict any remaining inquiry to the exact submitted serialization and historical server response, distinct from the already recovered numeric matrices.

Reproducer (Node.js, from repository root):

```js
const fs = require('node:fs');
const squares = fs.readFileSync('resources/cicada2014-openpuff-magic-squares.txt','utf8')
  .trim().split(/\r?\n\s*\r?\n/).map(b => b.split(/\r?\n/).map(s => s.trim().split(/\s+/).map(Number)));
const sums = m => [...m.map(r => r.reduce((a,b) => a+b,0)),
  ...m[0].map((_,i) => m.reduce((a,r) => a+r[i],0)),
  m.reduce((a,r,i) => a+r[i],0), m.reduce((a,r,i) => a+r[m.length-1-i],0)];
let seed = 0x33011033;
const rand = () => { seed ^= seed<<13; seed ^= seed>>>17; seed ^= seed<<5; return (seed>>>0)/4294967296; };
const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; };
for(const m of squares){
  const n=m.length,s=sums(m); let whole=0,row=0;
  for(let i=0;i<10000;i++){
    const a=shuffle(m.flat());
    whole+=Number(sums(Array.from({length:n},(_,j)=>a.slice(j*n,(j+1)*n))).every(x=>x===s[0]));
    row+=Number(sums(shuffle(m)).every(x=>x===s[0]));
  }
  console.log({n,s,whole,row});
}
```

Executed using the exact connector-returned source in V8; the filesystem read wrapper above is provided for local reproduction.
