# Original 256-cell table as a 16×16 GP29 Hill matrix: complete natural inverse gate

**Agent49, 15 November 2026. Supporting negative for a specific source-motivated full-block cipher; no recovered original LP2 plaintext or key.** Four exact, invertible variants decode every complete 16-rune block of the unchanged unknown manuscript to near-uniform GP29 text. This rejects the literal 16×16 row-major table as a direct English-bearing Hill key; the original table's purpose remains unresolved.

## Why the operation is worth one precise check

The original pp49–51 numerical table has **32 printed rows of eight cells = 256 two-character tokens**, so its unchanged row-major sequence forms one **16×16** square. The original p15 visual source independently prints an explicit **4×4** numerical square (16 values), while earlier solved 2014 Cicada stages demonstrate matrix/square operations. All LP2 rune-bearing pages together happen to contain **13,136 = 16×821** runes. These clues make a length-16 linear block encoding a cheap natural candidate, though this total **includes 180 already solved/clear terminal runes** and cannot prove that the 12,956 unknown runes form one such stream.

Under the existing *conditional* conventional base60 numeral interpretation, write the 256 source bytes row-major as **K∈GF(29)^(16×16)**, where `K[r,c] = byte[16r+c] mod29`. The exact original K is **nonsingular** with rank16 and determinant **25 mod29**. Both K and K transpose have unique inverses.

The four natural direct cipher/inverse contracts are:
1. `C=K P`; read `P=K^(-1) C`.
2. `P=K C`; read `P=K C` and encode with `K^(-1)`.
3. `C=K^T P`; read `P=(K^T)^(-1) C`.
4. `P=K^T C`; read `P=K^T C` and encode with `(K^T)^(-1)`.

Keep the original 29-rune mapping, table byte order, zero-based block clock starting with original p0 rune0, and source physical page/rune order unchanged. Use the **809 complete 16-rune blocks = 12,944 symbols**, excluding exactly 12 trailing unknown runes that a fixed-block decoder cannot consume without inventing padding or coupling to the separately solved tail. No secret matrices, phases, rotations, language-score fitting, word resplits or added layers.

## Exact results

| Natural field inverse | GP29 coincidence index (12,944 decoded runes) |
| --- | ---: |
| `K^(-1) C` | **0.0344567514** |
| `K C` | **0.0345078335** |
| `(K^T)^(-1) C` | **0.0344802451** |
| `K^T C` | **0.0344960986** |

For comparison, the original **12,956-rune** unknown source has GP29 IoC **0.0344783979** and independently clear p57 has **0.0627099664**. All four inverse outputs remain essentially at random 29-rune baseline `1/29 ≈ 0.03448`, with no native-GP prose. The original first decoded 16-rune block under K inverse is **AE EO U Y P A P IA F B X I H EO M J**; it is not a readable heading. The incongruent original unknown-tail length of 12 further obstructs a purely repeated 16-rune whole-book block encoding.

**Positive/roundtrip controls:** the source test constructs a 96-symbol native-GP plant from independently readable p57, encrypts under each of the four source-original matrix contracts, and recovers **96/96** known runes per contract. It also checks **all 16 basis vectors** against both K×K-inverse identities and forward-replays **all 809 original ciphertext blocks** exactly. These checks prove that near-uniform outputs are genuine original-data negatives for the frozen operations rather than algebraic implementation failures.

The separate 2013 BASE29 and original p39 quadratic factors of the 256-byte table do not automatically make K a cipher key. In a supplementary exact GF29 check, the characteristic polynomial of this row-major matrix has **nonzero** remainders modulo both independent factors H and G, so those source factors are properties of the **one-dimensional 256-coefficient table polynomial**, rather than inherited eigenpolynomial factors of this 16×16 interpretation. Their corresponding high-to-low quadratic remainders are `H:[5,11]` and `G:[11,5]`, respectively.

## Decision

Retire the direct **Hill-16 GP29** interpretation of the unchanged original 256-cell grid, in both natural matrix orientations and both key/inverse directions. Do not continue by tuning shifts, inventing padding or arbitrary secret block permutations to improve plaintext statistics. Those would require an independently visible instruction. A 16×16 rearrangement remains a valid mathematical view of the table, but neither table geometry nor the manuscript total is an authenticated decipherment rule.

[Source-original single-file CommonJS test](../sims/lp2_grid256_hill16_original_sft.cjs) · [passing Windows/Node22 workflow run](https://github.com/FlareZ123/liber-primus/actions/runs/43659124484). The existing [16×16 magic-square negative](lp2-pp49-51-16x16-magic-square-gate.md) tests **different** fixed-row sums and is unaffected. No authoritative `results/README.md` change is justified.
