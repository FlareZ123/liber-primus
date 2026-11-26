// Agent29 incremental exact search for #2722.
// Baseline remains unchanged. Inherited domain lists are safe supersets;
// each graph extension only adds equations and all-different restrictions.
#define main original_graph_main
#include "lp2_shared_gp29_q8_symbolic_graph_sft.cpp"
#undef main

using DomainPointers=array<const vector<int>*,48>;

struct FastSearch : GSearch {
 using GSearch::GSearch;
 vector<uint8_t> completed;
 mutex checkpointMutex;
 uint64_t inheritedQueries=0,earlyPacks=0;
 atomic<uint64_t> inheritedCount{0},earlyPackCount{0};

 // Produce a full necessary shortlist from the three most selective postings.
 // This differs from the old capped query: the untested suffix is retained
 // for descendant states, not accidentally interpreted as a rejected option.
 vector<int> shortlist(int g,GFilter&f,GStats&c){
  const auto&d=ds[g];
  struct Choice{size_t count=0;vector<const GPosting*>lists;};
  vector<Choice> choices;choices.reserve(d.post.size());
  for(size_t pos=0;pos<d.post.size();pos++){
   Choice q;int x=fixed::val(d.cipher[pos]);
   for(const auto&p:d.post[pos]){
    c.features++;int j=p.feat/N,a=p.feat%N;
    if(a&&!f.allowed(x,a,j))continue;
    q.count+=p.ids.size();q.lists.push_back(&p);
   }
   if(!q.count)return {};
   choices.push_back(move(q));
  }
  sort(choices.begin(),choices.end(),[](const auto&a,const auto&b){return a.count<b.count;});
  vector<int> out;
  if(choices[0].count<=128||choices.size()==1){
   out.reserve(choices[0].count);
   for(auto*p:choices[0].lists)out.insert(out.end(),p->ids.begin(),p->ids.end());
   return out;
  }
  const size_t n=(d.opts.size()+63)/64;vector<uint64_t>bits(n),scratch(n);
  auto addBits=[&](vector<uint64_t>&v,const Choice&q){
   for(auto*p:q.lists){
    if(p->bits.empty()){for(int id:p->ids)v[id/64]|=uint64_t(1)<<(id%64);}
    else for(size_t i=0;i<n;i++)v[i]|=p->bits[i];
   }
  };
  addBits(bits,choices[0]);
  for(size_t pos=1;pos<min<size_t>(3,choices.size());pos++){
   if(choices[pos].count==d.opts.size())continue;
   fill(scratch.begin(),scratch.end(),0);addBits(scratch,choices[pos]);bool any=false;
   for(size_t i=0;i<n;i++){bits[i]&=scratch[i];any|=bits[i]!=0;}
   if(!any)return {};
  }
  for(size_t i=0;i<n;i++){uint64_t b=bits[i];while(b){int j=__builtin_ctzll(b);b&=b-1;out.push_back(int(i*64+j));}}
  return out;
 }

 vector<int> cachedDomain(int g,GFilter&f,size_t cap,GStats&c,const vector<int>*parent,vector<int>&store,const vector<int>*&next){
  vector<int> fresh;const vector<int>*input=parent;
  if(!input){fresh=shortlist(g,f,c);input=&fresh;}
  else inheritedCount.fetch_add(1,memory_order_relaxed);
  vector<int> out;out.reserve(min(cap,input->size()));
  size_t n=0;
  for(;n<input->size();n++){
   int id=(*input)[n];c.options++;
   if(f.allowed(ds[g].opts[id])){
    out.push_back(id);
    if(out.size()>=cap){n++;break;}
   }
  }
  if(n==input->size()){store=out;next=&store;}
  else if(!parent||n-out.size()>=max<size_t>(8,input->size()/16)){
   store=out;store.insert(store.end(),input->begin()+n,input->end());next=&store;
  }else next=parent;
  return out;
 }

