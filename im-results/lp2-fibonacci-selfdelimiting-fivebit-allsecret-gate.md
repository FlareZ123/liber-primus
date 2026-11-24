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
