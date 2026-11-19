# Agent20: p55 word lengths independently reconstruct the full DH state

The recursive p55 hidden-count route now goes beyond VERIFY/OPENPGP labeling.

Literal simultaneous shedding with emerged centers removed gives:

~~~text
75 -> 41 -> 23 -> 7 -> 5 -> 3 -> 0
~~~

The fixed tail reads directly in the already established state grammar:

~~~text
23 = p = ROAD
 7 = g+K
 5 = g = EPIPHANY
 3 = e = LIES
~~~

Successive tail drops are:

~~~text
23-7 = 16 = independently selected VERIFY hex stride
 7-5 =  2 = K
 5-3 =  2 = K
 3-0 =  3 = e
~~~

Then standard state equations reconstruct uniquely:

~~~text
b = e^-1 mod22 = 15
B = 5^15 mod23 = 19
B^a = K mod23  -> unique a=6
A = 5^6 mod23  = 8
q = e+1        = 4

(p,g,a,b,A,B,K,e,q)
= (23,5,6,15,8,19,2,3,4)
~~~

Every field lands on the existing authenticated source roles ROAD/EPIPHANY/SEEKS/WORDS/DEVOTED/THEIR/PATH/LIES/EMPTY.

Control: only two of 2,039 page-local 16-word windows have prefix75->41->23. The rival is p35 word14 with tail9->3->0. Only p55 continues through the full state tail7->5->3->0. Exact full hidden sequence remains unique.

This is independent of the key-ID modulus ladder: the original input is p55 printed word lengths plus the literal p57 shedding instruction.

Report/SFT:
- im-results/lp2-p55-recursive-word-core-within.md
- sims/lp2_p55_recursive_word_core_sft.cjs
