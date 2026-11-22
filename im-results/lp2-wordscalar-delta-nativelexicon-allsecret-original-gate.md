# Original LP2: all-secret word-local periodic multiplicative step cipher exclusion

**Agent8, 22 November 2026. Actual original ciphertext: 12,956 GP29 runes and 2,896 complete words, including 32 page-crossing words.** A finite keyless test excludes five source-motivated 29-ary ciphertext-feedback families with *arbitrary independent secret multipliers for every original word and every phase*. The result provides neither recovered plaintext nor an authentic decipherment. **All assertions PASS on original GitHub Actions Windows-latest / Node 22**, completed 2026-11-22 17:33:15 UTC in [run 45050050138](https://github.com/FlareZ123/liber-primus/actions/runs/45050050138), including the 12,956-symbol positive round-trip. Exact read-only, native-JavaScript, original-source reproducer: [`lp2_wordscalar_delta_nativelexicon_original_sft.cjs`](../sims/lp2_wordscalar_delta_nativelexicon_original_sft.cjs).

## Direct clue-to-operation hypothesis

The unknown LP2 original has only **86 adjacent-equal ciphertext pairs** despite near-uniform frequencies of all 29 GP runes. In GP29 one-based ordinal arithmetic, the rune **EA** is ordinal29 and therefore residue0. This suggests a natural cipher family in which *only* plaintext EA creates ciphertext equality, regardless of the unknown multiplicative key. The 2016 Cicada-signed message foregrounds **words, numbers and direction**, and the original p23–26 displays a five-dot grouping cue; independent research reports a within-word fifth-back equality excess. Those clues motivate per-word, possibly periodic, multipliers. The creator's actual opcode, if any, remains unknown.

Grant a stronger attacker than any sourced simple key construction: choose completely arbitrary **independent nonzero secret keys** for each physical complete printed word and each phase `0..t−1`, with *t fixed* to each of the five modest periods `1,2,3,4,5`. Even without knowing those keys, test all source words under the following exact reversible hypothesis:

```text
t in {1,2,3,4,5}
k[word,phase] in GF(29)^* = {1,2,...,28}, private and arbitrary
q(P_i) = GP0(P_i) + 1 mod29

C_i = C_previous + k[word, i mod t] * q(P_i) mod29
```

Here `i` counts rune positions *within each complete original printed word*. Both natural predecessor conventions are covered: ciphertext continuously carried over the preceding word/page, and predecessor0 reset at the start of every word. The original typography and all 12,956 runes are retained; there are no guessed plaintext-F skips, deleted repeated runes, or resegmented words.

## A full-keyspace test without searching secret keys

For each observed original word, let `D_i=C_i−C_prev mod29` be its ciphertext step. For each residue class `i mod t`, normalize the corresponding step subsequence by multiplying every entry by the modular inverse of its first nonzero member; retain explicit zeros. Concatenate these `t` canonical signatures in phase order. Do the identical phasewise normalization to each candidate plaintext word's vector of one-based GP29 ordinates `q(P)`.

For the hypothesized cipher, `D_i=k[word, i modt]·q(P_i)`. Hence **each private scalar cancels identically within its phase**. The resulting phasewise signatures of ciphertext and a genuine plaintext word must match exactly for **every** possible choice of the `t` private keys; this includes every conceivable source-derived word length, number, prime or table-key selector in this particular architecture. There is no language-model ranking, period tuning from ciphertext output, numeric brute force, or fitted substitution alphabet.

The fixed English word source is the pre-existing research [TextBlob spelling-frequency reference](../resources/control/english_wordfreq_textblob.txt), containing **23,940** GP29-encodable lexical words under the canonical `ING,TH,NG,EO,OE,AE,IA,EA` multigraph priority (`ING` maps to GP NG). An observed word matches iff **at least one** dictionary candidate of the exact same native GP rune length has precisely the same phasewise canonical signature. A nonmatch is an exact exclusion for every private key within the named architecture, conditional on native English being represented by that fixed lexicon.

## Original ciphertext results with five all-secret phase families

| Private keys per word / phase period | Original compatible words of 1,132 length≥5, carry | Original compatible words of 343 length≥8, carry | Original compatible words of 109 length≥10, carry | Original compatible words of 109 length≥10, reset |
| ---: | ---: | ---: | ---: | ---: |
| t=1 | 0 | 0 | **0** | **0** |
| t=2 | 50 | 0 | **0** | **0** |
| t=3 | 321 | 0 | **0** | **0** |
| t=4 | 592 | 1 | **0** | **0** |
| t=5 | 793 | 28 | **0** | **0** |

Here **carry** means the original first rune of a printed word subtracts the preceding word's last ciphertext rune; **reset** means that first rune subtracts zero. Both interpretations give 0/109 native lexical matches for all periods. The source also gives 0/815 source words of length≥6 under t=1, even after granting a different unconstrained key for each word. Under the five-phase model, shorter words frequently match by coincidence because single observed symbols impose no relative scalar constraint. The 109 source words of length≥10 contain enough repeated phase positions to make t≤5 discriminating.

**Independent natural-language control:** Run the same GP-native tokenizer and static lexicon against the genuine pre-2014 Kahlil Gibran *The Prophet* text `resources/control/gibran_prophet_58585.txt`. **289/324 native words of GP length≥10** have a lexicon match under **every t=1..5**. For all native GP length≥5, exact lexicon matches increase from **3,896/4,120 at t1** to **4,018/4,120 at t5**; increasing matches reflect less restrictive phase signatures, not decipherment. This demonstrates normal genuine literary words satisfy the test often and gives explicit finite dictionary-coverage limitations.

**Full-length period-five planted positive:** The script selects a genuine Gibran-native dictionary word for *each* of the original 2,896 GP word-length slots, reconstitutes exactly **12,956 source-shaped native GP rune positions**, encrypts using a distinct nonzero secret multiplier for every one of the five word-local phases, and checks the original-register phasewise inverse. All **1,132/1,132** planted words of GP length≥5 are discoverable without any secret key, and the independent known-key decoder reverses each of the 12,956 planted ciphertext symbols exactly. The same original parser checks that original rune concatenation equals the canonical physical-page corpus byte for byte after transcription normalization.

## Next cryptanalytic decision

This rejects a materially large, even *unconstrained-key*, periodic within-word extension of the naturally anti-repeating GP29 predecessor cipher. Selecting a key from p7/p15/p50 prime operands would narrow the keyspace even further and cannot repair a mathematical signature mismatch. Most importantly, the source's fifth-back excess does **not** make a five-phase *multiplicative ciphertext-step cipher with intact English words* sufficient to recover plaintext: all 109 longest printed words violate its necessary native-word signature.

Limits are explicit. The original book could have non-English plaintext, names absent from TextBlob, fake printed spaces, position-varying **nonperiodic** multiplicative keys, nonlinear cipher state, additive phase offsets, homophonic/steganographic channels, or a non-GP intermediate code. The result is conditional on preservation of the original complete words and on one-based scalar ciphertext steps. Since this finite branch yields no usable plaintext or key, the next candidate needs an independently visible reason for one of those genuinely different operations and must then predict original unknown plaintext on a held-out interval. Avoid further secret scalar fitting within the excluded word-local family.

[Reproduce all five fully secret-key tests and period-five English plants](../sims/lp2_wordscalar_delta_nativelexicon_original_sft.cjs) · [Canonical source rune transcript](../resources/lp2-transcription.txt) · [Corpus of all 58 physical pages](../resources/liber-primus/lp2-corpus.json) · [English reference](../resources/control/english_wordfreq_textblob.txt) · [Period-native prose control](../resources/control/gibran_prophet_58585.txt).
