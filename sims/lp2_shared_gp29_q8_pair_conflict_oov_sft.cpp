// Agent2: exact pair-incompatibility / OOV vertex-cover gate for q8 common-cycle.
// A necessary graph extension is not a full packing witness. Only fully
// exhausted option pairs can prove a conflict; capped domains never do.
#define LP2_MOMENT_COMPLETION_NO_MAIN
#include "lp2_shared_gp29_q8_moment_completion_sft.cpp"

using CE=pair<int,int>;
bool coverWithin(const vector<CE>&edges,int budget,uint64_t deleted=0){
 for(auto [a,b]:edges)if(!(deleted>>a&1)&&!(deleted>>b&1)){
  if(!budget)return false;
  return coverWithin(edges,budget-1,deleted|(uint64_t(1)<<a))||
         coverWithin(edges,budget-1,deleted|(uint64_t(1)<<b));
 }
 return true;
}
struct PairDomain {int id;vector<Graph> children;vector<int> options;bool complete=false,redundant=false;};
struct PairResult {
 vector<CE> edges;vector<int> empty;int examined=0,eligible=0,domainCount=0;
 uint64_t joins=0;double ms=0;int lower=0;bool dead=false;
};
PairDomain boundedExact(GSearch&s,const Graph&g,GFilter&f,int id,int cap){
 PairDomain d;d.id=id;GStats stats;
 // Cap is on relaxed options; if truncation is possible, do not assert a
 // complete exact domain even if every examined relaxed option fails.
 auto ids=s.domain(id,f,cap+1,stats);
 if(int(ids.size())>cap)return d;
 d.complete=true;unordered_set<string> seen;
 for(int opt:ids){
  Graph x;if(!extend(g,s.ds[id].opts[opt],x))continue;
  if(x.dimension()==g.dimension() && x.comps==g.comps){
   d.redundant=true;return d;
  }
  if(seen.insert(x.sig()).second){d.children.push_back(x);d.options.push_back(opt);}
 }
 return d;
}
bool pairConflict(GSearch&s,const PairDomain&a,const PairDomain&b,uint64_t&joins){
 // Every duplicate graph child has exactly the same linear solution set.
 // Extend all distinct a states with all distinct b option representatives.
 for(const auto&x:a.children)for(int id:b.options){
  Graph z;joins++;
  if(extend(x,s.ds[b.id].opts[id],z))return false;
 }
 return true;
}
PairResult probe(GSearch&s,const Graph&g,const vector<int>&rem,int budget,int cap=96,int maxGroups=24){
 auto start=Clock::now();PairResult r;GFilter f(g);if(f.saturated){r.dead=true;r.lower=budget+1;return r;}
 vector<PairDomain> ds;
 for(int id:rem){
  auto d=boundedExact(s,g,f,id,cap);r.examined++;
  if(!d.complete||d.redundant)continue;
  r.domainCount++;
  if(d.children.empty()){r.empty.push_back(id);continue;}
  ds.push_back(move(d));
 }
 sort(ds.begin(),ds.end(),[](const auto&a,const auto&b){return a.children.size()<b.children.size();});
 if(int(ds.size())>maxGroups)ds.resize(maxGroups);
 r.eligible=ds.size();
 for(int a=0;a<int(ds.size());a++)for(int b=a+1;b<int(ds.size());b++){
  if(pairConflict(s,ds[a],ds[b],r.joins))r.edges.emplace_back(ds[a].id,ds[b].id);
 }
 r.lower=r.empty.size();
 while(r.lower<=budget&&!coverWithin(r.edges,r.lower-int(r.empty.size())))r.lower++;
 r.dead=r.lower>budget;
 r.ms=chrono::duration<double,milli>(Clock::now()-start).count();
 return r;
}
// Check the bounded vertex-cover decision against exhaustive deletion
// subsets on random graphs with <=9 vertices; include odd-cycle case.
void coverRegression(){
 mt19937 rng(20261126);
 for(int z=0;z<500;z++){
  int n=2+rng()%8;vector<CE> edges;
  for(int i=0;i<n;i++)for(int j=i+1;j<n;j++)if(rng()%4==0)edges.emplace_back(i,j);
  int best=n;
  for(uint64_t d=0;d<(uint64_t(1)<<n);d++){
   bool ok=true;for(auto [a,b]:edges)if(!(d>>a&1)&&!(d>>b&1)){ok=false;break;}
   if(ok)best=min(best,__builtin_popcountll(d));
  }
  for(int b=0;b<=3;b++)fixed::require(coverWithin(edges,b)==(best<=b),"cover mismatch");
 }
 fixed::require(!coverWithin({{0,1},{1,2},{0,2}},1),"triangle budget");
 cout<<"PAIR cover regression 500 graphs PASS"<<endl;
}
bool hasTruth(const Graph&g,const fixed::Perm&pi,const fixed::Key&k){
 // Numeric key normalized to the graph's k0=1 gauge by caller.
 for(int j=0;j<Q;j++){int v=g.k.a[j][L];for(int i=0;i<g.k.d;i++)v+=g.k.a[j][i]*k[g.k.vars[i]];if(v%N!=k[j])return false;}
 for(int x=0;x<N;x++){
  int v=0;for(int j=0;j<Q;j++)v+=g.off[x][j]*k[j];
  if(v%N!=(pi[x]+N-pi[g.r[x]])%N)return false;
 }
 return true;
}
bool plantedProbe(const vector<string>&train,const vector<string>&held,unsigned seed){
 mt19937 rng(seed+821);fixed::Key k{};k[0]=1;for(int j=1;j<Q;j++)k[j]=rng()%N;k[4]=2;
 vector<string> t(train.begin(),train.end()-1),h(held.begin()+1,held.end());
 auto p=fixed::plant(t,h,k,seed);auto tr=p.train;tr.push_back(p.prefix);GSearch s(tr,0);
 // Find one true carry state under all phase and scale gauges, preserving
 // a real full action. Never supply the truth to probe(), only to controls.
 Graph g;fixed::Perm pi{};fixed::Key kk{};bool ok=false;
 for(int phase=0;phase<Q&&!ok;phase++)if(k[phase]){
  int m=aff::inv[k[phase]];
  for(int j=0;j<Q;j++)kk[j]=aff::mul[k[(j+phase)%Q]][m];
  for(int x=0;x<N;x++)pi[x]=aff::mul[p.pi[x]][m];
  for(const auto&candidate:s.seeds)if(hasTruth(candidate,pi,kk)){g=candidate;ok=true;break;}
 }
 fixed::require(ok,"planted carry not found");
 vector<int>rem=s.order;
 for(int depth=0;depth<7;depth++){
  auto r=probe(s,g,rem,0);
  fixed::require(!r.dead&&r.empty.empty()&&r.edges.empty(),"true action pruned");
  cout<<"PAIR CONTROL "<<seed<<" depth="<<depth<<" eligible="<<r.eligible<<" joins="<<r.joins<<" ms="<<r.ms<<endl;
  if(rem.empty())break;
  // Join a true full word, choosing the first valid graph option
  // under the fixed hidden effective action. All other words remain blind.
  int id=rem.front();bool next=false;
  for(auto&o:s.ds[id].opts){
   Graph child;if(extend(g,o,child)&&hasTruth(child,pi,kk)){g=child;next=true;break;}
  }
  fixed::require(next,"true word graph option lost");rem.erase(rem.begin());
 }
 return true;
}
int main(){try{
 aff::init();fixed::dictionary();coverRegression();
 auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");
 auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": ["));
 auto held=fixed::strings(src,"groups",src.rfind("\"p55\""));
 fixed::require(train.size()==48&&join(train).size()==223&&held.size()==17&&join(held).size()==76,"profile");
 plantedProbe(train,held,3301);plantedProbe(train,held,1033);
 GSearch s(train);fixed::require(s.seeds.size()==93,"carry seed count");
 mt19937 rng(24021);int states=0,nontrivial=0,pairPrune=0,zeroPrune=0;uint64_t joins=0;double ms=0;
 ostringstream json;json<<"{\"schema\":\"agent2-q8-pair-oov-probe-v1\",\"rows\":[";bool comma=false;
 // Deterministic diagnostic samples only; no seed exhaustion claim.
 for(int seed:{1,5,9,14,19,27,35,46,60,74,85,91}){
  Graph g=s.seeds[seed];vector<int>rem=s.order;int budget=3;
  for(int depth=0;depth<7;depth++){
   if(budget<0||rem.empty())break;
   auto r=probe(s,g,rem,budget);
   states++;joins+=r.joins;ms+=r.ms;if(!r.edges.empty())nontrivial++;
   bool zeroDead=int(r.empty.size())>budget;
   if(zeroDead)zeroPrune++;else if(r.dead)pairPrune++;
   cout<<"PAIR ORIGINAL seed="<<seed<<" depth="<<depth<<" dimension="<<g.dimension()<<" budget="<<budget<<" domains="<<r.domainCount<<" eligible="<<r.eligible<<" zeros="<<r.empty.size()<<" conflicts="<<r.edges.size()<<" lower="<<r.lower<<" joins="<<r.joins<<" ms="<<r.ms<<endl;
   if(comma)json<<",";comma=true;
   json<<"{\"seed\":"<<seed<<",\"depth\":"<<depth<<",\"dimension\":"<<g.dimension()<<",\"budget\":"<<budget<<",\"domains\":"<<r.domainCount<<",\"eligible\":"<<r.eligible<<",\"zero\":"<<r.empty.size()<<",\"lower\":"<<r.lower<<",\"joins\":"<<r.joins<<",\"ms\":"<<r.ms<<",\"edges\":[";
   for(size_t i=0;i<r.edges.size();i++){if(i)json<<",";json<<"["<<r.edges[i].first<<","<<r.edges[i].second<<"]";}json<<"]}";
   if(r.dead)break;
   for(int id:r.empty){rem.erase(find(rem.begin(),rem.end(),id));budget--;}
   if(rem.empty())break;
   // Sample an exact child of the first viable group; don't pretend a
   // single randomly selected branch exhausts the seed.
   GFilter f(g);bool advanced=false;
   for(size_t i=0;i<rem.size();i++){
    int id=rem[i];GStats stats;auto ids=s.domain(id,f,512,stats);
    shuffle(ids.begin(),ids.end(),rng);
    for(int opt:ids){Graph child;if(extend(g,s.ds[id].opts[opt],child)){g=child;rem.erase(rem.begin()+i);advanced=true;break;}}
    if(advanced)break;
   }
   if(!advanced)break;
  }
 }
 cout<<"PAIR SUMMARY states="<<states<<" conflict_states="<<nontrivial<<" incremental_prunes="<<pairPrune<<" zero_prunes="<<zeroPrune<<" joins="<<joins<<" ms="<<ms<<endl;
 json<<"],\"summary\":{\"states\":"<<states<<",\"conflict_states\":"<<nontrivial<<",\"incremental_prunes\":"<<pairPrune<<",\"zero_prunes\":"<<zeroPrune<<",\"joins\":"<<joins<<",\"ms\":"<<ms<<"}}";
 const char*p=getenv("SFT_OUTPUT");if(p&&*p){ofstream f(p);f<<json.str()<<endl;}
 return 0;
}catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
