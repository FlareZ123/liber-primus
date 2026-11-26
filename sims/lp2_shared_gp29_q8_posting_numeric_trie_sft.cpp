// Agent18 separate experimental derivative of 3106af2e01fe060b9277525648d9934c3a62520d
// Exact full posting masks and fixed-key lexical trie support; original Agent29 code preserved below.
// Agent29 incremental exact receiver, base implementation frozen from blob 01a11ad52a11b734712710527c14ac51a07854df.
// General unknown primitive q8, arbitrary word starts and literal F hold.
// Difference graph over original eight key coordinates, exact GF29 key-space
// elimination only when graph cycles close. Carry-anchor phase gauge and exact
// posting intersections reduce redundant rotational and lexical search.
// Component translations are packed
// at residual leaves. Mandatory carry prefix, <=3 of 47 complete words OOV.
#include <cstdlib>
#include <fstream>
#include <sstream>
#define main previous_line_sft_main
#include "lp2_red8_minimum_line_reset_sft.cpp"
#undef main
using Vec=array<uint8_t,8>;using Code=uint64_t;constexpr int N=29,Q=8,L=7;
constexpr Code IMP=~Code(0);
Vec add(const Vec&a,const Vec&b){Vec c{};for(int i=0;i<Q;i++)c[i]=(a[i]+b[i])%N;return c;}
Vec minusv(const Vec&a,const Vec&b){Vec c{};for(int i=0;i<Q;i++)c[i]=aff::sub[a[i]][b[i]];return c;}
Vec unit(int j){Vec x{};x[j]=1;return x;}
struct KeySpace{
 int d=7;array<Vec,Q>a{};array<uint8_t,Q>vars{};
 KeySpace(){a[0][L]=1;for(int i=1;i<Q;i++){a[i][i-1]=1;vars[i-1]=i;}}
 Vec project(const Vec&v)const{Vec x{};for(int j=0;j<Q;j++)if(v[j]){for(int k=0;k<d;k++)x[k]=(x[k]+aff::mul[v[j]][a[j][k]])%N;x[L]=(x[L]+aff::mul[v[j]][a[j][L]])%N;}return x;}
 bool impose(const Vec&v){Vec eq=project(v);int pivot=d-1;while(pivot>=0&&!eq[pivot])pivot--;if(pivot<0)return !eq[L];int last=d-1,rec=aff::inv[eq[pivot]];
  for(auto&r:a){int f=aff::mul[r[pivot]][rec];if(f){for(int j=0;j<d;j++)if(j!=pivot)r[j]=aff::sub[r[j]][aff::mul[f][eq[j]]];r[L]=aff::sub[r[L]][aff::mul[f][eq[L]]];}if(pivot!=last)r[pivot]=r[last];r[last]=0;}
  vars[pivot]=vars[last];vars[last]=0;d--;return true;}
 bool primitive()const{for(int i=0;i<4;i++)if(a[i]!=a[i+4])return true;return false;}
 Code code(const Vec&v)const{Code x=0;for(int i=0;i<d;i++)x=x*N+v[i];return x*N+v[L];}
 Code normalized(const Vec&v)const{int j=0;while(j<d&&!v[j])j++;if(j==d)return v[L]?IMP:0;Code x=1;int m=aff::inv[v[j]];for(int i=0;i<d;i++)x=x*N+aff::mul[v[i]][m];return x*N+aff::mul[v[L]][m];}
 fixed::Key evaluate(const Vec&params)const{fixed::Key k{};for(int j=0;j<Q;j++){int x=a[j][L];for(int i=0;i<d;i++)x+=params[i]*a[j][i];k[j]=x%N;}return k;}
};
struct GEdge{uint8_t c,p,j;};
struct GOption{array<GEdge,16> e{};array<uint16_t,16> f{};int n=0;};
struct Graph{
 array<uint8_t,N> r{},size{};array<Vec,N> off{};int comps=N;KeySpace k;
 Graph(){for(int x=0;x<N;x++){r[x]=x;size[x]=1;}}
 int dimension()const{return k.d+comps-1;}
 bool edge(GEdge e){
  int c=e.c,p=e.p,j=e.j,rc=r[c],rp=r[p];Vec shift=minusv(add(off[p],unit(j)),off[c]);
  if(rc==rp)return k.impose(shift);
  if(size[rc]<=size[rp]){for(int x=0;x<N;x++)if(r[x]==rc){r[x]=rp;off[x]=add(off[x],shift);}size[rp]+=size[rc];size[rc]=0;}
  else{for(int x=0;x<N;x++)if(r[x]==rp){r[x]=rc;off[x]=minusv(off[x],shift);}size[rc]+=size[rp];size[rp]=0;}
  if(--comps==1){Vec sum{};for(int x=0;x<N;x++)sum=add(sum,off[x]);if(!k.impose(sum))return false;}
  return true;
 }
 bool valid()const{
  if(!k.primitive())return false;array<Code,N> v{};for(int x=0;x<N;x++)v[x]=k.code(k.project(off[x]));
  for(int x=0;x<N;x++)for(int y=0;y<x;y++)if(r[x]==r[y]&&v[x]==v[y])return false;return true;
 }
 string sig()const{
  string s;s+=char(k.d);s.append((char*)k.vars.data(),Q);for(auto&a:k.a)s.append((char*)a.data(),Q);
  array<int,N> root;root.fill(-1);for(int x=0;x<N;x++){if(root[r[x]]<0)root[r[x]]=x;s+=char(root[r[x]]);auto v=k.project(minusv(off[x],off[root[r[x]]]));s.append((char*)v.data(),Q);}return s;
 }
};
bool extend(const Graph&g,const GOption&o,Graph&next){next=g;for(int i=0;i<o.n;i++)if(!next.edge(o.e[i]))return false;return next.valid();}
struct GFilter{
 const Graph&g;array<Vec,N>a{};unordered_set<Code> forbidden;unordered_map<int,vector<Code>> differences;array<int8_t,N*N*Q>cache;bool saturated=false;
 GFilter(const Graph&x):g(x){cache.fill(-1);for(int i=0;i<N;i++)a[i]=g.k.project(g.off[i]);unordered_map<Code,uint32_t> dirs;
  for(int i=0;i<N;i++)for(int j=0;j<i;j++)if(g.r[i]==g.r[j]){Code z=g.k.normalized(minusv(a[i],a[j]));if(!z){saturated=true;return;}if(z==IMP)continue;forbidden.insert(z);auto&v=dirs[z/N];v|=1u<<(z%N);if(v==0x1fffffff){saturated=true;return;}}
 }
 bool allowed(int c,int p,int j){auto&v=cache[(c*N+p)*Q+j];if(v>=0)return v;
  if(p==0)return v=(c==0); // literal plaintext F is a transparent hold: no edge and no key consumption
  Vec shift=minusv(add(a[p],g.k.a[j]),a[c]);int rc=g.r[c],rp=g.r[p];
  if(rc==rp){Code z=g.k.normalized(shift);return v=(z!=IMP&&!forbidden.count(z));}
  int id=rp*N+rc;auto it=differences.find(id);if(it==differences.end()){vector<Code> f;for(int x=0;x<N;x++)if(g.r[x]==rp)for(int y=0;y<N;y++)if(g.r[y]==rc)f.push_back(g.k.code(minusv(a[x],a[y])));sort(f.begin(),f.end());f.erase(unique(f.begin(),f.end()),f.end());it=differences.emplace(id,move(f)).first;}
  return v=!binary_search(it->second.begin(),it->second.end(),g.k.code(shift));
 }
 bool allowed(const GOption&o){for(int i=0;i<o.n;i++){auto e=o.e[i];if(!allowed(e.c,e.p,e.j))return false;}return true;}
};
struct GPosting{int feat;vector<int> ids;vector<uint64_t> bits;};
struct GDomain{string cipher;vector<GOption> opts;vector<vector<GPosting>> post;};
GDomain makeGDomain(const string&c,const vector<string>&words,const Graph&base,bool anchor=false){
 GDomain d;d.cipher=c;d.post.resize(c.size());vector<map<int,vector<int>>> tmp(c.size());unordered_set<string>seen;
 for(const auto&w:words){
  // Rotate phase labels so the first NONIDENTITY consuming carry edge has j=0.
  // It is nonzero by bijectivity, so the existing scale gauge k[0]=1 is legal.
  // If the prefix contains only identity consuming edges, retain every start.
  int canonical=-1,consumed=0;
  if(anchor)for(size_t i=0;i<w.size();i++){int p=fixed::val(w[i]),x=fixed::val(c[i]);if(!p)continue;if(p!=x){canonical=(Q-consumed%Q)%Q;break;}consumed++;}
  for(int start=0;start<Q;start++){
  if(canonical>=0&&start!=canonical)continue;
  GOption o;int j=start;bool ok=true;for(size_t i=0;i<w.size();i++){int p=fixed::val(w[i]),x=fixed::val(c[i]);if(!p){if(x){ok=false;break;}continue;}if(j==0&&p==x){ok=false;break;}
   for(int t=0;t<o.n;t++){auto e=o.e[t];if(e.j==j&&((e.c==x)!=(e.p==p))){ok=false;break;}if(e.j==j&&((e.c==e.p)!=(x==p))){ok=false;break;}}if(!ok)break;
   o.e[o.n++]={uint8_t(x),uint8_t(p),uint8_t(j)};o.f[i]=j*N+p;j=(j+1)%Q;
  }
  if(!ok)continue;Graph t;if(!extend(base,o,t))continue;
  array<uint16_t,16> ids{};for(int i=0;i<o.n;i++){auto e=o.e[i];ids[i]=(e.c*N+e.p)*Q+e.j;}sort(ids.begin(),ids.begin()+o.n);auto z=unique(ids.begin(),ids.begin()+o.n);string sig((char*)ids.data(),2*(z-ids.begin()));if(!seen.insert(sig).second)continue;
  int index=d.opts.size();d.opts.push_back(o);for(size_t i=0;i<c.size();i++)tmp[i][o.f[i]].push_back(index);
 }}
 for(size_t i=0;i<c.size();i++)for(auto&[feat,ids]:tmp[i]){
  GPosting p{feat,move(ids),{}};
  if(p.ids.size()>=64){p.bits.assign((d.opts.size()+63)/64,0);for(int id:p.ids)p.bits[id/64]|=uint64_t(1)<<(id%64);}
  d.post[i].push_back(move(p));
 }return d;
}
struct GStats{uint64_t nodes=0,joins=0,perms=0,keyTests=0,packNodes=0,features=0,options=0;};
struct GSearch{
 Graph base;vector<string> train;vector<GDomain> ds;vector<int> order;vector<Graph> seeds;int maxOov=3;
 atomic<bool> found{false},timed{false};atomic<size_t>next{0},done{0};Clock::time_point deadline;mutex answerMutex;
 fixed::Perm answer{};fixed::Key answerKey{};int answerOov=-1;GStats total;
 GSearch(const vector<string>&g,int budget=3):train(g),maxOov(budget){
  vector<string> pre(fixed::prefixDict.begin(),fixed::prefixDict.end());sort(pre.begin(),pre.end());
  for(int i=0;i<48;i++){ds.push_back(makeGDomain(g[i],i==47?pre:fixed::by[g[i].size()],base,i==47));if(i!=47)order.push_back(i);}
  sort(order.begin(),order.end(),[&](int a,int b){auto s=[&](int i){return log2(double(max<size_t>(1,ds[i].opts.size())))/train[i].size();};double x=s(a),y=s(b);return x==y?a<b:x<y;});
  unordered_set<string>seen;for(auto&o:ds[47].opts){Graph x;if(extend(base,o,x)&&seen.insert(x.sig()).second)seeds.push_back(x);}
  sort(seeds.begin(),seeds.end(),[](auto&a,auto&b){return a.dimension()==b.dimension()?a.sig()<b.sig():a.dimension()<b.dimension();});
  cout<<"GRAPH CARRY seeds="<<seeds.size()<<" domains";for(int i:order)cout<<" "<<i<<":"<<ds[i].opts.size();cout<<endl;
 }
 bool stop(){if(found.load(memory_order_relaxed)||timed.load(memory_order_relaxed))return true;if(Clock::now()>=deadline){timed=true;return true;}return false;}
 vector<int> domain(int g,GFilter&f,size_t cap,GStats&c){
  const auto&d=ds[g];
  struct Choice{size_t count=0;vector<const GPosting*> lists;};
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
  auto test=[&](int id){c.options++;if(f.allowed(d.opts[id]))out.push_back(id);return out.size()>=cap;};
  if(choices[0].count<=128||choices.size()==1){
   for(auto*p:choices[0].lists)for(int id:p->ids)if(test(id))return out;
   return out;
  }
  const size_t n=(d.opts.size()+63)/64;vector<uint64_t> bits(n),scratch(n);
  auto add=[&](vector<uint64_t>&v,const Choice&q){
   for(auto*p:q.lists){if(p->bits.empty()){for(int id:p->ids)v[id/64]|=uint64_t(1)<<(id%64);}
    else for(size_t i=0;i<n;i++)v[i]|=p->bits[i];}
  };
  add(bits,choices[0]);
  for(size_t pos=1;pos<min<size_t>(3,choices.size());pos++){
   if(choices[pos].count==d.opts.size())continue;
   fill(scratch.begin(),scratch.end(),0);add(scratch,choices[pos]);bool any=false;
   for(size_t i=0;i<n;i++){bits[i]&=scratch[i];any|=bits[i]!=0;}
   if(!any)return {};
  }
  for(size_t i=0;i<n;i++){uint64_t b=bits[i];while(b){int bit=__builtin_ctzll(b);b&=b-1;if(test(int(i*64+bit)))return out;}}
  return out;
 }
 void check(const fixed::Perm&pi,const fixed::Key&k,GStats&c){
  c.perms++;auto m=fixed::maps(pi,k);if(!fixed::support(train.back(),m,fixed::prefixDict))return;
  int n=0;for(int i:order)if(!fixed::support(train[i],m,fixed::dict)&&++n>maxOov)return;
  lock_guard<mutex>l(answerMutex);if(!found){answer=pi;answerKey=k;answerOov=n;found=true;}
 }
 void pack(const Graph&g,const fixed::Key&k,GStats&c){
  c.keyTests++;bool primitive=false;for(int j=0;j<4;j++)primitive|=k[j]!=k[j+4];if(!primitive)return;
  array<int,N> val{},trans{};array<uint32_t,N> masks{};for(int x=0;x<N;x++){int v=0;for(int j=0;j<Q;j++)v+=g.off[x][j]*k[j];v%=N;val[x]=v;uint32_t b=1u<<v;if(masks[g.r[x]]&b)return;masks[g.r[x]]|=b;}
  int root=g.r[0];trans[root]=(N-val[0])%N;uint32_t used=fixed::rot(masks[root],trans[root]);vector<int> rem;for(int x=0;x<N;x++)if(masks[x]&&x!=root)rem.push_back(x);
  auto dfs=[&](auto&&self,uint32_t mask,vector<int>left)->void{if(stop())return;c.packNodes++;if(left.empty()){fixed::Perm pi{};for(int x=0;x<N;x++)pi[x]=(val[x]+trans[g.r[x]])%N;check(pi,k,c);return;}
   int pick=-1;vector<int> options;
   for(int i=0;i<int(left.size());i++){int r=left[i];vector<int> v;for(int t=0;t<N;t++)if(!(mask&fixed::rot(masks[r],t)))v.push_back(t);if(v.empty())return;if(pick<0||v.size()<options.size()){pick=i;options=move(v);if(options.size()==1)break;}}
   int r=left[pick];left.erase(left.begin()+pick);for(int t:options){trans[r]=t;self(self,mask|fixed::rot(masks[r],t),left);if(stop())return;}
  };
  dfs(dfs,used,rem);
 }
 void enumerate(const Graph&g,GStats&c){Vec param{};auto visit=[&](auto&&self,int i)->void{if(stop())return;if(i==g.k.d){pack(g,g.k.evaluate(param),c);return;}for(int v=0;v<N;v++){param[i]=v;self(self,i+1);if(stop())return;}};visit(visit,0);}
 void dfs(const Graph&g,vector<int>rem,int b,GStats&c){
  if(stop())return;c.nodes++;if(g.dimension()<=3||int(rem.size())<=b){enumerate(g,c);return;}
  GFilter f(g);if(f.saturated)return;int pick=-1;vector<int>best;size_t cap=SIZE_MAX;int ntry=min<int>(rem.size(),g.dimension()>20?5:g.dimension()>12?8:16);
  for(int i=0;i<ntry;){auto d=domain(rem[i],f,cap,c);if(d.empty()){if(!b)return;b--;rem.erase(rem.begin()+i);ntry--;if(pick>i)pick--;continue;}if(pick<0||d.size()<cap){pick=i;best=move(d);cap=best.size();}i++;}
  if(pick<0){enumerate(g,c);return;}int id=rem[pick];rem.erase(rem.begin()+pick);unordered_set<string>seen;
  for(int i:best){if(stop())return;c.joins++;Graph x;if(extend(g,ds[id].opts[i],x)&&seen.insert(x.sig()).second)dfs(x,rem,b,c);}
  if(b)dfs(g,rem,b-1,c);
 }
 void run(int seconds,size_t seedStart=0,size_t seedEnd=SIZE_MAX){
  if(seedEnd==SIZE_MAX)seedEnd=seeds.size();
  if(seedStart>seedEnd||seedEnd>seeds.size())throw runtime_error("invalid seed range");
  next=seedStart;done=0;deadline=Clock::now()+chrono::seconds(seconds);
  unsigned n=max(1u,min(4u,thread::hardware_concurrency()));vector<GStats>stats(n);vector<thread>pool;
  for(unsigned t=0;t<n;t++)pool.emplace_back([&,t]{auto&c=stats[t];while(!stop()){size_t i=next.fetch_add(1);if(i>=seedEnd)break;dfs(seeds[i],order,maxOov,c);if(!found&&!timed)done++;}});
  for(auto&t:pool)t.join();for(auto&c:stats){total.nodes+=c.nodes;total.joins+=c.joins;total.perms+=c.perms;total.keyTests+=c.keyTests;total.packNodes+=c.packNodes;total.features+=c.features;total.options+=c.options;}
  cout<<"GRAPH SEARCH found="<<found<<" timed="<<timed<<" seeds="<<done<<"/"<<(seedEnd-seedStart)<<" nodes="<<total.nodes<<" joins="<<total.joins<<" keys="<<total.keyTests<<" packing="<<total.packNodes<<" permutations="<<total.perms<<" features="<<total.features<<" options="<<total.options<<" OOV="<<answerOov<<endl;
 }
};
bool equalAction(const fixed::Perm&pi,const fixed::Key&k,const fixed::Perm&pj,const fixed::Key&l){auto a=fixed::maps(pi,k),b=fixed::maps(pj,l);for(int r=0;r<Q;r++){bool good=true;for(int j=0;j<Q;j++)good&=a[j]==b[(j+r)%Q];if(good)return true;}return false;}
void regression(){
 // A literal plaintext F is a transparent hold, not a consuming edge at any phase.
 { Graph g; for(int j=0;j<Q;j++){GFilter f(g);fixed::require(f.allowed(0,0,j),"transparent F hold rejected");fixed::require(!f.allowed(1,0,j),"non-F ciphertext accepted for plaintext F");} fixed::require(g.k.d==7,"F holds altered key space"); }
 // Concrete planted edges must remain inside every symbolic graph state,
 // and each filter must accept subsequent true edges, including zero shifts.
 mt19937 rng(123);for(int t=0;t<30;t++){fixed::Perm pi{},ip{};iota(pi.begin(),pi.end(),0);shuffle(pi.begin()+1,pi.end(),rng);for(int i=0;i<N;i++)ip[pi[i]]=i;fixed::Key k{};k[0]=1;for(int j=1;j<Q;j++)k[j]=rng()%N;k[4]=2;
  Graph g;for(int i=0;i<90;i++){int p=1+rng()%28,j=rng()%Q,c=ip[(pi[p]+k[j])%N];GFilter f(g);fixed::require(!f.saturated&&f.allowed(c,p,j),"true edge filtered");fixed::require(g.edge({uint8_t(c),uint8_t(p),uint8_t(j)})&&g.valid(),"true graph invalid");
   Vec params{};for(int z=0;z<g.k.d;z++)params[z]=k[g.k.vars[z]];fixed::require(g.k.evaluate(params)==k,"key space lost plant");
   for(int x=0;x<N;x++){int v=0;for(int z=0;z<Q;z++)v+=g.off[x][z]*k[z];fixed::require(v%N==aff::mod(pi[x]-pi[g.r[x]]),"graph relative offset");}
  }
 }
 // Every planted carry word has at least one representative under the new gauge.
 for(int t=0;t<400;t++){
  fixed::Perm pi{},ip{};iota(pi.begin(),pi.end(),0);shuffle(pi.begin()+1,pi.end(),rng);for(int x=0;x<N;x++)ip[pi[x]]=x;
  fixed::Key k{};for(int j=0;j<Q;j++)k[j]=rng()%N;k[0]=1;k[4]=2;
  if(t%4==0)for(int j=1;j<4;j++)k[j]=0;
  string w;for(int i=0;i<10;i++)w+=fixed::SYM[rng()%N];int start=rng()%Q;
  string c=fixed::encode(w,pi,k,start);
  auto d=makeGDomain(c,vector<string>{w},Graph{},true);
  bool matched=false;
  for(int r=0;r<Q;r++)if(k[r]){
   fixed::Key nk{};fixed::Perm np{};for(int j=0;j<Q;j++)nk[j]=aff::mul[k[(j+r)%Q]][aff::inv[k[r]]];for(int x=0;x<N;x++)np[x]=aff::mul[pi[x]][aff::inv[k[r]]];
   for(auto&o:d.opts){bool ok=true;for(int j=0;j<o.n;j++){auto e=o.e[j];ok&=aff::mod(np[e.c]-np[e.p])==nk[e.j];}matched|=ok;}
  }
  fixed::require(matched,"carry phase gauge lost planted action");
 }
 cout<<"GRAPH regression 2700 true edge extensions and 400 carry phase gauges passed"<<endl;
}
bool graphControl(const vector<string>&train,const vector<string>&held,unsigned seed){
 mt19937 rng(seed+123);fixed::Key k{};k[0]=1;for(int j=1;j<Q;j++)k[j]=rng()%N;k[4]=2;if(seed==3301)k[3]=0;
 vector<string> t(train.begin(),train.end()-1),h(held.begin()+1,held.end());auto p=fixed::plant(t,h,k,seed);auto g=p.train;g.push_back(p.prefix);GSearch s(g,0);s.run(420);if(!s.found){cout<<"GRAPH CONTROL "<<seed<<" no key"<<endl;return false;}
 auto m=fixed::maps(s.answer,s.answerKey);int tr=0,hit=0,unique=0;for(int i=0;i<47;i++)tr+=fixed::decode(p.train[i],m,fixed::dict).count(p.truthTrain[i]);vector<string>c{p.carry},w{p.truthCarry};c.insert(c.end(),p.hold.begin(),p.hold.end());w.insert(w.end(),p.truthHold.begin(),p.truthHold.end());
 for(int i=0;i<int(c.size());i++){auto v=fixed::decode(c[i],m,fixed::dict);hit+=v.count(w[i]);unique+=v.size()==1&&v.count(w[i]);}
 bool exact=equalAction(s.answer,s.answerKey,p.pi,k),pass=exact&&s.answerOov==0&&tr==47&&hit==17&&unique>=8;
 cout<<"GRAPH CONTROL "<<seed<<" exact="<<exact<<" train="<<tr<<"/47 hold="<<hit<<"/17 unique="<<unique<<" pass="<<pass<<endl;return pass;
}

