# Terminal 256-rune / 32×8 table circumference coincidence and direct-codec gate

**Classification:** exact original-source count concordance, with conditional original-input exclusions. This is **not** recovered ciphertext, a decoded original LP2 word, or evidence that the historical maker intended this geometric layout.

## Source-visible reason to examine the split

The independently solved LP2 physical page 57, `PARABLE`, includes the instruction-like words **“WE MUST SHED OUR OWN CIRCUMFERENCES”** followed by **“FIND THE DIVINITY WITHIN AND EMERGE”**. The physical LP2 pp49–51 numerical table has exactly **32 rows and 8 columns**, i.e. **256 entries**. Removing its one-cell rectangular circumference without rearranging source tokens gives:

- Perimeter `2(32)+2(8)−4 = 76` cells.
- Interior `(32−2)(8−2) = 30×6 = 180` cells.
- Whole table `76+180=256` cells.

The manuscript's **final three physical pages** independently have the exact rune counts **p55=76, p56=85, p57=95**, hence `76 + (85+95) = 256`. Thus the page-55 unknown ciphertext length exactly equals the table's perimeter, and the two already-solved final pages together have exactly the table's interior length. This is a *precise possible known-plaintext framing*: the 180 solved rune positions could in principle constrain an operation applied to the remaining 76 unknown rune positions. The arithmetic alone does not select any byte/rune codec, key, orientation, or cipher.

Source inputs and exact parser: `resources/liber-primus/base60-grid.json` (the byte interpretation of the printed tokens remains conditional), `resources/liber-primus/lp2-corpus.json` (physical-page indices), and the published p56 solved-plaintext regression in `sims/authentic_lp2_p56_totient_regression.cjs`. Physical p57 is already printed in plaintext, while p56 is encrypted using a separately established prime-totient shift.

## Complete two-dimensional secret-key recovery test (Agent 11, 15 November 2026)

The 32×8 original printed cell rectangle has **76 perimeter slots**, while its 30×6 interior has **180 slots**, exactly matching the original 76 still-unknown p55 runes and the **85 independently solved p56 + 95 clear p57** runes. A natural potentially useful key mechanism is a **two-dimensional row-and-column additive mask**. If the original cell at row r, column c holds its aligned terminal plaintext rune P plus an unknown row contribution A[r] and unknown column contribution B[c] modulo29, then the residual K=T−P has **zero alternating sum in every adjacent 2×2 interior square**, irrespective of all 30 row secrets and 6 column secrets. This includes every global affine key plane K=a·r+b·c+d and requires no guessed key, language scoring or withheld p55 plaintext.

Taking the original source 256 bytes modulo29 without rearranging cells, aligning the **180 original interior printed row-major slots** with authentic p56 solved plaintext plus p57 clear text, yields **142 nonzero 2×2 minors out of 145**. The very first interior square has K values **[22,2;18,13]**, producing **22−2−18+13=15 mod29**, already an exact contradiction to *every* stationary hidden row-plus-column key. The independently source-visible alternative using **printed p56 ciphertext** instead of solved p56 plaintext yields **136/145 nonzero minors**; its first minor is **14**. A 3-parameter affine plane learned from the first three known plaintext slots agrees with only **12/180** or **10/180** complete original interior positions respectively. Hence this attractive geometric mechanism cannot recover p55 from the source table.

Two complete positive controls demonstrate recovery power. An arbitrary nonlinear but separable secret row/column pad covering the same 180 known slots yields **zero/145** nonzero minors. In a stronger 256-cell synthetic table, the exact 180 authentic p56/p57 runes are interior known plaintext, the 76 original-shaped p55 runes are planted as *unknown synthetic perimeter plaintext*, and an actual secret three-parameter affine GP29 pad covers all slots. Three interior anchors uniquely recover the secret parameters, correctly predict **180/180** authentic known runes, and independently restore **76/76** perimeter runes. The source-original values fail before this inversion.

This is a **bounded necessary-condition rejection** of row-plus-column additive masks under the source's exact base60 register and original 30×6 interior alignment. An unconstrained outer-row/outer-column secret would also leave border parameters unidentifiable from interior symbols, so it would not itself provide a complete p55 decoder. Other source-indicated reversible two-dimensional maps remain possible; **no unknown LP2 plaintext, key or destination recovered**. [Single-file Node22 CommonJS original-source SFT](../sims/lp2_terminal_grid_separable_mask_sft.cjs). [Passing original-input Windows Node22 Actions run 43694872512](https://github.com/FlareZ123/liber-primus/actions/runs/43694872512).

