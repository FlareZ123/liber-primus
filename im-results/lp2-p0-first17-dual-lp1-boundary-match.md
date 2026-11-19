# P0 first-17 dual solved-LP1 boundary match

**Agent29, 19 November 2026. Classification: strong intermediate cross-text evidence for the conditional p0 route through THEN. It is not authenticated plaintext and does not supply a cipher inverse.**

## Frozen object

The already-studied p0 candidate through block 17 is a 22-word prefix:

```text
AS I GO THE WEATHER TURNS COLD
I MAY CRY NOW
THE IDEA OF THE END IS DEATH
SEE YOU SOON THEN
```

The first-window LP1 correspondence was already documented. This audit exhausts every within-page seven-word window on solved LP1 pages 0–16 and asks whether the other boundary has the same typed relationship.

English uses the repository's source-calibrated GP spelling: `QU→CW`, `V→U`, `K/Q→C`, `Z→S`, `ING→NG`, and `IO→IA/IOR`. A pair is admitted only for identical GP-rune count, identical GP prime-value sum, and a one-step Euler-totient relation between rune-index sums. There are **658** solved-LP1 windows in this declared family.

## Exact exhaustive result

Across all **16** seven-word windows of the 22-word p0 prefix and all 658 LP1 windows, exactly **two** pairs satisfy the full predicate.

| p0 candidate boundary | Candidate stats | Solved LP1 window | LP1 stats | Exact relation |
| --- | --- | --- | --- | --- |
| first 7: `AS I GO THE WEATHER TURNS COLD` | 21 runes; index **233**; GP **825** | p1: `YOU KNOW TO BE TRUE TEST THE` | 21 runes; index **232**; GP **825** | `phi(233)=232` |
| last 7: `END IS DEATH SEE YOU SOON THEN` | 21 runes; index **268**; GP **969** | p10: `WE HAVE WHAT WE HAVE NOW BY` | 21 runes; index **269**; GP **969** | `phi(269)=268` |

The known opening match therefore has a second partner at the opposite boundary of the same 22-word candidate prefix. The totient direction reverses: candidate→LP1 at the opening and LP1→candidate at the closing boundary.

## Prose controls

Every 22-word span in the three pre-existing English controls was tested using only its first seven and last seven words against the same 658 LP1 windows.

| Control | 22-word spans | at least one boundary match | both boundary matches |
| --- | ---: | ---: | ---: |
| Shakespeare | 55,386 | 166 | **0** |
| Gibran | 15,712 | 61 | **0** |
| Emerson | 77,911 | 219 | **0** |
| **Combined** | **149,009** | **446** | **0** |

These are overlapping literary windows, so `0/149009` is a direct selectivity control rather than a formal independent-trials p-value.

## Interpretation and limit

This strengthens the p0-through-THEN candidate as a structured object. The second collision was absent from the prior synthesis. The boundary-pair framing, however, was recognized after discovering that second match. The 22-word prefix predates this audit, while this exact statistic was not prospectively locked. It therefore does not establish Cicada authorship, authenticate the proposed plaintext, or rescue the underselected transition grammar.

The next useful test is whether the two 21-rune LP1↔p0 pairs share a source-selected reversible transformation or key relation. A common transfer would turn the checksum into mechanism evidence.

## Reproduction

```text
node sims/lp2_p0_first17_dual_lp1_boundary_match_sft.cjs
```
