# P55 SHED arithmetic: 43-rune interior is eight times a prime; 32-rune circumference is divisible by 43

**Agent1, 23 November 2026. Classification: exact original-source arithmetic and a source-motivated candidate for a prime parameter. There is no recovered unknown-page plaintext, creator-selected decipherment key, or demonstrated downstream receiver.**

## The human-visible proposal

The solved p57 closing parable instructs the reader to shed circumferences and find divinity within. This motivates a literal word-local operation on the immediately preceding unsolved terminal page p55 (original 72.jpg): discard each complete word's first and last rune, retaining its middle. The 2013 Cicada BASE29 transport and the original Gematria Primus index order motivate reading the resulting runes as left-to-right base-29 digits 0–28. The first printed p55 single-rune fragment is a **carry from p54** and is excluded: it is not a complete p55 word.

Exactly **16 complete p55 words** supply **43 interior runes** and **32 circumference runes**, from 75 page-local runes after excluding the one-rune carry. The source has 76 p55 runes total. The GP0 indices of the interior, as independently regenerated from the full original transcription, are:

~~~
19 10 12 6 23 2 27 24 17 5 28 0 14 10 19 1 5 13 8 21 20 15
23 27 13 8 12 18 10 6 14 6 15 12 2 2 18 28 10 19 5 11 18
~~~

The GP0 sum is **576**. The 43-digit left-to-right base29 integer is:

~~~
N = 510043531279477768552291351270111060625364732293226050492113768
  = 8 × 63755441409934721069036418908763882578170591536653256311514221
  = 8 × P
~~~

**P is a mathematically certified 206-bit prime.** The accompanying single-file Node22 SFT includes a complete 42-node Lucas-Pratt witness tree and verifies that each witness's factors recursively prove the prime. The top-level witness is generator 2 with complete factorization:

~~~
P−1 = 2² × 5 × 41 × 49477 × 15535963
      × 101149063843788281988908603592862658065019147521
~~~

The extraction is also **exactly reversible as a numeric-payload codec under the declared word layout**. Starting from P and Q, compute the original source integers N=8P and E=43Q; expand to 43 and 32 zero-padded GP0 base29 digits, respectively; then, for each of the 16 printed word lengths, weave one E digit, the next length−2 N digits and the next E digit. This reconstructs **all 75 original complete-word runes and every original p55 word boundary exactly**, leaving the known one-rune p54 carry untouched. The Windows SFT asserts this literal full-packet forward replay. Reversibility establishes a valid serialization of these *numbers*; it cannot identify the integers as author-intended plaintext because arbitrary divisible N/E have the same property.

The 32 boundary runes, taken as first, last for each original complete word in printed order, form a second base29 integer:

~~~
E = 54546906948733185277568038540584540814742666891
  = 43 × 1268532719737981052966698570711268391040527137
~~~

Thus the removed circumference's integer is divisible by exactly the **43-rune interior count**. The quotient Q = E/43 happens also to be a **primitive root modulo P**, as directly proved using the complete factorization of P−1 in the primality certificate. This property has substantial natural base rate: φ(P−1)/(P−1) ≈ **0.390236**, so it adds a possible finite-field generator without supplying strong independent authorship evidence. The 2016 independently authenticated signed clue contains 43 natural-language words; the common number43 is a possible route cue, without selecting a specific cipher operation. The factor8 also equals the public DH value A=8 in a previously studied p28 worked example, but a **direct transplant of the original worked-example group (g=5, A=8) to modulus P is mathematically impossible**. Specifically P ≡ 5 (mod 8), 5 is a quadratic residue modulo P, and 8 is a quadratic nonresidue. Thus no exponent a satisfies 5^a ≡ 8 (mod P). This falsifies the most immediate source-derived DH interpretation without relying on plaintext or chosen parameters. A different creator-specified group/operand would still require first-party evidence.

## Physical-page versus full-word seam: a material rival

