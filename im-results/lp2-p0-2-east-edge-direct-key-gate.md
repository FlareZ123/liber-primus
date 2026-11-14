# p0–p2 27×27 east edge as p55 key: transparent-F gate

**Decision:** the easternmost column of the conditional p0–p2 27×27 map does not decrypt original p55 under the tested direct repeating-key GP29 interpretations, even when the authentic solved-p56 plaintext-F bypass convention is granted. This is a bounded negative, not a test of the external project's separate three-rune-node / totient / Möbius route.

## Avoiding duplicated p3 work

The repository already contains `sims/lp2_27x27_eastmap_p32_to_p3_sft.cjs`. It tested the p0–p2 map's raw eastern edge as a subtractive key on untouched p3, the same edge under a totient-of-GP-prime mapping on p3, and the independently source-selected p32 11×11 map's eastern edge on p3. This report does **not** repeat or claim those p3 results. The new experiment is limited to p55.

## Source and fixed edge

The canonical transcription `resources/liber-primus/lp2-corpus.json` (Git blob SHA `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`) contains exactly 729 = 27×27 runes across p0–p2. The 27th column, read top-to-bottom, is:

- GP29 indices: `[17,17,21,25,7,11,25,28,1,4,16,6,9,24,28,5,1,8,6,19,8,16,18,20,7,21,7]`
- Transliteration: `B B NG AE W J AE EA U R T G N A EA C U H G M H T E L W NG W`

The p0–p2 output phrase “the key is to go to the east of the map” belongs to an external, not first-party-authenticated candidate decoding. Taking the east edge as a repeating key is a literal, cheap human interpretation, not an established instruction.

## Frozen p55 model

Original p55 has **76 runes**: one incoming carry rune from p54 and 75 body runes. Its ciphertext-F positions are **[15,25,41]** (page-local, zero-based).

I applied the authentic p56 **transparent plaintext-F** convention: a selected literal plaintext F emits ciphertext F and does not consume a key position; a ciphertext F not selected as literal may decrypt to a non-F rune. Any key-consuming position that decrypts to plaintext F is invalid under this rule. All (2^3=8) subsets of the three ciphertext-F positions were enumerated.

The 27-symbol edge was tested with three explicit rune-to-key mappings, each top-to-bottom and bottom-to-top:

1. Raw GP29 rune index.
2. GP prime weight modulo 29.
3. Euler φ of the GP prime weight, i.e. `(prime[index] - 1) mod 29`.

Only subtraction (P=C-Kpmod{29}) was used, matching the solved p56 inverse direction. Two unoptimized clocks were tested: page-reset phase 0, and continuous phase 1 under the explicit assumption of **no earlier plaintext-F bypasses**. The latter phase is not authenticated; prior F bypasses would change it, and no free phase search was performed.

This gives **96** total combinations (6 key mappings × 2 clocks × 8 F masks). Only **8** satisfy the transparent-F consistency rule; the other **88** would require at least one plaintext F to consume a key symbol and are invalid.

## Results

The 75-rune p55 body has original IoC **0.0385586** and mean English-quadgram score **−15.5857843**. A 75-rune clear p57 control scores **−9.9588446** under the same scorer (79,495 quadgrams, `resources/control/duko_round27_english_quadgrams.txt`).

| Key mapping / direction | Clock phase | Literal F positions | Mean quadgram score | IoC |
|---|---:|---|---:|---:|
| Raw index, down | 1 | 25, 41 | **−15.0642884** | 0.034595 |
| Raw index, down | 1 | 15, 41 | −15.3102623 | 0.033874 |
| φ(GP prime), down | 0 | 41 | −15.4012964 | 0.035315 |
| Raw index, down | 1 | 15, 25 | −15.4273081 | 0.032072 |
| φ(GP prime), up | 0 | 15, 25 | −15.7156794 | 0.032432 |
| Raw index, up | 0 | 15 | −15.7549799 | 0.035315 |
| Raw index, up | 0 | 25 | −16.0602863 | 0.035315 |
| Raw index, up | 0 | 41 | −16.3765185 | 0.030991 |

No GP-prime-mod-29 variant survives the plaintext-F consistency condition. The best surviving output is:

```text
RDOAEMEPSEAGYEAOLEAMEIAYXEPIWFWOETHNNGYAENGJSEABEEFEOJYGEALTHNGSWXHUIALGAWMONGUEORIISEIOEJEATH
```

Its small score improvement over the original is the best of 96 postulated combinations and remains far below the clear p57 control; the output is not coherent GP-native plaintext. The best candidate also has lower IoC than the original p55 body.

A synthetic 76-rune p57 plant encrypted and decrypted under every key representation and both clocks passes exact recovery, including the transparent-F skip semantics. Thus the negative is not an implementation failure.

## Decision and limits

Reject the direct **27-rune east-edge repeating key + p56-style transparent-F** model for p55 under these six fixed key representations and two stated clocks. This does not reject a different eastward traversal, the external three-rune-node decoder, a non-Vigenère use of the map, or a key/state derived from another independently authenticated source.

The φ-of-GP-prime mapping is not the authentic p56 consecutive-prime key stream; it is an explicitly tested candidate mapping of edge runes. Likewise, the continuous phase assumes no earlier F skips. Neither assumption is promoted to fact.

## Reproduction

From the repository root:

```sh
node sims/lp2_p0_2_east_edge_p55_key_gate.cjs
```

The script reads the canonical corpus and the pinned 79,495-entry quadgram file, asserts the exact edge, p55 F positions, source clock arithmetic and all valid/invalid masks, prints all eight surviving strings, and verifies 12 source-native synthetic positive controls.
