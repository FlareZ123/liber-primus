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

## Native positive controls and independent comparison

The 181 original, independently solved LP1 plain rune words on physical pages 10–13 all possess registered native-English equality signatures. A 102-word planted English source transformed under a different GF29 affine alphabet permutation for each complete word retains 102/102 matching signatures. These tests establish that the invariant does not accidentally reject genuine native-English source controls under the proposed bijective cipher.

| Native English control | 10-rune misses/total | 11-rune misses/total | 12-rune misses/total |
| --- | ---: | ---: | ---: |
| Shakespeare | 30/533 | 39/161 | 21/62 |
| Gibran | 12/176 | 10/83 | 6/35 |
| Emerson | 98/1,346 | 88/709 | 93/368 |
| **Pooled** | **140/2,055** | **137/953** | **120/465** |

The pooled three-corpus reference, sampled without replacement conditional on the original 52/32/18 length histogram, expects about 12.79 unrecognized signatures; the finite hypergeometric upper tail of 39 or more is 4.0744123510e-12 under that exact conditional model. With rune lengths 6 through 14 included, the original has 51 incompatible shapes in 815 words; the pooled length-conditioned reference expects about 22.74 and yields an upper tail 9.7707062022e-9. This is a retrospective, word-token-pool comparison whose samples are not statistically independent English generators. It is not an authorship probability or a universal theorem about all English. A solved p57 word of 14 runes is itself outside the registered lexicon's shape inventory, demonstrating its limits.

## Decision and limits

The original printed long-word shapes require some additional *within-word identity-changing operation* under this particular finite-English target: position-dependent key changes, a nonbijective intermediate alphabet, insertion/deletion or word repartition could all modify equality signatures. Other languages, nonce words, or a larger English lexicon are untested. No selection of one such mechanism, original unknown plaintext, or key follows from this obstruction. A historical clue fixing a reversible candidate operation remains the necessary next input.

**Fully source-exact CommonJS SFT:** [sims/lp2_perword_alphabet_pattern_sft.cjs](../sims/lp2_perword_alphabet_pattern_sft.cjs). It asserts original counts, the 43-edit budget, 181 solved-word and 102 synthetic planted controls, control corpora, and conditional reference tails. Inputs: [LP2 transcription](../resources/liber-primus/lp2-transcription.txt), [original rune inventory](../resources/liber-primus/lp2-corpus.json), [source-native GP29 encoder](../sims/lp2_native_gp_source_orthography_sft.cjs), and [pinned control texts](../resources/control/).