**The prime/generator reading depends on ending the SHED operation at complete words wholly printed on p55.** The first p55 rune `ᛝ` is the last glyph of a genuine **11-rune word crossing the p54→p55 physical page break**: concatenate p54's final ten runes `ᚷᚩᛏᚦᛉᛖᛠᚱᚷᚣ` with the leading `ᛝ`. It cannot be treated as a standalone complete word. Restricting the operation to 16 complete p55-local words is visually natural, but a reader might instead **reconstruct all 17 complete whole words ending on p55**, including this crossing word.

Under that independently legitimate, whole-word SHED parse, there are **52** interior runes and **34** boundary runes. Its GP0-forward interior BASE29 integer is **divisible by 3, 7, and 13** and is **1 mod8**; its odd cofactor is therefore composite, losing the `N=8P` property. Its shell integer is **15 mod43** and **30 mod52**, losing the original 43-divisibility. The SFT asserts each equality on original transcription. Original source JPEGs `71.jpg` and `72.jpg` strengthen the rival: p54 opens with a large red chapter rubric, whereas p55 repeats the same side vines and ends in a red 13-dot terminal mark, without a new red start rubric at the physical page seam. The alternative should thus be regarded as a serious **chapter-continuity** interpretation. This is a **decisive missing selector**: p57 says to shed circumferences but does not unambiguously instruct the solver to discard the word that crosses into p55. Until a first-party page-local receiver or explicit skip rule is found, the 206-bit prime is **a conditional geometric observation rather than authenticated key material**. Avoid using this observation to claim plaintext or overstate the 16/200000 exploratory test.

## Original-input controls

The extraction is defined on the original p55 physical text, preserving every rune and original word boundary. The source code embeds the verbatim 76-rune p55 text and, in a checkout, checks it against resources/liber-primus/lp2-transcription.txt.

Using the same page-local physical-word interior extraction and the same GP0-forward numeral rule on **all 57 rune-bearing physical LP2 pages** (55 unsolved and solved p56–57) yields exactly **one** page whose base29 interior number has a prime odd cofactor: **p55**. This is a family-specific, post-discovery control. Other page word fragments crossing page boundaries are treated as physical fragments, so this census is not a claim about every conceivable canonical whole-word segmentation.

For p55, three natural alternative readout conventions do not reproduce the prime: GP0 reversed has three factors of two but composite odd cofactor; GP1 forward and reverse give odd composite integers. The GP0 forward operation is independently motivated by the original BASE29 convention.

A finite **200,000-trial matched null** permutes the sixteen genuine p55 complete words as intact units. Every trial preserves each word's actual first/interior/last runes and the entire source word multiset, while reordering the words. The committed SFT uses seeded Mulberry32, seed 0x3301A855:

| Predicate | Matched permutations |
| --- | ---: |
| E ≡ 0 (mod 43) | 4,592 / 200,000 |
| N = 8 × probable prime | 806 / 200,000 |
| **Both simultaneously** | **16 / 200,000** |

A second independent 200,000-trial Python Mersenne-Twister word-permutation control with the same literal seed gives 4,607 / 793 / 18, respectively. These are descriptive conditional frequencies under the disclosed null and are **not an unconditional discovery p-value**. The extraction, radix, direction, small factor8, shell divisor43 and source association were recognized through exploratory analysis. Searching many original numerical/word structures can produce isolated rare arithmetic relationships.

## Interpretation and missing cipher

There is a compact potential player action: solved **SHED** clue → complete p55 word interiors → standard original BASE29 reading → a directly checkable 206-bit prime, with circumference integer independently carrying the number43. This is more operationally specific than a generic p55 prime-sum coincidence, but it **does not yet decode a rune**. A creator-authored rule must still explain why one should factor out eight, what the resulting prime is for, and how the circumference's 43 divisor directs an actual receiver. The 2013/2016 references and any interpretation as a DH key remain conjectural.

### One fully specified conditional DH computation and a finite consumer gate

The signed 2013 Cicada DH example supplies a historical operation grammar, and the original p55 SHED extraction supplies four numerically typed quantities **without fitting any output**: field prime p=P=N/8; field generator g=Q=E/43 (proven primitive in GF(P)); putative private exponents a=8 and b=43 (the two visible exact division factors). The standard DH shared secret is therefore **fully calculable**:

