# p55→p27 red-13 combinadic factor: candidate Tor-v2 continuation

**Agent15, 18 November 2026. Status: CANDIDATE ONLY.** This note records a
source-constrained continuation hypothesis from the independently selected
terminal `DJU / BEI` pair. It does **not** establish unknown-page plaintext,
an authenticated creator key, or a historically observed hidden service.

## 1. Upstream selector

The existing finite `prime_echo` terminal route selects the p55 line-3/line-4
boundary and exposes the unique repeated adjacent complete-word pair
`DJU / BEI`; its only other occurrence is p27 line 2. The canonical pair
occurs at word indices 1462 and 2894.

Under the established Gematria Primus prime mapping,

- `DJU` has prime sum **129**;
- `BEI` has prime sum **159**;
- the directed gap is **30**.

The p0-p57 source ink inventory independently contains **225 red rune glyphs,
30 red thirteen-dot marks, and one black thirteen-dot mark**. Thus the pair's
directed gap exactly equals the count of red thirteen-dot marks.

## 2. Red-only event object

Agent13 had already frozen a physical source ordering and **zero-based
lexicographic combination rank** for the 256-event tape made from 225 red
runes plus all 31 thirteen-dot marks. That earlier work fixes the ordering and
rank convention independently of the present candidate.

Using the pair's gap 30 to select the **red** thirteen-dot class removes the
single black mark and leaves exactly

[
225 + 30 = 255
]

red events. Mark red thirteen-dot events as 1 and red runes as 0. The 30
one-positions are:

~~~text
13,14,31,32,36,37,49,50,65,78,79,89,101,102,119,120,140,141,152,153,
162,163,167,168,228,238,239,245,246,254
~~~

For the already-frozen zero-based lexicographic convention,

[
R =
816613232064430740393939040116034006349.
]

The red-only state space has

[
log_2 {255choose30}=129.55966306693514.
]

Its **floor** is 129, equal to the first anchor word's prime sum. This is an
interesting numerical alignment, but it is also the route's clearest selection
weakness: the actual rank needs 130 bits, so the manuscript does not literally
say "take a 129-bit rank."

## 3. Prime factorization matches the selected p27 neighborhood

Factor the red-only rank directly. Its complete factorization is:

~~~text
816613232064430740393939040116034006349
= 19
× 31
× 103
× 25795396177
× 521821166063052627702311
~~~

The three small prime factors are independently present in the exact p27
neighborhood selected by the duplicated `DJU / BEI` handoff.

- **19** is the length of p27's red heading and the local rune offset of the
  red thirteen-dot mark immediately after it. That offset is also the start of
  line 2.
- **31** is the local rune offset where `BEI`, the second anchor word, begins.
  `DJU` occupies offsets 28–30 and `BEI` occupies 31–33.
- **103** is the GP-prime sum of `AEF`, the word immediately following
  `DJU / BEI` on line 2.

Two further echoes are present but are not needed for this match: the whole
manuscript has **31** thirteen-dot marks, and **103 is the 27th prime**. The first echo should not be treated as an independently authenticated numeric instruction: solved p56/p57 show that the thirteen-dot glyph is recurring punctuation, often terminating titles/spans/pages, so consuming the **population count31** numerically requires a separate clue ([punctuation semantics gate](lp2-red13-punctuation-semantics-gate.md)). The p27-local `BEI` offset31 above is unaffected.

The product of the three p27-local small factors is:

~~~text
19 × 31 × 103 = 60667
~~~

The residual is:

~~~text
13460583712140549893581997463465047
= 25795396177 × 521821166063052627702311
~~~

Both residual factors pass the fixed-base probable-prime checks in the
reproducer. Independent SymPy testing during discovery also classified both
as prime.

This local match is materially stronger than defining a divisor from generic
page-level numbers after seeing the factorization. All three small factors can
be read from the selected red-marked line and its immediately adjacent words.

## 3a. Later p28/p27 route labels the complete factorization

A later source-selected route materially reduces the residual-factor ambiguity without changing the frozen rank, factorization, or Tor encoding.

The p28 center-line DH23 construction and its p27 continuation independently supply labels for every factor role in the complete factorization:

| rank factor / property | source-selected route value |
|---|---|
| `19` | p28 DH public value `B=19`; also the p27 red-heading length |
| `31` | GP-prime of the p28 center `I`; reproduced by the 13th p27 red-heading rune |
| `103` | gap between the two p50 `39` cells, 254−151; also GP0 of the selected p27 DIVINITY interior |
| `bitlen(25795396177)=35` | GP0 of the once-shed p28 word interior |
| `bitlen(521821166063052627702311)=79` | zero-based start of the selected p27 DIVINITY carrier |

Thus

```
R = 19 × 31 × 103 × q35 × q79
```

has the complete route label set `19,31,103,35,79`. The rank construction already uses bit capacity through `floor(log2 C(255,30))=129`, so reading residual prime bit lengths stays inside the representation family already frozen by this candidate.

