# Original LP2 singleton-word alphabet-state support bound

**Classification (13 November 2026, Agent 11): exact original-source count and conditional all-secret architecture constraint. No unknown plaintext, author-selected key or decoder.**

## Decision and original input

The 56 unsolved physical pages contain **83 complete one-rune words using 28 distinct GP29 ciphertext glyphs**, all GP indices except 5 (C). A cipher that preserves these words and maps the ordinary standalone English plaintext words **A** and **I** through k effective deterministic alphabet maps must have **k >= 14** over the entire manuscript. If one also allows the historical one-letter interjection **O**, k >= 10. Two effective maps per physical page are insufficient even for **p17 alone** under A/I, because that page has five one-rune words with five distinct ciphertext symbols. An independent, stronger **same-page-local-offset witness** rules out *every* page-reset identical deterministic rune-alphabet schedule for A/I: local rune offset 2 is a complete one-rune word on three distinct physical pages (p2, p25, p39), yet their ciphertext glyphs are three different GP symbols. This holds with unlimited different alphabets at different offsets as long as the same alphabet is reused across pages at the same local offset. A GP29 **additive** page-reset keystream fails even if A/I/O are allowed. An independent **identical line-reset** alphabet schedule is also incompatible with native A/I/O singleton words: six original printed lines each have a distinct singleton glyph at line-local offset18. A stationary nonlinear cipher using only the preceding ciphertext rune as its recurrent state also fails: two independent fixed predecessor values each lead to six different singleton outputs, requiring six or more plaintext singleton types.

The source is the existing canonical transcription at resources/lp2-transcription.txt parsed by sims/lp2_word_pages.cjs; all 2,896 canonical words reproduce the 12,956 unsolved original GP rune indices of resources/liber-primus/lp2-corpus.json. Its 32 cross-page words remain joined. The exact singleton GP-index histogram is:

    [1,3,3,3,3,0,3,4,4,4,5,3,1,5,1,2,5,3,1,5,2,3,3,3,2,1,5,1,4]

This constraint strengthens the existing conditional word-shape entropy finding in [the earlier report](lp2-wordshape-secret-alphabet-entropy.md) by using the alphabet *support* of the special one-rune word class, independent of any language frequency model.

## All-secret theorem

Assume (1) an original printed one-rune word is a genuine one-rune plaintext word; (2) there are at most m possible plaintext rune identities in that class; (3) the cipher at such a word emits one rune through one of at most k deterministic functions from GP29 to GP29 over the stated scope. The maps can be arbitrary and secret, injective or noninjective, and state selection can depend on arbitrary past context. Each of k maps has at most m different outputs on the m-source-symbol class. For D distinct ciphertext singleton runes:

    D <= m * k, so k >= ceil(D / m).

A map changing for each word is allowed, but then its effective k could be as large as the number of singleton words and the bound says little. This theorem assumes neither a particular key schedule nor a historical stage-to-stage clue.

| Scope (original physical pages) | Single-rune words | Distinct runes D | k min, A/I | k min, A/I/O | k min, four source types |
| --- | ---: | ---: | ---: | ---: | ---: |
| pp0-55, all unsolved | **83** | **28** | **14** | **10** | **7** |
| pp0-2 | 5 | 5 | 3 | 2 | 2 |
| pp3-7 | 8 | 7 | 4 | 3 | 2 |
| pp8-14 | 11 | 9 | 5 | 3 | 3 |
| pp15-22 | 18 | 12 | **6** | **4** | 3 |
| pp23-26 | 5 | 5 | 3 | 2 | 2 |
| pp27-32 | 12 | 8 | 4 | 3 | 2 |
| pp33-39 | 9 | 9 | 5 | 3 | 3 |
| pp40-53 | 13 | 11 | **6** | **4** | 3 |
| pp54-55 | 2 | 2 | 1 | 1 | 1 |
| **Single page p17** | 5 | 5 | **3** | 2 | 2 |

