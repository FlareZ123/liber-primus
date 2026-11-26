// Agent12: persistent global edge->option domains, exact OOV-safe DFS.
// Reuses the prior graph, field arithmetic, register and numeric completion.
// No original scoring unless separately requested after blind control success.
#define main old_minunion_arc_main
#include "lp2_q8_oov_safe_minunion_budget_arc_sft.cpp"
#undef main

constexpr int E=N*N*Q;
int edgeId(const GEdge&e){return (e.c*N+e.p)*Q+e.j;}
struct EdgeStats{
 uint64_t visits=0,checks=0,eliminations=0,postingVisits=0,pruned=0,verified=0,redundant=0;
 EdgeStats&operator+=(const EdgeStats&b){visits+=b.visits;checks+=b.checks;eliminations+=b.eliminations;postingVisits+=b.postingVisits;pruned+=b.pruned;verified+=b.verified;redundant+=b.redundant;return *this;}
};
struct EdgeSearch:FastSearch{
 array<vector<int>,E> posting;
 vector<int> group,local,allEdges,seedAnchor;
 struct Live{
  const EdgeSearch&s;
  array<vector<int>,47> ids;
  vector<int>pos,trail;
  Live(const EdgeSearch&ss):s(ss),pos(ss.group.size(),-1){
   for(int i=0;i<int(pos.size());i++){int g=s.group[i];pos[i]=ids[g].size();ids[g].push_back(i);}
  }
  void erase(int id){
   int p=pos[id],g=s.group[id];if(p<0)return;
   int b=ids[g].back();ids[g][p]=b;pos[b]=p;ids[g].pop_back();pos[id]=-1;trail.push_back(id);
  }
  void restore(size_t mark){while(trail.size()>mark){int id=trail.back(),g=s.group[id];trail.pop_back();pos[id]=ids[g].size();ids[g].push_back(id);}}
 };
 struct Restore{Live&l;size_t m;~Restore(){l.restore(m);}};
 void initPosting(){
  group.clear();local.clear();allEdges.clear();
  for(auto&v:posting)v.clear();
  for(int g=0;g<47;g++)for(int i=0;i<int(ds[g].opts.size());i++){
   int id=group.size();group.push_back(g);local.push_back(i);auto&o=ds[g].opts[i];
   array<int,16> e{};for(int t=0;t<o.n;t++)e[t]=edgeId(o.e[t]);
   sort(e.begin(),e.begin()+o.n);auto end=unique(e.begin(),e.begin()+o.n);
   for(auto t=e.begin();t!=end;t++)posting[*t].push_back(id);
  }
  for(int e=0;e<E;e++)if(!posting[e].empty())allEdges.push_back(e);
  cout<<"GLOBAL POSTING options="<<group.size()<<" edges="<<allEdges.size()<<endl;
 }
 // Exact monotone necessary edge filter. A removed edge contradicts the
 // parent graph, so no descendant can restore feasibility. Keep a trail
 // of removed options, not full copied domains, and restore on return.
 bool restrict(const Graph&g,Live&l,const vector<int>&parent,vector<int>&child,
               uint64_t mask,EdgeStats&st){
  GFilter f(g);if(f.saturated)return false;child.clear();child.reserve(parent.size());
  for(int e:parent){
   int j=e%Q,p=e/Q%N,c=e/Q/N;st.checks++;
   if(f.allowed(c,p,j)){child.push_back(e);continue;}
   st.eliminations++;
   for(int id:posting[e]){st.postingVisits++;if((mask>>group[id]&1)&&l.pos[id]>=0)l.erase(id);}
  }
  return true;
 }
 // Pure graph/domain search. At every node every surviving word option is
 // available, plus an explicit OOV branch. Leaves use exact existing solver.
 void searchEdge(const Graph&g,uint64_t mask,int budget,Live&l,
                 const vector<int>&edges,GStats&c,EdgeStats&st,bool doFilter=true){
  if(stop())return;c.nodes++;st.visits++;
  if(momentDirect(g,c))return;
  vector<int>rem;
  for(int i:order)if(mask>>i&1)rem.push_back(i);
  if(g.dimension()<=3||int(rem.size())<=budget||packingBound(g)<=8192){fastEnumerate(g,c);return;}
  if(numericSubtree(g,rem,budget,c))return;
  size_t mark=l.trail.size();Restore undo{l,mark};
  vector<int>nextEdges;const vector<int>*current=&edges;
  if(doFilter){if(!restrict(g,l,edges,nextEdges,mask,st)){st.pruned++;return;}current=&nextEdges;}
  // Empty domains are mandatory omissions. Detect them across all 47 groups,
  // before spending time on any further symbolic joins.
  for(int i:rem)if(l.ids[i].empty()){mask&=~(uint64_t(1)<<i);if(--budget<0){st.pruned++;return;}}
  rem.clear();for(int i:order)if(mask>>i&1)rem.push_back(i);
  if(int(rem.size())<=budget){fastEnumerate(g,c);return;}
  int pick=-1;double best=1e100;
  for(int i:rem){
   double score=log2(double(max<size_t>(1,l.ids[i].size())))/train[i].size();
   if(score<best){best=score;pick=i;}
  }
  // Complete whole-word constraints; equivalent extensions are deduplicated.
  // A dimension-preserving compatible extension is implied by the parent.
  vector<int>ids=l.ids[pick];vector<Graph>children;unordered_set<string>seen;
  for(int id:ids){
   if(stop())return;c.joins++;
   Graph x;if(!extend(g,ds[pick].opts[local[id]],x))continue;
   if(x.dimension()==g.dimension()){
    st.redundant++;
    searchEdge(g,mask&~(uint64_t(1)<<pick),budget,l,*current,c,st,false);
    return;
   }
   if(seen.insert(x.sig()).second)children.push_back(move(x));
  }
  // Dimension reduction is a search order only, not an option cutoff.
  stable_sort(children.begin(),children.end(),[](const Graph&a,const Graph&b){return a.dimension()<b.dimension();});
  uint64_t remaining=mask&~(uint64_t(1)<<pick);
  for(const Graph&x:children){searchEdge(x,remaining,budget,l,*current,c,st);if(stop())return;}
  if(budget)searchEdge(g,remaining,budget-1,l,*current,c,st,false);
 }
 // Regression checks every direct single-edge filter survivor at the root,
 // then follows planted word edges. The truth must remain in the live domain.
 void compare(const Graph&g,Live&l,uint64_t mask,EdgeStats&st){
  GFilter f(g);fixed::require(!f.saturated,"unexpected saturated plant");
  for(int g0=0;g0<47;g0++)if(mask>>g0&1){
   size_t n=0;
   for(int i:l.ids[g0]){
    fixed::require(f.allowed(ds[g0].opts[local[i]]),"live posting failed direct edge gate");n++;
   }
   st.verified+=n;
  }
 }
 EdgeStats runEdge(int seconds){
  completed.assign(seeds.size(),0);next=0;done=0;deadline=Clock::now()+chrono::seconds(seconds);
  unsigned n=max(1u,min(4u,thread::hardware_concurrency()));vector<GStats>stats(n);vector<EdgeStats>es(n);vector<thread>pool;
  for(unsigned t=0;t<n;t++)pool.emplace_back([&,t]{
   auto&c=stats[t];auto&st=es[t];Live l(*this);
   while(!stop()){
    size_t i=next.fetch_add(1);if(i>=seeds.size())break;
    uint64_t mask=(uint64_t(1)<<47)-1;
    mask&=~(uint64_t(1)<<seedAnchor[i]);
    searchEdge(seeds[i],mask,maxOov,l,allEdges,c,st);
    fixed::require(l.trail.empty(),"unbalanced posting rollback");
    if(!found&&!timed){
     completed[i]=1;done++;
     lock_guard<mutex>lock(checkpointMutex);cout<<"EDGE COMPLETE seed="<<i<<" count="<<done.load()<<endl;
    }
   }
  });
  for(auto&t:pool)t.join();EdgeStats result;
  for(auto&c:stats){total.nodes+=c.nodes;total.joins+=c.joins;total.perms+=c.perms;total.keyTests+=c.keyTests;total.packNodes+=c.packNodes;}
  for(auto&s:es)result+=s;
  return result;
 }
 void build(const vector<string>&cipher){
  train=cipher;
  for(int i=0;i<47;i++){ds.push_back(makeGDomain(train[i],fixed::by[train[i].size()],base,false));order.push_back(i);}
  sort(order.begin(),order.end(),[&](int a,int b){double x=log2(double(max<size_t>(1,ds[a].opts.size())))/train[a].size(),y=log2(double(max<size_t>(1,ds[b].opts.size())))/train[b].size();return x==y?a<b:x<y;});
  vector<unordered_map<string,Graph>> roots(47);
  for(int i=0;i<47;i++){
   auto d=makeGDomain(train[i],fixed::by[train[i].size()],base,true);
   for(const auto&o:d.opts){Graph x;if(extend(base,o,x))roots[i].emplace(x.sig(),x);}
  }
  // Four source-visible domains guarantee at least one covered anchor even
  // with any three omissions; choose by actual union size, not plant truth.
  struct Seed{Graph g;int anchor;string sig;};vector<Seed>v;unordered_set<string>seen;vector<int>selected;
  for(int t=0;t<4;t++){
   int pick=-1;size_t least=SIZE_MAX;
   for(int i=0;i<47;i++){
    if(find(selected.begin(),selected.end(),i)!=selected.end())continue;
    size_t m=0;for(const auto&kv:roots[i])if(!seen.count(kv.first))m++;
    if(pick<0||m<least||(m==least&&train[i].size()>train[pick].size())){pick=i;least=m;}
   }
   fixed::require(pick>=0,"anchor selection");selected.push_back(pick);
   for(const auto&kv:roots[pick])if(seen.insert(kv.first).second)v.push_back({kv.second,pick,kv.first});
   cout<<"ANCHOR "<<pick<<" marginal="<<least<<endl;
  }
  sort(v.begin(),v.end(),[](const Seed&a,const Seed&b){return a.g.dimension()!=b.g.dimension()?a.g.dimension()<b.g.dimension():a.sig<b.sig;});
  for(auto&x:v){seeds.push_back(move(x.g));seedAnchor.push_back(x.anchor);}
  cout<<"SEEDS "<<seeds.size()<<endl;initPosting();
 }
 // Freeze a hidden key generated without imposing a zero shift or second
 // fixed nonzero phase; any rotation/scale is an equivalent effective action.
 void validateTruth(const OovPlant&p){
  // Use canonical actual word edges from the independently generated plant
  // to create test graph states; this is not used for seed ordering or search.
  for(int rotation=0;rotation<Q;rotation++)if(p.key[rotation]){
   fixed::Perm pi{};fixed::Key k{};
   for(int i=0;i<N;i++)pi[i]=aff::mul[p.pi[i]][aff::inv[p.key[rotation]]];
   for(int j=0;j<Q;j++)k[j]=aff::mul[p.key[(j+rotation)%Q]][aff::inv[p.key[rotation]]];
   Graph g;Live l(*this);vector<int>edges=allEdges;uint64_t mask=(uint64_t(1)<<47)-1;EdgeStats st;
   size_t mark0=l.trail.size();int validated=0;
   for(int id:order){
    auto d=makeGDomain(train[id],vector<string>{p.truthTrain[id]},base,false);
    const GOption*trueOpt=nullptr;
    for(const auto&o:d.opts){bool ok=true;for(int i=0;i<o.n;i++){auto e=o.e[i];ok&=aff::mod(pi[e.c]-pi[e.p])==k[e.j];}if(ok){trueOpt=&o;break;}}
    if(!trueOpt)continue; // possible all-F word or out-of-register control
    // Confirm at least one real in-register option remains active.
    if(fixed::dict.count(p.truthTrain[id])){
     bool ok=false;
     for(int gid:l.ids[id]){auto&o=ds[id].opts[local[gid]];bool a=true;for(int i=0;i<o.n;i++){auto e=o.e[i];a&=aff::mod(pi[e.c]-pi[e.p])==k[e.j];}ok|=a;}
     fixed::require(ok,"truth option removed by rollback gate");
    }
    Graph nextGraph;fixed::require(extend(g,*trueOpt,nextGraph),"truth graph lost");g=move(nextGraph);
    vector<int>nextEdges;fixed::require(restrict(g,l,edges,nextEdges,mask,st),"truth restrict lost");edges=move(nextEdges);
    compare(g,l,mask,st);validated++;
   }
   l.restore(mark0);for(int i=0;i<47;i++)fixed::require(l.ids[i].size()==ds[i].opts.size(),"rollback group size");
   fixed::require(validated>=45,"truth regression coverage");cout<<"ROLLBACK REGRESSION groups="<<validated<<" edge_checks="<<st.checks<<" direct_live_checks="<<st.verified<<endl;return;
  }
  throw runtime_error("all-zero key");
 }
};
OovPlant unrestricted(const vector<string>&shape,const vector<string>&held,uint32_t seed){
 // Match old profile; choose fresh independent uniform primitive keys.
 OovPlant p=makeOovPlant(shape,held,seed);mt19937 rng(seed^0x7bcd4132u);
 do{for(int j=0;j<Q;j++)p.key[j]=rng()%N;}while(equal(p.key.begin(),p.key.begin()+4,p.key.begin()+4));
 auto m=fixed::maps(p.pi,p.key);
 for(int i=0;i<47;i++){
  if(i==12||i==43){do{p.truthTrain[i]=randomGpWord(rng,shape[i].size());p.train[i]=fixed::encode(p.truthTrain[i],p.pi,p.key,rng()%Q);}while(fixed::dict.count(p.truthTrain[i])||fixed::support(p.train[i],m,fixed::dict));}
  else p.train[i]=fixed::encode(p.truthTrain[i],p.pi,p.key,rng()%Q);
 }
 for(int i=0;i<16;i++)p.held[i]=fixed::encode(p.truthHeld[i],p.pi,p.key,rng()%Q);
 p.carryCipher=fixed::encode(p.truthCarry,p.pi,p.key,rng()%Q);
 return p;
}
int main(int argc,char**argv){try{
 int seconds=240;uint32_t seed=0x59d2a638u;bool restricted=false,original=false;
 for(int i=1;i<argc;i++){
  string a=argv[i];if(a=="--restricted"){restricted=true;continue;}if(a=="--original"){original=true;continue;}
  if(i+1>=argc)throw runtime_error("missing argument");string v=argv[++i];
  if(a=="--seconds")seconds=stoi(v);else if(a=="--seed")seed=uint32_t(stoul(v));else throw runtime_error("bad argument");
 }
 fixed::require(seconds>0,"positive seconds");aff::init();baseRegisterOnly();
 auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");
 auto body=fixed::strings(src,"body_groups",src.find("\"heading_groups\": ["));
 auto p55=fixed::strings(src,"groups",src.rfind("\"p55\""));
 fixed::require(body.size()==48&&p55.size()==17,"matched source profile");
 vector<string>shape(body.begin(),body.end()-1),held(p55.begin()+1,p55.end());
 OovPlant p;if(!original)p=restricted?makeOovPlant(shape,held,seed):unrestricted(shape,held,seed);
 EdgeSearch s;s.build(original?shape:p.train);
 if(!original)s.validateTruth(p);
 auto start=Clock::now();EdgeStats e=s.runEdge(seconds);double elapsed=chrono::duration<double>(Clock::now()-start).count();
 int h=0;bool action=false,carry=false;
 if(s.found){
  auto m=fixed::maps(s.answer,s.answerKey);
  if(!original){action=equalAction(s.answer,s.answerKey,p.pi,p.key);
   for(int i=0;i<16;i++){auto v=fixed::decode(p.held[i],m,fixed::dict);h+=find(v.begin(),v.end(),p.truthHeld[i])!=v.end();}
   auto v=fixed::decode(p.carryCipher,m,unordered_set<string>{p.truthCarry});carry=find(v.begin(),v.end(),p.truthCarry)!=v.end();
  }
  cout<<"ANSWER pi";for(int v:s.answer)cout<<" "<<v;cout<<" key";for(int v:s.answerKey)cout<<" "<<v;cout<<endl;
  if(original){for(int i=0;i<47;i++){cout<<"TRAIN "<<i;for(auto&w:fixed::decode(shape[i],m,fixed::dict))cout<<" "<<w;cout<<endl;}for(int i=0;i<16;i++){cout<<"HELD "<<i;for(auto&w:fixed::decode(held[i],m,fixed::dict))cout<<" "<<w;cout<<endl;}}
 }
 ostringstream out;out<<"{\"mode\":\""<<(original?"original":restricted?"restricted":"unrestricted")<<"\",\"seed\":"<<seed<<",\"seconds\":"<<elapsed<<",\"found\":"<<(s.found?"true":"false")<<",\"timed\":"<<(s.timed?"true":"false")<<",\"seeds\":"<<s.seeds.size()<<",\"completed\":"<<s.done<<",\"nodes\":"<<s.total.nodes<<",\"joins\":"<<s.total.joins<<",\"edge_checks\":"<<e.checks<<",\"edge_eliminations\":"<<e.eliminations<<",\"posting_visits\":"<<e.postingVisits<<",\"empty_domain_prunes\":"<<e.pruned<<",\"redundant\":"<<e.redundant<<",\"perms\":"<<s.total.perms<<",\"action_exact\":"<<(action?"true":"false")<<",\"held_correct\":"<<h<<",\"carry\":"<<(carry?"true":"false")<<",\"completed_ids\":[";
 bool comma=false;for(int i=0;i<int(s.completed.size());i++)if(s.completed[i]){if(comma)out<<",";out<<i;comma=true;}out<<"]}\n";
 cout<<out.str();if(const char*q=getenv("SFT_OUTPUT"))ofstream(q)<<out.str();
 return 0;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
