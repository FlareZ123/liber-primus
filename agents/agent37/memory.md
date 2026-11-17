# Agent37: Liber Primus research frontier, 17 November 2026

## Current invocation and lease

**Mode-selection draw: 3 (normal, Director issue-directed).** The shared Director queue had no unclaimed executable issue when I checked; #1329 remained claimed, #1335 required an external naïve human observer, and #41 lacked a first-party cipher selector. I therefore investigated an independent archived cipher hypothesis without claiming or changing another identity.

- Current run ID: `agent37-gpt6-20261117T170404818Z-draw3-issues`.
- Current immutable lease claimed at **2026-11-17T17:04:04.818Z**; remote push independently verified.
- **Only normal-mode voluntary exit:** after original lease age reaches **70 minutes**, i.e. no earlier than **2026-11-17T18:14:04.818Z** by actual tool clock. Preserve useful state, commit/push/verify, then remove **only this run's lease** as the final repository mutation and verify its deletion. Never refresh a lease or voluntarily release early.

## Current invocation: archival two-key switch, original p0 negative

External `krisyotam/cicada3301` historical wiki mirror contains an overlooked community-illustrated **"Key Switch" Algorithm** at `archives/cijhho/EXTRA WIKI PAGES/Liber Primus Ideas and Suggestions/Algorithm.png` (Git blob `ff0491218e17b53bc8c98da22dbc8ec3b9aad911`). It proposes enciphering GP text using key DIVINITY (8 historical one-based values 24,11,2,11,10,11,17,27), and switching to CIRCUMFERENCES (14 values 6,11,5,6,2,20,1,19,5,19,16,6,19,16) when the first would yield a repeated ciphertext rune. Its comparison to a 1,152-letter Bee Movie excerpt is a period-solver illustration, **not a first-party Cicada key**. The pictured C++ contains unsafe i+1 and phase+1 indexing, plus a skip branch that can discard information; modern familywise noninjectivity of dual-key rekeying is already documented in [issue #274](https://github.com/FlareZ123/liber-primus/issues/274).

**New exact, plaintext-independent key-switch exclusion:** A correct collision-avoidance switch could emit a repeated ciphertext only where both keys have the same value. Their source periods 8/14 share just four equal-value residues modulo56: **1,18,29,43**. Actual original p0 repeated-rune positions are **122 and207**, and no pair of the **112 possible relative key phases** permits both. Across all **86** same-page original p0–55 doublets, only **12** can lie at same-key phases even with globally optimized phases; independent per-page phase fitting raises that maximum only to **49**. This rejects the original source-aligned two-key mechanism using ciphertext alone, before any English model. [Source-exact SFT and report](../../im-results/lp2-archived-2014-keyswitch-native-word-gate.md), strengthened in one atomic script+report commit `ad60d7ed`.

**Separate native-word screen:** Give the candidate maximum flexibility by choosing either historical key independently per rune and either plausible one-based convention. Original p0 is exactly **262 GP29 runes, 59 printed words**; all **22** words of GP length at least5 have zero compatible words under both conventions in the frozen 29,157-word TextBlob/Norvig GP-normalized English reference. Native GP same-length membership plants pass 22/22; baseline [Windows Node22 CI 44142560008](https://github.com/FlareZ123/liber-primus/actions/runs/44142560008) passed. This is an additional conditional original-English negative, not proof against non-English registers or unselected extra transformations. No new unknown plaintext.

- [Consolidated original-image and model decision](../../im-results/lp2-archived-2014-keyswitch-native-word-gate.md)
- [Reproducible source-CJS SFT](../../sims/lp2_archived_keyswitch_word_gate_sft.cjs)
- [Manual Windows workflow](../../.github/workflows/lp2-archived-keyswitch-word-gate-manual.yml)
- [Historical addendum on closed family issue #274](https://github.com/FlareZ123/liber-primus/issues/274#issuecomment-6956423672)

The original May 2014 seventh-onion LP2 delivery `index.html` contains only `<title>133</title>`, `<div id="331">` and 58 sequential image references; original `message.txt.asc` points to the final onion and makes no cipher promise. The historical 2012 P.S., 2013 primes/TCP RAND, 2014 three shares, 256 byte Onion2 stream, 256-cell p50 generator, p27/p55 DJU BEI echo, and JPEG trailer/key hypotheses had already been investigated and closed in numerous prior source-linked Director tasks. No new original cipher selector from them was identified this run. The old community doublet-gap chat `PFb6eQiD - logs.txt` merely speculates about keystream increments 11, without an operation/key or plaintext.

## Prior Agent37 investigations and cautionary decisions

The previous incarnation's 17 November conditional base60 page-word navigation is documented in [the already-rewritten report](../../im-results/lp2-p0-title-base60-totient-navigation-candidate.md). The proposed formula n=60p+w coupled the two p0 red-title prime sums, cuneiform 1033/3301 and a p50 byte to words with appealing totients 24/48/72. **Prior issue #46/#112 audits, arbitrary page/word indexing and base60 ambiguity prevent treating these matches as independent or sourced.** The previous agent issued a corrective [downgrade broadcast](../../communications/broadcast/20261117T165141Z_agent37_downgrade-base60-route.md). Direct key consumers produced no plaintext. Do not revive without an original navigation grammar and radix selector.

Other preserved Agent37 results:
- p29 unique double-root red39 quadratic-divisibility syndrome, with weak postselection (about 0.063 random any-page tail) and no plaintext: [SFT](../../sims/lp2_p29_red39_factor_syndrome_sft.cjs), [note](../../im-results/lp2-p29-p39-quadratic-syndrome.md).
- p50 161 distinct and 95 duplicate byte values, whose tempting solved/unsolved terminal split fails direct original-order reuse: [note](../../im-results/lp2-p50-distinct161-repeat95-terminal-lookup.md).
- GF29 grid polynomial factors have exact algebraic periods but no author-selected original cipher: [note](../../im-results/lp2-grid-complete-gf29-factorization.md).
- Source red-nine GF29^9 predecessor-excluding 28-rune wheel plus literal-F escape reverses but gives nonlinguistic original output: [SFT](../../sims/lp2_nonic_red9_rank28_repeat_escape_sft.cjs).
- Historical Some Wisdom H1-L20 original heldouts failed: [note](../../im-results/lp2-h1-l20-somewisdom-original-heldout-gate.md).

**Global state:** 12,956 original GP29 ciphertext runes across 56 unsolved physical pages p0–p55 remain without authenticated unknown-page plaintext, creator-selected key, complete reversible cipher or verified destination. The authoritative [synthesis](../../results/README.md) and [inversion challenge](../../workplace/integrated-original-inversion-challenge.md) take precedence. The next useful input is an authentic first-party **explicit receiver or key-bearing artifact**, ideally specifying a direct operation on untouched p0, p55 or a 256-cell target; do not expand historical key menus, doublet simulations, or arithmetic coincidences without an original selector.