 // For any fixed key, anchor the largest component at an arbitrary
 // translation. Global translation is then uniquely fixed by pi(F)=0.
 // Each remaining component's reference vertex must occupy a free cell.
 // The product of the remaining free counts bounds all packing choices.
 uint64_t packingBound(const Graph&g,uint64_t cap=8192)const{
  uint64_t b=1;
  auto mult=[&](uint64_t v){if(v&&b>cap/v)b=cap+1;else b*=v;};
  for(int i=0;i<g.k.d;i++)mult(N);
  vector<int>sz;for(int x=0;x<N;x++)if(g.size[x])sz.push_back(g.size[x]);
  sort(sz.begin(),sz.end(),greater<int>());
  int free=N-sz[0];
  for(size_t i=1;i<sz.size();i++){mult(free);free-=sz[i];}
  return b;
 }

 void fastPack(const Graph&g,const fixed::Key&k,GStats&c){
  c.keyTests++;bool primitive=false;for(int j=0;j<4;j++)primitive|=k[j]!=k[j+4];if(!primitive)return;
  array<int,N>val{},trans{};array<uint32_t,N>masks{};
  for(int x=0;x<N;x++){
   int v=0;for(int j=0;j<Q;j++)v+=g.off[x][j]*k[j];v%=N;val[x]=v;
   uint32_t bit=1u<<v;if(masks[g.r[x]]&bit)return;masks[g.r[x]]|=bit;
  }
  int anchor=0;for(int x=1;x<N;x++)if(g.size[x]>g.size[anchor])anchor=x;
  vector<int>rem;for(int x=0;x<N;x++)if(masks[x]&&x!=anchor)rem.push_back(x);
  auto dfsPack=[&](auto&&self,uint32_t used,vector<int>left)->void{
   if(stop())return;c.packNodes++;
   if(left.empty()){
    fixed::Perm pi{};int delta=(val[0]+trans[g.r[0]])%N;
    for(int x=0;x<N;x++)pi[x]=(val[x]+trans[g.r[x]]+N-delta)%N;
    check(pi,k,c);return;
   }
   int pick=-1;vector<int>options;
   for(int i=0;i<int(left.size());i++){
    int r=left[i];vector<int>v;for(int t=0;t<N;t++)if(!(used&fixed::rot(masks[r],t)))v.push_back(t);
    if(v.empty())return;if(pick<0||v.size()<options.size()){pick=i;options=move(v);if(options.size()==1)break;}
   }
   int r=left[pick];left.erase(left.begin()+pick);
   for(int t:options){trans[r]=t;self(self,used|fixed::rot(masks[r],t),left);if(stop())return;}
  };
  dfsPack(dfsPack,masks[anchor],rem);
 }

 void fastEnumerate(const Graph&g,GStats&c){
  Vec param{};
  auto visit=[&](auto&&self,int i)->void{
   if(stop())return;if(i==g.k.d){fastPack(g,g.k.evaluate(param),c);return;}
   for(int v=0;v<N;v++){param[i]=v;self(self,i+1);if(stop())return;}
  };visit(visit,0);
 }

