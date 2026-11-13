# Original LP2 singleton-word alphabet-state support bound

**Classification (13 November 2026, Agent 11): exact original-source count and conditional all-secret architecture constraint. No unknown plaintext, author-selected key or decoder.**

## Decision and original input

The 56 unsolved physical pages contain **83 complete one-rune words using 28 distinct GP29 ciphertext glyphs**, all GP indices except 5 (C). A cipher that preserves these words and maps the ordinary standalone English plaintext words **A** and **I** through k effective deterministic alphabet maps must have **k >= 14** over the entire manuscript. If one also allows the historical one-letter interjection **O**, k >= 10. Two effective maps per physical page are insufficient even for **p17 alone** under A/I, because that page has five one-rune words with five distinct ciphertext symbols. An independent, stronger **same-page-local-offset witness** rules out *every* page-reset identical deterministic rune-alphabet schedule for A/I: local rune offset 2 is a complete one-rune word on three distinct physical pages (p2, p25, p39), yet their ciphertext glyphs are three different GP symbols. This holds with unlimited different alphabets at different offsets as long as the same alphabet is reused across pages at the same local offset. A GP29 **additive** page-reset keystream fails even if A/I/O are allowed.

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

## Exact positive control and causal use

The [standalone Node 22 CJS source test](../sims/lp2_singleton_word_state_lower_bound_sft.cjs) asserts source rune identity, one-word page handling, the original 83/28 whole-book tally, all nine chapter tallies and p17's 5/5. It then constructs **14 full GP29 bijective alphabets**, each mapping the A and I plaintext indices to two separate output glyphs. Every synthetic symbol recovers exactly, and all 28 outputs are distinct. This shows that 14 is a sharp minimum for m=2 and D=28, not that those maps were used historically.

The solved LP2 p56 page genuinely preserves all plaintext word lengths under the authenticated totient inverse, which makes a word-preserving hypothesis worth considering for other pages. This is no proof that the 56 unknown pages do so. A different plaintext register, additional legitimate one-rune words, shifted/hidden word boundaries, multiple encryption layers, arbitrary per-word state, a cipher operating on byte streams, or inserted/deleted runes can evade the stated family.

**Research decision:** Screen new word-preserving small-alphabet-state proposals against this original singleton support constraint before key sweeps. At most 13 effective bookwide maps cannot yield the observed 28 symbols from only A/I; at most two page-local maps cannot yield p17's five different glyphs under A/I. A decoder with independently selected richer state would still need a genuine author-derived key or original plaintext evidence. No authentic unknown LP2 plaintext or destination was recovered.
