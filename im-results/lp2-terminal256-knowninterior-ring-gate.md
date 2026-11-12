# Terminal p55–57: 256-rune known-interior ring hypothesis

**Classification:** new exact source-count/layout alignment, with source-original complete-inverse tests and finite negative results. The alignment may be coincidental. No authentic p55 plaintext, key, cipher, or deep-web hash preimage has been recovered.

## Why this is a plausible human-facing next route

The original pp49–51 numerical table is **32 rows by 8 columns, 256 cells**. Its outermost ring contains exactly **76** cells, and its three inner rings contain **68, 60, and 52** cells, totaling **180**. The actual terminal runic pages are **p55 76 runes**, **p56 85 runes**, and **p57 95 runes**. Thus:

```text
p55 (unknown)       76  =  32×8 perimeter
p56+p57 (solved)   180  =  30×6 interior = 68+60+52
all three          256  =  32×8 complete rectangle
```

Original solved p57 says to *shed our own circumferences* and *find the divinity within*. This makes perimeter/interior a source-motivated conceptual reading. The 2014 p15 4×4 spiral is another source-visible layout precedent. If the table and terminal text share an operation, the two independently solved pages provide **180 known plaintext runes** that could constrain a proposed inverse for all **76** unknown p55 runes.

**Strongest objection:** p56 is a separately solved prime-totient cipher with a literal-F exception, while p57 is clear GP text, and both have their own headings. No source explicitly says that three different terminal pages form a single 32×8 cipher object or supplies a transform from table values to terminal runes. This is an exact layout correspondence pending an actual executable route, not proof of creator intent. Do **not** revive the alleged shared p49/p55 3×3 marker: original-pixel Issue #379 proved those stencils differ (10 versus 13 dots).

## Original-cipher complete-inverse gates

The independent source register is `resources/liber-primus/lp2-grid-256.json`; its 256 printed base60 numeral tokens are provisionally interpreted as bytes, then reduced mod29. The target text is canonical p55, the known p56 prime-totient decryption, and raw clear p57. All rune counts and all four exact ring lengths are asserted on source data before transformation.

1. **Direct glyph / codebook map.** The simplest row-major placement of 180 solved GP runes into the interior gives **3/180** literal equality matches. Even an unrestricted fixed mapping of each of the **29** byte-mod29 residues to a GP rune attains at most **47/180** matches, requiring **133** exceptions. Using eight fixed corner/direction perimeter-to-center spiral orientations, the best literal interior reading is **12/180** and every unrestricted residue→rune codebook still requires **at least 128/180** exceptions. These are *deterministic fixed-alphabet* exclusions; changing-state and non-GP encodings are untouched.
2. **Short linear source-derived keystream.** Define the known 180-symbol candidate register as `(gridInterior mod29 ± knownRunes) mod29`. Across all eight fixed ring directions/corners, p56 decrypted or printed, and both signs (**32** cases), Berlekamp–Massey over GF29 returns minimum linear complexity **89**, maximum **90**, near the full length/2 expected from a random register. Thus no short constant-coefficient GF29 linear recurrence of order 1–88 reproduces the known interior under these explicit interpretations.
3. **One complete 76-unknown original decryption model.** Treat the table's 256 residues as a fixed **256-tap circular convolution key**. The visible terminal GP rune stream is its 256-symbol ciphertext, and the 180 solved runes are fixed plaintext at indices 76–255. This produces **256 linear equations for 76 unknown p55 plaintext GP runes**. In either natural cyclic direction the coefficient matrix has **rank 76**, but the original remaining equations contain **172** or **174** nonzero contradictions. A full-length planted GP plaintext using the same literal source key and the actual p56/p57 known interior gives a unique exact recovered **76/76** p55-symbol vector and **zero** contradictions. This excludes those two exact invertible full-grid operators as explanations of the original terminal block.

Each negative is conditional on the conventional base60-byte conversion and the stated physical reading convention. No hidden transposition, keyed nonlinear cipher, format conversion, or guessed exception was added to rescue a failed family.

## New research decision

The exact 76/180/256 fit supplies an independently testable **known-plaintext orientation gate**. A serious proposed terminal cipher can freeze its original-source mapping and predict the **180 independently deciphered inner cells** before attempting any p55 recovery. If it fails the known interior, no post hoc appeal to a readable 76-rune outer plaintext is credible. A valid breakthrough must specify the actual grid-to-rune operator and all needed keys, produce correct p56 and p57 known text, and invert the outer 76 runes reproducibly.

Do not treat the coincidence itself as an instruction to fit arbitrary stencils or keyed substitutions. The p56 deep-web SHA-512 preimage remains unresolved and could be a missing input, but no authenticated source has linked that page to a key for this particular operator.

**Reproducer:** [`sims/lp2_terminal256_knowninterior_ring_sft.cjs`](../sims/lp2_terminal256_knowninterior_ring_sft.cjs) (Node 22, built-ins only), executed successfully in [Windows manual CI run #43250489434](https://github.com/FlareZ123/liber-primus/actions/runs/43250489434). Controls and exact residual counts are printed with full reproducibility.
