# P36 section 1 yields a strong local MEANING plaintext candidate

**Agent43, 19 November 2026. Classification: source-selected local plaintext recovery candidate.** The visible section-1 marker selects the first complete word on p36 before plaintext scoring. A finite key family built from the visible section number and one authenticated DH state field has one hit across all five numbered-section starts: section1, field `e`, subtraction, `MEANING`. The exact key is also manuscript-selective across the canonical four-rune corpus.

## Receiver fixed by original layout

Physical p36 begins the authored numbered block that runs through p38:

```text
1- ...
2- ...
3- ...
4- ...
5- ...
```

The canonical parser preserves words across printed line and physical-page wraps. The first complete word after visible marker `1-` is canonical p36 word19 at offsets99..102:

```text
C = [20,2,12,22]
length = 4
GP0 = 56
```

This exact four-rune ciphertext occurs once among the **509** canonical complete four-rune words on unknown LP2.

Under the established outside-in transform

```text
H4([x0,x1,x2,x3])
=
[x0-x3, x1-x2, x1+x2, x0+x3] mod29,
```

the untouched ciphertext is already a compact authenticated-state object:

```text
H4(C)
= [27,19,14,13]
= [-K,B,-b,b-K].
```

The state is independently reconstructed from the authenticated 2016 source:

```text
(p,g,a,b,A,B,K,e,q)
=
(23,5,6,15,8,19,2,3,4).
```

The p6 master-state packet independently exposes the same ingredients, including `K`, `e`, `a`, `B`, `b`, `-K` and `-b`.

## Target fixed independently by the two red brackets

The target no longer needs to be chosen from the authenticated vocabulary after inspecting ciphertext.

The original numbered block is enclosed by two identical red 10-dot glyphs:

```text
opening bracket  = 10 dots
closing bracket  = 10 dots
visible total    = 20 dots
```

Under the already established zero-based authenticated source numbering:

```text
source index20 = MEANING.
```

Thus the complete original bracket pair predicts `MEANING` independently of the p36 receiver values.

With that target frozen, use only the adjacent red value alphabet:

```text
section marker = 1
dot-column counts = 3,4,3
distinct values = {1,3,4}.
```

Exhaust every four-slot key over those three values and both additive signs:

```text
3^4 keys x 2 signs = 162 target-frozen configurations.
```

Exactly one operation maps the independently selected p36 section1 receiver to the independently selected target:

```text
[20,2,12,22] - [1,3,3,1]
= MEANING.
```

This is the strongest form of the result because receiver, target, key alphabet, and operation family are all bounded by original/authenticated sources before the successful tuple is identified.

## Full source-visible key-alphabet charge

The receiver and key alphabet can be fixed from original red marks before imposing the successful palindrome structure.

The visible values adjacent to the selected section are:

```text
section marker: 1
10-dot column signature: 3,4,3
distinct source-visible values: {1,3,4}
```

Because the selected receiver has four runes, enumerate **every** four-slot key over that visible alphabet:

```text
3^4 = 81 keys
x 2 additive signs
x 9 distinct authenticated four-rune source targets
= 1,458 configurations.
```

There is exactly one hit:

```text
key    [1,3,3,1]
sign   subtraction
target MEANING.
```

This charge does not assume a palindrome, state-field ordering, or a preferred use of the center versus outer dot columns. The successful key emerges as the sole authenticated hit from the complete local visual key alphabet. Its later interpretation as `[section,e,e,section]` and H shell `[0,0,a,K]` is therefore explanatory rather than required for the selection.

## Source-derived numbered-section key family

The numbered block is also visibly bracketed by matching red 10-dot glyphs on p36 and p38. The independent original-image geometry audit fixes every 10-dot glyph's column signature as:

```text
(3,4,3)
```

which is exactly:

```text
(e,q,e)
```

under the authenticated state. The two symmetric outer columns therefore source-select repeated `e=3` before plaintext scoring. The center column gives the independently meaningful alternative `q=4`.

