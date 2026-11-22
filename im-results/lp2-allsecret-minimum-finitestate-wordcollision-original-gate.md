# Original 2,896 words force a large starting-state space for any deterministic word-preserving cipher

**Agent24, 22 November 2026; source-driven contribution to [Director #2083](https://github.com/FlareZ123/liber-primus/issues/2083).** This is an **exact all-secret combinatorial theorem** on original ciphertext plus length-matched source-GP English Monte Carlo. It does not select a creator cipher, recover a key or reveal unknown LP2 plaintext.

## The direct source observation that selects the question

Original printed boundaries and 32 real cross-page word joins are preserved in `resources/lp2-transcription.txt`. The **complete** unknown LP2 p0–55 contains exactly **2,896 printed GP29 words / 12,956 runes**. Among them there are only **230 unordered same-ciphertext-word pairs**, divided sharply by complete word length:

| Complete GP29 word length | Original word count | Original identical-word pairs |
| ---: | ---: | ---: |
| 1 | 83 | **107** |
| 2 | 448 | **106** |
| 3 | 720 | **17** |
| 4 | 513 | **0** |
| 5 | 317 | **0** |
| 6 | 256 | **0** |
| 7 | 216 | **0** |
| 8 | 156 | **0** |
| 9–14 | 187 | **0** |
| **Total** | **2,896** | **230** |

**Every printed ciphertext word of length four or more is unique.** This is a source-verified exact property, not a postulated cipher.

A plausible model class is a deterministic letter-by-letter **finite-state transducer**, where a plaintext word of length `L` produces exactly `L` GP29 ciphertext runes, and the complete ciphertext word is a function of its intact plaintext spelling and the machine's internal state `s` at the word's start. The state may include the previous ciphertext rune, any secret machine mode, and a hidden key clock; its internal transitions can be *arbitrary nonlinear unknown functions*, unique to each state or rune. There need be **no secret alphabet permutation** or stationary word mapping. The only model limitations are **finite `S` possible starting states globally** and determinism after the word begins. A random one-time pad with a new unbounded secret per word, word transposition or insertion/deletion escapes this bound.

## Exact theorem: identical plaintext words need enough initial states to avoid duplicates

For any one plaintext word type appearing `n` times, at most `S` distinct cipher word spellings can result, since the machine has only `S` possible start states and otherwise deterministic output. By the pigeonhole principle and balanced occupancy, the **minimum** number of duplicate ciphertext-word pairs forced by this one plaintext type, independently of every secret key, machine update and symbol map, is

```text
q = floor(n / S);  r = n mod S
min_collision_pairs(n,S)
  = r*C(q+1,2) + (S-r)*C(q,2).
```

**Proof:** Each of the `n` copies must enter one of at most `S` output spellings. The convex function `C(x,2)` minimizes the pair sum when spellings' occupancies differ by at most one, with `r` occupied `q+1` times and `S-r` occupied `q` times. Additional collisions between *different* plaintext words can only increase the observed total. Summing the formula over plaintext word types of each length gives a necessary, all-key lower bound `B_L(S)` on identical ciphertext-word pairs of that length. Any actual plaintext requires `B_L(S) <= D_L`, where `D_L` is its **observed original** pair count above. This stronger length-wise condition avoids improperly letting the abundant duplicate one-rune ciphertext words absorb an impossible surplus of repeated three-rune plaintext words.

A toy genuine forward-inverse positive constructs a real GP29 plaintext `THE` repeated **nine** times, with four different reversible positionwise affine secret alphabet maps chosen by state. It has exactly four ciphertext spellings in a **3+2+2+2** occupancy pattern and exactly **six** same-ciphertext-word pairs, matching the theorem with `S=4`. Nine available states produce zero collisions, as predicted.

## Independent source-native language calibration, with original lengths frozen

The same [complete original-input CommonJS SFT](../sims/lp2_allsecret_minimum_finitestate_wordcollisions_sft.cjs) uses 29-rune historical transliteration, source-attested native GP `ING→NG` and `IO→IA`, and the already pinned 55,407-word Shakespeare and 15,733-word Gibran donor corpora under `resources/control/`. Each of **256 deterministic placements per source** draws genuine source word spellings at **each of the 2,896 exact original word lengths** (including original length14), then computes the smallest `S` that satisfies all 14 original length-specific collision caps. Sources and seeds are fixed independently of any attempted decipherment (`0x330112`, `0x330161`).

| 256 independent full-length donor placements | Shakespeare GP | Gibran GP |
| --- | ---: | ---: |
| Minimum necessary `S`, using only total 230 cipher word-pairs | **25–32**, mean28.129 | **52–71**, mean60.164 |
| **Minimum necessary `S), enforcing every original word length's true pair cap** | **45–85**, mean61.582 | **100–161**, mean127.789 |
| Required length-three same-word pairs if `S=29` | 70–167, mean112.113 | 320–578, mean428.906 |
| Actual original length-three identical pairs | **17** | **17** |
| Required length-four same-word pairs if `S=29` | 0–12, mean1.195 | 8–75, mean38.918 |
| Actual original length-four identical pairs | **0** | **0** |
| Source placements failing `S=29` | **256/256** | **256/256** |
| Source placements failing `S=2×29=58` | **165/256** | **256/256** |
| Source placements failing `S=3×29=87` | **0/256** | **256/256** |
| Source placements failing `S=4×29=116` | **0/256** | **219/256** |
| Source placements failing `S=5×29=145` | **0/256** | **13/256** |
| Source placements failing `S=6×29=174` | **0/256** | **0/256** |

The original's sharply **zero length-four-plus duplicates** are especially discriminating: even an *arbitrarily keyed* word cipher with only 29 start states must repeat a four-rune cipher word whenever a source four-rune word appears 30 times. Numerous natural-language donor placements exceed this multiplicity. A full source-native Shakespeare or Gibran plaintext cannot generally be mapped to the original under such limited state, irrespective of how cleverly the 29 secret substitutions or transitions are chosen.

## What this changes

This newly proved bound covers *far more than* the earlier special-case `C_j=Q[C_(j−1)][P_j]` predecessor table, which has at most 29 states. Here every hidden transition may be nonlinear and arbitrary, and **any number of unseen fixed lookup tables** are allowed, provided the full machine exposes at most `S` possible word-start states. Even a three-mode × GP29 predecessor automaton (`S=87`) fails all 256 exact-length Gibran controls, while 256 Shakespeare controls fit by construction at that capacity. An actual source **five-dot** motif could motivate five modes, and `5×29=145` is *capacity-compatible* with 243/256 Gibran placements; **this is not source evidence that the dots select such a machine**. Five modes are a combinatorial capacity observation, not a recovered cipher grammar or operator.

The linguistic comparison is intentionally conditional: Shakespeare and Gibran provide two actual GP registers, and independent length-matched draws can repeat common donor words. A different author, dialect, word frequency or encoded intermediate can require a different `S`; this is **not an impossibility theorem for all human languages**. The argument also assumes printed LP2 hyphenation corresponds to plaintext word boundaries and one GP rune per plaintext rune, as did the previous structural word-length tests. If those boundaries are intentionally randomized, these bounds have no authority over the altered segmentation.

**Actionable next decision:** a proposed low-state cipher is rejected *before any key fitting* if it has fewer than the source-calibrated required starting states. A plausible exact reversible antirepetition model needs either a sufficiently rich externally motivated mode space, word resegmentation, or other nonlocal state/keystream source. The historical original p7 five-dot ornament does not by itself specify such state transitions or a plaintext/key, so do not select a new table or mode clock by optimizing English likelihood on the same ciphertext. Demand a new first-party update rule and independent original output.

**Reproduction:** [source-runic SFT](../sims/lp2_allsecret_minimum_finitestate_wordcollisions_sft.cjs), 512 seeded full-book draws, exact positive toy and original corpus assertions. No claimed Windows CI run for this invocation; the mathematically equivalent source-input calculations above were performed directly in a JS runtime.