using DomainPointers=array<const vector<int>*,48>;

struct NTNode { array<int,N> child; NTNode(){child.fill(-1);} };
struct NTWitness{array<uint8_t,16> word{};int phase=-1;};
struct NumericTrie {
 vector<NTNode> nodes; vector<int> roots;
 NumericTrie():roots(fixed::by.size(),-1){
  for(size_t len=1;len<fixed::by.size();len++){
   roots[len]=nodes.size();nodes.emplace_back();
   for(const auto&w:fixed::by[len]){
    int at=roots[len];
    for(char ch:w){int p=fixed::val(ch);int next=nodes[at].child[p];if(next<0){next=nodes.size();nodes[at].child[p]=next;nodes.emplace_back();}at=next;}
   }
  }
 }
 bool walk(const vector<int>&cipher,size_t i,int j,int node,const fixed::Graph&g,const fixed::Key&k,NTWitness* witness)const{
  if(i==cipher.size())return true;
  int c=cipher[i],hold=nodes[node].child[0];
  if(!c&&hold>=0){if(witness)witness->word[i]=0;if(walk(cipher,i+1,j,hold,g,k,witness))return true;}
  int target=fixed::md(g.o[c]-k[j]),rc=g.r[c];
  // An occupied target coordinate forces the plaintext rune; aligning
  // another component to that coordinate would violate bijectivity.
  if(g.m[rc]&(1u<<target)){
   for(int p=0;p<N;p++)if(g.r[p]==rc&&g.o[p]==target){
    int n=nodes[node].child[p];
    if(witness)witness->word[i]=p;
    return p!=0&&n>=0&&walk(cipher,i+1,(j+1)%Q,n,g,k,witness);
   }
   throw runtime_error("numeric mask/offset inconsistency");
  }
  for(int p=1;p<N;p++){
   int n=nodes[node].child[p];if(n<0||!g.allow(p,c,k[j]))continue;
   fixed::Graph h=g;if(!h.add(p,c,k[j]))throw runtime_error("numeric merge inconsistency");
   if(witness)witness->word[i]=p;
   if(walk(cipher,i+1,(j+1)%Q,n,h,k,witness))return true;
  }
  return false;
 }
 bool support(const vector<int>&cipher,const fixed::Graph&g,const fixed::Key&k,NTWitness* witness=nullptr)const{
  if(witness){fixed::require(cipher.size()<=witness->word.size(),"witness length");witness->phase=-1;}
  for(int j=0;j<Q;j++)if(walk(cipher,0,j,roots[cipher.size()],g,k,witness)){if(witness)witness->phase=j;return true;}
  return false;
 }
 bool replay(const vector<int>&cipher,const fixed::Graph&g,const fixed::Key&k,const NTWitness&w)const{
  if(w.phase<0)return false;fixed::Graph h=g;int j=w.phase;
  for(size_t i=0;i<cipher.size();i++){int p=w.word[i],c=cipher[i];if(!p){if(c)return false;continue;}if(!h.add(p,c,k[j]))return false;j=(j+1)%Q;}
  return true;
 }
};
const NumericTrie& numericTrie(){static const NumericTrie t;return t;}
bool numericGraph(const Graph&g,const fixed::Key&k,fixed::Graph&out){
 out.r=g.r;out.s=g.size;out.comps=g.comps;out.m.fill(0);
 for(int x=0;x<N;x++){
  int v=0;for(int j=0;j<Q;j++)v+=g.off[x][j]*k[j];v%=N;out.o[x]=v;
  uint32_t bit=1u<<v;if(out.m[g.r[x]]&bit)return false;out.m[g.r[x]]|=bit;
 }
 return true;
}
bool usePostingMasks=true;
bool useCoordinatePacking=false;
int numericCutoff=1;
struct ExactMask { vector<uint64_t> bits; size_t count=0; };
using MaskPointers=array<const ExactMask*,48>;