The exact key that opens the selected receiver is:

```text
[1,3,3,1].
```

It has a direct source reading:

```text
[section, e, e, section]
=
[1,3,3,1].
```

The corresponding H shell is:

```text
H4([1,3,3,1])
= [0,0,6,2]
= [0,0,a,K].
```

Because this compact form was recognized after inspecting the section1 receiver, charge the whole family instead of treating the successful field as preselected.

For every authored numbered-section start `s=1..5`:

1. take the first complete word after the visible marker;
2. choose one of the nine authenticated state fields `x in {p,g,a,b,A,B,K,e,q}`;
3. build a same-length palindrome key `[s,x,...,x,s]`;
4. apply both additive signs;
5. compare only with distinct authenticated 2016 source words of the matching GP length.

The five starts are:

```text
section1 [20, 2,12,22]             length4
section2 [ 9,26,18,14]             length4
section3 [23, 1,13]                length3
section4 [21,11,15,11,19,4,19]     length7
section5 [ 8,25,14, 2,17,22]       length6
```

The broad nine-state-field family contains **558 configurations** and has exactly one hit. More importantly, the original 10-dot stencil narrows the interior value before decryption:

```text
visible column values {3,4} = {e,q}
all five section starts
matching-length authenticated targets
both signs
= 124 configurations
```

That bracket-conditioned family still has exactly one hit. Restricting to the repeated symmetric outer columns `e,e` gives **62 configurations**, again with exactly one hit:

```text
section = 1
field   = e = 3
key     = [1,3,3,1]
sign    = subtraction
target  = MEANING
```

The same prospective rule on the other four-rune authored start gives:

```text
section2 key = [2,e,e,2] = [2,3,3,2]

[9,26,18,14] - [2,3,3,2]
= [7,23,15,12]
```

which is not any authenticated four-rune target.

## Exact reversible plaintext

Canonical GP29 spelling gives:

```text
MEANING = [19,28,9,21]
```

with the `ING` rune contracted in the standard way.

Exact subtraction:

```text
[20, 2,12,22]
-
[ 1, 3, 3, 1]
mod29
=
[19,28, 9,21]
=
MEANING.
```

Its plaintext H shell is also entirely state-typed:

```text
H4(MEANING)
= [27,19,8,11]
= [-K,B,A,b-q].
```

The operation is therefore a state-to-state shell transition:

```text
cipher shell    [-K,B,-b,b-K]
key shell       [ 0,0, a,  K]
subtract
plaintext shell [-K,B, A,b-q].
```

No language model scoring or free alphabet is used.

## Source-number continuation: MEANING + e = ROAD

The authenticated 2016 prose itself uses `e=3` as a repeated semantic hop. Four clauses have the same source-number grammar:

```text
PRIMUS  10 -> WAY       13   +3
WORDS   15 -> MAP       18   +3
MEANING 20 -> ROAD      23   +3
NUMBERS 26 -> DIRECTION 29   +3
```

Each clause is literally `X IS/ARE THE Y`; its destination lies three signed-word positions after its subject. The common step is exactly authenticated `e=3`.

Therefore the p36 result has an immediate source-number continuation using the same field already selected by the 10-dot outer columns and the local key:

```text
p36 section1 -> MEANING
source index(MEANING) = 20
20 + e = 23 = p
source word23 = ROAD
physical p23 = established ROAD/origin state checkpoint
```

This continuation does not depend on extending the p36 word cipher. It uses the authenticated message's own instruction that the words' numbers are the direction. P23 independently existed as the `ROAD` state page before this p36 recovery.

## Prospective continuation and whole-section control

A direct word-for-word continuation would next expect authenticated `IS`, because the source phrase contains:

```text
MEANING IS THE ROAD
```

That continuation fails immediately at a structural gate. The second complete ciphertext word in section1 has **3 runes**, while canonical `IS` has **2 GP runes**. No key value can repair that length mismatch under this additive word-local rule.

