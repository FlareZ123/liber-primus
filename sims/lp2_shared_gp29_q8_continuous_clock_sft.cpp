// Exact continuous-clock common-cycle receiver. Enumerates literal-F
// histories and carry-phase gauge separately. No independent word reset.
#define LP2_MOMENT_COMPLETION_NO_MAIN
#include "lp2_shared_gp29_q8_moment_completion_sft.cpp"
using ClockRows=vector<vector<int>>;
ClockRows makeClock(const vector<string>&g,unsigned mask,int carryPhase){
 int before=0,zeros=0;
 for(int i=0;i<47;i++)for(char x:g[i]){if(x=='0'){bool h=(mask>>zeros++)&1;if(h)continue;}before++;}
 int phase=(carryPhase+Q-before%Q)%Q;zeros=0;ClockRows out;
 for(const auto&w:g){vector<int>v;for(char x:w){if(x=='0'&&((mask>>zeros++)&1))v.push_back(-1);else{v.push_back(phase);phase=(phase+1)%Q;}}out.push_back(move(v));}
 return out;
}
int nextPhase(const ClockRows&c){for(int i=int(c.size())-1;i>=0;i--)for(int j=int(c[i].size())-1;j>=0;j--)if(c[i][j]>=0)return (c[i][j]+1)%Q;throw runtime_error("no consuming position");}
struct HoldPaths{vector<vector<string>> words;bool clipped=false;};
HoldPaths heldPaths(const vector<string>&held,const string&prefix,int phase,const fixed::Maps&m){
 HoldPaths out;vector<string>path;
 auto group=[&](auto&&self,int i,int j)->void{
  if(out.words.size()>=10000){out.clipped=true;return;}
  if(i==int(held.size())){out.words.push_back(path);return;}
  string w=i==0?prefix:"";
  auto walk=[&](auto&&rec,int z,int p)->void{
   if(out.clipped)return;
   if(z==int(held[i].size())){if(fixed::dict.count(w)){path.push_back(w);self(self,i+1,p);path.pop_back();}return;}
   int x=fixed::val(held[i][z]);if(!x){w+='0';rec(rec,z+1,p);w.pop_back();}
   int q=m[p][x];if(q){w+=fixed::SYM[q];rec(rec,z+1,(p+1)%Q);w.pop_back();}
  };walk(walk,0,j);
 };group(group,0,phase);return out;
}
// Necessary global consistency for fixed phase substitution tables.
// Each retained candidate must admit support in every other lexical group
// except for at most the global OOV budget. A group's single-token support
// is relaxed (does not require simultaneous support for all tokens), so
// removed words and forced omissions are exact, never heuristic.
struct ClockPropagation7{
 array<vector<int>,48>domains;
 int forced=0,rounds=0;uint64_t before=0,after=0;bool impossible=false;
};
ClockPropagation7 propagateClock(FastSearch&s,const Graph&g,int budget){
 ClockPropagation7 a;GFilter f(g);if(f.saturated){a.impossible=true;return a;}
 for(int i=0;i<48;i++){
  for(int j=0;j<int(s.ds[i].opts.size());j++){auto&o=s.ds[i].opts[j];if(f.allowed(o))a.domains[i].push_back(j);}
  a.before+=a.domains[i].size();
 }
 // Same phase => equal k, or different phases proven equal under g.k.
 // Same ciphertext with proven unequal shifts => different plaintext.
 array<array<bool,Q>,Q>eq{},neq{};
 for(int j=0;j<Q;j++)for(int l=0;l<Q;l++){
  auto z=g.k.normalized(minusv(g.k.a[j],g.k.a[l]));eq[j][l]=z==0;neq[j][l]=z==IMP||f.forbidden.count(z);
 }
 constexpr int T=N*Q;array<uint64_t,T*N>blocked{};
 for(;;){
  a.forced=0;for(int i=0;i<47;i++)a.forced+=a.domains[i].empty();
  if(a.domains[47].empty()||a.forced>budget){a.impossible=true;break;}
  a.rounds++;blocked.fill(0);
  for(int i=0;i<48;i++)if(!a.domains[i].empty()){
   array<uint32_t,T>support{};uint64_t bit=uint64_t(1)<<i;
   for(int id:a.domains[i]){auto&o=s.ds[i].opts[id];for(int e=0;e<o.n;e++){auto v=o.e[e];support[v.j*N+v.c]|=1u<<v.p;}}
   for(int j=0;j<Q;j++)for(int c=0;c<N;c++){
    uint32_t m=support[j*N+c];if(!m)continue;
    for(int l=0;l<Q;l++)if(eq[j][l])for(int p=1;p<N;p++)if(!(m&(1u<<p)))blocked[(l*N+c)*N+p]|=bit;
    if((m&(m-1))==0){
     int p=__builtin_ctz(m);
     for(int l=0;l<Q;l++){
      if(eq[j][l])for(int x=0;x<N;x++)if(x!=c)blocked[(l*N+x)*N+p]|=bit;
      if(neq[j][l])blocked[(l*N+c)*N+p]|=bit;
     }
    }
   }
  }
  uint64_t removed=0;
  for(int i=0;i<48;i++){
   auto&ids=a.domains[i];size_t old=ids.size();
   auto end=remove_if(ids.begin(),ids.end(),[&](int id){
    auto&o=s.ds[i].opts[id];uint64_t mask=0;for(int e=0;e<o.n;e++){auto v=o.e[e];mask|=blocked[(v.j*N+v.c)*N+v.p];}
    // Current candidate is required if this word is selected; any conflict
    // with its own union is necessarily impossible, not an OOV allowance.
    if(mask&(uint64_t(1)<<i))return true;
    return (mask&(uint64_t(1)<<47))||__builtin_popcountll(mask)>budget-a.forced;
   });ids.erase(end,ids.end());removed+=old-ids.size();
  }
  if(!removed)break;
 }
 for(auto&d:a.domains)a.after+=d.size();return a;
}
struct Continuous7:FastSearch{
 using FastSearch::FastSearch;
 vector<size_t> completedCanonical;
 bool usePropagation=false;atomic<uint64_t> propBefore{0},propAfter{0},propExcluded{0},propRounds{0};
 void runClock(int seconds,const unordered_map<string,size_t>&canonical,const set<size_t>&excluded,int scenario){
  vector<pair<size_t,size_t>> ids;
  for(size_t i=0;i<seeds.size();i++){auto it=canonical.find(seeds[i].sig());size_t id=it==canonical.end()?i:it->second;if(!excluded.count(id))ids.push_back({i,id});}
  stable_sort(ids.begin(),ids.end(),[&](auto&a,auto&b){return seedPrior[a.first]>seedPrior[b.first];});
  deadline=Clock::now()+chrono::seconds(seconds);next=0;done=0;
  unsigned n=max(1u,min(4u,thread::hardware_concurrency()));vector<GStats>stats(n);vector<thread>pool;
  for(unsigned t=0;t<n;t++)pool.emplace_back([&,t]{
   while(!stop()){size_t z=next.fetch_add(1);if(z>=ids.size())break;auto[i,id]=ids[z];if(usePropagation){auto a=propagateClock(*this,seeds[i],maxOov);propBefore+=a.before;propAfter+=a.after;propRounds+=a.rounds;if(a.impossible)propExcluded++;else{DomainPointers ptr{};auto rem=order;for(int k:order)ptr[k]=&a.domains[k];rem.erase(remove_if(rem.begin(),rem.end(),[&](int k){return a.domains[k].empty();}),rem.end());fastDfs(seeds[i],rem,maxOov-a.forced,stats[t],ptr);}}else fastDfs(seeds[i],order,maxOov,stats[t],DomainPointers{});if(!found&&!timed){done++;lock_guard<mutex>l(checkpointMutex);completedCanonical.push_back(id);}}
  });
  for(auto&t:pool)t.join();for(auto&c:stats){total.nodes+=c.nodes;total.joins+=c.joins;total.perms+=c.perms;}
  cout<<"CONTINUOUS RESULT scenario="<<scenario<<" found="<<found<<" timed="<<timed<<" completed="<<done<<"/"<<ids.size()<<" nodes="<<total.nodes<<" joins="<<total.joins<<" permutations="<<total.perms<<" OOV="<<answerOov<<" prop_before="<<propBefore<<" prop_after="<<propAfter<<" prop_excluded="<<propExcluded<<" prop_rounds="<<propRounds<<" ids";
  sort(completedCanonical.begin(),completedCanonical.end());for(size_t i:completedCanonical)cout<<" "<<i;cout<<endl;
 }
};
unordered_map<string,size_t> canonicalSeeds(const string&carry){
 Graph base;vector<string>pre(fixed::prefixDict.begin(),fixed::prefixDict.end());sort(pre.begin(),pre.end());
 auto d=makeGDomain(carry,pre,base,true);unordered_set<string>seen;vector<Graph>seeds;
 for(auto&o:d.opts){Graph g;if(extend(base,o,g)&&seen.insert(g.sig()).second)seeds.push_back(g);}
 sort(seeds.begin(),seeds.end(),[](auto&a,auto&b){return a.dimension()==b.dimension()?a.sig()<b.sig():a.dimension()<b.dimension();});
 unordered_map<string,size_t>out;for(size_t i=0;i<seeds.size();i++)out.emplace(seeds[i].sig(),i);return out;
}
bool controlClock(const vector<string>&train,const vector<string>&held,unsigned seed,bool propagate){
 mt19937 rng(seed+999);fixed::Key k{};k[0]=1;for(int j=1;j<Q;j++)k[j]=rng()%N;k[4]=2;if(seed==3301)k[3]=0;
 vector<string>t(train.begin(),train.end()-1),h(held.begin()+1,held.end());auto p=fixed::plant(t,h,k,seed);
 vector<string>plain=p.truthTrain;plain.push_back(p.truthCarry.substr(0,10));
 vector<string>cipher;ClockRows clock;int phase=rng()%Q;
 for(const auto&w:plain){cipher.push_back(fixed::encode(w,p.pi,k,phase));vector<int>v;for(char x:w){if(x=='0')v.push_back(-1);else{v.push_back(phase);phase=(phase+1)%Q;}}clock.push_back(move(v));}
 int gauge=-1;for(int j:clock.back())if(j>=0&&k[j]){gauge=j;break;}if(gauge<0)throw runtime_error("control carry gauge");
 vector<string>heldCipher;heldCipher.push_back(fixed::encode(p.truthCarry.substr(10),p.pi,k,phase));if(p.truthCarry[10]!='0')phase=(phase+1)%Q;
 for(const auto&w:p.truthHold){heldCipher.push_back(fixed::encode(w,p.pi,k,phase));phase=(phase+count_if(w.begin(),w.end(),[](char x){return x!='0';}))%Q;}
 for(auto&row:clock)for(int&j:row)if(j>=0)j=(j+Q-gauge)%Q;
 Continuous7 s(cipher,0,clock);s.usePropagation=propagate;s.runClock(420,{}, {},-int(seed));
 if(!s.found){cout<<"CONTINUOUS CONTROL "<<seed<<" no key"<<endl;return false;}
 auto m=fixed::maps(s.answer,s.answerKey);int tr=0;string prefix,w;for(int i=0;i<47;i++)tr+=s.scheduledWord(i,m,w)&&w==p.truthTrain[i];
 fixed::require(s.scheduledWord(47,m,prefix),"carry decode");
 auto paths=heldPaths(heldCipher,prefix,nextPhase(clock),m);vector<string>truth{p.truthCarry};truth.insert(truth.end(),p.truthHold.begin(),p.truthHold.end());bool hit=find(paths.words.begin(),paths.words.end(),truth)!=paths.words.end();
 bool exact=equalAction(s.answer,s.answerKey,p.pi,k),pass=exact&&tr==47&&hit&&!paths.clipped;
 cout<<"CONTINUOUS CONTROL "<<seed<<" exact="<<exact<<" train="<<tr<<"/47 hold_truth="<<hit<<" hold_paths="<<paths.words.size()<<" pass="<<pass<<endl;return pass;
}
int main(int argc,char**argv){try{
 bool controls=false,inventory=false,propagate=false;int first=0,last=64,seconds=120;set<size_t>excluded;
 for(int i=1;i<argc;i++){string a=argv[i];if(a=="--controls-only"){controls=true;continue;}if(a=="--inventory"){inventory=true;continue;}if(a=="--propagate"){propagate=true;continue;}if(i+1>=argc)throw runtime_error("missing argument");string v=argv[++i];if(a=="--scenario-start")first=stoi(v);else if(a=="--scenario-end")last=stoi(v);else if(a=="--seconds")seconds=stoi(v);else if(a=="--exclude")excluded.insert(stoull(v));else throw runtime_error("unknown argument "+a);}
 aff::init();fixed::dictionary();frequencyOrderEnabled=true;exactMrvEnabled=true;buildPrior7();
 auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": ["));auto held=fixed::strings(src,"groups",src.rfind("\"p55\""));fixed::require(train.size()==48&&held.size()==17,"profile");
 if(controls){bool a=controlClock(train,held,3301,propagate),b=controlClock(train,held,1033,propagate);return a&&b?0:2;}
 auto all=join(train);fixed::require(count(all.begin(),all.end(),'0')==3&&first>=0&&first<last&&last<=64&&seconds>0,"scenario range");
 auto canonical=canonicalSeeds(train.back());fixed::require(canonical.size()==93,"canonical seed count");
 int complete=0;bool found=false;
 for(int z=first;z<last;z++){
  auto clock=makeClock(train,z/8,z%8);Continuous7 s(train,3,clock);s.usePropagation=propagate;
  size_t count=0;for(auto&g:s.seeds){auto it=canonical.find(g.sig());fixed::require(it!=canonical.end(),"clock seed outside canonical gauge");count+=!excluded.count(it->second);}
  cout<<"CONTINUOUS INVENTORY scenario="<<z<<" holds="<<z/8<<" carry_phase="<<z%8<<" seeds="<<count<<endl;
  if(inventory)continue;
  s.runClock(seconds,canonical,excluded,z);
  if(s.found){found=true;auto m=fixed::maps(s.answer,s.answerKey);string w,prefix;cout<<"ORIGINAL CONTINUOUS candidate scenario="<<z<<" pi";for(int x:s.answer)cout<<" "<<x;cout<<" k";for(int x:s.answerKey)cout<<" "<<x;cout<<endl;for(int i=0;i<47;i++){fixed::require(s.scheduledWord(i,m,w),"training decode");cout<<"TRAIN "<<i<<" "<<w<<endl;}fixed::require(s.scheduledWord(47,m,prefix),"prefix");auto paths=heldPaths(held,prefix,nextPhase(clock),m);cout<<"HOLD PATHS "<<paths.words.size()<<" clipped="<<paths.clipped<<endl;for(auto&path:paths.words){cout<<"HOLD";for(auto&w:path)cout<<" "<<w;cout<<endl;}break;}
  if(!s.timed&&s.done==count)complete++;
 }
 cout<<"CONTINUOUS SUMMARY found="<<found<<" complete_scenarios="<<complete<<"/"<<last-first<<" excluded_general_seeds="<<excluded.size()<<endl;
 if(const char*p=getenv("SFT_OUTPUT")){ofstream o(p);o<<"{\"mode\":\"continuous-clock\",\"found\":"<<(found?"true":"false")<<",\"complete_scenarios\":"<<complete<<",\"scenario_start\":"<<first<<",\"scenario_end\":"<<last<<",\"full_exhausted\":false,\"completed_ids\":[]}\n";}
 return 0;
}catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