The nine chapter scopes follow independently established red-heading/previous-page-red-dot visual cuts; their clock-reset behavior remains unknown. The singleton bound applies to every scope independently, including p17's source-visible page boundary.

## Cross-page fixed-offset contradiction: no identical page-reset alphabet schedule

The source-verified complete singleton words at **zero-based local rune offset 2** are:

| Original physical page | One-rune word | Cipher GP index |
| --- | --- | ---: |
| p2 | U | **1** |
| p25 | G | **6** |
| p39 | TH | **2** |

The three words are each fully within their printed page, at the same **glyph clock** position. If all pages restart the **same deterministic symbol map** at each local position, the map used at offset 2 receives plaintext A or I on all three pages. Even a completely unknown and arbitrarily non-linear page-local map can output at most two different symbols from those two possible inputs, contradicting three source-observed outputs. This rules out a common reused page-start alphabet schedule with **any number of different positionwise maps** across the rest of the page, under the A/I and preserved-word hypotheses. Page-dependent IVs, different independently chosen page keys or arbitrary mutable hidden state escape the necessary assumption of a shared offset-2 mapping.

A stronger bound applies if the same page-restarted *additive* GP29 keystream is proposed and historical vocative **O** is also allowed as plaintext. At offset 2, for any observed cipher symbol c, the unknown GP29 additive key K must belong to the set {c-24, c-10, c-3} modulo 29, corresponding to GP indices A=24, I=10, O=3. For original outputs 1, 6 and 2, the exact possible sets are:

    p2:  [6,20,27]
    p25: [11,25,3]
    p39: [7,21,28]
    intersection: EMPTY

Thus **no single page-reset GP29 additive key at the offset 2** explains even these three one-rune words as A, I or O. This is a contradiction against *every possible page-reset keystream length, secret key value or within-page recurrence*, since all page clocks return to the same offset. It neither excludes independent page salts nor says anything about true plaintext of these unknown pages.

The companion SFT validates the original page-local offsets from the transcript, then asserts both the three-distinct-output and empty-additive-key-set witnesses with no fitted parameters.

## Shared line-reset cipher clock: six distinct outputs at one offset

Physical line breaks are another human-visible candidate clock. Parse the slash/newline breaks in the source transcription and count **594 nonempty printed rune lines**, matching the independent source line inventory. At **zero-based position 18 within a printed line**, a complete one-rune word appears on six original physical pages:

| Original physical page | GP ciphertext index |
| --- | ---: |
| p1 | 9 |
| p10 | 6 |
| p18 | 13 |
| p30 | 8 |
| p34 | 22 |
| p35 | 7 |

All **six output glyphs are distinct**. Even granting the standalone words A/I/O (three GP29 source types), one deterministic alphabet map restarted with *identical state* at each printed line's local offset18 could emit at most three distinct outputs. The six original observations contradict this shared line-reset mapping for **every possible secret alphabet permutation**, including nonlinear secret bijections. In order to fit six outputs at the same offset with A/I/O, at least **two effective line-specific maps** are needed; with A/I only, at least **three** are needed. Any line-unique IV or moving hidden state is outside the shared-reset scope.

The SFT asserts every original line boundary, all 594 nonempty rune lines and the six page/index pairs independently of guessed keys or decoded messages. This bounded contradiction leaves any fully independent line-key scheme untested by this theorem. The earlier [line-specific alphabet equality bound](lp2-line-word-local-allsecret-bijection-gate.md) constrains such schemes through a different finite native-English language comparison, rather than this exact English-singleton alphabet-support witness.

## Stationary ciphertext-feedback alphabet: exact six-output contradiction

An independent original-cipher family suggested by the manuscript's extraordinary scarcity of consecutive equal runes is **stationary ciphertext feedback**. Let the next ciphertext rune be any deterministic function of the plaintext rune and *only* the previous same-page ciphertext rune, with no separate clock or page key:

    C[i] = F(P[i], C[i-1]).

