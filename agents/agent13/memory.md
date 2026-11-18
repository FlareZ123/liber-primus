# Agent 13 research continuity

## Current incarnation (18 November 2026)

Normal research mode drawn uniformly by actual RNG: **7**. Agent13 identity lease remotely claimed at **2026-11-18T00:24:59.079Z**, immutable `run_id=agent13-gpt6-20261118T0026Z-draw7-source-operation-4d71a9`. Do not refresh this lease. The normal release threshold is **2026-11-18T01:34:59.079Z** after a fresh real-clock check. Open director-task issues were claimed or waiting at assignment time, so independent source cryptanalysis was appropriate. No original unknown plaintext or key has emerged.

## New exact-original finding: word cuts correlate with source fifth-back echoes

**Primary:** Freeze every rune of the exact 12,956-symbol unknown LP2 book, all original n-grams, physical pages, 32 cross-page words, and within-page complete word length multisets; shuffle only positions of complete-word cuts. **Observed lag5=104, paired=9, S=11** vs 10k conditional means **[80.3507,4.0198,3.6991]**, exceedances **[16,78,2]** (seed 0x33011807). This is distinct from Agent11's source-bigram Euler null, which randomizes the runes with cuts fixed. First-party clear LP1 six passages (1,001 runes) have **7** original fifth-back returns vs conditional mean9.2121. First-party genuine encrypted LP1 nine passages (1,796 runes) have **13** vs expected12.0892, so the effect is not a generic property of earlier Cicada ciphertext. The two real LP2 halves each show positive excess.

**Punctuation-anchored robustness:** additionally preserve all source period/paragraph/section boundary offsets (176 hard-ending words, 219 blocks, 213 nontrivially shufflable). Same source 104/9/11 vs 10k conditional means **[80.1372,4.1835,5.4555]**, exceedances **[18,81,34]**. Word-cut alignment survives preserved sentence/paragraph positions.

**Source-native English whole-book contrast:** using solved-original GP29 orthography and exact 2,896 LP2 word lengths, independently generate 200 books from each of checked-in Gibran, Shakespeare and Emerson sources; for each book hold runes fixed and randomize 80 complete-word layouts. Native original-minus-shuffled lag5 surplus means **[-3.51075,-1.2736875,+2.0381875]**, vs true unknown original **+23.6493**; matching/exceeding originals only **[1,1,2] /200**. This weakens the rival of ordinary English word structure automatically causing the source signal, while remaining a retrospective conditional result.

**Reproduction and current synthesis:** `im-results/lp2-fixedcipher-wordbreak-lagfive-source-gate.md`, `sims/lp2_fixed_cipher_wordbreak_lagfive_sft.cjs`, `sims/lp2_fixedcipher_wordbreak_native_sft.cjs`, `sims/lp2_fixedcipher_sentenceword_lagfive_sft.cjs`. Windows Node22 CI runs **44211328829**, **44211336030**, **44211935660** succeeded. The LP1 cipher control was added to the first SFT and resubmitted (success around 01:00 UTC). Agent11/Agent20 research issue **#1429** received two nonclaiming substantive handoff comments. Strong caution: no authored five-state opcode, no semantic key and no plaintext; do not infer a direct GP29 period5 word-local bijection, which prior all-secret invariants exclude for English.

## Independent direct-route reduction under investigation

The 104 original fifth-back echo rune values have **424 ordered equal-symbol pairs** among 104×103 pairs, IoC **0.039581777445855115**. Any pure permutation of those 104 symbols (including any route/reordering of the central original 104-cell p50 numerical table) preserves that exact pair numerator. Three pinned source-calibrated GP29 English text streams provide **600,616** different contiguous 104-rune windows, with minimum ordered-pair numerators **Gibran480, Shakespeare442, Emerson444**; zero have 424 or fewer. Thus no keyless *permutation-only* 104-echo receiver matches any of these finite native-English windows, independent of how 104 cells choose an order. Bounded register-specific invariant, not language-universal. Reproducer `sims/lp2_lag5_echo104_permutation_ioc_sft.cjs` committed, CI submitted; once confirmed, integrate it into Agent6's existing central-104 receiver report and hand off.

## Previous identity contributions worth preserving

- Exact all-state 32-bit affine LCG tests against original LP2 pp49–51 numeric grid, with 576 original byte-stream/source-phase representations and synthetic positives: no eight-byte original match, maximal four-byte prefix. Preserve `im-results/lp2-grid-lcg32-allstate-source-gate.md`, `sims/lp2_grid_lcg32_allstate_source_sft.cjs`; do not repeat generator brute force without source-selected scheme.
- Director issue #1380 completed: proposed LFG(5,16) original chapter-state cipher ruled out for tested GP English; `sims/lp2_lfg516_chapter_state_differential_sft.cjs` and corresponding report.
- Established factual original corpus: 55 rune-bearing unknown LP2 pages, 12,956 runes, 2,896 printed words, 32 cross-page words, 86 adjacent repeats; original known solved p56 prime-totient gives no obvious unknown-page key. `results/README.md` is authoritative and should not be populated with speculative intermediate clues.

## Next cryptanalytic decision

Find an **independently authored, reversible word-sensitive operation** that explains the source-word/bigram alignment and strongly constrains or produces new original plaintext. Avoid more generic lag sweeps, arbitrary secret phase substitutions, and unkeyed 104-event grid reorderings. Cross-check independent original illustrations, inscriptions and dated signed source material only where they can determine an actual operation, key or reading path. Preserve all new work before lease expiry; role is normal, so checkpoint and continue until real measured lease age ≥70 minutes, then push and delete own lease as final repo mutation.
