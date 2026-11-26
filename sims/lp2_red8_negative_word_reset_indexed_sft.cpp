// Corrected physical carry; arbitrary independent word phases, source-mapped
// negative red8 (C=pi^-1(pi(P)-pi(K))). Exact GF29 search with indexed per-position domain postings,
// dimension-aware residual enumeration and independently sharded carry seeds.
#define main previous_line_sft_main
#include "lp2_red8_minimum_line_reset_sft.cpp"
#undef main
struct Totals{uint64_t nodes=0,joins=0,perms=0,featureTests=0,optionTests=0;};
vector<aff::Word> byteWords(const vector<string>&x){vector<aff::Word> w;for(auto&s:x){aff::Word a;for(char c:s)a.push_back(fixed::val(c));w.push_back(move(a));}return w;}
aff::Word byteWord(const string&s){aff::Word x;for(char c:s)x.push_back(fixed::val(c));return x;}
fixed::Perm wide(const Pi&x){fixed::Perm y;copy(x.begin(),x.end(),y.begin());return y;}
fixed::Key mappedKey(const Pi&x){fixed::Key k;for(int j=0;j<8;j++)k[j]=aff::mod(-int(x[K[j]]));return k;}

aff::Domain negativeDomain(int g,const aff::Word&c,const vector<aff::Word>&words,const aff::Space&b){
 aff::Domain d;d.group=g;d.post.resize(c.size());unordered_set<string>seen;vector<map<int,vector<int>>>tmp(c.size());
 for(auto&w:words)for(int start=0;start<8;start++){
  aff::Option o;int j=start;bool ok=true;
  for(int i=0;i<int(c.size());i++){
   int p=w[i],x=c[i],k=K[j];if(!p){if(x){ok=false;break;}continue;}
   if(p==x||(x==0&&p!=k)||(x!=0&&p==k)){ok=false;break;}
   o.feature[i]=k*29+p;j=(j+1)%8;
   // For ciphertext F and consuming plaintext, p=K is necessary and sufficient.
   // The equation then vanishes identically and needs no affine edge.
   if(x)o.e[o.n++]={uint8_t(p),uint8_t(x),uint8_t(k)};
  }
  if(!ok)continue;aff::Space t;if(!aff::apply(b,o,t))continue;
  array<uint16_t,16>ids{};for(int i=0;i<o.n;i++)ids[i]=aff::eid(o.e[i]);sort(ids.begin(),ids.begin()+o.n);auto end=unique(ids.begin(),ids.begin()+o.n);
  string sig((char*)ids.data(),2*(end-ids.begin()));
  if(!seen.insert(sig).second)continue;
  int id=d.opts.size();d.opts.push_back(o);for(int i=0;i<int(c.size());i++)tmp[i][o.feature[i]].push_back(id);
 }
 for(int i=0;i<int(c.size());i++)for(auto&a:tmp[i])d.post[i].push_back({a.first,move(a.second)});
 return d;
}
struct IndexedSearch{
 vector<string> train;vector<aff::Word> cipher;vector<aff::Domain> ds;vector<int> order;aff::Space base=aff::base();vector<aff::Space> seeds;
 atomic<bool> found{false},timed{false};atomic<size_t> next{0},done{0};Clock::time_point deadline;
 mutex answerMutex;Pi answer{};int answerOov=-1;Totals totals;
 IndexedSearch(const vector<string>&g):train(g){
  vector<string> prefix(fixed::prefixDict.begin(),fixed::prefixDict.end());sort(prefix.begin(),prefix.end());vector<vector<aff::Word>> by(16);
  for(int n=1;n<16;n++)by[n]=byteWords(fixed::by[n]);auto pre=byteWords(prefix);
  for(int i=0;i<48;i++){cipher.push_back(byteWord(g[i]));ds.push_back(negativeDomain(i,cipher.back(),i==47?pre:by[g[i].size()],base));if(i!=47)order.push_back(i);}
  sort(order.begin(),order.end(),[&](int a,int b){auto score=[&](int i){return log2(double(max<size_t>(1,ds[i].opts.size())))/train[i].size();};double x=score(a),y=score(b);return x==y?a<b:x<y;});
  unordered_set<string> seen;for(const auto&o:ds[47].opts){aff::Space s;if(aff::apply(base,o,s)&&seen.insert(signature(s)).second)seeds.push_back(s);}
  sort(seeds.begin(),seeds.end(),[](auto&a,auto&b){return a.d==b.d?signature(a)<signature(b):a.d<b.d;});
  cout<<"NEGATIVE INDEXED CARRY seeds="<<seeds.size()<<" options="<<ds[47].opts.size()<<" domains";for(int i:order)cout<<" "<<i<<":"<<ds[i].opts.size();cout<<endl;
 }
 bool stop(){if(found.load(memory_order_relaxed)||timed.load(memory_order_relaxed))return true;if(Clock::now()>=deadline){timed=true;return true;}return false;}
 vector<int> domain(int g,aff::Filter&f,size_t cap,Totals&c){
  auto&d=ds[g];size_t best=SIZE_MAX;vector<const vector<int>*> posting;
  for(size_t pos=0;pos<d.post.size();pos++){
   size_t count=0;vector<const vector<int>*> v;
   for(auto&[feature,list]:d.post[pos]){
    c.featureTests++;int k=feature/29,p=feature%29;
    int x=cipher[g][pos];if(p&&x&&!(f.mask(p,k)&(1u<<x)))continue;
    count+=list.size();v.push_back(&list);if(count>=best)break;
   }
   if(count<best){best=count;posting=move(v);if(!best)return {};}
  }
  vector<int> out;for(auto* v:posting)for(int id:*v){c.optionTests++;if(f.allowed(d.opts[id])){out.push_back(id);if(out.size()>=cap)return out;}}
  return out;
 }
 void check(const Pi&pi,Totals&c){
  c.perms++;auto m=fixed::maps(wide(pi),mappedKey(pi));if(!fixed::support(train.back(),m,fixed::prefixDict))return;
  int n=0;for(int i:order)if(!fixed::support(train[i],m,fixed::dict)&&++n>3)return;
  lock_guard<mutex> l(answerMutex);if(!found){answer=pi;answerOov=n;found=true;}
 }
 void enumerate(const aff::Space&s,Totals&c){
  vector<vector<int>> rows(s.d);array<uint8_t,29> param{};uint32_t used=0;Pi pi{};
  for(int x=0;x<29;x++){int j=s.d-1;while(j>=0&&!s.a[x][j])j--;if(j<0){int v=s.a[x][aff::L];if(used&(1u<<v))return;used|=1u<<v;pi[x]=v;}else rows[j].push_back(x);}
  auto visit=[&](auto&&self,int j,uint32_t mask)->void{if(stop())return;if(j==s.d){check(pi,c);return;}for(int v=0;v<29;v++){if(mask&(1u<<v))continue;param[j]=v;uint32_t z=mask;bool ok=true;for(int x:rows[j]){int a=s.a[x][aff::L];for(int k=0;k<=j;k++)a+=param[k]*s.a[x][k];a%=29;if(z&(1u<<a)){ok=false;break;}z|=1u<<a;pi[x]=a;}if(ok)self(self,j+1,z);if(found||timed)return;}};visit(visit,0,used);
 }
 void dfs(const aff::Space&s,vector<int>rem,int b,Totals&c){
  if(stop())return;c.nodes++;if(s.d<=3||int(rem.size())<=b){enumerate(s,c);return;}
  if(s.d>24){enumerate(s,c);return;} // exact, explicitly timeout-bounded
  aff::Filter f(s);if(f.saturated)return;int pick=-1;vector<int> best;size_t cap=SIZE_MAX;
  int ntry=min<int>(rem.size(),s.d>16?5:s.d>10?8:16);
  for(int i=0;i<ntry;){auto d=domain(rem[i],f,cap,c);
   if(d.empty()){if(!b)return;b--;rem.erase(rem.begin()+i);ntry--;if(pick>i)pick--;continue;}
   if(pick<0||d.size()<cap){pick=i;best=move(d);cap=best.size();}i++;
  }
  if(pick<0){enumerate(s,c);return;}
  int g=rem[pick];rem.erase(rem.begin()+pick);unordered_set<string>seen;
  for(int id:best){if(stop())return;c.joins++;aff::Space t;if(!aff::apply(s,ds[g].opts[id],t))continue;if(seen.insert(signature(t)).second)dfs(t,rem,b,c);}
  if(b)dfs(s,rem,b-1,c);
 }
 void run(int seconds){
  deadline=Clock::now()+chrono::seconds(seconds);unsigned n=max(1u,min(4u,thread::hardware_concurrency()));vector<Totals> stats(n);vector<thread> pool;
  for(unsigned t=0;t<n;t++)pool.emplace_back([&,t]{auto&c=stats[t];while(!stop()){size_t i=next.fetch_add(1);if(i>=seeds.size())break;dfs(seeds[i],order,3,c);if(!found&&!timed)done.fetch_add(1);}});
  for(auto&t:pool)t.join();
  for(auto&c:stats){totals.nodes+=c.nodes;totals.joins+=c.joins;totals.perms+=c.perms;totals.featureTests+=c.featureTests;totals.optionTests+=c.optionTests;}
  cout<<"NEGATIVE INDEXED SEARCH found="<<found<<" timed="<<timed<<" seeds="<<done<<"/"<<seeds.size()<<" nodes="<<totals.nodes<<" joins="<<totals.joins<<" perms="<<totals.perms<<" featureTests="<<totals.featureTests<<" optionTests="<<totals.optionTests<<" OOV="<<answerOov<<endl;
 }
};
struct WordPlant{vector<string> train,held,truth,holdTruth;Pi pi;};
WordPlant wordPlant(const vector<string>&shape,const vector<string>&held,unsigned seed){mt19937 rng(seed);WordPlant p;for(int i=0;i<29;i++)p.pi[i]=i;shuffle(p.pi.begin()+1,p.pi.end(),rng);int inv=aff::inv[p.pi[19]];for(auto&x:p.pi)x=aff::mul[x][inv];auto k=mappedKey(p.pi);auto pi=wide(p.pi);auto choose=[&](int n){auto&v=fixed::by[n];return v[rng()%v.size()];};
 for(int i=0;i<47;i++){auto w=choose(shape[i].size());p.truth.push_back(w);p.train.push_back(fixed::encode(w,pi,k,rng()%8));}
 auto carry=choose(11);auto enc=fixed::encode(carry,pi,k,rng()%8);p.train.push_back(enc.substr(0,10));p.truth.push_back(carry.substr(0,10));p.held.push_back(enc.substr(10));p.holdTruth.push_back(carry);
 for(int i=1;i<int(held.size());i++){auto w=choose(held[i].size());p.holdTruth.push_back(w);p.held.push_back(fixed::encode(w,pi,k,rng()%8));}return p;
}
bool indexedControl(const vector<string>&train,const vector<string>&held,unsigned seed){auto p=wordPlant(train,held,seed);IndexedSearch s(p.train);s.run(240);if(!s.found){cout<<"NEGATIVE INDEXED CONTROL "<<seed<<" failed no key"<<endl;return false;}
 auto m=fixed::maps(wide(s.answer),mappedKey(s.answer));int tr=0,hit=0,unique=0;for(int i=0;i<47;i++)tr+=fixed::decode(p.train[i],m,fixed::dict).count(p.truth[i]);auto h=p.held;h[0]=p.train.back()+h[0];for(int i=0;i<int(h.size());i++){auto v=fixed::decode(h[i],m,fixed::dict);hit+=v.count(p.holdTruth[i]);unique+=v.size()==1&&v.count(p.holdTruth[i]);}
 bool exact=s.answer==p.pi,pass=exact&&s.answerOov==0&&tr==47&&hit==17&&unique>=8;
 cout<<"NEGATIVE INDEXED CONTROL "<<seed<<" exact="<<exact<<" train="<<tr<<"/47 hold="<<hit<<"/17 unique="<<unique<<" pass="<<pass<<endl;return pass;
}
int main(){try{aff::init();fixed::dictionary();auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": [")),held=fixed::strings(src,"groups",src.rfind("\"p55\""));
 fixed::require(train.size()==48&&join(train).size()==223&&held.size()==17&&join(held).size()==76,"profile");
 bool a=indexedControl(train,held,3301),b=indexedControl(train,held,1033);if(!a||!b){cout<<"NEGATIVE INDEXED ORIGINAL GATED OFF"<<endl;return 2;}
 IndexedSearch s(train);s.run(1200);if(s.found){auto m=fixed::maps(wide(s.answer),mappedKey(s.answer));cout<<"CANDIDATE pi="<<aff::str(s.answer)<<endl;auto h=held;h[0]=train.back()+h[0];for(int i=0;i<int(h.size());i++){auto v=fixed::decode(h[i],m,fixed::dict);cout<<"HOLD "<<i<<" candidates="<<v.size();for(auto&w:v)cout<<" "<<w;cout<<endl;}}
 bool exhausted=!s.found&&!s.timed&&s.done==s.seeds.size();cout<<"NEGATIVE INDEXED ORIGINAL exhausted="<<exhausted<<endl;return exhausted?0:1;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
