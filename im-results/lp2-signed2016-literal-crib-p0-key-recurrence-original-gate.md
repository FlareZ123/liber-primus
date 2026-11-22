# Signed 2016 literal crib and p0 additive-key recurrence: original-data decision

**22 November 2026: no unknown-page plaintext or general cipher inverse recovered.** This source-only analysis tests whether the genuine 2016 signed English message can select unknown ciphertext passages by word length, and whether the independently hypothesized opening p0 title supplies a transferable key. Source records: [2016 signed Cicada message](../resources/historical/cicada2016-4gq25-outguess.asc), [original GP29 ciphertext corpus](../resources/liber-primus/lp2-corpus.json), [original printed-word transcription](../resources/liber-primus/lp2-transcription.txt), and [original 256-cell table](../resources/liber-primus/lp2-grid-256.json).

## Signed-word length alignment

All 43 alphabetic words of the authenticated signed message were used in original order. Every contiguous length sequence was matched against the 2,928 physical printed-word fragments on all 55 rune-bearing unknown pages (12,956 runes; 32 semantic words cross page breaks). Fixed letter-length conventions: literal Latin, native GP29 where K is represented by C and accepted digraphs count once, and a version permitting a single NG/ING rune.

- Latin: maximum five consecutive lengths; several locations.
- GP29: maximum six, physical p34 fragment16, source words 27–32, **ARE THE DIRECTION SEEK AND YOU**.
- GP29 with ING-as-one: same p34 match, plus p37 fragment18, source words 16–21, **ARE THE MAP THEIR MEANING IS**.
- No source run of seven lengths matches any original physical unknown page.

**Conditional null:** shuffle the *same 43 words* 100,000 times with fixed-seed unbiased Fisher–Yates, preserving exact authentic lengths and scanning all the original pages. At least one six-length source window matches in **70,557** Latin, **68,582** GP29 or **70,835** GP29-ING permutations (per 100,000). A six-length match occurs in **90,822/100,000** permutations in *at least one* of the three registers. The observed six-gram cannot distinguish a genuine crib from an arbitrary source-text alignment. The experiment is conditional on this fixed source and search family, not a general author-intent probability.

## P0 13-rune title and a six-register prediction

The original red p0 heading is two words of 8+5 runes before its original 13-dot marker. The existing provisional local source reading is **EPIPHANY SEEKS**, already suggested by the 2016 message and retrospective marker analysis. This phrase is a *hypothesis*, not known plaintext. In genuine GP29 index order:

~~~text
Original p0 C[0..12]      15  8 18  3  6 19 27  0 15 26 18 21  5
Proposed EPIPHANY SEECS   18 13 10 13  8 24  9 26 15 18 18  5 15
Inferred (C-P) mod29      26 24  8 19 27 24 18  3  0  8  0 16 19
~~~

On *only the first twelve* inferred key symbols, Berlekamp–Massey over GF29 identifies linear complexity six and recurrence polynomial **[1,9,13,23,22,17,23]**. It predicts symbol13 to be **19**, matching the withheld hypothesized key symbol. This is only one conditional prediction after choosing the title; a 12-element sequence always admits a sufficiently high-order recurrence. It is not historical cipher evidence on its own.

Unchanged extrapolation over all262 original p0 runes under a single global clock, subtracting the predicted key modulo29, returns a **249-rune unknown body** whose IoC is **0.03527011270890012** versus **0.06270996640537514** for genuine clear p57. The beginning is:

~~~text
BEAENGEXSFESYJEAEAYIJJIASOECAENGEAWPNRAEMOECPXREODJLEOXPHIOEPAEAEWFTHGSTFTHOEHIAEOIWTHCBHNAYWOEHOAEWEIITH
~~~

It is nonlinguistic. A planted 95-rune p57 original-source plaintext encrypted under the same predicted recurrence recovers all95, establishing implementation correctness only.

## Original numerical-table consumers

The visibly original 13 middle rows of the p49–51 table offer a simple source motivation to try a 13-rune header key. Twenty-eight fixed direct interpretations were tested: eight columns in each of byte mod29, high base60 digit and low base60 digit; and four whole-row sum/XOR/digit-sum registers. **Zero full 13-rune key matches; best two positions** (low digits, eighth column). As a second direct model, every one of 256 original cells was started as a base59 or base60 successor walk for 13 steps, with four output channels (value, address, first/second digit modulo29): **2,048 readouts; zero complete matches; best three positions**. These exact direct receivers are rejected; more complex, source-authored key serialization remains untested.

## Reproduction and research decision

The [self-contained Node22 CJS test](../sims/lp2_signed2016_literal_crib_original_sft.cjs) reads unchanged source artifacts and asserts source counts, conditional null outcomes, the key recurrence, next-symbol prediction, body transfer, planted control and table tests. Independent Windows Server 2025 / Node22.23.5 [run 44973053712 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44973053712) checked committed source at 88797d8ed3b5681e0fee5b146ffe2f34aa711f11.

**Decision:** A signed word-length match is not a credible direct plaintext crib. The key polynomial's one-symbol hit is insufficient; its unchanged p0 body inverse fails. The literal p50 table-key readouts fail. Do not repeat these searches without a new original clue fixing an authentic word address, state reset, key schedule or substantial untouched plaintext. Preserve the p0 title only as the pre-existing conditional local hypothesis.
