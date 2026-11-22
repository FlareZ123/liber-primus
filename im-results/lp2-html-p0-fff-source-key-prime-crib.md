# The uniquely consecutive F-headed words after the historical HTML p0 boundary: original-cipher decisions

**Agent44, 22 November 2026. Scope: original LP2 physical p0 words40–42, first-party historical HTML and authenticated solved-p56 encryption function. Status: exact source structure and finite negative cryptanalysis. Unknown plaintext, an authentic new key and the final Cicada destination remain unrecovered.**

## Source-constrained entry and original cipher

The archived 2014 Stage11 delivery HTML prints literal title **133** and container id **331**. As established separately in the [2014 Stage11 corridor study](lp2-2014-html133331-p0-36word-corridor.md), interpreting both as addresses modulo the 256 cells of the original pp49–51 base60 table gives `table[133]=141` and `table[331 mod256]=table[75]=177`. These are exact original physical p0 rune positions and delimit an intact eight-word, 36-rune ciphertext passage; the HTML does **not** independently instruct that address grammar. The right endpoint **177** is exactly the beginning of the following printed word40:

| Original physical p0 word | Rune start | Rune count | Original GP-transliterated cipher |
| ---: | ---: | ---: | --- |
| 40 | **177** | 6 | `FXAEPGX` |
| 41 | **183** | 6 | `FLWEOTAE` |
| 42 | **189** | 3 | `FGN` |
| 43 | **192** | 4 | `MEOLN` |

The initial rune of each of words40–42 is **F**, forming the sole three-consecutive-F-headed printed-word run among **2,896 complete original unknown-page LP2 words**. The third word starts at source table address189; **`table[189]=192`**, the following original p0 word begins at position192, and **`table[192]=00`**, the first of the original numeric table's only two literal zero cells (the other is 229). The historical first-party DH23 worked example independently supplies [23,8,5], which can be combined retrospectively as address `23×8+5=189`; it does not instruct that construction. This is a concrete convergence of source geometry. The alignment and uniqueness are literal properties of the source, but the chain of transfers and a deciphering opcode remain unselected.

The 2014 HTML concatenation `133331` is exactly `11×17×23×31`; the corresponding GP-prime runes read outside-in as `RIGH`, becoming `RIGHT` upon appending the GP rune T. This is a separate, retrospective interpretation; it does not provide an AES key or a cipher-specific instruction. The numerical table's 60-character alphabet uses every character except lowercase `f`, index41; p0 word41 is the middle F-headed word, another exact but weak positional connection. No claim that the repeated ciphertext F letters must be *plaintext* F is justified, because the original solved p56 authentic prime-totient cipher demonstrates that ciphertext F can encode a non-F plaintext rune.

## One-source-key AES128 original-data inverse

The three source F-headed words contain **12 noninitial rune indices**. Concatenate those exact indices in printed order with the four outside-in historical palindrome factor indices `RIGH`. The resulting source-frozen 16-byte key is

```
14 25 13 6 14 20 7 12 16 25 6 9 4 10 6 8
X AE P G X L W EO T AE G N R I G H
```

The minimally typed receiver chosen for this challenge is the canonical 256-byte numerical table, unchanged, under **AES-128-ECB**, no IV, padding disabled, no key/phase search. The full original 256-byte inverse gives SHA-256-anchored ciphertext and this decrypted beginning:

```
d4e9cbf89c4aeabcd1d1da746cfcdef7b915a38c867957aa67ff05680c85855e
```

All 256 original bytes encrypt back exactly, and a genuinely planted 256-byte AES positive round-trips. The output contains **88/256** printable ASCII bytes, **29/256** bytes under29, empirical byte entropy **7.15899421** bits, and no standard recognized leading archive/image/media file signature. It resembles ordinary unstructured bytes and does **not** recover a typed payload. AES is only a hypothesis; no historical creator source specifies this assembled AES key.

## Exhaustive original p0 FFF crib under the *authenticated* p56 mechanism

A stronger consumer uses an existing, genuinely authenticated rule rather than a new cipher design: original solved p56 was encrypted with successive **(prime−1) modulo29** key residues, with **plaintext F passed through without consuming a key position**. The three original ciphertext F heads could each be literal F or an encrypted non-F; both cases must be kept. The test fixes the exact three original printed word lengths **6,6,3**, original ciphertext offsets **177–191**, and examines every **common continuous prime-key starting offset 0–199,999**, together with all **2³=8** possible literal-F masks, using the unchanged GP29 aliases and a named TextBlob-derived English word-frequency lexicon.

Across **1,600,000** original source cases, thirteen offset/mask cases decode the first six-rune word into a listed English word (examples: `LUSTER`, `RICHLY`, `CURTLY`, `LASTLY`). **Zero** produce two consecutive dictionary words and **zero** produce the complete three-word English phrase. The untouched original ciphertext gives no three-word decoder candidate under this finite family.

The test is not intrinsically unable to recognize three-word plaintext: a withheld, genuinely encrypted GP29 control **FOLLOW FREELY FAR**, with the exact **6,6,3** GP-rune word shape, planted at prime-key offset**133331** with all three Fs literal, is blindly recovered **exactly** at that starting clock and F mask**7**. The source script checks original plaintext-F encryption and exact inverse. This is a decisive negative for the defined finite authentic-p56-transfer family, not proof against clocks outside 200,000, other word-specific starts, unrelated ciphers or lexicon-absent historical prose.

## Research decision

The original HTML boundary → unique p0 FFF word run → original table first zero is a specifically localized original-artifact **route candidate**. Its consecutive F heads merit preservation for future source-selected operations. The two concrete consumers above do not recover plaintext: the assembled historical-input AES128 key fails on the only original 256-byte typed register, and exhaustive 200,000-position authentic prime-totient/F-skip decoding fails an original 6/6/3 three-word dictionary test despite a positive under the same model.

**Avoid iteratively tuning AES modes, guessed F masks, key reorderings or word starts on this already-inspected passage.** Advance the branch only on an independent source selecting an exact transition, new authentic plaintext from historical drafts, or a full original ciphertext inverse yielding readable untouched output.

**Reproducible source-only Windows Node22 tests**: [original p0 FFF source AES inverse](../sims/lp2_2014_html_f3_aes128_grid_source_sft.cjs) and [original p0 FFF 1.6-million prime-clock search](../sims/lp2_p0_fff_primeoffset_lexical_sft.cjs). Both PASS [Windows CI run44974413276](https://github.com/FlareZ123/liber-primus/actions/runs/44974413276), together with the earlier [p0 36-rune Hill6/seven-share receiver](../sims/lp2_p0_36_hill6_shamir7_sft.cjs). Original data inputs are checked-in historical index, native LP2 transcription, GP29 corpus, original 256-byte base60 grid and explicit English word lexicon. The byte-level/original-cipher claims above were obtained from that run.
