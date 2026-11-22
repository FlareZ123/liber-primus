"""Exact 12,956-phase GP-English four-rune word-start alignment test.

A source-motivated alternative to generic page/digram shuffling: keep the
ENTIRE ciphertext n-gram stream fixed, rotate its alignment to all authentic
printed word-start slots, score ALL phases without random sampling.
"""
import collections
import json

from lp2_p32_home_english_prefix_familywise_sft import (
    ROOT, make_lexicon, parse_pages, emit
)

def main():
    corpus = json.loads((ROOT/"resources/liber-primus/lp2-corpus.json").read_text("utf8"))
    raw = (ROOT/"resources/liber-primus/lp2-transcription.txt").read_text("utf8")
    source_pages = [v for v in corpus["pages"] if v["page"]<=55 and v["indices"]]
    pages, words, n_periods = parse_pages(raw,corpus["runes"],source_pages)
    prefixes, n_dict, sha = make_lexicon(corpus["translit"])
    glyphs = [value for page in pages for value in page]
    N = len(glyphs)
    assert N == 12956 and len(words) == 2896
    offset = []
    total = 0
    for page in pages:
        offset.append(total)
        total += len(page)
    starts = [offset[p]+pos for p,pos,length,after,slots,end in words if length>=4]
    post = [offset[p]+pos for p,pos,length,after,slots,end in words if length>=4 and after]
    assert len(starts) > 1000 and len(post)>0
    hit = [int(tuple(glyphs[(i+j)%N] for j in range(4)) in prefixes[4]) for i in range(N)]
    # Prove authentic unchanged words read out at all their printed runic starts.
    wordprefixes = [tuple(pages[pg][local] for pg,local in slots[:4])
                    for p,pos,length,after,slots,end in words if length>=4]
    assert sum(int(word in prefixes[4]) for word in wordprefixes) == sum(hit[i] for i in starts)
    original_all = sum(hit[i] for i in starts)
    original_post = sum(hit[i] for i in post)
    assert original_all == 68 and original_post==6
    emit("contract",n_glyphs=N,n_authentic_words=len(words),
         n_eligible_starts=len(starts),n_eligible_post_starts=len(post),
         original_all=original_all,original_post=original_post,
         max_phases=N,lexicon="cmudict==1.1.3",lexicon_sha256=sha,
         null="each of all 12956 possible exact circular relative phases of complete unchanged GP29 ciphertext versus original printed word-start coordinate masks",
         preservation="exact source ciphertext stream, all rune n-gram histograms, word-start masks, punctuation and printed word lengths")
    all_counts = []
    post_counts = []
    for k in range(N):
        all_counts.append(sum(hit[(start+k)%N] for start in starts))
        post_counts.append(sum(hit[(start+k)%N] for start in post))
    assert all_counts[0] == original_all and post_counts[0] == original_post
    all_ge = sum(x >= original_all for x in all_counts)
    post_ge = sum(x >= original_post for x in post_counts)
    emit("all_phase_exact_result",
         exact_phases=N, original_phase=0,
         allGP4_actual=original_all,
         allGP4_null_mean=sum(all_counts)/N,
         allGP4_min=min(all_counts),allGP4_max=max(all_counts),
         allGP4_tail_count=all_ge,
         allGP4_tail_probability=all_ge/N,
         postGP4_actual=original_post,
         postGP4_null_mean=sum(post_counts)/N,
         postGP4_min=min(post_counts),postGP4_max=max(post_counts),
         postGP4_tail_count=post_ge,
         postGP4_tail_probability=post_ge/N,
         phases_greater_all=sorted(range(N),key=lambda k:all_counts[k],reverse=True)[:15],
         all_at_top_phases=sorted(all_counts,reverse=True)[:15],
         original_fourgram_match_count_in_entire_circular_stream=sum(hit),
         actual_unknown_LP2_plaintext_recovered=0)
    emit("interpretation_limit",
         source_selected_English_cipher=False,
         unknown_Gp_key=False,
         null_scope="global circular rephase of full original glyph stream; 3 synthetic wrap-around 4-grams at last page and global moving of page-specific output histograms; does not constitute an arbitrary-key conditional cipher test.")

if __name__ == "__main__":
    main()