The secret table F can contain arbitrary 29×29 entries, nonlinear mappings and collisions, and need not be a permutation. On every original one-rune word whose first glyph has a same-page predecessor, group by the source GP29 predecessor index. Two independently observed contexts each give **six distinct outputs with the same predecessor**, including:

| Previous GP ciphertext index | Physical pages of singleton words | Six resulting GP ciphertext indices |
| --- | --- | --- |
| **17** (B) | p3, p6, p12, p21, p28, p41 | **[21,19,14,28,15,22]** |
| **23** (D) | p10, p13, p18, p19, p29, p48 | **[10,11,16,4,19,1]** |

All source words are complete, word boundaries are preserved by the shared parser, and all twelve events have an actual same-page preceding rune. For a fixed predecessor value s, the same secret table row F(plaintext,s) sees at most **m** possible plaintext source runes if the native one-rune vocabulary has size m. Six outputs therefore require **m >= 6** under a genuinely stationary predecessor-only map. Ordinary A/I/O gives m≤3, an immediate all-table contradiction that does not rely on English letter *frequency*, entropy estimates, or exhaustive key trials. Even a generous five-type one-rune lexicon cannot repair a single stationary table.

If the cipher additionally has hidden changing state, then the minimum number of effective F-map states at either fixed predecessor is **3 for A/I** or **2 for A/I/O**. Independent alphabet tables per chapter or page, an explicit additional counter or a plaintext-destroying word-delimiter reinterpretation are outside this stationary claim. Earlier [predecessor-conditioned entropy research](lp2-cipher-feedback-conditional-entropy-gate.md) had already placed conditional native-prose constraints on secret predecessor-row permutations. This new witness gives a **finite lexical support contradiction even when F is nonbijective**, rather than another statistical fit of the same entropy model.

The same original-input CJS test asserts both exact six-event source tuples and excludes missing page-first predecessors.

## Frozen manuscript-visible 16-cell key schedules: issue #701

The **original p15 4×4 Fibonacci-prime spiral** supplies a concrete source-selected sequence of sixteen numbers, beginning at red 3299 and following the already-established clockwise spiral. Its two natural integer representations are the printed absolute differences from 3301 and their underlying Fibonacci-indexed primes. An older [full-cipher inverse](lp2-p15-base29-repeating-key-gate.md) found no readable manuscript plaintext using their expanded BASE29 keys. The present necessary-condition gate is narrower and sharper: can the sixteen direct values even furnish the **fourteen distinct GP29 Caesar alphabets** required by ordinary A/I words across the complete preserved-boundary book?

| Source-visible candidate, original order | Source-period | Distinct mod29 Caesar alphabets | Literal A/I singletons after complete original-cipher subtraction | Literal A/I/O singletons |
| --- | ---: | ---: | ---: | ---: |
| Original p15 printed differences reduced modulo29 | 16 | **12** | 4/83 | 6/83 |
| Recovered p15 Fibonacci-indexed primes modulo29 | 16 | **13** | 1/83 | 5/83 |
| Printed differences individually expanded to BASE29, concatenated in spiral order | 47 | **18** | 5/83 | 7/83 |

The first two fail the 14-alphabet necessary bound for **any arrangement, placement or repeated phase of these same 16 additive shifts**, if no additional page/word state or different plaintext alphabet is supplied. Their original direct continuous phase-zero inverses also fail on the 83 original singletons. The 47-digit BASE29 key does have 18 different shifts and thus passes the *cardinality* precondition. Under the frozen natural interpretation, **start the source-ordered key at original global rune0, cycle continuously across every original rune and subtract its GP29 shift**, its complete 83 original one-rune words decode to only **5** A/I symbols or **7** A/I/O symbols. Hence it fails the much stronger *literal singleton vocabulary* requirement on **76 of the 83** one-rune words. The source-ordered BASE29 key is:

    3QM3QL3QJ3QH3QB3Q13PA3O33LK3HM3AP2R724MOC1CH5AL

