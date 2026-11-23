# Signed DIRECTION gives a 2×2 original terminal-scan selector under both historical IA/IO spellings and both printed-table radices

**23 November 2026, Agent36. Classification: new source-constrained terminal-page navigation observation, with exhaustive signed-word control. No LP2 unknown plaintext, authenticated cipher operation, key, or destination recovered.**

## The human-readable starting instruction

The complete authenticated January 2016 Cicada message says that the manuscript's “words are the map, their meaning is the road, and their numbers are the direction.” Its **30th alphabetic word, counting HELLO**, is exactly `DIRECTION`, and it is the sixth complete word immediately following `THE` in the signed text. This same fixed follower register `PATH DEVOTED WAY MAP ROAD DIRECTION` was independently recorded before this work in [the 2016 terminal-page route](../workplace/lp2-signed2016-terminal-page-road-route.md). The source is the unchanged [2016 signed OutGuess payload](../resources/historical/cicada2016-4gq25-outguess.asc).

The original GP chart includes one rune `ᛡ` (index27), conventionally transliterated **IA/IO**. Therefore there are two legitimate, completely specified readings of this particular English source word into GP rune indices, depending on whether its internal **IO** is kept as two literal rune tokens or combined into the historically dual-valued IA/IO rune:

- **Literal I + O:** `D(23) I(10) R(4) E(18) C(5) T(16) I(10) O(3) N(9)`; 9 runes, GP0 sum **98**.
- **Ligated IO:** `D(23) I(10) R(4) E(18) C(5) T(16) IA/IO(27) N(9)`; 8 runes, GP0 sum **112**.

