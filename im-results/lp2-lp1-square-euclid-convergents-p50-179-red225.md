# LP1 magic-square Euclid/continued-fraction bridge to LP2 p28, p53, red 225 and p50

**Agent20, 21 November 2026. Classification: new exact cross-release mathematical linkage and candidate solve-path selector; no recovered unknown-page plaintext, general cipher or destination.** Original-source Windows Node22 [SFT](../sims/lp2_lp1_square_euclid_dh23_p28_sft.cjs) **PASS** [run 44944459934](https://github.com/FlareZ123/liber-primus/actions/runs/44944459934). The source values and downstream numerical matches are independently reproducible. The continued-fraction operator and field assignments were noticed after several destination numbers were already known; they remain *retrospective*, never a prospective authorial proof or a post-hoc probability.

## Source-origin hypothesis: two solved first-release squares as mathematical input

Original solved first-release physical p5 (SOME WISDOM) has a 5×5 number square whose five rows and columns each sum to **1033**. Original solved physical p16 has a distinct 5×5 square whose rows and columns each sum to **3301**. The numbers are distinct four-digit primes and decimal reversals, providing a player-visible reason to compare them. The 2014 original-source OpenPuff v4.00 extraction of the 745-byte `magicsquares.txt` used the exact historical password **`33011033`**: the larger total comes first, then the smaller one. That successful byte-exact extraction independently authenticates **both the ordered pair and its juxtaposition**, before any continued-fraction interpretation ([original 2014 carrier/password extraction and proof](openpuff-jpeg-capacity-gate.md), [Windows CI 43662139707](https://github.com/FlareZ123/liber-primus/actions/runs/43662139707)). The two magic-square totals also encode an already-used 2014 password, making deliberate *pairing* established; the password itself is not evidence that the author later intended RSA or continued fractions. The original p5 text explicitly emphasizes primes and the totient function, making the Euclidean algorithm a mathematically motivated, inexpensive operation to consider. That emphasis does **not** specifically instruct continued fractions.

Ordinary Euclidean division, larger source number first, gives:

```text
3301 = 3·1033 + 202
1033 = 5·202  + 23
 202 = 8·23   + 18
  23 = 1·18   + 5
  18 = 3·5    + 3
   5 = 1·3    + 2
   3 = 1·2    + 1
   2 = 2·1    + 0
```

The full regular continued fraction is `3301/1033=[3;5,8,1,3,1,1,2]`. Its *exact*, unreordered convergents are:

| n (zero based) | quotient | numerator | denominator |
| ---: | ---: | ---: | ---: |
| 0 | 3 | 3 | 1 |
| 1 | 5 | 16 | 5 |
| 2 | 8 | 131 | 41 |
| 3 | 1 | 147 | 46 |
| **4** | **3** | **572** | **179** |
| **5** | **1** | **719** | **225** |
| 6 | 1 | 1291 | 404 |
| 7 | 2 | 3301 | 1033 |

**New cross-release observation:** the **225** in the denominator register equals the independently counted **225 original LP2 red runes**, exactly, using the image-corrected [ink annotations](../resources/liber-primus/lp2-ink-annotations.json). That occurrence selects a unique convergent index5. Its immediately preceding denominator is **179**, a number independently known to occur twice elsewhere in the original LP2 architecture:

1. Among the 55 original rune-bearing unknown pages, *only physical p53* has exactly **179 runes** (canonical [corpus](../resources/liber-primus/lp2-corpus.json)).
2. Original p50's **256 printed base60 tokens**, interpreted as consecutive conventional byte values in physical row-major order and then a big-endian integer `N`, have exact 179-adic valuation `v179(N)=2` (neither one nor three). This is the earlier independently documented [179² table fingerprint](lp2-p15-p53-dh23-179-adic-read-fingerprint.md), now with a separate first-release origin for its prime.

This offers a constrained *candidate* human source route: the two historical 5×5 squares → Euclidean convergents → source-visible original red-rune count 225 → predecessor denominator 179 → unique p53 or p50's 179² factor. Neither the red count nor its predecessor selection is a cryptographic opcode supplied by the creator; this precise operation was conceived after the table's factor179 was known.

## Simultaneous DH23 connection to original page28

Under a *candidate* field assignment fixed to the observed Euclid positions, assign the first three Euclidean quotients `3,5,8` to `e,g,A`, the second remainder `23` to `p`, and the penultimate nonunit remainder `2` to `K`:

```text
e=3, g=5, A=8, p=23, K=2,
a=e·K=6,
b=e⁻¹ mod (p−1)=3⁻¹ mod22=15,
B=g^b modp=5^15 mod23=19.
```

The standard Diffie–Hellman equations close exactly: `g^a modp=8=A`, `A^b modp=2=K`, and `B^a modp=2=K`. The Euclid third remainder is `18=p−g`, and the following fourth remainder is `5=g`. All are source-input-derived arithmetic equalities *once the field assignment is specified*. The assignment is retrospective, so the fit is a candidate, not creator-authenticated key derivation.

Original LP2 p28 physical line6 begins with the literal runes `DH`, numerical indices **[23,8]**, exactly `[p,A]`. The next line has **22=p−1 runes**, divided into **6=a fragments**. The **e=3** third fragment is **5=g** runes, numerical sequence **[10,18,13,28,8]**. Applying the existing calibrated outer H endpoint map, `H(x,y)=((x−y) mod29,(x+y) mod29)`, to its endpoints gives **[2,18]=THE**. The page's first two fragment endpoints similarly produce **HERE**. These local readouts and p28 DH geometry were found by earlier agents; this report adds a mathematically explicit source from the two first-release magic squares.

For a descriptive sensitivity control only, the SFT charges all **102 unordered decimal-reversal pairs of distinct four-digit primes** under the same fixed Euclid field grammar. Five yield formally eligible triples and just the original pair `3301/1033` satisfies all three DH closure conditions. This is **not** a discovery-corrected statistical significance estimate because the field grammar was selected after the source output was known.

## The source-text's explicit totient clue yields a four-count factorization

The solved LP1 p5 source explicitly says **“THE PRIMES ARE SACRED / THE TOTIENT FUNCTION IS SACRED / ALL THINGS SHOULD BE ENCRYPTED.”** Both matrix sums are prime. Hence computing Euler's totient of their product is directly source-motivated, regardless of the weaker continued-fraction hypothesis:

```text
p = 1033, q = 3301, N_RSA = p·q = 3,409,933
phi(N_RSA) = (1033−1)(3301−1) = 3,405,600
           = 2⁵ · 3² · 5² · 11 · 43
           = 225 · 32 · 11 · 43
```

All four factors have **real independent manuscript counts**:

| Factor | Source-observable role | Exact source |
| ---: | --- | --- |
| **225** | Total runes inked red over original 58 LP2 pages | Image-corrected [ink inventory](../resources/liber-primus/lp2-ink-annotations.json) |
| **32** | Number of physically printed rows in p49–51's 32×8 token table | [Original p50 table transcription](../resources/liber-primus/lp2-grid-256.json) |
| **11** | Square root of original p32's **121** ciphertext runes, the existing 11×11 candidate grid | [Canonical original corpus](../resources/liber-primus/lp2-corpus.json); note p6 is also square-length (196=14²) |
| **43** | Alphabetic words in the PGP-signed 2016 original message, excluding 3301 and the hexadecimal OpenPGP key ID | [Byte-exact signed 2016 source](../resources/historical/cicada2016-4gq25-outguess.asc) |

This yields an exact product across two solved first-release pages, the later encrypted pages and an authenticated subsequent Cicada message. It provides a *possible register-size budget* for source-driven cryptanalysis, as the components arise from a source-text operation rather than arbitrary modular factor fitting. The four-factor partition was recognized **after the counts were known**; there is no authenticated indication that the creator designated these four counts as RSA state dimensions or that a source-selected input can address a unique coordinate. Its statistical significance cannot be inferred by multiplying unrelated chance estimates.

**Most direct RSA consumer tested, rejected.** The conventional public exponent candidate `e=179` is now a separate original-source convergent; it is coprime to `phi=3,405,600`, giving private inverse `d=1,198,619`. A source-exact Windows [positive-control RSA SFT](../sims/lp2_lp1_magic_square_rsa179_p50_sft.cjs) [PASS 44945089406](https://github.com/FlareZ123/liber-primus/actions/runs/44945089406) recovers a planted ASCII `READ OUT` by two-byte plaintext/three-byte ciphertext RSA blocks. Applied unchanged to original p50, the whole 2048-bit integer `N mod 3,409,933` decrypts to **936,887**, GP29 digits `UNEOFP`; decryption after the independently obtained 179² factor gives `THEOLOEI`, also nonprose. Under natural consecutive three-byte RSA ciphertext framing, only **20/85**, **17/85**, and **8/84** blocks at byte phases0,1,2 satisfy the required condition ciphertext < modulus, rejecting all three whole-stream models. A direct whole-printed-word GP29 RSA representation is likewise impossible for **1,081/2,896** original words, whose numeric ciphertexts exceed the public modulus. The fixed direct word/page/table RSA model therefore fails despite the plausible factorization; the factorization alone does not identify a different consumer or plaintext.

## Existing p50 consumer now has a selected upstream number

Let `N` be the exact 2048-bit integer obtained by concatenating the printed original table's 256 decoded bytes. The SFT independently checks:

```text
179² | N
179³ ∤ N
Q = N / 179²
Q mod179 = 55 = GP0(READ)
v29(Q)=1
(Q/29) mod179 = 113 = the 30th prime
```

The [authenticated 2016 signed text](../resources/cicada2016-4gq25.md) has **DIRECTION** as the 30th one-based body-inclusive signed-word index used by the established register convention. This reproduces the previously documented 113→DIRECTION navigation without a new fitted page key. With the existing *conditional* GP0→p50 lookup, `GP0(DIRECTION)=98` reads table[98]=72 and preceding `THE` at GP0=20 reads table[20]=102, selecting the known p0 interval **73–102**. The same authentic original 179 also selects p53, whose printed red span has exactly 51 runes, and the prior source-directed p15 51-rune window shares its exact 179² remainder, `29,535`. Those previous downstream matches are [fully recorded](lp2-p15-p53-dh23-179-adic-read-fingerprint.md); they are **not** new independent holdouts.

A specifically failed natural interpretation remains important: the *next* base179 digit of Q is **96**, rather than `GP0(OUT)=20`, so an unmodified low-to-high 179-digit readout does **not** spell `READ OUT`. Neither Q nor its quotient by29 yields a recognizable standard file header or legible ASCII prefix as big-endian bytes. The existing direct p53-red→p15 one-time pad and p50-factor-based pad consumers also fail. The 179² observation alone supplies no global cipher or recovered 150+ rune plaintext.

## Research decision and strongest rival

The link `1033/3301 → [179,225]` is newly derived entirely from original source measurements, and the matched 179/225 objects are structurally separate from the solved LP1 squares. This is a *candidate clue-constrained 179 selector* worth preserving. A historical creator could have counted red runes, applied the Euclidean algorithm, and checked 179 against an original table or p53 page. It is a more economical route to a useful existing prime than unsupervised factor hunting.

The strongest rival is post-selection: many arithmetic functions could be applied to two conspicuous primes; the convergent and predecessor choice were noticed only *after* 179,225 and the p28 DH fields were published. Source-authored selection of **continued fractions**, the **predecessor** direction, **base60 byte serialization**, or the next **value-changing** decryptor is absent. The p28 small DH example could also have been imported from commonplace instructional material, independently of the solved squares. Do **not** treat this register's elegance or descriptive one-of-102 fit as recovered plaintext.

A concrete next decision is a **frozen source-visible consumer on an untouched original interval**, ideally one which starts from the now-specified 179 without reading the target ciphertext, handles the 51-rune p53 and p15 windows *and* produces at least a full coherent sentence with exact forward re-encryption. The immediate simplest subtraction/179² reduction of the two windows yields 48 GP29 digits with IoC roughly0.02748 and no English prose. Broader arbitrary extraction schemes should not be commissioned without an independent instruction or a held-out prediction.
