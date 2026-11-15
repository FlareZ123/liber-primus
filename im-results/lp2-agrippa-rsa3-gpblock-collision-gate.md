# Historical Gibson Agrippa three-character block cipher: exact LP2 exclusion

**Agent 13, 15 November 2026. Conditional historical mechanism test. No unknown LP2 plaintext or key recovered.**

## Source clue and explicit transfer

Cicada's 2012 puzzle used William Gibson's poem Agrippa as a book-code source. Independently, the University of California, Santa Barbara's scholarly [Cracking the Agrippa Code](https://agrippa.english.ucsb.edu/wp-content/uploads/images/cracked-code/submissions-toc.html) documents the actual **1992 Agrippa encryption scheme**: a deterministic custom RSA construction applied **identically and independently to blocks of three characters**, with fixed bit-scrambling permutations. This suggests a legitimate historical solve-path question distinct from using Agrippa's *poem text* as an LP2 running key.

The narrow candidate tested here is an unknown **fixed deterministic, reversible three-GP-rune block encoding**. A publisher could adapt the three-character transform to the manuscript's 29-rune alphabet; no evidence proves that this is what Cicada did. Its codebook may differ arbitrarily by physical page. The initial three-rune alignment is unknown, so all three phases are granted separately for every original page. Under *any* deterministic bijective codebook, if two aligned plaintext triples are identical, the resulting ciphertext triples must also be identical. This collision count is **invariant to the entire secret key**, making an original-cipher test possible without fitting RSA exponents or guessing the modulus.

## Exact original result

The [read-only CommonJS SFT](../sims/lp2_agrippa_rsa3_gpblock_collision_sft.cjs) counts unordered identical aligned triple pairs across **all 55 original rune-bearing LP2 pages, 12,956 original ciphertext runes**. Every page is counted independently, which even permits a secret page-specific RSA3 codebook.

| Data and alignment | Repeated three-rune block pairs |
| --- | ---: |
| Original LP2, fixed phase 0 | **4** |
| Original LP2, fixed phase 1 | **9** |
| Original LP2, fixed phase 2 | **4** |
| Original LP2, *best* phase independently chosen for every page to maximize collisions | **17** |
| Original LP2, least-collision phase independently for every page | **0** |
| 32 contiguous Shakespeare English windows, minimum even after minimizing all page phases | **123** |
| 8 Gibran windows, same minimum | **219** |
| 48 Emerson windows, same minimum | **112** |

All English controls use source-native 29-rune mapping with independently solved ING/IO conventions. Each control window has exactly the original page lengths, with page breaks preserved. The minimum across all **88 overlapping native-English windows** drawn from three independent source texts is **112** colliding triples, even after allowing each page's phase to minimize that count. Conversely, the original manuscript produces at most **17**, even after every page's phase is allowed to maximize it. Thus the two candidate ranges do not overlap under the tested native-English register. The source inputs, all alignments and every count are fixed; there is no fitted key or postselected word.

A positive planted control encrypts 12,956 native-GP runes under arbitrary page-specific invertible three-rune affine codebooks and decrypts them exactly, preserving the repeated triple count under its chosen phase. This tests the invariance, without claiming that Agrippa used affine codebooks.

## Implication and limits

**Exclude a direct length-preserving transfer of Agrippa's deterministic, fixed three-character block scheme to 29-rune native-English plaintext**, even granting independent page keys and hidden starting offsets. The collision discrepancy is much larger than a conventional key-search score difference and survives every tested phase.

This finding is conditional on unchanged GP29 rune length and a repeated deterministic block codebook *within* pages. Agrippa's actual RSA scheme operated on characters and used bit scrambling; an ASCII-to-rune recoding, variable-length transport, randomized block padding, constantly changing codebook, or different source language could destroy this particular invariant. The original Cicada artifact supplies no direct instruction to apply Agrippa's *algorithm* to Liber Primus. This is an exact, source-led exclusion of one concrete candidate, not a general exclusion of RSA or recovery of plaintext.

The underlying block-collision invariant is already exploited for a **different GP27/Trifid three- and five-symbol model** in [the existing all-secret block gate](lp2-trifid27-allsecret-original-block-collision-gate.md); the distinct contribution here is testing the historically specific **Gibson Agrippa three-character mechanism** on a **GP29, no-bypass, arbitrary per-page codebook**. The 88 English windows overlap within source texts and should not be treated as independent hypothesis trials. This direct Agrippa model is separate from the already-executed Gibson poem-running-key test (sims/lp2_2012_books_runningkey_sft.cjs) and Gibson exact word-length crib test (sims/lp2_2012_agrippa_wordlength_crib_sft.cjs). The consequence is to prioritize actual source keys, altered encodings or dynamically keyed processes over any fixed source-native three-rune RSA codebook.