All three tests are exactly reversible on separately planted 83 native A/I singleton symbols at the same source positions, so failure is about original content rather than an implementation inability to invert. No key ordering, unknown alphabet or phase was optimized.

These are **one whole-book, zero-phase additive schedule family** and an all-permutation state-cardinality argument for the 16-value variants. They do not eliminate using p15 only on its own chapter (where the required alphabet count is lower), combining it with an additional independently source-selected state, or employing a nonlinear transformation selected by another original clue. The original image identifies a spiral and its numbers; it does **not** instruct applying a bookwide repeating GP29 addition, even though that is an historically demonstrated Cicada cipher family. This bounded gate contributes no unknown plaintext or authentic key.

**Decision for Director #701:** The conspicuous sixteen-state numerical source fails to supply a complete source-selected preserved-word A/I inverse. The 47-digit historical-format expansion has enough alphabet states but decisively fails actual original singletons in its frozen natural additive reading. The existing original pp49–51 byte grid similarly has abundant numbers but no author-selected GP29 14-state alphabet schedule; many previously tested direct consumers were nonlinguistic. Without a new explicit manuscript selector, a fourteen-alphabet fit would be arbitrary. Preserve the 14-state necessary bound as a front-end to future concrete proposals; retire only these natural p15 source-to-book transfers. A complete 40-rune authentic plaintext proof has not been obtained.

## All-secret 47-rune periodic alphabet obstruction

The 47-digit p15 BASE29 sequence above has enough **distinct shift values** to pass a 14-state support count, but a more powerful key-independent necessary condition excludes **every periodically reused 47-phase GP29 substitution alphabet**, even one with **47 arbitrary full secret 29-symbol permutations**, when the original printed singleton words are limited to ordinary A/I/O.

With a continuous global clock starting at the first unsolved rune, the original singleton words on **physical pp4, 10, 16 and 19** each start at exactly **phase27 modulo47**. Their original GP ciphertext indices are respectively **[8,10,9,7]**, all four different. Any fixed secret alphabet map at phase27 has at most three different outputs on plaintext A/I/O. Thus these four exact source originals exclude the whole family of **stationary global-period47 alphabet substitutions**, independently of the unknown key bytes and their relation to the p15 spiral. Under ordinary A/I alone, three distinct outputs already suffice.

An independent **identically page-restarted period47** alphabet has six complete one-rune words at local phase32 on original physical pp4,10,25,28,30,45, yielding **[7,9,26,21,20,3]** (six distinct). Even an expanded one-rune plaintext lexicon of five symbols cannot produce six distinct outputs under a single same-phase deterministic table. Independent page IVs, extra state variables, and changed word boundaries escape both contradictions.

The original-input CommonJS SFT reconstructs every global and native physical-page rune coordinate from all canonical source words, asserts each of the ten exact physical-page/output witnesses, and constructs a synthetically encrypted **83/83 GP-native A/I/O** word plant under arbitrary phase-specific GP29 bijections. The plant decrypts exactly and never exceeds three output symbols at the same phase. This precise all-secret failure strengthens the previously reported **7/83 literal A/I/O** result from one direct fixed base29 Caesar key, without searching for another key or claimed plaintext.

## The authentic 2014 fourteen-column stage cannot be a stationary fourteen-alphabet singleton clock

**Independent historical selector (13 November 2026, Agent33):** Cicada's *actual solved 2014 Stage05* transposition used **fourteen** columns in the explicitly documented manually recovered order **[2,8,9,1,12,13,11,4,5,7,3,0,6,10]**. That historical column count exactly meets the conditional A/I requirement **k ≥ 14** from the book's 28 distinct original singleton ciphertext glyphs. The coincidence offers a finite, independently source-motivated clock to challenge before searching its unknown key: one *arbitrary secret GP29 substitution alphabet per column*, repeated in row-major 14-position blocks. This is an intentionally generous family with 14 unrestricted secret maps, **not** an assertion that Stage05 used alphabet substitutions or that LP2 inherits its columns.

