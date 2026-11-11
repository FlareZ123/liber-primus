# The 2013 BASE29 3301 example is an exact LP2 numerical-grid quadratic factor

**Classification (11 November 2026): exact, newly connected historical-source-to-original-manuscript polynomial identity. No unsolved LP2 plaintext, authentic encryption key or cipher reconstruction.** The equation is reproducible directly from the 2013 archival source example and the 256 original transcribed grid bytes. The interpretation as an intended solve instruction remains open.

## Previously unconnected historical input

The preserved 2013 Cicada server-programming challenge explicitly defines a `BASE29 [n]` command. Its worked example says `BASE29 3301` and answers `3QO`. This is preserved in a participant's [7 December 2013 code-and-instructions gist](https://gist.github.com/navinpai/7837596), which quotes an earlier instruction source `pastebin.com/CrRvGrkT`; the quoted challenge specifies a submission deadline of 3 February 2013. The gist contains a real server implementation using 29 digits with `0..9, A..S` as values 0..28. The particular example predates the 2014 Liber Primus release in that archive. **The quoted challenge is not independently OpenPGP authenticated here**, and an archived participant copy is a weaker source than an original signed puzzle artifact.

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

Dividing out both source-linked quadratic factors removes four formal polynomial degrees. The fixed-width 256 original slots become **252 quotient slots**; the first remains the original leading-zero slot, leaving a degree-250 polynomial with **251 canonical coefficients**. The 252-slot quotient has GP29 index of coincidence **0.0363308670**, much closer to uniform \(1/29\) than an ordinary GP-English text. Its rune transliteration is not readable plaintext. The exact quotient is therefore an actionable, source-restricted candidate **intermediate register**, not a recovered message.

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

## Source-linked field representation, with a scope warning

The physical p3 red triad \([13,23,2]\), also beginning at local rune offset 119, defines \(\mathbb F_{29}[u]\) with \(u^2=3u+8\). The p3 root \(u\) is primitive of order 840. The concrete element \(z=23-2u\) satisfies the historical quadratic **\(H_{2013}(z)=0\)**; its canonical power relative to \(u\) is \(z=u^{433}\). The log is computed by direct enumeration of the complete 840-element multiplicative cycle, and \(\gcd(433,840)=1\), so \(z\) is also primitive. Its trace and norm are each 11, matching the monic 2013 polynomial \(X^2+18X+11\).

**Independent solved-page prime selector (Agent 4, 11 November; conditional).** Solved LP2 p56 has 85 original ciphertext runes and exactly one historically verified literal-F interruption at zero-based offset 56, which consumes no prime in its authentic consecutive-prime-totient decoder. The page therefore consumes **84 primes**, ending at the **84th prime, 433**. Without using any unknown LP2 ciphertext to select an exponent, the p3 field's primitive element satisfies **u^433=23−2u**, exactly the root of the independent historical BASE29 quadratic above; its Galois conjugate is u^797=17+2u. In addition, **433 mod29=27** coincides with the p39 marked constant and the negative of the 2013 worked DH shared key 2. **The two exponents have residues 433 mod23=19 and 797 mod23=15**, exactly the 2013 worked DH client's public value 19 and recovered private exponent 15 in this order. This extra pairwise equality was checked after the exponents were known; since reducing a GF841 discrete logarithm modulo an unrelated DH modulus is an unprovided operation, it remains a source-number coincidence and is not independent evidence of encryption. This supplies a newly *source-derivable candidate* for selecting one of the two BASE29 polynomial roots. Neither the solved p56 cipher nor the 2013 server instructions tells a solver to exponentiate the p3 field generator by the final p56 key prime; that choice remains conjectural, and a coherent original plaintext would be needed to establish a decoding role.

The corresponding no-free-key coordinate-change test is fully reversible: writing z=23−2u, each two-rune pair a+bu has coordinates **(a+26b,14b)** in the (1,z) basis, with inverse **(A+23B,−2B)** mod29. On all 12,956 unchanged original unsolved runes in consecutive pairs, the forward and inverse transforms yield GP-index IoCs **0.0345182918** and **0.0345030277**, respectively, against the original **0.0344783979** and independent native GP Latin **0.0720286230**. Both exact original round trips and a 2,400-rune native control succeed; the original transformed texts remain nonlinguistic. This excludes only the literal two-rune field-coordinate transport, not source-selected field exponents operating on hidden state or non-GP intermediate symbols. [Source assertion and original-input SFT](../sims/lp2_2013_p56_prime84_field_basis_sft.cjs).