~~~
S = g^(a*b) mod p = Q^344 mod P
  = 40058585108914257367732574161222353642573409865793191134873737
~~~

S is a 205-bit integer requiring 43 GP29 digits. This is a **conditional source-derived shared-secret candidate**, subject to the unsupported premise that a,b should be the two extracted factors and p55 was designed to invoke a new DH exchange. Its standard cryptographic computation is reproducible and reversible at the key-agreement level, but no first-party clue specifies a KDF, rune-cipher mode, ciphertext receiver, key clock, or how to use S as an output key. A fully secret arbitrary discrete-log solution is unnecessary under the simple a=8,b=43 hypothesis; the historical live DH source supplies no accompanying payload cipher.

Freeze the simplest additive GP29 use of the 43 base29 digits of S as a repeating page-local p55 key, starting with the first physical p55 rune. The direct original inverse has **IoC .03578947** for subtraction and **.03824561** for addition; the unmodified p55 ciphertext is **.03789474**. Neither yields coherent GP-native words. A further natural *totient-exponent* proposal, selected by prime P and integer43, treats every 42-rune source block as one BASE29 integer and raises it to the 43rd power or the inverse exponent 43^(−1) mod φ(P). Since **29^42 < P < 29^43**, 42 is the maximum guaranteed in-range source-block width. On the original p54–55 308-rune contiguous chapter, **4/7 forward 43rd-power** and **5/7 inverse-power** outputs exceed the 42-digit GP29 register. Neither raw map is a complete 42-rune-to-42-rune cipher without a further source-selected framing or cycle-walking rule. The entire terminal chapter remains encrypted.

The next genuinely typed receiver is the original p50 panel, whose 32×8 printed base60-looking cells yield exactly 256 provisional byte values. The field P,Q supplies a concrete public transformation without fitting unknown rune letters: for each literal byte `b`, calculate `k_b=Q^b mod P mod29`, then subtract `k_b` from the corresponding original GP29 ciphertext rune. The simple as-printed, zero-phase, forward rule decodes all **66 original p49 runes before the table** (IoC **0.03449883**) and the first **256 unchanged runes after the table, beginning at p51** (IoC **0.03458946**). Both remain effectively uniform and nonprose. Exact GP29 inverse replay holds for all 322 original receiver runes and a full native-GP 256-rune plant. This rejects the *direct small-exponent field-key operand* while preserving the independent 256-cell and conditional SHED geometric facts.

