# LP2 thirteen-dot intervals: all-secret stationary predecessor gate

**State, 18 November 2026.** This is an exact, reproducible exclusion of a bounded original-cipher family against authentic GP29 source controls. **No new LP2 plaintext or creator key** has been recovered.

## Physical source and attack premise

Original unsolved pages p0–55 carry 12,956 GP29 rune symbols in 2,896 printed words, 32 of which cross physical pages. There are 28 original thirteen-dot marks (31 including solved pages). Their positions define 28 successive spans, 26 nonempty and two empty due to coincident marks at rune offsets 1,860 and 3,603. The last mark is at rune offset 12,956; all are at word boundaries. Original-image p0 has 13 red title runes followed by its large 13-dot marker at offset 13.

The candidate was an arbitrary **mark-local stationary first-order substitution**:
\[
C_i = S_{I,C_{i-1}}(P_i).
\]
Every interval I receives its own completely secret table consisting of **29 independent permutations over 29 GP29 symbols**, one permutation for each observed predecessor ciphertext symbol, plus a free first plaintext rune. No key, alphabet, seed, or reset parameter is guessed. The competing model has punctuation delimiting paragraphs while the cipher evolves across the marks.

## Exact all-key plaintext IoC ceiling

For each original interval, let a[r,s] be the number of transitions from ciphertext predecessor r to ciphertext successor s. A secret row bijection can only permute the 29 entries of that one row. Let b[j] be the sum of the j-th largest row counts over all 29 predecessor rows. By pairwise rearrangement inequality, the greatest possible sum of squared plaintext-symbol frequencies is achieved when every row is sorted and aligned in the same descending order, with the free first plaintext rune placed in the largest column. Consequently the **tight all-secret maximum** is
\[
\mathrm{IoC}_{max} =
\frac{\sum_{j=0}^{28}(b_j+[j=0])(b_j+[j=0]-1)}{n(n-1)}.
\]
The implementation constructs the actual original-cipher inverse-row permutations attaining this mathematical maximum, then tests that separate GP29 native prose encrypted under planted arbitrary 29-row tables always decrypts exactly and respects the bound.

Eight pinned GP-native source variants are used for comparison: Gibran, Emerson, Shakespeare and solved LP1, each in ordinary and ING→NG / IO→IA alternate spellings. Source minima include **every contiguous GP-rune window** of the required length, even ones starting inside printed words. This source set is therefore more inclusive than literal equal-word-boundary quotations.

| 13-dot interval | Original rune range | Length | Exact maximum plaintext IoC | Minimum source IoC | All-source excluded |
|---:|---:|---:|---:|---:|:---:|
| 1 | 13–729 | 716 | .068394734 | .052861663 | No |
| 5 | 851–1541 | 690 | .069460045 | .052712396 | No |
| 7 | 1552–1860 | 308 | .110643428 | .049452176 | No |
| **10** | **1874–3603** | **1,729** | **.048680060** | **.054935014** | **Yes** |
| **14** | **3623–5506** | **1,883** | **.048935523** | **.055155954** | **Yes** |
| 16 | 5522–6527 | 1,005 | .056078175 | .053626291 | No |
| **18** | **6546–7960** | **1,414** | **.051096556** | **.054969464** | **Yes** |
| **22** | **8059–9519** | **1,460** | **.053132658** | **.054699691** | **Yes** |
| **25** | **9640–12648** | **3,008** | **.043670929** | **.055969360** | **Yes** |
| 27 | 12657–12956 | 299 | .111737110 | .049314269 | No |

**9,494 original ciphertext runes (73.28%)** are in five long intervals whose all-secret plaintext IoC ceiling lies below the minimum of every same-length control source window. This is exact for the model and controls, independent of any hidden permutation table.

## Independent all-secret row majorization and word tests

The original prior SFT, repaired and rerun, tests a complementary necessary condition. For each k, the combined plaintext count of any k symbols cannot exceed the sum of the k largest ciphertext successor counts per predecessor row, plus a possible first symbol. It searches source windows matched to the original **rune count and word count** of each interval, without assuming the exact target word-length sequence.

The top-k gate rejects all matching source windows in intervals **10 (1,729 runes, 89 windows, k=1–26), 14 (1,883, 297 windows, k=1–26), 16 (1,005, 191 windows, k=2–17), 18 (1,414, 378 windows, k=1–25), 22 (1,460, 121 windows, k=1–23), and 25 (3,008, 53 windows, k=1–28)**. These six intervals account for **10,499 original runes (81.04%)**. No exact row-sorted conditional collision spectrum was observed among the tested windows. This gate is stronger than the pure IoC ceiling for the 1,005-rune interval.

An additional **36,710-unique-word GP29 lexicon** leaves zero individually impossible slots among all 2,896 printed original words. This only establishes *local* compatibility. A jointly consistent choice of words and shared secret row permutations has not been demonstrated. All 26 planted source-native interval controls preserve the exact original word lengths and forward-roundtrip with positive all-key invariants.

## Cryptanalytic decision

The proposed stationary mark-local one-back bijection cannot yield any of the tested ordinary GP29 source-text windows over six long printed intervals. Key-hunting inside this exact family should be retired. The evidence does not establish an impossibility theorem for every conceivable English passage, since an unusual English text may have highly atypical rune frequencies. Nonstationary ciphers, additional states, a representation layer prior to ordinary GP text, and an external key remain open possibilities. No original source establishes thirteen-dot marks as actual cipher resets. The separate nonstationary search is Director issue #1422.

## Reproduction

- [Exact IoC ceiling and tight original-cipher witnesses](../sims/lp2_13dot_mark_local_ioc_ceiling_sft.cjs), [Windows Node22 PASS 44315241512](https://github.com/FlareZ123/liber-primus/actions/runs/44315241512).
- [Full original mark-local row-spectra, top-k and word-slot test](../sims/lp2_13dot_mark_local_predecessor_allsecret_sft.cjs), [Windows Node22 PASS 44314862914](https://github.com/FlareZ123/liber-primus/actions/runs/44314862914). Its initial invalid JavaScript object-property name was corrected before successful execution.
- Inputs: [canonical GP29 ciphertext](../resources/liber-primus/lp2-corpus.json), [original ink marks](../resources/liber-primus/lp2-ink-annotations.json), [punctuation identity](../resources/liber-primus/lp2-punctuation-identity.json), [p0 physical override](../resources/liber-primus/lp2-p0-physical-ink-override.json), the original transcription, the four pinned native-language source texts and their orthographic variants.
