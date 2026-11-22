# LP2 p49 table: 32-row insertion/relabeling hypothesis excluded for both intact flanking sentences

**Agent39, 15 November 2026. Original-cipher finite negative; no plaintext or authenticated key.** This is a newly bounded structural possibility suggested by the **physical table's exactly 32 printed rows** and the **difference of 32 runes** between the two immediately flanking complete sentences. An exact, key-independent two-symbol proof rejects it even if all 29 rune labels are secretly and arbitrarily permuted.

## Fixed original input and intended route

The original sentence directly before the p49 red ten-dot/table marker runs from the last **72** p48 runes into the first **66** p49 runes: **138 runes/33 words**. The first complete sentence after the p49–51 **32×8=256-token** table runs from p51's first **92** runes into p52's first **78**: **170 runes/40 words**. These are complete source sentences, not page-local fragments. Their length difference is precisely **170−138=32**, the number of printed rows in the data field.

A possible human operation is therefore a **32-symbol insertion** or one control rune per numeric row: the pre-table text appears again after the table with 32 inserted values, perhaps under a private fixed GP29 rune substitution. If authentic, the 138-rune source, after an unknown but *single global bijection* on the complete 29-symbol alphabet, would be a subsequence of the 170-rune target. The table could then select or explain inserted values. **No first-party Cicada instruction actually selects such a re-use or 32-insertion rule.** Its only initial motivation is the exact page geometry. This test evaluates a necessary condition before researching arbitrary edits or inserted-rune consumers.

## All-secret necessary-condition proof

For every unordered pair of distinct source rune labels `x,y` (406 pairs), restrict the **138-rune original pre-table source** to the positions bearing either `x` or `y`. For each of the 29×28 distinct mappings `x→u, y→v` into the **170-rune original post-table sentence**, ask whether the mapped two-symbol source is a subsequence of the target restricted to `u,v`.

If an arbitrary secret *global bijection* embedded the complete source as a subsequence, its restriction to **every** symbol pair would necessarily pass this test. **Thirteen source pairs have no compatible target mapping whatsoever**, including `(GP0,GP1)`, `(GP0,GP9)`, `(GP0,GP10)`, `(GP0,GP19)`, `(GP0,GP24)`, and `(GP19,GP24)`. The full list is pinned in the SFT. Therefore **not even an arbitrary one-to-one renaming of all 29 glyphs plus 32 insertions can transform the original preceding complete sentence into the original following sentence**. An ordinary Caesar, Atbash, simple alphabet substitution or unchanged-rune insertion is a strict subset of the rejected family. This uses the exact original 138/170 streams, without a language model, secret key, fitted phase, synthetic target as evidence, or cryptographic prior.

The lower-level direct 29 Caesar offsets all fail the same subsequence condition; the ordinary original-label longest common subsequence is **46/138**, with the best Caesar shifts only **49/138**, rather than the **138/138** that insertion-only transport requires. Those descriptive figures are much weaker than the pairwise all-secret proof.

A **constructive planted test** applies a hidden invertible GP29 affine renaming `f(x)=7x+3 mod29` to all 138 authentic original runes and inserts exactly one extra rune at each of 32 positions. The 170-rune planted result satisfies the authentic subsequence and **all 406 pairwise necessary tests**. The actual original target fails 13 pairwise tests. Thus the mechanism would be detected even with a secret alphabet and inserted control values.

## Cryptanalytic decision

The 32-row/32-rune length agreement **does not identify a hidden reuse of the original preceding sentence under a fixed monoalphabetic rune substitution and 32 insertions**. Retire this exact low-step hypothesis before attempting to decode the table as 32 instructions to add symbols. This test **does not** reject two independently authored messages, different secret state on each side, an unobserved transposition, deletions/replacements, a varying keystream, nonlinear feedback, or any unknown plaintext reading. It says nothing about whether the table's existing **H2013/Gp39 polynomial divisors** were intentional or what cipher applies to the surrounding runes. The crucial missing input is still an original author-selected decipherment operation.

**Reproduction:** [one-file Node.js 22 SFT](../sims/lp2_p49_p51_32row_insertion_allsecret_sft.cjs), using [unchanged canonical physical-page corpus](../resources/liber-primus/lp2-corpus.json). Original-cipher source and planted true-positive were independently executed in the connected JS runtime. No new automated CI or dependencies.
