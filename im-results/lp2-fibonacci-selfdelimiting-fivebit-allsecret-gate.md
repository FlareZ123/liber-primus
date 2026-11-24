# p15-selected Fibonacci self-delimiting decoder: exact five-bit alphabet bound

Director #2531, Agent5, 2026-11-24.

## Source-selected candidate

Physical p15 contains the solved Fibonacci-indexed prime spiral. Fibonacci prefix coding was publicly documented before LP2: Apostolico and Fraenkel, *Robust Transmission of Unbounded Strings Using Fibonacci Representations*, [1985 Purdue technical report](https://docs.lib.purdue.edu/cstech/464/) and IEEE TIT 33(2), 238–245 (1987). [Lelewer and Hirschberg's 1987 data-compression survey, Fig. 3.7](https://ics.uci.edu/~dhirschb/pubs/DC-Sec3.html), gives explicit codeword vectors. This licenses a historically available mathematical candidate, not a claim that Cicada authored it.

The earlier p15 Zeckendorf gate (#1469) encoded the sixteen printed integers into five-bit GP groups, then tested additive receivers. Here the direction differs: treat the original following pp16–22 rune tape as five-bit chunks, decode the self-delimiting stream directly to native GP indices plus one. No source instruction authenticates the packing; it is the fixed candidate being tested. Each integer 1..29 is uniquely represented as least-significant-first Zeckendorf digits (weights 1,2,3,5,...) followed by one extra 1. A codeword ends in 11 and has no earlier adjacent 1s. A final fringe shorter than five bits may complete the stream; no private interior bits.

## Historical and native controls

Decode the exact ten published Fig. 3.7 codewords concatenated in table order (49 bits): integers 1,2,3,4,5,6,7,8,16,32 exactly; the encoder regenerates every vector.

An authentic solved-native KOAN2 text (section jpg107-167, 319 runes) yields 2,006 Fibonacci-coded bits, 401 complete five-bit chunks and terminal bit 1. The chunks use 28 of 32 five-bit values. An explicit fixed 29-entry transport alphabet maps these chunks bijectively to GP labels and preserves the one-bit fringe. The decoder reconstructs all 319 native runes exactly. This is a control using historical solved content and a synthetic transport alphabet, not a claimed historical encryption.

## Original receiver and all-secret obstruction

The original pp16–22 receiver has 1,744 runes. Canonical five-bit expansion immediately yields codeword 100101011 = 53, outside 1..29. It cannot be repaired by terminal fringe.

Stronger: permit **every** injective fixed assignment from 29 GP symbols to 29 of the 32 five-bit strings. For values 1..29 Fibonacci codewords have maximum length 8. A complete such stream cannot contain 10 consecutive bits with no adjacent 11: even the longest gap between successive codeword terminators, including one bit from each terminator, has length at most 8 without an internal 11. This remains true regardless of a terminal fringe shorter than five bits.

There are eight five-bit strings beginning with zero and containing no internal 11: 00000,00001,00010,00100,00101,01000,01001,01010. Any 29-entry injective alphabet must include at least five of these. Every ordered pair of those five strings gives ten consecutive bits without 11. Therefore their corresponding rune labels must form a loop-free independent set of size at least five in the observed original adjacency graph: neither direction of any edge may occur, including self edges.

Exhaustive independent-set enumeration on the original 1,744 runes (723 distinct directed adjacency types, ten loop labels) finds maximum size **2**. A witness is indices [10,16]; every larger set is impossible. Consequently at most 2 of the 8 forbidden-class bit strings can be assigned to the rune alphabet; the entire allowable fixed transport alphabet has cardinality at most 32-8+2=26, below 29. This is exact for the frozen framing and even covers arbitrary secret bit relabeling, complement/reversal insofar as they are just choices of five-bit code assignment. It is not a test of arbitrary reordering or different integer range.

The planted KOAN2 graph has maximum independent set size 10; its eight selected zero-start no-11 bit labels form an actual independent witness. The theorem therefore accepts the exact reversible plant.

## Decision

Retire the direct Fibonacci-to-native-GP five-bit inverse on this original chapter, even with an arbitrary fixed secret 29-of-32 alphabet. This does not exclude Fibonacci coding with other target ranges, other bit transport, or a separately justified source-dependent state law. No original plaintext, key or continuation recovered.

Reproduce: `node sims/lp2_fibonacci_selfdelimiting_fivebit_allsecret_sft.cjs`. Actual canonical inputs and exhaustive graph result executed in this invocation; no CI claim.

## Extension: every minimum-width variable-length binary prefix alphabet

The fixed-width transport might have failed because 29 is not a power of two. A complete truncated binary code can instead use three four-bit leaves and 26 five-bit leaves. More generally, grant **every** prefix-free set of 29 nonempty binary codewords with maximum length five, even incomplete trees, and every assignment of its leaves to GP symbols. This is the minimum possible maximum width for a 29-symbol alphabet. It is still a finite fixed transport, without an unknown adaptive state.

There are exactly 15,848 codeword sets. Starting with all 32 depth-five leaves, a 29-leaf set has a deficit of three. At each of the 16 four-bit prefixes, either keep both leaves (deficit 0), keep one child or the parent (three deficit-1 choices), or keep neither (deficit 2). The coefficient of x³ in `(1+3x+x²)^16` counts 15,840 dictionaries. The only remaining case is one depth-three leaf replacing four depth-five leaves, with eight possible choices. A depth-two or shorter codeword would cost at least seven leaves and is impossible. The 560 balanced complete truncated-binary dictionaries are included.

An exhaustive enumeration shows every dictionary has at least five words that begin with zero and contain no 11, and at least two of those have length five. For dictionaries with minimum length at least four, any such five-bit leaf concatenated in either order with any other such leaf produces at least nine consecutive bits with no 11. A valid Fibonacci stream for GP values 1..29 never contains such a substring: each codeword has length at most eight, and every codeword terminates in 11. Hence two distinct five-bit bad labels must have no self loops, no mutual edges, and at least three other common non-neighbors in the ciphertext adjacency graph. For the eight dictionaries with a depth-three leaf, the enumeration finds at least five bad five-bit leaves, requiring an independent set of at least five labels.

On the original 1,744-rune pp16–22 tape, ignoring the first and last rune in order to grant partial fringe bits, the graph still contains 723 directed edge types. The largest set comprising two loop-free mutually nonadjacent labels and all their common non-neighbors has size **2**, witnessed by GP indices 10 and 16. In particular there are no triples of the required form, so **all 15,848 prefix dictionaries and all 29! assignments for each fail**. The earlier fixed-width result is a special case. This conclusion allows up to one partial transport word at each end, but no arbitrary inserted interior bits or codeword lengths above five.

A genuinely reversible balanced transport control uses short leaves 0000,0001,0010 and the remaining 26 five-bit leaves. The solved-native KOAN2 section gives 2,006 Fibonacci bits, packed into 413 GP labels using four explicit terminal pad bits. All 319 plaintext runes recover exactly, and all its actual bad-label graph constraints hold. The new receiver is therefore functional, but the original chapter is incompatible. No original plaintext or key found.

Run `node sims/lp2_fibonacci_balanced_variable_width_allsecret_sft.cjs`. Executed against canonical inputs during this invocation, not a CI claim. Code commits 346b931e and cd7740bb.
