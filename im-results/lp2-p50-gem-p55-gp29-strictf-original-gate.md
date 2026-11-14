# Original p50 GEM three-cycle as a direct GP29 p55 key: strict-F impossibility gate

**Agent 14, 14 November 2026. Evidence status:** bounded original-cipher negative for the exact historically attested F-transparent Vigenère consumer. This is **not** an authenticated unknown LP2 decryption or a rejection of the p50 graph as a possible clue.

## Source-selected candidate and exact assumptions

The original 32×8 numerical table across LP2 physical pp49–51 is recorded in [the original grid corpus](../resources/liber-primus/lp2-grid-256.json). Prior independent work found that an original 2016 signed Cicada image is 563×569 pixels, the **103rd and 104th primes**. Under the **investigator-proposed**, not first-party-authorized, decomposition of each base60 table byte into `29q+r`, remainder `r` names a GP29 rune and quotient `q+1` gives a standard 3×3 keypad direction. Starting at one-based table cell 103 produces the exact source path **103→111→119→127→128→119**, whose emitted GP runes are `O O G E M`, with a repeating **G E M** cycle. This path and its weaknesses are independently documented in [the source graph and shuffled-table test](lp2-p50-gem-prime103-source-shuffle-gate.md).

A previously investigated consumer used the speculative p55 five-rune byte packet plus repeated GEM-derived byte keys (21 fixed XOR/add/sub consumers), with no printable result. [That distinct byte test](lp2-p50-gem-p55-quintet-binary-direct-consumer.md) did **not** examine direct GP29 historical Vigenère with authentic plaintext-F behavior. The present test makes one minimal cipher-rule hypothesis: use the original table's **GEM** GP29 index tape `[6,18,19]` as a periodic additive key in original manuscript reading order. The historical LP1/p56 forward rule is:

`P=F: C=F, key clock unchanged; otherwise: C=(P+K_clock) mod29, key clock increments.`

Thus ciphertext F offers bypass or encrypted non-F interpretations, but any **key-consuming** transition that yields plaintext F is invalid. All three cyclic phases of GEM are admitted to avoid an unsupported chosen starting phase. The original **76-rune p55**, including its single rune carried from p54, is the primary untouched target. The independently source-visible **75-rune suffix p55 local1–75** is a secondary clock-start case. Neither page segmentation, rune identities nor F positions may be edited.

## Exact findings on unchanged original input

The original p55 ciphertext contains F at local offsets **15,25,41** (zero-based). A complete enumerator retaining every legal bypass/consumption path returns:

| GEM phase | Candidate GP29 key | Full p55: earliest impossible rune offset | p55 suffix: earliest impossible suffix offset | Surviving full/suffix masks |
| --- | --- | ---: | ---: | ---: |
| 0 | GEM | **2** | **48** | 0 / 0 |
| 1 | EMG | **11** | **1** | 0 / 0 |
| 2 | MGE | **49** | **10** | 0 / 0 |

These failures are **exact consistency contradictions** with the transparent-F encoder. They do not depend on English word scores, rune frequency, punctuation guesses, or a post-fitted bypass mask. Directly connected original p53's separately ink-confirmed **51-rune red span** has respectively **2, 0, 0** surviving masks under those phases. It does not supply a full separate decryption; its potential source association (repeated moth) remains conditional.

**Native positive control:** encrypt the unchanged clear **95-GP-rune original p57** under each phase using the same strict plaintext-F encoder, then enumerate the inverse paths without supplying the bypass locations. Each recovered state space contains the **exact** source-clear p57 and re-encrypts identically. The test also checks exact p55 input size, original F positions, all five table path positions and source p53 ink-derived red rune identities.

**Important rival:** the **full transient path `OOGEM`**, rather than just its GEM cycle, is a different five-rune tape `[3,3,6,18,19]`. It leaves **one** legal original p55 inverse path, with **zero** literal-F skips, and a nonlinguistic sequence beginning `E OE P NG B EO X H U AE N O B P G Y...`. This is **not** a ciphertext-rule impossibility for that different key; coherent plaintext or a first-party instruction selecting a one-time prefix has not emerged. It would be invalid to describe the whole navigation hypothesis as excluded.

## Decision

The **three-phase direct repeating GEM-cycle key** cannot invert original p55 under the historically solved strict-F Vigenère mechanism, irrespective of whether the p54 carry rune is included at the restart. Retire only that specific original-space consumer. It does not reject a different original LP2 cipher, the source's tentative graph/navigation scheme, an unknown-page cipher without F bypass, or a different originally selected key. The decisive missing upstream element remains a first-party instruction selecting the graph decomposition and the GP29 key consumer; no unknown original plaintext/key/destination is recovered.

**Single-file reproducible test:** [`sims/lp2_p50_gem_p55_gp29_original_sft.cjs`](../sims/lp2_p50_gem_p55_gp29_original_sft.cjs) loads unchanged checked-in source JSON and executes the enumerator, source assertions, full/suffix comparison and native planted controls in Node.js 22. This result was calculated against the canonical GitHub original arrays; no GitHub Actions execution is claimed.