A broader frozen-rule control applies the same section1/`e` palindrome key to every complete word in section1:

```text
word length n
key = [1, e, ..., e, 1]
signs = both additive directions
```

Section1 contains **30** complete words. Across all 60 word/sign outputs, exactly one equals any authenticated 2016 source word:

```text
section1 word0 -> MEANING.
```

This supports a local instruction/state reading and rejects a simple running plaintext sentence under the same word-local rule.

## Full first-opcode receiver: unchanged red-dot palindrome on all numbered words (Agent26, 22 November 2026)

The original section-1 result selects one first **complete four-rune word** and proposes `MEANING` after subtracting `[1,3,3,1]`. The immediately necessary question is whether that *same human-visible key grammar* opens the complete 139-rune first numbered paragraph, then a truly untouched independent 91-rune second paragraph, rather than a standalone locator or chance four-rune word. Freeze the outer key at each original **red section ordinal 1..5** and select only the **two** inner digit values from the actual two ten-dot bracket column shape `(3,4,3)`: outer repeated `3=e`, central `4=q`. For each source-defined word of length n use additive GP29 palindrome `[section,inner,...,inner,section]` (for one-rune words the section value alone), in either direction. There is no fitted phase, secret key, invented punctuation or word-boundary reset. The actual 122 complete original words include the p37→p38 carried word: unit word counts **30/20/25/19/28** and rune counts **139/91/98/96/129**. The source parser now correctly removes the physical line-wrap slash at p37→p38.

For an independent native GP29 word-level receiver, match each complete candidate plaintext token to a fixed **29,060-form** GP-normalized English lexicon from `resources/control/english_wordfreq_textblob.txt`, using exactly the existing Cicada `ING`, `IO`, `TH`, `NG` and other composite rune spelling conventions. This lexicon is intentionally generous: it admits low-frequency lexical items and single symbols. The original raw ciphertext, untreated, matches **5/122** complete word shapes covering **11/553** runes.

| Source-licensed interior and direction | Matched complete words /122 | Matching rune coverage /553 | Matches with at least four GP runes |
| --- | ---: | ---: | ---: |
| `3`, subtract (the previously successful `MEANING` first-word key) | **6** | **12** | **1** (first word `MEANING`) |
| `3`, add | 4 | 8 | 0 |
| `4`, subtract | 5 | 8 | 0 |
| `4`, add | 3 | 5 | 0 |

The first-word `MEANING` is preserved exactly under the original fixed `[1,3,3,1]` key. On the later **92 original complete words and 414 runes** of units 2–5, the same `3` subtraction grammar finds only **five** short dictionary strings covering **eight** runes, **zero** with at least four GP runes. It therefore has no sustained native English sentence, paragraph or program instruction. The other three completely frozen original variants are similarly uniform/nonprose.

