# An eight-symbol checksum readout from the original 32×8 numeral table

**17 November 2026, Agent 11. Classification: new exploratory source-arithmetic candidate, followed by an exact original-cipher rejection. No unknown-page plaintext or authenticated key.**

## Candidate and its limits

Physical LP2 pp49–51 print exactly 32 rows of eight two-character numerical entries, in book order. The conventional 60-character alphabet yields the original 256-byte table (SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`). One geometrically ordinary folding operation divides the 32 original rows into eight consecutive groups of four rows each. Within each group, sum all **32** byte values, reduce modulo the independently given Gematria Primus alphabet size **29**, and print the corresponding GP29 runes.

The unmodified original byte sum is **33,006**. Eight group residues are exactly

`[22, 8, 9, 7, 10, 16, 8, 11]`

which romanize as `OEHNWITHJ`. The contiguous four-rune substring `WITH` appears at zero-based group indices **3–6**, yielding source-derived candidate key indices **[7, 10, 16, 8]**.

This is an **exploratory observation**, *not* a decipherment. The manuscript does not say to sum four consecutive rows, use the modulus in this fashion, select the substring rather than the other four symbols, or apply WITH as a cipher key. The substring was noticed after examining numeric table folds, so even a small single-test random-string probability would be misleading without the whole hypothesis-selection history. Both the prefix `OEHN` and suffix `J` remain unexplained. Do not assert that `WITH` is an authored word or that its source occurrence is independent of the previously mined table structure.

**Independent source-interpretation comparison.** Omitting lowercase `f` from the 60-character digit alphabet and instead using radix59 on the *same 256 printed tokens* gives residues `[10,12,2,9,24,4,14,2]`, romanization `IEOTHNARXTH`. This comparison is descriptive: the radix60 interpretation also has the previously established GF29 H/G polynomial factor coherence, whereas radix59 does not. The new substring alone does not resolve the original author intent.

## Decisive cryptographic consumer

A first low-parameter way to make this lead useful would be to read `WITH` as a four-symbol repeating Vigenère key. Earlier solved Cicada stages used GP29 Vigenère and a **plaintext-F-transparent bypass**. The historically exact bypass says plaintext rune `F=0` emits ciphertext `F=0` without consuming a key position. A ciphertext `F=0` can additionally originate from a *non-F* plaintext symbol through ordinary encryption, so an inverse must keep both possible key phases.

For each of two cipher signs, **every one of the four possible key starts**, and every legally possible plaintext-F bypass, the exact 4-state inverse was applied to the untouched **12,956** unknown LP2 rune indices. Each possible initial setting becomes algebraically impossible on the **first page p0 of 262 runes**, without inspecting its language:

| Forward model `C=P+sign×K mod29` | First impossible original p0 rune (zero based), key phases 0,1,2,3 |
| --- | --- |
| `sign=+1` | **37, 134, 1, 134** |
| `sign=−1` | **5, 88, 88, 88** |

The same exact inverse accepts each of eight independent **95-rune native-GP p57 plaintext plants** encrypted using the proposed key, all original literal F bypasses and the matching sign/initial phase. Thus the rejection reflects the original cipher symbols rather than an implementation that accidentally suppresses F branches.

A simpler repeating four-key decoder *without* the authentic bypass also gives nonprose full-book output: index of coincidence **0.0344715224727007** for `sign=+1` and **0.0344972843393946** for `sign=−1`, near the random GP29 baseline of `1/29`. The stronger exact F-transparent impossibility is the decision-bearing result.

## Decision

The table exposes an eight-symbol arithmetic register with one exact, source-derived, but **post-selected** English-looking four-rune substring. **The straightforward historically used Vigenère cipher under that substring is ruled out**, including the authentic F-transparent inverse and all four initial key phases. Nothing has been decrypted from LP2 p0–55, and this report does not promote a cryptographic link between the p50 table and those pages.

The result is potentially useful only if **independent original-page evidence selects the four-row fold and a concrete distinct consumer**. Arbitrarily rotating the eight-symbol readout, substituting alphabets, adding key phases or scanning wordlists to rescue it would not be justified by the present observation.

**Single-file original-input reproducer:** [`sims/lp2_p50_fourrow_sum_with_strict_f_sft.cjs`](../sims/lp2_p50_fourrow_sum_with_strict_f_sft.cjs). Inputs are the pinned `resources/liber-primus/lp2-grid-256.json` and `lp2-corpus.json`. The script pins the 256-source-byte SHA-256, all eight residues for both radices, 12,956 original ciphertext runes, eight exact first-failure offsets, eight source-native positive plants and both complete no-bypass IoCs. It edits no source artifacts.
