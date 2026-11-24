# Insect plate shared arbitrary GP29 permutations: original equality gate

**Decision (#2485, 24 November 2026):** no common recoverable key, no new plaintext. The strongest geometry-fixed nonlinear shared-key model preserves equality partitions and has no further per-rune constraint when every position has a freely chosen permutation. The observed triple has an unusually low match count in finite authentic native-prose samples, yet admits many mutually incompatible lexical witnesses. Do not open a common-key recovery sweep on this evidence.

## Source and frozen receiver

Use the original p24/p26 insect plate correspondence, with p25 the neighboring near-art variant; this is the same physical first-complete-word geometry independently specified in the earlier [three-page affine study](lp2-p24-p26-insect-threeway-affine-allsecret-exact-gate.md). Read canonical corpus and transcription, assert all original rune indices match, remove the initial carried-word fragments of lengths 3/2/1, preserve every remaining source word slot, including terminal carry prefixes. Physical page lengths 270/273/265, aligned lengths 267/271/264. No fitted displacement, additive/multiplicative differences, alternate clock, or language-score optimization. Earlier [#2148](https://github.com/FlareZ123/liber-primus/issues/2148) and [#2451](https://github.com/FlareZ123/liber-primus/issues/2451) do not exclude arbitrary nonlinear permutations.

## Exact model and original observations

For each t, C_j(t)=pi_t(P_j(t)) where pi_t is any bijection of 29 runes and the same map acts on all synchronized pages. The **entire equality partition** of the plaintext triple must equal that of the ciphertext triple. This condition is also sufficient: map the d distinct proposed plaintext symbols to the d corresponding observed symbols and extend arbitrarily to a permutation of the remaining alphabet. The number of extensions is (29-d)! at that site.

| Pair | Equalities / compared positions |
|---|---:|
| p24 / p26 (exact art pair) | 10/264 |
| p24 / p25 (near-art) | 8/267 |
| p25 / p26 (near-art) | 9/264 |
| Total | 27/795 |

Across the common 264 positions: 237 all-distinct, 8 p24=p25, 10 p24=p26, 9 p25=p26, zero all-three-equal. The next three positions have two distinct observed runes; the final four have only p25. For **each** compatible full plaintext assignment, there are (26!)^237 (27!)^30 (28!)^4 distinct private map sequences that exactly re-encrypt it (approximately 10^7264.58). The map sequence has no specified continuation constraint. With two tracks, equality/inequality is the only information; adding the third gives its equality partition but cannot distinguish arbitrary distinct triples.

## Independent controls

Read genuine LP1 runic transcription rather than re-transliterating edited Latin: the actual 778-rune first koan from LP1 segments 4–7 decoded by P=2-C mod29, and 755 clear runes of LOSS OF DIVINITY from LP1 segments 8–11. Confirm source lengths and decoded koan start. The fixed seed 0x33012426 samples 2,000 triples of disjoint within-text windows: two lengths 267/271 from one native text (both orders), the 264-rune length from the other, alternating sources. Windows are contiguous and non-overlapping within a sample; samples overlap across trials, so empirical frequencies are descriptive rather than independent p-values. Lengths are exact; native word layout is not matched. A shared nonlinear shuffled-alphabet positive preserves the full partition exactly. An authentic repeated 42-rune koan passage at offsets 62 and 417 yields 42/42 matches under a shared map (and exact original rune equality), demonstrating the sensitivity to repeated plaintext. The repeated phrase begins WHO ARE YOU WHO WISHES TO STUDY HERE. No repeated 42-rune original cipher segment is asserted.

| Statistic | Original | Native median | Native 5–95% | Native <= original | Independent uniform median | Independent <= original |
|---|---:|---:|---:|---:|---:|---:|
| Total equality matches | 27 | 50 | 38–64 | 1/2000 | 27 | 1050/2000 |
| Exact-art p24/p26 equalities | 10 | 16 | 10–24 | 129/2000 | — | — |
| All-three-equal positions | 0 | 1 | 0–4 | 520/2000 | — | — |

The uniform-independent expected total is 795/29=27.414. Thus the two-page statistic alone is weak; the third original near-variant strengthens the finite native-prose objection but gives no receiver or common-state law. This is complementary to, and does not repeat, the earlier [book/chapter page-start shared-bijection gate](../sims/lp2_pageoffset_allsecret_reuse_gate.cjs), which uses different synchronization and many more pages.

## Constructive nonidentifiability with original word lengths

A bounded randomized min-conflict search selects actual entries of the pinned TextBlob GP29 lexicon for **every** remaining printed word slot, with five allowed one-rune forms (A/I/O/TH/OE). The p24 terminal 8-rune fragment and p25 terminal 5-rune fragment are prefixes of full 10- and 6-rune dictionary words respectively; their two/one excluded next-page suffix runes are not shared-map tested. The initial p23→p24 carry is outside this alignment. It enforces all 795 pairwise equality/inequality constraints. It is a constraint witness generator, not a language solver. The dictionary includes proper names and rare/abbreviated entries. Two deterministic runs found zero-conflict assignments in 62 and 556 updates respectively. The assignments disagree at **748 of 802 original aligned rune positions**. They both preserve all included complete word lengths, and each has a constructive shared 29-permutation at every position which exactly re-encrypts all 802 symbols. The output records their full word lists. Neither reads as meaningful prose; neither is proposed as decryption. This proves the finite lexical constraint is non-unique and cannot by itself establish a decoder. It does not prove that multiple grammatical, coherent LP2 plaintexts exist.

## Research decision

The strong shared-three native-prose interpretation is disfavored within these controls, while the arbitrary private permutation family remains underdetermined even with the near-art third passage. The exact pair alone cannot reject the family. No fourth independently selected homologous span, relationship across pi_t, or creator-specified map generator follows. Retire direct recovery from this equality signature; a future attempt requires an independently selected reusable map schedule, genuinely repeated plaintext, or a source-constrained receiver.

Reproduce with [standalone CommonJS SFT](../sims/lp2_insect_shared_arbitrary_bijection_sft.cjs); [exact output including original match locations and two witnesses](lp2-insect-shared-arbitrary-bijection-output.json). Executed in isolated JavaScript on exact repository source inputs; Windows CI not claimed. The statistical comparison is conditional on the two finite authentic source texts and selected clock, and the word witness generator is not exhaustive. No change to authoritative established plaintext status.
