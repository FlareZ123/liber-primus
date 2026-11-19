# P0 first17 global original-ciphertext checksums

**Agent29, 19 November 2026. Classification: strong intermediate route-level evidence for the conditional p0–p2 reconstruction through THEN. These identities use original ciphertext cells and physical coordinates, but they were recognized after the route was constructed and therefore do not authenticate the plaintext by themselves.**

## Frozen route object

Take the documented **first 17 blocks**, from `AS I GO THE` through `THEN`, using the main row-25 `SOON` placement. Freeze only their ciphertext coordinates. Read rune values from the canonical repository p0–p2 corpus.

This route contains **61 ciphertext-cell uses** at **54 distinct physical coordinates**.

## Checksum 1: 3301 from all ciphertext uses

Sum the Gematria Primus prime value of every ciphertext use, counting repeated coordinates each time they are used:

```text
sum GP(ciphertext uses) = 3274
matrix side length       =   27
                           ----
                            3301
```

Thus the complete first17 route satisfies:

`3274 + 27 = 3301`.

No plaintext values or decryption keys enter this checksum once the route coordinates are frozen.

## Checksum 2: distinct-cell prime-index identity

Now count each of the **54 distinct ciphertext coordinates once**.

Their GP prime-value sum is:

`2867`.

Their one-based row-major absolute positions in the original 27×27 matrix sum to:

`26083`.

The 2867th prime is exactly 26083:

`p_2867 = 26083`.

Thus two independent measurements of the same selected original-cell set, rune content and physical position, meet through a prime-index operation.

### Orientation control

The GP sum 2867 is invariant under square symmetry, while the row-major position sum is orientation-sensitive. Applying all eight D4 symmetries to the same 54 coordinates gives:

```text
26083, 21691, 13337, 17729, 25919, 13501, 22157, 17263
```

Only the manuscript's original orientation equals `p_2867 = 26083`.

## Documented alternate SOON control

The route documentation contains a second four-rune `SOON` ciphertext at row 27. Substitute only that alternative while keeping the other 16 blocks fixed.

The alternate route still has 61 uses but now 55 distinct cells:

- all-use GP sum = **3214**, so `3214 + 27 = 3241`, not 3301;
- distinct-cell GP sum = **2854**;
- distinct-cell position sum = **26995**;
- `p_2854 = 25939`, not 26995.

Thus both global identities select the main row-25 SOON route over the already documented same-plaintext alternative.

## Interpretation

These are materially stronger than another plaintext-only numerical coincidence because they operate on original ciphertext values and fixed physical locations. The prime-index identity also ties content to position and is orientation-specific.

The causal limitation remains important. The first17 route was reconstructed before these global checksums were noticed. The identities therefore validate and discriminate a frozen route; they do not explain how a solver should have selected all 17 transitions prospectively. The useful next test is to enumerate other source-compatible first17 route alternatives and measure whether either checksum uniquely selects the published path without language.

Source route documentation: current public `2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption`, block files 01–17 and its `Start-reading-here/strongest-plaintext-evidence.md`. Canonical rune values are taken from this repository's `resources/liber-primus/lp2-corpus.json`.

## Reproduction

```text
node sims/lp2_p0_first17_global_ciphertext_checksums_sft.cjs
```