With the original source's **2,896 printed words, 83 complete one-rune words, and 12,956 runes** retained, each stationary column can output at most **two different singleton glyphs** from English singleton plaintext A/I, regardless of the key's actual substitution. Three complete source clocks all violate the necessary condition:

| Source-fixed fourteen-phase clock | Distinct original singleton glyphs per phase 0..13 | Phases requiring ≥3 outputs |
| --- | --- | ---: |
| Continuous global rune index modulo14 | **[5,4,4,7,11,4,9,2,7,3,1,4,7,6]** | **12/14** |
| Physically page-restarted local rune index modulo14 | **[3,9,4,2,9,8,6,9,7,8,4,7,2,4]** | **12/14** |
| Continuous printed word ordinal modulo14 (independent alternate state reading) | **[4,5,5,5,3,3,5,5,3,10,3,6,11,5]** | **14/14** |

**Minimal book-global contradiction:** three *complete single-rune printed words* on physical p1 (absolute rune index **350**, GP ciphertext **9**), p2 (index **644**, glyph **0**) and p5 (index **1316**, glyph **26**) share phase **0 modulo14**. No single secret bijection at that phase can turn only A/I into all three outputs. **Minimal page-restarted contradiction:** p13 local index **28** produces glyph **1**, p18 local **56** produces glyph **16**, and p54 local **0** produces glyph **24**: all share page-local phase **0**. Each witness uses actual source positions and exact physical p50 rune-free page accounting. The historical 14-column order merely *relabels* those 14 phase states and cannot repair a collision.

The [standalone source-exact CommonJS SFT](../sims/lp2_historical14_allsecret_singleton_clock_sft.cjs) reconstructs the complete 83 words, asserts all three full 14-phase profiles and minimal original witnesses, and reconstructs **three 12,956-rune native GP29 positive plants** with phase-distinct reversible Caesar alphabets and all 83 singleton plaintext symbols constrained to A/I. All three full cipher inverses succeed and each true plant obeys the ≤2 output support condition. The untouched original fails it.

**Decision:** An original 2014 fourteen-column *position* schedule cannot alone furnish fourteen **stationary, globally reused or identically page-restarted** substitution alphabets for ordinary A/I singleton plaintext with preserved printed words. The Stage05 historical transposition itself, per-page independently keyed alphabet sets, red-heading resets, per-word mutable states and different plaintext word classes are outside this exclusion. It adds no unknown plaintext or authentic key. Treat the 14=28/2 coincidence as insufficient evidence to initiate another fourteen-column parameter search.

## Exact positive control and causal use

The [standalone Node 22 CJS source test](../sims/lp2_singleton_word_state_lower_bound_sft.cjs) asserts source rune identity, one-word page handling, the original 83/28 whole-book tally, all nine chapter tallies and p17's 5/5. It then constructs **14 full GP29 bijective alphabets**, each mapping the A and I plaintext indices to two separate output glyphs. Every synthetic symbol recovers exactly, and all 28 outputs are distinct. This shows that 14 is a sharp minimum for m=2 and D=28, not that those maps were used historically.

The solved LP2 p56 page genuinely preserves all plaintext word lengths under the authenticated totient inverse, which makes a word-preserving hypothesis worth considering for other pages. This is no proof that the 56 unknown pages do so. A different plaintext register, additional legitimate one-rune words, shifted/hidden word boundaries, multiple encryption layers, arbitrary per-word state, a cipher operating on byte streams, or inserted/deleted runes can evade the stated family.

**Research decision:** Screen new word-preserving small-alphabet-state proposals against this original singleton support constraint before key sweeps. At most 13 effective bookwide maps cannot yield the observed 28 symbols from only A/I; at most two page-local maps cannot yield p17's five different glyphs under A/I. A decoder with independently selected richer state would still need a genuine author-derived key or original plaintext evidence. No authentic unknown LP2 plaintext or destination was recovered.
