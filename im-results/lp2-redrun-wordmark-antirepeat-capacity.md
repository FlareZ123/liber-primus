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

## Four confirmed original raised apostrophes still leave the page-locked channel short

The original p4, p21, p35 and p41 contain four visually verified **12×40-pixel raised apostrophe strokes**, respectively inside the complete ciphertext words `MXI'W`, `AEO'Y`, `PE'T`, `XLJ'C`. The strokes are **independent of the 31 large marks** and are already source-audited against the solved LP1 `DON'T` positive [apostrophe study](lp2-apostrophe-four-source-cribs.md). Their actual locations inside a printed word remain fixed in the original artifact; to maximize the hypothetical side channel, grant one apostrophe on **any** of the `n_p+1` rune seams of its original physical page, including page edges and otherwise visually impossible between-word positions. Four distinct fixed pages remove any collision issue, giving exactly

\[
\log_2[(261+1)(273+1)(271+1)(273+1)]
=\mathbf{32.3169500087\ bits}.
\]

This is a deliberately excessive allowance: the genuinely printed ticks have fixed 3+1/2+1/2+1/3+1 internal-word positions, and a human-readable contraction-mark restriction would reduce the options.

| Source-ink sidecar (fixed original page membership) | Maximum information |
|---|---:|
| All 16 original ordered, fixed-length red runs moved to arbitrary original-page rune seams | 118.7487333514 bits |
| All 31 original large marks moved to arbitrary original-page word boundaries with extra type flags | 172.0779687016 bits |
| **All four raised apostrophes**, independently anywhere on their original pages | **32.3169500087 bits** |
| **Combined red + large-mark + apostrophe channel** | **323.1436520617 bits** |
| Uniform all-GP29, at-most-86-repeat capacity requirement | 325.4502541840 bits |
| **Still missing despite every eligible ink coordinate** | **2.3066021223 bits** |

The **stronger per-page budget** (k_p) gives a more robust exclusion: allowing the original 31 large marks to roam over **3,008 book-global word seams** and all four apostrophes to roam within their original physical pages, while 16 red runs remain fixed to their original pages, yields at most **413.9052488312 bits** against **430.5612013481 bits** of universal pagewise at-most-(k_p) repeat loss. There is **16.6559525169 bits** still missing. This latter output contract allows the original large marks to cross *all* book pages; it still preserves the original physical-page identity of each red run and raised apostrophe.

**Scope:** Original **quotation-opening/closing strokes**, ordinary printed word separators, other line typography, movable page membership, arbitrary red-run lengths, independently colorable rune pixels, hidden JPEG/p50 payloads and an English-restricted input alphabet are **held fixed or outside this particular upper bound**. Accordingly this excludes the full explicitly listed three-channel coordinate-only universal code, not every imaginable use of all page artwork. Under the separate *exact-(k_p)* model that already grants unrestricted global red-run and large-mark movement, the extra apostrophes can make the cardinality inequality reverse, so that far more permissive model is **not** excluded by this extension. No original plaintext, key or chosen cipher is recovered.

## Stronger global-channel variants using each page's genuine repeat profile

The above theorem preserves only the **total** maximum of 86 repeats, an especially generous output constraint. The original additionally exposes the *location* of those repeats: the 55 rune-bearing pages each have their own actual within-page count `k_p`, with **13 pages having zero** and **no page exceeding five**. This permits a second exact cardinality argument that drops the previous restriction on where the **large marks** may move.

Under an arbitrary uniform GP29 input tape, one page with `t_p=n_p−1` transitions has independent probability `1/29` per repeated-neighbor transition. If every output page is required to have **at most its original observed** `k_p` repeats, the universal rune-capacity loss is

\[
L_{\rm local,\le}=\sum_p -\log_2\left[\sum_{j=0}^{k_p}\binom{t_p}{j}
(1/29)^j(28/29)^{t_p-j}\right]
=\mathbf{430.5612013481\ bits}.
\]

