# LP2 red-run plus word-mark anti-repeat capacity: original-source all-key bound

**Agent 6, 23 November 2026. Classification:** finite, source-shaped cardinality exclusion; **no unknown LP2 plaintext or historical decoder recovered**. This extends the existing [31-marker-only theorem](lp2_31mark_antirepeat_capacity.md) by granting the encoder every original red-rune run as an additional independently movable coordinate channel. It is relevant to the constrained-code route [Director #2273](https://github.com/FlareZ123/liber-primus/issues/2273), but does not duplicate that issue's active search for a genuinely authored full-page inverse.

## Source observations and question

The canonical **original p0–p55** 29-rune tape has **12,956** rune symbols across **55 nonempty physical pages**, yielding **12,901** within-page transitions with **86** equal-neighbor transitions. The printed word breaks, page boundaries and original ink annotations establish:

- **16** contiguous red-rune runs totaling **213** red runes on the unsolved pages; their run lengths and page membership are fixed in this model. The 225-red-rune count sometimes quoted for all LP2 includes the two solved terminal pages and must **not** be used here.
- **31** large original punctuation marks, confined to printed word-boundary seams on their actual pages. They comprise **28 thirteen-dot** and **three ten-dot** marks, **30 red** and **one black**. Two physical word seams carry duplicate large marks.
- Each observed original red interval begins and ends at a printed word boundary. Our main bound **relaxes** that condition and allows its start at *any* rune seam.

Could a universal, fixed-length, arbitrary-key encoder avoid almost all adjacent repeats in the GP29 tape by hiding enough lost information in the *combined* red-run positions and large-mark positions? Give the encoding enormous freedom: any private state machine, any private key, any output rune values, red runs allowed to slide independently to arbitrary rune seams, large marks allowed to move to any *existing printed word boundary* on their original pages, preserving within-page event counts but allowing marks to collide. This is far more generous than the actual fixed source coordinates. Restrict only the original page-local red-run length/count structure, printed word boundaries and original per-page large-mark counts. An external pad, movable word breaks, changes to red-run lengths or page assignments, or a new payload in p50 are different models.

## Exact information bound

Let `N=12,901` within-page transitions, `R=86` maximum allowed adjacent-equal transitions. Among all GP29 tapes with the original 55 nonempty page starts, the loss of universal coding capacity is

\[
L=N\log_2 29-\log_2\left(\sum_{k=0}^{86}\binom Nk28^{N-k}\right)
=\mathbf{325.4502541840\ bits}.
\]

For a physical page with `n` source runes, `r` ordered red runs of fixed individual lengths totaling `a`, grant the runs **every** possible nonoverlapping placement among the rune seams. Distributing `n-a` nonred runes before, between and after those runs gives at most

\[
S_{\rm red,page}=\log_2\binom{n-a+r}{r}.
\]

This allows unprinted rune-internal red boundaries, adjacent red runs and placements that would be visually ineligible. Across all unknown pages this adds **118.7487333514 bits**.

For each page with `w` independently identified original printed word-boundary seams (including both page edges) and `m` large marks, grant **any multiset** of `m` locations in those `w` seams. This gives

\[
S_{\rm marks,page}=\log_2\binom{w+m-1}{m}
\]

and **154.9896669908 bits** across all unknown pages. Preserve the physical per-page mark multiplicities but gratuitously allow the three ten-dot identities to occupy **any three of the 31 occurrence slots**, and the single black identity any one of 31, including overlap with the ten-dot choices. This adds **17.0883017108 bits**; it is intentionally an overcount of the historical mark-type configurations.

| Independent output channel | Max. information |
|---|---:|
| Red run placement, even at arbitrary rune seams | 118.7487333514 bits |
| Large-mark placement at fixed printed word seams | 154.9896669908 bits |
| Arbitrarily assigned 10/13-dot and black identities | 17.0883017108 bits |
| **Combined generous upper bound** | **290.8267020530 bits** |
| **Deficit below universal GP29 anti-repeat requirement** | **34.6235521310 bits** |

The output space is short by a factor of **more than \(2^{34.62}\)**, irrespective of its secret key, alphabet relabeling, feedback mechanism or computational complexity. Even gifting **one further arbitrary binary bit for each of the 16 red runs** only raises capacity to **306.8267020530 bits**, still **18.6235521310 bits short**. If red run starts must also be at original printed word seams, the more restrictive, still deliberately optimistic total is **258.6999563611 bits**.

The actual source is stricter still: page starts, red intervals and punctuation placements visually form chapter headings rather than a free sidecar. The purpose of the generous bound is to exclude *all possible* universal decoders of the stated output format, not to infer the author's design.

## What this does and does not decide

**Decision:** Merely promoting the **16 original movable contiguous red-run positions** to an additional exception channel **cannot** rescue a universal, rune-length-preserving, all-GP29 anti-repeat encoder whose large marks stay at existing printed word breaks with their original per-page multiplicities. There is not enough combined output capacity even under arbitrary unknown keys. That conclusion is independent of language scoring or finding the cipher.

This **does not exclude** an encoder restricted to natural English, a variable-length compressor, a scheme moving spaces, individual per-rune color flags rather than the historical fixed red runs, different per-page assignment of colored runs or marks, additional dot-pattern/stego side information, or an actual author-supplied high-entropy key that varies with the plaintext. In particular, a language-restricted code could fit in a far smaller output set and still be invertible. The exact original artifact alone has not selected a decoder or authenticated any plaintext.

The claim is a **bounded structural pruning result**, not a new cryptographic solution. Do not start more sidecar-coordinate parameter sweeps unless new first-party material identifies a genuinely different side channel or a direct ciphertext receiver.

## Reproduce

**Executed Windows Node22 original-source PASS:** [manual read-only workflow run 45141898199](https://github.com/FlareZ123/liber-primus/actions/runs/45141898199) confirms every source count, every red-boundary/mark placement, both toy controls, all information totals and the strict capacity deficit. No unknown plaintext was emitted.

The self-contained, read-only, **Windows 11 / Node.js 22 CommonJS** [source test](../sims/lp2_redrun_wordmark_antirepeat_capacity_sft.cjs) reads the original 58-page GP29 corpus, the physical red-ink annotations, and the printed transcription. It restores the omitted runeless p50 when mapping transcription pages to physical page numbers, checks **every** red-run start/end and large-mark location against exact original printed word seams, asserts all **12,956/12,901/86** rune counts and **213/16/31** annotated events, and evaluates the independent logarithmic cardinalities using a stable reverse-tail sum. Two exhaustive toy positives check the transition-count formula and nonoverlapping red-interval placement count. The original files are read-only; no inferred plaintext or key is embedded.