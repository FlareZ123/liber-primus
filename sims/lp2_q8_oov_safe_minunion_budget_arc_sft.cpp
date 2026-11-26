// Agent16 OOV-safe multi-anchor adaptation of Agent2's exact pair-cover receiver.
// Four-anchor minimum-union seeds; no mandatory carry-prefix condition in search.
// Agent12 derivative: Agent29 pinned incremental graph receiver + exact numeric subtree solver.
// Agent29 incremental exact receiver, base implementation frozen from blob 01a11ad52a11b734712710527c14ac51a07854df.
// General unknown primitive q8, arbitrary word starts and literal F hold.
// Difference graph over original eight key coordinates, exact GF29 key-space
// elimination only when graph cycles close. Carry-anchor phase gauge and exact
// posting intersections reduce redundant rotational and lexical search.
// Component translations are packed
// at residual leaves. 47 complete groups, <=3 OOV; carry is an independent holdout.
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
// Frequency is only a branch-order prior. It does not remove any
// native spelling, alter phase semantics, or change canonical seed IDs.
static bool frequencyOrderEnabled=false;
static unordered_map<string,uint64_t> wordPrior7,prefixPrior7;
static unordered_map<string,string> wordEnglish7;
void buildPrior7(){
 istringstream f(fixed::read("resources/control/english_wordfreq_textblob.txt"));string line;
 while(getline(f,line)){
  istringstream in(line);string word,count,extra;
  if(!(in>>word>>count)||in>>extra||word.empty()||count.empty())continue;
  if(!all_of(word.begin(),word.end(),[](char c){return c>='a'&&c<='z';})||
     !all_of(count.begin(),count.end(),[](char c){return c>='0'&&c<='9';}))continue;
  uint64_t freq=stoull(count);string normalized;
  for(size_t i=0;i<word.size();i++){char c=toupper(word[i]);if(c=='Q'&&i+1<word.size()&&toupper(word[i+1])=='U'){normalized+="CW";i++;continue;}if(c=='V')c='U';if(c=='K'||c=='Q')c='C';if(c=='Z')c='S';normalized+=c;}
  string w;
  auto rec=[&](auto&&self,size_t i)->void{
   if(i==normalized.size()){
    if(!fixed::dict.count(w))return;
    auto&v=wordPrior7[w];if(freq>v){v=freq;wordEnglish7[w]=word;}
    if(w.size()==11){auto&z=prefixPrior7[w.substr(0,10)];z=max(z,freq);}
    return;
   }
   for(int n=1;n<=3&&i+n<=normalized.size();n++){
    string t=normalized.substr(i,n);int x=-1;
    if(n==3){if(t=="ING")x=21;}
    else{auto p=find(fixed::ALPHA.begin(),fixed::ALPHA.end(),t);if(p!=fixed::ALPHA.end())x=int(p-fixed::ALPHA.begin());}
    if(x>=0){w+=fixed::SYM[x];self(self,i+n);w.pop_back();}
   }
  };
  rec(rec,0);
 }
}
string optionWord7(const GDomain&d,const GOption&o){
 string w;w.reserve(d.cipher.size());for(size_t i=0;i<d.cipher.size();i++)w+=fixed::SYM[o.f[i]%N];return w;
}
uint64_t prior7(const string&w,bool prefix){auto&m=prefix?prefixPrior7:wordPrior7;auto it=m.find(w);return it==m.end()?0:it->second;}
struct GStats{uint64_t nodes=0,joins=0,perms=0,keyTests=0,packNodes=0,features=0,options=0;};
struct GSearch{
 GSearch()=default;
 Graph base;vector<string> train;vector<GDomain> ds;vector<int> order;vector<Graph> seeds;int maxOov=3;
 vector<vector<uint64_t>> optionPrior;vector<uint64_t> seedPrior;vector<vector<string>> seedPrefixes;
 atomic<bool> found{false},timed{false};atomic<size_t>next{0},done{0};Clock::time_point deadline;mutex answerMutex;
 fixed::Perm answer{};fixed::Key answerKey{};int answerOov=-1;GStats total;
 GSearch(const vector<string>&g,int budget=3):train(g),maxOov(budget){
  vector<string> pre(fixed::prefixDict.begin(),fixed::prefixDict.end());sort(pre.begin(),pre.end());
  for(int i=0;i<48;i++){ds.push_back(makeGDomain(g[i],i==47?pre:fixed::by[g[i].size()],base,i==47));if(i!=47)order.push_back(i);}
  sort(order.begin(),order.end(),[&](int a,int b){auto s=[&](int i){return log2(double(max<size_t>(1,ds[i].opts.size())))/train[i].size();};double x=s(a),y=s(b);return x==y?a<b:x<y;});
  unordered_set<string>seen;for(auto&o:ds[47].opts){Graph x;if(extend(base,o,x)&&seen.insert(x.sig()).second)seeds.push_back(x);}
  sort(seeds.begin(),seeds.end(),[](auto&a,auto&b){return a.dimension()==b.dimension()?a.sig()<b.sig():a.dimension()<b.dimension();});
  if(frequencyOrderEnabled){
   optionPrior.resize(ds.size());for(int id=0;id<int(ds.size());id++){
    auto&v=optionPrior[id];v.reserve(ds[id].opts.size());for(const auto&o:ds[id].opts)v.push_back(prior7(optionWord7(ds[id],o),id==47));
   }
   unordered_map<string,size_t> seedId;for(size_t i=0;i<seeds.size();i++)seedId[seeds[i].sig()]=i;
   seedPrior.assign(seeds.size(),0);seedPrefixes.resize(seeds.size());
   for(const auto&o:ds[47].opts){Graph g;if(!extend(base,o,g))continue;auto id=seedId.at(g.sig());string w=optionWord7(ds[47],o);seedPrior[id]=max(seedPrior[id],prior7(w,true));seedPrefixes[id].push_back(w);}
   for(auto&v:seedPrefixes){sort(v.begin(),v.end());v.erase(unique(v.begin(),v.end()),v.end());}
  }
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
  c.perms++;auto m=fixed::maps(pi,k);
  if(train.size()==48&&!fixed::support(train.back(),m,fixed::prefixDict))return;
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

#include "lp2_gp29_numeric_subtree12.hpp"
#include "lp2_gp29_moment7.hpp"
using DomainPointers=array<const vector<int>*,48>;
static bool exactMrvEnabled=false;
static bool pairCoverEnabled=false;

struct FastSearch : GSearch {
 using GSearch::GSearch;
 FastSearch():GSearch(){}
 vector<uint8_t> completed;
 mutex checkpointMutex;
 atomic<uint64_t> inheritedCount{0},earlyPackCount{0},momentCalls{0},momentComplete{0},momentKeys{0};
 atomic<uint64_t> pairProbeCalls{0},pairDomainCount{0},pairConflicts{0},pairPrunes{0},pairCoverBranches{0},pairZeroPrunes{0},pairProbeJoins{0},pairProbeMicroseconds{0};
 atomic<uint64_t> exactProbeCalls{0},exactProbeZero{0},exactProbeRedundant{0},exactProbeSelected{0},exactProbeFallback{0},exactProbeAccepted{0};

 void prioritize(int id,vector<int>&ids)const{
  if(!frequencyOrderEnabled)return;
  const auto&p=optionPrior[id];sort(ids.begin(),ids.end(),[&](int a,int b){return p[a]!=p[b]?p[a]>p[b]:a<b;});
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
  if(!input){fresh=shortlist(g,f,c);prioritize(g,fresh);input=&fresh;}
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

 // Exact symbolic domain probe. Invalid whole-word extensions are
 // permanently impossible in descendants; retain every untested suffix.
 // A dimension-preserving witness imposes no new graph/key constraint:
 // the word is supported by every completion of this state.
 struct ExactChoice7{vector<Graph> states;bool capped=false,redundant=false;};
 ExactChoice7 exactCachedDomain(const Graph&g,int id,GFilter&f,size_t cap,GStats&c,
                              const vector<int>*parent,vector<int>&store,const vector<int>*&next){
  exactProbeCalls++;vector<int>fresh;const vector<int>*input=parent;
  if(!input){fresh=shortlist(id,f,c);prioritize(id,fresh);input=&fresh;}
  else inheritedCount.fetch_add(1,memory_order_relaxed);
  ExactChoice7 out;out.states.reserve(min(cap,input->size()));vector<int>kept;kept.reserve(min(cap,input->size()));
  size_t n=0;
  for(;n<input->size();n++){
   if((n&255)==0&&stop())return out;
   int opt=(*input)[n];c.options++;if(!f.allowed(ds[id].opts[opt]))continue;
   c.joins++;Graph x;if(!extend(g,ds[id].opts[opt],x))continue;
   if(x.dimension()==g.dimension()){out.redundant=true;exactProbeRedundant++;return out;}
   kept.push_back(opt);out.states.push_back(move(x));exactProbeAccepted++;
   if(out.states.size()>=cap){n++;break;}
  }
  out.capped=n<input->size();
  if(!out.capped){store=move(kept);next=&store;}
  else if(!parent||n-kept.size()>=max<size_t>(8,input->size()/16)){
   store=move(kept);store.insert(store.end(),input->begin()+n,input->end());next=&store;
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
   // With only two components left, the first two field moments
   // determine at most two labelled placements. Validate exact coverage.
   if(left.size()==2){
    int a=left[0],b=left[1];
    auto p=moment7::solve(masks[a],moment7::moment(masks[a]),masks[b],moment7::moment(masks[b]),used,moment7::moment(used));
    for(int i=0;i<p.n;i++){trans[a]=p.x[i][0];trans[b]=p.x[i][1];self(self,moment7::ALL,{});if(stop())return;}
    return;
   }
   if(left.size()==1){
    int a=left[0];auto m=moment7::moment(masks[a]);auto u=moment7::moment(used);
    int t=moment7::md((-u.s-m.s)*moment7::inv[m.n]);
    if(fixed::rot(masks[a],t)==(moment7::ALL^used)){trans[a]=t;self(self,moment7::ALL,{});}
    return;
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


 // Complete small numeric subtrees directly. Branch graph + numeric key
 // suffices for all exact word merges; final pack and check stay authoritative.
 atomic<uint64_t> numericCalls{0},numericComplete{0},numericKeys{0},numericRejected{0},numericTrieNodes{0},numericDfsNodes{0};
 const Trie12& numericTrie()const{static const Trie12 t;return t;}
 bool numericWord(const NumericGraph12&g,const fixed::Key&k,int id,uint64_t&nodes){
  bool supported=false;numericTrie().visit(train[id],g,k,[&](const NumericGraph12&){supported=true;return true;},[&]{return stop();},nodes);return supported;
 }
 struct NumericOptions{vector<NumericGraph12> states;bool redundant=false,capped=false;};
 NumericOptions numericOptions(const NumericGraph12&g,const fixed::Key&k,int id,size_t cap,uint64_t&nodes){
  NumericOptions o;unordered_set<string>seen;
  numericTrie().visit(train[id],g,k,[&](const NumericGraph12&a){
   if(a.comps==g.comps){o.redundant=true;return true;}
   if(seen.insert(a.sig()).second)o.states.push_back(a);
   if(o.states.size()>=cap){o.capped=true;return true;}return false;
  },[&]{return stop();},nodes);return o;
 }
 void numericDfs(const NumericGraph12&g,const fixed::Key&k,vector<int>rem,int budget,GStats&c,uint64_t&nodes,uint64_t&dfsNodes){
  if(stop())return;dfsNodes++;
  if(g.comps<=3||int(rem.size())<=budget){fastPack(g.symbolicForPack(),k,c);return;}
  int pick=-1;NumericOptions best;size_t cap=64;
  for(size_t i=0;i<rem.size();){
   auto d=numericOptions(g,k,rem[i],cap,nodes);if(stop())return;
   if(d.redundant){rem.erase(rem.begin()+i);if(pick>int(i))pick--;continue;}
   if(d.states.empty()){if(!budget)return;budget--;rem.erase(rem.begin()+i);if(pick>int(i))pick--;continue;}
   if(pick<0||d.states.size()<best.states.size()){pick=i;best=move(d);cap=best.states.size();}
   i++;
  }
  if(pick<0){fastPack(g.symbolicForPack(),k,c);return;}
  int id=rem[pick];rem.erase(rem.begin()+pick);
  if(best.capped){best=numericOptions(g,k,id,SIZE_MAX,nodes);if(stop())return;if(best.redundant){numericDfs(g,k,rem,budget,c,nodes,dfsNodes);return;}}
  for(const auto&a:best.states){if(stop())return;numericDfs(a,k,rem,budget,c,nodes,dfsNodes);}
  if(budget)numericDfs(g,k,rem,budget-1,c,nodes,dfsNodes);
 }
 bool numericSubtree(const Graph&g,const vector<int>&rem,int budget,GStats&c){
  int largest=*max_element(g.size.begin(),g.size.end());
  // Sparse key domains in strongly constrained component graphs. Dense
  // domains fall back unchanged to the original symbolic receiver.
  if(g.k.d>3||largest<16||(g.k.d==3&&largest<20))return false;
  numericCalls++;vector<fixed::Key>keys;
  KeySlices12 slices(g);if(!slices.enumerate(g,128,keys,[&]{return stop();}))return stop();
  numericComplete++;numericKeys+=keys.size();uint64_t nodes=0,dfsNodes=0;
  vector<int>order=rem;stable_sort(order.begin(),order.end(),[&](int a,int b){return train[a].size()>train[b].size();});
  for(const auto&k:keys){
   if(stop())break;NumericGraph12 a(g,k);int miss=0;
   for(int id:order){if(!numericWord(a,k,id,nodes)&&++miss>budget)break;if(stop())break;}
   if(stop())break;if(miss>budget){numericRejected++;continue;}
   numericDfs(a,k,rem,budget,c,nodes,dfsNodes);
  }
  numericTrieNodes+=nodes;numericDfsNodes+=dfsNodes;return true;
 }

 // Direct exact all-key completion at <=3 components. The cap is
 // a scheduling guard, never an exclusion: incomplete enumeration falls back.
 bool momentDirect(const Graph&g,GStats&c){
  if(g.comps>3||g.k.d>4)return false;
  momentCalls++;vector<fixed::Key>keys;KeySlices12 slices(g);
  if(!slices.enumerate(g,4096,keys,[&]{return stop();}))return stop();
  momentComplete++;momentKeys+=keys.size();
  for(const auto&k:keys){if(stop())break;fastPack(g,k,c);}
  return true;
 }

 // Enumerate all inclusion-minimal covers of a proved conflict graph
 // within the remaining omission budget. Every true omission set must
 // contain at least one such cover. This is a bounded branch on which
 // words are omitted, not a restriction on their lexical alternatives.
 using ConflictEdge=pair<int,int>;
 vector<uint64_t> covers(const vector<ConflictEdge>&edges,int budget){
  vector<uint64_t> out;
  auto rec=[&](auto&&self,uint64_t mask,int left)->void{
   for(auto [a,b]:edges)if(!(mask>>a&1)&&!(mask>>b&1)){
    if(!left)return;
    self(self,mask|(uint64_t(1)<<a),left-1);
    self(self,mask|(uint64_t(1)<<b),left-1);return;
   }
   out.push_back(mask);
  };
  rec(rec,0,budget);
  sort(out.begin(),out.end(),[](uint64_t a,uint64_t b){int x=__builtin_popcountll(a),y=__builtin_popcountll(b);return x==y?a<b:x<y;});
  vector<uint64_t> minimal;
  for(uint64_t x:out){bool dominated=false;for(uint64_t y:minimal)if((x&y)==y){dominated=true;break;}if(!dominated)minimal.push_back(x);}
  return minimal;
 }
 struct PairDomain2{int id;vector<Graph> states;vector<int> opts;};
 atomic<uint64_t> arcJoins{0},arcRemoved{0},arcForced{0},arcPrunes{0};
 bool pairCoverGate(const Graph&g,vector<int>&rem,int&budget,GFilter&f,GStats&c,DomainPointers&inherited,array<vector<int>,48>&storage){
  // Most useful just after one full lexical join; avoid work in dense
  // carry roots and small numeric/packing subtrees.
  if(!pairCoverEnabled||g.dimension()<14||g.dimension()>18)return false;
  auto start=Clock::now();pairProbeCalls++;
  struct Timer{Clock::time_point t;atomic<uint64_t>&x;~Timer(){x+=chrono::duration_cast<chrono::microseconds>(Clock::now()-t).count();}} timer{start,pairProbeMicroseconds};
  vector<PairDomain2> d;
  for(size_t i=0;i<rem.size();){
   int id=rem[i];const vector<int>*old=inherited[id];
   auto z=exactCachedDomain(g,id,f,65,c,old,storage[id],inherited[id]);
   if(stop())return true;
   if(z.redundant){rem.erase(rem.begin()+i);continue;}
   if(z.capped){i++;continue;}
   if(z.states.empty()){
    if(!budget){pairZeroPrunes++;return true;}
    budget--;rem.erase(rem.begin()+i);continue;
   }
   fixed::require(z.states.size()==storage[id].size(),"exact domain option/state mismatch");
   PairDomain2 a{id,{},{}};unordered_set<string> seen;
   for(size_t j=0;j<z.states.size();j++)if(seen.insert(z.states[j].sig()).second){a.states.push_back(move(z.states[j]));a.opts.push_back(storage[id][j]);}
   d.push_back(move(a));i++;
  }
  sort(d.begin(),d.end(),[](const auto&a,const auto&b){return a.states.size()<b.states.size();});
  if(d.size()>16)d.resize(16);
  pairDomainCount+=d.size();
  // B-omission arc consistency, on a bounded subset of complete domains.
  // If a candidate has no compatible candidate in more than B distinct
  // other domains, no feasible completion supporting it can omit enough.
  size_t m=0;
  while(m<d.size()&&m<12&&d[m].opts.size()<=24)++m;
  if(m>size_t(budget+1)){
   vector<vector<uint8_t>> live(m);
   vector<vector<vector<int8_t>>> memo(m,vector<vector<int8_t>>(m));
   vector<uint8_t> active(m,1);
   for(size_t i=0;i<m;i++){
    live[i].assign(d[i].opts.size(),1);
    for(size_t j=i+1;j<m;j++)memo[i][j].assign(d[i].opts.size()*d[j].opts.size(),-1);
   }
   auto join=[&](size_t i,size_t u,size_t j,size_t v){
    if(i>j){swap(i,j);swap(u,v);}
    auto &z=memo[i][j][u*d[j].opts.size()+v];
    if(z<0){Graph child;arcJoins++;z=extend(d[i].states[u],ds[d[j].id].opts[v],child)?1:0;}
    return z==1;
   };
   bool changed=true;
   while(changed){
    changed=false;
    for(size_t i=0;i<m;i++)if(active[i]){
     for(size_t u=0;u<live[i].size();u++)if(live[i][u]){
      if(stop())return true;
      int missing=0;
      for(size_t j=0;j<m;j++)if(i!=j&&active[j]){
       bool ok=false;
       for(size_t v=0;v<live[j].size();v++)if(live[j][v]&&join(i,u,j,v)){ok=true;break;}
       if(!ok&&++missing>budget)break;
      }
      if(missing>budget){live[i][u]=0;changed=true;arcRemoved++;}
     }
     if(none_of(live[i].begin(),live[i].end(),[](uint8_t x){return x!=0;})){
      if(!budget){arcPrunes++;return true;}
      --budget;active[i]=0;arcForced++;changed=true;
      rem.erase(remove(rem.begin(),rem.end(),d[i].id),rem.end());
     }
    }
   }
   for(size_t i=0;i<m;i++)if(active[i]){
    PairDomain2 keep{d[i].id,{},{}};
    for(size_t u=0;u<live[i].size();u++)if(live[i][u]){
     keep.states.push_back(move(d[i].states[u]));keep.opts.push_back(d[i].opts[u]);
    }
    storage[keep.id]=keep.opts;inherited[keep.id]=&storage[keep.id];
    d[i]=move(keep);
   }else{d[i].states.clear();d[i].opts.clear();}
   d.erase(remove_if(d.begin(),d.end(),[](const auto&x){return x.opts.empty();}),d.end());
  }
  vector<ConflictEdge> edges;
  for(size_t i=0;i<d.size();i++)for(size_t j=i+1;j<d.size();j++){
   bool compatible=false;
   for(const auto&x:d[i].states){
    for(int opt:d[j].opts){
     if(stop())return true;
     Graph child;pairProbeJoins++;
     if(extend(x,ds[d[j].id].opts[opt],child)){compatible=true;break;}
    }
    if(compatible)break;
   }
   if(compatible)continue;
   edges.emplace_back(d[i].id,d[j].id);pairConflicts++;
   if(covers(edges,budget).empty()){pairPrunes++;return true;}
  }
  if(edges.empty())return false;
  auto masks=covers(edges,budget);
  for(uint64_t mask:masks){
   if(stop())return true;
   vector<int> next;for(int id:rem)if(!(mask>>id&1))next.push_back(id);
   pairCoverBranches++;
   fastDfs(g,move(next),budget-__builtin_popcountll(mask),c,inherited);
  }
  return true;
 }

 void fastDfs(const Graph&g,vector<int>rem,int budget,GStats&c,DomainPointers inherited){
  if(stop())return;c.nodes++;
  if(momentDirect(g,c))return;
  if(g.dimension()<=3||int(rem.size())<=budget){fastEnumerate(g,c);return;}
  if(packingBound(g)<=8192){earlyPackCount.fetch_add(1,memory_order_relaxed);fastEnumerate(g,c);return;}
  if(numericSubtree(g,rem,budget,c))return;
  GFilter f(g);if(f.saturated)return;
  array<vector<int>,48> pairStorage;
  if(pairCoverGate(g,rem,budget,f,c,inherited,pairStorage))return;
  if(rem.empty()||int(rem.size())<=budget){fastEnumerate(g,c);return;}
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
  // Use a bounded exact MRV/zero-domain probe only after the first
  // long-word join. If every nonempty domain reaches the cap, fall
  // back to the original relaxed MRV using safe inherited supersets.
  array<vector<int>,48> exactStorage;
  if(exactMrvEnabled&&g.dimension()<=18){
   int chosen=-1;size_t exactCap=128;vector<Graph>children;
   for(int i=0;i<ntry;){
    int id=rem[i];const vector<int>*old=inherited[id];
    auto d=exactCachedDomain(g,id,f,exactCap,c,old,exactStorage[id],inherited[id]);
    if(stop())return;
    if(d.redundant||(!d.capped&&d.states.empty())){
     if(!d.redundant){exactProbeZero++;if(!budget)return;budget--;}
     rem.erase(rem.begin()+i);ntry--;if(chosen>i)chosen--;continue;
    }
    if(!d.capped&&(chosen<0||d.states.size()<exactCap)){
     chosen=i;children=move(d.states);exactCap=children.size();
    }
    i++;
   }
   if(chosen>=0){
    exactProbeSelected++;rem.erase(rem.begin()+chosen);unordered_set<string>seen;
    for(auto&x:children){if(stop())return;if(seen.insert(x.sig()).second)fastDfs(x,rem,budget,c,inherited);}
    if(budget)fastDfs(g,rem,budget-1,c,inherited);
    return;
   }
   if(rem.empty()||int(rem.size())<=budget){fastEnumerate(g,c);return;}
   exactProbeFallback++;
   ntry=min<int>(rem.size(),g.dimension()>20?5:g.dimension()>12?8:16);
  }
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
  vector<size_t>schedule(seedEnd-seedStart);iota(schedule.begin(),schedule.end(),seedStart);
  if(frequencyOrderEnabled)stable_sort(schedule.begin(),schedule.end(),[&](size_t a,size_t b){return seedPrior[a]>seedPrior[b];});
  unsigned n=max(1u,min(4u,thread::hardware_concurrency()));vector<GStats>stats(n);vector<thread>pool;
  for(unsigned t=0;t<n;t++)pool.emplace_back([&,t]{
   auto&c=stats[t];while(!stop()){
    size_t q=next.fetch_add(1);if(q>=seedEnd)break;size_t i=schedule[q-seedStart];
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
  cout<<"FAST SEARCH found="<<found<<" timed="<<timed<<" seeds="<<done<<"/"<<(seedEnd-seedStart)<<" nodes="<<total.nodes<<" joins="<<total.joins<<" keys="<<total.keyTests<<" packing="<<total.packNodes<<" permutations="<<total.perms<<" features="<<total.features<<" options="<<total.options<<" inherited="<<inheritedCount<<" early_pack="<<earlyPackCount<<" pair_probe_calls="<<pairProbeCalls<<" pair_domains="<<pairDomainCount<<" pair_conflicts="<<pairConflicts<<" pair_prunes="<<pairPrunes<<" pair_branches="<<pairCoverBranches<<" pair_zero_prunes="<<pairZeroPrunes<<" pair_joins="<<pairProbeJoins<<" pair_us="<<pairProbeMicroseconds<<" exact_probe_calls="<<exactProbeCalls<<" exact_probe_zero="<<exactProbeZero<<" exact_probe_redundant="<<exactProbeRedundant<<" exact_probe_selected="<<exactProbeSelected<<" exact_probe_fallback="<<exactProbeFallback<<" exact_probe_accepted="<<exactProbeAccepted<<" moment_calls="<<momentCalls<<" moment_complete="<<momentComplete<<" moment_keys="<<momentKeys<<" numeric_calls="<<numericCalls<<" numeric_complete="<<numericComplete<<" numeric_keys="<<numericKeys<<" numeric_rejected="<<numericRejected<<" numeric_trie_nodes="<<numericTrieNodes<<" numeric_dfs_nodes="<<numericDfsNodes<<" OOV="<<answerOov<<endl;
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
#ifndef LP2_MOMENT_COMPLETION_NO_MAIN
struct OovPlant {
 vector<string> train,held,truthTrain,truthHeld;
 string carryCipher,carryPrefixCipher,truthCarry;
 fixed::Perm pi{};
 fixed::Key key{};
};
string randomGpWord(mt19937&rng,int n){
 uniform_int_distribution<int> pick(0,N-1);string w;w.reserve(n);
 for(int i=0;i<n;i++)w+=fixed::SYM[pick(rng)];
 return w;
}
OovPlant makeOovPlant(const vector<string>&shape,const vector<string>&holdShape,uint32_t seed){
 fixed::require(shape.size()==47&&holdShape.size()==16,"matched profile shape");
 mt19937 rng(seed);OovPlant p;
 iota(p.pi.begin(),p.pi.end(),0);shuffle(p.pi.begin()+1,p.pi.end(),rng);
 uniform_int_distribution<int> pickKey(0,N-1),pickPhase(0,Q-1);
 for(int j=0;j<Q;j++)p.key[j]=pickKey(rng);
 p.key[0]=1;p.key[4]=2;p.key[3]=0;
 auto trueMaps=fixed::maps(p.pi,p.key);
 auto choose=[&](int n){
  const auto&v=fixed::by[n];fixed::require(!v.empty(),"empty dictionary bucket "+to_string(n));
  uniform_int_distribution<size_t> pick(0,v.size()-1);return v[pick(rng)];
 };
 for(int i=0;i<47;i++){
  int n=shape[i].size();string w,c;
  if(i==12||i==43){
   for(int attempt=0;attempt<100000;attempt++){
    w=randomGpWord(rng,n);if(fixed::dict.count(w))continue;
    c=fixed::encode(w,p.pi,p.key,pickPhase(rng));
    if(!fixed::support(c,trueMaps,fixed::dict))break;
    w.clear();c.clear();
   }
   fixed::require(!w.empty()&&!c.empty(),"could not plant genuinely unsupported OOV group");
  }else{
   w=choose(n);c=fixed::encode(w,p.pi,p.key,pickPhase(rng));
  }
  p.truthTrain.push_back(w);p.train.push_back(c);
 }
 for(int attempt=0;attempt<100000;attempt++){
  string w=randomGpWord(rng,11);
  if(fixed::dict.count(w))continue;
  string prefix=w.substr(0,10);
  if(fixed::prefixDict.count(prefix))continue;
  string c=fixed::encode(w,p.pi,p.key,pickPhase(rng));
  string cp=c.substr(0,10);
  if(fixed::support(cp,trueMaps,fixed::prefixDict))continue;
  p.truthCarry=w;p.carryCipher=c;p.carryPrefixCipher=cp;break;
 }
 fixed::require(!p.truthCarry.empty()&&p.truthCarry.size()==11,"could not plant absent carry prefix");
 for(const auto&c:holdShape){
  string w=choose(c.size());p.truthHeld.push_back(w);p.held.push_back(fixed::encode(w,p.pi,p.key,pickPhase(rng)));
 }
 return p;
}
size_t rawAnchorOptions(const string&c,const vector<string>&words){
 unordered_set<string>seen;
 for(const auto&w:words){
  int canonical=-1,consumed=0;
  for(size_t i=0;i<w.size();i++){
   int p=fixed::val(w[i]),x=fixed::val(c[i]);if(!p)continue;
   if(p!=x){canonical=(Q-consumed%Q)%Q;break;}consumed++;
  }
  for(int start=0;start<Q;start++){
   if(canonical>=0&&start!=canonical)continue;
   GOption o;int j=start;bool ok=true;
   for(size_t i=0;i<w.size();i++){
    int p=fixed::val(w[i]),x=fixed::val(c[i]);
    if(!p){if(x){ok=false;break;}continue;}
    if(j==0&&p==x){ok=false;break;}
    for(int t=0;t<o.n;t++){
     auto e=o.e[t];
     if(e.j==j&&((e.c==x)!=(e.p==p))){ok=false;break;}
     if(e.j==j&&((e.c==e.p)!=(x==p))){ok=false;break;}
    }
    if(!ok)break;
    o.e[o.n++]={uint8_t(x),uint8_t(p),uint8_t(j)};
    o.f[i]=j*N+p;j=(j+1)%Q;
   }
   if(!ok)continue;
   array<uint16_t,16>ids{};
   for(int t=0;t<o.n;t++){auto e=o.e[t];ids[t]=(e.c*N+e.p)*Q+e.j;}
   sort(ids.begin(),ids.begin()+o.n);
   auto z=unique(ids.begin(),ids.begin()+o.n);
   string sig((char*)ids.data(),2*(z-ids.begin()));
   seen.insert(move(sig));
  }
 }
 return seen.size();
}
bool containsTrueAction(const Graph&g,const fixed::Perm&pi,const fixed::Key&k){
 Vec params{};
 for(int i=0;i<g.k.d;i++)params[i]=uint8_t(k[g.k.vars[i]]);
 if(g.k.evaluate(params)!=k)return false;
 for(int x=0;x<N;x++){
  int v=0;for(int j=0;j<Q;j++)v+=g.off[x][j]*k[j];v%=N;
  if(fixed::md(pi[x]-pi[g.r[x]])!=v)return false;
 }
 return true;
}
void baseRegisterOnly(){
 fixed::dictionary();
 string fixture=fixed::read("im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json");
 istringstream add(fixed::field(fixture,"added"));string w;size_t removed=0;
 while(add>>w)removed+=fixed::dict.erase(w);
 for(auto&v:fixed::by)v.clear();fixed::prefixDict.clear();
 for(const auto&word:fixed::dict){
  fixed::require(word.size()<fixed::by.size(),"dictionary word too long");
  fixed::by[word.size()].push_back(word);
  if(word.size()==11)fixed::prefixDict.insert(word.substr(0,10));
 }
 for(auto&v:fixed::by)sort(v.begin(),v.end());
 fixed::require(removed==28&&fixed::dict.size()==38910,"base dictionary reconstruction");
 cout<<"BASE REGISTER words="<<fixed::dict.size()<<" removed_fixture_additions="<<removed
     <<" prefixes="<<fixed::prefixDict.size()<<endl;
}
int main(int argc,char**argv){try{
 int seconds=180;uint32_t seed=0x59d2a638u;
 for(int i=1;i<argc;i++){
  string arg=argv[i];
  if(arg=="--seconds"){if(++i>=argc)throw runtime_error("missing seconds");seconds=stoi(argv[i]);}
  else if(arg=="--seed"){if(++i>=argc)throw runtime_error("missing seed");seed=uint32_t(stoul(argv[i]));}
  else throw runtime_error("unknown argument: "+arg);
 }
 fixed::require(seconds>0,"seconds must be positive");
 aff::init();baseRegisterOnly();regression();
 string src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");
 auto body=fixed::strings(src,"body_groups",src.find("\"heading_groups\": ["));
 auto p55=fixed::strings(src,"groups",src.rfind("\"p55\""));
 fixed::require(body.size()==48&&body.back()=="63g2eis46q"&&p55.size()==17&&p55[0]=="l","source profile");
 vector<string>shape(body.begin(),body.end()-1),holdShape(p55.begin()+1,p55.end());
 size_t runes=0,heldRunes=0;for(const auto&w:shape)runes+=w.size();for(const auto&w:holdShape)heldRunes+=w.size();
 fixed::require(runes==213&&heldRunes==75,"matched 47-group / 16-holdout profile");
 OovPlant p=makeOovPlant(shape,holdShape,seed);
 bool carryPrefixAbsent=!fixed::prefixDict.count(p.truthCarry.substr(0,10));
 fixed::require(carryPrefixAbsent,"carry prefix unexpectedly in base register");
 cout<<"PLANT seed="<<seed<<" groups="<<p.train.size()<<" runes="<<runes
     <<" oov=12,43 carry_prefix_absent="<<carryPrefixAbsent
     <<" holdouts="<<p.held.size()<<" held_runes="<<heldRunes<<endl;

 // GSearch's legacy constructor is used only to initialize its reusable
 // graph/filter infrastructure; replace its 48-group carry profile entirely.
 FastSearch s;
 s.train=p.train;s.ds.clear();s.order.clear();s.seeds.clear();s.maxOov=3;
 for(const auto&w:fixed::dict)for(char ch:w)fixed::require(fixed::SYM.find(ch)!=string::npos,"invalid base-register glyph");
 for(const auto&w:p.train)for(char ch:w)fixed::require(fixed::SYM.find(ch)!=string::npos,"invalid control-cipher glyph");
 cout<<"DOMAIN_BUILD start"<<endl;
 for(int i=0;i<47;i++){
  s.ds.push_back(makeGDomain(s.train[i],fixed::by[s.train[i].size()],s.base,false));
  s.order.push_back(i);
 }
 cout<<"DOMAIN_BUILD done"<<endl;
 sort(s.order.begin(),s.order.end(),[&](int a,int b){
  auto score=[&](int i){return log2(double(max<size_t>(1,s.ds[i].opts.size())))/s.train[i].size();};
  double x=score(a),y=score(b);return x==y?a<b:x<y;
 });

 vector<vector<string>>anchorSigs(47);
 vector<size_t>raw(47),valid(47),distinct(47);
 for(int i=0;i<47;i++){
  const auto&words=fixed::by[s.train[i].size()];
  raw[i]=rawAnchorOptions(s.train[i],words);
  GDomain a=makeGDomain(s.train[i],words,s.base,true);valid[i]=a.opts.size();
  unordered_set<string>seen;
  for(const auto&o:a.opts){Graph g;if(extend(s.base,o,g))seen.insert(g.sig());}
  anchorSigs[i].assign(seen.begin(),seen.end());distinct[i]=seen.size();
 }
 vector<int>selected;unordered_set<string>unionSigs;
 for(int step=0;step<4;step++){
  int best=-1;size_t bestMarginal=SIZE_MAX;
  for(int i=0;i<47;i++){
   if(find(selected.begin(),selected.end(),i)!=selected.end())continue;
   size_t marginal=0;for(const auto&sig:anchorSigs[i])if(!unionSigs.count(sig))marginal++;
   bool better=best<0||marginal<bestMarginal;
   if(!better&&marginal==bestMarginal){
    if(raw[i]!=raw[best])better=raw[i]<raw[best];
    else if(valid[i]!=valid[best])better=valid[i]<valid[best];
    else if(shape[i].size()!=shape[best].size())better=shape[i].size()>shape[best].size();
    else better=i<best;
   }
   if(better){best=i;bestMarginal=marginal;}
  }
  fixed::require(best>=0,"anchor selector exhausted");
  selected.push_back(best);
  for(const auto&sig:anchorSigs[best])unionSigs.insert(sig);
  cout<<"ANCHOR step="<<step<<" id="<<best<<" marginal="<<bestMarginal
      <<" raw="<<raw[best]<<" valid="<<valid[best]<<" distinct="<<distinct[best]<<endl;
 }

 struct SeedRec{Graph g;int anchor;string sig;};
 unordered_map<string,SeedRec>seedMap;
 for(int id:selected){
  GDomain a=makeGDomain(s.train[id],fixed::by[s.train[id].size()],s.base,true);
  for(const auto&o:a.opts){
   Graph g;if(!extend(s.base,o,g))continue;string sig=g.sig();
   if(!seedMap.count(sig))seedMap.emplace(sig,SeedRec{g,id,sig});
  }
 }
 fixed::require(seedMap.size()==unionSigs.size(),"anchor union reconstruction mismatch");
 vector<SeedRec>seedRecords;seedRecords.reserve(seedMap.size());
 for(auto&kv:seedMap)seedRecords.push_back(move(kv.second));
 sort(seedRecords.begin(),seedRecords.end(),[](const SeedRec&a,const SeedRec&b){
  if(a.g.dimension()!=b.g.dimension())return a.g.dimension()<b.g.dimension();
  return a.sig<b.sig;
 });
 vector<int>seedAnchors;seedAnchors.reserve(seedRecords.size());
 for(auto&r:seedRecords){s.seeds.push_back(move(r.g));seedAnchors.push_back(r.anchor);}
 size_t trueSeeds=0;for(const auto&g:s.seeds)if(containsTrueAction(g,p.pi,p.key))trueSeeds++;
 cout<<"MINUNION anchors=";for(int i:selected)cout<<" "<<i;
 cout<<" seeds="<<s.seeds.size()<<" true_seeds="<<trueSeeds<<endl;
 fixed::require(trueSeeds>0,"selected anchor union lost planted action");

 cacheRegression(s);
 pairCoverEnabled=true;exactMrvEnabled=false;frequencyOrderEnabled=false;
 s.found=false;s.timed=false;s.next=0;s.done=0;
 s.deadline=Clock::now()+chrono::seconds(seconds);
 unsigned threads=max(1u,min(4u,thread::hardware_concurrency()));
 vector<GStats>stats(threads);vector<thread>pool;
 for(unsigned t=0;t<threads;t++)pool.emplace_back([&,t]{
  auto&c=stats[t];
  while(!s.stop()){
   size_t id=s.next.fetch_add(1);if(id>=s.seeds.size())break;
   vector<int>rem=s.order;int anchor=seedAnchors[id];
   rem.erase(remove(rem.begin(),rem.end(),anchor),rem.end());
   DomainPointers inherited{};
   s.fastDfs(s.seeds[id],move(rem),s.maxOov,c,inherited);
   if(!s.found&&!s.timed)s.done++;
  }
 });
 for(auto&t:pool)t.join();
 GStats total;for(const auto&c:stats){
  total.nodes+=c.nodes;total.joins+=c.joins;total.perms+=c.perms;
  total.keyTests+=c.keyTests;total.packNodes+=c.packNodes;
  total.features+=c.features;total.options+=c.options;
 }
 bool found=s.found.load(),timed=s.timed.load(),exact=false,carryHit=false;
 int trainHit=0,holdHit=0,holdUnique=0;
 if(found){
  exact=equalAction(p.pi,p.key,s.answer,s.answerKey);
  auto m=fixed::maps(s.answer,s.answerKey);
  for(size_t i=0;i<p.train.size();i++){
   auto d=fixed::decode(p.train[i],m,fixed::dict);
   trainHit+=d.count(p.truthTrain[i]);
  }
  unordered_set<string>carryTruth{p.truthCarry.substr(0,10)};
  carryHit=fixed::support(p.carryPrefixCipher,m,carryTruth);
  for(size_t i=0;i<p.held.size();i++){
   auto d=fixed::decode(p.held[i],m,fixed::dict);
   holdHit+=d.count(p.truthHeld[i]);
   holdUnique+=(d.size()==1&&d.count(p.truthHeld[i]));
  }
 }
 bool passed=found&&exact&&s.answerOov==2&&trainHit==45&&holdHit==16&&carryHit&&carryPrefixAbsent&&trueSeeds>0;
 cout<<"OOVSAFE SEARCH found="<<found<<" timed="<<timed<<" done="<<s.done<<"/"<<s.seeds.size()
     <<" nodes="<<total.nodes<<" joins="<<total.joins<<" keys="<<total.keyTests
     <<" packing="<<total.packNodes<<" perms="<<total.perms
     <<" features="<<total.features<<" options="<<total.options
     <<" pair_probe_calls="<<s.pairProbeCalls<<" pair_domains="<<s.pairDomainCount
     <<" pair_conflicts="<<s.pairConflicts<<" pair_prunes="<<s.pairPrunes
     <<" pair_branches="<<s.pairCoverBranches<<" pair_zero_prunes="<<s.pairZeroPrunes
     <<" arc_joins="<<s.arcJoins<<" arc_removed="<<s.arcRemoved<<" arc_forced="<<s.arcForced<<" arc_prunes="<<s.arcPrunes<<" pair_joins="<<s.pairProbeJoins<<" pair_us="<<s.pairProbeMicroseconds
     <<" moment_calls="<<s.momentCalls<<" moment_complete="<<s.momentComplete
     <<" moment_keys="<<s.momentKeys<<" numeric_calls="<<s.numericCalls
     <<" numeric_complete="<<s.numericComplete<<" numeric_keys="<<s.numericKeys
     <<" numeric_rejected="<<s.numericRejected<<" numeric_trie_nodes="<<s.numericTrieNodes
     <<" numeric_dfs_nodes="<<s.numericDfsNodes<<" answer_oov="<<s.answerOov
     <<" exact="<<exact<<" train_truth="<<trainHit<<"/47"
     <<" hold_truth="<<holdHit<<"/16"<<" hold_unique="<<holdUnique
     <<" carry_prefix_truth="<<carryHit<<" passed="<<passed<<endl;
 if(found){cout<<"ANSWER pi";for(int x:s.answer)cout<<" "<<x;cout<<" key";for(int x:s.answerKey)cout<<" "<<x;cout<<endl;}

 ostringstream out;
 out<<"{\"mode\":\"oov-safe-minunion-budget-arc\",\"seed\":"<<seed
    <<",\"dictionary_size\":"<<fixed::dict.size()<<",\"groups\":47,\"runes\":213"
    <<",\"oov_ids\":[12,43],\"carry_prefix_absent\":"<<(carryPrefixAbsent?"true":"false")
    <<",\"anchors\":[";
 for(size_t i=0;i<selected.size();i++){if(i)out<<",";out<<selected[i];}
 out<<"],\"seed_count\":"<<s.seeds.size()<<",\"true_seeds\":"<<trueSeeds
    <<",\"done\":"<<s.done.load()<<",\"found\":"<<(found?"true":"false")
    <<",\"timed\":"<<(timed?"true":"false")<<",\"passed\":"<<(passed?"true":"false")
    <<",\"answer_oov\":"<<s.answerOov<<",\"exact\":"<<(exact?"true":"false")
    <<",\"train_truth\":"<<trainHit<<",\"hold_truth\":"<<holdHit
    <<",\"hold_unique\":"<<holdUnique<<",\"carry_prefix_truth\":"<<(carryHit?"true":"false")
    <<",\"nodes\":"<<total.nodes<<",\"joins\":"<<total.joins
    <<",\"pair_probe_calls\":"<<s.pairProbeCalls<<",\"pair_conflicts\":"<<s.pairConflicts
    <<",\"pair_prunes\":"<<s.pairPrunes<<",\"pair_branches\":"<<s.pairCoverBranches
    <<",\"pair_zero_prunes\":"<<s.pairZeroPrunes<<",\"pair_joins\":"<<s.pairProbeJoins
    <<",\"pair_us\":"<<s.pairProbeMicroseconds<<",\"arc_joins\":"<<s.arcJoins<<",\"arc_removed\":"<<s.arcRemoved<<",\"arc_forced\":"<<s.arcForced<<",\"arc_prunes\":"<<s.arcPrunes<<"}";
 const char*output=getenv("SFT_OUTPUT");if(output&&*output){ofstream f(output);if(f)f<<out.str()<<endl;}
 return 0;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
#endif
