"""Issue #798: whole-LP2 familywise control for post-period HOME/HOMEX.

One runnable source-original test:
  Python 3.12, cmudict==1.1.3, no secrets or external URLs at runtime.
The fixed English word list and GP29 orthography are deliberately disclosed.
"""
import collections
import hashlib
import json
import random
import re
from pathlib import Path

import cmudict

ROOT = Path(__file__).resolve().parents[1]
SEED = 33013279
REPS = 10000
LENGTHS = (3, 4, 5, 6)
HOME = (8, 3, 19, 18)
GP_FOLDS = str.maketrans({"K": "C", "V": "U", "Q": "C", "Z": "S"})
DIGRAPHS = ("TH", "NG", "EO", "OE", "AE", "IA", "EA")

def emit(event, **values):
    print(json.dumps(dict(event=event, **values), sort_keys=True), flush=True)

def make_lexicon(tiles):
    t2i = {token: i for i, token in enumerate(tiles)}
    long = tuple(sorted(DIGRAPHS))
    prefixes = {k: set() for k in LENGTHS}
    source = sorted(set(w.upper() for w in cmudict.words() if re.fullmatch(r"[A-Za-z]+", w)))
    included = 0
    for raw in source:
        w = raw.translate(GP_FOLDS)
        chars = []
        i = 0
        while i < len(w):
            pair = w[i:i+2]
            if pair in long:
                chars.append(t2i[pair])
                i += 2
            else:
                chars.append(t2i[w[i]])
                i += 1
        if len(chars) < 3:
            continue
        included += 1
        for k in LENGTHS:
            if len(chars) >= k:
                prefixes[k].add(tuple(chars[:k]))
    assert HOME in prefixes[4]
    return prefixes, included, hashlib.sha256("\n".join(source).encode("utf8")).hexdigest()

def parse_pages(text, runes, source_pages):
    tokens = set(runes)
    records = []
    index = {ch: i for i,ch in enumerate(runes)}
    page_arrays = []
    period_count = 0
    for p, raw in enumerate(text.strip().split("\n%\n")[:55]):
        arr = []
        words = []
        word = []
        start = 0
        after_period = False
        current_after = False
        def flush():
            nonlocal word
            if word:
                words.append((start, len(word), current_after))
                word = []
        for ch in raw:
            if ch in tokens:
                if not word:
                    start = len(arr)
                    current_after = after_period
                    after_period = False
                arr.append(index[ch])
                word.append(index[ch])
            elif ch in "-.&$":
                flush()
                if ch == ".":
                    period_count += 1
                    after_period = True
            # '/' and physical line feed wrap transparently
        flush()
        # Source corpus indexes are the original rune sequence (no guessed rune OCR).
        actual = source_pages[p]["indices"]
        assert arr == actual, f"physical source mismatch page={p}"
        page_arrays.append(arr)
        for start, length, after in words:
            records.append((p, start, length, after))
    assert len(page_arrays) == 55
    assert sum(map(len, page_arrays)) == 12956
    assert any(p==32 and start==33 and after for p,start,length,after in records)
    return page_arrays, records, period_count

def summarize(pages, records, prefixes, include_hits=False):
    counts = {k:0 for k in LENGTHS}
    post = {k:0 for k in LENGTHS}
    post_max = 0
    all_max = 0
    exact_home = 0
    after_home = 0
    examples = []
    for page, start, length, after in records:
        text = pages[page]
        hit_length = 0
        for k in LENGTHS:
            if length >= k and tuple(text[start:start+k]) in prefixes[k]:
                hit_length = k
                counts[k] += 1
                if after:
                    post[k] += 1
        if hit_length > all_max:
            all_max = hit_length
        if after:
            post_max = max(post_max, hit_length)
        if length >= 4 and tuple(text[start:start+4]) == HOME:
            exact_home += 1
            if after:
                after_home += 1
        if hit_length >= 4 and include_hits and len(examples) < 90:
            examples.append({"page":page if page<50 else page+1,
                             "rune_start":start,"word_length":length,
                             "after_period":after,"prefix_length":hit_length,
                             "gp_indices":text[start:start+hit_length]})
    return {"all_counts":counts, "post_counts":post, "all_max":all_max,
            "post_max":post_max, "home_all":exact_home,
            "home_after_period":after_home,
            "examples":examples if include_hits else None}

