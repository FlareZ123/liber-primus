# Public 2026 27×27 LP2 plaintext claim: exact 38-block original-cipher replay

**Status, 14 November 2026 (Agent12):** A newly indexed 2026 public GitHub claim yields **115 individually reproducible modular subtractions on original LP2 pp0–2**, but reconstructs only **103 distinct locations out of the original 729 runes**, chosen in nonoriginal order, with **12 repeated ciphertext reads**. It provides no first-party route that chooses those locations/keys before observing English, no 100 consecutive unknown-runic plaintext, and no untouched 40-rune prediction. **Do not promote the resulting English to an authenticated decryption.**

## Exact public source and what it actually claims

The version-fixed [public claimant repository](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/tree/ab9d8190e60009179563ac21b2d750271c2782b3) (commit `ab9d8190e60009179563ac21b2d750271c2782b3`, timestamp 2026-11-12 08:38:58Z) calls its reading of the original three LP2 pages `AS I GO THE WEATHER TURNS COLD ... GO DO AS I ASK` and presents 38 [individual block walkthroughs](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/tree/ab9d8190e60009179563ac21b2d750271c2782b3/plaintext-i-found). The original LP2 pp0,1,2 contain 262+266+201=729 source runes; the proposed 27×27 reinterpretation is numerically exact as an image-of-text reshaping.

The stated mechanism extracts an arbitrary three-rune key node elsewhere on the 27×27 source grid, **optionally** replaces its center by Euler φ, takes μ(φ) key-component signatures to rotate the key, and computes `P=(C−K) mod29` on a separately chosen short ciphertext path. Several walkthroughs use horizontal, vertical, diagonal and changing directions, with assorted starting cells, keys and routes. Its [own method document](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/ab9d8190e60009179563ac21b2d750271c2782b3/Start-reading-here/00-decryption-method.md) leaves the `transform_center` boolean a separate input, and its [README](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/ab9d8190e60009179563ac21b2d750271c2782b3/README.md) explicitly acknowledges that **selecting an exact next location remains an open problem**. The author's [strongest-evidence report](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/ab9d8190e60009179563ac21b2d750271c2782b3/Start-reading-here/strongest-plaintext-evidence.md) explicitly calls several numerical-relationship screens *retrospective*, after the English was found. This distinguishes the author's speculation from a precommitted route to unknown plaintext.

## Exact original-input replay

[Reproduction program](../sims/lp2_2026_public_27x27_original_claim_sft.cjs) takes the original canonical `resources/liber-primus/lp2-corpus.json` source runes, fetches all 38 version-fixed individual public walkthroughs, extracts *only the primary* ciphertext/key/output tables, and checks both that each printed rune equals the original physical-page reading-order source at its claimed grid coordinate and that `(C−K) mod29` equals the stated output rune. This distinguishes the canonical first SOON route from a fully documented *alternative* path that independently spells the same word. The first run mistakenly counted that optional second SOON path (119 instead of 115), and the revised primary-route extractor passed completely.

| Exact result for the claimed 38 primary blocks | Value |
| --- | ---: |
| Original ciphertext pp0–2 | **729 GP29 runes** |
| Claimed selected plaintext rows | **115 GP29 runes** |
| Original-and-modular-equation matches | **115 / 115** |
| Unique original ciphertext positions consumed | **103 / 729** |
| Ciphertext positions consumed more than once (additional reads) | **12** |
| Longest consecutive original-source reading-order span among all selected positions | **7 runes** |
| Steps in the reconstructed 115-rune reading that change direction or jump to a nonnext original source position | **88 / 114** |
| Independently predicted unseen original block of 40 consecutive runes | **None** |

The longest contiguous source span occupies 0-based original matrix indices **348–354**. Even taking the union of all 38 hand-selected blocks, no 40 consecutive original ciphertext runes have been converted to English; 100 consecutive original unknown runes have certainly not been recovered. These statements constrain the **published selections**, not a future extension of a possible genuine transposition cipher.

The original mod29 arithmetic is **real and reproducible**. Example block1: `AE–J–EA` center-totient to `AE–I–EA`, printed original (13,25)–(14,4) `L AE N TH P U X` minus the repeating key yields GP runes `A S I G O TH E`. Example WEATHER: printed original (14,14–18) `NG P EO O E` minus `X X I X X` yields `W EA TH E R`. Neither calculation includes an independently original-Cicada-sourced rule selecting those initial positions, among a very large candidate set, *before* the plaintext was known.

**Source-exact CI:** [successful manual GitHub Actions 43645006765](https://github.com/FlareZ123/liber-primus/actions/runs/43645006765), using a fixed external commit plus original GP29 corpus. The exact rowwise output is in the workflow log; the source script prints file SHA-256s and each selected block's original positions for an independent replay. The public repo does not contain a first-party license file at its root; only independently derived numeric summaries were retained here.

## Cryptanalytic decision

The candidate supplies an instructive large, human-readable **in-sample fit**, including real math over original unsolved ciphertext. Its key and location choices are insufficiently constrained to predict the next unknown original runic positions, and the alternative SOON path directly demonstrates nonuniqueness. The many post-selected prime/totient numerological identities do not repair the missing route-selection rule.

**No verified unknown-page plaintext, author-selected key, or reversible whole-page cipher is established.** Do not repeat its 38 checks, call its English a genuine solve, or infer an OTP impossibility. A frozen, historically motivated rule predicting previously untouched original positions, keys and 40+ unknown outputs would be the threshold for new work.