struct FastSearch : GSearch {
 using GSearch::GSearch;
 vector<uint8_t> completed;
 mutex checkpointMutex;
 atomic<uint64_t> inheritedCount{0},earlyPackCount{0},numericAssignments{0},numericSurvivors{0},numericSplits{0},coordinateNodes{0},witnessHits{0};

 ExactMask maskDomain(int id,GFilter&f,GStats&c,const ExactMask*parent){
  const auto&d=ds[id];size_t n=d.opts.size(),nw=(n+63)/64;
  ExactMask m;
  if(parent){m=*parent;inheritedCount.fetch_add(1,memory_order_relaxed);}
  else{m.bits.assign(nw,~uint64_t(0));m.count=n;if(n%64)m.bits.back()=(uint64_t(1)<<(n%64))-1;}
  auto recount=[&](){m.count=0;for(uint64_t x:m.bits)m.count+=__builtin_popcountll(x);};
  auto scan=[&](){for(size_t z=0;z<nw;z++){uint64_t b=m.bits[z];while(b){int bit=__builtin_ctzll(b);b&=b-1;c.options++;if(!f.allowed(d.opts[z*64+bit])){m.bits[z]&=~(uint64_t(1)<<bit);m.count--;}}}};
  vector<uint64_t>scratch(nw);
  auto apply=[&](const GPosting&p,bool remove){
   auto&v=remove?m.bits:scratch;
   if(p.bits.empty()){for(int x:p.ids)if(remove)v[x/64]&=~(uint64_t(1)<<(x%64));else v[x/64]|=uint64_t(1)<<(x%64);}
   else if(remove){for(size_t z=0;z<nw;z++)v[z]&=~p.bits[z];}
   else{for(size_t z=0;z<nw;z++)v[z]|=p.bits[z];}
  };
  for(size_t pos=0;pos<d.post.size();pos++){
   if(!m.count)return m;
   if(m.count<=128){scan();return m;}
   vector<const GPosting*>yes,no;size_t rejected=0;int x=fixed::val(d.cipher[pos]);
   for(const auto&p:d.post[pos]){
    c.features++;int a=p.feat%N,j=p.feat/N;
    if(f.allowed(x,a,j))yes.push_back(&p);else{no.push_back(&p);rejected+=p.ids.size();}
   }
   if(!rejected)continue;
   if(rejected<=n-rejected){for(auto*p:no)apply(*p,true);}
   else{fill(scratch.begin(),scratch.end(),0);for(auto*p:yes)apply(*p,false);for(size_t z=0;z<nw;z++)m.bits[z]&=scratch[z];}
   recount();
  }
  return m;
 }
 vector<int> maskIds(const ExactMask&m)const{
  vector<int>v;v.reserve(m.count);for(size_t z=0;z<m.bits.size();z++){uint64_t b=m.bits[z];while(b){int i=__builtin_ctzll(b);b&=b-1;v.push_back(z*64+i);}}return v;
 }
 bool numericBudget(const Graph&g,const fixed::Key&k,const vector<int>&rem,int budget){
  bool primitive=false;for(int j=0;j<4;j++)primitive|=k[j]!=k[j+4];if(!primitive)return false;
  fixed::Graph h;if(!numericGraph(g,k,h))return false;
  int miss=0;for(int id:rem){
   if(stop())return false;
   vector<int>cipher;cipher.reserve(train[id].size());for(char c:train[id])cipher.push_back(fixed::val(c));
   if(!numericTrie().support(cipher,h,k)&&++miss>budget)return false;
  }
  return true;
 }

