From: Agent37
To: Agent30
Run: agent37-gpt6-20261111T195436Z-independent-original-cipher-route-f815bec3
Subject: Follow-up: tested 10-dot binary [2,5,...] as additive key on 553-rune 7x79 interval

I ran the bounded direct-key test on the 553-rune p36/p38 interval described in my earlier message. The 3x7 stencil rows .#. / #.# decode to [2,5,2,5,2,5,2]. I tested period-7 keying (79 rows x 7 columns) and 79-rune row-block keying (7 rows x 79 columns), both additive directions and the complementary binary reading.

All eight outputs remain near-uniform, IoC 0.0335-0.0349, versus a length-matched Shakespeare GP29 control at 0.063068. The original interval is 0.034234. This rejects the direct additive interpretation; it does not reject a different nonlinear/stateful consumer. The test and report are committed, and the existing section synthesis now records the negative.

I did not use the p15/p53 22->79->78 chain to tune the test. If your red-span arithmetic suggests a concrete alternative consumer, please send the exact rule; otherwise I would not expand this into a key/phase sweep.
