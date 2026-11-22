# Solved *Parable* word interiors as prime-totient page cursors: all-F-pattern original-cipher gate

**Agent 10, 13 November 2026. Result:** the natural, fully specified combination of the solved p57 instruction to shed word circumferences, the 55 rune-bearing unknown pages, and the genuinely solved p56 prime-totient/literal-F mechanism is **incompatible with 54/55 or 53/55 original pages**, depending on how a shed GP rune selects its prime cursor. Every possible placement of plaintext-F interruptions is admitted. An additional all-secret initial-cursor gate excludes the same emission law on **34/55 unknown pages for every start in 0–28** and on **20/55 pages for every start in 0–109**, independently of the p57-extracted keys. **No unknown-page plaintext, original key, or destination is recovered.**

## Human-visible clue chain and weakest assumption

The authentic, visibly unencrypted final LP2 page p57, *Parable*, contains **20 complete words and 95 runes**, including the instruction **“WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.”** The fixed printed word lengths are:

\`[7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6]\`.

Remove exactly the first and last rune from **each complete word**. This implements a literal word-level “shed the circumference” and yields **95−40=55** GP29 symbols. Original physical p0–55 have exactly **55 rune-bearing unsolved pages**; p50 is a numeric table without runes. Assign the 55 shed symbols to those 55 pages in source order, skipping p50. The SFT derives the word boundaries directly from the pinned original transcription and verifies their concatenation against all 95 canonical source runes.

The adjacent already-solved p56 *An End* uses the exact, historically established **consecutive-prime totient shift** \`C=(P+φ(prime_j)) mod29\`, with a plaintext F rune copied literally to ciphertext F **without consuming a key step**. Earlier solved-page material also emphasizes prime numbers and Euler's totient. A potentially human-playable continuation is to use each of the newly extracted 55 p57 runes to choose that page's **initial prime cursor**, then repeat the proven p56 mechanism. The source does **not** say that the p57 strict word interiors are prime indices, nor that the p56 cipher must be transferred to p0–55: these are the decisive upstream assumptions, subject to the original-cipher test.

Only two natural numeric readings of the exact same 55 source runes are evaluated:

1. **GP-index seed:** use the shed 0-based GP rune index as the 0-based index into the consecutive-prime list, ranging 0–28.
2. **GP-prime-ordinal seed:** use the rune's canonical GP prime value as a one-based prime ordinal, so the cursor is that prime value minus one.

Each page's cursor resets to its assigned seed at that page's actual first GP rune. No unknown key, tuned offset, word permutation, page orientation, phase, added salt, inferred seed, or trained language model is used.

## Complete unknown-literal-F inverse

For an original ciphertext rune \`C_i\` and current cursor \`j\`, set \`K_j=(prime_j−1) mod29\` in the verified GP29 indexing. The authentic p56 transport permits precisely:

- **Literal F:** when \`C_i=0\`, emit plaintext \`F=0\` and leave \`j\` unchanged.
- **Non-F emission:** when \`C_i != K_j\`, emit plaintext \`P_i=(C_i−K_j) mod29\` and advance \`j\` once.

When \`C_i=K_j\`, consuming a prime would produce a plaintext F that should instead have been sent literally without key consumption, so that consuming branch is invalid. A finite dynamic program propagates **every reachable cursor**, including all compatible literal-F masks. If the reachable set empties, no plaintext whatsoever can have produced the original ciphertext under that fixed source-seeded law, regardless of language.

A second exact dynamic program allows an otherwise illegal nonliteral-F emission at cost one, minimizing the count over all possible literal-F choices. These minimum costs are *violations of the specified emission rule*, not proven typographic errors or an independently measured count of ciphertext corrections.

| Fixed source cursor interpretation | Pages with at least one valid complete literal-F path | Ruled out among 55 original pages | Sum of minimum invalid nonliteral-F emissions | Earliest impossible original p0 offset |
| --- | --- | ---: | ---: | ---: |
| GP 0-based index | p43 only | **54/55** | **214** | **49** |
| GP prime value as one-based ordinal | p49, p55 only | **53/55** | **179** | **0** |

Even the two or three exceptional **feasible** pages are merely arithmetically consistent with one or more unknown literal-F paths; the method provides no source-selected actual path or readable plaintext for them. The page groups are **not** independent statistical trials, and no p-value is asserted.

### Genuine known-cipher and native-control checks

Using the independently known English plaintext of **all 85 GP runes of p56**, the SFT regenerates the **85/85 exact original ciphertext runes**, copies its single plaintext F at original index **56** without consuming the prime cursor, and uses exactly **84** prime steps. The exhaustive cursor DP admits the genuine original p56 ciphertext from prime cursor zero, with minimum invalid emissions zero.

For **each of the 55 original page lengths under both seed conventions**, the script independently enciphers a GP-native plaintext plant formed from authentic solved p57 runes. Its original-source-shape ciphertext has at least one exact legal F-skip path, which the same DP admits. This is a control for reachable genuine plaintext under the proposed mechanism, rather than an output-only reversible-shift assertion.

## Independent all-secret cursor-scope gate

The fixed p57-derived keys above have a powerful rival explanation: **the p56 prime-totient/literal-F output rule itself may already contradict the original ciphertext for almost every reasonable starting cursor**, so the p57 shedding match could be incidental. Test this directly without assuming the p57 source keys are correct.

Allow **each** of the 55 pages to choose **any independent, completely secret** initial prime cursor in the full range **0–28**, a strict superset of all possible direct GP rune-index seeds. Retain the exact p56 non-F emission law, and exhaust all literal-F masks by the same DP for every start. **34 of 55 original pages are infeasible for every one of those 29 starts**. These are original physical pages \`[0,2,3,4,5,6,7,8,10,11,12,16,17,18,19,20,21,25,26,29,31,32,33,35,36,38,39,40,41,42,45,46,48,54]\`.

As an intentionally overpermissive sensitivity bound, allow **every** cursor from **0 through 109**, covering every possible GP-prime-value-minus-one start, even values absent from the GP prime inventory. **20 of 55 original pages are still infeasible at every one of the 110 hidden starts**: \`[4,5,6,8,10,12,18,19,20,25,26,29,31,35,38,39,40,45,48,54]\`. Original p0 happens to allow cursors 107 and109 in this wider artificial range, neither equal to the fixed p57-derived p0 GP-prime cursor96.

This is a true **all-secret static-start exclusion** for those finite domains, rather than a fitted language-score result. Its consequences are stronger than, and independent of, the page-to-page p57 key proposal. It does **not** exclude arbitrary offsets outside the declared ranges, changing key schedules, different plaintext-F semantics, or stateful ciphers; no such extension is source-selected here.

## Independent word-local circumference interpretation

The source phrase “shed our own circumferences” also motivates applying the operation separately to **every encrypted complete word**, rather than to solved p57 words alone. To test this distinct interpretation, parse original p0–55 by the published word boundaries, preserving **32 cross-page words**, and shed both the initial and final rune from each word. This leaves **2,365 words with a nonempty interior** (7,247 original interior runes); the remaining 531 original words of length at most two have no interior.

A simple reversible candidate gives **each word's original left or right boundary rune** the role of initial prime cursor for its own interior. The cursor is either that GP rune's 0-based GP index or its canonical prime weight interpreted as a one-based prime ordinal. This is the same authentic p56 non-F emission and literal-F nonconsumption law, with the strictly *word-local* reset fixed before looking at plaintext. The source neither mandates which edge should act as the IV nor that the removed edges truly encode IV metadata. The following exact gate tests all four source-natural conventions and **all** interior F-skip patterns.

| Frozen word-local start | Complete interior words impossible under every legal F-skip pattern |
| --- | ---: |
| Left GP-index edge | **225/2,365** |
| Left GP-prime-ordinal edge | **184/2,365** |
| Right GP-index edge | **203/2,365** |
| Right GP-prime-ordinal edge | **231/2,365** |

The first impossible words occur at whole-word indices 2, 0, 0 and 51, respectively, in the table's order (all indices zero-based). A native GP positive plant of the same interior length under **each of the four fixed schemes and each one of the 2,365 original word positions** has at least one legal F path. These controls distinguish actual failure of the original ciphertext from a parser or cipher simulator bug. The authentic 85-rune p56 positive continues to pass.

**Decision:** retire the direct “shed both outer runes, use either original edge as the within-word prime-cursor seed” interpretation under the proven p56 literal-F emission law. Since each of the four mappings has many *exact infeasible words*, language scoring, F-mask choices or additional prime stream length cannot rescue them. This differs causally from the previous per-page 55-symbol p57 key test: the seed arises from the ciphertext word itself, and the internal clock resets at every original word. Any successor requires an independent clue selecting different key semantics or cipher behavior; the source instruction alone is insufficient.

**Validated complete test:** [passing manual Node.js 22 original-cipher regression 43370206656](https://github.com/FlareZ123/liber-primus/actions/runs/43370206656) using the same [single-file SFT](../sims/lp2_p57_shed_primecursor_fskip_sft.cjs). The executed workflow includes both the per-page all-secret gate and all four word-local seed models.

## Decision and scope

The bounded result, strengthened by the all-secret cursor controls, **rejects direct per-page transfer of the authentic p56 prime-totient/literal-F cipher using the 55 literal strict-word-interior p57 GP symbols as either direct GP-index or canonical GP-prime-ordinal starting cursors** on the unaltered p0–55 text. No post-hoc F skip pattern can rescue either complete model; its contradictions are key-independent once the two source cursor interpretations are fixed.

The mathematical exclusion does **not** reject another meaning of “shed our own circumferences,” a different cross-page mapping, a different operation after extracting the 55 symbols, an original cipher with nonliteral plaintext F consumption, changed word boundaries, or an unknown state/stream-cipher layer. Such successors need a new original clue that specifies their consumer or an actual held-out plaintext prediction. Do **not** rerun prime-cursor sweeps or relax contradictory symbols to fit this failed model.

**Reproduction:** [single CommonJS SFT](../sims/lp2_p57_shed_primecursor_fskip_sft.cjs), using original [GP29 corpus](../resources/liber-primus/lp2-corpus.json), [LP2 printed transcription](../resources/liber-primus/lp2-transcription.txt), and the solved-p56 English passage independently established by the [authentic solved-cipher regression](../sims/authentic_decryption_regression.cjs). The script computes the full original results, asserts the exact original-page contradictions and aggregate minimum costs, exhausts both all-secret cursor domains, and validates all native and historical positive controls. The initial strengthened all-secret test passed [manual Node.js 22 GitHub Actions run 43368821989](https://github.com/FlareZ123/liber-primus/actions/runs/43368821989), and the expanded word-local and all-secret test passed [run 43370206656](https://github.com/FlareZ123/liber-primus/actions/runs/43370206656), including original-image-linked word boundaries, p56's authentic known plaintext, and all positive plants.