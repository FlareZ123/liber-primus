# Blind two-colour nonlinear lifting inverse by projected lexical CSP

Agent9, 2026-11-25; Director [#2815](https://github.com/FlareZ123/liber-primus/issues/2815).

## Model and exact inverse
Fix zero-based GP29, original physical order, finite chapter path and missing exterior neighbor value 0. Forward: first update odd sites by adding f(P_left+P_right mod29), then update even sites by adding g(updated_odd_left+updated_odd_right mod29). Both f and g are arbitrary shared 29-entry GP29 tables. Reverse even update first, then odd update by subtraction. No private matrices, extra layers, per-chapter keys or parameter search. No additive gauge preserves fixed plaintext on observed entries: for fixed C and P, every encountered g entry is determined by even subtraction and every encountered f entry by odd subtraction. Unobserved arguments are nonidentifiable; require all 29 arguments in each stage during calibration.

This is an exploratory receiver; historical XOR and inward/outward imagery do not select the law.

## Constructive ciphertext-only recovery
Even plaintext symbols depend on g at publicly known sums of adjacent odd ciphertext symbols. For each printed word, enumerate its candidate native forms, project to even sites and translate each into a partial assignment of g values. Repeated arguments require equality. Deduplicate tuples. Exact unary and shared-pair arc propagation eliminates only unsupported assignments; if necessary DFS on remaining observed variable domains, with explicit 10,000-node cap and two-solution ambiguity stop. If g has a unique full table, decode evens. Filter dictionary forms by those even letters, derive f relations at odd sites using neighboring recovered evens, and solve in the same way. No training plaintext, known keyword or actual hidden table is supplied to recovery.

Use the pinned 35,944-form broad GP29 register from #2710, including all singleton runes. Strict intact printed group membership is part of this receiver, not an established property of LP2. Original source has 729 runes / 158 groups on pp0–2 and 308 / 66 on pp54–55, with page carries retained.

## Blind calibration and actual held-out recovery
Three independent hidden pairs of 29-entry tables. Sample original group lengths from held-out native-register Gibran, Shakespeare and Emerson donor tails, with one dictionary fallback in the Gibran pair. These are length-matched sampled words, not continuous natural prose. Fit only 729 opening-shaped runes; freeze both full tables and predict independently sampled 308-rune terminal-shaped ciphertext.

All three controls recover all 58 true table entries, all 2,187 fitted and 924 withheld runes. Every case is unique at both stages, with no DFS branching (one node each; four g propagation rounds, three f rounds). Exact encryption/decryption round trips were checked. This is a working constructive receiver, not merely a synthetic score distinction.

## Original opening failure and scope
The original even projection supplies 178,835 distinct partial tuples across 158 word factors, none individually empty. Their joint consistency fails during the first propagation round, with no branch or cap, before odd-table fitting. Thus **no g table, and therefore no f,g pair, satisfies all 158 original groups in the fixed register**. No original key exists to freeze under this strict model.

The strict diagnostic yielded five pairwise-disjoint contradiction cores (sizes 2,8,13,12,16). The budgeted inverse below supersedes that weaker bound.

## Budgeted inverse and all-key certificate

Allow seven arbitrary OOV groups (floor(5% of 158)). Optimize the number of failed projected dictionary factors over all g assignments by repeated coordinate updates with randomized escapes; for each best g candidate, optimize f in the same manner. On three independently sampled held-tail donor controls with seven randomly selected length>=5 groups replaced by non-register rune strings, the procedure recovers all 2,187 fit and 924 untouched runes. The true g projection costs are 3,7,7; all three fitted full keys achieve seven OOV groups. The same procedure on the original obtains 35 failed g factors after 160 restarts, 106 failed complete fit words, and 62/66 heldout OOV. These are heuristic upper bounds, not optimality proofs.

To obtain an exact all-key lower bound, let each word factor cost 0 for a permitted projected tuple, 1024 otherwise. Give each factor/variable edge an integer message m_fv(x), and each variable a compensating unary u_v(x)=-sum_f m_fv(x). For any key assignment their contributions cancel. Sum the minima of all reparameterized factors and unaries: this is a lower bound on the original cost, independently of how messages are obtained. For a factor, compute its exact minimum by taking the lesser of the minimum over allowed tuples and 1024 plus the sum of its message minima; the second term also covers all forbidden tuples. Min-marginals conditioned on one variable use the same calculation. Integer min-sum diffusion adjusts the messages, with exact compensating unary updates.

After 35 sweeps the original certificate is **7333/1024 = 7.1611328125**. Since OOV counts are integer, every g (and therefore every f,g) fails **at least eight** word groups. This excludes the stated seven-OOV model with no search completeness assumption. The output includes all messages, unary terms, factor minima and bound history (0,1191,3443,4942,5958,6619,7050,7333 in units 1/1024), so an independent verifier needs only the frozen factors and integer arithmetic. The three controls have dual bounds below their actual projected costs. The bound is not a claim of eight attainable, nor of the heuristic 35 being optimal.

**Conclusion:** the shared two-colour table law with the specified physical order, endpoint convention, intact groups and 35,944-form register is excluded at 5% OOV. Different segmentation, different lifting law or larger OOV allowance remain outside the result. No unknown LP2 plaintext recovered.

[Budgeted inverse SFT](../sims/lp2_two_colour_lifting_robust_sft.cjs) · [Full integer certificate and recovery output](lp2-two-colour-lifting-robust-output.json).

[SFT](../sims/lp2_two_colour_lifting_csp_sft.cjs) · [Executed output and pinned inputs](lp2-two-colour-lifting-csp-output.json). Executed in connected V8, no separate Node CI run.