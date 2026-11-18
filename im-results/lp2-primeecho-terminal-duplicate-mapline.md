# Historical prime_echo exhaustion → p55 duplicate-word map line

**Agent2, 18 November 2026. Status: new source-visible handoff candidate; no unknown plaintext or authenticated key recovered.**

The terminal p54–55 prime/totient investigation has a sharper source boundary than the
previous "extend ordinary primes indefinitely" model. The actual 2013 Cicada OS
`prime_echo` artifact prints a **finite list of 464 ordinary primes from 2 through 3301**,
pauses for two seconds after 1033 and again after 3301, and then terminates. Under the
already-established p56 sign+ / literal-plaintext-F-transparent law, that exact finite
historical list can be consumed by p54–55 through a **physical printed-line boundary**:
the 464th and final supplied prime, 3301, is consumed at p54–55 global rune299 =
p55 local67, the last rune of p55 printed line3.

The remaining original line4 is left untouched:

```text
CX / DJU / BEI
```

This line has a second, independently visible property. Across all p0–55 physical rune
lines it is the **only line with at least two words whose every constituent word type
occurs exactly twice in the manuscript**. The other copies point to p34 and p27. This is
a concrete literal reading of the later signed 2016 phrase **"Its words are the map"**:
the terminal line can map to two earlier manuscript locations before any plaintext is
guessed.

This report preserves that source architecture and stops before inventing a direction or
cipher. It supersedes no established decryption and does not promote the three algebraic
prime/totient paths to plaintext.

## 1. Finite historical key source

Pinned repository copy:

- `resources/historical/cicada2013-os-original-prime-echo.sh`
- Git blob `65a569cf1b3eecb0f7c17ffc569a54ed8ecdf649`.

The script explicitly prints every ordinary prime through **3301** and no later prime.
It gives exceptional two-second pauses at **1033** and **3301**. These are source facts,
not reconstructed prime-table conventions.

The finite list has:

- 464 entries;
- zero-based index173 = prime1033;
- zero-based index463 = prime3301.

The fact that 3301 is the final supplied value matters here: continuing the candidate
LP2 key stream with 3307, 3313, ... is a researcher-added extrapolation, not a byte in
the historical Cicada artifact.

## 2. Exact first-300-rune inverse with no post-3301 primes

Take the unchanged 308 original runes of physical p54–55 and the authentic p56
prime/totient inverse law:

- sign+ only;
- key value `φ(p)=p−1 mod29`;
- plaintext F emits ciphertext F and does **not** consume a prime;
- ciphertext F may alternatively be an encrypted non-F and consume a prime.

Permit every source-bounded initial prime index 0..463, as in the prior exhaustive
all-start study, but forbid access to any prime after 3301. Process exactly the first
**300** p54–55 runes, ending at p55 local67, and require the cursor to have exhausted all
464 historical primes.

There are **exactly three** paths:

| initial zero-based index | initial prime | literal-F skips | pointer after rune299 |
| ---: | ---: | --- | ---: |
| 167 | 997 | 41,195,247 | 464 |
| 167 | 997 | 65,195,247 | 464 |
| 168 | 1009 | 41,65,195,247 | 464 |

These are exactly the three trajectories previously found when the mathematical prime
sequence was extended through all 308 runes. The new point is that **all three exhaust the
actual historical list at the same physical boundary**. No fourth path can consume the
historical list through that boundary.

The boundary is exact:

- p54 has 232 runes;
- p55 printed line lengths are **24,22,22,8** runes;
- p54–55 rune299 = p55 local67 = final rune of printed line3;
- the eight untouched runes are p55 local68–75, exactly printed line4.

This does not select initial index167 versus168 and does not make the first300 decoded
runes grammatical. It changes the architectural question: a finite historical key source
naturally stops before the manuscript's final eight-rune line.

## 3. The untouched line is a unique duplicate-word map

The original line is:

```text
ᚳᛉ-ᛞᛄᚢ-ᛒᛖᛁ.
 CX   DJU   BEI
```

A strict manuscript-wide word census over p0–55 gives:

| terminal word | GP-prime sum | total occurrences | earlier copy |
| --- | ---: | ---: | --- |
| CX | 60 | 2 | p34 local200, word56 one-based, printed line10 |
| DJU | 129 | 2 | p27 local28, word7 one-based, printed line2 |
| BEI | 159 | 2 | p27 local31, word8 one-based, printed line2 |

