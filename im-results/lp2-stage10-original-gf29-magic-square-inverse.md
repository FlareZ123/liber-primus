# Original 2014 Stage10 magic squares as GF29 Hill operators on p33–39

**Agent45, 12 November 2026. Classification: exact source-selected matrix algebra and a bounded original-cipher failure. No recovered LP2 plaintext, key or destination. Director Issue #561.**

The original p33 opening draws two numerical values, **1033** and **3301**, also displayed as magic sums in authenticated 2014 Stage10. The source-preserved three literal magic squares are in `resources/cicada2014-openpuff-magic-squares.txt`, with rows as originally printed. They furnish three entirely specified integer matrices, of shapes 5×5 (line sums 3301), 7×7 (1033), and 5×5 (1033). A 2014 solver might try these as **Hill-cipher block matrices modulo29**, in the original 29-GP rune register. This application is a hypothesis: the historical square stage supplied navigation/magic arithmetic, not an explicit LP2 Hill instruction.

## Key-independent viability

Exact modular Gauss–Jordan elimination on the three literal source matrices gives:

| Historical source matrix | Matrix rank over GF29 | Determinant mod29 | Invertible? |
| --- | ---: | ---: | --- |
| 3301 / 5×5 | 5 | **10** | Yes |
| 1033 / 7×7 | 7 | **2** | Yes |
| 1033 / 5×5 | 5 | **3** | Yes |

Unlike a singular keyless operator, **every one is a lossless GP29 transform**. All determinants are nonzero modulo29 and the entire 5×5 or 7×7 inverse is uniquely determined without search. The exact word and page positions to which it should be applied remain unselected by the author.

## Source-fixed original chapter inverse

The **visually selected original physical pp33–39 chapter has exactly 1,680 runes**, a complete 336 blocks of five or 240 blocks of seven, with no added padding, omitted F, secret offsets, altered rune order or material from another chapter. Fix GP29 numerical values exactly as in the pinned canonical `lp2-corpus.json`. Standard Hill decryption applies each matrix's unique GF29 inverse to contiguous ciphertext blocks, left to right; direct multiplication of every resulting plaintext block by the original source matrix must recreate all 1,680 original runes.

| Historical exact matrix | Original ciphertext IoC | Decrypted chapter IoC | Readable GP prose? |
| --- | ---: | ---: | --- |
| 3301 / 5×5 | 0.03436002155 | **0.03439263734** | No |
| 1033 / 7×7 | 0.03436002155 | **0.03467483479** | No |
| 1033 / 5×5 | 0.03436002155 | **0.03452239145** | No |

For a concrete direct check, the 3301 matrix opens `E IA EO E W I D E L C OE OE U IA P T Y L F AE G I U OE EA G NG X OE L D NG R U Y`; neither this nor the other two decoded outputs contains a coherent original LP2 instruction. The IoC remains essentially uniform, far from ordinary source-native English. Every original rune forward re-encrypts exactly; algebraic reversibility is a correctness control and **does not authenticate a guessed Hill encryption**.

Positive control: each same original matrix encrypts a completed GP29 block sequence from the independently solved p57 *PARABLE* plaintext; the tested matrix inverse recovers the source GP runes exactly. This tests 5×5 and 7×7 implementations without training on unknown ciphertext.

A separate **91-rune introductory p33 unit** ends at a second red mark. The 1,589-rune remainder within the physical p33–39 chapter **is not divisible by five or seven**, hence the proposed exact fixed-block Hill cipher cannot fully decode the *remainder alone* without an extra, genuinely source-specified padding, reset or inclusion rule. Nothing authorial selects such a rule; do not silently discard four trailing symbols.

## Decision

The authentic three squares **are valid Hill matrices over GP29**, which makes the original-operation hypothesis executable, but their direct, unique inverse **does not recover any original unknown text** from the one complete source-visible 1,680-rune chapter. Retire this literal three-matrix Hill family in original row/column order under that chapter registration, including source-derived arithmetic signage. Do not search cell permutations, secret phases, key matrix mixtures, alphabet swaps, or padding repairs without new original instructions. The source link p33↔2014 Stage10 remains real; an intended decryptor, if any, is still missing.

**Reproducer:** [source-native CommonJS exact inverse SFT](../sims/lp2_stage10_magic_square_gf29_hill_original_sft.cjs). All source checks, three inverses, original forward reencryption and three solved-page positive controls passed [manual GitHub Actions run 43162008094](https://github.com/FlareZ123/liber-primus/actions/runs/43162008094) on Node.js22.
