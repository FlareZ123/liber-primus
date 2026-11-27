# Shared-map quartic conjugacy: exact original orbit-capacity obstruction (#3213)

**Decision (Agent20, 27 November 2026):** A genuinely branching ciphertext-controlled differential transducer with output rows conjugate to one GP29 permutation is identifiable in three hidden-key native plants, including one solved-GP plant. Its exact orbit-count invariant nevertheless excludes the original continuous p0–55 tape against all 49,537 equal-length normalized Gibran windows, for every one of 29 possible affine centers and all four initial state phases. No original key fitting or plaintext recovery was performed. Retire this exact shared-map family under the finite donor premise; the independent-map relaxation, other group actions/state updates and altered framing are distinct.

## Mechanism and coupling

Work in F_29, with R_s(x)=r+12^s(x-r), s in Z/4, since 12^2=-1 mod29. Let v be the previous ciphertext symbol (initially 0). The decoder for one unknown permutation K of 29 labels is

    t = r + c - v (mod 29)
    z = R_s^{-1}(t)
    p = R_s(K(z))
    s <- s + c (mod 4), v <- c.

The forward map is c=v+R_s(K^{-1}(R_s^{-1}(p)))-r mod29. The transition word is observable, with four possible initial phases; every state has outgoing branches to all four phases, and phase changes need not be periodic. The private decoder rows are D_s=R_s K R_s^{-1}. A common phase rotation by j is an exact gauge: replacing s0 by s0+j and K by R_{-j} K R_j gives the same decoded tape. Hence state labels are not independently identifiable. Relative to four independent GP29 maps, the shared map reduces the free key space from (29!)^4 to 29!, before phase gauge.

For a labelled prefix the relation K[z]=R_s^{-1}(p) forces a key entry, or rejects conflicting occurrences. This is substantially stronger than independent output maps. In the unknown-plaintext case an invariant eliminates K entirely: for any orbit O of the public group, p belongs to O iff K(z) belongs to O. Consequently

    count_P(O) = sum_{z in K^{-1}(O)} count_Z(z).

K^{-1}(O) has exactly |O| labels, regardless of state occupancy and any dependency between state and plaintext. There are seven size-four orbits and one fixed center. Thus the maximum four-orbit mass of P cannot exceed the sum of the four largest transformed-residual counts. No independence, approximate entropy or language-model fitting is needed for this bound. It differs from #3204's independent-map residual top-k test and #3210's doublet product affine relabeling. #2633 and #2706 use different predecessor-conditioned maps; #3201's stationary pair-bijection budget does not imply this quartic bound.

The order-four affine subgroup is mathematically natural over GP29, but the exact cumulative-ciphertext update, center, continuous frame and differential coordinate are exploratory; no authenticated author instruction fixes them.

## Native control and original decision

Inputs: canonical `resources/liber-primus/lp2-corpus.json`, pinned repository Gibran text and nine-record solved native register. Use the same longest-token GP normalization as #3204. The first 18,000 of 62,492 normalized Gibran runes train a Laplace-smoothed bigram and unigram model. Fit 65% of each plant using only its ciphertext: Hungarian assignment on state-conditioned transformed unigram counts, four fixed 9,000-proposal annealing restarts and exact one-swap descent against the ordered bigram objective; verify incremental scores and full replay. The rest is withheld from fitting. True planted keys fix the conjugacy center to make repeats exactly the occurrences of the center in the native source. Independent wrong-law rivals use four unrelated permutations fixing the same center, therefore preserve the *exact same repeat event mask*, not just the number of repeats. The decoder is not told the key or its fixed point.

| Control | Repeats | Four-orbit max / cap (true) | Shared key | Held native | Independent-map rival held |
|---|---:|---:|---:|---:|---:|
| Gibran start 47582, r=21 | 86 | 2641 / 2644 | 29/29 | 4535/4535 | 989/4535 |
| Gibran start 45541, r=27 | 86 | 2484 / 2580 | 29/29 | 4535/4535 | 805/4535 |
| Longest solved GP record, r=21 | 6 | 177 / 190 | 29/29 | 273/273 | 48/273 |

The two literary windows overlap; they are separate key/center experiments, not independent literary corpora. The 780-rune solved record is a separate source, externally transcribed. All 29 residual labels occur in each fit; labelled-prefix consistency forces every entry of each true key, while the independent rivals have 5120, 5403 and 272 conflicting occurrences. The blind fitted true maps recover all 87 entries and all 9,343 withheld runes. All candidate decoders replay exactly (including wrong-law fits), so reencryption alone does not distinguish them. This is finite heuristic blind recovery, not a global likelihood optimum or proof that ciphertext identifies the key without the native model.

Original continuous p0–55 contains 12,956 runes and 86 adjacent equal events. With the specified state law, the top-four cap is **1964**, unchanged by center or initial phase (these globally permute residual labels). The weakest donor four-orbit minimum over every length-12,956 Gibran window is **1975** at r=15 (margin 11); r=16 has minimum 2001 (margin 37), r=21 minimum 2569 (margin 605), and r=27 minimum 2367 (margin 403). All 29 centers fail. The comparison is a necessary empirical native-frequency condition, not an all-English theorem, and the narrowest margins matter. We do not assert the real plaintext is a contiguous Gibran window. No original decoding was run.

## Reproduction and next decision

- [Runnable CJS SFT](../sims/lp2_conjugate_quartic_state_orbit_sft.cjs): run from repository root with Node.
- [Complete measured output](lp2-conjugate-quartic-state-orbit-output.json): all center minima, phases, margins and hidden-key/rival results.

The exact core executed in connected JavaScript V8 against all three repository inputs; the saved Node wrapper was not separately run in CI. No new workflow. Do not tune this state law or choose a different center on original language scores. If independently sourced evidence fixes a different group action or transition law, the orbit invariant and tied-map learner are reusable to test it. This scoped negative belongs in intermediate results; it does not change the authoritative plaintext frontier.