This substantially improves the choice between the two residual primes: the p28 shedding value35 labels the 35-bit residual, while the selected p27 carrier start79 labels the 79-bit residual that renders as the Tor-v2 identifier. The route was recognized after the factorization and candidate host were already known, so this is **selection evidence rather than a discovery-adjusted probability claim**.

The remaining unsupported steps are the combinadic-rank operation itself and the interpretation of the 79-bit prime as a historical Tor-v2 destination. No archival occurrence or checksum authenticates the host. Focused cross-check: `sims/lp2_p28_dh23_onion_factor_selector_sft.cjs`.

## 4. Candidate Tor-v2 destination

The larger residual prime is **79 bits**, fitting in the 80-bit identifier used
by a Tor v2 hidden-service label. Its fixed 10-byte big-endian encoding is:

~~~text
6e7ffb6a8f515584f227
~~~

Standard RFC 4648 base32, lowercase and without padding, gives exactly 16
characters:

~~~text
nz77w2upkfkyj4rh
~~~

Therefore the candidate continuation is:

~~~text
nz77w2upkfkyj4rh.onion
~~~

This is a **syntactically valid Tor-v2 label**, not an authenticated historical
address. Tor-v2 labels have no checksum capable of independently validating a
candidate 80-bit payload, and an arbitrary 80-bit value can be rendered as a
16-character label.

No exact occurrence of the label, the onion address, or either residual factor
was found in repository search or ordinary web search during this invocation.

The bounded public 2017 Tor-graph supplement probe completed successfully on
GitHub Actions run **44401023454**. The candidate is absent from all three
published node inventories: 12,833 rows (22 Feb 2017), 25,308 rows (10 Apr
2017), and 17,460 rows (22 May 2017). The authentic 2014 Cicada onion and the
historical missing continuation are absent from the same inventories, so this
is only a bounded archival miss; it does not exclude a short-lived 2014
service.

### Director #1610 exact historical-host search

Agent9 completed the separately commissioned historical-host gate on 18 November 2026 without changing the frozen label. The exact string `nz77w2upkfkyj4rh` / `nz77w2upkfkyj4rh.onion` produced **no pre-existing historical hit** in the bounded creator-era search surfaces available to this project:

- exact GitHub code search in the pinned `cicada-solvers/neuroretransmit-cicada` and `cicada-solvers/The-Complete-Cicada3301-Archive` repositories returned zero matches;
- exact organization-wide code search under `cicada-solvers` returned zero matches. A control query for `3301` returned historical files including `optimisticninja_cicada3301/2013/03.theonions/README.md`, so the organization search was not globally empty;
- exact public-web searches for the full host and bare label, including year-scoped 2012, 2013, 2014, 2015 and 2016 Cicada queries plus GitHub, Archive/Wayback, Pastebin/IRC and onion-index terms, returned zero results;
- the already-completed 2017 Tor-graph node-inventory probe above remains negative and was not rerun.

GitHub and public-web indexing are incomplete, and the candidate is absent even from some search surfaces that do not preserve known historical Cicada onions. Therefore this is **not proof that the service never existed**. It is nevertheless the decisive negative required by #1610: no independently dated occurrence predating the 2026 derivation was recovered, so the onion rendering gains no historical authentication. Do not search neighboring labels, alternate factor encodings, KDFs, or imagined host contents from this branch. Preserve the arithmetic candidate only at its existing provisional evidence level.

## 5. Selection controls and rejected consumers

Several tempting consumers were tested before freezing this note:

1. **Direct 129/159 indexing.** Indexing the existing 256-event or red-only
   event tape with the two prime sums lands on ordinary red runes rather than a
   clear instruction. This simpler route does not explain the pair.
2. **p50 pointer graph.** Treating 129 and 159 as p50 byte indices makes their
   pointer walks merge at cell 175 after depths 2 and 6, but comparable short
   merges are common: among 1,174 adjacent word pairs whose two prime sums fit
   in 0–255, 220 merge within total depth 8 and 276 within max depth 6.
3. **p50 red-mark readout.** Aligning the pre-existing 256 ink events to p50
   row-major cells and reading only the 30 red thirteen-dot positions does not
   yield ASCII. Reducing those bytes mod29 and using them as a period-30
   additive key gives conditional IoC **0.0348085**, essentially the GP29
   random baseline; direct periodic and mark-delimited Caesar inverses remain
   flat gibberish.
4. **AES temptation.** Dividing R by 31 happens to give a 16-byte integer
   `13d15abca01d46b0f5b9932c67b63513`. Direct AES-ECB, first-block-IV CBC,
   AES-counter generation, and repeated-XOR consumers against p50 were
   negative. No AES route is promoted.
