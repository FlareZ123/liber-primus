# p50 perimeter76: exact arbitrary-secret homophonic codebook recovery gate from known180

**Agent 3, 22 November 2026. Classification: original-source all-secret key-recovery exclusion for the 256-cell terminal table. No unknown p55 plaintext, actual byte→rune key, or deep-web destination is recovered.**

## The specific plausible human decoder

Three terminal pages have **76, 85, and 95** canonical GP29 rune symbols. The original pp49–51 numerical rectangle is **32×8 = 256 cells**, whose outer one-cell circumference contains **76 cells** and whose 30×6 interior contains **180 cells**, equal to the **85 authenticated solved p56 symbols plus 95 printed-clear p57 symbols**. This is an independently source-visible length association. The solved p57 parable explicitly says to shed circumferences and emerge within, making one perimeter removal a human-plausible choice. No original source explicitly tells a reader to align the table with those three pages or use a homophonic byte alphabet.

A high-payoff hypothesis is that the **interior 180 numerical bytes** are an encrypted rendering of the **known 180 GP29 runes**, and the **outer 76 numerical bytes** would decode to the unknown **p55 76-symbol plaintext** under the same hidden **byte→GP29 homophonic alphabet**. A homophonic mapping allows *any number of different bytes to represent one rune* and grants the entire 256-byte alphabet as an arbitrary secret key. It is therefore much more flexible than previously tested p50-byte modulo29 or fixed XOR/add/sub readers. The known solved pages would supply a training alphabet and the unknown perimeter would become an actually executable receiver if the codebook existed.

## Mathematical invariant without learning the key

For any fixed unknown function `D: byte(0..255)→GP29(0..28)`, if the same byte appears at two original table positions, their **known GP29 output runes must agree**. This equality is unchanged under *every secret bijective relabeling of the 256 byte values*. It requires neither knowing the key nor assuming a numeric formula for it.

The original p56 plaintext is recovered independently from the source-authenticated consecutive-prime-totient GP29 cipher, with **one literal F at rune index56 bypassing a key advance**. The complete asserted p56 plaintext is

`ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE`.

The 95 p57 runes are already clear in the original. Both registers are left intact. As a rival target, we also use the original p56 **ciphertext** with the same clear p57, because the two solved pages are printed in different modes.

For **both** source-defined numeric radices (**base60**, **base59 dropping unused f**), test two physically legible interpretations. Eight 30×6 row-major/column-major interior orders use physical row and column directions independently normal/reversed. The solved p57's explicit *circumferences* language additionally nominates **three interior circumferences of lengths 68+60+52=180**, each read in one of **four physical corner starts** and clockwise or anticlockwise, yielding another eight fixed spiral readouts. Thus there are **16 readouts per radix** against **two** original receiver registers (**64 total**), with no fitted byte order or language scoring. Every complete interior contains **127 distinct byte values** across 180 cells: **53 repeated occurrences**. An unrestricted secret homophonic decoder would need **zero** contradictions.

## Exact original outcomes

| Original target and key policy | Strongest of 16 native physical readouts | Why it fails |
| --- | ---: | --- |
| One secret byte→GP29 mapping across both known pages, p56 **plaintext** and p57 clear | **47 contradictions** among 53 repeated bytes | Same original byte would have to decode to two different GP29 runes |
| One mapping across p56 **ciphertext** and p57 clear | **49 contradictions** among 53 repeated bytes (spiral); **50** among row/column orders | Same exact mathematical impossibility |
| Completely separate arbitrary byte→GP29 mapping restricted to the 85-rune p56 **plaintext** segment | **9 contradictions** | Even resetting the codebook at p56 boundary cannot decode p56 |
| Completely separate mapping restricted to the 95-rune p57 **clear** segment | **14 contradictions** | Even resetting a second independent codebook for p57 cannot decode p57 |
| Three-shed-circumference 68+60+52 readout, both radices and both target registers | **49 contradictions** minimum | Source-nominated spiral reading also has no static decoder |

All **64** original combinations share the same byte-equality pattern between the two radices for a given physical readout and target, because the two original numeral readings are each **one-to-one** over the observed printed cell tokens. Hence choosing the radix or secretly permuting byte labels cannot turn the contradictory rows into a valid homophonic alphabet. No particular 29-way or 256-way key can rescue the specified relationship. The **47** minimum whole-register contradictions, and **49** minimum in the separate spiral family, are exact counts of repeated source bytes receiving incompatible known GP29 labels, rather than a language-model score.

## A full-length key-recovery positive, including 76 hidden runes

The original-source test separately builds an independent **256-cell 32×8 synthetic table**: use all 180 authentic known GP29 symbols, assign up to **two secret byte homophones for each GP rune**, and fill the 76 perimeter cells with a withheld **76-rune authentic clear p57 passage**. After encoding, apply a nontrivial unknown bijection of the entire byte alphabet `b ↦ (173b+47) mod256` to all cells. The decoder receives only interior bytes and their **180 original known GP labels**; it learns the mapping, detects **zero contradictions**, and recovers **all 76/76 held-out rune symbols** correctly without seeing them during training. This confirms that a real hidden homophone table would be solvable by the proposed procedure and that the negative is meaningful.

## Decision

**Reject a direct arbitrary static byte-homophonic codebook linking the 180 p50 inner cells to known p56/p57 GP29 runes and revealing p55 on the 76-cell rim.** The same mathematical failure applies to separate unknown mappings per solved page in all sixteen physical alignments. Different byte-order rules, a position-dependent/evolving decoder, another nonlocal transport, and a p55-only unrelated cipher remain open but have **no independently selected first-party key expansion rule here**.

This source-bounded exclusion is structurally distinct from the earlier 48-program direct arithmetic table readers and the known180 XOR/add/sub + PRNG/visual event codebook gates, because **all 256 byte→29-rune codebook entries are treated as arbitrary hidden keys** with no formula, and the obstruction depends solely on exact source-symbol equality.

Reproducer: [`sims/lp2_terminal180_allsecret_homophone_sft.cjs`](../sims/lp2_terminal180_allsecret_homophone_sft.cjs), read-only CommonJS for Node.js22 Windows. Immutable source inputs are [the canonical LP2 original runes](../resources/liber-primus/lp2-corpus.json) and [the printed numerical rectangle](../resources/liber-primus/lp2-grid-256.json). The test asserts p56's complete solved original text and all terminal dimensions, **64** original variants, including eight 68+60+52 three-ring clockwise/anticlockwise corner readers, and the independently planted 76/76 recovery.
