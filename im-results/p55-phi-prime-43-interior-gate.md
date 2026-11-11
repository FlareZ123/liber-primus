# Direct solved-p56 prime-totient transfer to p55's 43 interiors: bounded negative

**Classification:** one source-motivated, finite original-input negative. No unknown plaintext, new key, or cipher mechanism was recovered.

## Why this is a natural next test

The solved p57 passage says to “shed our own circumferences” and “find the divinity within.” On original p55, removing the first and last rune of each complete printed word selects 43 interior runes. Independently, the solved LP1 text calls the totient function sacred, and solved LP2 p56 provides an authenticated GP29 operation: subtract successive prime totients, `p_i-1 mod 29`, with a selected literal-F rune emitted unchanged without consuming a key position.

This is a direct, recognizable human solve path: use p57 to select p55's interiors, then try the already demonstrated prime-totient operation rather than inventing a new key. The weak premise is explicit: no source says the p56 cipher must be reused on p55. That makes this a bounded test, not a claim that the operation was intended.

The positive control is the repository's [authentic p56 regression](../sims/authentic_lp2_p56_totient_regression.cjs), which recovers all 85 known p56 plaintext runes from prime start 0 and the single literal-F skip at ciphertext offset 56.

## Exact p55 extraction

The canonical parser gives physical p55 (corpus page 55) 76 runes:

- One incoming carry rune from p54.
- 16 complete words beginning on p55, containing 75 runes.
- Strict interiors of those 16 words: **43 runes**.
- Complete-word lengths: `[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`.

There is one F in the 43-rune interior stream, at compacted offset 11. In the full 76-rune page, F occurs at page-local offsets `[15,25,41]`; only the first of these lies inside the selected interiors.

## Frozen operation and clocks

The cipher and key start are fixed to the solved p56 rule:

`P_i = C_i - (p_i-1) mod 29`

with the first key prime equal to 2 (prime index 0). A selected ciphertext F is output as literal F and does not consume a key position. No sign, start offset, key, or alphabet is searched.

Two source-plausible key clocks are tested:

1. **Compacted interiors:** remove each word's first/last rune first, then start the prime-totient clock at the first selected interior. Enumerate both choices for the sole interior F (consuming or literal/non-consuming).
2. **Original page clock:** start at the first rune of p55, advance the key through all 76 page runes, and only read out the 43 selected interiors. Enumerate all (2^3=8) literal-F masks over the three page-local F positions, including boundary F symbols that can affect the key phase.

Every case re-encrypts the exact original selected input (or the full original p55 page for the page-clock cases). The script also re-runs the known p56 positive control and asserts exact recovery of its established 85-rune plaintext.

## Results

The original p55 interior IoC is **0.03433001**. A same-length 43-rune body excerpt from solved p57 has IoC **0.05647841**.

| Clock | Literal-F treatment | IoC |
|---|---|---:|
| Compacted interiors | F consumes key | 0.03543743 |
| Compacted interiors | F literal/non-consuming | **0.04097453** |
| Original page clock | no F skips | 0.03543743 |
| Original page clock | page F offset 15 literal | 0.02879291 |
| Original page clock | page F offset 25 literal | 0.02879291 |
| Original page clock | page F offsets 15,25 literal | 0.02879291 |
| Original page clock | page F offset 41 literal | 0.03322259 |
| Original page clock | page F offsets 15,41 literal | 0.02657807 |
| Original page clock | page F offsets 25,41 literal | 0.02990033 |
| Original page clock | all three page F runes literal | 0.03433001 |

The best compacted output (literal F at interior offset 11) is:

`E H H F P M J G A G IA F W EA G P J P G P H U O O EO EA EA O L X E AE U NG N EA P B OE IA W W EO`

The original-page-clock no-skip output is:

`S R J EA EO E IA OE N OE M T EA L IA C A EA B EA B IA TH F N M M OE I F G B H O T EO Y TH EA TH W U B`

Neither is recognizable GP29 prose. The best IoC remains below the solved p57 control; the short sample is not used to claim a formal statistical exclusion.

## Decision

Reject this exact transfer: the authentic p56 prime-totient key, fixed at its genuine first-prime start, does not decrypt p55's 43 strict interiors under either the compacted-interior or original-page clock, across every relevant literal-F mask.

This does not reject the p57 circumference clue, the p56 cipher, other prime starts, a different source-selected key schedule, or another reversible operation. Do not expand this branch into arbitrary prime-start, sign, phase, or word-reset searches. A successor needs an independent source cue that selects a different state or operation.

## Reproduction

From the repository root:

    node sims/p55_phi_prime_43_interior_gate.cjs

The reproducer uses only the canonical corpus/transcription and the existing solved p56 rule. It asserts p55's word boundaries, carry, 43 interiors and F positions; exact p56 recovery; all ten p55 inverses; and exact re-encryption controls.
