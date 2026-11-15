# Original LP2 32 page-carry words: prime/F word-clock synchronization gate

**Agent12, 15 November 2026; Director [#1184](https://github.com/FlareZ123/liber-primus/issues/1184). Classification: bounded original-cipher exclusion and a calibrated seam ambiguity. No new plaintext, LP2 key, or creator-specified clock reset was recovered.**

## What an original solver might try

The original LP2 transcript contains exactly **2,896 complete words and 12,956 runes** in physical p0–p55, including **32 whole words divided by the physical page boundary**. The prime-totient cipher is a real Cicada operation, used on solved p56 with literal-F clock transparency. A natural, readily executable speculation is that the p56 operation recurs on unknown LP2 with its prime clock **restarted on each printed word**. The 32 split words then give a direct question: when the physical page changes halfway through one word, does its clock carry through or restart again?

That word-start hypothesis is **not a historical Cicada instruction**. A physical page is a typesetting unit, while the original solved LP1 second koan uses one legitimate 13-rune keyword clock continuously across physical pp14–15. Its historical cipher is different from p56. The independent rival is that neither of the newly proposed word clocks is present at all.

Earlier seam tests excluded a **different** arbitrary page-key plaintext-autokey recurrence in [the 32-word affine gate](lp2-crosspage-plain-autokey-seam-gate.md). This test holds the authentic **nonstationary prime-totient sequence and literal-F bypass** fixed, and changes only the physical page reset policy. It does not retest free page-affine keys, 2015 first differences, prior periodic all-secret substitutions, or 256-table shell encodings.

## Frozen complete cipher

Use the authenticated 29-rune GP order and source-native text spelling, including the single GP symbols for **ING** and **IO**. For a complete printed word with plaintext \`P[i]\` and ciphertext \`C[i]\`, let \`k[j] = (prime[j] - 1) mod 29\`, where \`prime[0]=2\`. For a non-F plaintext symbol:

\`\`\`text
C[i] = (P[i] + k[j]) mod 29;  j += 1
\`\`\`

A literal plaintext F has numeric value zero, emits ciphertext F, and **does not consume** a key. An encrypted non-F may also emit F. Its inverse enumerates both ciphertext-F branches, rejects any key-consuming branch that would decode to plaintext F, and merges paths with the same number of consumed key symbols. Its forward encryption is exact.

The prime clock starts at \`j=0\` at **each genuine printed word**. For a split word with \`s\` runes on the earlier page, freeze these alternatives:

- **Carry:** process all word runes under one continuous clock.
- **Page reset:** additionally set \`j=0\` immediately before word position \`s\`, without inserting or discarding a glyph.

Neither key offset nor plaintext is tuned to the original unknown text. This is a complete reversible cipher under either policy. It is deliberately a narrow test of whether the *source-attested primitive with newly hypothesized word restart* can survive untouched original LP2.

## Exact original-source experiment

The read-only [CommonJS SFT](../sims/lp2_pagecarry_wordprime_Fclock_original_sft.cjs) verifies every source transcription page against [the canonical 58-page GP29 index corpus](../resources/liber-primus/lp2-corpus.json), joins words across line and page breaks, and asserts the **12,956/2,896/32** inventories.

Before examining any decoded candidates it chooses one matched within-page word for each of the 32 splits. The control has the **same GP-rune length**, is drawn from the **same visual chapter** whenever possible (31/32), and minimizes page and page-edge positional distance. The one length not found within its chapter uses the nearest same-length word in the whole manuscript. It inserts an *artificial* key reset after the identical split position \`s\`, leaving the original matched ciphertext unchanged.

| Untouched original word group | Continuous word clock legal | Word clock with page/virtual reset legal | Original words in group |
| --- | ---: | ---: | ---: |
| **32 genuine physical-page carry words** | **29** | **26** | 32 |
| **32 length/near-edge matched within-page words** | **26** | **27** | 32 |
| **All 2,864 genuinely within-page words** | **2,493** | same (no physical page break) | 2,864 |

"Legal" means *at least one* GP29 string obeys the real plaintext-F skip constraint for this fixed key schedule. It is a permissive necessary condition, **without** requiring linguistic plausibility or choosing any English text. Of the 32 genuine crossings, **27** have the same legal/impossible classification under both policies. Four are legal only under carry: **p5→6, p8→9, p16→17, p45→46**. Only **p52→53** is legal under reset alone. Three crossings are impossible under continuous clock; six under page-reset clock.

More decisively, there are **371 intact within-page original words with no legal plaintext under either policy**. This is an exact source-cipher contradiction independent of the 32-seam sample, punctuation interpretation, language model, or choice of plaintext. Every word-started source-prime clock with **key index zero** in this frozen family is ruled out on those 371 originals, even before selecting the physical-page reset rule. The slight 29-versus-26 seam preference cannot rescue either encoder or support a general claim that LP2 carries page state.

## Authentic and generated controls

- The same prime-totient and transparent-F encoder reproduces the **actual solved p56 ciphertext 85/85** using its independently known GP plaintext and real complete-page clock. This tests all 84 consumed primes and the literal plaintext-F bypass, including ciphertext Fs generated from non-F plaintext.
- The source-native GP encoder reproduces all **95/95** original clear-rune p57 symbols, including the seven-rune title **PARABLE** and source-native **ING** spelling. The encoder also implements the independently LP1-authenticated **IO** spelling.
- Taking actual, independently clear GP runes from p57, the SFT plants **32 source-shape words under each of the two fixed policies** with the 32 authentic split positions and lengths. Every one of the 64 planted ciphertexts retains at least one legal F-clock inverse path. This checks the split-state implementation, not the historical correctness of the proposed word restart.
- The complete read-only SFT executed successfully in a [manual Windows/Node22 Actions run 43771384750](https://github.com/FlareZ123/liber-primus/actions/runs/43771384750), job \`exact-source\`. An initial control fixture omitted the original p57 PARABLE heading and failed an assertion; that fixture was corrected before this passing run.

## Research decision

**Retire only this source-prime, word-start-zero, plaintext-F-transparent GP29 additive family for the unchanged LP2 word segmentation, under both page-seam policies.** There is no unique viable seam policy, and neither branch yields 150 runes of plaintext, a reusable unknown-page key, or a decoder eligible for the blind p55 [#41](https://github.com/FlareZ123/liber-primus/issues/41) gate.

The 32 page-carry positions remain valid **held-out synchronization constraints** for a future *independently sourced changing-key* cipher. To reopen, require a new original clue fixing its key schedule, state update and plausible original decoding operation **before** scoring the 32 seams. A different word- or page-conditioned secret, altered F rule or unknown plaintext register is outside this exclusion. Source-only page-carry counts cannot identify a cipher-clock reset when wrong reversible branches can generate the same original ciphertext.
