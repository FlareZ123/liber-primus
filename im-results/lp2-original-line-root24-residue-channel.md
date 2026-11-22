# GF(29) root-24 check on original printed LP2 lines

**Original-input decision, 14 November 2026, Agent 11.** A root-24 residue from each original printed line produces a complete **594-rune secondary stream**, but that stream is near-uniform and does not yield readable or authenticated plaintext. A universal single-symbol root-24 parity reading also fails on the intact original. The mathematical operation is source-constrained; its application to printed *lines* is an exploratory inference, not an authenticated 3301 instruction.

## Why test this exact operation?

The original p39 red triad (in low-first order), physical p29's rune polynomial, and the 256-number table each have a documented root at 24 over GF(29), with p40 and p54 floral chapter headings also evaluating to zero at that root in high-first order. The order convention differs for the p39 triad; the relationship is not independently established as an intended cipher. A human solver might use this conspicuous field value as a line-level checksum or read one symbol per printed line, preserving the source's actual layout instead of guessing a secret pad.

For a slash-delimited line with printed GP29 indices `a[0], …, a[n−1]`, use the standard high-first Horner evaluation `H = (...((a[0]*24+a[1])*24+a[2])...)*24+a[n−1] (mod 29)`. The resulting symbol is in the canonical GP29 index order. This uses every printed source rune, with no fitted key, chapter phase, sign, alphabet permutation, word reset or relabeling.

## Complete original result

The slash-delimited historical transcript `resources/lp2-transcription.txt` was resegmented into the **58 physical LP2 pages**, inserting original runeless p50 at its correct slot. **Every page's rune sequence was checked byte-for-byte against** `resources/liber-primus/lp2-corpus.json`. On 55 unknown rune-bearing pages there are **12,956 GP symbols in 594 printed lines**.

| Fixed observable | Exact result |
| --- | ---: |
| Original lines with `H(24)=0` | **19 / 594** |
| Null expectation under independent uniform residues | **594/29 = 20.48275862** |
| GP29 coincidence index of all 594 line residues | **0.03423782513** |
| Uniform GP29 coincidence limit | **1/29 = 0.03448275862** |
| Original root-23 line hits as a same-form diagnostic | **33 / 594**, among 29 simultaneously observable roots |

The root-24 zero locations, in *(physical page, zero-based printed line)* form, are `(0,0),(5,4),(7,2),(8,3),(12,7),(13,6),(15,4),(16,4),(18,11),(20,9),(21,0),(30,8),(31,9),(33,1),(38,2),(43,3),(53,7),(54,3),(55,1)`.

The first ninety secondary-stream runes transliterated with the exact GP convention begin:

```text
F L J I NG X P AE EO U NG T Y W TH E R R S Y J D I Y N OE S B X E W J E W J G AE N S U B C D TH TH X I X NG NG TH E Y X EA AE S B D H F P R L W Y EO Y L AE B A Y EO J J T L O H F H E N IA U NG EA EO G OE F R X EO Y
```

There is no sustained GP-native-language recovery. The original residue distribution is close to uniform; zero checksums occur at the ordinary chance rate. The elevated exploratory `x=23` root count is a selection among 29 tested roots and has no ciphertext-selected extraction or known key. It must not be treated as an independent success.

The implementation positive control changes only the last rune of 20 fixed original line copies to force each of the 29 possible residues in turn. All **580/580** planted outputs match their selected remainder; untouched originals are never altered. This validates the operation as a readable check/extractor, without validating creator intent.

## Decision

Retire **printed-line GF29 polynomial parity at root 24 and its direct line-remainder-as-GP-plaintext reading**. This does not exclude a secret subsequent decryption, another line-register definition, a nonlinear source-selected operation or a different role for the independently observed whole-page root coincidences. No unknown LP2 key, plaintext, page-hash preimage or final destination was recovered.

Reproducer: [`sims/lp2_root24_original_line_remainder_sft.cjs`](../sims/lp2_root24_original_line_remainder_sft.cjs). Read-only Node.js 22, self-contained apart from the two repository source files.
