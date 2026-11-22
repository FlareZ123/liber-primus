# Original LP2 opening: signed “EPIPHANY SEEKS” crib fails 28 affine Vigenère keys and both classical autokeys

**Agent 11, 16 November 2026. Decision:** a genuinely first-party plaintext phrase is an exact word-length crib candidate for the first original unsolved LP2 heading. Under **all 28 nonzero GF29 affine slopes** of a source-fixed repeating 13-symbol key, the original ciphertext becomes algebraically impossible **by physical p0 rune242**, with the original additive slope1 failing at rune57. Both classical autokey variants likewise fail at chapter-relative runes333 and34. All tests enumerate *every permitted ciphertext-F bypass interpretation*. These results reject the declared crib-plus-cipher combinations. It recovers **no unknown plaintext or authentic key**, and does not prove the phrase was intended as a heading.

## Human-visible phrase and source-fixed plaintext hypothesis

The original May 2014 LP2 first unknown scan, [physical p0 / 17.jpg](../resources/liber-primus/17.jpg), visibly begins with two separate red heading words, exactly **8 and 5 GP29 rune symbols**, followed by the main undeciphered text. The independently preserved Cicada-signed January 2016 [OutGuess message](../resources/historical/cicada2016-4gq25-outguess.asc) says **“epiphany seeks the devoted”**. The first two words have *exactly the same original-native GP symbol counts*: EPIPHANY (8) and SEECS (5), using the known historical K→C GP normalization.

This is one rare first-party *candidate plaintext*, rather than words invented by a language model. However, the signed text was issued **after** the LP2 manuscript and never says the p0 heading reads that phrase. Other 8+5-word headings could match by chance; the proposed alignment is explicitly hypothetical.

The simplest test against an actual previously demonstrated Cicada cipher is a repeating, unknown-key GP29 Vigenère with **period 13**, determined exactly by the full 8+5 heading. Two additional classical continuations consume this same first13 key as plaintext autokey or ciphertext autokey, rather than repeating it indefinitely. These variants are explicit hypotheses; no first-party LP2 instruction selects them. Both solved LP1 and encrypted p56 use the special rule that **plaintext F is transmitted as ciphertext F without consuming a key position**. Ciphertext F can nevertheless have arisen by ordinary encryption of a non-F rune. Unlike choosing F skip positions to make the later text look English, the finite inverse retains every allowed F state.

## Fixed key and exact original contradiction

Original first 13 p0 ciphertext rune indices are

```text
C  = [15, 8,18, 3, 6,19,27, 0,15,26,18,21, 5]
P? = [18,13,10,13, 8,24, 9,26,15,18,18, 5,15]
K  = [26,24, 8,19,27,24,18, 3, 0, 8, 0,16,19]
```

The first line is the original unchanged corpus; the second is the hypothesized signed phrase *EPIPHANY SEECS*. Consequently the key `K=C−P? (mod29)` is uniquely fixed by the crib, with source-native labels **Y A H M IA A E O F H F T M**. No first-13 plaintext rune equals F, so each consumes one key step and the unknown next-text key phase restarts at zero at rune13. Crucially, the eighth ciphertext rune **F** is an *encrypted Y* under the proposed key, consuming one step; it cannot be treated as an unconsuming literal-F because the known candidate word contains Y there.

From original rune13 onward, enumerate all possible key-clock phases under the actual historical transparent-F grammar. At each ciphertext rune C and current key phase j, ordinarily decrypt `P=(C−K[j]) mod29`; accept this branch only if P is non-F, and advance j. When and only when **C is F**, also admit literal plaintext F as an alternative branch that **does not advance j**. Exact finite-state propagation exhausts every allowed ambiguous ciphertext-F interpretation with no arbitrary beam width or fitted language score.

The surviving phase set immediately *before* original zero-based rune57 is **{4}**. At rune57, the authentic original ciphertext is **IA = GP index27**, and **K[4] = IA = index27**. Ordinary decryption would force **plaintext F = index0**, but the verified cipher rule would transmit such a plaintext F **as ciphertext F**, whereas the authentic rune is IA. Since IA is not ciphertext F, the bypass branch is unavailable. Hence **no legal continuation exists at rune57**, without needing to compare any English statistics.

This contradiction occurs within the same original physical p0, far before the p0→p1 page turn, and is unaffected by any later guess about segmentation, LP2 chapter boundaries or language. It holds for every F-ambiguity path after the fully fixed initial 13-rune crib.

## All 28 invertible affine slopes, no fitted continuation

