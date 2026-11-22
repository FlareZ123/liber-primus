# Full-book GP29 finite-state cipher: exact successor-state capacity bound

**Decision, 12 November 2026 (Agent30, Director [#597](https://github.com/FlareZ123/liber-primus/issues/597)).** On the 12,956 source-original unknown LP2 runes, **all 89** previously fixed native-GP Shakespeare/Gibran/Emerson candidate plaintext windows require **at least 205–339 hidden states** under the specific reversible, time-homogeneous, globally shared finite-state model below. **36/89 require more than 256 states** and **41/89 require more than 252**. A 16-state planted model decrypts all 12,956 native-GP symbols; an intentionally large 12,956-state model can fit any fixed candidate. The original manuscript supplies **no authenticated finite-state cipher, initial-state rule, key, plaintext, or destination**. The source's 16-, 29-, 252- and 256-entry objects alone do not instantiate this model.

This is a new, **key-independent structural lower bound conditional on explicit candidate plaintexts**, distinct from earlier local plaintext-history collision exclusions and previous-ciphertext-context substitution gates. [Complete executable original-input and plant SFT](../sims/lp2_fsm_nextstate_capacity_sft.cjs).

## The exact cryptographic contract

For each of the 55 source-original rune-bearing physical pages, let the plaintext and ciphertext be sequences of GP29 values in `{0,…,28}`. The page may start at **any independently selected state**. At each position:

```text
C[i]   = pi[S[i]](P[i])
S[i+1] = delta(S[i], P[i])
```

Here `pi[s]` is a *permutation* of all 29 values, and `delta(s,p)` maps a state and a plaintext value to the next state. Both functions are otherwise completely arbitrary secret tables and remain **identical across all pages and positions**. There are exactly `S` possible states available, with no requirement that all are visited. The decoder is lossless because after finding `p = inverse(pi[s],c)` it updates via `delta(s,p)`. Page resets are granted free; their historical existence is unproven. The lower-bound theorem also applies **without alteration** when the deterministic next state is an arbitrary function of the **current ciphertext** `delta(s,c)` or **both current plaintext and ciphertext** `delta(s,p,c)`: in a given permutation state, either current symbol uniquely specifies the other, so positions sharing `(p,c)` and state are forced to share their successor. The construction and positive plant use `delta(s,p)`, while the **necessary lower bound covers any deterministic stationary one-rune-per-rune reversible GP29 Mealy transducer**. Position-dependent or page-specific transition functions, extra visual input, non-GP29 registers, and variable-length coding remain outside this scoped theorem.

## An exact finite combinatorial necessary condition

For any ordered source observation `(P[i],C[i]) = (p,c)`, its possible state belongs to the set of states whose permutation maps `p→c`. One state may serve multiple observed `(p,c)` pairs only if those pairs are compatible with a **single permutation**: for a fixed `p`, outputs `c` must be the same; for a fixed `c`, inputs `p` must be the same.

Define `T[p,c]` to be the list of positions on any of the original 55 pages at which the **candidate** plaintext and original ciphertext display `(p,c)`. A position's successor is its next rune **only within the same physical page**; page final positions have no required successor. Let `h(T,0) = 1` when `T` is nonempty, otherwise zero. For `d>=1`, group all available immediate successors to positions in `T` by their observed `(u,v)` and call the resulting position lists `T[u,v]^+`. Recursively define

```text
h(T,d) = max(
    1,
    max_u sum_v h(T[u,v]^+,d-1),
    max_v sum_u h(T[u,v]^+,d-1)
)
```

for nonempty `T`. The bound is conservative: it uses only next-pair compatibility, discards longer-range distinctions when `d` is small, and permits arbitrary state mergers elsewhere.

**Why it is a lower bound.** If two positions with the same pair `(p,c)` share state `s`, the transition `delta(s,p)` forces them to share their next state. If their successor pairs require disjoint next states, those parent positions must already occupy disjoint states. For a fixed successor plaintext `u`, different ciphertext `v` cannot share a next permutation state. The analogous incompatibility holds for fixed successor ciphertext `v` with different plaintext `u`. Those are precisely the row and column sums above; recursive subgroups yield the corresponding lower numbers of distinct parents. This reasoning is valid even if the initial page states are all independent.

Finally, states used by distinct current `c` for a single current plaintext `p` are disjoint; similarly for distinct current `p` for one current ciphertext `c`. Therefore

```text
S >= max(
    max_p sum_c h(T[p,c],d),
    max_c sum_p h(T[p,c],d)
)
```

for every nonnegative depth `d`. This is a **necessary** condition and may underestimate the true required states because different input-output edges with different symbols may have incompatible **next-state transitions** even when row and column sums separately fit.

## Frozen original-input experiment

Inputs are [the original physical-page GP29 corpus](../resources/liber-primus/lp2-corpus.json), 55 rune-bearing unknown pages, and the exact [independent native controls](../resources/control/) used in the previous [89-window plaintext-history gate](lp2-plaintext-history-determinism-collision-gate.md). Each native control was converted with the existing GP transliteration conventions (`QU→CW`, `V→U`, `K/Q→C`, `Z→S`, longest GP transliteration). Take every available 12,956-rune contiguous window at stride 6,478 and overlay its rune indices onto the **same original physical page lengths**. Ciphertext inputs are never changed. No model parameter or window was tuned to lower the bound, and all earlier fixed controls are retained.

| Frozen native edition | Windows | 1-step bound min–max | 2-step bound min–max | 2-step >252 | 2-step >256 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare first 300k | 32 | 202–273 | **205–281** | 10 | 7 |
| Gibran, *The Prophet* | 8 | 243–323 | **251–339** | 7 | 7 |
| Emerson, *Essays* | 49 | 220–291 | **228–296** | 24 | 22 |
| **All fixed controls** | **89** | **202–323** | **205–339** | **41** | **36** |

All 89 depth-two lower bounds are at least 205. Depth-two is strictly stronger than depth-one on each of the 89 source windows. A single sequence from Shakespeare has full depth-two bound **244 states**. Excluding the reserved original p54–55 visual chapter gives the p0–53 bound **240 states**. Examining the reserved p54–55 chapter **alone** gives a bound of **25 states**. These three numbers are a structural check of the same already-chosen candidate, not a decryption or plaintext-validation result. The final 308 original ciphertext runes were held outside the 12,648-rune prefix comparison.

The first Shakespeare candidate's global two-step bound is dominated by the GP plaintext index **3 (O)**: 244 required state roles when all original-cipher outputs for that plaintext symbol are considered. The bound is invariant to unknown choices of permutations, transition tables or per-page start states within the stated contract.

## Constructive lossless controls and limits

The SFT builds a true **16-state** GP29 substitution cipher. It derives one seeded permutation for each state and uses the explicit transition `delta(s,p) = (s + 13p + 7) mod 16`, with original page index `j` starting at `(5+3j) mod 16`. A full 12,956-rune native-GP plant decrypts **12,956/12,956** and the inferred two-step lower bound is **16**, matching the true number of available states. The separately seeded wrong key recovers only **438/12,956** native symbols. The plant demonstrates exact implementation consistency without selecting a historical cipher.

Conversely, one can construct a trivial but gigantic upper witness of **12,956 states** for *any* proposed source-native GP plaintext paired with the original ciphertext. Give each original position its own state with a cyclic substitution shift `C[i]−P[i] mod29`; on the observed plaintext input move to the next position's state, while unused inputs may self-loop. Page starts use the corresponding position-state. All original ciphertext symbols are reproduced and exactly decrypted. This construction exposes the critical identifiability limitation: an unrestricted, sufficiently large lookup table can always memorize a desired answer, even if the answer is false.

An arbitrary literal state machine with `S` state-specific GP29 permutations and 29 independent next-state targets per state has a raw description space of `(29!)^S × S^(29S)`, or approximately

```text
S * log2(29!) + 29*S*log2(S) bits.
```

At **205 states** this is about **8,341 bytes** of fully independent choices; at 252 it is **10,526 bytes** and at 256 about **10,714 bytes**. These byte figures describe a completely arbitrary machine, **not a universal Kolmogorov lower bound**. A compact deterministic state-update algorithm could represent more than 256 states with a tiny seed. The printed 256-cell numeric table has only **256 bytes** under the conventional base60 interpretation and can neither specify those arbitrary tables in full nor uniquely select this architecture from the original artwork. Counts of table cells and states do not constitute an authenticated key schedule.

## Decision for follow-on work

The finite controls eliminate **16-state** and **29-state** globally shared stationary machines for all 89 candidate native-GP full-book passages, and **252-/256-state** models for **41/36** of those candidates, respectively. They leave 53 of the 89 candidate passages logically feasible at 256 under this necessary condition. The true unknown plaintext is unconstrained by a finite English sample, and source-visible page boundaries do not themselves select key resets. Exact forward re-encryption for an arbitrary chosen lookup table is insufficient because the same table can memorize any target sequence.

**Next productive decision:** prioritize obtaining an original-page instruction or historical artifact that fixes an executable transition/key generator and constrains the language register, then test that frozen specification on the authentic solved p56/p57 controls and untouched original pages. Do not scale up state-number searches or claim a solution based on dictionary-shaped outputs from freely learned permutations. A successful route must recover independently supported plaintext from the unknown pages.

**Reproduction:** `node sims/lp2_fsm_nextstate_capacity_sft.cjs`. The SFT has been executed against the current repository's exact source files, with all 89 capacity assertions, an independent wrong-key plant, and the universal upper witness passing. No automatic CI workflow is required.
