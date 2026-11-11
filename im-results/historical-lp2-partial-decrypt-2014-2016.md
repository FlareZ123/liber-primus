# Historical LP2 partial-decrypt search, 2014–2016

**Finding: bounded negative in the inspectable historical corpus.** No dated, source-aligned partial plaintext or reproducible original-cipher operation for LP2 physical pages 0–55 was found. The historical evidence inspected continues to support only the two known LP2 plaintext controls: p56 (**AN END**) and p57 (**PARABLE**). This is not proof that no private, deleted, or inaccessible participant material ever existed.

## What the early source repositories actually contain

### 2014 contributor archive

[micheloosterhof/cicada-2014](https://github.com/micheloosterhof/cicada-2014) was created 2014-01-10. Its `stage11/` tree preserves the original LP2 page material:

- `49.txt`–`51.txt` and corresponding `.dec` files are numeric/byte representations of the special page blocks, not English plaintext.
- `57.decoded` is present in the archive by 2014-05-11.
- `56.decoded` was committed 2014-05-19; the associated `56.py`/`56.runes` work was committed 2014-05-25.
- The visible page-56 mechanism is the prime-totient shift; p57 is the unencrypted GP substitution control. No unknown-page plaintext with a page/rune offset or historical key was found in this repository.

Direct records: [stage11 tree](https://github.com/micheloosterhof/cicada-2014/tree/master/stage11), [p56 decoded](https://github.com/micheloosterhof/cicada-2014/blob/master/stage11/56.decoded), [p57 decoded](https://github.com/micheloosterhof/cicada-2014/blob/master/stage11/57.decoded).

### 2014 archive index and complete transcription

The later archive [cicada-solvers/neuroretransmit-cicada](https://github.com/cicada-solvers/neuroretransmit-cicada) preserves the [2014 seventh-onion index](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2014/011-seventh-onion/README.md). It explicitly states that the only solved pages in its LP2 material are **56 (totient shift)** and **57 (unencrypted)**. Its p0–55 files are rune transcriptions/possibilities, not plaintext readouts.

The curated [scream314/cicada3301 LP transcript](https://github.com/scream314/cicada3301/blob/master/liber_primus.md) independently gives the same result. Parsing the LP2 portion yields exactly **two** `English:` sections: p56 and p57. The p0–55 page groups are marked with unknown keys (`Key: ?`) and remain runic/numeric source material. Its [2014 chronology](https://github.com/scream314/cicada3301/blob/master/2014.md), [2015 record](https://github.com/scream314/cicada3301/blob/master/2015.md), and [2016 record](https://github.com/scream314/cicada3301/blob/master/2016.md) add the dated stage history and signed messages, but no additional unknown-page plaintext.

## 2015–2016 contributor repositories

- [resvolver/c1cada](https://github.com/resvolver/c1cada) was created 2015-01-05 and last pushed 2016-01-15. Its `translation/transcriptions/` files and `liber_primus.rne` preserve rune transcription. `Better_Odds_Method` is a proposed heuristic and `tasks-todo.txt` is a list of prospective tests; neither supplies a fixed key, original-cipher inverse, page/rune offsets, or recovered unknown-page text. The `ruins/` files are numerical/rune representations, not a prose decrypt.
- [aautcsh/idkfa](https://github.com/aautcsh/idkfa) was created 2016-01-17. Its own `js/main.js` selects only sections **0,1,2,3,4,5,6,15,16** as solved and labels paragraph indices **16–32** unsolved. `js/config.js` supplies only the known keys `[0]`, `DIVINITY`, `[3]`, and `FIRFUMFERENFE`. Its word-guess output is therefore not evidence of an unknown LP2 partial decrypt; the program does not process those unsolved sections as solved text.
- [henkman/liberprimus](https://github.com/henkman/liberprimus) was created 2016-08-14. Its solution directory contains only p56 and p57; the remaining material is transcription/translator tooling, not an unknown-page plaintext recovery.

## Transcript and creator-origin checks

- The small accessible IRC files in the [neuroretransmit archive](https://github.com/cicada-solvers/neuroretransmit-cicada/tree/main/irc-logs) include early-2014 channel material. The inspected snippets concern the earlier stages and predate the 2014-05-02 LP2 release; they contain no LP2 unknown-page decrypt.
- The preserved [Wulfic IRC excerpt](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/reference/community/irc_logs.txt) contains a Profetul/Mortlach discussion of cyclic key-gap patterns (examples include 11 and −18) as a possible explanation for low doublets. It supplies no key stream, page/rune alignment, plaintext, or selected reversible operation. Its linked [Gist](https://gist.github.com/Profetul/bd8ad9cb16c81302382526ea2e4f6e67) was not retrievable through the available GitHub/web interface, so the excerpt remains an unverified historical hypothesis, not a partial decrypt.
- The preserved 2016 PGP-signed message in [scream314/cicada3301/2016.md](https://github.com/scream314/cicada3301/blob/master/2016.md) says “Liber Primus is the way” and that its words, meaning, and numbers are map/road/direction. It is a source-origin clue, but it discloses no unknown-page plaintext, key, or executable cipher operation.
- The small IRC text files in [krisyotam/cicada3301](https://github.com/krisyotam/cicada3301/tree/main/archives/irc-logs) were searched for LP/page/decrypt/plaintext references; no qualifying unknown-page readout surfaced.

### Dated May 2014 short-word progressive-shift cribs: exact local fits, failed general continuation

A [raw-blob-verified 24 May 2014, 23:35 `#cicadasolvers` discussion](https://github.com/FlareZ123/liber-primus/actions/runs/43036813285) supplies a rare **historically dated explicit plaintext hypothesis** for the still-unknown LP2 pages. Physical source line **188,780** of `#cicadasolvers.freenode.log` (blob SHA-1 `bdd277c14f94c34b5ae714cd00c238065beeed4e`) reports a participant's earlier candidate: page35's three-rune contraction **IT'S** under rune shifts **26,27,28**, and page34's four-rune candidate **LESS** under **27,28,0,1**. The original speaker expressly cautions that the sequence works on the single short word only, with no continuation pattern.

These two proposed local conversions are exact against the canonical GP29 original ciphertext, with no resegmentation:

| Original physical page / local rune offset | Literal source GP symbols | Historical additive shifts mod29 | Alleged GP plaintext |
| --- | --- | --- | --- |
| p34 / **81** | `OE M S X` | **27,28,0,1** | **L E S S** |
| p35 / **78** | `P E T` | **26,27,28** | **I T S** (apostrophe carries no GP rune) |

A simple shared rule fitted to these guesses is **`P_(p,j)=(C_(p,j) + 3-p+j) mod29`**, where p is the physical page and j is the zero-based **within-word** rune position. This predicts the candidate words exactly and is reversible, so it can be tested on all the other printed words without guessing additional keys. The fixed rule was applied to all complete same-page rune words on adjacent original physical pages p33–37, yielding these decoded GP29 IoCs:

| Page | In-page runes scored | Original IoC | Fixed progressive-rule IoC |
| --- | ---: | ---: | ---: |
| 33 | 213 | 0.03312960 | **0.03312960** |
| 34 | 259 | 0.03343210 | **0.03340217** |
| 35 | 268 | 0.03502152 | **0.03664263** |
| 36 | 236 | 0.03573747 | **0.03512441** |
| 37 | 228 | 0.03342608 | **0.03450808** |

The five outputs remain near the flat 29-symbol IoC **1/29≈0.03448276**, far from ordinary GP-English text. No surrounding coherent prose, source-selected key schedule or secondary known plaintext was recovered. This **rejects the exact per-word/page progressive shift extension**, while preserving both precise 2014 cribs as historically interesting, **unverified** local guesses. It does not rule out an otherwise specified non-word-reset cipher or historically missing key.

[Executable SFT with original offsets, all 2,896 source words, exact round-trip and five-page controls](../sims/lp2_2014_progressive_contraction_crib_sft.cjs) was successfully executed in [manual source-audit CI run 43038110314](https://github.com/FlareZ123/liber-primus/actions/runs/43038110314). The historical IRC file is source-authentic to the verified Git blob, while the speaker is a community participant; it is **not** an authenticated Cicada key or message.

### Large original IRC archives: access restored and 2016 Pastebin clarified

The previously inaccessible multi-megabyte `neuroretransmit/cicada` IRC logs have now been downloaded **byte-exactly**, with all three Git blob SHA-1 hashes and byte lengths verified on a dedicated manual GitHub Actions runner. Together they cover **698,330 preserved log lines** across `#33012014.freenode.log`, `#cicadasolvers.freenode.log`, and `#cicadasolvers.freenode.2.log`. An exact-case-insensitive `uRkNsGsa` search finds **0, 0, and 2 matches**, respectively.

The recovered **7 January 2016, 12:41** IRC context is decisive about this URL's role: a participant posts `http://pastebin.com/uRkNsGsa` with “Hash for everyone's convenience”; the immediate preview says `Liber Primus p.57 hash - Pastebin.com`, and the archive bot acknowledges `Archived file(s): uRkNsGsa`. Earlier chat concerns the already-printed manuscript hash. The 2016 downloadable-`uRkNsGsa.htm` anecdote therefore identifies an **existing hash repost**, with no source evidence for the missing deep-web page or a reverse-hash preimage. The original Pastebin bytes remain unavailable; the IRC record alone suffices to distinguish its documented function. [Full byte/source audit and runnable scanner](2016-pastebin-irc-original-source-audit.md) · [successful manual run 43034766665](https://github.com/FlareZ123/liber-primus/actions/runs/43034766665).

This archive search authenticates the three archived Git objects as stored, **not** the origin of any participant statement or a Cicada-issued decryption instruction. It settles the former access limitation for these exact files. No unknown LP2 partial plaintext or creator-supplied key was identified in the targeted source material, and no source-selected inverse follows from the recovered URL.

## Decision

No qualifying 2014–2016 unknown-LP2 partial decrypt or creator-origin key disclosure was found in the inspectable source repositories and transcript excerpts. The concrete historical record remains the p56/p57 controls, numeric p49–51 material, and one unvalidated 2016 key-gap hypothesis. Keep all of these distinctions explicit; do not promote the hypothesis or numeric payloads to plaintext evidence.
