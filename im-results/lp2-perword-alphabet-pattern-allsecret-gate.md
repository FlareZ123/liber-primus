# Original LP2 whole-word alphabet-pattern obstruction

**Research status, 13 November 2026, Agent49:** This is a key-independent, original-cipher constraint on independent secret GP29 alphabet bijections for each printed word. It excludes the exact tested mechanism for a finite English word lexicon. There is no recovered unknown LP2 plaintext, authenticated key, or original instruction selecting that mechanism.

## Source-visible premise and mathematical invariant

The solved Cicada pages provide authentic GP29 English spelling, and the unknown manuscript retains original printed word divisions. A solver might try independently varying monoalphabetic substitutions at every printed word. Every arbitrary 29-rune bijection, whether deterministic, secret, or chosen separately for all 2,896 words, preserves the positions at which equal rune identities occur within a word. Canonicalize each word by assigning 0 to its first rune, 1 to its next previously unseen rune, and so forth. A word's canonical first-occurrence signature is therefore invariant under any per-word rune bijection.

The experiment reads the original 55 rune-bearing unknown physical LP2 pages (p0–p55, with p50 runeless): 12,956 runes and 2,896 complete printed words. The fixed English comparison is 29,157 lower-case entries from resources/control/english_wordfreq_textblob.txt, converted with the already source-validated GP29 conventions, including ING as rune21, IO as rune27, and the original orthographic substitutions QU/V/K/Q/Z. Match ciphertext words against the dictionary only at equal GP rune length and equality signature.

## Exact original-cipher exclusion

| GP rune length | Original printed words | No same-pattern word in fixed lexicon |
| --- | ---: | ---: |
| 10 | 52 | 13 |
| 11 | 32 | 10 |
| 12 | 18 | 16 |
| **Total** | **102** | **39** |

All 39 misses are impossible under any independent secret fixed-within-word alphabet bijection that would turn these positions into one of the 29,157 registered English words. An exact bounded position-replacement calculation grants the decoder up to two arbitrary original-rune identity changes per word before the secret bijection. Of the 102 original words, 63 are compatible immediately, 35 can first become compatible with exactly one identity change, and four need exactly two identity changes. All 39 incompatible words can be repaired using at most two. Therefore **at least 43 ciphertext rune-position identities must change among the 1,088 runes of these 102 words** for every word to become a lexicon member, even with secret independent per-word output alphabets. The bound is a necessary condition on this tested word-register model, not a plaintext reconstruction.

## Physical page-break robustness

The primary tokenization concatenates original transcription page fragments when no actual word/sentence delimiter is printed across the page boundary, yielding 2,896 complete words. Other repository statistics reset words at each physical page boundary, resulting in **2,928 page-local word fragments**. This alternative preserves every original rune, all explicit word separators and the source line-wrap convention. When every physical page boundary is treated as an additional word break, the 10–12-rune cohort becomes **97 fragments, with 37 incompatible English equality signatures**. Thus the 39/102 primary exclusion persists as **37/97** even under the competing page-local convention. The SFT asserts both page readings. Because independent page breaks create fragments that may not be true plaintext words, the 37/97 comparison is a robustness diagnostic rather than a new plaintext model.

## Physical chapter dispersion

The 39 incompatible 10–12-rune whole words are distributed across eight of the nine independently visible original chapter intervals. With each crossing word credited to the page where it begins, the original counts of incompatible/total long words are: pp0–2 **1/6**, pp3–7 **5/10**, pp8–14 **7/14**, pp15–22 **3/14**, pp23–26 **1/6**, pp27–32 **6/14**, pp33–39 **7/13**, pp40–53 **9/22**, pp54–55 **0/3**. These sum to 39/102. The absence of a mismatch in the final 3-word sample is uninformative. The obstruction is therefore broad across the book rather than dependent on only one visually unusual page.

## Native positive controls and independent comparison

The 181 original, independently solved LP1 plain rune words on physical pages 10–13 all possess registered native-English equality signatures. A 102-word planted English source transformed under a different GF29 affine alphabet permutation for each complete word retains 102/102 matching signatures. These tests establish that the invariant does not accidentally reject genuine native-English source controls under the proposed bijective cipher.

| Native English control | 10-rune misses/total | 11-rune misses/total | 12-rune misses/total |
| --- | ---: | ---: | ---: |
| Shakespeare | 30/533 | 39/161 | 21/62 |
| Gibran | 12/176 | 10/83 | 6/35 |
| Emerson | 98/1,346 | 88/709 | 93/368 |
| **Pooled** | **140/2,055** | **137/953** | **120/465** |

The pooled three-corpus reference, sampled without replacement conditional on the original 52/32/18 length histogram, expects about 12.79 unrecognized signatures; the finite hypergeometric upper tail of 39 or more is 4.0744123510e-12 under that exact conditional model. With rune lengths 6 through 14 included, the original has 51 incompatible shapes in 815 words; the pooled length-conditioned reference expects about 22.74 and yields an upper tail 9.7707062022e-9. This is a retrospective, word-token-pool comparison whose samples are not statistically independent English generators. It is not an authorship probability or a universal theorem about all English. A solved p57 word of 14 runes is itself outside the registered lexicon's shape inventory, demonstrating its limits.

