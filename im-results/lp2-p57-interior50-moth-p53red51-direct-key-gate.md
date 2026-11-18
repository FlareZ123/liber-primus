# PARABLE's 50 interior runes against the moth page's 51 red runes

**15 November 2026, Agent49. Classification: exact original-source clue and two bounded, plaintext-directed inverse attempts. No recovered LP2 plaintext, key, cipher, or continuation.**

## Human-visible operation and the competing explanation

The solved physical LP2 **p57 PARABLE** instructs pilgrims to “shed our own circumferences.” Removing the first and final GP29 rune from each of its **19 body words**, while excluding the separate seven-rune PARABLE heading, leaves **exactly 50 internal GP29 runes**. Its 19 body words have 88 runes, with 38 endpoint runes. This is a literal, source-specific operation with no fitted key positions.

The earlier original-image study identifies the moth on original physical **p53/70.jpg** and on **p55/72.jpg**, linking those pages to the first-release p05 moth. P53 contains an independently ink-selected **51-rune red passage** at local rune offsets **128–178**, whose only original ciphertext F (GP index 0) is red-local **38**. Treating *that* F provisionally as the solved-cipher literal-F nonadvancing exception would leave **50 key-consuming runes**, exactly the p57 word-interior length.

These observations offer a plausible player-level path from a solved instruction and recurrent artwork to an experimentally testable unknown passage. Two crucial premises are **unestablished**: p57's language does not explicitly select the earlier p53 red ink as its recipient, and a ciphertext F is not necessarily a plaintext F bypass under the genuinely solved rules. An original p53 image also isolates the first red Tiwaz rune ᛏ before the other 50 red runes. Its arrow-like shape is the ordinary GP glyph, not a separate drawn arrow; the 51-rune span still has a 50-rune remainder after that first glyph. The 50/51 relation is therefore a hypothesis selector, not an encoded instruction.

## Exact original-cipher direct inverse

Freeze the p57 50 interior GP indices in **original body-word order**. The three simplest key registers suggested by existing solved GP practice are:

1. Their literal GP29 indices.
2. Their GP-associated prime values modulo 29.
3. Euler's totient of those primes modulo 29, i.e. `prime-1 mod29`.

For each key, evaluate only `P[i] = C[i] ± K[clock mod50] (mod29)`, with the literal physical p53 red51 stream. The two clocks either consume every rune or provisionally skip the exact ciphertext-F position **38**. The latter copies that F into the output and consumes exactly 50 key symbols. These **12** fixed combinations cover the direct key hypothesis without phase, orientation, or word-boundary tuning.

**Observed result:** Across all twelve complete 51-rune original p53 outputs, the GP29 index of coincidence ranges from **0.02745098** to **0.04705882**. The largest, **0.04705882**, occurs using GP-prime residues, the negative shift and skipping original red-local F38. All twelve complete readouts are nonlinguistic in direct GP transliteration. They are printed without editing by the reproducer. The original 95-rune solved p57 control has GP29 IoC **0.06270997**; because 51-character samples fluctuate, this is context rather than a formal exclusion threshold.

Apply each of the twelve unchanged direct p57 source-key schedules to **previously untouched p55's 76 runes**, using its original F positions 15, 25 and 41 when the bypass option is on. No sustained GP-native plaintext emerges. Each complete original p53 transform exactly re-encrypts its own source runes, and the same inverse fully recovers a 51-rune known solved-p57 positive plant under the separately frozen positional skip mask. These controls ensure that the negative is a result of the original input under the stated decoder.

## Independent presumed-plaintext pad route

The exact **50** key-consuming p53 red positions allow a different use of the solved p57 instruction: **assume** those 50 ciphertext runes encrypt the known p57 interior runes, in reading order, and derive the corresponding 50-symbol GP29 difference pad `K[i] = (C53red_nonF[i] − P57inner[i]) mod29`. This recovers an exact pad conditional on the hypothesis, by elementary known-plaintext subtraction. It provides **no independent evidence** that the two passages share plaintext.

Test an independently checkable consequence: reusing that same 50-symbol pad periodically on the unselected terminal physical p54 (232 runes) and p55 (76 runes). Under ordinary subtraction, the decoded GP29 IoCs are **0.03321** (p54) and **0.03614** (p55); provisionally bypassing all the respective source ciphertext Fs gives **0.03445** and **0.03965**. None produces a coherent GP-native passage. In particular, the p55 outcomes are far below the observed long native-cleartext GP control, and their complete transliterations carry no readable sentence. This rejects the *literal reused periodic pad transfer* at its stated source selection. It cannot rule out an unspecified source-chosen KDF, a truly one-use pad, or a different destination.

## Decision and reproduction

The **50 interior → 51 red** clue is exact and reproducible, but the two shortest, source-bounded routes to actual plaintext are negative. Retire direct additive use of p57's 50 interiors, their first-party prime/totient representations, and the same-length presumed-plaintext pad with literal 50-rune reuse. Reopen only with independent source guidance for a distinct operation, pad reuse, or recipient rather than optimizing phases on the reported gibberish.

[Standalone original-corpus CommonJS test](../sims/lp2_p57_instar_p53red_key_source_gate_sft.cjs) loads the exact native p57 transcription, full GP29 corpus and original p53 ink annotations; confirms p53/p55 F offsets; computes all twelve full readings and heldout p55 outputs; re-encrypts every source; and recovers a 51-rune solved source-positive plant in each convention. The entire SFT passed against the remote original file contents in the GitHub connector's JavaScript execution runtime on 15 November 2026. The experiment does not claim independent native Windows/CI execution or a discovered plaintext.
