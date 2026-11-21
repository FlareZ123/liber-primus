# p6–p32 DH23 block-sum bridge and soft key-skip gate

**Status: intermediate structural observation; no unknown plaintext or authenticated LP2 key recovered.**

Reproduce with:

```sh
node sims/lp2_p6_p32_dh23_keyskip_sft.cjs
```

The SFT uses the canonical GP29 corpus, the original p6 red-ink annotation, the p50 table, the canonical LP2 transcription, and the pinned positive-control text. It does not modify `results/README.md`: this is not an established decryption.

## Source-constrained correspondence

The p6 red span beginning at rune offset 71 contains 11 runes in four printed words of lengths **4|1|4|2**. Their GP0 sums are:

`[71, 19, 65, 26]`

The p32 page's fragment 7 is the 11-rune fragment `HOMEXWDSLFD` at offsets 33–43. Partitioning it with the same 4|1|4|2 shape gives block sums:

`[48, 14, 65, 23]`

The componentwise difference is:

`[71,19,65,26] - [48,14,65,23] = [23,5,0,3]`

This matches the repository's **candidate** p28 DH23 state fields `[p,g,0,e]`. Across all 28 eleven-rune fragments in unresolved pages p0–p55, this is the only exact four-component match.

The correspondence is worth retaining, but it is not a clean independent p-value: the p32 fragment is already selected by the p6→SEEKS=71→p50 route and the existing p32/g-position analysis. The DH23 tuple itself remains a candidate interpretation, not an independently authenticated LP2 key.

The inverse cube `x^19 mod 29` on the selected fragment yields `THEHXITAEMAFAE`; only its first two runes spell `THE`. The underlying ciphertext pair `[8,3]` occurs 15 times across the unresolved corpus, against about 15.3 within-page pair opportunities under a uniform model. The prefix is therefore not a discriminating plaintext recovery. Applying the same bijection to all of p32 leaves its IoC unchanged and does not decrypt the page.

## Direct key test under the soft collision/key-skip model

The most direct way to turn the p6→p32 relation into a cipher key is to use the 11-rune p6 red span as a repeating GP29 key on the 121-rune p32 page. The ordinary additive version is already negative in [Agent44's p6/p32 source-gate SFT](../sims/lp2_redspan_181_p50_path_p32_source_gate.cjs). This SFT additionally tests the external soft collision/key-skip proposal, with suppression probability **0.8129**, maximum skip depth 1, and a width-400 beam.

Both key phases were tested:
- phase 0: natural p32 page-start alignment;
- phase 1: the p50 path lengths 23 and 12 both reduce to 1 modulo the 11-rune key period.

Both arithmetic signs were tested. Every positive control (Gibran text enciphered with the same key, phase, sign, and seeded soft filter) recovered exactly. The p32 scores were:

| Key phase | Direction | p32 score | Inferred skips |
|---:|---|---:|---:|
| 0 | C = P + K | −7.5259 | 0 |
| 0 | C = P − K | −7.2899 | 1 |
| 1 | C = P + K | −7.6384 | 0 |
| 1 | C = P − K | −7.5446 | 2 |

Positive-control score: −4.3864 in all four configurations. These are English-quadgram comparisons, not language-independent proof; they reject the tested repeating p6 key under this specific soft key-skip model, not every possible nonperiodic or external key.

## Important calibration

The p50 functional graph's 11-cycle is a dominant basin: **252 of 256** starting addresses enter it; the other four enter a 2-cycle. Shared-cycle convergence is not selective by itself. Preserve the exact p6/SEEKS path-to-p32 evidence separately from the generic basin result.

## Decision

- Retain the 4|1|4|2 block-sum correspondence as a provisional structural bridge.
- Do not promote `[23,5,0,3]` to a recovered key; it only matches a candidate DH23 state.
- Retire the direct repeating p6 red-span key under ordinary additive and tested soft key-skip Vigenère on p32.
- Do not treat the two-rune `THE` prefix as plaintext.
- The next useful advance would require a first-party-selected nonperiodic operation, key schedule, or independent receiver. Further arbitrary DH/periodic-key variants are not justified by this result.

## Supporting work

- [Agent44's p6 red-span / p32 source gate](../sims/lp2_redspan_181_p50_path_p32_source_gate.cjs)
- [Existing independent soft key-skip implementation and positive-control model](../sims/lp2_2014_onion2_keyskip_beam_sft.cjs)
- [Agent8's p32 HOME/BUDS and DH-register investigation](../sims/lp2_p32_home_buds_p50_loop_sft.cjs)
- [Agent15's source-numbered p32 THE/ARE readout](../sims/lp2_p32_seeks_route_are_readout_sft.cjs)
- [External skip-aware model reference](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/campaign18_skip/skipdecode.py)
- [External campaign findings and model caveats](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round18/L2-filter-leak/RESULTS.md)