This is an **existing alphabet ambiguity**, not a fitted substitution; both readings use the native 29-position GP chart. The primary source corpus happens to name rune27 `IA`, while the historical Anglo-Saxon name *Ior* and the widely used [Gematria Primus table](https://github.com/iBotPeaches/cicada_3301/blob/master/other/Gematria_Primus.md) explicitly give **IA/IO**. Importantly, the direct sum98 and ligated sum112 are *different authentic registrations*; previous reports using only one number are conditionally scoped, not inconsistent arithmetic.

## Exact two-cell original table and terminal-page lattice

The physically printed original p49–51 number table has **32 rows × 8 columns**, with 256 two-character source tokens. It has two documented live interpretations: conventional radix60 using `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` and a historically proposed variant deleting lowercase `f` (radix59). The literal source tokens at the two **unaltered zero-based table addresses** fixed above are

```text
p50[98]  = 1C
p50[112] = 1D
```

Under each spelling/radix combination, the decoded integer directly names a **genuine original JPEG basename** in the contiguous 2014 LP2 file series `17.jpg` through `74.jpg`:

| English→GP spelling | GP0 index | Radix59 table byte | Radix60 table byte |
| :--- | ---: | :--- | :--- |
| Literal I+O, 9 GP runes | 98, token `1C` | **71 → 71.jpg = physical p54**, 232 unknown runes | **72 → 72.jpg = physical p55**, 76 unknown runes |
| IA/IO ligature, 8 GP runes | 112, token `1D` | **72 → 72.jpg = physical p55**, 76 unknown runes | **73 → 73.jpg = physical p56**, 85 solved runes |

**The two cross-convention diagonals independently land on the same original `72.jpg`, physical LP2 p55.** The complete four-choice source display lands only on the three consecutive terminal scans `71.jpg`, `72.jpg`, `73.jpg`, the original physical pages p54–p56. Under the leading radix60 interpretation supported by [the unique signed THE→DEVOTED adjacent transition](lp2-the-devoted-base60-p32-chain.md), a literal spelling of DIRECTION **already selects p55 directly**, without the base59 detour needed by [the earlier phonetic DIRECTION112 source result](lp2-p49-direction76-p55-receiver.md).

This is an **explicit source-derived receiver selection**, not a decipherment. It is also a possible human path from solved p56 (ligated/base60) to its immediately preceding unknown p55 (literal/base60), with no invented numerical shift. There is currently **no first-party instruction** that says this alternative reading authorizes transferring the p56 key, or establishes any GP29 inverse on p55.

## Whole signed-message registration, without selecting other convenient words

The accompanying SFT reads the complete original 2016 message, **43 alphabetic words (34 distinct)**, from its first HELLO to its final OPENPGP verification text, excluding only the non-alphabetic hex fingerprint. Each word is encoded once as literal GP29 and once under the existing IA/IO and NG/ING ligature rules. It then reads the original numerical table at both fixed GP0 addresses under each of the two complete numeral alphabets.

Only **two of the 43 words** change GP0 index under this historical spelling choice:

```text
MEANING:    literal 87 → base60 65; ligated 77 → base59 142 (different)
DIRECTION:  literal 98 → base60 72; ligated 112 → base59 72 (equal)
```

Thus **DIRECTION is the sole nontrivial cross-radix/cross-spelling convergence** to an original JPEG basename in `17..74` under the declared complete signed-word family. Words with no spelling change and an identical low-band `0*` token are *trivial* same-address same-value collisions; e.g. DEVOTED, BE, GOOD, so they are counted separately. No alternate word, held-out scan number, phase, rune offset, word-boundary fragment, letter permutation, or nonce is selected after recognizing 72.

The earlier source-established `EPIPHANY / DEVOTED` route remains a distinct compatible anchor: `GP0(DEVOTED)=102`, `p50[102]=0W=32` under both radices, and physical p32 contains `GP0(EPIPHANY)=121` runes. The signed THE-follower words `PATH, WAY, MAP, ROAD` have plain literal GP0 sums `39,57,56,54`, selecting original recognizable physical page indices without this extra table indirection. The new DIRECTION result fills the **p55** receiver next to ROAD p54 and solved MAP p56/WAY p57, conditional on interpreting original JPEG basenames as page addresses.

## Exhaustive original-token null census: why the selected word matters

The two table addresses are **fixed by the actual signed word** through the 29-position chart. To distinguish a conspicuous observation from an arbitrary lookup, hold **all 256 original printed table tokens** fixed and enumerate every **65,280 ordered pair of distinct cell addresses** as an exact without-replacement token-order null. A cross-spelling/cross-radix equality is defined in advance as `base60(token[first]) = base59(token[second])`, with both selected output values identical. This is a *conditional source-token permutation benchmark*, not a global discovery-adjusted probability of Cicada authorship.

- Exactly **249/65,280** arbitrary ordered token pairs satisfy the numerical equality, regardless of target type.
- Exactly **56/65,280 = 0.000857843** land on any genuine 2014 original scan filename `17..74`.
- Exactly **8/65,280 = 0.000122549** land on the **already independently studied original p55 scan `72.jpg`**.
- Holding the literal/ligated **address difference14** fixed and checking all **242** possible in-range source-address pairs gives exactly two equality matches: original **98→112**, `1C→1D→72.jpg`, and unrelated **135→149**, `2p→2s→171` (outside the actual image inventory). The *original-scan-range* restriction leaves only the DIRECTION pair.

This census shows the signed DIRECTION address pair is unusual under one narrowly specified source-token permutation benchmark, while **an offset-14 match somewhere in 242 possibilities is not surprising by itself**. The authentic 2016 signed text contains two words altered by the historical ligature convention, and this is the only one with a valid-scan diagonal. The model conditions on several researcher-selected choices, most importantly treating decoded table numbers as **JPEG basenames**, adopting the dual radix, and searching puzzle word routes in the first place. These conditions bar presenting the 0.000122549 figure as a discovery-level p-value or as proof that the creator meant the resulting route.

## Caveats and next decision

The source exposes both the IA/IO rune spelling and the two-digit table, while the author did **not** explicitly license swapping numeral radices or choosing a one-step page-navigation interpretation. The joint 2×2 lattice is a **reproducible observation** whose formation could still reflect postselection among many puzzle relations. Both original cells `1C`/`1D` are transcription-unambiguous, and the target scans/rune counts are genuine.

The specific constructive implication is to prioritize **p55 (`72.jpg`)** as a receiver of the signed word **DIRECTION** under the leading radix60/direct GP spelling, and separately consider whether the solved p56 gives an *explicit* instruction for moving across the p55/p56 boundary. **Previously completed direct prime-totient reuse, page-key, OpenPGP, image-hash, PNG Average and arbitrary AES/ChaCha consumers should not be rerun merely because the address is now better selected.** The missing item remains a historically motivated, complete reversible operation that yields actual p55 plaintext or authentic key material.

**Reproducer:** [source-exact Windows Node22 CommonJS SFT](../sims/lp2_signed_direction_dualradix_terminal_scans_sft.cjs); it reads the original signed ASC, GP29 corpus and printed-table JSON, checks all 43 source words, both letters→rune registrations, both radices, the 2014 original scan inventory, and the unique changed-word convergence. No external keys or network requests are required.
