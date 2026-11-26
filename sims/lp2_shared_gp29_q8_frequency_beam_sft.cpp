// Nonexhaustive high-dimensional lexical beam followed by the exact receiver.
// No canonical seed is ever reported exhausted by this program.
#define LP2_MOMENT_COMPLETION_NO_MAIN
#include "lp2_shared_gp29_q8_moment_completion_sft.cpp"

struct Beam7:FastSearch{
 using FastSearch::FastSearch;
 size_t width=4;
 atomic<uint64_t> prefixes{0},limited{0},finished{0};
 void beam(const Graph&g,vector<int>rem,int budget,GStats&c){
  if(stop())return;
  if(g.dimension()<=12||int(rem.size())<=budget){fastDfs(g,rem,budget,c,DomainPointers{});return;}
  prefixes++;
  GFilter f(g);if(f.saturated)return;
  int pick=-1;vector<int>best;
  int ntry=min<int>(rem.size(),g.dimension()>20?5:8);
  for(int i=0;i<ntry;){
   auto d=domain(rem[i],f,pick<0?SIZE_MAX:best.size(),c);
   if(stop())return;
   if(d.empty()){if(!budget)return;budget--;rem.erase(rem.begin()+i);ntry--;if(pick>i)pick--;continue;}
   if(pick<0||d.size()<best.size()){pick=i;best=move(d);}
   i++;
  }
  if(pick<0){fastDfs(g,rem,budget,c,DomainPointers{});return;}
  int id=rem[pick];rem.erase(rem.begin()+pick);
  prioritize(id,best);
  unordered_set<string>words,seen;
  for(int opt:best){
   if(stop())return;
   string w=optionWord7(ds[id],ds[id].opts[opt]);
   if(words.size()>=width&&!words.count(w)){limited++;continue;}
   Graph x;c.joins++;
   if(!extend(g,ds[id].opts[opt],x))continue;
   words.insert(w);
   if(seen.insert(x.sig()).second)beam(x,rem,budget,c);
  }
  if(budget)beam(g,rem,budget-1,c);
 }
 void runBeam(int seconds,size_t first,size_t last){
  vector<size_t>ids(last-first);iota(ids.begin(),ids.end(),first);
  stable_sort(ids.begin(),ids.end(),[&](size_t a,size_t b){return seedPrior[a]>seedPrior[b];});
  deadline=Clock::now()+chrono::seconds(seconds);next=0;
  unsigned n=max(1u,min(4u,thread::hardware_concurrency()));
  vector<GStats>stats(n);vector<thread>pool;
  for(unsigned t=0;t<n;t++)pool.emplace_back([&,t]{
   while(!stop()){
    size_t pos=next.fetch_add(1);if(pos>=ids.size())break;size_t id=ids[pos];
    beam(seeds[id],order,maxOov,stats[t]);
    if(!found&&!timed){finished++;lock_guard<mutex>l(checkpointMutex);cout<<"HEURISTIC VISITED seed="<<id<<endl;}
   }
  });
  for(auto&t:pool)t.join();
  for(auto&c:stats){total.nodes+=c.nodes;total.joins+=c.joins;total.perms+=c.perms;}
  cout<<"HEURISTIC RESULT found="<<found<<" timed="<<timed<<" visited="<<finished<<"/"<<ids.size()<<" prefixes="<<prefixes<<" discarded_options="<<limited<<" exact_nodes="<<total.nodes<<" joins="<<total.joins<<" permutations="<<total.perms<<" OOV="<<answerOov<<endl;
 }
};
int main(int argc,char**argv){try{
 size_t first=27,last=82,width=4;int seconds=900;
 for(int i=1;i<argc;i++){string a=argv[i];if(i+1>=argc)throw runtime_error("missing value");string v=argv[++i];if(a=="--seed-start")first=stoull(v);else if(a=="--seed-end")last=stoull(v);else if(a=="--width")width=stoull(v);else if(a=="--seconds")seconds=stoi(v);else throw runtime_error("unknown argument "+a);}
 if(!width||seconds<=0||first>=last||last>93)throw runtime_error("bad arguments");
 aff::init();fixed::dictionary();frequencyOrderEnabled=true;exactMrvEnabled=true;buildPrior7();
 auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");
 auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": ["));
 auto held=fixed::strings(src,"groups",src.rfind("\"p55\""));
 fixed::require(train.size()==48&&held.size()==17,"profile");
 Beam7 s(train);s.width=width;fixed::require(s.seeds.size()==93,"canonical seed count");
 cout<<"HEURISTIC width="<<width<<" range="<<first<<":"<<last<<" high_dim_gt=12; no exhaustion claim"<<endl;
 s.runBeam(seconds,first,last);
 if(s.found){
  auto m=fixed::maps(s.answer,s.answerKey);cout<<"ORIGINAL candidate pi";for(int x:s.answer)cout<<" "<<x;cout<<" k";for(int x:s.answerKey)cout<<" "<<x;cout<<endl;
  for(int i=0;i<47;i++){auto v=fixed::decode(train[i],m,fixed::dict);cout<<"TRAIN "<<i;for(auto&w:v)cout<<" "<<w;cout<<endl;}
  held[0]=train.back()+held[0];for(int i=0;i<int(held.size());i++){auto v=fixed::decode(held[i],m,fixed::dict);cout<<"HOLD "<<i;for(auto&w:v)cout<<" "<<w;cout<<endl;}
 }
 if(const char*p=getenv("SFT_OUTPUT")){ofstream o(p);o<<"{\"mode\":\"heuristic\",\"width\":"<<width<<",\"found\":"<<(s.found?"true":"false")<<",\"timed\":"<<(s.timed?"true":"false")<<",\"heuristic_visited\":"<<s.finished<<",\"full_exhausted\":false,\"shard_exhausted\":false,\"completed_ids\":[]}\n";}
 return 0;
}catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