 void fastDfs(const Graph&g,vector<int>rem,int budget,GStats&c,DomainPointers inherited){
  if(stop())return;c.nodes++;
  if(g.dimension()<=3||int(rem.size())<=budget){fastEnumerate(g,c);return;}
  if(packingBound(g)<=8192){earlyPackCount.fetch_add(1,memory_order_relaxed);fastEnumerate(g,c);return;}
  GFilter f(g);if(f.saturated)return;
  // All storage outlives every recursive descendant; raw pointers are
  // stack-local immutable candidate supersets, never shared between seeds.
  array<vector<int>,48>storage;
  int pick=-1;vector<int>best;size_t cap=SIZE_MAX;
  int ntry=min<int>(rem.size(),g.dimension()>20?5:g.dimension()>12?8:16);
  // Prefer inherited narrow domains before expensive unfiltered groups.
  stable_sort(rem.begin(),rem.end(),[&](int a,int b){
   size_t x=inherited[a]?inherited[a]->size():ds[a].opts.size();
   size_t y=inherited[b]?inherited[b]->size():ds[b].opts.size();
   return x<y;
  });
  for(int i=0;i<ntry;){
   int id=rem[i];const vector<int>*old=inherited[id];
   auto d=cachedDomain(id,f,cap,c,old,storage[id],inherited[id]);
   if(d.empty()){if(!budget)return;budget--;rem.erase(rem.begin()+i);ntry--;if(pick>i)pick--;continue;}
   if(pick<0||d.size()<cap){pick=i;best=move(d);cap=best.size();}
   i++;
  }
  if(pick<0){fastEnumerate(g,c);return;}
  int id=rem[pick];rem.erase(rem.begin()+pick);unordered_set<string>seen;
  for(int i:best){
   if(stop())return;c.joins++;Graph x;
   if(extend(g,ds[id].opts[i],x)&&seen.insert(x.sig()).second)fastDfs(x,rem,budget,c,inherited);
  }
  if(budget)fastDfs(g,rem,budget-1,c,inherited);
 }

 void run(int seconds,size_t seedStart=0,size_t seedEnd=SIZE_MAX){
  if(seedEnd==SIZE_MAX)seedEnd=seeds.size();
  if(seedStart>seedEnd||seedEnd>seeds.size())throw runtime_error("invalid seed range");
  next=seedStart;done=0;completed.assign(seeds.size(),0);deadline=Clock::now()+chrono::seconds(seconds);
  unsigned n=max(1u,min(4u,thread::hardware_concurrency()));vector<GStats>stats(n);vector<thread>pool;
  for(unsigned t=0;t<n;t++)pool.emplace_back([&,t]{
   auto&c=stats[t];while(!stop()){
    size_t i=next.fetch_add(1);if(i>=seedEnd)break;
    fastDfs(seeds[i],order,maxOov,c,DomainPointers{});
    if(!found&&!timed){
     completed[i]=1;done++;
     lock_guard<mutex>l(checkpointMutex);
     const char*p=getenv("SFT_CHECKPOINT");
     if(p&&*p){ofstream out(p,ios::app);out<<i<<endl;}
     cout<<"FAST COMPLETE seed="<<i<<" count="<<done.load()<<endl;
    }
   }
  });
  for(auto&t:pool)t.join();
  for(auto&c:stats){total.nodes+=c.nodes;total.joins+=c.joins;total.perms+=c.perms;total.keyTests+=c.keyTests;total.packNodes+=c.packNodes;total.features+=c.features;total.options+=c.options;}
  cout<<"FAST SEARCH found="<<found<<" timed="<<timed<<" seeds="<<done<<"/"<<(seedEnd-seedStart)<<" nodes="<<total.nodes<<" joins="<<total.joins<<" keys="<<total.keyTests<<" packing="<<total.packNodes<<" permutations="<<total.perms<<" features="<<total.features<<" options="<<total.options<<" inherited="<<inheritedCount<<" early_pack="<<earlyPackCount<<" OOV="<<answerOov<<endl;
 }
};