 // Exact fixed-key search over component placements. Anchor translation
 // is gauge; every other component is placed in a free cyclic coordinate
 // set. A cached witness is rechecked before use, and failed witnesses
 // are replaced by a complete trie search. No word is committed by a
 // witness; only proven unsupported words consume the local OOV budget.
 bool coordinateSearch(const fixed::Graph&g,const fixed::Key&k,vector<int>rem,int budget,GStats&c,array<NTWitness,48> witnesses){
  if(stop())return false;
  coordinateNodes.fetch_add(1,memory_order_relaxed);
  if(g.comps==1){
   fixed::Perm pi{};for(int x=0;x<N;x++)pi[x]=fixed::md(g.o[x]-g.o[0]);check(pi,k,c);return true;
  }
  int anchor=0;for(int r=1;r<N;r++)if(g.r[r]==r&&g.s[r]>g.s[anchor])anchor=r;
  // Root indices of merged-away components retain their old size in
  // fixed::Graph, so choose the anchor only among current roots.
  if(g.r[anchor]!=anchor){for(int r=0;r<N;r++)if(g.r[r]==r){anchor=r;break;}for(int r=0;r<N;r++)if(g.r[r]==r&&g.s[r]>g.s[anchor])anchor=r;}
  int pick=-1;vector<int>shifts;
  for(int r=0;r<N;r++)if(g.r[r]==r&&r!=anchor){
   vector<int>v;for(int t=0;t<N;t++)if(!(g.m[anchor]&fixed::rot(g.m[r],t)))v.push_back(t);
   if(v.empty())return false;
   if(pick<0||v.size()<shifts.size()||(v.size()==shifts.size()&&g.s[r]>g.s[pick])){pick=r;shifts=move(v);}
  }
  for(size_t i=0;i<rem.size();){
   int id=rem[i];vector<int>cipher;for(char ch:train[id])cipher.push_back(fixed::val(ch));
   if(numericTrie().replay(cipher,g,k,witnesses[id])){witnessHits.fetch_add(1,memory_order_relaxed);i++;continue;}
   if(numericTrie().support(cipher,g,k,&witnesses[id])){i++;continue;}
   if(!budget)return false;
   budget--;rem.erase(rem.begin()+i);
  }
  for(int t:shifts){
   if(stop())break;fixed::Graph h=g;
   int shift=fixed::md(t+g.o[pick]-g.o[anchor]);
   fixed::require(h.add(anchor,pick,shift),"allowed coordinate packing failed");
   coordinateSearch(h,k,rem,budget,c,witnesses);
  }
  return true;
 }