Controls: each output exactly reencrpyts all 553 untouched original runes, and a source-native English lexical plant of *all 122 original word lengths* is encrypted and fully recovered **122/122** under each one of the four selected invertible rules. A deliberately wrong central-column key fails to recover all native lexical words. Both positives and original failing readouts were run in [Windows Node22 Actions 45017369568](https://github.com/FlareZ123/liber-primus/actions/runs/45017369568) via [single-file GP29 source SFT](../sims/lp2_p36_38_bracketpalindrome_fulltext_sft.cjs).

**Interpretation:** The locally motivated four-rune `MEANING` target remains an unresolved *standalone* clue hypothesis. The same red-digit palindrome **cannot serve as a general GP29 English decoder** for the 139-rune first item or the later numbered items. Moving from one four-rune hit to an asserted 553-rune plaintext would require a new author-selected operator or external key; this test provides no such operand. Neither this local one-hit route nor the separate signed-2016 word-key Vigenère gate authenticates an original first-stage instruction.

### Historically keyed four-rune repetition: second source-selected first opcode

The already derived first-word key is the exact four-rune object **`[1,3,3,1]`**. Another genuine 2014 antecedent is to repeat it as a standard GP29 Vigenère key continuously, rather than constructing a new palindrome for each next word. This option is fully defined from the existing original red marks and the first `MEANING` receiver. Freeze both arithmetic directions and two source-visible synchronization policies: reset at every one of the five actual red paragraph labels, or carry the four-position clock through the whole 553-rune original enclosure.

With the sign required by the successful initial `MEANING` plaintext, GP29 subtraction across the entire original 139-rune item1 has IoC **0.03597122**, and the independent 91-rune original item2 has **0.03540904**; neither produces coherent native English. On the complete continuous 553-rune source, IoC is **0.03395183**. The direct opposite sign is similarly nonprose. More decisively, the historical 2014 LP1 rule leaves literal plaintext `F` unencrypted and does not advance its key at those symbols: exhaustive legal bypass-phase propagation for the `[1,3,3,1]` subtraction key becomes **impossible** at original zero-based positions **17/59/54/28/48** when started afresh at the five numbered unit boundaries. The continuous whole-packet clock fails at **17**. All keys recover synthetic source-native English GP29 controls under that same true F rule, and exact no-bypass forward/replay holds on all 553 unchanged original runes.

**Decision:** A single source-compatible four-rune `MEANING` hit does not support either word-local or the historically familiar *periodic* key extension. The original red-dot clue could still identify a local state/locator whose later instruction requires a different selected operation; avoid claiming full plaintext from the short hit. These specific first-opcode extensions are retired, without ruling out genuinely new author-supplied keys or recurrences.

## Manuscript-wide fixed-key control

Hold the exact key `[1,3,3,1]` fixed across:

```text
509 canonical complete four-rune unknown words
x 9 distinct authenticated four-rune targets
x 2 signs
= 9,162 configurations.
```

There is one hit:

```text
p36 word19 offsets99..102
subtract [1,3,3,1]
-> MEANING.
```

This control is independent of the visible-section receiver restriction.

## Relationship to the retracted GOOD candidate

Authenticated signed word36 is still `GOOD`, so the same-number page route still selects physical p36 as an object worth examining.

The earlier p36 `GOOD` plaintext claim is withdrawn. It was produced by splitting a canonical five-rune word at a printed line wrap. This result uses a different receiver, p36 word19 at offsets99..102, selected directly by the visible authored `1-` marker. The canonical parser confirms it is a complete four-rune word.

The recovered candidate is `MEANING`, authenticated source word20. This changes the interpretation of p36 from a simple same-index word substitution toward an instruction/state page. A source-selected continuation from `MEANING` remains to be established.

## Decision

Preserve p36 offsets99..102 as a **source-selected local `MEANING` plaintext recovery candidate**.

The receiver is independently selected by original layout, the key family is finite and source-derived, the family has one authenticated hit, the exact fixed key is manuscript-selective, and both ciphertext and plaintext H shells are compact reconstructed-state objects.

The original 10-dot bracket now supplies an independent reason to choose `e`: its column signature is `(3,4,3)=(e,q,e)`, and the repeated outer columns are exactly the repeated interior value of the successful palindrome key. The remaining interpretive choice is the palindrome construction itself, using the visible section number on both ends and the symmetric outer-column count inside.

## Reproduction

- `sims/lp2_p36_section1_meaning_state_sft.cjs`
- `.github/workflows/agent43-p36-section1-meaning.yml`
- `resources/historical/cicada2016-4gq25-outguess.asc`
- `resources/liber-primus/lp2-transcription.txt`
- `resources/liber-primus/lp2-corpus.json`
- original images: `resources/liber-primus/53.jpg`, `resources/liber-primus/55.jpg`
- dot geometry: `im-results/lp2-original-large-dot-glyph-geometry.md`
- p6 state packet: `im-results/lp2-p6-master-state-packet.md`
