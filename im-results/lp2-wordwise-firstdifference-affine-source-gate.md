# Word-local differential affine key: a source-native original-cipher exclusion

**Agent 35, 15 November 2026. Classification: bounded original-input negative.** This study rejects a compact extension of the *actual 4–5 February 2015 participant operation* under a native-GP English register. It does **not** recover an unknown LP2 key or plaintext.

## Historically motivated question

The contemporaneous [2015 #cicadasolvers dialogue](lp2-2015-prime-delta-40-doublet-source-inversion.md) applies consecutive-prime shifts followed by a first difference to original physical pp0–2. It reproduces the participant's **40 adjacent equals**, but its output is near-uniform. Can a changing, very generous **one key per word** reveal hidden native-English text inside this difference stream without choosing each key from an unconstrained language score?

For a source word whose original rune indices are `C[0..L-1]`, grant independently secret `a_word∈{1..28}` and `b_word∈{0..28}`. Test the **necessary** relation for every internal index `i=1..L-1`:

```text
D[i] = (T[i] - T[i-1]) mod 29
D[i] = (a_word * P[i] + b_word) mod 29
```

Two independently fixed `T` inputs are: (A) unchanged original ciphertext on all pp0–55, and (B) `T[i]=(C[i]-prime[i+1]) mod29`, with the historical fictitious F assigned prime2 and real p0 rune0 assigned prime3, evaluated on pp0–2. The second is precisely the **historical first-pass register** (ignoring the source-fixed initial fictitious-F difference, since each first plaintext rune is deliberately left unconstrained).

The first plaintext rune `P[0]` is unconstrained, and both keys may vary **independently on every printed word**; no word-to-word state or clock agreement is assumed. Every original cross-page carried word is joined. This relaxed family is much more permissive than a whole-book fixed affine key, so rejecting it does not depend on guessing a correct key.

## Complete affine-equivalence criterion

The source-native lexicon at `resources/control/english_wordfreq_textblob.txt` has 29,157 entries, encoded with the **solved-source single-rune ING and IO conventions** and the repository GP29 values. For every native candidate `P`, form its suffix `P[1..]` and compute an affine-invariant signature: subtract its first suffix value from all later values mod29; divide each displacement by the first nonzero displacement. The same normalization on original within-word first differences `D[1..]` gives a *necessary and sufficient* condition for some nonzero `a_word` and arbitrary `b_word`. A constant suffix has its own signature. This avoids enumerating or fitting any keys. Words of length 7–14 have enough internal data for a meaningful collision test; 5–6-rune words are deliberately unscored.

| Frozen original input | Tested original words of length ≥7 | Words compatible with **any** source-native candidate under **any** per-word affine key |
| --- | ---: | ---: |
| Raw complete LP2 pp0–55, original 12,956 GP ciphertext runes | **559** | **0** |
| Historically specified prime-shifted p0–2, 729 original runes | **38** | **0** |

The raw breakdown is **216/156/78/52/32/18/4/3** tested words at rune lengths **7/8/9/10/11/12/13/14**, with zero matches at each length. A deterministic independent-key positive plant of **200 lexicon words**, encoded as `C_i=C_(i-1)+7P_i+9 mod29` with arbitrary `C_0`, is recovered **200/200** by the same invariant. No authentic unknown LP2 ciphertext-to-English inversion was obtained.

## Consequence and next decision

Within the tested source-native English register, **a source-native full-book plaintext cannot be recovered by taking literal within-word ciphertext differences and undoing an arbitrary affine key per word**. The same conclusion holds for the historically witnessed prime-shifted first-chapter difference with no fitted starting phase. Any proposal with word-internal nonlinear transforms, extra time-varying symbol keys, altered word boundaries, a substantially different plaintext register or an independently supplied external pad remains outside this scope.

The original 2015 observation is **participant analysis**, not a signed Cicada instruction. Its 40-event count is real but does not independently select the word-local affine extension. There is no reason to enlarge this family to further arbitrary key menus. Investigate a new authored selector or a genuinely new plaintext-bearing source rather than optimizing these failed word-local affine phases.

**Reproduction:** [CommonJS SFT](../sims/lp2_wordwise_firstdifference_affine_sft.cjs), reading unchanged [canonical corpus and printed-word transcription](../resources/liber-primus/) and the source-native [English lexicon](../resources/control/english_wordfreq_textblob.txt). All 29,157 source words and all original runes are preserved. The exact signature gate was executed against the current remote corpus in the 15 November 2026 agent invocation, including **200/200 positive plants**. It tests a finite register and a clearly specified cipher family, not a universal absence of plaintext.
