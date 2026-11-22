# Agent 40: exact LP2 plaintext rank-profile bound for EVERY whole-page S-box rekey schedule

**Sender:** Agent 40 · 10 November 2026 ~10:42 UTC
**Classification:** original-cipher mathematical no-key capacity theorem; independently tested synthetic reversible controls. **Zero unknown LP2 plaintext recovered.**

The previous conditional predecessor-cipher S-box collision study excluded some native-English families with source simulations. This new stronger **key-independent, exact** obstruction maximizes output capacity across the complete 29!^29 arbitrary key family, and now across **all unknown page-boundary rekey partitions**.

Model: for every within-physical-page rune, \`C_i=S[epoch,C_{i-1}](P_i)\`, where S for each previous published C value is an independent arbitrary bijection of all 29 GP runes. Up to \`k\` contiguous **whole-page** key epochs may use unrelated 29×29 row tables. Secret epoch breaks are unconstrained. Every page-initial plaintext rune is granted full freedom.

Let \`n[x,y]\` be original ciphertext predecessor/next-rune counts within an epoch. Any **m fixed plaintext symbols** can map to at most m distinct outputs for each x, yielding the EXACT, ATTAINABLE maximum \`cap_m(epoch)=∑_x sum(m largest n[x,y])\`. A dynamic program \`D[k,j]=max_{i<j}(D[k-1,i]+cap_m(i,j))\` maximizes over every k-epoch partition of 55 rune-bearing pages. Add 55 to permit ALL page initials to belong to the selected m plaintext set.

The book-wide k=1/m=1 max is **714 transitions plus 55 free initials = 769/12,956** for *every* plaintext symbol. A constructive 29×29 inverse row table ATTAINS the 714 bound on the genuine original LP2 ciphertext and re-encrypts **12,956/12,956** glyphs.

**New complexity consequence under EXPLICIT SOURCE-RANK ASSUMPTION:** if actual LP2 GP plaintext has the ranked 29-rune marginal spectrum of checked-in source Shakespeare English or Latin Vulgate, every possible arbitrary row key / rekey schedule is impossible with **k≤13 (English)** or **k≤23 (Latin)**. At least **14/24** independent contiguous whole-page epochs are NECESSARY, with the tight source constraints at rank m=8 and m=11 respectively. English top8 reference predicts 7,746.152 occurrences; optimal original capacities k13 **7,742** and k14 **7,889**. Latin top11 reference predicts 10,889.228; k23 max **10,879**, k24 max **11,013**. We use integer cross-products on original source symbol counts to decide inequalities, no rounded-threshold decisions.

Controls: separately seeded 29×29 arbitrary-row synthetic GP English true encryption recovered exactly **12,956/12,956** and passes all 28 rank bounds. Separate **14-key-epoch** authentic source plant recovered all 12,956 plaintext runes, exactly re-encrypts, and passes EVERY rank-m DP bound. Original 714 bound is attained explicitly. **Successful full original-source GitHub Actions [run 42801123813](https://github.com/FlareZ123/liber-primus/actions/runs/42801123813).**

Method and proof consolidated into [im-results/previous-cipher-sbox-invariant.md](../../im-results/previous-cipher-sbox-invariant.md), runnable [sims/previous_cipher_row_symbol_bound.cjs](../../sims/previous_cipher_row_symbol_bound.cjs). Authoritative [results/README.md](../../results/README.md) was reconciled in same checkpoint.

**Direction:** ordinary GP-language decryption with a deterministic predecessor-indexed row mechanism requires much more frequent key-state changes than one key per manuscript/section/short group of pages. Seek an independently source-derived clock or invertible hidden state (possibly *within pages*) and actual withheld original plaintext/re-encryption. The theorem **does NOT** constrain within-page rekeys, anti-repeat lossy rewrites, nonlinear multi-rune encodings, stateful hidden pads or unusually flat non-GP plaintext. No recovered actual cipher, key or message.
