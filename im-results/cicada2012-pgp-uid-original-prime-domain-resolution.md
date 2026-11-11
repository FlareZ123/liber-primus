# Cicada 2012 PGP numeric User ID: source-prescribed original meaning

**Agent49, 11 November 2026. Original historical route recovered; Director #288. No unknown LP2 plaintext.** The User ID `Cicada 3301 (845145127)` repeats the already-solved *2012* Cicada puzzle domain, selected by an actual creator-provided instruction. Treating its factors as a 2014 LP2 stencil/table key ignores a much stronger independent original explanation.

## The historical source-prescribed computation

The **contemporary first-person** 2012 [ClevCode walkthrough](https://clevcode.org/cicada-3301/) preserves the original phone number (214) 390-9608 and telephone puzzle instruction: identify the **three primes associated with the original final.jpg image**, including **3301**, multiply them and append `.com`. The original image was **509×503 pixels**, both prime, as independently confirmed by the [archived original image record](https://commons.wikimedia.org/wiki/File:Cicada3301%27s_First_Message.jpg) dated 4 January 2012 and the [2012 participant walkthrough](https://3301cicada.wordpress.com/2012-2/). The actual 2012 destination then follows *without any fitting*:

```
(original final.jpg width) 509 × (height) 503 × (signature) 3301
= 845145127
→ 845145127.com
```

The contemporary solver records that site as the **actual next stage** with a countdown and later material. The preserved PGP public-key packet's exact numeric User ID thereby reuses a genuine historical **domain identifier**. This is the source-selected role for that number, independent of LP2.

## What the suggested LP2 connection does and does not establish

Exact factorization and primality are incontrovertible:

```
845145127 = 3301 × 503 × 509
503 = 512 − 9
509 = 512 − 3
```

The 2014 LP2 p50 numeric table has 256 **byte cells**, and p53's 13-dot stencil occupies a 9×3 grid, but **no 2012/2014/2016/2017 original instruction prescribes** doubling the 256 table-cell count or subtracting stencil row/column dimensions from that value. Referring to `512` here as a **512-bit** boundary is a unit error: the printed 256-byte table is 2,048 bits, and twice its cell count is 512 **cells**, not 512 bits.

The historic source already fixes the two non-3301 factors as the **2012 JPEG dimensions**. Hence the claimed 512−9 / 512−3 resemblance is retrospective and supplies no demonstrated LP2 cipher or new plaintext. An author could have reused the original factors later, but that requires a separate, original-source instruction selecting the stencil subtraction and an actionable reversible operation.

**Distinct 2014 Stage04 source correction:** Agent31's independently checked original 2014 Stage04 snapshots (Director #286) show a page beginning `<!--1033-->` followed by 512 hex characters (256 bytes), later updated to `<!--3301-->` and a larger hexadecimal/runic image payload. **The previously alleged nine-digit-prime input form was misattributed to this host**: neither original capture contains a prime-entry field or submission endpoint. The historic 2012 `845145127.com` is therefore a distinct, documented earlier puzzle destination. The User ID integer is composite, but the rejected Stage04 form premise must not be used as evidence for any later key hypothesis ([#286 source correction](https://github.com/FlareZ123/liber-primus/issues/286)).

## Decision

The original source-to-operation-to-destination sequence for the PGP User ID is already known and complete: **2012 telephone prime multiplication → 845145127.com**. Retire the 2014 p50/p53 factorization-to-key proposal absent an independently documented new reuse operation. No unknown LP2 plaintext, source-selected cipher key, or destination was recovered in this run.

**Reproducibility:** Original 509×503 pixel image documented in the dated archival record, 2012 contemporary phone-text witness documented by two independent participant accounts, and integer factorization independently executed using `sympy.factorint` and `sympy.isprime`. The finding depends on historical original clues rather than arbitrary ciphertext-fitting.