def main():
    corpus = json.loads((ROOT/"resources/liber-primus/lp2-corpus.json").read_text("utf8"))
    raw = (ROOT/"resources/liber-primus/lp2-transcription.txt").read_text("utf8")
    source_pages = [page for page in corpus["pages"] if page["page"] <= 55 and page["indices"]]
    assert len(source_pages) == 55
    pages, words, period_count = parse_pages(raw, corpus["runes"], source_pages)
    prefixes, lex_words, sha = make_lexicon(corpus["translit"])
    assert (pages[32][33:38] == [*HOME, 14])
    assert len(words) == 2928, f"canonical page-word census changed: {len(words)}"
    assert sum(length-1 for _,_,length,_ in words)==10028
    after_positions = [(p,st,ln) for p,st,ln,after in words if after]
    original = summarize(pages,words,prefixes,True)
    emit("contract",seed=SEED,reps=REPS,source_runes=12956,
         pages=len(pages),source_words=len(words),period_marks=period_count,
         after_period_words=len(after_positions),lengths=LENGTHS,
         gp_spelling="K,Q->C; V->U; Z->S; greedy TH NG EO OE AE IA EA",
         dictionary="cmudict==1.1.3",dictionary_words=lex_words,
         dictionary_source_upper_alpha_sha256=sha,
         dictionary_prefix_counts={str(k):len(prefixes[k]) for k in LENGTHS})
    emit("original",summary=original)

    # Native-text planted marker control: make HOME a genuine four-GP-rune
    # prefix at 12 separate period-start word slots; no word boundary altered.
    planted = [list(page) for page in pages]
    eligible = [(p,st,ln) for p,st,ln in after_positions if ln>=4]
    assert len(eligible)>=12
    for p, st, _ in eligible[:12]:
        planted[p][st:st+4] = list(HOME)
    plant = summarize(planted,words,prefixes)
    assert plant["home_after_period"] >= 12
    emit("native_gp_positive_plant",planted_markers=12,
         added_after_home=plant["home_after_period"]-original["home_after_period"],
         plant_after4=plant["post_counts"][4],plant_max=plant["post_max"])

    rng = random.Random(SEED)
    ge_after_count4 = ge_all_count4 = ge_post_max = ge_all_max = 0
    ge_plant_after4 = 0
    ge_home_after = 0
    post4_distribution = collections.Counter()
    post_max_distribution = collections.Counter()
    all_max_distribution = collections.Counter()
    max_post4 = 0
    for iteration in range(REPS):
        shuffled = [list(p) for p in pages]
        for p in shuffled:
            rng.shuffle(p)
        sample = summarize(shuffled,words,prefixes)
        n_post4 = sample["post_counts"][4]
        max_post4 = max(max_post4, n_post4)
        post4_distribution[n_post4] += 1
        post_max_distribution[sample["post_max"]] += 1
        all_max_distribution[sample["all_max"]] += 1
        if n_post4 >= original["post_counts"][4]:
            ge_after_count4 += 1
        if sample["all_counts"][4] >= original["all_counts"][4]:
            ge_all_count4 += 1
        if sample["post_max"] >= original["post_max"]:
            ge_post_max += 1
        if sample["all_max"] >= original["all_max"]:
            ge_all_max += 1
        if n_post4 >= plant["post_counts"][4]:
            ge_plant_after4 += 1
        if sample["home_after_period"] >= original["home_after_period"]:
            ge_home_after += 1
    def pval(k):
        return round((k+1)/(REPS+1),8)
    emit("familywise_page_shuffle_null",
         preserving="each page rune multiset, all original word-length and punctuation slots, page boundaries",
         randomization="independent Fisher-Yates via Python random.Random seeded 33013279",
         reps=REPS, seed=SEED,
         observed_after_period_lex_prefix4=original["post_counts"][4],
         after_period_lex4_ge=ge_after_count4,
         p_after_period_lex4=pval(ge_after_count4),
         observed_fullbook_lex4=original["all_counts"][4],
         fullbook_lex4_ge=ge_all_count4,p_fullbook_lex4=pval(ge_all_count4),
         after_period_max_prefix=original["post_max"],
         after_period_max_ge=ge_post_max,
         p_postperiod_familywise_max=pval(ge_post_max),
         wholebook_max_prefix=original["all_max"],
         wholebook_max_ge=ge_all_max,
         p_fullbook_familywise_max=pval(ge_all_max),
         selected_postperiod_HOME_ge=ge_home_after,
         selected_specific_HOME_p_uncorrected=pval(ge_home_after),
         positive_plant_ge=ge_plant_after4,
         positive_plant_p=pval(ge_plant_after4),
         null_post4_hist=dict(sorted(post4_distribution.items())),
         null_postmax_hist=dict(sorted(post_max_distribution.items())),
         null_allmax_hist=dict(sorted(all_max_distribution.items())),
         null_max_post4=max_post4)
    emit("interpretation",home_is_claimed_plaintext=False,
         actual_unknown_plaintext_runes_recovered=0,
         familywise_scope="All printed full-stop word starts on all 55 original unknown rune pages; GP-lexicon lengths 3-6")

if __name__ == "__main__":
    main()