The 2014 puzzle also used inverted GP29 mappings, making a slope other than +1 an economical source-era alternative to straight Vigenère. Rather than guessing a slope from a language score, **exhaust all 28 invertible slopes** in GF29. For each slope \`a∈{1,…,28}\`, the same fixed 13-symbol source-crib plaintext uniquely determines a full original-heading key \`K_i(a)=C_i−aP_i (mod29)\`. The normal inverse is \`P_i=a⁻¹(C_i−K_{phase}) (mod29)\`. Because \`a\` is invertible, normal decryption forces forbidden plaintext F **exactly when the ciphertext equals the current key value**, independently of the slope.

With the same exhaustive F-bypass automaton and no word or page reset, the first impossible original rune for each increasing slope is:

\`\`\`text
a:    1  2  3   4  5  6  7   8  9 10 11 12 13 14
fail: 57 14 29 168 16 38 15 228 28 54 52 13 56 54

a:   15 16 17 18 19 20 21  22  23 24  25 26 27  28
fail: 55 40 44 24 49 41 46 242 155 59 134 55 41 109
\`\`\`

All positions are zero-based in the complete original p0–p2 729-rune source. The **latest** survivor ends at original rune242, still inside p0's original 262-rune physical page. Each of the 28 slopes independently encrypts and then passes a 95-symbol genuine native-GP p57 positive using its own source-fixed key and the historical F-transparent clock. This rejects the **entire 28-slope affine repeated-13-key family for this one hypothesized 2016 title**, without fitting any alternative key or suppressing a failed case. It does not exclude nonaffine, changing-key or word-reset ciphers, or a different true plaintext heading.

## Two complete classical autokey continuations of the same fixed heading

A classical autokey Vigenère is one other economical way a puzzle author could use the full 13-symbol original heading. Both tests freeze exactly the same key derived above. The solved plaintext-F bypass remains in force, with all ciphertext-F ambiguity paths enumerated:

- **Plaintext autokey:** after the 13 consumed candidate heading runes, append each further encrypted *non-F plaintext* GP29 rune to the key tape. The first appended rune is E, the first plaintext letter of the proposed title. On the complete untouched first-three-page original source, the maximum number of simultaneously reachable F/keystream interpretations is **18**, and all legal paths end at **chapter-relative rune333, physical p1 offset71**.
- **Ciphertext autokey:** after the first13, append each further keyed *non-F ciphertext* GP29 rune instead. Its first appended rune is S, the original first heading ciphertext symbol. The maximum number of live source states is **2**; all legal paths end already at **physical p0 rune34**.

At every F-ciphertext site, the decoder tests both an ordinary keyed non-F plaintext branch and a literal-F bypass; only a keyed branch appends the chosen plain or cipher rune. This is a complete all-legal-path test for the stated autokey state convention, without a guessed skip, score-beam cutoff, alternative key, reset or word-specific parameter. Literal-F insertion into the autokey tape would define a different cipher and is outside these tests.

The first13 plaintext letters remain an *assumed crib*, so none of the opening apparent English is newly decrypted text. No original continuation of this crib gives a coherent authentic 150-rune plaintext under any of the three specified models.

## Positive control, scope and next decision

[Reproducer: original-source, read-only Node22/CommonJS SFT](../sims/lp2_p0_epiphany_seeks_2016_crib_fclock_sft.cjs). It asserts the unmodified 8+5 printed heading, both original and signed source inputs, full derived 13-rune key, exact first-impossible index57 and the singleton predecessor phase. It builds a separate *native-GP English plant* from the 95 independently clear p57 runes, encrypts it with this very 13-symbol key and the exact authentic F-transparent rule, and checks that the same exhaustive periodic inverse **accepts all 95/95 planted runes**. It separately encrypts the identical 95 clear p57 runes under both complete autokey rules and verifies that their own all-F-path inverses also accept **95/95**. The first13 original ciphertext is independently reproduced from the proposed crib and derived key. The **exact committed CommonJS source** was executed against the original GitHub GP29 corpus, transcription and signed 2016 text in an independent JavaScript runtime with adapters for the Node standard-library calls: **all source and positive-control assertions passed**. A native Node22 GitHub Actions workflow execution is **not claimed**.

**What is excluded:** precisely *EPIPHANY SEEKS as the p0 red heading* followed by **any one of 28 nonzero-affine-slope repeating period13 GP29 Vigenère consumers**, or by the specified additive plaintext autokey or ciphertext autokey. Each uses the solved transparent-F key clock without an unprinted reset, insertion, or exception. Changing the key period after rune13, cipher register, plaintext spelling, or bypass rule changes the hypothesis and is outside this result. Unrestricted 13-symbol keys can always fit a 13-symbol guessed plaintext prefix; the match of the crib itself proves nothing without a continuation. The exact source contradiction therefore argues against this attractive but unproven plaintext route.

**Research decision:** Retire this full source-crib 28-slope affine periodic family and both 13-rune signed-2016 heading autokeys under the established F-transparent clock. A source-authenticated original p0 key schedule or independent plaintext confirmation would be required to resurrect the phrase. Do not infer any unknown-LP2 plaintext from the fitted 13-rune heading. The authoritative [overall synthesis](../results/README.md) remains unchanged: all 56 unknown pages are unsolved.