The DJU-BEI pair was already established as the manuscript's only repeated adjacent
printed word pair. The new source fact is the **preceding CX word**:

- CX is itself a complete printed word at both sites;
- it occurs exactly twice in p0–55;
- both copies begin a physical printed line;
- its earlier copy is on p34, inside the source-visible pp33–39 cuneiform/1033/3301
  chapter;
- its GP-prime sum is **13+47=60**, matching that chapter's independently established
  conventional sexagesimal context.

The line-level census is stronger than any one arithmetic equality. There are **594**
physical rune lines in p0–55. Exactly **one** line with at least two words has the property
that every word type on the line occurs exactly twice in the manuscript: p55 line4,
`CX / DJU / BEI`.

The three terminal word prime sums are `60,129,159`; together they total
**348 = 6×58**. The repository already contains a conjectural signed-2016
GP-prime-sum/base58 word-map model, so the equality is recorded as a cross-check only.
Its resulting p0 word6 is opaque and it does not authenticate the base58 rule.

## 4. Why this is a plausible human solve-path clue

The authenticated 2016 signed message says:

```text
Liber Primus is the way. Its words are the map.
Their meaning is the road, and their numbers are the direction.
```

The pronoun "Its" refers to Liber Primus; this is already established in
`im-results/lp2-2016-signed-message-base58-word-map.md`. The terminal line now supplies
an unusually literal candidate for the first clause without needing plaintext.

The completed historical grammar audit in Director #1462 also supplies the strongest
source-grounded reading of **"their numbers"**: original LP1 p05 replaces each of its
thirteen rune words by the sum of its published GP prime values and reproduces the
independent 5×5 numerical square **25/25**. That is a genuine manuscript-era
word→number operation, unlike an invented modulus. It makes **60/129/159** the preferred
numbers to carry forward from CX/DJU/BEI. The same audit found **no authored
number→direction convention**, however; the 2016 sentence does not say how those values
become a movement, address delta, sign, compass bearing or extraction.


1. reach the end of the finite historically supplied prime list;
2. stop exactly at a printed line boundary;
3. read the remaining three **words**;
4. every one of those words has exactly one other location in Liber Primus;
5. those duplicate words therefore give a deterministic map to **p34** and **p27**.

That is a substantially tighter authored-route hypothesis than "try base60 because a 60
appears." It specifies *which words* do the mapping and *which earlier locations* they
select before any decoder output is inspected.

The next clause remains unresolved. Neither the signed message nor the manuscript currently
fixes whether "numbers" means GP-prime sums (60/129/159), page/word coordinates
(34:56, 27:7, 27:8), line numbers, or another historically defined quantity. Likewise,
no source yet says how the p34 and p27 destinations combine into a reversible p55/LP2
operation. The route must stop here until one such rule is independently selected.

## 5. Strongest objections and stop rule

Three objections remain decisive:

1. **Initial cursor ambiguity:** the finite prime stream still admits starts167/168 and
   three plaintext-F histories. The terminal boundary does not choose among them.
2. **No direction operator:** duplicate-word navigation identifies p34/p27, but no
   first-party rule yet says what to extract or how to transform it.
3. **Known local arithmetic is not enough:** CX=60 and DJU+BEI=288 are suggestive in
   already-known numerical contexts, but arbitrary radix/key searches would be
   post-selection.

Accordingly:

- do **not** send this to #41 as a complete p55 decoder;
- do **not** resume generic base60/base58, p27 pad, p34 numeral-pad or extended-prime
  sweeps from this observation;
- do treat the final line as a new source-selected navigation object;
- the next decisive task is to find an authenticated rule for the **direction** from the
  three mapped words/locations and predict an untouched original interval.

A positive successor must freeze that direction/extraction rule before reading its output
and must yield a full reversible original-cipher consequence. Otherwise this remains a
structural handoff, not plaintext.

## Reproduction

`sims/lp2_primeecho_terminal_mapline_sft.cjs` asserts:

- the 464-prime finite list through3301;
- all three exact first300-rune F-transparent paths and no others;
- p55 line lengths 24/22/22/8;
- the exact p55 line4 word sequence;
- global word frequencies and the earlier p34/p27 coordinates;
- all 594 physical lines and the uniqueness of the all-words-exactly-twice line;
- GP-prime sums 60/129/159 and total348.

The SFT is read-only and performs no language scoring.
