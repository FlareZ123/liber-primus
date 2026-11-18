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

## 3. p27-local factors

The independently selected destination page p27 has one red thirteen-dot mark
at local rune offset **19**. The **27th prime is 103**. The whole manuscript
contains **31** thirteen-dot marks when the lone black mark is restored.

Those three source quantities define

[
D = 31	imes19	imes103 = 60667.
]

The red-only lexicographic rank is exactly divisible by this value:

[
R = 60667	imes
13460583712140549893581997463465047.
]

The residual factors exactly as

[
13460583712140549893581997463465047
= 25795396177
	imes
521821166063052627702311.
]

Both residual factors pass the fixed-base probable-prime checks in the
reproducer; independent SymPy testing during discovery also classified both as
prime.

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
The repository's bounded public 2017 Tor-graph supplement probe has been
extended to check this exact host and dispatched separately.

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
5. **Leave-one-mark check.** Across the 31 possible single-mark omissions,
   13 reduced ranks are divisible by 31. Three consecutive omissions around
   the p6/p7 run of adjacent 13-dot events produce the same `13...13`
   quotient because they delete one bit from an uninterrupted run of ones.
   The black mark is visually unique and therefore motivates the red-only
   class, but the quotient framing is not independently unique.

These controls prevent the candidate from being promoted merely because an
80-bit factor can be formatted as an onion label.

## 6. Why this is worth independent attack

The route is stronger than a free numerical search because several choices
were fixed before the candidate emerged:

- `DJU / BEI` is selected by the finite historical `prime_echo` handoff;
- its other occurrence selects p27;
- the GP prime mapping is established source machinery;
- the 225-red-rune / 31-dot event order and zero-based lexicographic rank
  convention were frozen by earlier work;
- the gap 30 selects the red thirteen-dot subclass without choosing an
  arbitrary number of marks;
- p27 supplies the local red-mark offset 19 and page number 27;
- Tor-v2 is historically plausible as a 2014 Cicada destination format.

The weakest unsupported steps are still substantial: using the **floor** of
the red-only combinatorial capacity to connect 129, multiplying
`31 × 19 × prime(27)`, and interpreting the 79-bit residual prime as the
payload rather than treating the factorization as coincidence.

## 7. Decisive next tests

Treat this as a high-priority candidate continuation, not a solution.

1. Reproduce the exact arithmetic independently from the source files and
   frozen rank convention.
2. Search preserved 2014–2017 Tor/onion crawl indexes for the exact host
   `nz77w2upkfkyj4rh.onion`.
3. Seek an **independent manuscript cue** that selects the divisor
   `31 × 19 × 103` or the larger residual factor. A source cue that predicts
   the same address would materially upgrade the route.
4. Do **not** search alternate rank conventions, punctuation subsets, factor
   combinations, byte orders, or base encodings merely to obtain more
   address-like strings.

**Reproducer:** `sims/lp2_primeecho_red13_onion_candidate_sft.cjs`.