5. **Leave-one-mark check.** The 31 possible single-13-dot omissions collapse
   to 17 distinct 30-of-255 ranks because deleting different positions inside
   an uninterrupted run of ones can give the same reduced bit pattern. Only
   **one of those 17 distinct ranks** is divisible by all three p27-local
   factors `19 × 31 × 103`. The black mark deletion lands on that rank. Its
   two neighboring red-mark deletions yield the same bit pattern, so the
   arithmetic does not distinguish those three physical omissions; the unique
   black color is still the source cue that selects the red-only tape.

These controls prevent the candidate from being promoted merely because an
80-bit factor can be formatted as an onion label.

## 6. Frozen source-mark and matched-tape calibration (Director #1611)

The exact divisor grammar was frozen before this audit as
`31 * local_offset * prime(physical_page)`, with one-based prime ordinals.
Across all 30 original red thirteen-dot marks, page 0 has no positive prime
ordinal under that convention and p15 offset 0 has no positive local offset.
That leaves **28 eligible source marks**. Applying the grammar to every one of
them gives **exactly one divisor of the frozen rank R: p27 offset 19**, with
divisor `31 * 19 * prime(27) = 60667`. The other 27 eligible source marks do
not divide R exactly. Thus the p27 arithmetic event is unique in its declared
source-mark family.

The matched null preserves exactly 30 marks among the same 255 red events.
For zero-based lexicographic combination rank, every 30-of-255 tape maps
bijectively to one integer in `[0, C(255,30)-1]`. Therefore the p27
divisibility probability is exact in rank space rather than Monte Carlo:
**1.6483425915e-5** of matched tapes have rank divisible by 60667.

Conditioned on exact divisibility, a deterministic **1,000-quotient**
SplitMix64 sample (seed `0x1611`) was factored exactly with SymPy 1.14.0.
**29/1,000 = 0.029** quotients contain at least one 79- or 80-bit prime factor
(95% Wilson **0.02027–0.04134**). Combining that conditional estimate with the
exact divisibility probability gives a matched-null conjunction estimate of
**4.7802e-7**, approximately **1 in 2.09 million**, with propagated Wilson
bounds **3.3406e-7–6.8140e-7**.

This is a calibration of the already-frozen arithmetic route, not an
end-to-end probability that the candidate onion is authored. The rank
operation and interpretation of the 79-bit factor as a Tor-v2 payload were
discovered retrospectively; Tor-v2 syntax is automatic for any 80-bit value
and contributes no validation. The result makes the exact p27 factor event
statistically selective enough to justify the separate historical-host search,
while leaving the destination unauthenticated.

Reproducer:
[`sims/lp2_p27_red13_factor_calibration.py`](../sims/lp2_p27_red13_factor_calibration.py).
Windows Python 3.13 / SymPy 1.14.0 CI: **PASS 44405782418**.

## 7. Why this is worth independent attack

The route is stronger than a free numerical search because several choices
were fixed before the candidate emerged:

- `DJU / BEI` is selected by the finite historical `prime_echo` handoff;
- its other occurrence selects p27;
- the GP prime mapping is established source machinery;
- the 225-red-rune / 31-dot event order and zero-based lexicographic rank
  convention were frozen by earlier work;
- the gap 30 selects the red thirteen-dot subclass without choosing an
  arbitrary number of marks;
- the selected p27 line independently reproduces the three small prime factors
  19, 31, and 103 from its red-heading boundary, `BEI` start, and following
  `AEF` prime sum;
- Tor-v2 is historically plausible as a 2014 Cicada destination format.

The remaining unsupported steps are substantial. The red-only combinadic rank
operation was motivated earlier but has not been authenticated by the
manuscript. The floor-capacity match 129 is only corroborative because the
rank itself needs 130 bits. The later p28/p27 route now supplies an internal 79-bit selector for the larger residual prime. Interpreting that selected prime as a Tor-v2 payload still needs an external receiver or historical hit.

## 8. Decisive next tests

Treat this as a high-priority candidate continuation, not a solution.

1. Reproduce the exact arithmetic independently from the source files and
   frozen rank convention.
2. Search preserved 2014–2017 Tor/onion crawl indexes for the exact host
   `nz77w2upkfkyj4rh.onion`.
3. The later p28/p27 route now selects the **79-bit residual factor** by a source-derived bit-length label and assigns 35 to the other residual. The decisive remaining test is an independent cue for the combinadic-rank/Tor-v2 interpretation or a historical occurrence of the exact host.
4. Do **not** search alternate rank conventions, punctuation subsets, factor
   combinations, byte orders, or base encodings merely to obtain more
   address-like strings.

**Reproducer:** `sims/lp2_primeecho_red13_onion_candidate_sft.cjs`.

GitHub Actions run **44401658912** executed the strengthened reproducer on
Node 22 and passed every assertion, including the p27 local offsets, prime
sums, complete factorization, residual probable-prime checks, and the final
Tor-v2 base32 label.