**Simplest direct DH field-multiplication inverse.** An independent source-defined operation treats each original two-rune pair as a field element and multiplies by `z^(±(p_i−1))`, with the same three full-book/physical-page clock conventions. This avoids the optional BASE29 discrete-log step entirely. Six further original-input models exactly invert and preserve all doublets; decoded IoCs are **0.03446620–0.03451914** (the actual output is uniformly rune-like), with unreadable prefixes. Hence **all twelve** literal DH/logarithm or multiplicative prime-clock direct-GP modes are negative; this does not exclude keys or states concealed in a more complex system. [Extended source-native SFT](../sims/lp2_2013_dh_prime_field_log_inverse_sft.cjs) · [verified CI run](https://github.com/FlareZ123/liber-primus/actions/runs/42951886412).

**Original-input DH discrete-log plus solved-prime clock gate (Agent 4, CI passed).** The 2013 toy DH protocol explicitly demonstrates modular exponentiation, while `BASE29` specifies numerical digit conversion. Combining these with the source-selected root `z=u^433` gives a fully lossless field codec on **all 841 possible two-rune values**: nonzero `a+bu` maps to the unique discrete logarithm `e∈[0,839]` base `z` and then two base-29 digits `(floor(e/29),e%29)`; the zero field element takes otherwise unused code `840=(28,28)`. An optional consecutive-prime exponent clock uses the known solved-p56 key form `p_i−1` modulo 840, leaving the zero sentinel unchanged. These additional steps are reasonable *candidate operations*, but their application to LP2 and the presence of this 841-state register are not historically instructed. Six complete original-input variants (two exponent signs; whole-book pairing, physical-page pairing with continued prime clock, and physical-page pairing with reset prime clock) exactly re-encode **all 12,956 ciphertext runes** and pass a 2,400-rune Latin-GP native plant plus exhaustive 841-symbol bijection tests. Original decoded IoCs range **0.03446883–0.03452567**, versus native GP **0.07202862**, and no readable original plaintext appears. The two logically separate original controls, a fixed basis change and this exponent-log clock, are therefore both negative for direct native-GP output. This does **not** reject non-GP intermediate state, alternative source-driven clocks, or a different original encoding. [Exact single-file DH/prime-clock SFT](../sims/lp2_2013_dh_prime_field_log_inverse_sft.cjs) · [manual-only CI success](https://github.com/FlareZ123/liber-primus/actions/runs/42951089036).

This gives one precise way to perform the 2013 challenge's historically mentioned **Diffie–Hellman operation** in the same 29²-element field that p3's mark independently suggests. It does **not** identify an actual exchanged exponent, a key, a mapping from quotient symbols to text, or a reason to prefer the specific affine root change \(z=23-2u\) over other field-coordinate changes. All irreducible quadratics over the same field extension admit affine root correspondences. The field isomorphism and exponent 433 alone cannot be advertised as independent statistical confirmation.

## Preserved DH 3301 tester exchange and a conditional exponent lock

A richer 2013 participant log supplies a real `DH 3301` exchange that was absent from the earlier protocol analysis. In `neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`, file `irc-logs/clientlog-1362290293-9.txt`, the participant server records:

```text
Received line: 'DH 3301'
Selected base 2757 and secret 331
Sending line: '01 OK 2757 1264'
Received line: '2800'
Sending line: '03 DATA 1067'
```

The participant implementation shown in the same archive chooses its server base and private integer with `random.randint(2, p)`. The server-side value **331 is participant randomness**. The client response is the source-controlled part of the exchange.

The multiplicative order of 2757 modulo 3301 is **550**. Solving the logged relation `2757^e ≡ 2800 (mod 3301)` gives the client exponent class **e ≡ 11 (mod 550)**. The logged shared key checks the same class because `1264^11 mod 3301 = 1067`. Restricting the private integer to 2 through 3300 gives six representatives: **[11, 561, 1111, 1661, 2211, 2761]**.

### Conditional field-invariant selector gives e = 1661

The earlier BASE29 bridge supplies the primitive p3-field root **z = 23 - 2u**, with `u^2 = 3u + 8`. Applying the six DH representatives to this independently fixed root gives six field elements. One representative is uniquely distinguished by the worked `DH 23` example:

```text
e = 1661
e mod 840 = 821
z^821 = 6 + 17u

coordinate sum mod 29     = 23
coordinate product mod 29 = 15
field trace                = 5
field norm                 = 2
```

Those four values reconstruct the worked example without using unknown LP2 ciphertext: modulus **23**, recovered client private exponent **15**, generator **5**, and shared key **2**. The first coordinate **6** is also the recovered worked-example server private exponent. From these values, `5^6 mod 23 = 8` and `5^15 mod 23 = 19`, reproducing both public shares.

Among the six representatives, **1661 is the only one** satisfying all four displayed invariant equalities. Equivalently, the real `DH 3301` transcript gives `e ≡ 11 mod 550`, while the field embedding gives `e ≡ 821 mod 840`; the compatible class is **e ≡ 1661 mod 46200**. In the ordinary DH range below 3301 this selects **1661** exactly.

This is a strong cross-source key candidate because the selector uses only pre-existing source values and canonical field operations. It is still **conditional**: no surviving Cicada instruction says to compare coordinate sum/product and field trace/norm in this way. The match is therefore a locked structural hypothesis rather than an authenticated key instruction.

### Direct uses of the selected exponent are negative

In the p3 field, the selected exponent is **821 mod 840** and its multiplicative inverse is **221**. Applying `x -> x^221` to every original unknown LP2 two-rune field pair remains ciphertext-like. Whole-book pairing scores **IoC 0.03448013, trigram -11.06994 nats/rune**; physical-page pairing scores **0.03450286, -11.06752**. The raw ciphertext baseline is **0.03447840, -11.07314**, while held-out native GP reference is **0.06512502, -8.41667**.

The selected private integer has canonical BASE29 digits **[1, 28, 8]**. Repeating those three digits as an additive GP key, under both signs and book/page clocks, gives IoC **0.03449756 to 0.03450691** and trigram **-11.08220 to -11.06720**. No native plaintext appears.

A literal standard ElGamal interpretation also fails. On the whole unknown rune stream grouped as two field elements per block, one of 3,239 first components is zero, so the direct full-book ElGamal model is invalid. On the exact 252-slot table quotient, all 63 first components are nonzero, but decrypting with private exponent 821 gives a 126-rune output with **IoC 0.03403175** and **trigram -11.08247**; only **22 of 63** coordinate integers fall in byte range and **7** are printable ASCII.

For the broader exponent class, the six representatives reduce modulo 840 to **[11, 561, 271, 821, 531, 241]**. The 561 and 531 maps are non-bijective on the nonzero field because their gcd with 840 is 3. The other four exact inverses were all tested on original ciphertext and the table quotient, and all remain nonlinguistic. Native-GP power-map plants recover exactly.

A separate inbound-only log contains the client value **3034** after `DH 3301`. Arithmetic gives `5^11 ≡ 3034 (mod 3301)`, and both 5 and 3034 have multiplicative order **75** modulo 3301. The server response is absent, so base 5 is unestablished for that exchange. This order-75 relation is retained only as a conditional observation and is not used to select the decoder.

**Decision:** the 2013 material now yields a sharply constrained **conditional exponent candidate 1661** through an independent field-invariant lock. Its simplest direct power, BASE29-additive, and ElGamal uses all fail on original LP2 data. The candidate remains valuable as possible key material for a separately specified register or state machine. More arbitrary field bases, clocks, or mappings are not justified without another source instruction or a withheld prediction.

Reproducer: [`sims/2013_dh3301_tester11_source_sft.cjs`](../sims/2013_dh3301_tester11_source_sft.cjs).

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

## Quotient-to-DH discrete-log continuation is negative

A direct continuation of the exact 2013 bridge was tested without fitting any unknown LP2 ciphertext. After dividing the unchanged 256 table coefficients by the source-linked `BASE29 3301` factor and the DH-derived p39 factor, the exact **252-slot quotient** was paired into 126 elements of the p3 field \(\mathbb F_{29^2}\). The source-selected primitive root \(z=23-2u\) was then used to take a discrete logarithm of each field element, and every exponent was serialized as exactly two BASE29 digits. The eight natural source layouts were frozen in advance: adjacent pairs or two 126-slot half-lanes, forward or reversed quotient order, and the two coordinate orders.

As a candidate hidden table register, all eight serialized 252-rune outputs remain nonlinguistic: GP IoC spans **0.03349–0.03557** and a smoothed Latin-GP trigram score spans **−10.7252 to −10.6182**, while 252-rune native-control windows score **−7.4929 to −7.0858**. Only **36–40 of 126** discrete-log exponents fall below 256, and only **5–12** lie in printable ASCII, so the direct exponent stream also does not behave as a byte/text register.

The same eight source-derived 252-digit streams were then tested once as fixed additive GP29 keys on all **12,956 unchanged unsolved runes**, with both signs and only book-continuous versus physical-page-reset clocks: **32 complete original-input models**. The best trigram score is **−10.64621**, essentially the raw ciphertext baseline **−10.65959**, versus the 2,400-rune native control **−7.28951**; every model has IoC below **0.036**. A source-native additive plant decodes exactly. This closes the simplest `factor quotient → DH discrete log → BASE29 digits → native GP text/repeating key` route. It does not exclude a different externally specified state machine, a non-GP register, or a historically supplied session key.

Reproducer: [`sims/base29_2013_quotient_dlog_key_sft.cjs`](../sims/base29_2013_quotient_dlog_key_sft.cjs).

## Protocol semantics, real continuation and finite literal inverse

**The historical server exercise by itself does not specify a decoder.** Each worked `BASE29 3301` and `DH 23` sequence is a public example in a server-implementation assignment. `BASE29` produces digit strings, with no instruction to turn those digit strings into polynomial coefficients, divide an original 256-cell manuscript table, or serialize a quotient as a cipher key. `DH 23` demonstrates a key-exchange session; the private client exponent **15** can be computed from this toy example, while the real server is required to choose fresh parameters and state. The post hoc quadratic bridge remains an exact cross-source correspondence with an **unidentified operation**, rather than an executable historical LP2 decipherment.

An additional [2013 participant server log](https://github.com/neuroretransmit/cicada/blob/main/2013/008-invitation/Nj8gDqFG) preserves `NEXT` followed immediately by a long PGP-signed invitation. The independent [archive summary](https://github.com/neuroretransmit/cicada/blob/main/2013/008-invitation/README.md) reproduces the invitation and identifies a second solver's signed variation. Its content describes a recruitment endpoint, privacy principles and encrypted replies, including a statement that no further hidden codes are planned in that track. The archive explicitly cautions that the logged exchange **might be the user's own test**, and the material has not been independently signature-verified in this study. It cannot establish what every player received, but it supplies a concrete, surviving `NEXT` payload **without** a quotient codec, key, or instruction to continue LP2.

An actual organizer test vector from the [preserved March 2013 server logs](https://github.com/neuroretransmit/cicada/blob/main/2013/007-fourth-onion/README.md#cicada-starts-testing) uses the request `base29 1033`; a separate full participant transcript records the response **`16I`** and then a completed `DH 3301` exchange. The pinned [source manifest](../resources/external/2013-tcp-live-test-vectors.json) distinguishes these fixed request values from the participant server's randomly selected DH base/secret. The numeral's canonical base-29 digits are **[1,6,18]**. Crucially, **1033 is also the exact magic constant obtained by prime-summing the independently preserved 2013 `0_wisdom` table into the later 2014 stage04 square**, so this was not merely an arbitrary tester number. Nevertheless, both obvious polynomial coefficient orientations fail to divide the unchanged LP2 grid polynomial: the descending coefficient vector **[1,6,18]** leaves remainder **[3,11]**, while the reversed **[18,6,1]** leaves **[24,3]**. The live test therefore strengthens historical importance of 1033/3301 while simultaneously showing that the exact grid-factor property is specific to the worked `BASE29 3301` example rather than a generic consequence of Cicada's live BASE29 test vector.

**Directly executing the only published reversible numerical codec on the existing double-divided quotient:** treat its 251 canonical GF29 digits as one big-endian base-29 numeral; serialize that numeral in the shortest unsigned big-endian base-256 representation. The result contains **153 bytes**, with first 25 bytes `04598e588f3e70d4100f40d7489f9855a468a0d950156d2acb` and last 24 `b60750b93b10d2e3df8a1aad45ad4a4ef84cfc72fc3994ec`. Exactly **57/153** bytes are printable ASCII; empirical byte entropy is approximately **6.7491 bits per byte**. The beginning has no plain English or familiar common-file header. This is an exact **conditional** serialization test. It cannot rule out encrypted or compressed bytes, and the original protocol does not prescribe this serialization, an endian convention, or a text codec.

**Decision on the 2013 protocol → LP2 quotient branch:** the preserved tester exchange supplies the source-controlled exponent class **e ≡ 11 mod 550**, and the independent field-invariant lock above conditionally selects **e = 1661**. Its simplest lossless field-power, additive BASE29, and ElGamal interpretations are negative. The missing element is now a source instruction that assigns this candidate to a different register, clock, or output codec, or evidence that the invariant lock itself was intended. The two exact zero remainders and the 1661 lock remain source-level structural correspondences rather than plaintext recovery.

**Reproduce:** `node sims/base29_2013_grid_factor_sft.cjs` from repository root (Node 22, standard libraries) asserts the 2013 digits, both exact zero remainders, the opposite-orientation failure, full 256-slot polynomial reconstruction, source red triads, 252-slot quotient, and GF29² field change.


The additional [literal-codec SFT](../sims/base29_protocol_literal_quotient_sft.cjs) tests the exact 153-byte serialization, 2013 `1033` control in both orientations, and all coefficient remainders. Run it separately with Node 22 and standard libraries.
