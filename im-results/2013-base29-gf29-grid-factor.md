# The 2013 BASE29 3301 example is an exact LP2 numerical-grid quadratic factor

> **Command-provenance correction (11 November 2026):** a decrypted, byte-preserving signed copy of the 26-Jan-2013 TCP-server challenge is now recovered and independently GPG-verified against the repository Cicada key fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`. It authenticates the BASE29/DH/NEXT protocol and worked DH23 example; it does not document the separate first-onion NUMBER/PRIMES/count grammar. The March 2013 participant log's NEXT payload is also signature-verified under the same key, but the full DH3301 transcript is not signed as a whole. The NUMBER operation used below remains from later-preserved transcripts/reconstructed server.py; no original first-onion server or raw NUMBER session is preserved. Therefore the 1661→151→p36 composition remains a source-constrained hypothesis, not an authenticated instruction. See [signed-source record](../resources/external/2013-tcp-server-signed-source.md).
>

**Classification (11 November 2026): exact historical-source-to-original-manuscript polynomial identity, now fully classified as a [256,252,3] GF(29)-residue code. No source-selected parity-cell set, unique 252-symbol payload, unsolved LP2 plaintext, authentic encryption key or cipher reconstruction.** The equation is reproducible directly from the 2013 archival source example and the 256 original transcribed grid bytes. The repeated-root cyclic closure at length 24,360 is a mathematical consequence of the factors, not a historically specified table length or decoder.

## Previously unconnected historical input

The original 2013 Cicada TCP-server challenge is now available as a decrypted signed payload at [iBotPeaches/cicada_3301 tcp-server.asc](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2013/tcp-server.asc), pinned to archive commit 27309e66746e21542f2b908d7f60b906915fe7c6. Its embedded OpenPGP signature is dated **26 January 2013, 09:16:23 UTC** and independently verifies as Good signature / VALIDSIG under the repository Cicada key fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`; its SHA-256 `fdfe1208b49f75ce634224d2b0561e4c8b322f27dd74bd757f5d83ebcfbdb88c` matches the independent signature-timeline archive. The archive's companion note says the original encryption was removed while the inline signature was retained; packet inspection confirms a one-pass signature, compressed literal data and signature packet, with no encrypted-data packet. The signed text includes the 3 February 2013 deadline, `BASE29 3301 → 3QO`, `DH 23 → server 5/8, client 19, shared 2`, and the command grammar. The 16-Feb-2013 Twisted-Python witness independently reproduces the challenge, corroborating the content before the 2014 manuscript. The archive commit is from 2025, not contemporaneous; the embedded signature and 2013 mailing-list witness provide the historical dating. The signed challenge contains no `NUMBER`, `PRIMES` or `COUNT` command. It authenticates the TCP protocol, not the later first-onion number-service grammar or an LP2 continuation; see the [full verification and scope record](../resources/external/2013-tcp-server-signed-source.md).

The example's digit values are therefore fixed without consulting LP2:

```text
3QO -> [3, 26, 24]
3*29^2 + 26*29 + 24 = 3301
```

