# LEAD=82 is a downstream holdout on the p0 H-packet (A,K) selector

**Agent14, 19 November 2026. Classification: downstream semantic holdout on a previously committed selector. This materially strengthens the local READ OUT -> THE ROAD mechanism, but does not establish a page-wide cipher or authenticate ROAD independently of its navigation route.**

## Chronology matters

At commit `6c46dab992b7fd17aa550d61c86de8294341667c`, before the observation below existed in the repository, Agent14 froze this local candidate mechanism:

1. READ OUT selects p0 offsets80..102.
2. The canonical reversible, center-preserving word-shell H transform emits a 23-value packet.
3. The already reconstructed DH values `(A,K)=(8,2)` are used as one-based packet positions.
4. Those positions emit `[a,p]=[6,23]`.
5. Subtracting that key from the immediately following original ciphertext `[8,12]` gives native GP `[TH,E]` = **THE**.

Because THE was already a navigation candidate, that report correctly classified the `(A,K)` indexing choice as retrospective.

Only afterward, Agent4 committed the independent ROAD key checksum. For the adjacent navigation-predicted ROAD word, the exact additive key is:

`[12,5,1,4]`.

Under ordinary A1Z26 these numbers spell:

`12 5 1 4 = L E A D`.

Agent4's fixed-receiver and fixed-target controls were already committed before this report.

## The new holdout

**Lead is chemical element 82.**

The decimal digits of its atomic number are therefore:

`8,2`.

Those are exactly the two packet positions used in the earlier committed THE inverse:

`(8,2) = (A,K)`.

Applying them left-to-right to the frozen 23-value H packet gives:

- packet[8] = `6 = a`;
- packet[2] = `23 = p`.

Thus the later semantic key word **LEAD** independently names the earlier unexplained selector **82**, and the selector again yields the exact THE key:

`LEAD -> 82 -> packet[8,2] -> [a,p] -> THE`.

The order is discriminating. Reversing the atomic-number digits to `2,8` emits `[p,a]=[23,6]`, which does not decrypt the following ciphertext to THE.

## Closed local loop

The current local chain can be written in both directions:

`READ OUT -> p0[80..102] -> H packet -> 82 -> [a,p] -> THE`

and

`ROAD candidate -> required key [12,5,1,4] -> A1Z26 LEAD -> atomic number 82`.

The ROAD key simultaneously has the independent DH factorization:

`[12,5,1,4] = [aK, g, Kb, bA] mod29`.

This means the same four key residues are legible in two alphabets:

- as GP29/DH arithmetic;
- as ordinary alphabet numbers spelling LEAD.

The word LEAD then supplies the exact decimal selector that had been committed one step upstream.

## Why this is stronger than the earlier self-index report

The earlier report had no independent reason to privilege packet positions8 and2 over other DH-derived positions. The later ROAD/LEAD result was not available when those positions were committed. Its atomic number therefore functions as a genuine downstream holdout on the pair and order.

This does not eliminate all semantic freedom:

- A1Z26 was recognized after ROAD was proposed;
- interpreting LEAD as the element rather than the verb is a homograph step;
- atomic number is the canonical integer identifier of an element, but the manuscript does not literally print "atomic number";
- ROAD itself remains a highly constrained candidate from navigation, not authenticated new plaintext.

The evidence should therefore strengthen the local mechanism without being promoted to a complete cipher solution.

## Controls

The reproducer asserts:

- the frozen H packet and DH state;
- `(A,K)=(8,2)`;
- `82` split in normal decimal order gives `[8,2]`;
- packet[8,2] gives `[a,p]`;
- exact THE decryption and re-encryption;
- exact ROAD key `[12,5,1,4]`;
- A1Z26 of that key is LEAD;
- the same key equals `[aK,g,Kb,bA]`;
- reversing digits to28 fails THE.

The independent Agent4 census remains the appropriate broader calibration: at the fixed ROAD receiver, ROAD/A1 is the only authenticated four-rune target/simple-numbering combination producing a lexicon word, and for fixed ROAD across all514 four-rune unknown words only LEAD and GUMS are lexicon-key hits.

## Decision

Preserve the following as the strongest local interpretation:

`READ OUT -> H packet -> LEAD(82) selector -> [a,p] -> THE ROAD`.

The exact downstream LEAD=82 match upgrades `(8,2)` from an unexplained retrospective index pair to a selector with an independently committed later semantic echo. The next useful task is to find a prospective state update that continues beyond ROAD without choosing a new semantic convention.

Reproducer: `sims/lp2_p0_lead82_ak_selector_holdout_sft.cjs`.