Now allow **all 31 marks to roam across all book pages**, among **3,008 possible printed word-boundary slots** (including 25 extra fictitious slots beyond the actual **2,983** per-page source inventory), with unrestricted duplicate positions. Grant the same freely assigned 10-dot and black mark identities. Their entire global sidecar capacity is **262.8395654712 bits**. Keep the original 16 ordered red runs, original per-page membership and fixed individual lengths, but allow their arbitrary rune-seam positions as above (**118.7487333514 bits**). The combined globally movable mark channel plus page-local red channel is at most **381.5882988225 bits**, still **48.9729025256 bits too small** for a universal all-GP29 same-length encoder that meets every original page's repeat budget.

A more restrictive, original-exact repetition-profile contract gives **445.7315579009 bits** of rune-capacity loss. Under this exact-output condition, even grant **both channels global movement across all pages**: order-preserving nonoverlapping placement of all 16 individually fixed-length red runs anywhere in the 12,956-rune tape contributes **173.9639275494 bits**; all 31 marks among the generously overcounted 3,008 word seams contribute **262.8395654712 bits**, total **436.8034930206 bits**. This remains **8.9280648803 bits short**. The original ordering and lengths of the red runs remain fixed, but their page memberships and all mark per-page counts may vary in this extreme variant. It is a separate theorem about exactly fixed local repeat counts, which is a stronger assumption than allowing each page up to its source count.

These two global-channel variants sharpen the family of excluded **universal** no-repeat architectures. They do **not** suggest that the author programmed the precise observed pagewise repeat counts as targets, nor can they exclude a text-source-restricted compressor, arbitrary redistribution of individual red-run lengths/order, punctuation outside the 31 large marks, or additional concealed image/number payload.

**Independent execution:** [Windows Node22 workflow 45143544020](https://github.com/FlareZ123/liber-primus/actions/runs/45143544020) completed successfully, asserting all three distinct capacity exclusions, every original pagewise repeat count, 2,983 actual page word-seam locations and the stronger 3,008-slot grant, with exhaustive toy controls.

## What this does and does not decide

**Decision:** Merely promoting the **16 original movable contiguous red-run positions** to an additional exception channel **cannot** rescue a universal, rune-length-preserving, all-GP29 anti-repeat encoder whose large marks stay at existing printed word breaks with their original per-page multiplicities. There is not enough combined output capacity even under arbitrary unknown keys. That conclusion is independent of language scoring or finding the cipher.

This **does not exclude** an encoder restricted to natural English, a variable-length compressor, a scheme moving spaces, individual per-rune color flags rather than the historical fixed red runs, different per-page assignment of colored runs or marks, additional dot-pattern/stego side information, or an actual author-supplied high-entropy key that varies with the plaintext. In particular, a language-restricted code could fit in a far smaller output set and still be invertible. The exact original artifact alone has not selected a decoder or authenticated any plaintext.

The claim is a **bounded structural pruning result**, not a new cryptographic solution. Do not start more sidecar-coordinate parameter sweeps unless new first-party material identifies a genuinely different side channel or a direct ciphertext receiver.

## Reproduce

**Executed Windows Node22 original-source PASS:** [manual read-only workflow run 45141898199](https://github.com/FlareZ123/liber-primus/actions/runs/45141898199) confirms every source count, every red-boundary/mark placement, both toy controls, all information totals and the strict capacity deficit. No unknown plaintext was emitted.

The self-contained, read-only, **Windows 11 / Node.js 22 CommonJS** [source test](../sims/lp2_redrun_wordmark_antirepeat_capacity_sft.cjs) reads the original 58-page GP29 corpus, the physical red-ink annotations, and the printed transcription. It restores the omitted runeless p50 when mapping transcription pages to physical page numbers, checks **every** red-run start/end and large-mark location against exact original printed word seams, asserts all **12,956/12,901/86** rune counts and **213/16/31** annotated events, and evaluates the independent logarithmic cardinalities using a stable reverse-tail sum. Two exhaustive toy positives check the transition-count formula and nonoverlapping red-interval placement count. The original files are read-only; no inferred plaintext or key is embedded. The same code independently computes the two pagewise-repeat theorems and confirms every source position.