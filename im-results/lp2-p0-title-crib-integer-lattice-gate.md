# Opening red-title conditional crib: exact integer-key recovery

**Status (Critic, 27 November 2026): input-label correction and 28 November canonical replay: the original historical experiments below used an erroneous operand; the separate canonical replay immediately following this notice now tests the genuine EPIPHANY SEEKS candidate.** The canonical GP29 map has E=18, A=24, Y=26 (M=19, AE=25, IA=27). The actual 13-rune EPIPHANY SEEKS candidate is `[18,13,10,13,8,24,9,26,15,18,18,5,15]`, independently reproduced by subtracting the previously reported marker-derived key `[26,24,8,19,27,24,18,3,0,8,0,16,19]` from the original title modulo 29. The five committed SFTs instead freeze `[19,13,10,13,8,25,9,27,15,19,19,5,15]` (M-P-I-P-H-AE-N-IA / S-M-M-C-S), differing at offsets 0,5,7,9,10. The erroneous vector was inherited from the 26 November Hill report. The signed wording does not authenticate the title itself. All counts, bounds, exponents, minimum matrices and body scores below refer **only to the actually executed erroneous vector**; they cannot exclude or rank the intended crib. Retain the original raw outputs and scripts as historical evidence. The canonical replay below derives the corrected operand from the canonical chart and asserts its transliteration. The old outputs remain historical evidence.

## Canonical EPIPHANY SEEKS original-cipher result (Agent5, 28 November 2026)

The Critic identified a five-position operand error in the original experiments, so those original numeric results below do not apply to the intended crib. The exact five preserved receiver cores have now been executed once with the **canonical chart-derived** operand `EPIPHANYSEECS` = `[18,13,10,13,8,24,9,26,15,18,18,5,15]`. Original source red 8+5 shape and the signed 2016 phrase motivate this conditional crib, not an authenticated title. No key bounds, control text, language model, ranking rule, phase or split were changed. Fit only black p0 (249 runes), evaluate p1–2 (467 runes, or the first 460 for the BE affine interval equivalence class). These splits are held from this fit, not globally unseen.

| Receiver | Canonical title-compatible keys / classes | Best fit | Frozen held |
|---|---:|---:|---:|
| LE affine decoder | 111 | -3.441850 | -3.469742 |
| LE affine encoder | 106 | -3.435475 | -3.489424 |
| BE affine decoder | 0 | — | — |
| BE affine encoder | 83 exact pairs / 26 classes | -3.442564 | -3.475244 |
| Literal Möbius power, centered lifted exponent | 1 | -3.478654 | -3.493535 |
| LE projective, all coefficients <29³ in magnitude | 0 primitive matrices | — | — |
| LE projective, globally minimum max coefficient | 1 | -3.491337 | -3.478246 |

The corrected centered power exponent is **154386840463445327**, unique modulo 9906813929753133148; the exact minimum primitive projective matrix is `[[16666,-30758],[-25524,-23279]]`, max coefficient 30758. In the bounded 29³ projective lattice the only point is zero. The BE affine decoder still has no key at the frozen 29⁷ bound. Every selected original candidate replays its complete frame; no body yields recognizable sustained prose. The held scores are all below the uniform-symbol log score -ln(29), approximately -3.367296. In control cases the LE affine, Möbius and bounded projective receivers recover all 716 body runes for both fixed native fixtures; BE encoder recovers all 709 scored body runes, BE decoder 708/709 with tied B classes, and the minimum-projective criterion selects the wrong smaller key for one of two fixtures. No stronger recovery claim is justified.

**Decision:** the previously untested canonical operand now has the same substantive negative decision in all these precise scopes. Do not widen coefficient or exponent ranges, tune the crib, or rerun these lattice families solely on its retrospective title sum. The crib itself remains provisional, and unbounded matrices/exponents, other encodings and cipher mechanisms remain open. No unknown plaintext, authentic key or new destination. [Canonical replay wrapper](../sims/lp2_p0_title_crib_canonical_lattice_sft.cjs) · [Complete executed output](lp2-p0-title-crib-canonical-lattice-output.json). Executed exact receiver cores in connected V8 using the recorded source blobs; standalone Node wrapper not separately run. Historical erroneous-operand output below is preserved and explicitly scoped.

## Historical erroneous-operand experiments (retained)

Agent13 draw10, 27 November 2026. Independent mechanism from title as periodic key, 3x3 Hill, and previous title-excluded chapter affine tests. The original runs keep all 729 opening-chapter runes. Cipher title `[15,8,18,3,6,19,27,0,15,26,18,21,5]`; actual tested crib is the erroneous vector above. Rank on black p0 (249 runes), predict frozen p1–2. All controls are native donor plants, not evidence of original intent. No plaintext-F bypass.

## Affine lattice receiver, signed 7-digit keys

Let Q=29^729, M=29^13, R=29^716, L=29^7=17,249,876,309. Both encryption C=A*P+B mod Q and decoder P=A*C+B mod Q, unit A, abs(A),abs(B)<L. Bound is exploratory, not source-selected.

**Low-order title (LE):** for known input/output title integers X,Y, solve A*X+B=Y mod M. All integer solutions lie in the coset (0,Y)+span_Z{(1,-X),(0,M)}. Exact 2D Gauss reduction, then bound both lattice coordinates by the four rectangle corners and enumerate all points in [-L+1,L-1]^2. 1,167 exhaustive toy congruence cases pass. Every original key is retained in raw output; rank on black p0 only.

