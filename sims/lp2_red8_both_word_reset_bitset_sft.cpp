// Corrected physical carry; arbitrary independent word phases, source-mapped
// either sign of red8. Exact GF29 search with intersected posting bitsets,
// dimension-aware residual enumeration and independently sharded carry seeds.
#define main previous_line_sft_main
#include "lp2_red8_minimum_line_reset_sft.cpp"
#undef main
bool negative=false;
bool useInverseIndex=false;
struct Posting{int feature;vector<int> ids;vector<uint64_t> bits;};
struct Totals{uint64_t nodes=0,joins=0,perms=0,featureTests=0,optionTests=0,indexLookups=0;};
// For the negative mapped key, pi(P)=pi(C)+pi(K). Cache the possible P
// directly by observed C and K, rather than caching every trial P as a sum.
struct ReverseFilter {
 aff::Filter& f;
 array<uint32_t,29*29> cache;
 explicit ReverseFilter(aff::Filter& x):f(x){cache.fill(UINT32_MAX);}
 uint32_t mask(int x,int k){
  auto& cached=cache[x*29+k];if(cached!=UINT32_MAX)return cached;
  fixed::require(x!=0,"zero ciphertext has a separate hold/key branch");
  uint32_t bits=0;uint8_t row[29];const auto& s=f.s;
  for(int p=1;p<29;p++){if(p==x||p==k)continue;
   for(int j=0;j<s.d;j++)row[j]=aff::dif[s.a[p][j]][s.a[x][j]][s.a[k][j]];
   row[s.d]=aff::dif[s.a[p][aff::L]][s.a[x][aff::L]][s.a[k][aff::L]];
   auto sig=aff::signature(row,s.d);
   if(sig!=aff::IMPOSSIBLE&&!f.forbidden.count(sig))bits|=1u<<p;
  }
  return cached=bits;
 }
 bool allowed(const aff::Option& o){
  for(int i=0;i<o.n;i++){auto e=o.e[i];if(!(mask(e.p,e.k)&(1u<<e.c)))return false;}
  return true;
 }
};
struct PositionIndex {
 array<uint32_t,29> present{};
 array<int16_t,29*29> slot;
 PositionIndex(){slot.fill(-1);}
};
vector<aff::Word> byteWords(const vector<string>&x){vector<aff::Word> w;for(auto&s:x){aff::Word a;for(char c:s)a.push_back(fixed::val(c));w.push_back(move(a));}return w;}
aff::Word byteWord(const string&s){aff::Word x;for(char c:s)x.push_back(fixed::val(c));return x;}
fixed::Perm wide(const Pi&x){fixed::Perm y;copy(x.begin(),x.end(),y.begin());return y;}
fixed::Key mappedKey(const Pi&x){fixed::Key k;for(int j=0;j<8;j++)k[j]=aff::mod((negative?-1:1)*int(x[K[j]]));return k;}

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
 vector<string> train;vector<aff::Word> cipher;vector<aff::Domain> ds;vector<vector<vector<Posting>>> posts;vector<vector<PositionIndex>> index;vector<int> order;int budget;aff::Space base=aff::base();vector<aff::Space> seeds;
 atomic<bool> found{false},timed{false};atomic<size_t> next{0},done{0};Clock::time_point deadline;
 mutex answerMutex;Pi answer{};int answerOov=-1;Totals totals;
 IndexedSearch(const vector<string>&g,int b):train(g),budget(b){
  vector<string> prefix(fixed::prefixDict.begin(),fixed::prefixDict.end());sort(prefix.begin(),prefix.end());vector<vector<aff::Word>> by(16);
  for(int n=1;n<16;n++)by[n]=byteWords(fixed::by[n]);auto pre=byteWords(prefix);
  for(int i=0;i<48;i++){cipher.push_back(byteWord(g[i]));auto&lex=i==47?pre:by[g[i].size()];ds.push_back(negative?negativeDomain(i,cipher.back(),lex,base):aff::makeDomain(i,cipher.back(),lex,base));
   auto&d=ds.back();vector<vector<Posting>> pp(d.post.size());for(size_t q=0;q<d.post.size();q++)for(auto&[k,v]:d.post[q]){Posting p{k,move(v),{}};if(p.ids.size()>=64){p.bits.assign((d.opts.size()+63)/64,0);for(int id:p.ids)p.bits[id/64]|=uint64_t(1)<<(id%64);}pp[q].push_back(move(p));}d.post.clear();vector<PositionIndex> ii(pp.size());for(size_t j=0;j<pp.size();j++)for(int slot=0;slot<int(pp[j].size());slot++){int z=pp[j][slot].feature;ii[j].slot[z]=slot;ii[j].present[z/29]|=1u<<(z%29);}index.push_back(move(ii));posts.push_back(move(pp));if(i!=47)order.push_back(i);}
  sort(order.begin(),order.end(),[&](int a,int b){auto score=[&](int i){return log2(double(max<size_t>(1,ds[i].opts.size())))/train[i].size();};double x=score(a),y=score(b);return x==y?a<b:x<y;});
  unordered_set<string> seen;for(const auto&o:ds[47].opts){aff::Space s;if(aff::apply(base,o,s)&&seen.insert(signature(s)).second)seeds.push_back(s);}
  sort(seeds.begin(),seeds.end(),[](auto&a,auto&b){return a.d==b.d?signature(a)<signature(b):a.d<b.d;});
  cout<<"BITSET WORD CARRY seeds="<<seeds.size()<<" options="<<ds[47].opts.size()<<" domains";for(int i:order)cout<<" "<<i<<":"<<ds[i].opts.size();cout<<endl;
 }
 bool stop(){if(found.load(memory_order_relaxed)||timed.load(memory_order_relaxed))return true;if(Clock::now()>=deadline){timed=true;return true;}return false;}
 vector<int> domain(int g,aff::Filter&f,size_t cap,Totals&c,ReverseFilter* reverse=nullptr){
  const auto&d=ds[g];struct Choice{size_t count=0;vector<const Posting*>lists;};vector<Choice>choices;
  for(size_t pos=0;pos<posts[g].size();pos++){
   Choice q;int x=cipher[g][pos];
   if(reverse&&x){
    const auto& ix=index[g][pos];
    for(int k=1;k<29;k++)if(ix.present[k]){
     c.indexLookups++;uint32_t bits=ix.present[k]&reverse->mask(x,k);
     while(bits){int a=__builtin_ctz(bits);bits&=bits-1;c.featureTests++;
      const auto& p=posts[g][pos][ix.slot[k*29+a]];q.count+=p.ids.size();q.lists.push_back(&p);
     }
    }
   }else for(auto&p:posts[g][pos]){
    c.featureTests++;int k=p.feature/29,a=p.feature%29;
    if(a&&(negative?(x&&!(f.mask(a,k)&(1u<<x))):!(f.mask(x,k)&(1u<<a))))continue;
    q.count+=p.ids.size();q.lists.push_back(&p);
   }
   if(!q.count)return {};choices.push_back(move(q));
  }
  sort(choices.begin(),choices.end(),[](auto&a,auto&b){return a.count<b.count;});
  vector<int> ids;auto test=[&](int id){c.optionTests++;if(reverse?reverse->allowed(d.opts[id]):f.allowed(d.opts[id]))ids.push_back(id);return ids.size()>=cap;};
  if(choices[0].count<=128||choices.size()==1){for(auto*p:choices[0].lists)for(int id:p->ids)if(test(id))return ids;return ids;}
  size_t n=(d.opts.size()+63)/64;vector<uint64_t>bits(n),scratch(n);
  auto add=[&](vector<uint64_t>&v,const Choice&q){for(auto*p:q.lists){if(p->bits.empty()){for(int id:p->ids)v[id/64]|=uint64_t(1)<<(id%64);}else for(size_t i=0;i<n;i++)v[i]|=p->bits[i];}};
  add(bits,choices[0]);for(size_t pos=1;pos<min<size_t>(3,choices.size());pos++){if(choices[pos].count==d.opts.size())continue;fill(scratch.begin(),scratch.end(),0);add(scratch,choices[pos]);bool any=false;for(size_t i=0;i<n;i++){bits[i]&=scratch[i];any|=bits[i]!=0;}if(!any)return {};}
  for(size_t i=0;i<n;i++){uint64_t b=bits[i];while(b){int k=__builtin_ctzll(b);b&=b-1;if(test(int(i*64+k)))return ids;}}return ids;
 }
 void check(const Pi&pi,Totals&c){
  c.perms++;auto m=fixed::maps(wide(pi),mappedKey(pi));if(!fixed::support(train.back(),m,fixed::prefixDict))return;
  int n=0;for(int i:order)if(!fixed::support(train[i],m,fixed::dict)&&++n>budget)return;
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
  aff::Filter f(s);if(f.saturated)return;ReverseFilter reverse(f);int pick=-1;vector<int> best;size_t cap=SIZE_MAX;
  int ntry=min<int>(rem.size(),s.d>16?5:s.d>10?8:16);
  for(int i=0;i<ntry;){auto d=domain(rem[i],f,cap,c,negative&&useInverseIndex?&reverse:nullptr);
   if(d.empty()){if(!b)return;b--;rem.erase(rem.begin()+i);ntry--;if(pick>i)pick--;continue;}
   if(pick<0||d.size()<cap){pick=i;best=move(d);cap=best.size();}i++;
  }
  if(pick<0){enumerate(s,c);return;}
  int g=rem[pick];rem.erase(rem.begin()+pick);unordered_set<string>seen;
  for(int id:best){if(stop())return;c.joins++;aff::Space t;if(!aff::apply(s,ds[g].opts[id],t))continue;if(seen.insert(signature(t)).second)dfs(t,rem,b,c);}
  if(b)dfs(s,rem,b-1,c);
 }
 void run(int seconds,size_t begin=0,size_t end=SIZE_MAX){
  end=min(end,seeds.size());fixed::require(begin<end,"nonempty seed range");
  next=begin;vector<uint8_t> completed(seeds.size(),0);
  deadline=Clock::now()+chrono::seconds(seconds);unsigned n=max(1u,min(4u,thread::hardware_concurrency()));vector<Totals> stats(n);vector<thread> pool;
  for(unsigned t=0;t<n;t++)pool.emplace_back([&,t]{auto&c=stats[t];while(!stop()){size_t i=next.fetch_add(1);if(i>=end)break;dfs(seeds[i],order,budget,c);if(!found&&!timed){completed[i]=1;done.fetch_add(1);}}});
  for(auto&t:pool)t.join();
  for(auto&c:stats){totals.nodes+=c.nodes;totals.joins+=c.joins;totals.perms+=c.perms;totals.featureTests+=c.featureTests;totals.optionTests+=c.optionTests;totals.indexLookups+=c.indexLookups;}
  cout<<"BITSET WORD COMPLETED IDS range=["<<begin<<","<<end<<")";for(size_t i=begin;i<end;i++)if(completed[i])cout<<" "<<i;cout<<endl;
  cout<<"BITSET WORD SEARCH found="<<found<<" timed="<<timed<<" seeds="<<done<<"/"<<(end-begin)<<" nodes="<<totals.nodes<<" joins="<<totals.joins<<" perms="<<totals.perms<<" featureTests="<<totals.featureTests<<" optionTests="<<totals.optionTests<<" indexLookups="<<totals.indexLookups<<" OOV="<<answerOov<<endl;
 }
};
struct WordPlant{vector<string> train,held,truth,holdTruth;Pi pi;};
WordPlant wordPlant(const vector<string>&shape,const vector<string>&held,unsigned seed){mt19937 rng(seed);WordPlant p;for(int i=0;i<29;i++)p.pi[i]=i;shuffle(p.pi.begin()+1,p.pi.end(),rng);int inv=aff::inv[p.pi[19]];for(auto&x:p.pi)x=aff::mul[x][inv];auto k=mappedKey(p.pi);auto pi=wide(p.pi);auto choose=[&](int n){auto&v=fixed::by[n];return v[rng()%v.size()];};
 for(int i=0;i<47;i++){auto w=choose(shape[i].size());p.truth.push_back(w);p.train.push_back(fixed::encode(w,pi,k,rng()%8));}
 auto carry=choose(11);auto enc=fixed::encode(carry,pi,k,rng()%8);p.train.push_back(enc.substr(0,10));p.truth.push_back(carry.substr(0,10));p.held.push_back(enc.substr(10));p.holdTruth.push_back(carry);
 for(int i=1;i<int(held.size());i++){auto w=choose(held[i].size());p.holdTruth.push_back(w);p.held.push_back(fixed::encode(w,pi,k,rng()%8));}return p;
}
bool indexedControl(const vector<string>&train,const vector<string>&held,unsigned seed){auto p=wordPlant(train,held,seed);IndexedSearch s(p.train,0);s.run(360);if(!s.found){cout<<"BITSET WORD CONTROL "<<seed<<" failed no key"<<endl;return false;}
 auto m=fixed::maps(wide(s.answer),mappedKey(s.answer));int tr=0,hit=0,unique=0;for(int i=0;i<47;i++)tr+=fixed::decode(p.train[i],m,fixed::dict).count(p.truth[i]);auto h=p.held;h[0]=p.train.back()+h[0];for(int i=0;i<int(h.size());i++){auto v=fixed::decode(h[i],m,fixed::dict);hit+=v.count(p.holdTruth[i]);unique+=v.size()==1&&v.count(p.holdTruth[i]);}
 bool exact=s.answer==p.pi,pass=exact&&s.answerOov==0&&tr==47&&hit==17&&unique>=8;
 cout<<"BITSET WORD CONTROL "<<seed<<" exact="<<exact<<" train="<<tr<<"/47 hold="<<hit<<"/17 unique="<<unique<<" pass="<<pass<<endl;return pass;
}
// Deterministic full-domain equivalence check on original carry states and
// valid child states, plus fresh keyed plants. This checks option identities,
// not just counts or loose relation masks. No original key is fitted here.
void indexRegression(IndexedSearch& s,const string& label){
 Totals oldTotal,newTotal;uint64_t comparisons=0,states=0,options=0;
 vector<aff::Space> samples;
 for(size_t i=0;i<s.seeds.size();i+=max<size_t>(1,s.seeds.size()/8))samples.push_back(s.seeds[i]);
 size_t roots=samples.size();
 for(size_t j=0;j<roots;j++){
  auto current=samples[j];
  for(int depth=0;depth<3;depth++){
   aff::Filter f(current);if(f.saturated)break;
   bool foundChild=false;
   for(int g:s.order){
    Totals t;auto ids=s.domain(g,f,64,t);
    for(int id:ids){aff::Space child;if(aff::apply(current,s.ds[g].opts[id],child)&&child.d<current.d&&child.d>=1){samples.push_back(child);current=child;foundChild=true;break;}}
    if(foundChild)break;
   }
   if(!foundChild)break;
  }
 }
 for(const auto& state:samples){
  aff::Filter f(state);if(f.saturated)continue;ReverseFilter reverse(f);states++;
  for(int x=1;x<29;x++)for(int k:K){auto bits=reverse.mask(x,k);for(int p=1;p<29;p++){
   bool old=f.mask(p,k)&(1u<<x),now=bits&(1u<<p);fixed::require(old==now,"inverse relation mismatch");comparisons++;
  }}
  for(int g:s.order){
   auto a=s.domain(g,f,SIZE_MAX,oldTotal),b=s.domain(g,f,SIZE_MAX,newTotal,&reverse);
   sort(a.begin(),a.end());sort(b.begin(),b.end());
   fixed::require(a==b,"inverse full option domain mismatch");options+=a.size();
  }
 }
 cout<<"INVERSE INDEX "<<label<<" states="<<states<<" relationChecks="<<comparisons<<" retainedOptions="<<options<<" oldPostingVisits="<<oldTotal.featureTests<<" newPostingVisits="<<newTotal.featureTests<<" indexLookups="<<newTotal.indexLookups<<" oldOptionTests="<<oldTotal.optionTests<<" newOptionTests="<<newTotal.optionTests<<" pass=1"<<endl;
}
int main(int argc,char**argv){try{aff::init();fixed::dictionary();auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": [")),held=fixed::strings(src,"groups",src.rfind("\"p55\""));
 fixed::require(train.size()==48&&join(train).size()==223&&held.size()==17&&join(held).size()==76,"profile");
 // Prior both-sign run passed both blind controls for the unchanged search.
 // A range invocation searches only the negative-sign original and reports
 // exact completed IDs; an incomplete previous worker prefix is not assumed.
 if(argc==2&&string(argv[1])=="check-index"){
  negative=true;IndexedSearch original(train,3);indexRegression(original,"original");
  for(unsigned seed:{3301u,1033u}){auto p=wordPlant(train,held,seed);IndexedSearch s(p.train,0);indexRegression(s,"plant-"+to_string(seed));}
  return 0;
 }
 if(argc==3||(argc==4&&string(argv[1])=="inverse-range")){
  negative=true;useInverseIndex=argc==4;size_t begin=stoul(argv[argc-2]),end=stoul(argv[argc-1]);IndexedSearch s(train,3);
  fixed::require(s.seeds.size()==343&&begin<end&&end<=s.seeds.size(),"original negative seed range");
  s.run(1800,begin,end);
  if(s.found){auto m=fixed::maps(wide(s.answer),mappedKey(s.answer));cout<<"CANDIDATE pi="<<aff::str(s.answer)<<" sign=-1"<<endl;auto h=held;h[0]=train.back()+h[0];for(int i=0;i<int(h.size());i++){auto v=fixed::decode(h[i],m,fixed::dict);cout<<"HOLD "<<i<<" candidates="<<v.size();for(auto&w:v)cout<<" "<<w;cout<<endl;}}
  bool exhausted=!s.found&&!s.timed&&s.done==end-begin;
  cout<<"BITSET WORD RANGE exhausted="<<exhausted<<" begin="<<begin<<" end="<<end<<" inverseIndex="<<useInverseIndex<<endl;
  // An artifact is emitted only for a completely exhausted range; an
  // incomplete range cannot be mistaken for a contiguous completion.
  if(exhausted)if(const char* p=getenv("SFT_OUTPUT")){ofstream out(p);out<<"{\"exhausted\":true,\"begin\":"<<begin<<",\"end\":"<<end<<",\"inverseIndex\":"<<(useInverseIndex?"true":"false")<<",\"nodes\":"<<s.totals.nodes<<",\"joins\":"<<s.totals.joins<<"}\n";}
  return exhausted?0:1;
 }
 fixed::require(argc==1,"optional arguments: begin end");
 bool all=true;
 for(int sign:{1,-1}){negative=sign<0;cout<<"BITSET WORD SIGN "<<sign<<endl;
 bool a=indexedControl(train,held,3301),b=indexedControl(train,held,1033);if(!a||!b){cout<<"BITSET WORD ORIGINAL GATED OFF sign="<<sign<<endl;all=false;continue;}
 IndexedSearch s(train,3);s.run(1200);if(s.found){auto m=fixed::maps(wide(s.answer),mappedKey(s.answer));cout<<"CANDIDATE pi="<<aff::str(s.answer)<<" sign="<<sign<<endl;auto h=held;h[0]=train.back()+h[0];for(int i=0;i<int(h.size());i++){auto v=fixed::decode(h[i],m,fixed::dict);cout<<"HOLD "<<i<<" candidates="<<v.size();for(auto&w:v)cout<<" "<<w;cout<<endl;}}
 bool exhausted=!s.found&&!s.timed&&s.done==s.seeds.size();cout<<"BITSET WORD ORIGINAL exhausted="<<exhausted<<" sign="<<sign<<endl;all&=exhausted;
 }
 return all?0:1;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