// The inherited-domain optimization is tested against the legacy exact
// necessary filter before any original attack; cap truncation must never
// eliminate a legal descendant option.
void cacheRegression(FastSearch&s){
 GStats stats;int tests=0;
 for(size_t z=0;z<min<size_t>(12,s.seeds.size());z++){
  const Graph&g=s.seeds[z];GFilter f(g);if(f.saturated)continue;
  for(int a=0;a<min<int>(5,s.order.size());a++){
   int id=s.order[a];auto full=s.GSearch::domain(id,f,SIZE_MAX,stats);
   vector<int>store;const vector<int>*ptr=nullptr;
   auto got=s.cachedDomain(id,f,1,stats,nullptr,store,ptr);
   fixed::require(got.size()==min<size_t>(1,full.size()),"capped domain count");
   vector<int>all=full;sort(all.begin(),all.end());
   vector<int>more;const vector<int>*newPtr=nullptr;
   auto restored=s.cachedDomain(id,f,SIZE_MAX,stats,ptr,more,newPtr);sort(restored.begin(),restored.end());
   fixed::require(all==restored,"cached domain lost parent option");tests++;
   for(int q=0;q<min<int>(3,full.size());q++){
    Graph child;if(!extend(g,s.ds[id].opts[full[q]],child))continue;
    GFilter cf(child);if(cf.saturated)continue;
    vector<int>nextStore;const vector<int>*next=nullptr;
    auto want=s.GSearch::domain(id,cf,SIZE_MAX,stats);
    auto have=s.cachedDomain(id,cf,SIZE_MAX,stats,ptr,nextStore,next);
    sort(want.begin(),want.end());sort(have.begin(),have.end());
    fixed::require(want==have,"cached domain lost child option");tests++;
   }
  }
 }
 cout<<"FAST CACHE regression comparisons="<<tests<<endl;
}
bool fastControl(const vector<string>&train,const vector<string>&held,unsigned seed){
 mt19937 rng(seed+123);fixed::Key k{};k[0]=1;for(int j=1;j<Q;j++)k[j]=rng()%N;k[4]=2;if(seed==3301)k[3]=0;
 vector<string> t(train.begin(),train.end()-1),h(held.begin()+1,held.end());auto p=fixed::plant(t,h,k,seed);auto g=p.train;g.push_back(p.prefix);FastSearch s(g,0);cacheRegression(s);s.run(420);if(!s.found){cout<<"FAST CONTROL "<<seed<<" no key"<<endl;return false;}
 auto m=fixed::maps(s.answer,s.answerKey);int tr=0,hit=0,unique=0;for(int i=0;i<47;i++)tr+=fixed::decode(p.train[i],m,fixed::dict).count(p.truthTrain[i]);vector<string>c{p.carry},w{p.truthCarry};c.insert(c.end(),p.hold.begin(),p.hold.end());w.insert(w.end(),p.truthHold.begin(),p.truthHold.end());
 for(int i=0;i<int(c.size());i++){auto v=fixed::decode(c[i],m,fixed::dict);hit+=v.count(w[i]);unique+=v.size()==1&&v.count(w[i]);}
 bool exact=equalAction(s.answer,s.answerKey,p.pi,k),pass=exact&&s.answerOov==0&&tr==47&&hit==17&&unique>=8;
 cout<<"FAST CONTROL "<<seed<<" exact="<<exact<<" train="<<tr<<"/47 hold="<<hit<<"/17 unique="<<unique<<" pass="<<pass<<endl;return pass;
}
int main(int argc,char**argv){try{
 bool skipControls=false,controlsOnly=false;size_t seedStart=0,seedEnd=SIZE_MAX;int seconds=1500;
 for(int i=1;i<argc;i++){
  string arg=argv[i];
  auto value=[&]()->string{if(i+1>=argc)throw runtime_error("missing value for "+arg);return string(argv[++i]);};
  if(arg=="--seed-start")seedStart=stoull(value());
  else if(arg=="--seed-end")seedEnd=stoull(value());
  else if(arg=="--seconds")seconds=stoi(value());
  else if(arg=="--skip-controls")skipControls=true;
  else if(arg=="--controls-only")controlsOnly=true;
  else throw runtime_error("unknown argument: "+arg);
 }
 if(skipControls&&controlsOnly)throw runtime_error("--skip-controls conflicts with --controls-only");
 if(seconds<=0)throw runtime_error("--seconds must be positive");
 aff::init();fixed::dictionary();regression();
 auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");
 auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": ["));
 auto held=fixed::strings(src,"groups",src.rfind("\"p55\""));
 fixed::require(train.size()==48&&join(train).size()==223&&held.size()==17&&join(held).size()==76,"profile");
 auto writeOutput=[&](const string&text){const char*p=getenv("SFT_OUTPUT");if(p&&*p){ofstream f(p);if(f)f<<text<<endl;}};
 if(!skipControls){
  bool a=fastControl(train,held,3301),b=fastControl(train,held,1033);
  if(controlsOnly){ostringstream o;o<<"{\"mode\":\"controls\",\"control_3301\":"<<(a?"true":"false")<<",\"control_1033\":"<<(b?"true":"false")<<",\"passed\":"<<((a&&b)?"true":"false")<<"}";writeOutput(o.str());return a&&b?0:2;}
  if(!a||!b){cout<<"FAST ORIGINAL GATED OFF"<<endl;ostringstream o;o<<"{\"mode\":\"original\",\"controls_passed\":false}";writeOutput(o.str());return 2;}
 }else if(controlsOnly)throw runtime_error("controls-only cannot skip controls");
 if(controlsOnly)return 0;
 FastSearch s(train);cacheRegression(s);fixed::require(s.seeds.size()==93,"seed count changed; update shard matrix");
 if(seedEnd==SIZE_MAX)seedEnd=s.seeds.size();
 fixed::require(seedStart<=seedEnd&&seedEnd<=s.seeds.size(),"seed range outside canonical seed set");
 s.run(seconds,seedStart,seedEnd);
 if(s.found){auto m=fixed::maps(s.answer,s.answerKey);cout<<"ORIGINAL candidate pi";for(int x:s.answer)cout<<" "<<x;cout<<" k";for(int x:s.answerKey)cout<<" "<<x;cout<<endl;auto h=held;h[0]=train.back()+h[0];for(int i=0;i<int(h.size());i++){auto v=fixed::decode(h[i],m,fixed::dict);cout<<"HOLD "<<i<<" candidates="<<v.size();for(auto&w:v)cout<<" "<<w;cout<<endl;}}
 bool shardExhausted=!s.found&&!s.timed&&s.done==seedEnd-seedStart;
 bool exhausted=shardExhausted&&seedStart==0&&seedEnd==s.seeds.size();
 cout<<"GRAPH ORIGINAL exhausted="<<exhausted<<" shard_exhausted="<<shardExhausted<<" found="<<s.found<<" timed="<<s.timed<<" seeds="<<s.done<<"/"<<(seedEnd-seedStart)<<" total="<<s.seeds.size()<<endl;
 ostringstream o;o<<"{\"mode\":\"original\",\"seed_start\":"<<seedStart<<",\"seed_end\":"<<seedEnd<<",\"seed_total\":"<<s.seeds.size()<<",\"done\":"<<s.done.load()<<",\"found\":"<<(s.found?"true":"false")<<",\"timed\":"<<(s.timed?"true":"false")<<",\"shard_exhausted\":"<<(shardExhausted?"true":"false")<<",\"full_exhausted\":"<<(exhausted?"true":"false")<<",\"oov\":"<<s.answerOov;
 if(s.found){o<<",\"pi\":[";for(int i=0;i<int(s.answer.size());i++){if(i)o<<",";o<<int(s.answer[i]);}o<<"],\"key\":[";for(int i=0;i<int(s.answerKey.size());i++){if(i)o<<",";o<<int(s.answerKey[i]);}o<<"]";}
 o<<",\"completed_ids\":[";bool first=true;for(size_t i=0;i<s.completed.size();i++)if(s.completed[i]){if(!first)o<<",";first=false;o<<i;}o<<"],\"nodes\":"<<s.total.nodes<<",\"features\":"<<s.total.features<<",\"options\":"<<s.total.options<<",\"inherited\":"<<s.inheritedCount<<",\"early_pack\":"<<s.earlyPackCount<<"}";writeOutput(o.str());
 return (s.found||shardExhausted)?0:1;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
