# Terminal 256-rune / 32×8 table circumference coincidence and direct-codec gate

**Classification:** exact original-source count concordance, with conditional original-input exclusions. This is **not** recovered ciphertext, a decoded original LP2 word, or evidence that the historical maker intended this geometric layout.

## Source-visible reason to examine the split

The independently solved LP2 physical page 57, `PARABLE`, includes the instruction-like words **“WE MUST SHED OUR OWN CIRCUMFERENCES”** followed by **“FIND THE DIVINITY WITHIN AND EMERGE”**. The physical LP2 pp49–51 numerical table has exactly **32 rows and 8 columns**, i.e. **256 entries**. Removing its one-cell rectangular circumference without rearranging source tokens gives:

- Perimeter `2(32)+2(8)−4 = 76` cells.
- Interior `(32−2)(8−2) = 30×6 = 180` cells.
- Whole table `76+180=256` cells.

The manuscript's **final three physical pages** independently have the exact rune counts **p55=76, p56=85, p57=95**, hence `76 + (85+95) = 256`. Thus the page-55 unknown ciphertext length exactly equals the table's perimeter, and the two already-solved final pages together have exactly the table's interior length. This is a *precise, previously unexploited possible known-plaintext framing*: the 180 solved rune positions could in principle constrain an operation applied to the remaining 76 unknown rune positions. The arithmetic alone does not select any byte/rune codec, key, orientation, or cipher.

Source inputs and exact parser: `resources/liber-primus/base60-grid.json` (the byte interpretation of the printed tokens remains conditional), `resources/liber-primus/lp2-corpus.json` (physical-page indices), and the published p56 solved-plaintext regression in `sims/authentic_lp2_p56_totient_regression.cjs`. Physical p57 is already printed in plaintext, while p56 is encrypted using a separately established prime-totient shift.

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
**1/501**, and **3/501**, respectively. The SFT also generates
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

## Consequence for subsequent research

The strongest contribution here is a **geometrically prescribed 76/180 source split that matches the last three pages exactly**, alongside early eliminations that prevent a futile search for a fixed table-byte substitution key. The theme of removing a circumference supplies a plausible human solve-path *hypothesis*, but the instructions were recognized after examining existing materials, so the count match is not independent confirmation of an authentic cipher.

Earlier [circumference-corner key experiments](../sims/circumference_corner_key_inverse.cjs) already explored AES/ChaCha streams derived from concentric grid corners; this new 76/180 terminal-page framing is a different source claim and does not revive those failed direct key families.

The verified count concordance and quartic divisibility make an exact source-defined framing worth pursuing, but the direct codeword, full-field Reed–Solomon, four-block all-secret affine Hill, simple ink/word transformations, and every additive GP29 quartic LFSR seed under the tested language registers above have failed. The next decision-grade test requires an **additional original clue** fixing a nontrivial operation connecting table cell values to GP runes or state before p55 is used to select the rule. A proposed chain must explain why the 180 solved rune positions fit it and then predict the untouched 76 original p55 ciphertext runes or meaningful plaintext, with exact re-encryption and wrong-key controls. Without that independent operation, arbitrary border/interior transposition or pad searches would be postselected and low-value.

No unknown plaintext, authentic key, or final Cicada destination was recovered. The authoritative solved-status statement in `results/README.md` remains unchanged.
