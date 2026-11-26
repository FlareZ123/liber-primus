# p54 red-eight keyed alphabet: exact latent-boundary inverse

**Decision (26 November 2026, Agent3):** no original plaintext or key. All eight fixed rubric-derived alphabet/mapped-shift receivers yield no coherent native prose on the corrected p54–55 body, even freeing every printed word boundary and word phase. This is a distinct fixed-source exploratory alternative to the arbitrary alphabet search in #2722, not a rejection of all common-cycle actions.

## Motivation and scope

The original p54 red heading is an enlarged A followed by eight red GP29 glyphs K=[19,21,23,27,2,14,10,19]. Classical mixed-alphabet construction deduplicates a keyword followed by the canonical alphabet. The visible rubric could therefore supply an alphabet as well as the shifts. The stronger rival is ordinary encrypted rubric prose. No first-party instruction selects this double use, and the authentic solved pages do not establish it. Earlier keyed-alphabet terminal calibration is withdrawn due to physical-fragment segmentation; this test uses the corrected body and removes both printed starts and the printed length inventory.

Freeze two prefixes (red8 or A+red8), two ways to fix F at coordinate zero (rotate a standard deduplicated keyword alphabet to F, or prepend protected F before deduplication), and both additive signs. The key is the original red8 mapped through the alphabet, with sign. Sender C=inv(pi(P)+k[j] mod29), with optional native plaintext-F bypass. Every true word independently chooses either ordinary or F-holding mode and any initial phase. This grants more freedom than a fixed continuous historical clock. Original input is the exact 299-rune black body, 64 complete printed groups including the 11-rune p54/p55 carry. Require 64 latent words, permit arbitrary lengths and starts. The 33,394-form register includes TextBlob GP forms under two contraction conventions, native solved words and all 29 singletons.

## Exact inverse and original outcome

At each offset enumerate all phases and both F modes through the dictionary trie. Visible ciphertext F may be held or consuming when legal. Because state is independent between true words, retaining the best-scoring lexical inverse for each length is sufficient. A shortest-path DP over (word count, rune offset) minimizes OOV words; OOV components are capped at 13 runes, the longest printed group, while lexical edges retain all lengths. A second DP allows unbounded OOV lengths and minimizes OOV rune count for exactly 0–3 unsupported groups. All reconstructed paths replay exactly. Score tie-breaks are diagnostic.

| Prefix length | Alphabet convention | Sign | Minimum OOV groups, cap13 | Longest lexical edge anywhere | Minimum unsupported runes for 1 / 2 / 3 unrestricted OOV groups |
|---:|---|---:|---:|---:|---:|
| 8 | rotate to F | + | 14 | 4 | 165 / 157 / 157 |
| 8 | rotate to F | − | 13 | 5 | 158 / 156 / 154 |
| 8 | F first | + | 13 | 4 | 156 / 149 / 148 |
| 8 | F first | − | 14 | 5 | 156 / 154 / 153 |
| 9 | rotate to F | + | 14 | 4 | 162 / 155 / 155 |
| 9 | rotate to F | − | 13 | 4 | 155 / 148 / 144 |
| 9 | F first | + | 13 | 5 | 160 / 150 / 148 |
| 9 | F first | − | 14 | 4 | 155 / 153 / 151 |

Zero-OOV paths do not exist. No map admits a dictionary word longer than five runes anywhere in the original. With three unrestricted OOV groups, at least 144/299 original runes must remain in unsupported intervals, even in the best model. One unrestricted OOV group can instead swallow a very long segment, explaining why a bare OOV-word count is misleading. These are necessary costs, not recovered plaintext.

Three controls encrypt genuine solved text under three frozen maps with independently generated per-word phases and F rules; boundaries are hidden, total word count is supplied. The lexicon includes donor words, so the controls calibrate inverse-path implementation, not independent language coverage.

| Source | Runes | Min OOV | Agreement of best witness |
|---|---:|---:|---:|
| 0_welcome | 255 | 0 | 255/255 |
| 0_loss_of_divinity | 270 | 0 | 268/270 |
| 0_koan_1 | 221 | 0 | 221/221 |

All witnesses replay; no original candidate is coherent. Retire these eight fixed rubric-keyed alphabets and mapped keys under the named count/register assumptions. Arbitrary secret alphabets, unrelated keys, different registers or true word counts remain outside scope. The data do not justify enlarging the fixed alphabet pool.

## Reproduction

`node sims/lp2_red8_keyed_alphabet_latent_sft.cjs` from root. [SFT](../sims/lp2_red8_keyed_alphabet_latent_sft.cjs), [raw outputs](lp2-red8-keyed-alphabet-latent-output.json). The same JavaScript core executed in connected V8 on pinned inputs; standalone Node wrapper not separately run. Input blobs: resources/liber-primus/lp2-corpus.json = 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; resources/liber-primus/lp2-page-groups-54-55-derived.json = 8960e113af36ee46186965e394ec6be18d69b74f; resources/control/english_wordfreq_textblob.txt = 140e1d22b5f8c45deddd2e8b25549d9d6307d938; resources/external/relikd-solved-gp29-native-v1.json = 1b064ef6d85819b7d96adaff31a82d1ec551598f. Related: [common-cycle decision](lp2-shared-gp29-cycle-action-calibration.md), [canonical all-q8 conserved-inventory test](lp2-u2b-periodic-q8-anchor.md).
