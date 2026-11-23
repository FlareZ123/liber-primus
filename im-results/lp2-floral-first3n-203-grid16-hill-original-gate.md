# Floral black register: the printed first table value 203 and direct 16×16 table-Hill receiver

**Agent9, 23 November 2026. Classification: original numerical alignment and source-derived original-cipher negative, not recovered plaintext/key.**

## New original-visible cross-object clue

The **very first printed cell** of the p49–51 numerical grid, at the beginning of the numeral panel on physical LP2 p49 (original `66.jpg`), reads **`3N`**. Under the existing conventional 60-character alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`, N has digit23, so **3N = 3×60+23 = 203**. This glyph is independently source-adjudicated in [the complete original256-cell table](../resources/liber-primus/lp2-grid-256.json); its conventional byte value203 occurs **only once among all256 cells**, at zero-based index0.

The sixteen consecutive flower-framed physical pages **p40–55** contain3,316 printed runes. Exactly 68 are red ink: p40 opening8, p53 closing51, p54 opening9. Their exact source-preserving black register has **3,316−68=3,248 = 16×203** GP29 runes. Thus the **first** table value is exactly the inferred black-register row width:

`first p49 grid entry = BASE60(3N) = 203 = (3316−8−51−9)/16`.

A second independently visible original object, the **red 3299 at the center of p15's verified Fibonacci-prime spiral**, now has the exact three-source decomposition **3299 = 16×BASE60(3N) + 51 = 3248 + 51**. The **51** runes are precisely the separately colored red p53 coda, which remains when only the two opening headings (8+9 runes) are removed. Thus the p15 red total, p49 grid's very first numeric cell, the sixteen p40–55 floral pages, and p53's red coda select the same partition without a cipher key guess. This is a more coherent candidate human **register-construction route** than simply noticing that 3299 is prime. The first-token row dimension and p53 red-coda use are still postdiscovery interpretations, so the link remains provisional until an independent deciphering opcode is found.

The **second** table token, `3p`, gives conventional base60 **231**, exactly the number of all-ink p40 runes. Both are potentially human-visible cross-object pointers. **Critical rival:** These values were noticed after the source lengths were established and could coincide by chance. Reading the table under the conjectural **missing-f radix59** instead makes 3N=200 and 3p=227, destroying both direct equalities. No original image explicitly commands BASE60, a 16×203 reshape or reading the first grid cell as a header. The second token is ancillary, without a demonstrated decoding role.

This first-position 203 correspondence does, however, give a more concrete historically plausible **row-width selector** than the earlier factorization alone. It invites one inexpensive complete original-cipher inverse without an arbitrary key search.

## Frozen original 16×16 table-Hill receiver

Take all **3,248** source-black rune symbols from p40–55, keeping their published physical order across every word/page/chapter boundary. Arrange as sixteen consecutive203-symbol rows. The independent p49–51 table has **32 physically printed rows × eight entries**, exactly256 bytes under conventional base60. Pair adjacent physical rows in published order to produce **one 16×16 matrix M over GF29** by reducing each byte mod29. The full original matrix has **rank16** and one exact inverse.

For each original 203-column 16-vector, compute **P[:,j] = M⁻¹ C[:,j] mod29**. This mixes all sixteen source rows at each column. It is different from the earlier [p40–53 16×16 Hill test](lp2-floral16-grid256-direct-inverse-gate.md), which used **188 consecutive sixteen-symbol blocks on all3,008 p40–53 runes**. Here the 203 per-column vectors and the red-excluded 3,248-symbol input are entirely distinct, and the first table cell supplies a potential original-specified dimension.

One natural matrix inverse, its forward matrix, and their transposes were checked without searching keys or phases.

| Source-exact 3,248-rune receiver | GP29 monogram IoC |
| --- | ---: |
| Unchanged original black tape | **0.034491861377** |
| **M⁻¹ C**, primary model | **0.034427004237** |
| M C | 0.034563735225 |
| (M⁻¹)ᵀ C | 0.034456019274 |
| Mᵀ C | 0.034503050182 |
| Original **solved** p57 native plaintext | 0.062709966405 |

The primary inverse's sixteen203-rune rows range between **0.032190411** and **0.036384919**, with no connected original GP prose. Its first native symbols are `M.EA.AE.A.EA.NG.J.EA.J.E.T.O.Y.TH.R.I.E.A.C.EO.A.P.R.EO.N.L.IA.EO.EA.G.EA.L`. Each candidate exactly forward-replays all **3,248/3,248** original runes. An independent complete solved-native p57 GP control was encrypted through the frozen matrix and recovered **3,248/3,248** in the same implementation.

A cheaper source203 **previous-row difference** model, `P[i]=C[i]−C[i−203] mod29` on the remaining 3,045 positions after row0, yields original IoC **0.034516850829** and no prose. The opposing direct + variant yields **0.034426657518**, likewise nonprose. Neither result warrants sweeping arbitrary other lags.

## Independent source-framed 203/51 candidate field split

The same first-cell clue suggests one literal **header/payload/trailer/footer** parse of all 256 original numeral cells: **cell0=203**, cells **1–203** form203 bytes, cells **204–254** form **51 bytes**, cell255 is one final byte (**80**). These dimensions satisfy the separately highlighted p53 red-coda length51 without looking at rune values. The 51 candidate trailer bytes modulo29 match **0/51** source-red p53 rune values at corresponding offsets. More decisively, **15** distinct table-residue classes demand conflicting red symbols, forcing at least **25/51 mismatches even if an arbitrary secret deterministic GP29 substitution** maps byte residue to red-rune output. The original source thus rejects the direct idea that the literal51-byte trailer directly encodes the red51 with any fixed per-symbol codebook. This does not exclude nonlinear multi-byte keyed transforms or a symbolic interpretation of those51 bytes; no first-party note labels a trailer, so those would require new source evidence. The read-only SFT above includes this exact bounded check with a planted zero-conflict positive control. The updated source-original program passed [Windows Node22 run 45191135721](https://github.com/FlareZ123/liber-primus/actions/runs/45191135721): directMatches=0, irreducibleMismatches=25, declaredHeader=203, footer=80, with full matrix and planted-native assertions passing in the same execution.

### Two printed headers and a shortened RS(254,203) interpretation

A more economical **2+203+51** partition uses both leading source tokens as framing: `3N=203` and `3p=231` are two header fields, then **254** genuine original table bytes remain. Their first203 are candidate data, their last51 candidate parity. Thus the 256-cell original panel can physically hold a single systematic **shortened Reed–Solomon RS(254,203)** block without padding or skipping any source byte. This makes one conventional, historically available reversible payload method worth testing, despite the lack of a first-party RS opcode. The 51-check-byte count is independently the p53 red-rune stanza length.

The source-byte test uses **GF(256), primitive polynomial 0x11d, primitive element2**, both normal zero/one initial roots, original row-major or reverse reading of the254-byte field, and the two complete **base60** versus **drop-f base59** source numeric alphabets. Every one of **eight** source-shaped models violates even its *first mandatory syndrome*, independently of what the203 unknown message bytes might be. The first syndromes, in respective root0/root1 order, are:

| Frame numeral codec | Data/parity order | First two syndromes |
| --- | --- | --- |
| conventional base60 | original | **184, 90** |
| conventional base60 | reverse | **184, 112** |
| drop-f base59 | original | **10, 101** |
| drop-f base59 | reverse | **10, 159** |

Over all 51 candidate parity roots, the standard base60 forward read has **50/51** nonzero, and every other orientation has at least50 nonzero. For every single original-layout test, an independently constructed genuine **RS(254,203)** systematic codeword with203 source-shaped data bytes passes all51 syndromes, and a one-byte parity mutation fails the first root. Therefore **the complete actual 254-byte field is not an unmodified standard shortened RS(254,203) codeword** under the two historically natural root conventions and fixed byte readings. This does not rule out encryption before the code, a different field/coordinate order, or an undisclosed outside key; no original instruction selects those additions.

The stronger **2+203+51 direct-red** parse was checked separately: the last51 actual source bytes at indices205–255 match only **2/51** original p53 red runes modulo29. Even allowing an arbitrary secret deterministic byte-residue→GP29 map, observed conflicting input/output classes force **26/51** mismatches. This is a separate exact negative for a direct static codebook on that natural second partition.

[Original-byte single-file RS254 source and planted tests](../sims/lp2_p50_first3n_203_rs254_203_source_gate_sft.cjs) passed on [Windows Node22 CI run 45192668555](https://github.com/FlareZ123/liber-primus/actions/runs/45192668555), covering every syndrome and all eight positive plants. The byte field and its possible split are source observations; **no historical RS operation or unknown plaintext follows**.

## Decision for the human source path

The **printed first 3N** deserves to be retained as a provisional original-artifact row-width clue. It strengthens the causal case for investigating the 16×203 shape, with the base60-vs-base59 objection explicit. A full, source-built 16×16 matrix mixing **all rows** cannot decrypt that register directly into ordinary GP prose. This class differs from the independent [all-secret stationary column-function exclusion](lp2-floral16-203-allsecret-column-capacity-gate.md), which allows 203 arbitrary independent column secret functions but disallows across-row mixing.

The unresolved essential step is an **author-specified reversible cipher operation** using this candidate row width and predicting substantial disjoint original plaintext, with correct treatment of p53 red51 and the cross-page word carries. Nothing authenticates modulus29 reduction, using the whole table as a Hill matrix, matrix orientation or which original chapter carries the key. **No unknown LP2 plaintext, authentic key, or final destination was recovered.** Avoid tuning matrices, key phases and extra layers without a new primary-source opcode.

**Complete exact SFT:** [`sims/lp2_floral_first3n_203_grid16_hill_original_sft.cjs`](../sims/lp2_floral_first3n_203_grid16_hill_original_sft.cjs) uses source page and red-span asserts, first table tokens, invertible GF29 matrix, all four complete source decoders with exact replay and one full-length genuine solved-native plant. The original-source numbers and replay were independently calculated in memory against the connected GitHub corpus before committing the reproducer. The original-source SFT passed [GitHub Actions Windows Node22 run 45189541166](https://github.com/FlareZ123/liber-primus/actions/runs/45189541166) after correcting the genuinely optional red-spans field in annotation-only records. The run asserted source counts, the original 16×16 matrix, 203-column inverse scores, all four complete original forward replays and a full GP29 source plant.