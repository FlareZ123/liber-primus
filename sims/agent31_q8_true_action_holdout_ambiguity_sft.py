#!/usr/bin/env python3
"""Oracle ambiguity audit of exact #3046 q8 pooled plants. No unknown LP2 scoring.

Runs the committed Python generators with the same dictionary, donor records,
seeded keys, and word-start phases used in #3046, but deliberately does not
import or run the 1200s CP-SAT solver. Separates action-identification from
word ambiguities at the TRUE key. Read-only.
"""
import pathlib, sys, types, collections, json, random, re
ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'sims'))
# Import the existing generator's model-free functions by AST. This avoids
# requiring ortools just for an exact fixture/decoder audit.
import ast
import lp2_shared_gp29_q8_smt as s
src=ROOT/'sims/lp2_shared_gp29_q8_multichapter_pool_sft.py'
tree=ast.parse(src.read_text(encoding='utf-8'))
wanted={'primitive_q8','same_key_orbit','make_pi','effective_decrypt_map','is_full_cycle',
'same_cyclic_subgroup','load_inputs','random_primitive_key','make_plant'}
kept=[node for node in tree.body if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef)) and node.name in wanted]
code=compile(ast.Module(body=kept,type_ignores=[]),str(src),'exec')
g={'pathlib':pathlib,'ROOT':ROOT,'NATIVE':ROOT/'resources/external/relikd-solved-gp29-native-v1.json',
'LEX':ROOT/'resources/control/english_wordfreq_textblob.txt',
'FIXTURE':ROOT/'im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json',
'MOD':29,'CHAPTERS':('jpg229','p57_parable','p56_an_end'),'TRAIN_NUM':9,'TRAIN_DEN':10,
'random':random,'json':json,'re':re,'collections':collections,'s':s}
exec(code,g)
D, base = g['load_inputs']()
out={'method':'oracle_decoding_distinct_from_blind_action_recovery','dict':len(D),'cases':[]}
for plant in (0,1):
 for world in ('common','independent'):
  chapters=g['make_plant'](base,plant,world)
  rec={'seed':3301+plant,'world':world,'chapters':[]}
  for chap in chapters:
   p=chap['pi'];k=chap['key']; items=[]
   for idx,(truth,ct,phase) in enumerate(zip(
       chap['all_truth'],chap['train_cipher']+chap['holdout_cipher'],chap['starts'])):
    decoded=s.decode(ct,p,k,D)
    assert truth in decoded,('oracle excludes truth',plant,world,chap['name'],idx)
    if idx>=len(chap['train_truth']):
     items.append({'index':idx,'length':len(truth),'truth':''.join(s.SYM[t] for t in truth),
                   'cipher':''.join(s.SYM[t] for t in ct),
                   'compatible_words':len(decoded),'compatible_with_true_start':sum(
                     s.encode(w,p,k,phase)==ct for w in decoded),'true_start':phase, 'phase_witnesses':[
                     {'plaintext_gp':''.join(s.SYM[t] for t in w),
                      'plaintext_tokens':' '.join(s.ALPHA[t] for t in w),
                      'starts':[j for j in range(8) if s.encode(w,p,k,j)==ct]}
                     for w in sorted(decoded)
                   ]})
   rec['chapters'].append({'name':chap['name'],'held':items,
       'unique_with_known_action':sum(t['compatible_words']==1 for t in items),
       'held_count':len(items)})
  out['cases'].append(rec)
print(json.dumps(out,separators=(',',':')))