## Short linear-recursion recovery from known terminal interiors (Agent 4, 15 November 2026)

A source-shaped alternative to the row-and-column mask above is a **secret GF(29) linear-recurrence keystream** over the printed 256-byte table. The original p57 instruction-like language about shedding circumferences and the exact **76 perimeter / 180 known interior** correspondence motivate testing a potential outward recovery from p56+p57, but **no authentic Cicada instruction selects an LFSR or any byte-to-rune additive rule**.

Freeze the original radix60 byte interpretation `B` from `resources/liber-primus/lp2-grid-256.json` (raw256 SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`). Take the 85 authenticated GP29 plaintext runes of p56, independently verified with the genuine prime-totient/nonconsuming-F encoder, followed by the 95 literal cleartext runes of p57. To account for the physical-versus-decoded source ambiguity, also test p56's **printed** 85 GP29 cipher runes followed by the same p57 cleartext. Two simple geometry-frozen assignments of these 180 source positions into the 32×8 table are admitted: printed **row-major 30×6 interior**, and a **top-left-start clockwise spiral** beginning with all 76 outer perimeter slots, then passing through all 180 interior slots. The eight possible residual streams are `K[i]=(B[slot[i]] ± P[i]) mod29`; there is no optimized offset, permutation, IV, modulus, fitted plaintext, or invented table entry.

Fit each model's **first 120 known rune residues** using exact Berlekamp–Massey over GF29. Predict the **last 60 previously withheld known residues** without retraining, before any unknown p55 rune is used. A true short linear recurrence with nonzero final coefficient would additionally permit unique backward reconstruction of the 76 unobserved perimeter keystream positions.

| Original interior ordering | p56 register | Sign `−` (fit degree, 60 heldout matches, 180-sample degree) | Sign `+` (same) |
| --- | --- | --- | --- |
| Clockwise spiral | Solved p56 | **60, 2/60, 90** | **60, 3/60, 90** |
| Clockwise spiral | Printed p56 | **60, 2/60, 90** | **60, 1/60, 90** |
| Row-major interior | Solved p56 | **60, 1/60, 90** | **60, 5/60, 90** |
| Row-major interior | Printed p56 | **60, 3/60, 91** | **60, 0/60, 90** |

All eight real data models require the full **degree 60** capacity to interpolate the first 120 points, with **0–5/60** correct genuine heldout predictions; the 180-term minimal orders are **90–91**. Those orders and matches are characteristic of no **short** GF29 linear recurrence under these exact fixed maps. The table-to-terminal key reconstruction fails **before** using any unknown p55 glyph. Full rank alone does not establish cryptographic randomness and there is no inference against nonlinear operations, an unrelated table codec, other source-selected traversal rules, state resets, or a hidden external key.

**Constructive source-native positive:** the same executable plants a real degree-seven invertible GF29 recurrence across 256 table positions, enciphers the original-shaped 76 p55-rune tape as withheld perimeter data and independently authenticated 180 p56+p57 plain runes as the known interior, then recovers the planted degree **7**, predicts the last **60/60** known symbols, extrapolates uniquely backward and restores **76/76** withheld p55-pattern symbols. The real table itself remains untouched and produced no credible unknown plaintext, original key or destination. [Single-file Node22 CommonJS SFT](../sims/lp2_terminal_ring_linear_predictor_sft.cjs) · [Passing original-source manual Actions run 43737798756](https://github.com/FlareZ123/liber-primus/actions/runs/43737798756).

## Known-180 binary-generator identifiability (Agent36, 15 November 2026)

This is a **distinct exact-known-plaintext state-recovery gate** from the prior GF29 degree-60 Berlekamp–Massey and two-dimensional additive-mask tests above. Keep the same unmodified 32×8 source table, the 180 interior slots in physical row-major order and the established 85 solved-p56 plus 95 clear-p57 GP29 values. Direct byte masks using each rune's GP ordinal, prime weight or prime totient under XOR, addition or subtraction modulo256 give **nine** candidate byte residuals. Reading each MSB-first or LSB-first gives **18** possible binary key tapes. A single common binary LFSR of order at most46, even reinitialized with an arbitrary independent state on each of the 30 interior six-byte rows, necessarily obeys one order46 homogeneous recurrence across their **60** two-per-row binary equations. Exact GF2 elimination finds contradictory equations in **all 18** cases (first at equation indices42–50). Thus there is no such masked original 180/76 shared binary-linear low-order transport under these precise source registrations; this is an algebraic exclusion rather than an English score.

The independent planted 32-stage stream is genuinely recovered from the first 180 known runes: all32 feedback taps, all256 mask bytes and all76 synthetic hidden-border runes. Source exact inputs, full native positive and the per-case rejection matrix are in [the bounded source report](../im-results/lp2-terminal256-known180-lfsr-gate.md) and [CJS SFT](../sims/lp2_terminal256_known180_lfsr_sft.cjs), [Windows Node22 CI success](https://github.com/FlareZ123/liber-primus/actions/runs/43772269709). No real p55 plaintext is recovered, and the 76/180 geometry remains a proposed clue rather than an author-selected cipher.

## Source-frozen first gates

[Reproducer](../sims/lp2_terminal_grid_border_ring_sft.cjs) starts from the original 32×8 token positions and tests direct, lossless plaintext/byte interpretations without language-based parameter selection. The source and all assertions passed in [manual GitHub Actions run 42939635633](https://github.com/FlareZ123/liber-primus/actions/runs/42939635633), using Node.js 22.

**Border → p55, direct unknown byte lookup:** traverse the 76-cell perimeter from each of the four corners, clockwise or counterclockwise. Under each of these eight geometric orientations, the same 8 duplicate-byte occurrences must produce the same visible ciphertext rune if a *single fixed unknown byte-to-GP lookup* describes the p55 ciphertext. They do not: **at least 5 out of 8** duplicate-byte occurrences demand contradictory rune outputs in each orientation (the eight orientations have 0–3 consistent repeats). Thus *all eight direct substitution layouts* are mathematically impossible, regardless of the secret lookup table. This does **not** exclude a grid-derived additive pad or any stateful, position-dependent encoder.

**Interior → solved p56+p57, row-major:** the 30×6 interior yields **180 bytes, 127 distinct values, 53 repeated values**. The natural fixed row-major alignment to the solved 85+95 rune positions contradicts every single fixed unknown byte→rune lookup for:

| Proposed 180-rune output | Contradictions among 53 repeated bytes |
| --- | ---: |
| Published solved plaintext (p56 decoded; p57 clear) | 47 |
| Visible solved-page runes (p56 ciphertext; p57 clear) | 51 |
| Required GP29 additive shifts from plaintext to visible runes | 43 |

If the lookup depends only on a byte's **value modulo29**, the additive-shift interpretation conflicts at **140 of 151 repeated residues**. The most literal additive-key reading, `byte mod29` in the same row-major order, matches only **6 of 180** required shifts (uniform expectation **180/29 ≈ 6.21**). This first natural key reading is indistinguishable from chance. It is a *bounded negative* for this exact framing, not for the historical table in any other role.

The p56 known-plaintext input is the independently published `AN END…` passage with GP spellings `EUERY` and `SEEC`. For p57 the original 95 printed rune indices are themselves the solved cleartext. No missing English letters are inserted before rune alignment.

## Source-locked polynomial and code interpretations

The p3 and p39 uniquely marked red three-rune spans independently select the degree-four factor already demonstrated in [the GF(29²) triad analysis](red-triad-gf841-840-phase-gate.md):

`g(X)=(X-24)^2(X^2+18X+11)=X^4+28X^3+13X^2+9X+14` over GF29.

The first triad alone determines the quadratic via `u²=3u+8`, `z=23-2u`, trace and norm both 11. The second triad determines the double factor `15(X-24)²`. Treat the actual row-major base60 grid bytes as 256 descending coefficients modulo29. Division by g leaves remainder `[0,0,0,0]`. Equivalently, treating the first 252 byte residues as data and reserving four check symbols, their *uniquely required* terminal four residues are `[6,7,15,22]`. The original final four printed bytes `[180,36,189,80]` have exactly those residues. This is an **equivalent representation of the established quartic factor**, rather than four new statistically independent confirmations. It offers an explicit, economical checksum/check-polynomial reading, without evidence that the author intended a systematic CRC.

This algebra makes a narrow historical numeral-reading discriminator. Under the alternate documented radix59 alphabet (which omits `f`), the same original printed tokens have quartic remainder **[7,1,19,8]**. The low-digit-only and high-digit-only readings have respective remainders `[28,3,6,15]` and `[8,27,13,22]`. Only original forward row-major base60 satisfies this factor among these four interpretations; earlier marked-critical-point work reached a compatible radix-specific conclusion through independent polynomial derivatives. [Reproducer](../sims/terminal_quartic_word19_crc_sft.cjs), [manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42944758586).

The 225 red runes and 31 thirteen-dot marks constitute a second chronological 256-event source stream. To test a direct codeword connection using the already fixed factor g, the same SFT checks the four source-natural red encodings (GP index, one-based index, GP prime, prime totient) with mark values 0/2/13/28 in both stream directions. **None of these 32 exact encodings** is divisible by g. Chronological GP index with marker13 gives `[2,19,22,0]`. The 19 body words of the already clear p57 *PARABLE* passage also supply a tempting `19×4=76` frame matching unknown p55. A fixed source proposal that maps each body's prime sum mod29 to the four coefficients of g predicts only **2/76** actual p55 glyphs. Neither route delivers plaintext, and no general event-stream operation is excluded.

The source's `u²=3u+8` defines a primitive element of **GF(29²)** of order840, making a direct Reed–Solomon interpretation of the **180 interior known positions + 76 boundary withheld positions** mathematically executable. Freeze the 256 evaluation points as `u^i` in original printed row-major position order, and interpolate the unique degree<180 polynomial from the 180 interior positions. The original grid byte embedding `byte=a+29b ↦ a+bu` predicts **0/76** actual boundary values. More decisively, use the independently authenticated p56 85-rune plaintext plus p57's 95 printed plaintext runes as the 180 known GF29-subfield evaluations. Of 76 boundary predictions, **only five** even lie in the 29-rune subfield; **zero** equal the original p55 ciphertext glyph values. The 71 predicted non-subfield values prohibit a 76-rune GP plaintext continuation under this exact RS model, regardless of an unknown GP29 enciphering operation on p55. An unrelated degree-7 planted polynomial recovers all **76/76** withheld values, confirming the field/interpolation machinery. [Self-contained source and positive-control SFT](../sims/terminal_76_180_rs_field841_sft.cjs), [successful manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42943929703). This falsifies **the specified field embedding, natural source position assignment, and degree bound**; it does not rule out unknown coordinate permutations, alternative code families or other output registers.

The same original p56/p57 known plaintext and quartic-selected block width4 provide an exact **all-secret affine Hill obstruction** for a common stationary GF29 4×4 transform from p56/p57 plaintext to row-major interior table residues. The first five four-rune plaintext blocks form a full-rank 5×5 augmented affine design (determinant10 mod29). The sixth source plaintext block is their unique affine combination with coefficients `[27,18,17,7,19]`. Thus **every** possible secret 4×4 Hill matrix and translation must predict the sixth interior byte-residue block **[20,22,3,4]**; original residues are **[10,25,22,17]**. The identical linear dependence test on original p56/p57 visible glyphs predicts **[9,9,6,26]** rather than actual **[3,24,13,19]**; for required known shifts, prediction is **[20,5,17,8]** rather than **[14,20,24,1]**. Every output coordinate contradicts the model. A synthetic secret affine transform passes the same dependence equality. This six-block, unknown-key-independent certificate is also reproduced by the [source SFT](../sims/terminal_quartic_word19_crc_sft.cjs) and [successful CI](https://github.com/FlareZ123/liber-primus/actions/runs/42944758586).

Finally, a standard **full-field-evaluation GF256 RS(256,180)** codeword cannot be the direct printed grid byte sequence under any permutation of its 256 evaluation points: the XOR of all 256 evaluations of a degree<180 polynomial over GF256 must vanish, whereas original radix60 table bytes XOR to **148** (radix59 bytes XOR to **33**). The argument assumes all 256 finite field elements are evaluated and does not cover codes with an added evaluation at infinity or a nonlinear byte mapping.

### Reverse GF841 [256,76]: 76 unknown data, 180 known checks (Agent17, 13 November 2026)

The existing GF841 [256,180] candidate assumes the p55 outer **76** are parity while the solved p56+p57 inner **180** are data. The reverse [256,76] candidate is a distinct **direct original-cipher recovery attempt**: treat unknown p55 as the message and the 180 solved runes as overdetermining parity. The same pre-existing p3 field u²=3u+8, source-derived g=19+13u and natural ring positions x[j]=g^j fix all points. A degree-less-than-76 polynomial is uniquely determined by **76 of the 180 known** parity symbols. Its predictions at the **remaining 104 known** positions are independent checks, and its first 76 positions would recover p55. The manuscript does not authenticate a Reed–Solomon construction, so this is a finite conditional model.

| p56 input register, p57 clear in both | Held-out parity symbol matches | First discrepant value at codeword slot152 | Candidate unknown p55 elements inside GP29 | Candidate unknown values equal visible p55 |
| --- | ---: | --- | ---: | ---: |
| Independently solved p56 plaintext | **0/104** | predicted **24+22u**, actual **1** | 1/76 | 0/76 |
| Original visible p56 ciphertext | **0/104** | predicted **25+5u**, actual **6** | 6/76 | 0/76 |

The **77th known parity value alone falsifies** each same-register [256,76] model; all remaining 103 checks fail too. A separately planted genuine degree-75 polynomial is exactly recovered at **256/256** positions after withholding all 76 data evaluations. Thus the result rules out this reverse RS code, rather than treating any arbitrary interpolated gibberish as plaintext. This complements the prior [256,180] test; no unknown LP2 plaintext or authentic key was obtained. [Source-input CJS reproducer](../sims/lp2_terminal256_rs76_data180_check_sft.cjs).


### Bytewise table-XOR masking and standard GF256 [256,76] reconstruction (Agent17, 13 November 2026)

A separate, direct source-byte consumer uses **all 256 distinct cell locations of the original 32×8 table** rather than identifying its numbers with runic GP residues. The original 2013 Cicada audio stage demonstrated **bytewise XOR** of two published byte streams; a plausible but unprescribed analogy is to XOR each terminal rune's GP index (0–28 as a byte) with the corresponding **printed table byte**, then treat the 256 resulting masked bytes as a standard GF256 **[256,76] extended Reed–Solomon** codeword. The outer 76 p55 runes are unknown message data; the inner 180 pp56–57 runes are known parity. Source-ring traversal supplies a complete 256-position bijection. The decoder fits a degree-less-than-76 polynomial to the first76 known parity bytes and predicts the remaining104 independently known positions, then unmasks the withheld p55 bytes.

To keep historical implementation variants limited, the test fixes XOR and two standard field polynomials (**0x11d**, common RS, and **0x11b**, AES); two source-native field-point orders (clockwise **ring index** 0–255 versus **original table-cell index** 0–255); and the two p56 registers (independently solved plaintext versus original printed ciphertext). That is **eight** declared complete inversions. No grid key, offset, IV, language score or hidden symbol permutation is fitted.

| Field / point order | p56 register | Independent parity matches (of 104) | Recovered p55 byte values below 29 | Exact recovered byte matches with original p55 |
| --- | --- | ---: | ---: | ---: |
| 0x11d / ring | solved | 0 | 7/76 | 0 |
| 0x11d / ring | visible | 0 | 6/76 | 0 |
| 0x11d / cell | solved | 1 | 7/76 | 0 |
| 0x11d / cell | visible | 1 | 5/76 | 1 |
| 0x11b / ring | solved | 1 | 10/76 | 0 |
| 0x11b / ring | visible | 0 | 11/76 | 0 |
| 0x11b / cell | solved | 0 | 9/76 | 0 |
| 0x11b / cell | visible | 0 | 9/76 | 0 |

All eight variants fail the **first held-out known parity position**, and at most one of 104 independent parity checks matches. No recovered candidate is natively GP29 plaintext; the stronger source-correct byte-XOR operation remains hypothetical. A real degree-75 polynomial planted using each tested GF256 field and each point order is recovered **256/256** from only the 76 parity inputs under the same code. This establishes that the decoder is executable, while the original cryptographic hypothesis fails sharply.

[Standalone original-input and planted CJS SFT](../sims/lp2_terminal256_xor_rs76_sft.cjs) reuses the existing checked-in GF256/RS library and source byte SHA256 assertion. It tests an independent *byte-mask* inverse rather than another literal GP29 representation of the grid. No genuine p55 plaintext, key or destination is recovered.

## Source-red quartic LFSR: exact elimination of every additive seed

The two original red triads already determine the monic GF(29) factor
`g(X)=X^4+28X^3+13X^2+9X+14` of the 256-symbol grid polynomial.
A distinct original-cipher interpretation would use this **quartic as the
characteristic polynomial of an additive GP29 key stream**, with any secret
four-symbol initial register, and potentially a new initial state at each
page or printed word. This model has a key-independent exact invariant:
for `C_i=P_i+K_i (mod 29)`, when
`K_(i+4)+28K_(i+3)+13K_(i+2)+9K_(i+1)+14K_i=0`,
we necessarily have

```text
C_(i+4)+28 C_(i+3)+13 C_(i+2)+9 C_(i+1)+14 C_i
= P_(i+4)+28 P_(i+3)+13 P_(i+2)+9 P_(i+1)+14 P_i  (mod 29).
```

Every possible initial state cancels exactly; the reverse coefficient
orientation has the analogous identity. Testing only length-five or longer
windows **entirely inside each printed rune word** avoids assuming one
continuous book key or a particular word-start phase. It does assume the
key recurrence stays uninterrupted within each tested five-rune window.
The present measurement does not exclude an independent reset in the
middle of a printed word, such as at a physical page boundary or stencil.

The reproducible [all-secret original-input SFT](../sims/red_triad_quartic_annihilator_sft.cjs)
uses the exact word parser (2,896 original words); the 1,132 words of
length at least five yield **3,237** original key-canceled rune outputs.
It independently trains each expected 29-bin filter-output distribution
on even-position source words from GP-normalized Shakespeare English or
the native GP Vulgate Latin. For every register and orientation it then
draws 500 word-length-matched synthetic controls, with replacement, from
the other half of the respective source. These tests compare the original
chi-square to a genuinely *held-out* native-word null. The controls are
conditional on these two specific GP orthographies and finite corpora.

| Expected plaintext register | Polynomial direction | Original chi-square | Median / maximum of 500 matched native controls | Controls at least as discrepant |
| --- | --- | ---: | ---: | ---: |
| Shakespeare English | Forward | **198.425** | 35.376 / 72.583 | **0/500** |
| Shakespeare English | Reverse | **118.616** | 34.739 / 68.337 | **0/500** |
| Vulgate Latin | Forward | **95.957** | 36.332 / 80.823 | **0/500** |
| Vulgate Latin | Reverse | **69.103** | 36.486 / 79.251 | **2/500** |

The add-one empirical upper tails are **1/501**, **1/501**,
**1/501**, and **3/501**, respectively. **Reset-safe original control.** The source parser also identifies 32
printed words continuing over a physical page edge. Removing them leaves
**1,108** complete, page-contained words of length at least five, with
**3,152** genuine original windows. The same SFT maps all **28** original
thirteen-dot mark events on physical pp0–55 (26 distinct global positions)
and confirms that **no one of these 3,152 windows crosses a mark**.
Consequently neither a page-boundary reset nor a thirteen-dot reset can
invalidate this exact test cohort.

| Native reference | Filter orientation | Original χ² on page/mark-safe windows | Maximum of 500 length-matched native controls | Controls at least as discrepant |
| --- | --- | ---: | ---: | ---: |
| Shakespeare English | Forward | 190.752 | 76.862 | 0/500 |
| Shakespeare English | Reverse | 121.076 | 63.264 | 0/500 |
| Vulgate Latin | Forward | 94.946 | 72.485 | 0/500 |
| Vulgate Latin | Reverse | 65.953 | 76.005 | 4/500 |

The corresponding empirical upper tails are 1/501, 1/501, 1/501,
and 5/501. The last Latin/reverse score is the least decisive of the
four. Both cohort analyses passed
[manual CI 42949024650](https://github.com/FlareZ123/liber-primus/actions/runs/42949024650).
This added control **does not** exclude a private step/skip within an
unmarked printed word or a language register outside the two tested corpora.

The SFT also generates
independent unknown random four-rune initial states for 100 separate
English and 100 Latin native words under each polynomial orientation,
then verifies the *identical* annihilated plaintext and ciphertext
outputs on all tested word-local windows. The encrypted examples
change 636–673 of their original 664–701 rune symbols, proving that
the invariant is not merely a zero-key identity.

[Successful dedicated manual CI 42948037973](https://github.com/FlareZ123/liber-primus/actions/runs/42948037973)
ran on Node 22 and checked the original result and four positive
controls. The conditional English and Latin GP29 additive quartic
LFSR-key families are strongly disfavored regardless of all secret
initial states. **No particular decryption or original key has been
identified.** The gate does not cover ciphertext/plaintext feedback,
nonadditive field operations, a different plaintext register, a
different characteristic polynomial, source-independent state
interruptions inside words, or arbitrary encrypted byte sequences.

## All-secret eight-column cyclic map: the 180 native plaintext controls reject the whole family

One further *source-geometry* model is operationally relevant to the 76/180 split. The table's **eight printed columns** and the solved p57 instruction to shed a **circumference** suggest using each complete eight-byte table row as a cyclic register. Hypothesize that one fixed unknown eight-tap key `w[0..7]` and one unknown offset `b` map each original table row to eight GP29 output symbols by

```text
output[row,col] = b + Σ(k=0..7) w[k] × (tableByte[row,(col+k) mod 8] mod 29)  (mod 29).
```

This is a *testable new model*, not a demonstrated original instruction. It uses all nine potential secret coefficients, so no source-unselected key is guessed. Align the 30×6 inner table cells in printed order to the **180 already established p56+p57 runes**, leaving the 76-cell border as a withheld target. Consider three independently specified output registers: authenticated solved plaintext (p56 recovered by its established totient inverse, p57 already clear), visible ciphertext (original p56, printed p57), and the required GP29 shift difference between them. Test both the canonical base60 table bytes and the exact f-omitting base59 alternative. For each of six source/input-register combinations, solve all 180 linear equations in the nine unknowns by exact Gaussian elimination over F29, with a 180/180 synthetic cyclic-encoder positive control.

| Table interpretation | Solved output register | System rank | Inconsistent reduced rows / 180 | Best representative key matches / 180 |
|---|---|---:|---:|---:|
| radix60 | plaintext | 9 | **168** | 12 |
| radix60 | visible ciphertext | 9 | **165** | 15 |
| radix60 | known additive shift | 9 | **165** | 15 |
| radix59 | plaintext | 9 | **163** | 17 |
| radix59 | visible ciphertext | 9 | **164** | 16 |
| radix59 | known additive shift | 9 | **166** | 14 |

Every system has full possible coefficient rank nine and an inconsistent augmented system: *no eight-tap key or additive intercept exists* under any of these six source-locked scenarios. The representative-match counts are sanity diagnostics rather than optimizers. The exact proof is the inconsistent rank (equivalently nonzero row `[0,0,0,0,0,0,0,0,0|value]`). A planted full-length source-aligned cyclic encoder is recovered with **180/180** consistency. Reproducer: [single-file Node 22 test](../sims/terminal_grid8_circulant_knownplain_sft.cjs), independently executed with all six original inputs and the **180/180 planted control** by [successful GitHub Actions CI run 42982303758](https://github.com/FlareZ123/liber-primus/actions/runs/42982303758).

**Decision:** The 2016 FOLD clue and terminal circumference counts do not rescue the specific 8-column *stationary linear cyclic table-to-GP29* model, even with arbitrary hidden coefficients and either numeral interpretation. This is distinct from the earlier fixed four-rune Hill-block exclusion and fixed byte lookup: it works on actual source rows of width eight and grants nine wholly unknown secret coefficients. It leaves unknown nonlinear/stateful registers, row-dependent transformations, non-GP intermediate symbols, and an independently source-selected cipher operation open. No p55 plaintext is inferred.


## Terminal 256-rune quartic-codeword and one-error gate (Agent 19, 11 November 2026)

The table's historically selected H/G factors define an exact GF29 **[256,252,3]** linear code, and the final physical pages have **76+85+95=256** rune positions. If the terminal runes are another codeword in the **same source polynomial**, the independently fixed four-residue syndrome must be zero. Even if a single printed rune is erroneous, that code's distance three permits correction of precisely one erroneous GP29 symbol; there are **7,168 distinct nonzero one-error syndromes** among the possible 256 positions and 28 nonzero error magnitudes.

Test precisely four source-natural placements without tuning by the outcome: concatenate original p55+p56+p57 runes in physical reading order, or fill the **32×8 table's 76-cell clockwise outer border from its upper-left corner with p55** and its **30×6 interior row-major with p56+p57**. Each placement uses either the visibly printed p56 ciphertext or its independently established exact p56 plaintext; p57 is already clear. Use the independently sourced ascending-power quartic \(H_{2013}G_{p39}=23+21X+11X^2+17X^3+12X^4\) as a divisor of the descending-power 256-cell rune polynomial. The **unaltered original table itself returns [0,0,0,0]**, providing an original-source positive codeword control.

| Terminal encoding fixed before the test | Original four-residue syndrome, ascending power | Exact 1-rune correction? |
| --- | --- | --- |
| Consecutive p55 + printed p56 + p57 | **[2,16,22,3]** | No |
| Consecutive p55 + solved p56 + p57 | **[17,12,10,6]** | No |
| p55 perimeter + printed p56/p57 interior | **[28,15,15,10]** | No |
| p55 perimeter + solved p56/p57 interior | **[4,16,17,15]** | No |

All four original-input syndromes are nonzero and absent from the full one-error lookup dictionary, so **none is a codeword even after one GP29 symbol correction**. This negative is exact under each named layout, original visible register and divisor; it does not depend on an English score, key search or shuffling. A positive source-GF29 codeword plant that changes one symbol at position 55 by +7 is uniquely decoded back to the original table. The [self-contained CommonJS SFT](../sims/lp2_terminal_hg_codeword_single_error_sft.cjs) asserts these four original outcomes, every one-error syndrome's uniqueness and the planted correction.

**Consequence:** the terminal length coincidence cannot by itself authorize applying the **same quartic code directly to original visible p55+p56+p57 runes**, or explaining their apparent nondivisibility by one transcription error. A different plaintext/code register, non-linear encipherment, orientation or source-predicted transformation remains possible, but none is selected by this test. No p55 plaintext or other unknown LP2 text was recovered. Avoid treating the 256-count identity as a cryptographic decoding rule without a step that predicts original input.

## Exact 19-fold quartic terminal erasure recovery (Agent 19, 11 November 2026)

**Classification: an executable original-input decryption candidate with negative ciphertext predictions, not a recovered plaintext.** The known p57 PARABLE has **19 body words**. The historically sourced 2013 BASE29 polynomial and original p39 red-triad polynomial have product \(F(X)=23+21X+11X^2+17X^3+12X^4\), degree four. Therefore \(F(X)^{19}\) has degree **76**, matching the **76 unknown GP29 runes of p55**. The other **180 of 256** terminal positions are the 85 previously solved p56 runes and 95 printed clear p57 runes. This suggests an explicit hypothetical [256,180] linear code over GF29 with 76 recoverable parity positions. No historical source instructs exponentiation by 19; that is the weakest step.

We tested exact erasure completion, using the 180 independently known original symbols to *predict* all 76 unknown p55 glyphs without fitting the latter. **First**, place p55 before p56+p57 as the 76 high-degree coefficients of a 256-coefficient polynomial: its remaining 180 known low-degree coefficients determine the unique \(F^{19}\)-divisible codeword, because its constant term is 25, a unit modulo29. **Second**, map p55 clockwise around the table's **76-cell perimeter starting upper-left** and map the known 180 runes into its **30×6 interior row-major**. The resulting 76×76 GF29 erasure syndrome matrix is full rank, so elimination predicts a unique p55 for this layout as well.

| Frozen p56 input | Predicted p55 / original exact matches: linear | Predicted p55 / original exact matches: geometric |
| --- | ---: | ---: |
| 85 independently solved p56 plaintext runes, plus original clear p57 | **2/76** | **3/76** |
| 85 visible p56 ciphertext runes, plus original clear p57 | **5/76** | **5/76** |

The benchmark for unrelated equiprobable GP29 runes is 76/29 ≈ 2.62 matches. All four computed predictions are **exact mathematical codewords** under \(F^{19}\), but none is the original p55 ciphertext or legible new GP plaintext. This is a bounded rejection of **direct same-register [256,180] F19 coding** in these two natural source geometries, not a rejection of a separate output alphabet or unknown outer cipher.

**Positive plant and complete source reproduction:** [the standalone CommonJS SFT](../sims/lp2_terminal_f19_erasure_recovery_sft.cjs) takes a separate nontrivial source-derived 180-coefficient seed, multiplies it by \(F^{19}\), deletes its 76 prefix or 76 perimeter values, and recovers the **exact 76/76 planted unknown coefficients** under both layouts. It also derives the historical factors from source constants, checks the terminal lengths, reconstructs all four real candidate codewords and asserts every original match count.

**Decision:** the especially clue-constrained 19×4=76 erasure-decoding architecture is now decisively constrained on original ciphertext. To continue toward p55, a primary clue must specify what transforms a codeword into visible GP runes or select another independent algebraic mechanism. Blind changes in ring orientation or extra polynomial powers are unjustified.

## Consequence for subsequent research

The strongest contribution here is a **geometrically prescribed 76/180 source split that matches the last three pages exactly**, alongside early eliminations that prevent a futile search for a fixed table-byte substitution key. The theme of removing a circumference supplies a plausible human solve-path *hypothesis*, but the instructions were recognized after examining existing materials, so the count match is not independent confirmation of an authentic cipher.

Earlier [circumference-corner key experiments](../sims/circumference_corner_key_inverse.cjs) already explored AES/ChaCha streams derived from concentric grid corners; this new 76/180 terminal-page framing is a different source claim and does not revive those failed direct key families.

The verified count concordance and quartic divisibility make an exact source-defined framing worth pursuing, but the direct codeword, both data/parity orientations of the fixed full-field Reed–Solomon model, four-block all-secret affine Hill, simple ink/word transformations, and every additive GP29 quartic LFSR seed under the tested language registers above have failed. The next decision-grade test requires an **additional original clue** fixing a nontrivial operation connecting table cell values to GP runes or state before p55 is used to select the rule. A proposed chain must explain why the 180 solved rune positions fit it and then predict the untouched 76 original p55 ciphertext runes or meaningful plaintext, with exact re-encryption and wrong-key controls. Without that independent operation, arbitrary border/interior transposition or pad searches would be postselected and low-value.

No unknown plaintext, authentic key, or final Cicada destination was recovered. The authoritative solved-status statement in `results/README.md` remains unchanged.
