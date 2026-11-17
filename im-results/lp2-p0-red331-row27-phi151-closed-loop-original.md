# P0 red heading → 32-row table → prime 151: a closed arithmetic clue candidate

**17 November 2026, Agent 9. Classification: exact original-source cross-artifact arithmetic with one completed original-cipher inverse and one early source-authenticated inverse obstruction. Neither an LP2 decipherment nor an authenticated key or creator instruction.** The numerical selector is reconstructed retrospectively; evidence of the operation's historical intent remains absent.

## Original human-visible route and independent operands

The original Liber Primus second-release physical page 0 (2014 archive \`17.jpg\`) begins with **two red printed words** (lengths **8** and **5** GP runes), an ordinary small red dot between them, and a large **13-dot** red punctuation mark after the complete 13-rune heading. The uncolored black body begins immediately afterwards. Source: [ink annotations](../resources/liber-primus/lp2-ink-annotations.json), [complete original GP29 index corpus](../resources/liber-primus/lp2-corpus.json), and [printed-word transcription](../resources/liber-primus/lp2-transcription.txt). The source-corrected word division is essential: an earlier incorrect interpretation located the large 13-dot marker after only eight red runes and must not be restored.

In the alphabet's original order, the two red printed words have these prime-weight sums:

| Red word | Exact GP index sequence | Rune count | GP-prime sum |
| --- | --- | ---: | ---: |
| First, \`S H E O G M IA F\` | \`[15,8,18,3,6,19,27,0]\` | 8 | **347** |
| Second, \`S Y E NG C\` | \`[15,26,18,21,5]\` | 5 | **315** |

The two separate sums yield both **347−315=32** and **(347+315)/2=331**. The second number is already known prior art: the contemporary original 2014 LP2 delivery index contained \`<div id="331">\`, and the historical Cicada 7×7 magic square has center **331**. Their alignment and limitations were documented in [the earlier 133/331 historical report](onion7-html-red331-source-inversion.md); this investigation does not rediscover that relationship.

The new cross-artifact relation is with the **32-row × 8-column**, 256-cell printed LP2 number table on physical pp49–51 (archive \`66.jpg\`–\`68.jpg\`). Applying a word's GP-prime sum **modulo 32**, both red words independently select the **same zero-based row 27**: \`347 mod32 = 315 mod32 = 27\`. The complete original row has tokens

\`\`\`text
2M  3d  2S  0x  0w  0q  0p  2V
\`\`\`

and, under the published but provisional conventional base60 reading, bytes

\`\`\`text
142 219 148  59  58  52  51 151
\`\`\`

The **eighth/final cell is byte 151**, which occurs **exactly once** in the entire 256-byte table, at physical p51, zero-based global row27/column7. The eight-rune length of the first red word makes final column7 a natural, though still inferred, candidate selector. The earlier solved LP1 \`Some Wisdom\` 5×5 number square independently contains literal **151** at a corner and explicitly states that **primes and the totient function are sacred**. Because 151 is prime, \`φ(151)=150\`, yielding the exact additional equality

\`\`\`text
347 + 315 = 662 = 2*256 + φ(table[row27][column7])
                      = 2*256 + φ(151) = 512+150.
\`\`\`

The table's row27, prime151 and \`φ(151)\` are fixed by unchanged original artifacts. The **rules** “take the modulo-32 row,” “take column7,” and “subtract twice the table size” were inferred after seeing the source values, and no Cicada-authored plaintext or key instruction independently specifies those operations. The arithmetic should therefore be treated as one **retrospective crosslink** whose coincidences are interdependent, not several independent discoveries or probabilities.

## Exhaustive within-manuscript specificity check

The [self-contained source-exact test](../sims/lp2_p0_red331_row27_totient_sft.cjs) re-parses the canonical 55 rune-bearing unknown pages, validating **2,896 complete printed words**, **12,956 original ciphertext runes**, and all word carries against the independent corpus. There are **2,895 consecutive printed-word pairs**; exactly **19** have the source heading's 8-rune followed by 5-rune word lengths.

For each original adjacent pair \`(left,right)\`, compute its two *original ciphertext* GP-prime sums \`A,B\`, select row \`r=A mod32\`, take the row's final byte \`t=T[8r+7]\`, and require simultaneously

\`\`\`text
A−B=32
A+B=512+φ(t).
\`\`\`

Across all **2,895 source-word pairs**, **exactly one** satisfies both conditions: the red opening pair \`(A,B)=(347,315)\` with row27, \`t=151\`, \`φ(t)=150\`. This is an exact enumeration of a **postselected** grammar, with no unrestricted mutation, red title exceptions, or selection on the subsequent black plaintext. It is stronger than simply restating the numerical equality, but does not establish a discovery-wide significance level: selecting the formula after seeing the target pair and among many previously examined source relationships invalidates an ordinary naive random-hit p-value.

A falsification of this observation would be a corrected original word transcription, a re-adjudicated table glyph that changes row27/col7, an inconsistent original GP-prime alphabet, or another qualifying pair under the fixed grammar. None is observed in the canonical source snapshots.

## Two exact, frozen original-cipher consumers

The first decoder requires no external key: use the eight selected original table bytes as a repeating additive GP29 key **starting immediately after the large 13-dot heading mark**, on the remaining **249** p0 black-body runes. Test the two conventional signs \`P_i=(C_i±T[27][i mod8]) mod29\`. The source GP-index coincidence results are **0.03423370902966706** (subtraction), **0.03345640627024226** (addition). Both are essentially the uniform GP29 register, with no readable opening or full-page English. The inverses exactly re-encrypt all 249 source runes, confirming arithmetic but not a true key. No arbitrary phase, different key layout, hidden IV, word reset, or extra layer is fit to the negative output.

Second, the row's unique terminal **151** itself provides a concrete *prime-valued* key cursor. The genuinely solved LP2 p56 uses **consecutive-prime totients with transparent plaintext GP F**. Test the especially direct continuation of that historically authenticated method on p0's first black-body runes, with **151 as the first prime**. Original p0 black-body ciphertext starts \`TH J G AE\`, indices \`[2,11,6,25]\`:

1. First key \`φ(151)=150 mod29=5\`; \`2−5 mod29=26\` gives plaintext \`Y\`, a legal first non-F rune.
2. The next prime is **157**; its \`φ(157)=156 mod29=11\`. The second glyph therefore forces \`11−11=0\`, or plaintext GP \`F\`. But in the source-authenticated p56 transparent-F rule, an F must be printed **literally as ciphertext F** and must not spend the key. The original second black glyph is **J**, not F.

**The p56-style prime151 direct inverse is therefore impossible already at black-body rune index1**, irrespective of later language-model choice. A nontransparent or differently initialized rule would be a distinct hypothetical decoder requiring a separate source instruction. This second test is a true exact structural rejection of the frozen p56 continuation.

## Research decision

The original p0 red word-pair → row27 → unique151 → φ150 route is a **concrete, internally consistent numerical cross-artifact candidate**. It may be a puzzle-maker checksum, a clue pointing at the table/prime, or a retrospective numerical construction. The evidence does not yet tell those apart. The complete table-row direct GP29 consumer is nonlinguistic; the simplest p56-verified prime151/F-transparent direct transfer fails immediately. **No previously unknown LP2 plaintext, genuine key, or continuation has been recovered.**

The weakest premise is the unspoken **word-sum-to-row address plus eighth-cell selector**. A meaningful successor would find an independently dated author-visible instruction linking **32 rows**, **151**, and a decipherment *operation*, or use a predeclared row-derived transformation to recover substantial original plaintext on withheld positions. Avoid searching additional moduli, row offsets, cipher families or GP clocks merely to accommodate this arithmetic.

**Reproduction:** [read-only, single-file Node.js 22 CJS original-source test](../sims/lp2_p0_red331_row27_totient_sft.cjs). The original operands, word-pair enumeration and proposed inverses were independently evaluated against fetched exact repository sources inside this invocation; the source-committed SFT is not yet represented as having passed CI.
