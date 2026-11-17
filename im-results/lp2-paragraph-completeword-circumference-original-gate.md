# Complete-word “circumferences” on original LP2: shell and ordering gates

**17 November 2026 · Agent27 original shell test, Agent42 reversible word-order extension · Director [#1279](https://github.com/FlareZ123/liber-primus/issues/1279) and [#1323](https://github.com/FlareZ123/liber-primus/issues/1323).** Two narrow, source-readable interpretations of the clear p57 PARABLE instruction have been tested against untouched original LP2 word objects. **Neither recovers unknown-page plaintext, an authentic unknown-page key, nor a complete cipher.** The original paragraph-shell extraction and new marked-block word permutation are separate operations, and their negative results have separate scopes.

## Common original source and section structure

The clear p57 PARABLE says to “shed our own circumferences” and “find the divinity within.” A reader might peel the exterior printed words of a paragraph or read complete word objects from its two ends toward its center. These interpretations use actual printed words rather than changing values of the 29 GP rune symbols or altering guessed word breaks. They compete with geometric ring interpretations of the p32 matrix and p55 word edges; neither instruction explicitly selects one of these mechanisms.

The exact sources are `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt`, and `lp2-ink-annotations.json`. The two independently executable SFTs assert all **13,136 original runes**, including **12,956 unsolved runes in 2,896 words** and 180 solved runes in 45 words; they retain **32 true physical-page-carry words** as whole tokens. Word delimiters are printed hyphens/full stops and source punctuation; line breaks and page boundaries are not word cuts. The original ink file supplies **36 large marks**: 31 thirteen-dot, four ten-dot and one 23-dot. Duplicate marks at the same rune offset become a single paragraph cut. They partition the source into **34 nonempty sections**: three one-word sections, six two-word sections, and 25 longer sections. All large cuts occur between complete words. The first p0 large mark is **after the two red words containing 8+5 runes**, at rune offset 13. No retracted red8/marker8/black5 interpretation is used.

### Gate A: literal first/last-word shell removal (#1279)

Freeze the first and last complete printed words of each marked section as the exterior shell, keeping singleton words only once. Read the interior complete words in their original order. Preserve ordinal positions and every page/line/punctuation separator for exact original restoration. No key or supplementary cipher is supplied.

| Frozen source interval | Original runes | Interior runes | GP IoC original → interior |
| --- | ---: | ---: | ---: |
| Unknown **pp0–2** | 729 | **703** | 0.03408252 → **0.03410293** |
| Unknown **pp40–53** | 3,008 | **2,994** | 0.03454263 → **0.03455000** |
| Known-clear **p57 body** | 88 | **78** | 0.06556949 → **0.06160506** |

The pp0–2 interior begins **FJOE ONTH NEWBASOEEOINGU NAEGITH HBNIA PBN EOJTH ANGYX ...**; pp40–53 begins **YGDAEH APXYH EOEAOE TNGEA LITTHF MACE DC ...**. Neither is intelligible GP prose. Their removed exterior word pairs are also nonprose. In contrast the clear p57 positive preserves all 17 grammatical interior body words: **THE INSTAR TUNNELNG TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIUINITY WITHIN AND**. The one-word PARABLE heading correctly yields no interior. The true p57 body's original enclosing words are LICE (LIKE) and EMERGE. Literal shell removal itself is therefore excluded as a direct plaintext decoder.

### Gate B: deterministic complete-word order within marked sections (#1323)

A different reading of the same original phrase is to **traverse intact printed word objects from their section circumferences inward**. Freeze the 36 physical marks above as section boundaries before inspecting candidate plaintext. For each consecutive section word array `[w0,...,w(n-1)]`, the exterior-pair traversal is `w0,w(n-1),w1,w(n-2),...`. Test that permutation and its **single exact inverse convention**. Both reverse one another and have typed no-padding inverses for every section size, including singletons. The complete source framing holds all rune identities, page carries, line breaks, end punctuation and the position of every large mark; applying the inverse reconstructs the **entire original transcription byte-for-byte**. This is implementation correctness, not cipher authentication.

A naked permutation leaves the GP29 rune frequencies and IoC unchanged, so the one independently nominated value-changing receiver is the **historically authentic p56 prime-totient cipher with literal plaintext-F transparency**: prime stream `φ(2),φ(3),φ(5),...` modulo 29; a literal F emits F without consuming key, and an encrypted non-F may also emit ciphertext F. A complete DP accounts for every possible F skip history. Besides the source-selected start at prime 2, the test grants **all 5,000 starting-prime positions 0–4,999 separately per original illustrated chapter**, a much stronger negative criterion than one chosen start. No other symbol-changing operation, guessed secret alphabet, language-optimized word order or key schedule is introduced.

| Original chapter | Runes | Exterior-pair: max legally reached / viable prime starts | Inverse-pair: max reached / viable starts |
| --- | ---: | --- | --- |
| pp0–2 | 729 | 643 / **0** | 591 / **0** |
| pp3–7 | 1,145 | 557 / **0** | 571 / **0** |
| pp8–14 | 1,729 | 286 / **0** | 604 / **0** |
| pp15–22 | 1,903 | 429 / **0** | 759 / **0** |
| pp23–26 | 1,021 | 472 / **0** | 502 / **0** |
| pp27–32 | 1,433 | 656 / **0** | 420 / **0** |
| pp33–39 | 1,680 | 548 / **0** | 501 / **0** |
| pp40–53 | 3,008 | 554 / **0** | 765 / **0** |
| pp54–55 | 308 | 308 / **3** (545, 547, 2983) | 308 / **3** (1459, 4522, 4523) |

Every combination on the first **eight complete unknown chapters** produces a forbidden attempted encryption of plaintext F at some original position. The final 308-rune chapter retains three logically possible prime starts per direction, but nothing in the original source selects those starts, determines the F ambiguity or authenticates any plaintext. An inverse under an arbitrary wrong key is not a solution.

**Controls:** the standalone authentic p56 plaintext `AN END WITHIN THE DEEP WEB ...` is correctly re-encrypted to **all 85 original p56 ciphertext runes** with the true plaintext-F rule. The clear p57 95-rune word sequence, plus the p56 85-rune word sequence, both survive exterior/inverse word-permutation round trips. The full original 2,941-word transcription including every page carry is also recovered exactly by each pair of operations. This separates a functioning decoder/permutation from a failed historical hypothesis. [Successful Windows Node22 manual SFT run](https://github.com/FlareZ123/liber-primus/actions/runs/43997855032) · [exact source-native CJS](../sims/lp2_largepunct_wordunit_inout_phi_sft.cjs).

## Decision and next causal prerequisite

The visual p57 sentence does not itself choose **shell removal versus word reordering**, the exterior-pair traversal versus its inverse, or a non-p56 symbol-changing operand. The two complete-word interpretations are inexpensive to define and source-test but fail on original unknown plaintext. They do **not** exclude an independently instructed word-order operation combined with a genuinely new state/key, nor change prior failures of other interleavers. Pursue that only after an author-visible instruction fixes the new traversal and receiver without fitting unknown output. The original word grammar and anti-repeat constraints remain unexplained.

Original Gate A: [source-locked CJS](../sims/lp2_paragraph_completeword_circumference_sft.cjs) · [passing Windows Node22 run 43918204625](https://github.com/FlareZ123/liber-primus/actions/runs/43918204625). The two tests are exact original-input finite negatives, **not** decrypted LP2 prose.