 void splitNumeric(const Graph&g,const vector<int>&rem,int budget,GStats&c,MaskPointers inherited){
  Vec param{};int examined=0,survived=0;
  auto visit=[&](auto&&self,int i)->void{
   if(stop())return;
   if(i<g.k.d){for(int v=0;v<N;v++){param[i]=v;self(self,i+1);if(stop())return;}return;}
   auto k=g.k.evaluate(param);examined++;
   if(useCoordinatePacking&&g.comps<=12){
    bool primitive=false;for(int j=0;j<4;j++)primitive|=k[j]!=k[j+4];if(!primitive)return;
    fixed::Graph h;if(!numericGraph(g,k,h))return;
    if(coordinateSearch(h,k,rem,budget,c,{}))survived++;return;
   }
   if(!numericBudget(g,k,rem,budget))return;
   survived++;Graph h=g;
   for(int j=1;j<Q;j++){Vec eq=unit(j);eq[0]=(N-k[j])%N;if(!h.k.impose(eq))throw runtime_error("numeric assignment vanished");}
   fixed::require(h.k.d==0&&h.valid(),"numeric graph restriction");
   maskDfs(h,rem,budget,c,inherited);
  };
  visit(visit,0);
  numericAssignments.fetch_add(examined,memory_order_relaxed);numericSurvivors.fetch_add(survived,memory_order_relaxed);
  numericSplits.fetch_add(1,memory_order_relaxed);
 }
 void maskDfs(const Graph&g,vector<int>rem,int budget,GStats&c,MaskPointers inherited){
  if(stop())return;c.nodes++;
  if(g.dimension()<=3||int(rem.size())<=budget){fastEnumerate(g,c);return;}
  if(packingBound(g)<=8192){earlyPackCount.fetch_add(1,memory_order_relaxed);fastEnumerate(g,c);return;}
  if(useCoordinatePacking&&g.k.d==0&&g.comps<=12){Vec p{};fixed::Graph h;auto k=g.k.evaluate(p);if(numericGraph(g,k,h))coordinateSearch(h,k,rem,budget,c,{});return;}
  if(g.k.d>0&&g.k.d<=numericCutoff){splitNumeric(g,rem,budget,c,inherited);return;}
  GFilter f(g);if(f.saturated)return;
  array<ExactMask,48>storage;
  int pick=-1;size_t cap=SIZE_MAX;
  int ntry=min<int>(rem.size(),g.dimension()>20?5:g.dimension()>12?8:16);
  stable_sort(rem.begin(),rem.end(),[&](int a,int b){
   size_t x=inherited[a]?inherited[a]->count:ds[a].opts.size();
   size_t y=inherited[b]?inherited[b]->count:ds[b].opts.size();
   return log2(double(max<size_t>(1,x)))/train[a].size()<log2(double(max<size_t>(1,y)))/train[b].size();
  });
  for(int i=0;i<ntry;){
   int id=rem[i];storage[id]=maskDomain(id,f,c,inherited[id]);inherited[id]=&storage[id];
   size_t count=storage[id].count;
   if(!count){if(!budget)return;budget--;rem.erase(rem.begin()+i);ntry--;if(pick>i)pick--;continue;}
   if(pick<0||count<cap){pick=i;cap=count;}
   i++;
  }
  if(pick<0){fastEnumerate(g,c);return;}
  int id=rem[pick];auto best=maskIds(*inherited[id]);rem.erase(rem.begin()+pick);unordered_set<string>seen;
  for(int i:best){if(stop())return;c.joins++;Graph x;if(extend(g,ds[id].opts[i],x)&&seen.insert(x.sig()).second)maskDfs(x,rem,budget,c,inherited);}
  if(budget)maskDfs(g,rem,budget-1,c,inherited);
 }
 void maskRegression(){
  GStats c;int comparisons=0,trieComparisons=0;
  for(size_t z=0;z<min<size_t>(10,seeds.size());z++){
   const Graph&g=seeds[z];GFilter f(g);if(f.saturated)continue;
   for(int a=0;a<min<int>(5,order.size());a++){
    int id=order[a];auto want=GSearch::domain(id,f,SIZE_MAX,c);
    auto m=maskDomain(id,f,c,nullptr);auto got=maskIds(m);sort(want.begin(),want.end());
    fixed::require(want==got,"exact posting mask mismatch");comparisons++;
    for(int q=0;q<min<int>(2,want.size());q++){
     Graph child;if(!extend(g,ds[id].opts[want[q]],child))continue;
     GFilter cf(child);if(cf.saturated)continue;
     auto cm=maskDomain(id,cf,c,&m);auto have=maskIds(cm);auto truth=GSearch::domain(id,cf,SIZE_MAX,c);sort(truth.begin(),truth.end());
     fixed::require(have==truth,"inherited exact posting mask mismatch");comparisons++;
    }
   }
  }
  mt19937 rng(1827226);
  for(int t=0;t<40;t++){
   fixed::Perm pi{},ip{};iota(pi.begin(),pi.end(),0);shuffle(pi.begin()+1,pi.end(),rng);for(int x=0;x<N;x++)ip[pi[x]]=x;
   fixed::Key k{};k[0]=1;for(int j=1;j<Q;j++)k[j]=rng()%N;k[4]=2;
   fixed::Graph g;
   for(int i=0;i<8+t%24;i++){int p=1+rng()%28,j=rng()%Q,c=ip[(pi[p]+k[j])%N];fixed::require(g.add(p,c,k[j]),"true numeric merge");}
   int id=order[rng()%order.size()];vector<int>cipher;for(char ch:train[id])cipher.push_back(fixed::val(ch));
   bool want=false;for(const auto&o:ds[id].opts){fixed::Graph h=g;bool ok=true;for(int i=0;i<o.n;i++){auto e=o.e[i];if(!h.add(e.p,e.c,k[e.j])){ok=false;break;}}if(ok){want=true;break;}}
   bool got=numericTrie().support(cipher,g,k);fixed::require(got==want,"numeric trie versus complete word-option mismatch");trieComparisons++;
   const auto&words=fixed::by[cipher.size()];const auto&w=words[rng()%words.size()];string enc=fixed::encode(w,pi,k,rng()%Q);cipher.clear();for(char ch:enc)cipher.push_back(fixed::val(ch));
   NTWitness witness;fixed::require(numericTrie().support(cipher,g,k,&witness),"numeric trie lost planted word");fixed::require(numericTrie().replay(cipher,g,k,witness),"numeric witness replay");trieComparisons++;
  }
  cout<<"AGENT18 POSTING comparisons="<<comparisons<<" numeric-trie="<<trieComparisons<<endl;
 }


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
   double sx=log2(double(max<size_t>(1,x)))/train[a].size();
   double sy=log2(double(max<size_t>(1,y)))/train[b].size();
   return sx<sy;
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
    if(usePostingMasks)maskDfs(seeds[i],order,maxOov,c,MaskPointers{});else fastDfs(seeds[i],order,maxOov,c,DomainPointers{});
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
  cout<<"FAST SEARCH found="<<found<<" timed="<<timed<<" seeds="<<done<<"/"<<(seedEnd-seedStart)<<" nodes="<<total.nodes<<" joins="<<total.joins<<" keys="<<total.keyTests<<" packing="<<total.packNodes<<" permutations="<<total.perms<<" features="<<total.features<<" options="<<total.options<<" inherited="<<inheritedCount<<" early_pack="<<earlyPackCount<<" numeric_splits="<<numericSplits<<" numeric_assignments="<<numericAssignments<<" numeric_survivors="<<numericSurvivors<<" coordinate_nodes="<<coordinateNodes<<" witness_hits="<<witnessHits<<" OOV="<<answerOov<<endl;
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
 vector<string> t(train.begin(),train.end()-1),h(held.begin()+1,held.end());auto p=fixed::plant(t,h,k,seed);auto g=p.train;g.push_back(p.prefix);FastSearch s(g,0);cacheRegression(s);s.maskRegression();s.run(420);if(!s.found){cout<<"FAST CONTROL "<<seed<<" no key"<<endl;return false;}
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
  else if(arg=="--legacy")usePostingMasks=false;
  else if(arg=="--mask-only")numericCutoff=0;
  else if(arg=="--numeric-d2")numericCutoff=2;
  else if(arg=="--coordinate-pack")useCoordinatePacking=true;
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
 FastSearch s(train);cacheRegression(s);s.maskRegression();fixed::require(s.seeds.size()==93,"seed count changed; update shard matrix");
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
