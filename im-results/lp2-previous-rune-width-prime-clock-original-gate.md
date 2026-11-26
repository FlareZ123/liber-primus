# Delayed native token-width prime clock: exact p40 contradiction (#3059)

**Decision (Agent15, 26 November 2026):** the fixed delayed GP token-width prime-minus-one clock with literal-F holds has no legal original inverse from the first prime on p40–53. No unknown plaintext or authentic key recovered. Unlike the prior #2742 clock, this state update is genuinely delayed.

## Operation and prior-model distinction

The source supplies canonical GP29 chart expansions (length 1 or 2) and the genuinely solved p56 prime-minus-one shift with nonconsuming literal plaintext F. The proposed extra delayed-width state is exploratory, not an authenticated cipher instruction.

On each consuming plaintext rune p≠0, start state (t,w)=(0,1), emit C=(p+prime[t]−1) mod29, then set (t,w)=(t+w,length(p)). Here prime[0]=2. A plaintext F emits 0 and holds both state components. The earlier #2742 receiver emits with the same current prime but advances by length(p) immediately, without the stored previous width. For the n-th consuming rune (zero-based, n≥1), the old cursor is Σ_{j=0}^{n−1} length(p_j), whereas the delayed cursor is 1+Σ_{j=0}^{n−2} length(p_j). Their difference 1−length(p_{n−1}) depends on the previous plaintext rune, so a constant origin offset cannot identify the two clocks. F holds preserve this relation because both sums are over consuming runes.

Freeze the 3,008-rune p40–53 chapter, fit p40–52 (2,829 runes) and withhold physical p53 (179 runes), without any printed boundary assumptions or origin/sign sweep. The issue comments recorded the model and control split before original scoring.

## Exact inverse and controls

At state (t,w) with visible c, include literal F if c=0 with the unchanged state. Independently calculate p=(c−prime[t]+1) mod29; if p≠0, include the consuming transition to (t+w,length(p)). These are exhaustive. Merge identical states with exact BigInt multiplicities; no path is dropped. For language selection only, use exact Viterbi over (t,w,last two decoded runes), with the same smoothed trigram formula as #2742 (unigram α=.5, bigram mass10, trigram mass4), fitted on the six solved records excluding the three plant source sections. Freeze the best prefix state and context before decoding the suffix. Every selected path replays.

| 299-rune native plant | Full legal paths | Fit exact /223 | Frozen suffix exact /76 | Current-width rival paths | Ordinary-clock rival paths |
|---|---:|---:|---:|---:|---:|
| WELCOME offset0 | 23,040 | 223 | 76 | 0 | 0 |
| KOAN1 offset0 | 384 | 223 | 76 | 384 | 0 |
| KOAN1 offset350 | 256 | 218 | 76 | 0 | 0 |
| LOSS OF DIVINITY offset0 | 24 | 223 | 76 | 0 | 0 |

Fit 887/892 and withheld 304/304; the 5 missed fit runes establish real ambiguity under the frozen language model. The model accepts the second current-width rival, so legality does not always distinguish these clocks. Four ordinary-clock rivals and three of four current-width rivals are exactly impossible. Genuine p56 reproduces 85/85 under the ordinary clock; its known plaintext reenciphered under the delayed clock agrees only 10/85, and its actual ciphertext has zero legal delayed-clock paths, dying at rune24.

## Original certificate

At one-based chapter position74 (physical p40 zero-based local offset73) the original ciphertext is GP14. Exactly two legal prefix histories survive through the preceding 73 runes, coalescing into the single state (t,w)=(91,1). The 92nd prime is 479, with (479−1) mod29=14. The consuming inverse forces p=(14−14) mod29=0, which cannot be consumed under the authentic literal-F rule; the literal-F branch is unavailable because c=14≠0. Consequently the reachable set becomes empty. Peak reachable state count on the original prefix is only two. Both the 2,829-rune fit and full 3,008-rune chapter have zero legal histories; no original suffix language scoring is performed.

Retire this fixed delayed-width rule at the first-prime chapter origin; no new offsets, signs, alphabets or expansion conventions were searched. It does not exclude other prime clocks or initial conditions. The genuine source control authenticates the ordinary rune clock, not a delayed-width update. The present decision is an exact original-cipher contradiction, not a claimed general language exclusion.

Reproducer: [standalone CommonJS SFT](../sims/lp2_previous_rune_width_prime_clock_sft.cjs). The exact experiment core and separate original dead-state trace ran against repository inputs in connected V8; the standalone Node filesystem wrapper was not separately executed. Source blobs: canonical corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; solved-native source 1b064ef6d85819b7d96adaff31a82d1ec551598f.
