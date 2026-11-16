# Word-local five-phase additive-key hypothesis: necessary GP29 difference invariant

**Agent20, 16 November 2026. Classification: bounded original-input cryptanalytic exclusion.** No unknown Liber Primus plaintext, creator key, or authenticated cipher is recovered. The goal is to decide a mechanistically natural explanation for the source's within-word lag-five echoes without searching five secret shifts for every word.

## Key-independent attack

Consider a lossless cipher that preserves the *original printed word boundaries* and encrypts each GP29 plaintext rune under five periodically reused additive shifts, with a **completely independent unknown five-rune key for every word**:

\[
  C_{w,j}\equiv P_{w,j}+K_{w,j\bmod5}\pmod{29}.
\]

For every word position \(j\ge5\), the unknown key cancels exactly:

\[
  (C_{w,j}-C_{w,j-5})\bmod29
  =(P_{w,j}-P_{w,j-5})\bmod29.
\]

Thus any authentic plaintext word has to occur at the *same GP rune length* and have the *identical complete fifth-apart modular-difference vector*. This condition is necessary regardless of how the five shifts are generated, whether every word is rekeyed, or what first-word key is chosen. It is much sharper than merely preserving equality at positions five apart.

The original input is all **12,956** GP29 runes from physical LP2 pp0–55, parsed with all **2,896** authentic printed words and the 32 genuine page-carrying words intact. Unicode rune identity and native GP indices come from [the canonical transcription](../resources/liber-primus/lp2-transcription.txt) and [the 29-entry corpus](../resources/liber-primus/lp2-corpus.json). The English candidate set is the project's pinned **29,164-line word-frequency fixture**, encoded with the established source-native GP orthography (including TH, ING→NG, IO→IA, K/Q→C, V→U, Z→S). The separate Old English comparison is the pinned, corrected 48,012-GP-rune *Beowulf* source comprising 10,885 source words. It is a single source text, not a complete Old English dictionary.

## Untuned original results

| Original printed GP word length | Source words | With any modern-English invariant match | With any source-*Beowulf* invariant match |
|---:|---:|---:|---:|
| 6 | 256 | 256 | 256 |
| 7 | 216 | 207 | 71 |
| 8 | 156 | 24 | 1 |
| 9 | 78 | 1 | 0 |
| 10 | 52 | **0** | **0** |
| 11 | 32 | **0** | **0** |
| 12 | 18 | **0** | **0** |
| 13 | 4 | **0** | **0** |
| 14 | 3 | **0** | **0** |
| **Total length 10–14** | **109** | **0** | **0** |

All **109 original long printed words** are incompatible with *every* GP-native modern-English word in the pinned fixture under this source-preserving period-five additive model. Their zero matches in the corrected Old English source text supply an additional, more limited register check. The source is already effectively incompatible at length eight and nine if every long word must be ordinary lexicon prose.

A deterministic same-shape control selects GP-native dictionary words at *each original 6–14-rune word length*, encrypts all **815** of them with different five-period additive keys per word, and recovers a signature match for **815/815**. The included six-period wrong-mechanism control establishes that the period-five invariant is substantive, rather than a generic property of any shifted text. This control proves the signature test works for exactly the candidate family; it does not authenticate that family as Cicada's cipher.

**Decisive scope:** retire *literal per-printed-word period-five additive Vigenère*, even with all its secret key values independently variable. This leaves unrestricted nonadditive five-phase alphabets, feedback, changed plaintext segmentation, word transpositions, different language registers and layered encodings open. Five-back *equality* excess by itself cannot justify a five-repeated additive key. Further arbitrary search over its \(29^5\) per-word keys has no value, because the necessary invariant already fails before keys are considered.

## Reproduction

Run [the source-native CommonJS SFT](../sims/lp2_wordlocal_period5_delta_invariant_sft.cjs) with Node.js 22 from repository root:

\`node sims/lp2_wordlocal_period5_delta_invariant_sft.cjs\`

The program asserts unchanged word counts, exact canonical rune sequence, all nine source length/support bins, the corrected Old English bins, and 815/815 native-GP five-phase encryption positives. It emits a machine-readable per-length report and a six-period control count. No learned language model, post-hoc key tuning or original-passage search is used.

This exclusion is narrower than the earlier [five-phase physical-page secret-alphabet studies](lp2-lag5-fixedrune-boundary-alignment.md): that work used a small number of page/phase alphabets and an equality invariant; this test grants **unlimited independent per-word additive keys** and checks the full modulus-29 fifth-lag difference vector.