## Historical reading-operation family: reverse and circular word orientations

The independently solved p57 language about shedding circumferences supplies a human-visible reason to consider *circular* orderings, while earlier Cicada puzzles used columnar transposition and reversed byte-stream reads. A bounded all-secret original-input check therefore allows each complete printed unknown word to be read forward or backwards and, more permissively, from any circular starting rune in either direction, with a different arbitrary secret GP29 alphabet bijection applied to every resulting whole word. Under such operations the ordered equality signature is allowed to change along the finite circular orbit; the frequency multiset remains unchanged.

| Allowed source word reorientation before arbitrary word-wise substitution | Original words unmatched against fixed GP29 English lexicon | 10–12-rune unmatched |
| --- | ---: | ---: |
| Printed forward orientation only | 51 | 39 |
| Individually choose forward or reverse | 40 | 30 |
| Arbitrary word-wise circular shift (forward) | 26 | 20 |
| Arbitrary word-wise circular shift and reversal | **22** | **17** |

The most permissive cyclic/reversal model still fails on **22 source-original printed words**. Thus simply reading each word around its circumference, reversing boustrophedon lines, reordering words/pages, and applying a secret position-preserving substitution per word cannot recover **ordinary English from the pinned finite lexicon** at every original word boundary. This says nothing about position-dependent alphabets, noncircular transpositions, word repartition, different plaintext registers, or the unknown meaning of the p57 circumferences metaphor. The original book does not provide a unique circular start for each printed word, so the test grants this freedom deliberately rather than fits a chosen orientation.

## Adjacent cryptanalytic family: secret periodic alphabet changes inside words

This gate can be relaxed independently of transposition. Allow an **arbitrary independent secret GP29 bijection per word and per position-clock phase** of fixed period k, with the phase origin freely reset at each printed word. The invariant becomes the equality patterns within each word's k interleaved residue subsequences; equality across different phases is discarded. Reconstruct the same native-English dictionary pattern inventory at the selected period.

| Separate substitution phases per word | Original words lacking any matching English dictionary word, among 2,896 |
| --- | ---: |
| k = 1 (one alphabet per word) | **51** |
| k = 2 | **11** |
| k = 3 | **1** |
| k = 4 | **1** |
| k = 5 | **0** |
| k = 6 | **0** |
| k = 7 | **0** |
| k = 8 (matching the printed numerical table's eight columns) | **0** |

All k=2 failures span original pp5,9,11,16,25,27,29,31,43,52. The k=3 lone mismatch is physical p13, complete word ordinal 754, a 14-rune string; k=4 is physical p43, word ordinal 2341, also 14 runes. These are finite dictionary misses without asserting that the original cipher has periodic alphabets. A secret **two-phase position substitution is still insufficient** for the finite-English target, even under unlimited independent per-word alphabet choices. At period five and above this dictionary invariant has **no discriminating power**. Consequently any claim excluding an eight-column polyalphabetic decoder from the k=1 result would be invalid. The manuscript provides no independent key or precise phase-reset instruction selecting a decoder. The SFT asserts every period count.

## Countercheck: arbitrary word-internal transposition changes the decision

A separate exact wider-family check grants an unrestricted permutation of positions within every word **in addition to** its independent secret 29-rune alphabet bijection. The invariant then weakens to the **sorted multiplicity partition** of symbols, with position order discarded. Under that enlarged family **0/102** original 10–12-rune words lack a matching English lexicon multiplicity partition; **0/815** original 6–14-rune words lack one. Thus the exact 39/102 exclusion relies on the output alphabet being stationary *at each rune position within a printed word*. It **does not exclude** arbitrary within-word substitution plus unrestricted transposition. There is no original source instruction or positional permutation key selecting this much broader mechanism. The SFT asserts both countercheck counts.

## Decision and limits

The original printed long-word shapes require some additional *within-word identity-changing operation* under this particular finite-English target: position-dependent key changes, a nonbijective intermediate alphabet, insertion/deletion or word repartition could all modify equality signatures. Other languages, nonce words, or a larger English lexicon are untested. No selection of one such mechanism, original unknown plaintext, or key follows from this obstruction. A historical clue fixing a reversible candidate operation remains the necessary next input.

**Windows Node.js 22 original-input CI:** [passing run 43444858249](https://github.com/FlareZ123/liber-primus/actions/runs/43444858249), including original source, synthetic controls, all-secret period1–8 checks, circular/reverse word-read family and arbitrary transposition countercheck. The first two failed runs exposed Windows Git-checkout CRLF parsing assumptions; both the shared native-GP reader and this SFT now normalize line endings without changing original rune inputs. The passing run is the accepted execution.

**Fully source-exact CommonJS SFT:** [sims/lp2_perword_alphabet_pattern_sft.cjs](../sims/lp2_perword_alphabet_pattern_sft.cjs). It asserts original counts, the 43-edit budget, 181 solved-word and 102 synthetic planted controls, control corpora, and conditional reference tails. Inputs: [LP2 transcription](../resources/liber-primus/lp2-transcription.txt), [original rune inventory](../resources/liber-primus/lp2-corpus.json), [source-native GP29 encoder](../sims/lp2_native_gp_source_orthography_sft.cjs), and [pinned control texts](../resources/control/).
