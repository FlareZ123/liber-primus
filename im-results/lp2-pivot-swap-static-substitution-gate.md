# Pivot-swap evolving alphabet: exact static reduction and concentration exclusion (#2921)

## Decision

The exact all-consuming GP29 pivot-swap receiver proposed in [Director #2921](https://github.com/FlareZ123/liber-primus/issues/2921) is retired for ordinary native literary prose. It explains rare ciphertext repeats by choosing a rare pivot, but its complete inverse exposes a near-uniform static-substitution tape. No unknown plaintext or key is recovered. This conclusion is independent of printed separators, secret initial alphabet, pivot identity, and (for whole-book frequency) arbitrary transport of plaintext positions before encryption.

## Lossless reduction

Let A_t be the current plaintext→ciphertext bijection, r the fixed plaintext pivot, and c_t=A_t(p_t). After emission, swap the images of p_t and r. Put l=A_0(r), c_{-1}=l, and let S_t be the output-label transposition exchanging c_t and c_{t-1} (identity if equal).

Since A_{t+1}(r)=c_t, A_{t+1}=S_t∘A_t. Hence A_t=B_t∘A_0 where B_0=I and B_{t+1}=S_t∘B_t. The observable tape y_t=B_t^{-1}(c_t)=A_0(p_t) is exactly a static substitution of plaintext. Compute y_t with an inverse array initialized to identity, emitting inv[c_t] then swapping inv[c_t] and inv[c_{t-1}]. All later swaps are public; only the first needs l. For any alternate l the suffix y[1:] differs from the l=c_0 suffix by the global transposition (l,c_0); the first rune is always c_0. Thus almost all label uncertainty is absorbed by the unknown static map rather than requiring 29 independent language searches.

Two additional exact invariants:
- For t≥1, c_t=c_{t-1} iff p_t=r. Pivot count equals adjacent cipher repeats plus a possible first-rune occurrence.
- For t≥2, p_t=p_{t-1} iff c_t=c_{t-2}; the preceding plaintext's post-swap image is c_{t-2}. This holds even if the preceding emission was itself the pivot.

The map differs from #2505's frequency-sorted rank receiver, #1468's ordered move-to-front rank operation (shifts an entire intervening range), #2912's two affine generators, #1166's adaptive entropy codec and #2870's collision-repair coupling. No source selects this particular swap operation. Targeted code-search queries returned no exact predecessor; absence of a search result is not proof that no earlier equivalent experiment exists.

## Public-clock reciprocal swaps: source and literal-F obstruction (#3150)

This is a distinct generalization of the static reduction, not another original pivot-sweep. Agent40's [issue note](https://github.com/FlareZ123/liber-primus/issues/3150#issuecomment-7209800840) already gives the public-output factorization for an arbitrary public pivot (t_i). Write (A_{i+1}=(c_i\ t_i)\circ A_i), with the transposition acting on output labels and identity when the two labels coincide. In addition to the factorization, this yields a sharper exact diagnostic:

- Immediately after any consuming emission, (A_{i+1}(p_i)=t_i). Therefore (p_{i+1}=p_i) if and only if (c_{i+1}=t_i). This is an initial-key-free **plaintext adjacent-equality mask**, not merely a prediction for aggregate ciphertext repeats. For a fixed public schedule, test its complete mask before solving a static substitution. If independently observable holds intervene without changing (A), the same statement applies to the filtered consuming stream.
- Separately, (c_{i+1}=c_i) iff (A_i(p_{i+1})=t_i). In particular, with a constant public pivot the repeat mask at (i+1) is the plaintext lag-two equality mask (for (i\geq1)). Do not confuse this constant *output-label* pivot with #2921's fixed *plaintext* pivot.

**Literal-F hold constraint.** For unrestricted GP29 input, take F=0, and require that plaintext F emits 0 with no state or clock change, whereas every other plaintext emits (A_i(p)) and consumes one clock step. An immediate inverse exists at a reachable state iff (A_i(0)=0): otherwise (p=0) and (p=A_i^{-1}(0)\ne0) give the same emitted rune. The latter collision is not repaired by promising a later update. At a fixed input length ending at that reachable state the two equal-length input strings already collide. A uniform length-preserving bijection on all GP29 strings of any longer fixed length also requires each prefix map to be injective: a missing ciphertext prefix removes all of its extensions from the codomain, making an equal-cardinality bijection impossible.

Starting from an F-fixed alphabet, an ordinary non-F emission has (c_i\ne0). Its post-emission transposition preserves F-fixedness iff (t_i\ne0). Hence the simplest p56-inspired public pivot (t_i=(\mathrm{prime}_{i+1}-1)\bmod29) (zero-based consuming index) necessarily breaks this closure on consuming step 17 (prime 59). This is an obstruction to the immediate-inverse, literal-F-hold, unrestricted-alphabet version of that particular transfer. It does not exclude an explicitly specified restricted message language, a branch-disambiguated inverse, a different clock, or a different update that fixes F.

**Authentic control and source gate.** The canonical physical p56 ciphertext has 85 runes. Executed a prefix-constrained inverse against its established native wording, branching only on emitted F; using GP29 index order, successive prime-minus-one additions, ordinary non-F consumption, and literal plaintext F hold. Exactly one matching path consumes 84 shifts and holds zero-based position 56. Ciphertext F occurs at offsets 35,47,51,56,74; four are ordinary consuming outputs. This demonstrates why a reserve-F transposition that forces F to be observable changes the authentic p56 output convention. It does not invalidate the known p56 decryption.

Reproduce the control by iterating ciphertext indices from `resources/liber-primus/lp2-corpus.json`, page 56, with state (plaintext prefix, consumed prime count). For each ciphertext F branch to (F, unchanged count); otherwise or additionally compute `p=(c-(prime[count]-1)+29*k)%29` with a sufficiently large integer k, reject ordinary p=0, advance count, and retain only prefixes of the established transliteration (V→U, K→C) in `lp1-plaintext-reference.txt`. The hash and punctuation are not rune input. The zero-based cipher F offsets and the unique hold stated above are the complete expected result. Core executed in connected JavaScript; no new original unknown-page score was computed.

Read the GP29 chart/corpus, LP1's prime/totient instruction, the signed 2013 continuation clue, the signed Stage11 distribution message and the signed 2016 word-map clue. These establish a numerical clock precedent and ordering context, but do not select a reciprocal exchange, the other label, or a hold/initialization convention. #2921 and #2928 already reject their exact all-consuming fixed-plaintext-pivot and transpose-on-access laws; #3124's two-wheel update has its separate calibration failure. The new fixed-clock transfer is not source-selected, and the literal-F immediate-inverse version above fails closure. Per #3150's gate, do not run a new plant or original optimization on an invented schedule. Reopen only on an independently selected exchange operation with a complete F/clock convention; use the exact successor equality mask before any language search. No unknown plaintext or key recovered.

## Reproducible original-input results

Input: canonical `resources/liber-primus/lp2-corpus.json` (blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`), physical p0–55, including red runes, omitting no rune and preserving cross-page state. p50 is empty. Exhausted all 29 possible initial pivot labels for the whole book, each of nine canonical chapters, and every nonempty physical page. The physical-page-private model is a relaxation, not a fitted reset hypothesis.

| Scope | Runes | Max count of any recovered symbol | Max inverse IoC |
|---|---:|---:|---:|
| p0–55 | 12,956 | 504 | .03526620 |
| p0–2 | 729 | 38 | .03592155 |
| p3–7 | 1,145 | 57 | .03537576 |
| p8–14 | 1,729 | 77 | .03514261 |
| p15–22 | 1,903 | 87 | .03535621 |
| p23–26 | 1,021 | 48 | .03498492 |
| p27–32 | 1,433 | 65 | .03517155 |
| p33–39 | 1,680 | 80 | .03561218 |
| p40–53 | 3,008 | 132 | .03540498 |
| p54–55 | 308 | 21 | .03629595 |

Original ciphertext has 86 adjacent repeats and 441 lag-two equalities. All 29 inverses require 86–87 pivot occurrences; the first-rune convention affects at most one. A rare pivot alone can fit this count but cannot repair the histogram of the other 28 symbols. For comparison, the six genuinely printed-clear LP1 segments (157,187,207,192,169,89 runes) plus original clear p57 contain 1,096 runes, IoC .05967903, modal rune count 138. Those controls are original rune glyphs, not uncorrected editorial translations.

All contiguous windows of three pinned literary texts were encoded with the existing source-native greedy GP spelling convention (ING/IO special cases, QU→CW, U/V etc.). Whole-book length results:

| Control | GP29 runes | 12,956-rune windows | Minimum modal count | Minimum IoC |
|---|---:|---:|---:|---:|
| Gibran | 62,492 | 49,537 | 1,416 | .05911558 |
| Shakespeare | 217,106 | 204,151 | 1,408 | .05721677 |
| Emerson | 321,327 | 308,372 | 1,491 | .06012084 |

**0/562,060** windows meet either original maximum bound, let alone both. Across all nine separately length-matched chapter windows, each source has zero windows meeting either corresponding original bound. The terminal 308-rune scope also fails: largest possible original modal count 21, smallest control modal count 23; original max IoC .036296 vs smallest control .049452. These are finite-register exclusions, not universal theorems about every possible GP plaintext. Overlapping windows are not independent trials; no p-value is inferred from their count.

Allowing a distinct static alphabet and initial pivot per chapter still caps the total count of any chosen plaintext rune at 605; per physical page caps it at 856. The controls' minimum E count is 1,408, independently of position transport. Therefore neither ordinary reset relaxation can reproduce even one of the tested whole-book native histograms.

### Arbitrary-reset capacity bound

This extends the negative without fitting arbitrary reset locations. For a segment [a,b), after its first emission all observed-label swaps agree with the continuous unmasking, so its suffix is one static relabeling of the full continuous tape's y[a+1:b]. Grant its first symbol as a free occurrence of a chosen plaintext letter, allow any suffix label for that letter, and independently reset the entire alphabet and pivot in each segment. The upper bound is then the largest sum over at most k contiguous segments of 1+max-symbol-count(suffix).

The exact prefix DP retains 29 active scores for each possible label in the current segment. At position i, extend the existing segment by incrementing the score of label y_i, or start a new segment with D_{k-1}(i)+1, regardless of label. The maximum active score gives D_k(i+1). This relaxed DP permits even impossible first-symbol assignments and is therefore a safe upper bound for the actual receiver.

The 55 freely located segments cap is **1,017**, still below the weakest native E floor. At 134 segments the cap is 1,407; at 135 it is 1,411. Thus at least **135 segments / 134 resets** are necessary merely to match the E count of any of the 562,060 windows, even with arbitrary reset positions, private alphabets and pivots. This is a necessary capacity threshold, not a surviving decoder. It does not imply that 135 segments suffice for native text. No source-selected reset channel was discovered; do not use this bound to justify tuning arbitrary resets.

## Positive controls and reproduction

696 deterministic native-source plants (all 29 pivots, canonical/Atbash/affine starting alphabets, seven original clear source passages plus their concatenation) recover 190,704/190,704 runes and re-encrypt exactly. Three full-book-length literary plants recover 38,868/38,868 runes with state carried across original page lengths, including pivot F in one. These are known-key exact-factorization controls, not blind key-recovery evidence. The suffix-transposition and equality invariants are asserted for all 29 initial labels on original scopes and short native plants.

Run `node sims/lp2_pivot_swap_static_substitution_sft.cjs` from the repository root. Core computations were executed on exact repository text in the connected JavaScript runtime; the standalone Node wrapper has not been independently run. Sources: Gibran `df260a07d56bf5998d40a6360b6132c35c252d10`, Shakespeare `94c677ad9dd50771c6670e0c4e4dad9052b46d85`, Emerson `a92be8ba5b3511a003a22ba31523c14397aaa83a`, original LP1 `37c96b816495c5f93ca658a01c9918bf92598316`. [Reproducer](../sims/lp2_pivot_swap_static_substitution_sft.cjs).

## Frontier consequence

Do not spend substitution-search compute on this exact inverse: arbitrary substitution cannot change concentration. The negative covers ordinary all-consuming pivot swap, not an extra cipher layer, authentic-F transparent exception, lossy compression, arbitrary non-pivot state changes, or a radically different plaintext register. No new cipher operation is licensed by the source and no key is recovered. The current evidence favors seeking a source-selected mechanism capable of changing the recovered marginal distribution, rather than attempting another initialization of this swap law.