The complete **p55-factor DH shared secret** `S=Q^344 mod P` used as SHA-256-derived AES-256 key for the p50 bytes was **already tested independently** by Agent11 and fully replayed with both printed radix60 and f-omitted base59 by Agent30. Its failed CTR byte receiver and literal key `40c0a1166d98e3cd7bfed42ed8540b8d67edc6ffbbf1636a7b95c5d8cec0e284` are established prior negatives, not a new route discovered here: see [the pre-existing complete original AES-CTR source decision](lp2-p55-sharedprime-p50-aes256ctr-original-decision.md) and [its original Windows pass 45116624896](https://github.com/FlareZ123/liber-primus/actions/runs/45116624896). The present SFT independently replays this already-known radix60 AES-CTR case, plus CBC/ECB regression controls on the same source key, without counting it as progress toward plaintext.

A **different source-typed DH exponent handoff** is now tested separately: original p28 has the manuscript's single literal `DH` line, from which a published conditional source reconstruction recovers the historical miniature DH tuple `p=23, g=5, a=6, b=15, A=8, B=19, K=2` ([p28 reconstruction](lp2-p28-dh-crossmod-chain-audit.md)). Keep **only** its private exponents `a=6,b=15` and replace that tiny demonstration's field with the prospective p55 `p=P,g=Q`, producing the **independently fixed** shared value

~~~
S90 = Q^(6×15) mod P
    = 63337863704637604097047186544219358522514145600880876704658494
SHA256(S90 as 26 big-endian bytes)
    = 57c94dfd0a2fc062ba3a6a9e4ec8e0d9e56a746ffec770a255c1a3ab9528453f
~~~

Decrypt the **same entire original 256-byte** row-major radix60 table with this p28-transplanted key and the same fixed AES-256 zero-IV/zero-counter modes, leaving all bytes unchanged. CTR gives **109/256 printable ASCII** and **30/256 direct GP29 ordinal bytes**; CBC **98/256 and 32/256**; ECB **105/256 and 28/256**. Every output is binary-like and lacks sustained source-style plaintext or a recognizable file header; true original ciphertext forward replay and planted 256-byte text recovery are exact under all three ciphers. Original-source numerical conditions and this complete test are implemented in [the combined read-only CommonJS SFT](../sims/lp2_p55_p50_dhfield_direct_consumers_sft.cjs). The p28-to-p55 field transfer, SHA-256 KDF, AES choice and table recipient are *not authored instructions*, and the p54-p55 physical-word seam objection remains fundamental.

These checks locate no authenticated cipher, key, plaintext, or destination. The new, decision-changing work is confined to the field exponent's **direct rune receiver** and the p28-private-exponent variant; avoid duplicate follow-up testing of the already published p55-factor AES-CTR branch.

The previously discussed assignment g=2,A=8 gives a trivial private exponent3 with B=Q but also lacks an independently selected consumer. Direct historical g=5,A=8 is mathematically impossible for P by quadratic characters. These tests narrow specific operators and do not rule out an intended use of P and Q in another mechanism.

### Direct genuine p56 cipher transfer with candidate 206-bit starting prime: strict F-obstruction

The **known actual p56 decryption** subtracts successive prime totients in GP29 and transmits a plaintext `F` *literally*, without advancing that prime clock. A direct and visually motivated continuation asks whether the p55 page-local `N=8P` source prime can become the first prime of that established algorithm, followed by actual consecutive primes above P. This is a distinct input from prior [authentic first-prime-2 transfer](p55-phi-prime-43-interior-gate.md) and requires **no invented new cipher type**. The strongest rival remains that the p55 206-bit prime itself depends on an unjustified physical-page versus complete-crossing-word choice; there is no first-party instruction selecting P as the cipher's next prime.

The **source-exact, cipher-valid inversion fails deterministically**, independently of English recognition or any unknown key. Under p56's true F-transparency, a ciphertext rune other than `F` must decrypt to a plaintext rune other than `F`. Before the first observed ciphertext `F`, no skip decision exists, so the totient key clock is uniquely determined. The first seven successive candidate key digits `(nextprime(P+i)-1) mod29`, where `i` indexes consecutive primes rather than consecutive integers, are **[23,12,10,3,5,16,17]**.

| Unmodified original receiver and page-start convention | First forced contradiction | Original non-F ciphertext index | Exact matching key index | Reason |
| --- | ---: | ---: | ---: | --- |
| All p0 physical runes, start at p0 first rune | Zero-based rune **3**, fourth glyph | **3** | **3** | Must decode to forbidden plaintext F |
| All p55 physical runes including one carried rune, start at p55 first rune | Zero-based rune **6**, seventh glyph | **17** | **17** | Must decode to forbidden plaintext F |
| All 75 p55 complete-word body runes, exclude carried first rune and restart | Body zero-based rune **2**, third glyph | **10** | **10** | Must decode to forbidden plaintext F |

In each row **every preceding rune is non-F**, so neither a preceding skip nor any choice about a later F can repair this contradiction. This excludes the complete authentic p56-style transparent-F cipher with **P as the initial source prime** on each of these three physically well-defined receiver starts. It does **not** exclude another source-selected prime start, a new cipher with different F semantics, or an earlier hidden prime offset.

For completeness, the same test exhausts **all 2¹⁴ = 16,384** hypothetical F-consumption masks on p0 and **all 2³ = 8** on physical p55, even allowing the masks to violate genuine F transparency. The best overpermissive arithmetic-only GP29 IoCs are respectively **0.04357872** and **0.04105263**, with **zero** outputs reaching 0.045. Such masks are *invalid p56 encryptions* once they force an untransmitted plaintext F; those descriptive IoCs are secondary and must not replace the strict early contradiction.

A narrower genuinely different recipient survives the *formal* rune-legality gate: extract only the original **43 strict p55 interiors**, starting the prime clock at their first position. Its single source-valid F history consumes the interior ciphertext F as an ordinary encrypted non-F at compacted offset11. The complete deterministic output is

```text
AE IA TH O E S I Y AE J T G Y M U X X NG S R E R R O OE U H I M E OE I R E M N N E I A A G J
```

with GP29 IoC **0.0398671096**, no recovered native prose and no authored instruction to treat the shell's removal as a stand-alone short ciphertext. This is a limited negative language observation for 43 runes, not a mathematical no-go for all possible compacted-interior ciphers.

The [single-file read-only CJS SFT](../sims/lp2_p55_prime206_p56_totient_start_original_sft.cjs) regenerates P from all 16 exact original p55 complete-word interiors; generates **280** 206-bit consecutive probable primes whose entire ordered list and GP29 key stream were independently calculated using SymPy 1.14; asserts all three forced contradictions, both complete F-mask enumerations, the valid 43-rune interior, full original arithmetic replay and a solved-GP plaintext positive. **[Windows Node22 PASS 45120800113](https://github.com/FlareZ123/liber-primus/actions/runs/45120800113)**. No original unknown plaintext, authentic key schedule or final continuation was recovered. The decisive next input would be an author-authenticated operation or first-prime selector, rather than a tuned restart.

### Bounded secondary-prime RSA consumer of the original eight-column table

A separate, highly conditional arithmetic route uses the **original 32 circumference runes** and terminal **13-dot mark** to divide `Q−1` by `32×13²`, obtaining `H=234565961490011289379936865885959391834417`, a 138-bit probable prime (24-round test). The division is exact, and `P×H` is 343 bits; the global Cicada numeral `3301` is a valid RSA public exponent because it is coprime to `(P−1)(H−1)`. **Important source objection:** the terminal mark shows 13 dots, while squaring that number and choosing `Q−1` are postulated operations with no independent creator instruction; the observed primality may be a post-selection effect.

Frozen direct recipient: the original p50 32×8 printed grid has **eight 32-byte columns** in its native visual arrangement under either printed radix60 or f-omitted radix59. Read each whole 32-byte column as a big-endian RSA ciphertext (all sixteen are smaller than `P×H`), decrypt with `d=3301^(−1) mod ((P−1)(H−1))`, and render each as a 43-byte zero-padded message. Every original column has exact native RSA ciphertext re-encryption, and a synthetic 33-byte plaintext plant also recovers exactly. Across both original radix readings **none** of the 16 outputs gives readable text or a file header; their per-column printable-byte counts are **6–21/43**. This rejects the specific, source-typed textbook RSA→p50-columns receiver even though the underlying arithmetic remains exact. No source-authored RSA role, unknown text, key, or destination was recovered. [Read-only Windows Node22 original-input SFT](../sims/lp2_p55_32_13square_rsa8column_original_sft.cjs), [Windows PASS 45122796802](https://github.com/FlareZ123/liber-primus/actions/runs/45122796802).

### Conditional shell-as-public-value: exact small-subgroup discrete log

A distinct, more demanding DH reading treats the original **entire exterior integer E** as a public value rather than merely as a multiple of the candidate generator Q=E/43. This would require a private exponent x satisfying Q^x ≡ E (mod P). In the group already certified by the source-core prime, the complete known group-order factorization is

```text
P-1 = 4 × 5 × 41 × 49477 × 15535963
      × 101149063843788281988908603592862658065019147521
    = 630311729907820 × 101149063843788281988908603592862658065019147521
```

The final factor is a **157-bit prime**; the smaller factors together form an exact **50-bit modulus M=630311729907820**. Running deterministic baby-step/giant-step on the five projected subgroups, followed by the Chinese remainder theorem, recovers the unique conditional residue

```text
x ≡ 2       (mod 4)
x ≡ 0       (mod 5)
x ≡ 40      (mod 41)
x ≡ 700     (mod 49477)
x ≡ 8516536 (mod 15535963)

x ≡ 483581994079670 (mod 630311729907820).
```

All five original-field exponentiation identities and their CRT reconstruction are exact, checked directly against the unchanged p55 SHED-core and exterior GP0 streams. This rules out **every proposed nonnegative private exponent smaller than 483581994079670**, including the natural source numerals 8, 13, 23, 43, 76, 344, 1033 and 3301, **if and only if** E was intended as the DH public value for generator Q. The mere multiplicative relation E=43Q does not imply a small discrete logarithm. The 50-bit partial log's 11-digit canonical GP0 reading is `URNMIAWIAEOEAEU`, with no independently recognizable plaintext. The complete exponent remains undetermined modulo the 157-bit factor, and neither original cipher receiver nor author-selected DH invocation exists.

[Read-only single-file Windows-compatible Node22 SFT](../sims/lp2_p55_shed_partial_dlog_sft.cjs) derives the numbers directly from the canonical embedded p55 physical transcription, verifies Q's factor-order tests, solves each small subgroup, and independently exponentiates the CRT result. This is an arithmetic **conditional negative** for short-exponent interpretations and a possible future key-recovery component, not a recovered manuscript plaintext or evidence of an actual Cicada encryption method.

**New bounded first-party exponent-source decision (same fixed 43-word test previously used by Agent11 for the distinct public8 hypothesis).** The authenticated 2016 Cicada message has exactly 43 natural-language words, matching the p55 43-rune core. Encode each signed message word by one of seven literal GP29/Latin selectors: first GP0 rune, last GP0 rune, GP0 sum, GP-prime sum, GP rune-token length, first Latin A0, last Latin A0. In both forward and reverse word order there are **14 unambiguously specified 43-digit BASE29 candidate private exponents**. All **14/14** fail the exact necessary `x mod630311729907820=483581994079670` condition; hence none can produce original public E under Q, independent of unknown 157-bit group exponent. Also, the entire original pp0–55 unknown rune stream's GP-prime weights sum to only **668,182**, so any nonnegative cumulative source-prime sum bounded by the whole book cannot be this public E private exponent. These exact negatives rule out the fourteen frozen literal signed-word constructors and small additive source exponents, subject to this **hypothetical public E reading**; they do not exclude a larger BASE29 source exponent, an unrelated DH public value, or an unspecified coding operation. The amended [source-embedded Node22 SFT](../sims/lp2_p55_shed_partial_dlog_sft.cjs) verifies both gates against first-party historical files and an independent corpus transcription, including all 56 unknown pages. Nothing identifies a cipher recipient or plaintext.

The next decisive experiment should seek a first-party, independently selected **consumer of P and E/43** that converts one original p54–55 ciphertext segment to sustained intelligible plaintext, with an exact reversible map and an untouched holdout. Test a historical, concrete algorithm supplied by the puzzle rather than fitting arbitrary modular exponentiation, hashes, key offsets, or ciphertext word addresses after the fact. If no such consumer emerges, retain this as a candidate mathematical signal with substantial look-elsewhere risk.

## Reproduction

Execute the read-only SFT:

~~~text
node sims/lp2_p55_shed_prime_shell_sft.cjs
~~~

The source SFT completed successfully on the repository's **Windows/Node 22** manual runner, [Actions run 45113929740](https://github.com/FlareZ123/liber-primus/actions/runs/45113929740), including the independent original-tape p55 cross-check and the all-57-page census. The test reconstructs the two integers from the original runes, verifies the complete Pratt prime certificate, checks both source readout alternatives, runs the frozen word-permutation null, and, when executed inside a repository checkout, scans all 57 rune-bearing pages for independent controls. The source transcript and first-party message are at resources/liber-primus/lp2-transcription.txt and resources/historical/cicada2016-4gq25-outguess.asc. No novel plaintext is asserted.
