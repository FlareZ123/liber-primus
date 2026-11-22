"""Original LP2 word-start GP-English signal conditional on every page's digram counts.

Scope: exact first-order-preserving random Eulerian trails, no cipher fitting.
The accepted original word boundaries include all 32 page-spanning words.
"""
import collections
import json
import random
from pathlib import Path

from lp2_p32_home_english_prefix_familywise_sft import (
    ROOT, LENGTHS, make_lexicon, parse_pages, summarize, emit
)

REPS = 2500
SEED = 33015581

def eulerian_permutation(sequence, rng):
    """Randomly reorder outgoing edges; Hierholzer yields a legal original-digram trail."""
    if len(sequence) < 2:
        return list(sequence)
    outgoing = [[] for _ in range(29)]
    for prev,next_symbol in zip(sequence, sequence[1:]):
        outgoing[prev].append(next_symbol)
    for destinations in outgoing:
        rng.shuffle(destinations)
    stack = [sequence[0]]
    path = []
    while stack:
        at = stack[-1]
        if outgoing[at]:
            stack.append(outgoing[at].pop())
        else:
            path.append(stack.pop())
    randomized = path[::-1]
    assert len(randomized) == len(sequence)
    assert randomized[0] == sequence[0]
    assert randomized[-1] == sequence[-1]
    return randomized

def matched_bigram_counts(first, second):
    return collections.Counter(zip(first,first[1:])) == collections.Counter(zip(second,second[1:]))

def main():
    corpus = json.loads((ROOT/"resources/liber-primus/lp2-corpus.json").read_text("utf8"))
    raw = (ROOT/"resources/liber-primus/lp2-transcription.txt").read_text("utf8")
    native_pages = [page for page in corpus["pages"] if page["page"] <= 55 and page["indices"]]
    pages, words, period_count = parse_pages(raw, corpus["runes"], native_pages)
    prefixes, n_lex, sha = make_lexicon(corpus["translit"])
    assert len(words) == 2896
    rng = random.Random(SEED)
    original = summarize(pages,words,prefixes)
    assert original["all_counts"][4] == 68
    assert original["post_counts"][4] == 6

    # Exact positive controls: one page and a handcrafted Eulerian closed walk
    test = [0,1,2,0,1,3,0,1,2,0]
    for _ in range(20):
        candidate = eulerian_permutation(test,rng)
        assert matched_bigram_counts(candidate,test)
    assert all(matched_bigram_counts(eulerian_permutation(pages[p],rng),pages[p])
               for p in (0,15,32,49,54))
    emit("contract", original_runes=12956, genuine_words=2896,
         page_spanning_words=32, eligible_after_period_words=174,
         one_based_page_count=55, reps=REPS, seed=SEED,
         source_lexicon="cmudict==1.1.3",source_lexicon_sha256=sha,
         fixed_GP_word_starts=True,
         null="random outgoing-edge permutations / exact directed Eulerian traversal per page",
         held_exact="all original within-physical-page ordered digram counts, page start/end rune, page rune multiset, word lengths, period slots, all word-start locations",
         original_all_gp4=original["all_counts"][4],
         original_afterperiod_gp4=original["post_counts"][4])
    exceeding_all = 0
    exceeding_post = 0
    all_hist=collections.Counter()
    post_hist=collections.Counter()
    samples=[]
    for i in range(REPS):
        shuffled = [eulerian_permutation(page,rng) for page in pages]
        if i < 3:
            for p in range(len(pages)):
                assert matched_bigram_counts(pages[p],shuffled[p])
        outcome = summarize(shuffled,words,prefixes)
        a,p=outcome["all_counts"][4],outcome["post_counts"][4]
        all_hist[a]+=1
        post_hist[p]+=1
        exceeding_all += int(a>=68)
        exceeding_post += int(p>=6)
        if i<4:
            samples.append({"rep":i,"all_4":a,"post_4":p})
    emit("exact_digram_null_result",
         reps=REPS,seed=SEED,
         all4_observed=68,all4_null_ge=exceeding_all,
         all4_p=(exceeding_all+1)/(REPS+1),
         all4_null_mean=sum(k*v for k,v in all_hist.items())/REPS,
         all4_null_min=min(all_hist),all4_null_max=max(all_hist),
         post4_observed=6,post4_null_ge=exceeding_post,
         post4_p=(exceeding_post+1)/(REPS+1),
         post4_null_mean=sum(k*v for k,v in post_hist.items())/REPS,
         post4_null_min=min(post_hist),post4_null_max=max(post_hist),
         first_four=samples,unknown_plaintext_recovered=0)
    emit("method_limit", claim="conditional random-Eulerian outgoing-edge sampling, not proven exact uniformity over all distinct Eulerian trails",
         interpretation="tests first-order-transition artifact versus word-start-specific higher-order signal; not a decryption or key")

if __name__ == "__main__":
    main()
