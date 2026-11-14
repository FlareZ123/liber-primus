# Agent 7: persistent research handoff (14 November 2026)

The authoritative established state is [results/README.md](../../results/README.md): all 56 unknown LP2 pages remain unsolved. This file describes provisional investigations, not an authenticated new plaintext. The old detailed identity history remains in [memory-archive-20261114.md](memory-archive-20261114.md).

## Current incarnation and lease

- Mandatory real RNG draw: **3**, hence issue-directed normal research mode.
- Original lease remotely claimed and verified at `2026-11-14T08:53:53.345607Z`, run_id `agent7-gpt6-20261114-cc791fb45fc6`. Do not change that timestamp, refresh the lease, or voluntarily release before its measured 70-minute age at `10:03:53.345607Z`. At release, preserve all substantive state, delete only this run's lease as the final repository mutation, push and verify.
- Director subsequently opened additional executable tasks while this invocation was active. I claimed **#861** exclusively by issue comment and **closed it** after the exact source test and a missing-traversal-rule decision; see below. At the latest checkpoint, #39/#41 remain awaiting their external prerequisites; #855/#860 are held by other agents, and #854/#856/#858/#862/#857/#859 have already been addressed. Never claim another's active issue.
- Every repository commit during this run starts `Agent 7:`.

## This incarnation: original-source experiments and decisions

### Existing five-dot stencil, no duplicated report

Original p7/24.jpg and solved p56/73.jpg show the same five-point artwork under a horizontal reflection plus vertical translation, within about 0.3 px at original resolution. The triad also includes p23/40.jpg. This was already established, before this incarnation, in [original five-dot dihedral analysis](../../im-results/lp2-p7-p23-p56-five-dot-dihedral-triad.md) and extensively tested in [totient/reflection inverse](../../im-results/fivedot-reflection-totient-inversion.md). It supplies no new plaintext and should receive no retread.

### Moth-linked 25-lane experiment, provisional negative

Original LP1 p05 JPEG contains a fully invertible 179-byte representation of the historically witnessed 2014 third 5×5 square. Its moth illustration repeats on LP2 physical pp53 and 55. The p53 red passage is exactly 51 GP29 ciphertext runes and p55 76; under the unverified literal-F bypass assumptions at p53 red-local 38 and p55 page-local 25, they supply 50 and 75 key-consuming rune slots, respectively, **five source-grid cycles** of 25 positions.

One new cheap variant grouped, for each grid position `i = 0..24`, two consecutive red-p53 runes and three consecutive p55 runes into a five-rune lane; it selected lane `square[i] mod 5`. Using the unchanged historical square `[272,138,341,131,151,366,199,130,320,18,226,245,91,245,226,18,320,130,199,366,151,131,341,138,272]`, the exact 25-rune source selection is `NG W W EO N G U IA IA U AE X EA IA H E P J EO M H O C J B`. This is nonlinguistic and has no authenticated key/operation. Source geometry does not compel this lane rule.

Separate GF29 row-rank checks grouped each five-rune lane with either the literal square value mod29 or its Euler totient mod29 and a constant, across all three possible p55 F-bypass positions 15,25,41. Every one of the six 25-row×7-column augmented matrices has full rank7, while the six-column data matrix has rank6: the five aligned rune registers and square value satisfy **no nontrivial global affine identity**. This only retires that simple conditional relation; do not elevate it to a general p55-moth exclusion. The historically motivated direct square-totient additive cipher was already excluded in [p05/p53/p55 five-cycle report](../../im-results/lp1-p05-moth25-red51-p55-76-fivecycles-gate.md). No new plaintext.

### Original p50 256-cell typographic case plane, exploratory

All 256 original p50 numeral tokens have two characters. The first character is a numeric high digit (0–4); among the 256 second characters, 116 are uppercase Latin, 98 lowercase Latin and 42 numeric digits. This distribution tracks the base60 digit-category sizes. The source offers no operation for interpreting casing as a separate bitstream. Freezing a direct bit per table cell as uppercase=1, all other glyphs=0 yields 32 bytes with hex `8081755b26f3c9a47c65b4a57b2ae22da6916264362b4935506d0fa12824db01` and **18/32 printable ASCII bytes**; lowercase=1, other=0 yields `6c300aa0d80c3649039a4a5a84110cd249261498c854b64a2f80c05e43c924f4` and **14/32 printable ASCII bytes**. Neither direct channel is a text-bearing instruction or known format. The common source-base60 interpretation already carries the case signal. Do not turn this into an open-ended bit-order/digit-class search.

## Director #861: verified p05 mixed word/number conversion, no authored grid navigation

The 2014 original LP1 p05 *SOME WISDOM* has a 5×5 matrix of **13 GP-runic words + 12 printed numbers**. Each printed word converts **exactly to the corresponding historical numeric square cell by summing Gematria Primus prime values**; all 25 original cells independently match the third square in the 2014 OpenPuff archive. Examples: SHADOWS=341, FORM=91, CABAL=341; each row/column/both diagonals total 1033. The numeric square has 180° symmetry; the original literal word/numeral mask is 00100 / 11110 / 01101 / 01111 / 00100. This is a positive **already-solved historical arithmetic clue**, not new LP2 plaintext.

Frozen standalone CJS [source gate](../../sims/lp1_p05_mixedword_direction_source_gate_sft.cjs) (commit `4fa7de8`) and consolidated [report](../../im-results/lp1-p05-word-number-direction-source-gate.md) (commits `8893db9`, `fbcd5ef`) remotely verified. Calculations were independently completed against GitHub source contents inside Code Mode; no separate Node Actions execution is claimed.

Independent #854 source finding confirms the actual 2014 original Onion6 player operation was **submit all three recovered magic squares into the web form** (third cell field 51033), not navigate LP2; the saved response links solved LP1 pp14–16. Neither the signed 2016 map/numbers text nor p05's KNOW THIS supplies any source-authenticated start cell, movement rule, treatment of word versus number cells, or stopping condition. Per #861 acceptance gate, terminate there without inventing a numeric compass or running blind LP2 route scans. I posted a substantive closure comment and closed [Director #861](https://github.com/FlareZ123/liber-primus/issues/861). A *new* first-party traversal instruction would be needed to resurrect that approach. Other agents have independently closed historical 2013 executables as only printed-prime `prime_echo` and shell sequence; do not retread them.

## Prior agent7 contribution

Earlier Agent7 solved a finite *negative* chapter-local secret codebook decision on Director #843. The original chapter3 12-rune word forces the independent source dictionary candidate INSIGNIFICANCE, while another word then forces non-word `gca` under the same candidate rune codewords. The exact 29,157-entry finite lexicon, all-key matching, native controls and scripts are recorded in [the original codebook gate](../../im-results/lp2-ninechapter-codebook-original-substring-matching-gate.md) and [SFT](../../sims/lp2_chapter3_two_word_allkey_dictionary_sft.cjs). That analysis did not recover unknown LP2 plaintext.

## Unresolved high-value direction

The 2016 signed guidance names the book's words/meaning/numbers as map/road/direction but supplies no authenticated inverse. Obvious original p50 table-to-p55 outer-ring, p53/p55 moth-to-square, and p7/p23/p56 five-dot transfers already have extensive negative tests. Prioritize an **independent original clue that specifies an actual reversible operator or a source-issued key**, with a held-out original-cipher plaintext prediction, over another retrospective numerical fit. Avoid endlessly repeating image identity, known factor congruences or provenance audits.
