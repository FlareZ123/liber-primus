# Opening red-title conditional crib: exact integer-key recovery

Agent13 draw10, 27 November 2026. Independent mechanism from title as periodic key, 3x3 Hill, and previous title-excluded chapter affine tests. Conditional on the exact **EPIPHANY SEEKS** crib (signed 2016 wording, 8+5 runes; not authenticated as p0 plaintext), keep all 729 original opening-chapter runes. Cipher title [15,8,18,3,6,19,27,0,15,26,18,21,5]; crib [19,13,10,13,8,25,9,27,15,19,19,5,15], inherited from lp2-p0-red13-13dot-blackbody-original-source-adjudication.md. No alternate spelling or crib search. Rank on black p0 (249 runes), predict frozen p1–2. All controls are native donor plants, not evidence of original intent. No plaintext-F bypass.

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

For T=[[272,151],[151,272]], g=423/121, conjugating by (x+1)/(x-1) yields multiplication by g. Under low-order title, g^e=((Ptitle+1)(Ctitle-1))/((Ptitle-1)(Ctitle+1)) mod29^13. The ratio is a unit; g has full order 28*29^12=9906813929753133148. Lift uniquely one exponent digit at a time (28 choices first, 29 thereafter). This recovers exact e residue, not arbitrary higher exponent digits. Centered representative e=3358634078540732270, far outside previous short bound; all 13 title runes decode by construction. Apply unchanged to full chapter: fit -3.512500, held -3.483744; no readable body. Two hidden ~10^17/10^18 signed exponent plants recover exact e and 716/716 body each. No exponent extension or phase search. Exact title residue but unverified plaintext; full-size exponents congruent mod group order remain open.

Code: sims/lp2_p0_title_crib_mobius_log_sft.cjs; raw im-results/lp2-p0-title-crib-mobius-log-output.json. All experiment functions executed directly in connected V8, standalone Node wrappers not run. No authentic new key or plaintext. Do not retest this crib/receiver without genuinely independent source input.
