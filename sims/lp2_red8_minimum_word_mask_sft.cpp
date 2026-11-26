// Shared affine inverse over all minimum printed-word reset histories.
// Intersect path masks before joining lexical equations; no original p55
// enters the training search. Independent planted clocks are hidden.
#define main previous_minimum_line_main
#include "lp2_red8_minimum_line_reset_sft.cpp"
#undef main
using Mask=bitset<128>;
struct WordOption{aff::Option eq;Mask paths;array<uint16_t,16> feature{};};
struct Posting{int feature;vector<int> ids;vector<uint64_t> bits;};
struct WordDomain{vector<WordOption> opts;vector<vector<Posting>> post;};
struct Stats{uint64_t nodes=0,joins=0,perms=0,options=0,features=0,clockPrunes=0;};
struct MaskSearch{
 const vector<string>&groups;const vector<Path>&paths;string cipher;aff::Space base=aff::base();
 vector<WordDomain> ds;vector<int> order;Mask all;int budget;Clock::time_point deadline;
 atomic<bool>found{false},timed{false};atomic<size_t>next{0},done{0};size_t seedCount=0;mutex out;Pi answer{};int chosenPath=-1,oov=-1;Stats total;
 MaskSearch(const vector<string>&g,const vector<Path>&p,int b):groups(g),paths(p),cipher(join(g)),budget(b){
  fixed::require(!p.empty()&&p.size()<=128,"path mask capacity");for(size_t i=0;i<p.size();i++)all.set(i);
  vector<string>pre(fixed::prefixDict.begin(),fixed::prefixDict.end());sort(pre.begin(),pre.end());
  size_t at=0;for(int g=0;g<int(groups.size());g++){
   auto&c=groups[g];map<vector<int>,Mask> slices;for(size_t i=0;i<p.size();i++){
    vector<int> k(p[i].key.begin()+at,p[i].key.begin()+at+c.size());slices[k].set(i);
   }
   WordDomain d;unordered_map<string,int> seen;auto&lex=g==47?pre:fixed::by[c.size()];
   for(auto&[ks,m]:slices)for(auto&w:lex){
    WordOption o;o.paths=m;bool ok=true;
    for(size_t i=0;i<c.size();i++){
     int a=fixed::val(w[i]),x=fixed::val(c[i]),k=ks[i];
     if(k<0){if(a){ok=false;break;}continue;}
     if(!a||a==x||x==k){ok=false;break;}
     o.eq.e[o.eq.n++]={uint8_t(x),uint8_t(a),uint8_t(k)};o.feature[i]=k*29+a;
    }
    if(!ok)continue;aff::Space t;if(!aff::apply(base,o.eq,t))continue;
    string sig=signature(t);auto it=seen.find(sig);if(it==seen.end()){seen.emplace(move(sig),d.opts.size());d.opts.push_back(move(o));}else d.opts[it->second].paths|=m;
   }
   d.post.resize(c.size());for(size_t i=0;i<c.size();i++){
    map<int,vector<int>> m;for(int j=0;j<int(d.opts.size());j++)m[d.opts[j].feature[i]].push_back(j);
    for(auto&[k,v]:m){Posting p{k,move(v),{}};if(p.ids.size()>=64){p.bits.assign((d.opts.size()+63)/64,0);for(int id:p.ids)p.bits[id/64]|=uint64_t(1)<<(id%64);}d.post[i].push_back(move(p));}
   }
   ds.push_back(move(d));if(g!=47)order.push_back(g);at+=c.size();
  }
  sort(order.begin(),order.end(),[&](int a,int b){auto f=[&](int x){return log2(double(max<size_t>(1,ds[x].opts.size())))/groups[x].size();};double x=f(a),y=f(b);return x==y?a<b:x<y;});
 }
 bool stop(){if(found||timed)return true;if(Clock::now()>=deadline){timed=true;return true;}return false;}
 vector<int> domain(int g,aff::Filter&f,const Mask&m,size_t cap,Stats&c){
  const auto&d=ds[g];struct Choice{size_t count=0;vector<const Posting*>lists;};vector<Choice>choices;
  for(size_t pos=0;pos<d.post.size();pos++){
   Choice q;for(auto&p:d.post[pos]){c.features++;int k=p.feature/29,a=p.feature%29;if(a&&!(f.mask(fixed::val(groups[g][pos]),k)&(1u<<a)))continue;q.count+=p.ids.size();q.lists.push_back(&p);}
   if(!q.count)return {};choices.push_back(move(q));
  }
  sort(choices.begin(),choices.end(),[](auto&a,auto&b){return a.count<b.count;});
  vector<int> ids;auto test=[&](int id){c.options++;auto&o=d.opts[id];if((o.paths&m).any()&&f.allowed(o.eq))ids.push_back(id);return ids.size()>=cap;};
  if(choices[0].count<=128||choices.size()==1){for(auto*p:choices[0].lists)for(int id:p->ids)if(test(id))return ids;return ids;}
  size_t n=(d.opts.size()+63)/64;vector<uint64_t>bits(n),scratch(n);
  auto add=[&](vector<uint64_t>&v,const Choice&q){for(auto*p:q.lists){if(p->bits.empty()){for(int id:p->ids)v[id/64]|=uint64_t(1)<<(id%64);}else for(size_t i=0;i<n;i++)v[i]|=p->bits[i];}};
  add(bits,choices[0]);for(size_t pos=1;pos<min<size_t>(3,choices.size());pos++){if(choices[pos].count==d.opts.size())continue;fill(scratch.begin(),scratch.end(),0);add(scratch,choices[pos]);bool any=false;for(size_t i=0;i<n;i++){bits[i]&=scratch[i];any|=bits[i]!=0;}if(!any)return {};}
  for(size_t i=0;i<n;i++){uint64_t b=bits[i];while(b){int k=__builtin_ctzll(b);b&=b-1;if(test(int(i*64+k)))return ids;}}return ids;
 }
 void check(const Pi&pi,const Mask&m,Stats&c){
  c.perms++;for(size_t i=0;i<paths.size();i++)if(m[i]){
   auto w=split(decode(cipher,paths[i],pi),groups);if(!fixed::prefixDict.count(w.back()))continue;
   int n=0;for(int g:order)if(!fixed::dict.count(w[g]))n++;if(n>budget)continue;
   lock_guard<mutex> lock(out);if(!found){answer=pi;chosenPath=i;oov=n;found=true;}return;
  }
 }
 void enumerate(const aff::Space&s,const Mask&m,Stats&c){
  vector<vector<int>> rows(s.d);array<uint8_t,29>param{};uint32_t used=0;Pi pi{};
  for(int x=0;x<29;x++){int j=s.d-1;while(j>=0&&!s.a[x][j])j--;if(j<0){int v=s.a[x][aff::L];if(used&(1u<<v))return;used|=1u<<v;pi[x]=v;}else rows[j].push_back(x);}
  auto rec=[&](auto&&self,int j,uint32_t mask)->void{if(stop())return;if(j==s.d){check(pi,m,c);return;}for(int v=0;v<29;v++){if(mask&(1u<<v))continue;param[j]=v;uint32_t z=mask;bool ok=true;for(int x:rows[j]){int a=s.a[x][aff::L];for(int k=0;k<=j;k++)a+=param[k]*s.a[x][k];a%=29;if(z&(1u<<a)){ok=false;break;}z|=1u<<a;pi[x]=a;}if(ok)self(self,j+1,z);if(stop())return;}};rec(rec,0,used);
 }
 void dfs(const aff::Space&s,vector<int> rem,int b,Mask m,Stats&c){
  if(stop()||m.none())return;c.nodes++;if(s.d<=3||int(rem.size())<=b){enumerate(s,m,c);return;}
  if(s.d>24){enumerate(s,m,c);return;}aff::Filter f(s);if(f.saturated)return;
  vector<vector<int>> domains(groups.size());bool full=s.d<=10;
  if(full){array<int,128> misses{};for(int g:rem){auto&ids=domains[g];ids=domain(g,f,m,SIZE_MAX,c);Mask support;for(int id:ids)support|=ds[g].opts[id].paths;for(size_t i=0;i<paths.size();i++)if(m[i]&&!support[i]&&++misses[i]>b)m.reset(i);if(m.none()){c.clockPrunes++;return;}}}
  int pick=-1;vector<int>best;size_t cap=SIZE_MAX;int ntry=full?int(rem.size()):min<int>(rem.size(),s.d>16?6:12);
  for(int i=0;i<ntry;){int g=rem[i];vector<int>d;if(full){for(int id:domains[g])if((ds[g].opts[id].paths&m).any()){d.push_back(id);if(d.size()>=cap)break;}}else d=domain(g,f,m,cap,c);
   if(d.empty()){if(!b)return;b--;rem.erase(rem.begin()+i);ntry--;if(pick>i)pick--;continue;}if(pick<0||d.size()<cap){pick=i;best=move(d);cap=best.size();}i++;
  }
  if(pick<0){enumerate(s,m,c);return;}int g=rem[pick];rem.erase(rem.begin()+pick);unordered_set<string>seen;
  for(int id:best){if(stop())return;auto&o=ds[g].opts[id];Mask n=m&o.paths;if(n.none())continue;aff::Space t;c.joins++;if(!aff::apply(s,o.eq,t))continue;string sig=signature(t)+n.to_string();if(seen.insert(sig).second)dfs(t,rem,b,n,c);}
  if(b)dfs(s,rem,b-1,m,c);
 }
 void run(int seconds){
  vector<pair<aff::Space,Mask>> seeds;for(auto&o:ds[47].opts){aff::Space t;if(aff::apply(base,o.eq,t))seeds.emplace_back(t,o.paths);}
  sort(seeds.begin(),seeds.end(),[](auto&a,auto&b){return a.first.d==b.first.d?signature(a.first)<signature(b.first):a.first.d<b.first.d;});seedCount=seeds.size();deadline=Clock::now()+chrono::seconds(seconds);
  cout<<"MASK CARRY paths="<<paths.size()<<" seeds="<<seedCount<<" domains";for(int g:order)cout<<" "<<g<<":"<<ds[g].opts.size();cout<<endl;
  unsigned n=max(1u,min(4u,thread::hardware_concurrency()));vector<Stats> stats(n);vector<thread>pool;for(unsigned t=0;t<n;t++)pool.emplace_back([&,t]{while(!stop()){size_t i=next.fetch_add(1);if(i>=seeds.size())break;dfs(seeds[i].first,order,budget,seeds[i].second,stats[t]);if(!found&&!timed)done++;}});
  for(auto&t:pool)t.join();for(auto&c:stats){total.nodes+=c.nodes;total.joins+=c.joins;total.perms+=c.perms;total.options+=c.options;total.features+=c.features;total.clockPrunes+=c.clockPrunes;}
  cout<<"MASK SEARCH found="<<found<<" timed="<<timed<<" seeds="<<done<<"/"<<seedCount<<" nodes="<<total.nodes<<" joins="<<total.joins<<" perms="<<total.perms<<" optionTests="<<total.options<<" featureTests="<<total.features<<" clockPrunes="<<total.clockPrunes<<" OOV="<<oov<<" path="<<chosenPath<<endl;
 }
};
// Blind planted clock: reset at two actual word boundaries. Select the first
// seed-conditioned plant with <=4 visible F and min reset count exactly two;
// structural conditioning is independent of key-recovery performance.
Plant wordPlant(const vector<string>&shape,const vector<string>&held,unsigned seed){
 mt19937 rng(seed);Plant p;for(int i=0;i<29;i++)p.pi[i]=i;shuffle(p.pi.begin()+1,p.pi.end(),rng);int u=aff::inv[p.pi[19]];for(auto&x:p.pi)x=aff::mul[x][u];auto ip=inverse(p.pi);
 auto choose=[&](int n){auto&v=fixed::by[n];return v[rng()%v.size()];};for(int i=0;i<47;i++)p.truth.push_back(choose(shape[i].size()));string carry=choose(11);p.truth.push_back(carry.substr(0,10));p.holdTruth.push_back(carry);for(size_t i=1;i<held.size();i++)p.holdTruth.push_back(choose(held[i].size()));
 string plain=join(p.truth)+carry.substr(10);for(size_t i=1;i<p.holdTruth.size();i++)plain+=p.holdTruth[i];auto B=boundaries(shape);set<int> resets{B[10],B[29]};string c;int j=rng()%8;p.path.start=j;
 for(size_t i=0;i<plain.size();i++){if(resets.count(i)){j=(j+1+rng()%7)%8;p.path.reset.push_back(i);}int a=fixed::val(plain[i]);if(i<223)p.path.key.push_back(a?K[j]:-1);if(a){c+=fixed::SYM[ip[(p.pi[a]+p.pi[K[j]])%29]];j=(j+1)%8;}else c+='0';if(i==222)p.path.end=j;}
 p.train=split(c.substr(0,223),shape);p.held=split(c.substr(223),held);return p;
}
bool gate(const vector<string>&shape,const vector<string>&held,unsigned base){
 for(unsigned attempt=0;attempt<2000;attempt++){
  auto p=wordPlant(shape,held,base+attempt*10007);string c=join(p.train);if(count(c.begin(),c.end(),'0')>4)continue;
  auto paths=schedules(c,boundaries(shape));if(paths.cost!=2||paths.paths.size()>128)continue;
  fixed::require(any_of(paths.paths.begin(),paths.paths.end(),[&](auto&q){return q.key==p.path.key&&q.end==p.path.end;}),"true path omitted");
  cout<<"MASK PLANT seed="<<base+attempt*10007<<" attempt="<<attempt<<" paths="<<paths.paths.size()<<endl;
  MaskSearch s(p.train,paths.paths,0);s.run(360);bool exact=s.found&&s.answer==p.pi;bool hold=false;
  if(exact){auto&w=paths.paths[s.chosenPath];auto d=split(decode(c,w,s.answer),shape);auto h=holdout(p.held,d.back(),s.answer,w.end);hold=d==p.truth&&find(h.begin(),h.end(),p.holdTruth)!=h.end();}
  cout<<"MASK CONTROL "<<base<<" exact="<<exact<<" hold="<<hold<<endl;return exact&&hold;
 }
 cout<<"MASK CONTROL "<<base<<" no structural plant"<<endl;return false;
}
int main(){try{
 aff::init();fixed::dictionary();auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");
 auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": [")),held=fixed::strings(src,"groups",src.rfind("\"p55\""));
 fixed::require(train.size()==48&&join(train).size()==223&&held.size()==17&&join(held).size()==76,"profile");auto paths=schedules(join(train),boundaries(train));fixed::require(paths.cost==2&&paths.paths.size()==85,"word minimum");
 bool a=gate(train,held,3301),b=gate(train,held,1033);if(!a||!b){cout<<"MASK ORIGINAL GATED OFF"<<endl;return 2;}
 MaskSearch s(train,paths.paths,3);s.run(1200);if(s.found){auto&p=paths.paths[s.chosenPath];auto w=split(decode(join(train),p,s.answer),train);cout<<"ORIGINAL CANDIDATE "<<aff::str(s.answer)<<" phase="<<p.end<<" OOV="<<s.oov<<endl;for(auto&x:w)cout<<x<<" ";cout<<endl;auto h=holdout(held,w.back(),s.answer,p.end);cout<<"CONTINUOUS HOLDOUT "<<h.size()<<endl;for(auto&x:h){for(auto&v:x)cout<<v<<" ";cout<<endl;}}
 bool exhausted=!s.found&&!s.timed&&s.done==s.seedCount;cout<<"MASK ORIGINAL exhausted="<<exhausted<<endl;return exhausted?0:1;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