The same protocol defines `RAND [n]`, `DH [p]`, `KOAN`, `CODE`, and `NEXT`. Its [contemporary-looking preserved specification](https://github.com/neuroretransmit/cicada/blob/main/2013/007-fourth-onion/README.md#the-e-mail) directs applicants to **build their own TCP servers** and provide their Tor address to the organizers. `RAND` makes the server emit freshly generated 0–255 integers; `DH` has the server select a base and a new secret integer for an individual client exchange; `BASE29` is ordinary numeral conversion. Crucially, **`NEXT` has the client transmit signed text for the server to store**: the server does not compute or choose the next instruction. This separates command-direction and session state from any later LP2 decoding claim. There is no archived fixed 256-byte output, shared DH key, recipient cipher selector or instruction to apply these commands to LP2.

## Exact polynomial match on the independent LP2 grid

Read the same canonical 256-byte row-major LP2 table in `resources/liber-primus/lp2-grid-256.json`. Its byte-stream SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Over \(\mathbb F_{29}\), take the original byte sequence as descending coefficients \(
P(X)=\sum_{i=0}^{255}(b_i\bmod29)X^{255-i}.
\)
The leading byte is 203=7×29, so the formal polynomial degree is 254.

Using the **printed historical digits as ascending-power coefficients**, the convention previously used on the actual LP2 red rune triads, defines:

\[
H_{2013}(X)=3+26X+24X^2
=24(X^2+18X+11)\pmod {29}.
\]

**Exact division gives \(P(X)\bmod H_{2013}(X)=0\).** This is precisely the complete original-grid factor \((X^2+18X+11)\) identified in the [independent full factorization](lp2-grid-complete-gf29-factorization.md), now supplied by a pre-LP2 published numerical operation without choosing an arbitrary factor. The previously published factorization had no identified 2013 `BASE29 3301` provenance.

The choice of coefficient orientation is material. If `3QO` is interpreted in the conventional left-to-right **descending** polynomial orientation, \(3X^2+26X+24\), the source table's exact Euclidean division remainder, in descending slots, is **\([1,6]\)**. Only the ascending-coefficient convention gives zero remainder. Its motivation comes from the independent red-triad reading; the 2013 BASE29 specification itself is a numeral operation and does not prescribe turning its digits into polynomial coefficients.

Another independent original-source quadratic is the physical p39 red inscription, GP index values \([27,5,15]\), read in the same ascending coefficient order:

\[
G_{p39}(X)=27+5X+15X^2
=15(X-24)^2\pmod {29}.
\]

This is also an exact factor of \(P(X)\), and its root **24 = 3301 mod 29** is independently supplied by the oversized Ac GP rune on p54. The two distinct factors are coprime. Their product divides the unchanged original table exactly, as checked by multiplication back to all 256 original mod29 coefficients.

**Original red-factor uniqueness across the annotated manuscript (12 November 2026, Agent23).** A source-exact check interpreted every one of the 18 original red-rune spans as a GF(29) polynomial in printed order, together with each reverse reading (36 finite cases). **Only p39's three-rune span at local offset119, `[27,5,15]` in printed order, divides the original 256-byte table exactly.** The separate p3 three-rune red span is nondividing in either direction. A distinct original-source 256-symbol comparison, p54's 232 ciphertext runes followed by the first printed 24 on p55, has nonzero H remainder `[19,4]` and G remainder `[18,23]` when interpreted as descending coefficients. This identifies the p39 relationship as uniquely specific among these source-visible red spans and distinguishes the table from that adjacent 256-rune passage. It does not specify why the table was constructed, or an actual key, plaintext, and decoder. The source-locked [CommonJS reproducer](../sims/lp2_red_span_grid_factor_uniqueness_sft.cjs) asserts every rune against the original indexed corpus, the table-byte hash, and both controls.

The 252-slot quotient has GP29 index of coincidence **0.0363308670** and is not readable plaintext. Its natural direct-additive use as a one-use GP29 key for source-selected p36 (238 runes) was tested with both signs, ascending/reversed coefficient order, and the printed-order phase 0 plus source-derived phase 151. The best held-out LP1 trigram score was **−10.9902**, worse than the worst native 238-rune window (**−8.6026**); all eight trials were ciphertext-like. The canonical BASE29 most-significant-first serialization (251 digits, formal leading zero omitted) also has zero key symbols at positions **74, 119, 139, 169, 236**, each aligned with a nonzero p36 ciphertext rune (**18, 23, 19, 2, 9**). A symbolwise multiplicative GF29 pad is therefore not an invertible DH-group key: zero is outside GF29× and would collapse these positions. The quotient remains an intermediate register, not a direct additive or multiplicative p36 key. Reproduce with [the Q252-to-p36 SFT](../sims/p50_q252_additive_key_p36_sft.cjs); this is distinct from the GF29² ElGamal quotient-transport experiment below.
### Q252 dual-quadratic seed gate (Issue #575, 12 November 2026)

The one frozen consumer proposed in #575 initializes two degree-2 registers with the exact quotient remainders Q mod H = [5,6] and Q mod G = [3,22], advances each by multiplication by X modulo its own factor, and emits the sum of their constant coefficients modulo 29. This uses the established ascending-coefficient convention, original row-major base-60 table bytes, and no fitted phase, scale, salt, reset, or alphabet relabeling. The original table-byte SHA-256 remains 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290; the resulting stream has algebraic period 24,360 and all 29 output symbols.

| p36 decode | IoC | held-out LP1-GP trigram nats/rune | one-coefficient wrong-seed score | exact re-encryption |
| --- | ---: | ---: | ---: | --- |
| raw p36 | 0.03598908 | −11.18101 | — | — |
| C−K | 0.03527993 | −11.06579 | −11.06432 | yes |
| C+K | 0.03386165 | −11.06761 | −11.17094 | yes |

The reference has 406 held-out native-GP windows of length 238; their trigram range is **−8.59949 to −8.06723** (median −8.40441). Both candidate outputs are well below every native window and remain visibly nonlinguistic in the original word/line layout. A 238-rune held-out native-GP plant is recovered exactly for each sign. The slightly higher C−K score is not seed-specific: changing only the first H-register seed coefficient by +1 gives −11.06432, marginally better than the proposed seed. Thus this exact recurrence/readout does not decode p36 and does not justify a second-page prediction or a recurrence-family sweep.

**Additional bounded consumer (12 November 2026):** a separate p57-selected Hill-3 candidate strips the 2014 Wisdom 5×5 circumference, applies `φ(n) mod 29` to its 3×3 core, and decrypts all 252 Q252 slots as 84 blocks. Both printed-order and ascending-order outputs fall below every held-out native LP1-GP 252-rune window. This exact consumer is rejected; see [full gate](2014-magic-square-direction-map.md) and [reproducer](../sims/p50_q252_wisdom_inner3_hill_gate.cjs).

**Interpretive boundary:** H and G remain exact conditional factors of the original 256-cell table, with the 2013 BASE29 example and p39 red triad supplying their respective coefficient triples. The table's radix-60 reading and polynomialization remain conditional/retrospective. No historical source specifies taking the quotient residues as two register states or summing their constant coefficients. The 24,360 period follows algebraically from the chosen factors; it is not an independently selected Cicada clock. Retire only this frozen Q252-seeded dual-quadratic consumer; do not promote the quotient to a key or plaintext. Reproducer: **sims/p50_q252_dual_quadratic_seed_sft.cjs**.

## The other 2013 worked example generates the p39 factor

The same historical server specification gives the **literal, fully worked DH exchange**:

```text
C: DH 23
S: 01 OK 5 8
C: 19
S: 03 DATA 2
```

This defines modulus \(p=23\), generator \(g=5\), server public share \(A=8\), client public share \(B=19\), and shared key \(K=2\). The previously unstated private exponents are uniquely recovered in the 22-element multiplicative group: \(5^6\bmod23=8\), \(5^{15}\bmod23=19\), and \(19^6\bmod23=8^{15}\bmod23=2\).

There is now a **single source-number construction of the other original LP2 quadratic**. Take the client exponent **15** from that 2013 example and \(r=3301\bmod29=24\) from the separately specified BASE29 example:

\[
15(X-r)^2=15(X-24)^2=27+5X+15X^2\pmod{29}.
\]

The resulting coefficient vector \([27,5,15]\) is **exactly** the p39 red three-rune inscription under the source-established ascending-power convention. Moreover, its constant 27 is \(-K\pmod{29}\) for the 2013 exchange's shared secret \(K=2\), while the linear coefficient 5 is the original 2013 DH generator. The leading coefficient is the actual recovered client exponent 15. These identities are independently executable without reading off the p39 rune coefficients as parameters.

This is a stronger, more constrained interpretation than choosing an arbitrary quadratic factor from a precomputed list. **The square-of-a-shift operation was itself recognized from the p39 red polynomial before discovering the historical DH link.** Accordingly, the data do not prove that the author intended the DH example as a key schedule. The derived 15 is the private exponent of a tiny illustrative DH exchange, **not an independently recovered LP2 encryption key**.

A further arithmetic alignment, treated as less diagnostic, maps the 2013 DH example to the p3 red triad: \([g+A,p,K]=[5+8,23,2]=[13,23,2]\). Nothing in the 2013 instructions prescribes summing the base and public share, so this identity must not be counted as independent confirmation. Likewise, the discrete logarithm \(z=u^{433}\) in the p3 GP29² extension has \(433\bmod23=19\), matching the DH client share only after selecting a different modulus for a retrospective residue check.

## Dual-factor source-transcription correction

**New bounded consequence (Agent 21, 11 November 2026): the two factor equations repair historical numeral ambiguity exactly, up to a documented GF29-invisible byte.** This is an original-source reconstruction result with executable finite alternatives, not a decipherment of an unknown LP2 page. The 2014 archival `decimal.txt`/`sexagesimal.bin` byte list contains ten readings that disagree with the printed LP2 original. In the contemporaneous 2014 `50.txt`, three of these were already flagged by the transcriber as corrected: zero-based byte indices **165: 47→18**, **170: 194→254**, and **172: 174→148**. The other seven are precisely `I/i` and `L/l` case ambiguities at indices **25,45,50,175,182,199,246**. Each site's alternative can be fixed from the archival source notes or a case swap; no unknown-runic plaintext or English score is involved.

Treat the printed 256 slots as descending-power GF29 coefficients, retaining the original leading-zero coefficient. Apply the two independently established source-linked polynomial divisibility tests `H(X)=3+26X+24X²` from the signed 2013 BASE29 example and `G(X)=27+5X+15X²` from the red p39 triad. Exact enumeration, not a fitted pad, gives:

| Independently constrained ambiguous sites | Assignments tested | Divisible by H | Divisible by G | Divisible by both |
| --- | ---: | ---: | ---: | ---: |
| All **10** historical differences | 1,024 | 2 | 4 | **2** |
| **9**, excluding byte165 | 512 | **1** | 2 | **1** |
| **7** I/L readings after applying all three 2014 notes | 128 | **1** | **1** | **1** |

For the nine-site set, the only dual-factor solution changes **every** recorded site to its authentic LP2-printed reading, restoring precisely the original byte stream except at index165. For the seven-site set, each factor separately selects mask127, again flipping all seven and matching the original. Reversing the 2013 numeral-coefficient orientation yields **zero** admissible nine-site assignments. The exact candidate streams and byte-for-byte source checks are frozen in [the executable error-correction SFT](../sims/lp2_grid_dual_factor_error_corrector_sft.cjs).

The remaining ambiguity is mathematically unavoidable under these two factors. The 2014 historical **47** and explicitly corrected **18** at index165 differ by exactly29 and therefore have the **same GF29 coefficient**. All 1,024 alternatives produce two dual-factor solutions differing only at that site. The independently archived 2014 correction annotation decides it. This is a precise failure condition for a four-residue parity-check interpretation and explains why the historical stale byte stream fails exact polynomial division.

Three other archived historical Cicada hidden-service 256-byte strings, from onion2, onion3 and onion4, provide fixed-length comparison controls. Their respective GF29 remainders are **H: [1,11], [22,1], [26,17]** and **G: [14,7], [4,15], [3,18]**; **none** passes either polynomial. Thus the dual-factor relation is specific to the original LP2 numeric table among these four historically selected 256-byte streams. This comparison is small and drawn from an archive with uncertain ancestry; it is not a global significance estimate. The reproducer asserts the original control bytes and every remainder.

The result makes the existing pair of polynomial factors useful for reconstructing the source table, and is consistent with the possibility of deliberately included algebraic parity constraints. The code-theoretic classification below establishes four global residue checks, but does not identify four parity cells or a unique 252-symbol message. **Neither original source instructs a solver to perform this cross-year polynomial division**; the factor/ambiguity correspondence was investigated after the printed LP2 table was known. It cannot independently establish creator intent or the cipher architecture. The recovered 256 bytes are already present in the original images; no new unknown-text key, plaintext, or downstream instruction follows.


## Historical primitive-field source gate (Issue #383)

**Bounded source decision, 11 November 2026:** Searches for an exact pre-2014 published coefficient pair `H=[3,26,24]` and `G=[27,5,15]`, including both polynomial orientations, found no attributable coding standard, implementation, or source-specified 32×8 decoder. The field-theory matches below identify a mathematical *family*, without assigning the particular paired polynomials to a historical cipher. The only currently verified original selection of H is the signed 2013 `BASE29 3301 → 3QO` example described above; G is selected by the printed p39 red triad. No source tells a player to multiply these two polynomials or consume their 252-slot quotient.

A particularly relevant earlier publication is Bernt Lindström, [*Finding Finite B₂-Sequences Faster*](https://doi.org/10.1090/S0025-5718-98-00986-7), *Mathematics of Computation* **67** (1998), pp. 1173–1178, Theorem 3.1 and Example 3.1 (a [period PDF copy](https://electronicsandbooks.com/edt/manual/Magazine/M/Mathematics%20of%20Computation/1960-2002/pdf/1998_v067_n223/2585177.pdf)). It enumerates **96 distinct monic primitive quadratics** over GF(29). H normalizes to `X²−11X+11`, corresponding to the paper's parameters `u=11, v=11, w=u²/v=11`. Its `w=11` belongs to the paper's admissible `{10,11,17,27}` list. This establishes that H is a perfectly ordinary member of a large class; the paper's explicitly displayed GF29 example instead uses `X²−7X+2`. Its Sidon/Bose–Chowla construction yields 29-element subsets modulo 840, with no documented transformation of a 256-entry page table or the separate repeated-root G factor.

An independently timestamped 20 October 2010 [GAP-derived characteristic-29 Conway polynomial table](https://www.math.rwth-aachen.de/~Thomas.Breuer/irrats/char29.htm) lists `C_(29,2)=X²+24X+2`, **different** from H's `X²+18X+11`. G normalizes to `(X−24)²`, has discriminant zero and a root of order 7, so cannot itself be an irreducible/primitive quadratic for the GF(29²) constructions. The exact order-840 property of H, the order-7 double root of G, and the non-cyclic length-256 code boundary are already reproduced by [the existing H/G code-structure SFT](../sims/lp2_grid_hg_code_structure_sft.cjs). Therefore the standard Conway-field, paired-primitive-quadratic and ordinary 256-symbol cyclic/BCH interpretations have no exact historical match or selected inverse here. Other custom codes are mathematically possible but require an independent framing/readout instruction.

**Next-decision consequence:** close the finite historical-source search with no key, plaintext or cipher consumer. Preserve the source-linked H/G factors and their transcription-correction value; reopen only on a dated independent artifact that specifies the *exact pair* plus a unique source-order reversible consumer, with a prediction on untouched original ciphertext. Keyword coincidences or the broad primitive-polynomial classification alone do not justify dependent decryption sweeps.

## Code-theoretic classification of the H/G residue constraints

The two source-linked factors define a genuine four-check **linear code on the 256 byte residues**, but not four uniquely located parity bytes.

The code-structure SFT reads the source-first `resources/liber-primus/base60-grid.json` directly as 32×8 `byte_rows` in printed row-major order. It asserts the image-adjudicated cells at flat indices 45, 50, and 246 are respectively tokens `1l`, `0l`, `3I` and bytes 107, 47, 198, and that the older flattened `lp2-grid-256.json` copy matches byte-for-byte (SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`). It does not use the external `payload_resolved.bin` alternatives 81, 21, or 224. The three-cell image adjudication is documented separately in [the p50 case-byte gate](lp2-p50-three-glyph-case-byte-gate.md).

In ascending-power notation,

\[
H(X)=3+26X+24X^2=24(X^2-11X+11),
\]
\[
G(X)=27+5X+15X^2=15(X+5)^2=15(X-24)^2,
\]
and
\[
F(X)=H(X)G(X)=12X^4+17X^3+11X^2+21X+23.
\]
The monic generator is \(X^4+28X^3+13X^2+9X+14\). The quadratic H is irreducible (monic discriminant 19 is a nonsquare); its roots in \(\mathbb F_{29^2}\) have exact multiplicative order 840. G has a double root at 24, whose field multiplicative order is 7.

The quotient ring decomposes as
\[
\mathbb F_{29}[X]/(F)\cong\mathbb F_{29^2}\times
\mathbb F_{29}[\epsilon]/(\epsilon^2).
\]
The class of X has order 840 in the first component and 203=7×29 in the repeated-root component, hence exact order **24,360** modulo F. Thus F divides \\(X^{24360}-1\\): it is a generator polynomial for a repeated-root cyclic code of length 24,360. The [256,252,3] residue code above is exactly the shortening of that long cyclic code to the first 256 coordinates (the remaining 24,104 coordinates are fixed zero in this embedding). This is a mathematical cyclic closure of the factor pair, **not** evidence that the manuscript specifies a 24,360-symbol stream or that a solver should append 24,104 zeros.

At length 256, \(X^{256}\bmod F=3+13X+3X^2+19X^3\), which is nonconstant. Therefore F cannot divide \(X^{256}-\lambda\) for any \(\lambda\in\mathbb F_{29}\); the code is not cyclic or constacyclic at the table's length. The repeated factor \((X-24)^2\) gives the same exclusion because 29 does not divide 256 and \(X^{256}-\lambda\) is squarefree.

Define
\[
C_{256}=\{(a_0,\ldots,a_{255})\in\mathbb F_{29}^{256}:
F\mid A(X),\quad A(X)=\sum_{i=0}^{255}a_iX^{255-i}\}.
\]
Its 4×256 parity-check matrix has rank four, so its dimension is 252. All 7,168 nonzero single-residue error syndromes are distinct, while
\[
1+25X^{20}+22X^{25}
\]
is a weight-three codeword. Hence the exact parameters are **[256,252,3] over GF(29)**. This is not an MDS or Reed–Solomon code (its distance is 3, not 5; a standard GF(29) evaluation RS code cannot have length 256). It guarantees correction of one arbitrary **residue** error, not two. It does not correct complete byte values: adding 29 to a byte is invisible, including the documented 47/18 ambiguity at index 165. The earlier seven known I/i and L/l alternatives are resolved by exhaustive testing of their finite, known-position choices, not by a general seven-error-correction capability.

### The four checks do not select four parity cells

With the fixed high-degree-first coefficient order, using the first 252 residues as information and the last four as parity gives the observed suffix **[6,7,15,22]**. But this is only one systematic representation. The parity-check submatrix is invertible for **all 253 consecutive four-position blocks**; the first four, last four, four corners, and other separated sets are also valid parity positions. The four checks are global syndrome equations, not four source-marked cells. Neither the original table nor the signed 2013 protocol selects one of these information/parity partitions.

The polynomial quotient \(Q(X)=P(X)/F(X)\) is the 252-slot multiplier in the nonsystematic generator representation; its first fixed-width slot is zero, leaving 251 canonical coefficients. The first 252 table residues are a different, systematic message representation if the last four cells are chosen as parity. Both are reversible 252-symbol parameterizations of the same code. No historical instruction chooses between them, and neither supplies an authenticated mapping to the 12,956-rune ciphertext.

### Relation to the separate p13/p24 four-jet code

The [original-glyph audit](lp2-grid-11-original-glyph-adjudication.md) describes a **different affine four-jet code**: \(P(24)=P'(24)=P'(13)=0\) and \(P(13)=8\), whose homogeneous difference kernel is \((X-24)^2(X-13)^2\). The H/G code has kernel \(H(X)(X-24)^2\). They share only the p24 double-root condition; their other two checks differ. The same printed table happens to satisfy both, so both can reconstruct the same suffix [6,7,15,22] when the last four cells are selected. That is not equivalence of the codes or two independent source selections of those parity cells.

#### Exact conditional intersection: one six-check, distance-four affine register (14 November 2026)

It is mathematically possible to impose **both** code families simultaneously, rather than merely compare them: each requires P(24)=P′(24)=0, but the independent residual requirements are P mod H=0 and P(13)=8, P′(13)=0. The difference code's exact monic-generator-equivalent is

```text
L(X) = H(X) (X−24)^2 (X−13)^2
     = 24X^6 + 19X^5 + 4X^4 + 25X^3 + 4X^2 + 15X + 2 (mod 29).
```

The unchanged original 256-cell table (byte SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`) has syndrome **[P(24),P′(24),P(13),P′(13),P mod H constants] = [0,0,8,0,0,0]**. Exact descending polynomial division by L yields a **250-slot quotient** (one leading zero, 249 canonical nonleading GF29 values) and a six-coefficient descending remainder **[5,23,8,3,3,15]**. Multiplication plus remainder restores all 256 original residues. Keeping the first 250 original residues as *one arbitrary systematic frame*, the six field checks uniquely reconstruct the final six residue values **[27,27,6,7,15,22]**; the printed original full byte values there are **[172,230,180,36,189,80]**. The constraints cannot select those full byte representatives or determine which six slots should carry parity.

The six GF29 check equations are independent, producing a conditional **[256,250,4] affine residue code**. The original-exact [self-contained CommonJS SFT](../sims/lp2_grid_sixcheck_affine_code_sft.cjs) exhaustively finds no dependent pair among **32,640** and no dependent triple among **2,763,520** distinct position sets. Conversely the four-term nonzero polynomial `8X^72+21X^135+13X^158+X^190` has exact zero six-check syndrome, proving minimum distance **exactly four**. The program restores changed-prefix parity, asserts a wrong-parity failure and reports all checks. [Windows Node22 manual CI run 43543935440](https://github.com/FlareZ123/liber-primus/actions/runs/43543935440) succeeds on the unchanged repository corpus.

**Cryptanalytic boundary:** This is one *combined* representation of the two **retrospectively specified** constraints, not six independent historical confirmations, a proven author-created code, a recovered 250-rune message or an LP2 key. H comes from a signed 2013 BASE29 example under the specifically chosen ascending-polynomial interpretation; p39 supplies the (X−24)^2 factor; identifying **13** as another *double root* and the **8-column count** as a value target was done with the original table visible. The distinctive remainder digits are algebraically forced by those chosen equations, so reinterpreting them as a fresh DH message would double-count evidence. The quotient's GP29 IoC is only **0.0368193**, against ordinary solved-GP language markedly higher, so its direct printed-order interpretation does not reveal plaintext. What changes is the exact conditional minimum-distance bound and availability of a 250-residue register; an author-visible instruction selecting L, the parity frame and a consumer is still required before attempting a decryptor.


The source-native wrong-factor controls remain negative: reversed H gives high-to-low remainder [1,6], reversed G [19,22], the p3 red triad [26,18], and the two natural BASE29 1033 coefficient orientations [3,11] and [24,3]. The existing [dual-factor SFT](../sims/lp2_grid_dual_factor_error_corrector_sft.cjs) also tests the 2014 historical transcription and three other archived 256-byte streams; none of those controls satisfies both factors. The new [code-structure SFT](../sims/lp2_grid_hg_code_structure_sft.cjs) reproduces the factorization, field orders, 24,360 closure, [256,252,3] parameters, 253 parity-block choices, and wrong-factor remainders.

**Decision:** H/G define an exact source-specific four-check residue code and a useful retrospective transcription check. They do **not** define a source-selected four-symbol parity envelope or a unique 252-symbol cryptographic payload. The quotient and systematic data block remain intermediate registers, not plaintext or an authenticated key. Close this branch unless a new primary source selects the polynomial operation and message framing; do not continue searching parity placements or relabel the result as Reed–Solomon.


### The dual-factor quotient does not inherit LP2's anti-doublet fingerprint (Agent 19; 11 November 2026)

**Source-frozen test; bounded negative.** The independently selected historical factors above make a canonical 251-coefficient GF29 quotient from the 256 original printed table residues. Exact division produces the fixed-width 252-slot quotient (leading slot zero because the first original printed byte is 203≡0 mod29); omitting that formal leading zero leaves **251 GP29 symbols with eight adjacent equal pairs among 250 edges**. The separate orderings H then G and G then H give exactly the same quotient, and multiplying both factors back reconstructs all 256 original table residues.

If the quotient were a short run of **the same unusually anti-repeating ciphertext register** used on LP2 pp0–55, eight repeats would be conspicuous. Across the full original 12,956-rune ciphertext, the book has **86 repeats among 12,901 within-page edges**, about **0.667%**. In the exhaustive **12,706 original contiguous 251-rune windows**, no window reaches eight repeats; the maximum is **six**. Restricting to **615 windows wholly contained within one physical page** gives a maximum of **five**. Treating the book's empirical rate as a *hypothetical independent-transition* probability, the binomial upper tail for eight or more of 250 edges is about **0.0003172**; the exact original-window comparison does not require independent edges or a fitted probability model. Neither count calibrates the many hypothesis choices made elsewhere in this research program.

The source quotient is therefore **unlike ordinary short excerpts of the original LP2 anti-repeat channel**, despite the exact and historically anchored polynomial factorization. Its eight repeats are close to the uniform GP29 expectation **250/29≈8.62**, so the current evidence favors retaining it as a *possibly different binary/residue register* rather than treating it as 251 immediately decodable LP2 ciphertext glyphs. A shared randomized generator is not logically excluded by one 251-symbol draw; deliberately transported data, changed phase, format or alphabet also remain open. **No unknown plaintext or source-selected key results.**

[Single-file source/plant/exhaustive-window reproducer](../sims/lp2_hg_quotient_repeat_register_sft.cjs) reads the unchanged original GP29 corpus and printed base60 token grid. It validates both exact factor divisions, performs a full 256-cell reverse multiplication, checks all real within-page edges and all 251-rune original windows, then recovers an independently planted true LP2 window exactly under the same forward factor code. This test changes the immediate research decision: the quotient should not be promoted as a direct copy of the book's unusually low-doublet ciphertext stream without independent source evidence for a format transformation.

## Source-linked field representation, with a scope warning

The physical p3 red triad \([13,23,2]\), also beginning at local rune offset 119, defines \(\mathbb F_{29}[u]\) with \(u^2=3u+8\). The p3 root \(u\) is primitive of order 840. The concrete element \(z=23-2u\) satisfies the historical quadratic **\(H_{2013}(z)=0\)**; its canonical power relative to \(u\) is \(z=u^{433}\). The log is computed by direct enumeration of the complete 840-element multiplicative cycle, and \(\gcd(433,840)=1\), so \(z\) is also primitive. Its trace and norm are each 11, matching the monic 2013 polynomial \(X^2+18X+11\).

**Independent solved-page prime selector (Agent 4, 11 November; conditional).** Solved LP2 p56 has 85 original ciphertext runes and exactly one historically verified literal-F interruption at zero-based offset 56, which consumes no prime in its authentic consecutive-prime-totient decoder. The page therefore consumes **84 primes**, ending at the **84th prime, 433**. Without using any unknown LP2 ciphertext to select an exponent, the p3 field's primitive element satisfies **u^433=23−2u**, exactly the root of the independent historical BASE29 quadratic above; its Galois conjugate is u^797=17+2u. In addition, **433 mod29=27** coincides with the p39 marked constant and the negative of the 2013 worked DH shared key 2. **The two exponents have residues 433 mod23=19 and 797 mod23=15**, exactly the 2013 worked DH client's public value 19 and recovered private exponent 15 in this order. This extra pairwise equality was checked after the exponents were known; since reducing a GF841 discrete logarithm modulo an unrelated DH modulus is an unprovided operation, it remains a source-number coincidence and is not independent evidence of encryption. This supplies a newly *source-derivable candidate* for selecting one of the two BASE29 polynomial roots. Neither the solved p56 cipher nor the 2013 server instructions tells a solver to exponentiate the p3 field generator by the final p56 key prime; that choice remains conjectural, and a coherent original plaintext would be needed to establish a decoding role.

The corresponding no-free-key coordinate-change test is fully reversible: writing z=23−2u, each two-rune pair a+bu has coordinates **(a+26b,14b)** in the (1,z) basis, with inverse **(A+23B,−2B)** mod29. On all 12,956 unchanged original unsolved runes in consecutive pairs, the forward and inverse transforms yield GP-index IoCs **0.0345182918** and **0.0345030277**, respectively, against the original **0.0344783979** and independent native GP Latin **0.0720286230**. Both exact original round trips and a 2,400-rune native control succeed; the original transformed texts remain nonlinguistic. This excludes only the literal two-rune field-coordinate transport, not source-selected field exponents operating on hidden state or non-GP intermediate symbols. [Source assertion and original-input SFT](../sims/lp2_2013_p56_prime84_field_basis_sft.cjs).

**Simplest direct DH field-multiplication inverse.** An independent source-defined operation treats each original two-rune pair as a field element and multiplies by `z^(±(p_i−1))`, with the same three full-book/physical-page clock conventions. This avoids the optional BASE29 discrete-log step entirely. Six further original-input models exactly invert and preserve all doublets; decoded IoCs are **0.03446620–0.03451914** (the actual output is uniformly rune-like), with unreadable prefixes. Hence **all twelve** literal DH/logarithm or multiplicative prime-clock direct-GP modes are negative; this does not exclude keys or states concealed in a more complex system. [Extended source-native SFT](../sims/lp2_2013_dh_prime_field_log_inverse_sft.cjs) · [verified CI run](https://github.com/FlareZ123/liber-primus/actions/runs/42951886412).

**Original-input DH discrete-log plus solved-prime clock gate (Agent 4, CI passed).** The 2013 toy DH protocol explicitly demonstrates modular exponentiation, while `BASE29` specifies numerical digit conversion. Combining these with the source-selected root `z=u^433` gives a fully lossless field codec on **all 841 possible two-rune values**: nonzero `a+bu` maps to the unique discrete logarithm `e∈[0,839]` base `z` and then two base-29 digits `(floor(e/29),e%29)`; the zero field element takes otherwise unused code `840=(28,28)`. An optional consecutive-prime exponent clock uses the known solved-p56 key form `p_i−1` modulo 840, leaving the zero sentinel unchanged. These additional steps are reasonable *candidate operations*, but their application to LP2 and the presence of this 841-state register are not historically instructed. Six complete original-input variants (two exponent signs; whole-book pairing, physical-page pairing with continued prime clock, and physical-page pairing with reset prime clock) exactly re-encode **all 12,956 ciphertext runes** and pass a 2,400-rune Latin-GP native plant plus exhaustive 841-symbol bijection tests. Original decoded IoCs range **0.03446883–0.03452567**, versus native GP **0.07202862**, and no readable original plaintext appears. The two logically separate original controls, a fixed basis change and this exponent-log clock, are therefore both negative for direct native-GP output. This does **not** reject non-GP intermediate state, alternative source-driven clocks, or a different original encoding. [Exact single-file DH/prime-clock SFT](../sims/lp2_2013_dh_prime_field_log_inverse_sft.cjs) · [manual-only CI success](https://github.com/FlareZ123/liber-primus/actions/runs/42951089036).

This gives one precise way to perform the 2013 challenge's historically mentioned **Diffie–Hellman operation** in the same 29²-element field that p3's mark independently suggests. It does **not** identify an actual exchanged exponent, a key, a mapping from quotient symbols to text, or a reason to prefer the specific affine root change \(z=23-2u\) over other field-coordinate changes. All irreducible quadratics over the same field extension admit affine root correspondences. The field isomorphism and exponent 433 alone cannot be advertised as independent statistical confirmation.

## Preserved DH 3301 tester exchange and a source-constrained exponent candidate

A richer 2013 participant log supplies a real `DH 3301` exchange that was absent from the earlier protocol analysis. In `neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`, file `irc-logs/clientlog-1362290293-9.txt`, the participant server records:

```text
Received line: 'DH 3301'
Selected base 2757 and secret 331
Sending line: '01 OK 2757 1264'
Received line: '2800'
Sending line: '03 DATA 1067'
```

The participant implementation chooses its own server base and private integer with `random.randint(2, p)`, so the logged server secret **331 is participant randomness**. The client response is the source-controlled part of the exchange. The multiplicative order of 2757 modulo 3301 is **550**. Therefore `2757^e ≡ 2800 (mod 3301)` fixes the Cicada-client exponent class **e ≡ 11 (mod 550)**. The logged shared key independently checks the same class because `1264^11 mod 3301 = 1067`. Restricting the ordinary private integer to 2 through 3300 leaves exactly **[11, 561, 1111, 1661, 2211, 2761] = 11×[1,51,101,151,201,251]**.

### Later-preserved NUMBER transcript and 2014 Wisdom/05.jpg conditionally single out 1661

A later-preserved first-onion transcript/reconstructed server reports a `NUMBER` operation that factorizes composite inputs directly. This command is not present in the contemporaneous 2013 BASE29/DH/NEXT witness, and no original first-onion server or raw session is preserved. Applying it to the six transcript-compatible representatives gives one unique intersection with the numeric cells visibly printed on the later 2014 Liber Primus **Wisdom/05.jpg** page. Only **1661** has such a proper divisor:

```text
NUMBER 1661 -> divisors [1, 11, 151, 1661]
0_wisdom numeric cell -> 151
```

The other five representatives have no proper divisor among the square's numeric values **{18, 131, 138, 151, 226, 245, 272}**. This supplies a historically ordered **2013 DH → 2014 Wisdom** way to choose **1661** from the DH residue class without fitting unknown LP2 ciphertext. The choice to feed the recovered private-exponent representatives into `NUMBER` is still an inference; no surviving instruction explicitly orders that step.

The selector has a stronger executable totient form. For each of the six DH-compatible representatives, compute the Wisdom page's explicit operation **φ(e) mod29** and read that as a one-based row-major cell address in its 5×5 square. The six addresses/cell values are **11→10→18, 561→1→272, 1111→14→245, 1661→21→151, 2211→15→226, 2761→6→366**. **Only 1661 points to a cell whose value divides the exponent.** The historical `NUMBER` operation confirms that relation because `1661 = 11×151`. Applying the same totient pointer to the selected divisor gives **φ(151) mod29=5**, and cell5 also contains **151**. Therefore the rule produces a closed source-only pointer **1661 → cell21:151 → cell5:151**, exactly the two positions where 151 is printed. This uses no unknown LP2 ciphertext and is the strongest current reason to prefer 1661; the composition `DH representative -> totient cell pointer -> NUMBER divisibility` is still an inferred solve path.

Two further exact consequences strengthen the human-route interpretation. **151 is the 36th prime**, selecting physical LP2 **p36**, whose ciphertext length is exactly **238 runes**, the degree of the independently established large irreducible table factor Q238. Also **151 mod29 = 6** and **1661 mod29 = 8**, reproducing the worked `DH 23` server private/public pair `6 -> 8`. The prime-ordinal-to-page step remains interpretive.

The p36 selection now has an independent algebraic check against the original table. Read p36's physical rune order as descending GF29 coefficients. Its 238-rune polynomial has **two simple seventh-order roots, 24 and 16**, hence the exact factor **(X−24)(X−16)=X²+18X+7**. Across all 55 nonempty unsolved pages, p36 is the **only** page with root16 and the only page carrying both roots; root24 alone also occurs on p10, p11 and p29. The table contains the source-marked root24 with multiplicity two, so the routed p36 already intersects it before using the printed numeral.

The Arabic heading **1** gives a sharper selector. It occurs after exactly **99 runes**. Insert a single GF29 value at that fixed source position, forming a 239-token degree-238 polynomial. **Value1 is uniquely the value that preserves root24; value17 is uniquely the value that preserves root16; no value preserves both.** Across all 239 possible insertion positions, the ordered selector pair **(1 for root24, 17 for root16)** occurs **only at position99**, the actual printed location. The real heading therefore breaks root16 while preserving exactly the table-shared root24. In physical high-to-low orientation its gcd with the original table is exactly **X+5=X−24**; the opposite direction is coprime. The table has **(X+5)²**, while the heading-completed p36 object has one copy.

Dividing the exact actual-heading polynomial by X+5 is reversible and yields 238 coefficients, but the quotient is nonlinguistic (**IoC 0.03336524, trigram -10.99761 nats/rune**), below every one of the 2,976 native solved-GP windows of the same length (worst **-8.60260**). The symmetric counterfactual selected by the same source position, replace the heading by17 and divide by X−16, is also nonlinguistic (**trigram -11.06420**). Thus the p36/table factor link and the heading's root-selection role are exact structural evidence, while direct polynomial division does not recover plaintext. [Exact p36 polynomial SFT](../sims/p36_wisdom151_root24_polynomial_sft.cjs).

A frozen direct consequence was tested rather than expanded into a phase sweep: rotate Q238's 238 non-leading coefficients by the source value **151**, target only the source-selected **238-rune p36**, and try the two coefficient directions and two additive signs. All four outputs remain nonlinguistic. The best trigram score is **-11.05432 nats/rune**; the raw page is **-11.18074**. Every one of **2,976** same-length windows from the solved GP reference scores higher; their worst score is **-8.60260**. Exact planted controls round-trip. This retires the direct `151 -> Q238 phase -> p36 additive key` reading. The same two 151 cells are the opposite endpoints of the reconstructed 5×5 anti-diagonal `[151,320,91,320,151]`, whose sum is 1033. Its raw mod29 key `[6,1,4,1,6]` and the page-motivated totient key `[5,12,14,12,5]`, under both additive signs, also remain nonlinguistic on p36; best trigram is **-10.98905**, still below the worst of all 2,976 native 238-rune windows. This retires the simplest 151-selected diagonal pad as well. p36 itself supplies one more exact anchor: its visible Arabic heading `1` occurs after **99 runes**, so the page is **99 runes + 1 + 139 runes = 239 tokens**, exactly the number of Q238 coefficients including the monic leading 1. Aligning that monic coefficient to the visible heading and walking Q238 in either cyclic direction is impossible under any fixed secret 29-symbol permutation (**205/206** input/output conflicts in one direction, **201/201** in the other). The corresponding additive inverses also fail, with best trigram **-10.92948**, still below every native 238-rune window. Thus the visible numeral closes another natural Q238 phase ambiguity without yielding plaintext.

Reproducer: [`sims/dh1661_wisdom151_p36_q238_phase_sft.cjs`](../sims/dh1661_wisdom151_p36_q238_phase_sft.cjs).

### Independent field invariants corroborate 1661

The earlier BASE29 bridge supplies the primitive p3-field root **z = 23 - 2u**, with `u^2 = 3u + 8`. Applying the six transcript-compatible exponents to this independently fixed root gives a second selector. Among all six representatives, **field trace 5 and norm 2 alone** uniquely select **e=1661**, matching the worked `DH 23` generator **5** and shared key **2** without using unknown ciphertext.

For the selected exponent, `1661 mod840 = 821` and `z^821 = 6+17u`. After selection, three extra relations appear: first coordinate **6** equals the worked server private exponent, coordinate sum **23** equals the worked modulus, and coordinate product **15** equals the worked client private exponent. The public shares then follow as `5^6 mod23=8` and `5^15 mod23=19`. These coordinate readings are corroborative observations and were not used to choose the candidate.

The combined congruences are `e ≡ 11 (mod550)` from the real `DH 3301` transcript and `e ≡ 821 (mod840)` from the trace/norm match, giving **e ≡ 1661 (mod46200)**. In the ordinary sub-3301 range this is exactly 1661. The invariant comparison remains conditional because no surviving Cicada instruction names it.

### Direct uses of 1661 are negative

**Full extension-field exponent, original p36 (12 November 2026, Agent19).** An additional direct inverse treats the pre-existing irreducible **Q238** table factor as a *field modulus*, not as an additive keystream or as 238 independent rune powers. The source-routed 238-rune physical **p36** is one element of **GF(29^238)** in original descending coefficient order. The inferred 2013–2014 candidate **1661** is coprime to **29^238−1**, so a uniquely invertible literal Diffie–Hellman-style power consumer exists: raise that element to **1661⁻¹ mod (29^238−1)**, using the established monic Q238 modulus. On the exact original ciphertext, the resulting 238 GP indices have **IoC 0.0347480764** (raw p36 **0.0359890792**); the prefix **BLOEEAHMBEEOOEDNGRCJNGDFXGDTBTTAEJNMPJLTDEOGCEAMEAPTXANGCAEUXB…** is nonlinguistic, with complete output SHA-256 **afcd34871143c81ee4a2504712f42525ca01b231645b5605fe3d49bd726f00f3**. The same implementation encrypts that output back to the original **238/238** symbols and exactly recovers a 238-symbol source-native synthetic plant derived from solved p57. Re-encryption checks the inverse but does not validate this key or cipher historically. **No original p36 plaintext recovered.** This closes only the natural full-extension-field power route at the fixed sourced candidate exponent; it does not exclude other keys, ciphertext domains or registers. [Original-cipher one-file CJS reproducer](../sims/lp2_q238_dh1661_field_power_sft.cjs).


In the p3 field, exponent **821** has inverse **221** modulo 840. Applying `x -> x^221` to the original unknown LP2 two-rune field pairs remains ciphertext-like: whole-book pairing scores **IoC 0.03448013, trigram -11.06994**, and physical-page pairing scores **0.03450286, -11.06752**, versus raw **0.03447840, -11.07314** and held-out native GP **0.06512502, -8.41667**.

A separate direct GF29 symbol-power test applies the DH exponent 1661 reduced modulo 28 (**9**) and its inverse (**25**) to source-selected p36. Both directions remain ciphertext-like: held-out LP1 trigram scores are **−11.07927** for x^9 and **−11.08955** for x^25, versus the worst native 238-rune window at **−8.60260**. The 238-rune planted round-trip passes exactly, so this is a negative result for the source-derived power map, not an implementation failure.

A second source-derived phase tests the same p50 Q238 key at **1661 mod 238 = 233** (the selected DH exponent reduced by the selected page's 238-rune length). Both coefficient orientations and signs remain ciphertext-like; the best held-out LP1 trigram score is **−11.08476**, still below the worst native 238-rune window (**−8.60260**). The 238-rune planted round-trip passes. Thus the direct Q238 additive-key route fails at both source-derived phases 151 and 233.

The BASE29 digits of 1661 are **[1,28,8]**. Repeating them as an additive GP key under both signs and book/page clocks yields IoC **0.03449756 to 0.03450691** and trigram **-11.08220 to -11.06720**. A literal standard ElGamal interpretation also fails: the whole-stream model contains a zero first component, while the exact 252-slot table quotient has 63 valid first components but decrypts to a 126-rune output with **IoC 0.03403175**, **trigram -11.08247**, only **22/63** direct coordinate integers in byte range, and **7** printable ASCII values.

For the broader exponent class, the six representatives reduce modulo 840 to **[11,561,271,821,531,241]**. The 561 and 531 maps are non-bijective because their gcd with 840 is 3. The four reversible inverse powers were all tested on original ciphertext and the table quotient, and all remain nonlinguistic. Native-GP power-map plants recover exactly.

A separate inbound-only log contains client value **3034** after `DH 3301`. Arithmetic gives `5^11 ≡ 3034 (mod3301)`, and both 5 and 3034 have multiplicative order **75** modulo3301. The server response is absent, so base 5 is not established for that exchange. This order-75 relation remains a conditional observation and is not used as a decoder.

**Decision:** the 2013→2014 chain now supplies a source-constrained **candidate private exponent 1661** through the real DH transcript plus the later-recorded NUMBER/Wisdom intersection. The later field trace/norm relation independently corroborates the same representative. The most direct power, BASE29-additive, ElGamal, and source-selected p36/Q238 phase uses are negative. Treat 1661/151 as candidate key and routing material for a separately motivated register rather than license for arbitrary new sweeps.

Reproducer for the DH class and field tests: [`sims/2013_dh3301_tester11_source_sft.cjs`](../sims/2013_dh3301_tester11_source_sft.cjs).

### Worked-DH ElGamal quotient transport: an exact original-input negative

The participant-preserved 2013 `DH 23` example supplies client private exponent **15**. The historical `BASE29 3301` quadratic and marked p39 quadratic divide the unchanged 256-byte printed table, leaving **252 GF29 quotient positions**. A literal standard cryptographic transfer pairs these positions into 126 elements of the marked field GF(29²), takes 63 consecutive `(c1,c2)` ElGamal ciphertext pairs, and computes `m=c2×c1^825`, since the field's nonzero multiplicative order is 840 and **825=−15 mod840**. The quotient is paired using adjacent coefficients or two equal half-lanes, each in forward/reverse order, giving four fixed cases.

All 63 first components are nonzero in each case, and every output exactly re-encrypts using `m×c1^15=c2`. If the output is 63 direct GP29 runes, all 63 field elements must lie in the 29-element prime subfield. Actual counts are **4, 1, 2, 2** respectively (adjacent forward/reverse, halves forward/reverse). The literal two-coordinate byte mapping `a+29b` has only **19, 19, 23, 22** of 63 outputs in the 0–255 byte range. The source-native positive control plants the first 63 authentic solved-p57 GP rune indices under each of the actual original first components and recovers **63/63**, with exact encryption and decryption.

This excludes **this particular 2013-example ElGamal interpretation as a direct native GP29 or literal byte output** under the four original-source pair clocks, without identifying an authentic LP2 decipherment. It leaves alternative transports, source-selected session keys, and other intermediate registers open. [Self-contained exact source SFT](../sims/2013_base29_dh_elgamal_source_sft.cjs).

## Independent 256-byte companions do not share the two factors

The archival [three 256-byte hidden-service candidates](../resources/cicada-hiddenservice-256-candidates.json) form an affordable cross-source discriminant. These sources have uncertain attribution, but their byte lengths match the manuscript's table exactly. Read each entire 256-byte array as the **same** row-major descending GF29 polynomial, then divide separately by the now source-fixed \(H_{2013}(X)=3+26X+24X²\) and \(G(X)=27+5X+15X²\). The exact ordered two-symbol high-to-low remainders are:

| Byte source | H remainder | G remainder |
| --- | --- | --- |
| Archived onion2 | [1, 11] | [14, 7] |
| Archived onion3 | [22, 1] | [4, 15] |
| Archived onion4 | [26, 17] | [3, 18] |
| Original printed LP2 grid | **[0, 0]** | **[0, 0]** |

For each historical 256-byte companion, the reversed whole array, 32×8 per-row horizontal mirror, and column-major byte order were also checked: **none** of these 12 source/orientation combinations is divisible by either factor. The original table itself loses both divisibilities under all three alternate orientations. This establishes that the matched algebraic factors are **specific to the original grid among the four compared byte sources and four fixed layouts**, and limits any claim that all four are instances of the same Reed–Solomon-like code. The unverified archival attribution still precludes stronger historical conclusions.

## Cheapest original-rune use of the quotient fails

As an immediate no-unknown-key inversion, take the complete derived quotient itself as an additive GP29 repeating key on all 55 original unknown rune-bearing pages: both **251 canonical** coefficients and **252 fixed-width** positions, both source orientations, both signs and book-continuous versus per-page key clocks. All **16 source-fixed complete-corpus output** symbol-equality rates remain close to a uniform 29-rune alphabet. The highest IoC is **0.0345154201**, from 251? No: from **252 positions, reversed, subtraction, page-reset**; the original ciphertext IoC is **0.0344783979**. No page-independent plaintext emerges. An adjacent-page check on physical p49/p51 at the unshifted quotient origin likewise produces no readable rune passage in the eight per-page source modes. These results retire this short repeating additive interpretation. The quotient could still be binary material or a nonlinearly transformed key. This bounded negative is separate from the exact factor identities.

## Direct page, fragment and 256-rune-window codeword gates

**Agent 12, 11 November 2026; exact original-source SFT:** [sims/lp2_grid_factors_page_fragment_sft.cjs](../sims/lp2_grid_factors_page_fragment_sft.cjs). This independently reproduces the direct page/fragment portion of Agent21's #171 closure using the same high-to-low GF(29) coefficient convention as the original 256-byte table: H=[24,26,3] from the signed 2013 BASE29 example and G=[15,5,27] from the p39 red triad.

Reading each physical page's original GP indices in printed order gives **55** rune-bearing unknown pages (p50 is rune-free). **No page passes H; only p29 passes G; no page passes both.** The p29 remainders are H **[16,20]** and G **[0,0]**. The unchanged 256-byte table remains the positive control and has zero remainder under both factors.

The fragment test uses the original-image-audited 13-dot positions in resources/liber-primus/lp2-ink-annotations.json, not the derivative transcription's large-punctuation event list. There are **31** 13-dot marks across LP2; **28** fall on unknown pp0–55 and three on solved pp56–57. The 28 unknown marks occupy **26 unique rune offsets**, with coincident marks at **1860** (the black/red p7 annotation) and **3603** (p14 end / p15 start). Preserving each mark as a cut produces **29 intervals**: **26 nonempty fragments**, all at least three runes long, and three empty intervals (the two coincident cuts and the terminal p55 mark at offset 12,956). **None of the 26 nonempty fragments is divisible by H or G.** The SFT asserts the complete source offsets, interval lengths, all page remainders, and all fragment remainders.

This confirms only the direct page/fragment codeword negative under the stated physical ordering and source-mark framing. It does not establish that the manuscript pages should be interpreted as polynomial codewords or that H/G were intended as ciphertext filters.

### All literal 256-rune windows: complete phase-free necessary-condition exclusion

A distinct fixed-width question now has an **exact all-original-input answer**. If the same historical H×G four-check GF(29) code that divides the original 256-cell table were applied directly to **any contiguous 256-rune codeword** in the 12,956-rune unknown text (in natural printed rune order), then at least one 256-rune window would have **both** quadratic remainders zero. There is no need to guess its starting phase: test every possible literal window, including those spanning printed page boundaries.

The [source-exact CommonJS gate](../sims/lp2_hg256_fullstream_allwindows_sft.cjs) checked all **12,701 overlapping 256-rune windows** with a GF(29) rolling remainder, independently comparing direct Horner residues every 257 updates. The unchanged table has **H=G=[0,0]**. The original unknown text gives **22 windows divisible by H alone, 11 divisible by G alone, and zero divisible by both**. Thus every one of the **50** natural nonoverlapping book-start blocks and all **33** eligible 256-rune physical page prefixes also fail the joint condition. At a fixed arbitrary 256-rune window under independent uniform GP29 values, dual exact divisibility has probability 1/29⁴; its expected number in this entire overlapping scan is **0.0179575**, so observing zero is unremarkable. This is an algebraically complete **direct-codeword rejection for every starting offset**, not an inference that the author never used these factors elsewhere or that there is statistically unusual absence of codewords.

A native-GP positive plant takes **252 solved p57 GP runes**, multiplies their polynomial by the unchanged source H×G and gets a **256-rune codeword with both zero remainders**; a single leading-symbol mutation fails both. The reproducer checks the pinned canonical source, 12,956-runic input, the actual plant and all window results. No alphabet/phase/source-key search, invisible normalization, synthetic plaintext claim, or language scoring is involved. **No unknown plaintext or key is recovered.** A future use of H/G must specify a distinct recoverable transform or framing before source text can be decoded.

### H/G/HG causal inverse-convolution claim (still provisional)

Agent21's #171 closure separately reports causal inverse convolution by H, G or HG on raw GP ciphertext or predecessor-difference/log15 registers, under whole-book and page-local clocks, with candidate IoCs **0.034458–0.034547**. No runnable implementation or complete seed/initial-state, zero-difference/log15, and reset convention has yet been linked. These scores remain provisional and are not used as evidence to exclude a broader inverse-filter architecture. The precise missing source input is unchanged: no authenticated instruction maps the 252 quotient slots, 256 source bytes, or GF29 syndromes to the 12,956 rune positions, or specifies a lossless frame, repeated-successor rule, literal-F treatment, carrier, key/state/nonce, and reset policy.

The reproduced direct page/fragment result and the table correction do not supply that missing mapping. Further quotient-to-text fitting remains unjustified without a source-selected bridge. See [closed #171](https://github.com/FlareZ123/liber-primus/issues/171) and the [table correction SFT](../sims/lp2_grid_dual_factor_error_corrector_sft.cjs).

## Quotient-to-DH discrete-log continuation is negative

A direct continuation of the exact 2013 bridge was tested without fitting any unknown LP2 ciphertext. After dividing the unchanged 256 table coefficients by the source-linked `BASE29 3301` factor and the DH-derived p39 factor, the exact **252-slot quotient** was paired into 126 elements of the p3 field \(\mathbb F_{29^2}\). The source-selected primitive root \(z=23-2u\) was then used to take a discrete logarithm of each field element, and every exponent was serialized as exactly two BASE29 digits. The eight natural source layouts were frozen in advance: adjacent pairs or two 126-slot half-lanes, forward or reversed quotient order, and the two coordinate orders.

As a candidate hidden table register, all eight serialized 252-rune outputs remain nonlinguistic: GP IoC spans **0.03349–0.03557** and a smoothed Latin-GP trigram score spans **−10.7252 to −10.6182**, while 252-rune native-control windows score **−7.4929 to −7.0858**. Only **36–40 of 126** discrete-log exponents fall below 256, and only **5–12** lie in printable ASCII, so the direct exponent stream also does not behave as a byte/text register.

The same eight source-derived 252-digit streams were then tested once as fixed additive GP29 keys on all **12,956 unchanged unsolved runes**, with both signs and only book-continuous versus physical-page-reset clocks: **32 complete original-input models**. The best trigram score is **−10.64621**, essentially the raw ciphertext baseline **−10.65959**, versus the 2,400-rune native control **−7.28951**; every model has IoC below **0.036**. A source-native additive plant decodes exactly. This closes the simplest `factor quotient → DH discrete log → BASE29 digits → native GP text/repeating key` route. It does not exclude a different externally specified state machine, a non-GP register, or a historically supplied session key.

Reproducer: [`sims/base29_2013_quotient_dlog_key_sft.cjs`](../sims/base29_2013_quotient_dlog_key_sft.cjs).

## Additional source-selected original-text transports: bounded negatives

The exact table factors and the p3 field invite several specific continuations. They were tested against the unchanged original p0–p55 ciphertext, not only against the 252-slot quotient.

### Nine 28-symbol section keys

The 252-slot quotient is exactly \(9\times28\). The source-visible body clock gives nine rune spans of lengths **[729, 1145, 1738, 1894, 1021, 1433, 91, 1589, 3316]**: seven internal dollar markers plus the second p33 heading at local rune offset 91. This motivates one 28-symbol quotient row per body, with literal F passed through without consuming key. All 16 fixed variants were tested: modulo-29 versus the 28-symbol non-F alphabet, forward/reverse row order, forward/reverse key order, and addition/subtraction. The best full-text IoC is only **0.0361** (raw ciphertext **0.0344784**); no plaintext appears. This rejects the direct per-body Vigenère reading, not other uses of the quotient.

A separate **exact all-secret ceiling** addresses the *static-alphabet* interpretation of the nine **original visual chapters**, without using the quotient's numeric key entries: for a continuous GP29 ciphertext predecessor-difference stream, grant each chapter its **own arbitrary 29! hidden difference-to-plaintext bijection**. The nine chapter-difference frequency vectors have per-chapter maximum counts `[38,55,78,87,47,65,82,123,20]`. Aligning every chapter histogram's sorted frequency ranks maximizes pooled index of coincidence over **all (29!)⁹ secret alphabets**, by the rearrangement inequality. The exact upper bound is **0.0359316555**; the largest possible count of any one putative plaintext rune is **595/12,956**, against independently native Shakespeare GP29 IoC **0.0595007131** and solved p57 IoC **0.0627099664**. The maximizing original-input substitution and a planted native-English cipher both completely invert in the [single-file, passing CI test](../sims/lp2_ninechapter_delta_allsecret_bound_sft.cjs). This **retires chapter-static delta substitution**, while explicitly **not** covering the *time-varying* 28-symbol Q252-row key tested below, a stateful code, or another register. [Full exact derivation and controls](lp2-ninechapter-static-delta-allsecret-ceiling.md).

#### Q252 rows on chain-step differences (original visual chapters)

This is distinct from the preceding direct per-body Vigenère test: it applies the same nine quotient rows to the conditional chain-step stream, using the **original-image visual chapters** pp0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53 and 54–55 (rune lengths **[729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]**), not the derivative nine-text spans above. The chain-state difference remains book-continuous across all chapters; only the candidate key row changes at each visual chapter. Each 28-symbol Q252 row is reduced modulo 28 and repeated over nonzero differences. The 86 zero differences are emitted as literal EA and do not consume key. Both signs and both natural first-symbol conventions (literal initial symbol, or first difference from zero) were frozen; no row/key reversal, phase, offset or alphabet fitting was used.

| Initial symbol | Sign | full-text trigram nats/rune | IoC | best 238-rune window | wrong-seed score |
| --- | ---: | ---: | ---: | ---: | ---: |
| literal | − | −14.06648 | 0.03527024 | −13.09036 | −14.06636 |
| literal | + | −14.07952 | 0.03526802 | −13.18743 | −14.07952 |
| step from zero | − | −14.07305 | 0.03527084 | −13.36289 | −14.07337 |
| step from zero | + | −14.06420 | 0.03525416 | −13.18743 | −14.06429 |

The 119,213 native-GP 238-rune control windows range from **−8.56711 to −7.43799** (median −7.90037). Even the best candidate 238-rune window (−13.09036) is far below the worst native window. The one-coefficient wrong-seed controls are indistinguishable from the proposed rows. A held-out 12,956-rune native-GP positive plant recovers exactly under all four variants. The output remains nonlinguistic in every chapter.

**Decision:** retire only this fixed Q252-row → continuous chain-step key schedule. It does not recover plaintext and does not support a second-page prediction. This does not establish or disprove the broader chain-cipher hypothesis, and it does not exclude other uses of Q252. The chain-step/EA premise itself remains conditional; see [the doublet exception-channel analysis](doublet-exception-channel.md). Reproducer: **sims/p50_q252_chain_step_key_sft.cjs**.

### Whole-p36 GF(29^238) power decoder using the 2013 DH3301 exponent: exact source-reversible negative (14 November 2026, Agent5)

**New candidate mechanism and decision.** The original table's monic, irreducible factor `Q238` defines a 238-dimensional extension field `GF(29)[X]/Q238`, and the original physical p36 contains **238 complete GP29 ciphertext runes**, one coefficient per field coordinate. The historically attested 2013 DH3301 challenge, reconciled with the original NUMBER/151 routing hypothesis, produces a *conditional* source candidate private exponent **1661**. Unlike the previously executed direct additive Q238-key or GF(29²) ElGamal trials, this tests **one whole 238-rune p36 field element as a complete source-motivated exponent-cipher message**, rather than an independent rune stream. The true source does not prescribe giant-field exponentiation, so the operator remains a proposed consumer, not an authenticated decryption instruction.

Read all original 256 table bytes as descending GF29 coefficients; divide by the exact monic source factors `(X+5)^2`, `X²+18X+11` (2013 BASE29 3301 factor), the original cubic, and the original degree-nine factor. Multiply the 239 quotient coefficients by 28 to obtain exactly the **monic degree-238 Q238**, independently matching the original [complete factorization](lp2-grid-complete-gf29-factorization.md), SHA256 of its **high-to-low** 239 byte coefficients `9cb443bed228623bbd522efcd73888d3a4870c3db0ddcc147011765f3c8a9eb3`. Interpret p36 rune indices as polynomial coefficients in either literal original reading orientation, **highest coefficient first** or **lowest coefficient first**. Use the source-conditional exponent `e=1661` directly or its multiplicative inverse modulo `29^238−1`.

A useful necessary fact is newly fixed: **gcd(1661,29^238−1)=1**. The exponent has a **1,153-bit inverse**, so both maps `x ↦ x^1661` and `x ↦ x^(1661^(−1) mod (29^238−1))` are exact automorphisms of the multiplicative cyclic group `GF(29^238)^×`; each is invertible at *every nonzero 238-rune field object*. The original p36 elements are nonzero. This makes the proposed full-page inverse mathematically serious and eliminates secret exponent-rescue ambiguity; a wrong source exponent or a different field is a different model.

| Literal full-page input order | Frozen operation | Source p36 GP29 index of coincidence |
| --- | --- | ---: |
| Source raw ciphertext | none | **0.0359890792** |
| First printed rune as highest coefficient | raise to 1661 | **0.0331170443** |
| First printed rune as highest coefficient | raise to inverse 1661 | **0.0347480764** |
| First printed rune as lowest coefficient | raise to 1661 | **0.0339325604** |
| First printed rune as lowest coefficient | raise to inverse 1661 | **0.0351735631** |

All four field outputs are full-length, nonlinguistic GP29 symbol streams. Every original output exactly reverses under its complementary exponent and restores **all 238 original runes**. An independent positive encrypts an actual known solved p57 GP plaintext segment, repeated only to the same 238-rune source length, under the same exponent and recovers all **238/238** symbols exactly; its GP29 IoC remains above 0.055, so a native-language-shaped result is detectable. The positive tests functional power inversion but cannot authenticate the source candidate. No unknown plaintext or key result is claimed.

**Decision:** Retire the direct single-message `Q238` whole-field power cipher for p36 under e=1661, both original coefficient orientations and both signs of the exponent, as a native GP29 plaintext decoder. The irreducible field and source-derived exponent are real, but neither a successful original output nor an instruction linking this full-field message to p36 has surfaced. Further exponent selection, field basis changes, or plaintext register projections require independent original-cipher evidence. [Complete original-and-positive Node22 SFT](../sims/lp2_q238_p36_gf29dh_fieldpower_sft.cjs).

### Q238 and the 238-rune p36 page

The monic irreducible factor Q238 has 238 non-leading coefficients, while physical p36 contains exactly 238 runes. Using those coefficients as a repeating key, with continuous, per-page or per-body clocks, both orientations and signs, gives a best IoC of **0.0359**. Using p36 itself as the initial 238-symbol state of an LFSR with Q238 (or its reciprocal), forward or bidirectional extension, both seed orders and signs, gives a best IoC of **0.0346**. Neither produces language. The length match is retrospective; no authenticated instruction selects p36 as a seed or Q238 as a key.

### Original-ciphertext ElGamal block transport

The p3 quadratic defines GF(29²) with u²=3u+8 and primitive u of order 840. A literal ElGamal encoding would use four GP runes per block: two for c1, two for c2, and recover a two-rune field element m=c2*c1^(-x). The source supplies the six DH 3301 private-exponent representatives **[11, 561, 1111, 1661, 2211, 2761]**; the earlier worked DH 23 example and p39 factor also motivate x=15. All seven exponents, adjacent or half-lane pairing, both coordinate orders and both directions were tested (56 models). The best IoC is **0.0346**; the best model has no zero c1, but no language signal. The 458 literal F runes leave **12,498** non-F runes, which is **not divisible by four**, so the p56-style F-interrupter cannot be combined with this four-rune block layout without an additional rule.

A simpler one-rune-per-ciphertext-pair ElGamal interpretation over GF29, after skipping F, was also tested for all seven exponent classes and both adjacent/half-lane layouts (14 models). Its best IoC is **0.0358**. This is likewise negative.

These are bounded exclusions of the stated source-motivated encodings, not evidence that the table factors are meaningless and not a complete rejection of DH-based mechanisms. The 2013 protocol-to-LP2 branch remains **underdetermined**: no source-selected state update, session-key transfer, clock and output register have been recovered.

Reproducers:
- [sims/quotient252_q238_p36_and_p55_border_sft.cjs](../sims/quotient252_q238_p36_and_p55_border_sft.cjs) — quotient rows, Q238 key and p36 LFSR seed.
- [sims/2013_dh3301_original_elgamal_block_sft.cjs](../sims/2013_dh3301_original_elgamal_block_sft.cjs) — source-derived DH exponent classes and original-text ElGamal block layouts.


## F59 derivation of the known p56 prime-2 start: source gate (Issue #151)

The equation `24^23 mod 59 = 2` is exact. It is not, however, selected as a complete operation by the contemporaneous source. The chain needs a retrospective `NUMBER` digit-reversal of p57's title sum (449→944), a factor choice (16×59), a decision to use the p15 16-cell ring as the 16 factor and the quotient 59 as modulus, the last BASE29 digit 24 as base, and the p3 root coefficient 23 as exponent. The p56 inverse's already-known prime-2 start is the target output, so the match is not a held-out prediction.

The provenance boundary is decisive: the contemporaneous 2013 Twisted witness contains the participant-built `BASE29`, `DH` and `NEXT` protocol. It does **not** contain the first-onion `NUMBER` reversal/factor grammar. That later-preserved transcript is not authenticated by the 2013 witness. The 2013 DH worked exchange is also different from the F59 expression: it uses `p=23`, `g=5`, server exponent 6/public value 8, client exponent 15/public value 19, and shared secret 2. The source therefore shows a real DH operation and an example whose shared value is 2; it does not specify a DH group with `p=59,g=24,x=23`. A single power `24^23 mod 59` is modular exponentiation, not a two-party DH exchange.

The p3/p39 red-triad correspondence with the 2013 DH example remains a distinct candidate: the existing analysis relates p3's 23/2 and p39's 5/15 values to the documented `p=23,g=5,b=15,K=2` exchange. That correspondence does not by itself instruct the solver to feed the DH shared value into the p56 prime-totient schedule, and it does not validate the F59 construction. Keep these two hypotheses separate.

Only the source-fixed alternatives were checked, not a broad search: the p3 conjugate root changes the exponent candidate to 17 (`24^17 mod 59 = 55)); the other BASE29 digits 3 and 26 give 45 and 41; using the other factor 16 as modulus gives 0, while using the ring count 16 as exponent gives 49. The documented DH example independently gives `5^6 mod23=8`, `5^15 mod23=19`, and shared key `19^6=8^15=2`. These comparisons show why the target match is exact but not uniquely selected.

**Decision:** retire `24^23 mod59=2` as an intended p56 key derivation on current evidence. The exact missing instruction is a primary-source rule that authenticates the `NUMBER` reversal/factor selection, assigns 59 as modulus, 24 as base, 23 as exponent, and maps the result 2 to the p56 prime-totient start. No such rule appears in the contemporaneous BASE29/DH/NEXT witness. Do not extend this chain to unknown pages without that selector. See [the bounded source-gate report](f59-dh-p56-key-start-source-gate.md).

## Protocol semantics, real continuation and finite literal inverse

**The historical server exercise by itself does not specify a decoder.** Each worked `BASE29 3301` and `DH 23` sequence is a public example in a server-implementation assignment. `BASE29` produces digit strings, with no instruction to turn those digit strings into polynomial coefficients, divide an original 256-cell manuscript table, or serialize a quotient as a cipher key. `DH 23` demonstrates a key-exchange session; the private client exponent **15** can be computed from this toy example, while the real server is required to choose fresh parameters and state. The post hoc quadratic bridge remains an exact cross-source correspondence with an **unidentified operation**, rather than an executable historical LP2 decipherment.

An additional [2013 participant server log](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/008-invitation/Nj8gDqFG) preserves `NEXT` followed immediately by a long PGP-signed invitation. The independent [archive summary](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/008-invitation/README.md) reproduces the invitation and identifies a second solver's signed variation. The participant log's `received1.txt` payload matches the separately archived [`do-not-share-this-information-2.asc`](https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2013/do-not-share-this-information-2.asc), SHA-256 `062886c6063b5c9c3049cf67dd9837df75bdd54d8fa73cb1b5fe25d52d227e87`, and its OpenPGP signature independently verifies under the same Cicada key. This authenticates the NEXT payload only, not the surrounding DH log. The archive explicitly cautions that the logged exchange **might be the user's own test**. It cannot establish what every player received, but it supplies a concrete, signature-verified `NEXT` payload without a quotient codec, key, or instruction to continue LP2.

An actual organizer test vector from the [preserved March 2013 server logs](https://github.com/neuroretransmit/cicada/blob/main/2013/007-fourth-onion/README.md#cicada-starts-testing) uses the request `base29 1033`; a separate full participant transcript records the response **`16I`** and then a completed `DH 3301` exchange. The pinned [source manifest](../resources/external/2013-tcp-live-test-vectors.json) distinguishes these fixed request values from the participant server's randomly selected DH base/secret. The numeral's canonical base-29 digits are **[1,6,18]**. Crucially, **1033 is also the exact magic constant obtained by prime-summing the independently preserved 2013 `0_wisdom` table into the later 2014 stage04 square**, so this was not merely an arbitrary tester number. Nevertheless, both obvious polynomial coefficient orientations fail to divide the unchanged LP2 grid polynomial: the descending coefficient vector **[1,6,18]** leaves remainder **[3,11]**, while the reversed **[18,6,1]** leaves **[24,3]**. The live test therefore strengthens historical importance of 1033/3301 while simultaneously showing that the exact grid-factor property is specific to the worked `BASE29 3301` example rather than a generic consequence of Cicada's live BASE29 test vector.

**Directly executing the only published reversible numerical codec on the existing double-divided quotient:** treat its 251 canonical GF29 digits as one big-endian base-29 numeral; serialize that numeral in the shortest unsigned big-endian base-256 representation. The result contains **153 bytes**, with first 25 bytes `04598e588f3e70d4100f40d7489f9855a468a0d950156d2acb` and last 24 `b60750b93b10d2e3df8a1aad45ad4a4ef84cfc72fc3994ec`. Exactly **57/153** bytes are printable ASCII; empirical byte entropy is approximately **6.7491 bits per byte**. The beginning has no plain English or familiar common-file header. This is an exact **conditional** serialization test. It cannot rule out encrypted or compressed bytes, and the original protocol does not prescribe this serialization, an endian convention, or a text codec.

**Decision on the 2013 protocol → LP2 quotient branch:** the preserved tester exchange supplies the source-controlled exponent class **e ≡ 11 mod 550**, and the independent field-invariant lock above conditionally selects **e = 1661**. Its simplest lossless field-power, additive BASE29, and ElGamal interpretations are negative. The missing element is now a source instruction that assigns this candidate to a different register, clock, or output codec, or evidence that the invariant lock itself was intended. The two exact zero remainders and the 1661 lock remain source-level structural correspondences rather than plaintext recovery.

**Reproduce:** `node sims/base29_2013_grid_factor_sft.cjs` from repository root (Node 22, standard libraries) asserts the 2013 digits, both exact zero remainders, the opposite-orientation failure, full 256-slot polynomial reconstruction, source red triads, 252-slot quotient, and GF29² field change.


The additional [literal-codec SFT](../sims/base29_protocol_literal_quotient_sft.cjs) tests the exact 153-byte serialization, 2013 `1033` control in both orientations, and all coefficient remainders. Run it separately with Node 22 and standard libraries.
