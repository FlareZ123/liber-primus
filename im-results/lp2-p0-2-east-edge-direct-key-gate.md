# Map east-edge keys on original p55: transparent-F gate

**Decision:** neither the eastern edge of the conditional p0–p2 27×27 map nor the source-selected p32 11×11 map decrypts original p55 under the tested direct repeating-key GP29 interpretations, even when the authentic solved-p56 plaintext-F bypass convention is granted. This is a bounded negative, not a test of the external 27×27 project's separate three-rune-node / totient / Möbius route.

## Avoiding duplicated p3 work

The repository already contains `sims/lp2_27x27_eastmap_p32_to_p3_sft.cjs`. It tested the p0–p2 east edge on untouched p3, including a totient-of-GP-prime mapping, and tested the p32 11×11 east edge on p3. This report does **not** repeat or claim those p3 results. The new experiment is limited to p55.

## Two map candidates

### p0–p2 27×27 map (conditional external hypothesis)

The canonical transcription `resources/liber-primus/lp2-corpus.json` (Git blob SHA `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`) contains exactly 729 = 27×27 runes across p0–p2. The 27th column, read top-to-bottom, is:

`[17,17,21,25,7,11,25,28,1,4,16,6,9,24,28,5,1,8,6,19,8,16,18,20,7,21,7]`

The phrase “the key is to go to the east of the map” comes from an external, not first-party-authenticated candidate decoding. Taking the edge as a repeating key is a literal, cheap interpretation, not an established instruction.

### p32 11×11 map (independently source-selected partition)

Original p32 has 121 runes in an 11×11 square. Its top-row GP-prime weights sum to **563** and its first-column weights sum to **569**, matching the exact dimensions of the independently signed 2016 tree image. This fixes the 11×11 image partition/orientation, but does not itself instruct the solver to use the eastern edge as a cipher key. See `im-results/lp2-p32-signed2016-tilepixel-key-gate.md`.

The p32 11th column, top-to-bottom, is:

`[21,7,2,23,14,17,7,2,11,24,12]`

Using this edge as a key is therefore a testable interpretation of a source-selected map, not an authenticated cipher rule.

## Frozen p55 model

Original p55 has **76 runes**: one incoming carry rune from p54 and 75 body runes. Its ciphertext-F positions are **[15,25,41]** (page-local, zero-based).

I applied the authentic p56 **transparent plaintext-F** convention: a selected literal plaintext F emits ciphertext F and does not consume a key position; a ciphertext F not selected as literal may decrypt to a non-F rune. Any key-consuming position that decrypts to plaintext F is invalid under this rule. All (2^3=8) subsets of the three ciphertext-F positions were enumerated.

For each edge, I tested three fixed rune-to-key mappings, each top-to-bottom and bottom-to-top:

1. Raw GP29 rune index.
2. GP prime weight modulo 29.
3. Euler φ of the GP prime weight, i.e. `(prime[index] - 1) mod 29`.

Only subtraction (P=C-Kpmod{29}) was used, matching the solved p56 inverse direction. No arbitrary key phase was searched.

The p0–p2 key period is 27. The 729-rune map consumes 27 periods; the continuous no-prior-F-skip phase at p55 is (12{,}880mod27=1), alongside page-reset phase 0.

The p32 key period is 11. Its source-fixed clocks are page-reset phase 0; continuous from p32 through p54, (4{,}920mod11=3); and continuous from p0 through p54, (12{,}880mod11=10). Both continuous clocks explicitly assume **no earlier plaintext-F bypasses**. If such bypasses occurred earlier, their consumed-key count would change the phase. These phases are bounded controls, not authenticated states.

This gives **240** total combinations: 96 for the p0–p2 map and 144 for p32. Only **13** satisfy the transparent-F consistency rule; the other **227** would require at least one plaintext F to consume a key symbol and are invalid.

## Results

The 75-rune p55 body has original IoC **0.0385586** and mean English-quadgram score **−15.5857843**. A 75-rune clear p57 control scores **−9.9588446** under the same scorer (79,495 quadgrams, `resources/control/duko_round27_english_quadgrams.txt`).

**p0–p2 map: 8 valid candidates**

| Key mapping / direction | Phase | Literal F positions | Mean quadgram score | IoC |
|---|---:|---|---:|---:|
| Raw index, down | 1 | 25, 41 | **−15.0642884** | 0.034595 |
| Raw index, down | 1 | 15, 41 | −15.3102623 | 0.033874 |
| φ(GP prime), down | 0 | 41 | −15.4012964 | 0.035315 |
| Raw index, down | 1 | 15, 25 | −15.4273081 | 0.032072 |
| φ(GP prime), up | 0 | 15, 25 | −15.7156794 | 0.032432 |
| Raw index, up | 0 | 15 | −15.7549799 | 0.035315 |
| Raw index, up | 0 | 25 | −16.0602863 | 0.035315 |
| Raw index, up | 0 | 41 | −16.3765185 | 0.030991 |

**p32 map: 5 valid candidates**

| Key mapping / direction | Phase | Literal F positions | Mean quadgram score | IoC |
|---|---:|---|---:|---:|
| GP prime mod29, down | 3 | 15 | **−15.7676520** | 0.037838 |
| φ(GP prime), down | 0 | 41 | −15.7699083 | 0.043964 |
| GP prime mod29, down | 3 | 25 | −15.8780116 | 0.039640 |
| φ(GP prime), down | 0 | none | −16.0008193 | 0.041081 |
| Raw index, up | 3 | 41 | −16.5104781 | 0.030631 |

The p0–p2 map's best output is:

```text
RDOAEMEPSEAGYEAOLEAMEIAYXEPIWFWOETHNNGYAENGJSEABEEFEOJYGEALTHNGSWXHUIALGAWMONGUEORIISEIOEJEATH
```

The p32 map's best output is:

```text
WTLTHWWTHIAAEWRCEAGFOETWOENBEASIYACJLOENGETEDTAEEMOBAEEWODSNPTHAETHXAEPPDEAEOPWNGIPNCBTJRGOEWGE
```

Neither is coherent GP-native plaintext. The p0–p2 candidate's modest score improvement is the best of 96 postulated combinations and remains far below clear p57. The p32 map's best score is **worse than untouched p55**. No GP-prime-mod-29 variant for p0–p2 survives the plaintext-F consistency condition; the p32 survivors are listed above.

A synthetic 76-rune p57 plant encrypted and decrypted under every edge/key representation and every tested clock passes exact recovery, including the transparent-F skip semantics (30 positive controls). Thus the negative is not an implementation failure.

## Decision and limits

Reject the direct **map east-edge repeating key + p56-style transparent-F** model for p55 under these six fixed key mappings and five source-motivated clocks. This does not reject a different eastward traversal, the external three-rune-node decoder, a non-Vigenère use of either map, or a key/state derived from another independently authenticated source.

The φ-of-GP-prime mapping is not the authentic p56 consecutive-prime key stream; it is an explicitly tested candidate mapping of edge runes. Likewise, continuous phases assume no earlier F skips. Neither assumption is promoted to fact.

## Reproduction

From the repository root:

```sh
node sims/lp2_p0_2_east_edge_p55_key_gate.cjs
```

The script reads the canonical corpus and pinned 79,495-entry quadgram file, asserts both map edges, p55 F positions, all source clock arithmetic and valid/invalid masks, prints all thirteen surviving strings, and verifies 30 source-native synthetic positive controls.