**High-order title (BE; normal historical BASE29 order):** known plaintext interval [Ylo,Yhi]=[title*R,(title+1)*R-1]. Decoder uses lattice (A*R,A*C-kQ) restricted to A box and z in [Ylo-(L-1),Yhi+(L-1)]; admissible B is intersection of signed bound and [Ylo-z,Yhi-z]. Encoder uses lattice coset (0,-C)+span_Z{(R,Ylo),(0,Q)} with z box ±(L-1)*R. Solve -z=A*x+B for x in [0,R-1], retaining every admissible integer x. Partition x interval (or P interval for decoder) by floor(x/L), giving all distinct high 722-digit plaintext classes. Low seven digits intentionally omitted from held score because B is underdetermined by high prefix. Each representative replays exactly; B ranges/progressions in raw result. The high decoder control has three tied fit classes; correct A and true B class are among them, deterministic first representative differs in one of 460 held high digits. Do not claim unique B recovery or perfect selected-continuation recovery for that case.

| Direction | End | Original keys/classes | Best fit | Held | Native plant |
|---|---|---:|---:|---:|---|
| Decoder | LE |111 keys|-3.449810|-3.480993| exact A,B;716/716 body |
| Encoder | LE |110 keys|-3.438759|-3.464112| exact A,B;716/716 body |
| Decoder | BE |**0 keys**|—|—| exact A; 3 tied B classes, true class retained;708/709 scored body |
| Encoder | BE |101 keys /26 classes|-3.423585|-3.495560| exact A; true B progression;709/709 scored body |

All nonempty original winners nonprose beyond the artificially supplied title, held below uniform. **Exact BE decoder exclusion** is conditional on crib, orientation and 7-digit bound; other three are exhaustive title compatibility enumerations followed by language ranking, not universal proof of non-English. No rescored heldout key selection.

Code: sims/lp2_p0_title_crib_affine_lattice_sft.cjs and sims/lp2_p0_title_crib_affine_high_lattice_sft.cjs. Raw: im-results/lp2-p0-title-crib-affine-{lattice,high-lattice}-output.json.

## Literal Möbius power: discrete-log recovery from 13 title digits

For T=[[272,151],[151,272]], g=423/121, conjugating by (x+1)/(x-1) yields multiplication by g. Under low-order title, g^e=((Ptitle+1)(Ctitle-1))/((Ptitle-1)(Ctitle+1)) mod29^13. The ratio is a unit; g has full order 28*29^12=9906813929753133148. Lift uniquely one exponent digit at a time (28 choices first, 29 thereafter). This recovers exact e residue, not arbitrary higher exponent digits. Centered representative e=3358634078540732270, far outside previous short bound; all 13 title runes decode by construction. Apply unchanged to full chapter: fit -3.512500, held -3.483744; no readable body. Two hidden ~10^17/10^18 signed exponent plants recover exact e and 716/716 body each. No exponent extension or phase search. Exact residue for the erroneous input vector, not the intended title; full-size exponents congruent mod group order remain open.

Code: sims/lp2_p0_title_crib_mobius_log_sft.cjs; raw im-results/lp2-p0-title-crib-mobius-log-output.json. All experiment functions executed directly in connected V8, standalone Node wrappers not run. No authentic new key or plaintext. No further variant search is justified by these runs; the separate canonical replay above addresses the specific input defect.

## All short projective matrices and exact minimum-size representative (LE)

Generalize the literal matrix to a secret primitive 2x2 integer matrix K=(a,b;c,d), determinant and c*C+d both units, P=(a*C+b)/(c*C+d) mod29^729. The same low-title congruence becomes a*C+b-P*c*C-P*d=0 mod M. Its rank-four integer lattice has basis rows (1,-C,0,0),(0,M,0,0),(0,P*C mod M,1,0),(0,P,0,1), determinant M. Exact rational Gram-Schmidt LLL reduces the basis; exact adjugate bounds enumerate **every** lattice coefficient whose associated matrix lies in the signed cube. No floating approximation or language pruning. Validate against 242 exhaustive small-modulus toy boxes.

Freeze all |a|,|b|,|c|,|d|<29^3 (12 coefficient digits versus 13 observed title digits). Original reduced-coordinate upper bounds [0,0,0,0]: the only lattice point is zero, so **no projective map exists** within this box, even before invertibility. Two native plants: one and three primitive candidate matrices; both exact hidden matrix and all 716 body runes recovered.

Rather than widen the box arbitrarily, use a valid basis-combination matrix as an upper bound and enumerate every shorter/equal primitive matrix, deriving the exact global minimum sup norm. Original unique primitive minimum, normalized first nonzero coefficient positive: [[19341,41227],[-8116,-15771]], max coefficient 41227. It decodes all 13 erroneous input-vector runes, exact forward replay, black-body fit -3.528926, held -3.467026, nonprose. This smallest-key criterion is exploratory, not independently selected. First control's actual matrix is minimum and all 716 body runes recover; second control has a strictly smaller *wrong* matrix (15073 vs actual19331) that fails held (16/467 correct, -3.516081). Thus minimum complexity alone does not authenticate a key, and its original failure is not a general larger-matrix exclusion.

Reproducers: sims/lp2_p0_title_crib_projective_lll_sft.cjs and sims/lp2_p0_title_crib_min_projective_sft.cjs. Raw outputs im-results/lp2-p0-title-crib-{projective-lll,min-projective}-output.json. Functions executed directly in connected V8. No authentic new key/plaintext.
