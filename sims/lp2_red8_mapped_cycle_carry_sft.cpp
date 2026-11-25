// Source-mapped red8 key: k[j]=pi(K[j]), corrected physical carry.
// Reuses the repository affine GF29 engine and numeric receiver's dictionary.
// Existing generic manual C++17 runner; AVX2 on the Ubuntu runner, std::threads.
#include <bits/stdc++.h>
#include <omp.h>
#ifndef _OPENMP
extern "C" void omp_set_num_threads(int) noexcept {}
#endif
#define main numeric_red8_original_main
namespace fixed {
#include "lp2_red8_fixed_numeric_cycle_carry_sft.cpp"
}
#undef main
#pragma GCC target("avx2")
#define main previous_affine_main
#include "lp2_shared_gp29_q8_affine_oov.cpp"
#undef main
using fixed::Perm;using fixed::Key;using fixed::require;
constexpr int CARRY=47;constexpr int OOV=3;
const string RED="jlnr2eaj";
const fixed::Key red{19,21,23,27,2,14,10,19};
using Time=chrono::steady_clock;
void init_field(){for(int i=0;i<29;i++)for(int j=0;j<29;j++){mult[i][j]=i*j%29;if(i*j%29==1)inv[i]=j;}}
State mapped_initial(){State s;for(int j=0;j<8;j++)require(impose(s,Edge{u8(red[j]),0,u8(j)},0),"mapped key initial equation");require(alldiff(s)&&primitive_possible(s),"initial mapped state");return s;}
string signature(const State&s){string z;z.reserve(1+V*(s.d+1));z+=char(s.d);for(int i=0;i<V;i++)z.append((const char*)s.a[i],s.d+1);return z;}
Group build_group(const string&c,const vector<string>&words,const State&initial){Group g;g.cipher=c;
 for(const auto&w:words){if(w.size()!=c.size())continue;Option op;op.word=w;int j=0;bool good=true;
  for(size_t i=0;i<w.size();i++){int p=fixed::val(w[i]),x=fixed::val(c[i]);if(!p){if(x){good=false;break;}continue;}if(p==x){good=false;break;}op.e.push_back(Edge{u8(x),u8(p),u8(j)});j=(j+1)&7;}
  if(!good)continue;for(int j=0;j<8;j++){State s=initial;if(extend(s,op,j)){g.opts.push_back(move(op));break;}}
 }
 build_masks(g);return g;
}
struct Totals{uint64_t nodes=0,edges=0,perms=0,residual=0;};
struct MappedSearch{
 State initial=mapped_initial();vector<Group> gs;vector<int> rem0;vector<string> train;string prefix;vector<State> seeds;
 atomic<bool> won{false},timed{false};atomic<size_t> next{0},done{0};Time::time_point start,end;
 Perm answer{};Key answerKey{};int answerOov=-1;mutex answerMutex;
 MappedSearch(const vector<string>&t,const string&p):train(t),prefix(p){
  require(train.size()==47&&prefix.size()==10,"training profile");
  for(const auto&c:train)gs.push_back(build_group(c,fixed::by[c.size()],initial));
  vector<string> pp(fixed::prefixDict.begin(),fixed::prefixDict.end());sort(pp.begin(),pp.end());
  gs.push_back(build_group(prefix,pp,initial));
  rem0.resize(47);iota(rem0.begin(),rem0.end(),0);sort(rem0.begin(),rem0.end(),[&](int a,int b){auto score=[&](int g){int ordinary=gs[g].cipher.size()-count(gs[g].cipher.begin(),gs[g].cipher.end(),'0');return log2(double(max<size_t>(1,gs[g].opts.size()*8)))/max(1,ordinary);};double x=score(a),y=score(b);return x==y?a<b:x<y;});
  unordered_set<string> unique;for(const auto&o:gs[CARRY].opts)for(int j=0;j<8;j++){State st=initial;if(extend(st,o,j)&&unique.insert(signature(st)).second)seeds.push_back(st);}
  sort(seeds.begin(),seeds.end(),[](const State&a,const State&b){return a.d==b.d?signature(a)<signature(b):a.d<b.d;});
  cout<<"mapped prefix words="<<gs[CARRY].opts.size()<<" seed states="<<seeds.size()<<" domains";for(int i:rem0)cout<<" "<<i<<":"<<gs[i].opts.size();cout<<endl;
 }
 bool stop(){if(won.load(memory_order_relaxed)||timed.load(memory_order_relaxed))return true;if(Time::now()>=end){timed=true;return true;}return false;}
 bool check(const Perm&pi,const Key&k,Totals&c){c.perms++;uint32_t used=0;
  for(int i=0;i<29;i++){uint32_t b=1u<<pi[i];if(used&b)return false;used|=b;}
  require(pi[0]==0&&pi[1]==1,"gauge");for(int j=0;j<8;j++)require(k[j]==pi[red[j]],"mapped equality");
  auto m=fixed::maps(pi,k);if(!fixed::support(prefix,m,fixed::prefixDict))return false;
  int bad=0;for(int i:rem0)if(!fixed::support(train[i],m,fixed::dict)&&++bad>OOV)return false;
  lock_guard<mutex> l(answerMutex);if(!won.load()){answer=pi;answerKey=k;answerOov=bad;won=true;}return true;
 }
 // Enumerate affine residual exactly for d<=2; at terminal residual leaves
 // also allow d<=4, with explicit timeout/residual accounting.
 bool complete(const State&s,Totals&c,int maxd){
  if(s.d>maxd)return false;
  int d=s.d;uint64_t n=1;for(int j=0;j<d;j++)n*=29;
  for(uint64_t z=0;z<n;z++){
   if((z&1023)==0&&stop())return false;
   uint64_t x=z;int t[4]={0,0,0,0};for(int j=0;j<d;j++){t[j]=x%29;x/=29;}
   Perm p{};Key k{};uint32_t used=0;bool ok=true;
   for(int i=0;i<29;i++){int v=s.a[i][d];for(int j=0;j<d;j++)v+=s.a[i][j]*t[j];v%=29;uint32_t b=1u<<v;if(used&b){ok=false;break;}used|=b;p[i]=v;}
   if(!ok)continue;for(int j=0;j<8;j++){int v=s.a[29+j][d];for(int h=0;h<d;h++)v+=s.a[29+j][h]*t[h];k[j]=v%29;}
   if(check(p,k,c))return true;
  }
  return true;
 }
 void dfs(const State&s,vector<int> rem,int budget,int level,Totals&c){
  if(won.load(memory_order_relaxed)||timed.load(memory_order_relaxed))return;
  if((++c.nodes&255)==0&&stop())return;
  if(s.d<=2){complete(s,c,2);return;}
  if(int(rem.size())<=budget){if(!complete(s,c,4)&&!won&&!timed)c.residual++;return;}
  Filter f(s);int choice=-1;Domain best;size_t cap=numeric_limits<size_t>::max();
  int ntry=level<=1?min(int(rem.size()),4):s.d>15?min(int(rem.size()),6):int(rem.size());
  for(int i=0;i<ntry;){Domain d=domain(gs[rem[i]],f,cap);
   if(!d.cutoff&&d.entries.empty()){if(!budget)return;budget--;rem.erase(rem.begin()+i);ntry--;if(choice>i)choice--;continue;}
   if(choice<0||(!d.cutoff&&d.entries.size()<best.entries.size())){best=move(d);choice=i;cap=best.entries.size();}i++;
  }
  if(choice<0){if(!complete(s,c,4)&&!won&&!timed)c.residual++;return;}
  const auto&g=gs[rem[choice]];rem.erase(rem.begin()+choice);unordered_set<string> seen;
  for(auto [i,j]:best.entries){if(won||timed)return;if((++c.edges&4095)==0&&stop())return;State x=s;if(!extend(x,g.opts[i],j))continue;if(!seen.insert(signature(x)).second)continue;dfs(x,rem,budget,level+1,c);}
  if(budget>0)dfs(s,rem,budget-1,level+1,c);
 }
 void run(int seconds){start=Time::now();end=start+chrono::seconds(seconds);unsigned threads=max(1u,min(4u,thread::hardware_concurrency()));vector<Totals> counts(threads);vector<thread> pool;
  for(unsigned t=0;t<threads;t++)pool.emplace_back([&,t]{auto&c=counts[t];for(;;){if(stop())break;size_t i=next.fetch_add(1);if(i>=seeds.size())break;dfs(seeds[i],rem0,OOV,0,c);if(!won&&!timed)done.fetch_add(1);}});
  for(auto&t:pool)t.join();Totals sum;for(auto&c:counts){sum.nodes+=c.nodes;sum.edges+=c.edges;sum.perms+=c.perms;sum.residual+=c.residual;}
  cout<<"MAPPED SEARCH found="<<won<<" timed="<<timed<<" seedDone="<<done<<" seedTotal="<<seeds.size()<<" nodes="<<sum.nodes<<" edges="<<sum.edges<<" perms="<<sum.perms<<" residual="<<sum.residual<<" oov="<<answerOov<<" seconds="<<chrono::duration<double>(Time::now()-start).count()<<endl;
  if(won){cout<<"pi";for(int x:answer)cout<<" "<<x;cout<<"\nk";for(int x:answerKey)cout<<" "<<x;cout<<endl;}
 }
};
struct Plant{fixed::Fixture f;Key k;};
Plant make_plant(const vector<string>&train,const vector<string>&hold,unsigned seed){mt19937 rng(seed);Plant a;auto&x=a.f;for(int i=0;i<29;i++)x.pi[i]=i;shuffle(x.pi.begin()+1,x.pi.end(),rng);for(int j=0;j<8;j++)a.k[j]=x.pi[red[j]];
 auto choose=[&](int n){const auto&v=fixed::by[n];return v[rng()%v.size()];};
 for(const auto&c:train){auto w=choose(c.size());x.truthTrain.push_back(w);x.train.push_back(fixed::encode(w,x.pi,a.k,rng()%8));}
 x.truthCarry=choose(11);x.carry=fixed::encode(x.truthCarry,x.pi,a.k,rng()%8);x.prefix=x.carry.substr(0,10);
 for(const auto&c:hold){auto w=choose(c.size());x.truthHold.push_back(w);x.hold.push_back(fixed::encode(w,x.pi,a.k,rng()%8));}return a;
}
bool equal_action(const Perm&a,const Key&ka,const Perm&b,const Key&kb){auto x=fixed::maps(a,ka),y=fixed::maps(b,kb);for(int shift=0;shift<8;shift++){bool yes=true;for(int i=0;i<8;i++)yes&=x[i]==y[(i+shift)&7];if(yes)return true;}return false;}
bool mapped_control(const vector<string>&train,const vector<string>&hold,unsigned seed,int seconds){
 auto p=make_plant(train,hold,seed);auto&f=p.f;MappedSearch s(f.train,f.prefix);s.run(seconds);
 if(!s.won){cout<<"MAPPED CONTROL "<<seed<<" passed=0 no key"<<endl;return false;}
 auto m=fixed::maps(s.answer,s.answerKey);int tr=0,hit=0,unique=0;for(size_t i=0;i<f.train.size();i++)tr+=fixed::decode(f.train[i],m,fixed::dict).count(f.truthTrain[i]);
 auto d=fixed::decode(f.carry,m,fixed::dict);hit+=d.count(f.truthCarry);unique+=d.size()==1&&d.count(f.truthCarry);for(size_t i=0;i<f.hold.size();i++){d=fixed::decode(f.hold[i],m,fixed::dict);hit+=d.count(f.truthHold[i]);unique+=d.size()==1&&d.count(f.truthHold[i]);}
 bool exact=equal_action(s.answer,s.answerKey,f.pi,p.k),pass=exact&&s.answerOov==0&&tr==47&&hit==17&&unique>=8;
 cout<<"MAPPED CONTROL "<<seed<<" exact="<<exact<<" trainTruth="<<tr<<"/47 holdTruth="<<hit<<"/17 unique="<<unique<<" passed="<<pass<<endl;return pass;
}
int main(){try{init_field();fixed::dictionary();string src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");auto body=fixed::strings(src,"body_groups",src.find("\"heading_groups\": [")),p55=fixed::strings(src,"groups",src.rfind("\"p55\""));
 require(body.size()==48&&body.back()=="63g2eis46q"&&p55.size()==17&&p55[0]=="l","physical carry");require(fixed::numbers(src,"gp29_indices")==red,"mapped red8 source");
 vector<string> train(body.begin(),body.end()-1),hold(p55.begin()+1,p55.end());require(accumulate(train.begin(),train.end(),size_t(0),[](size_t a,const string&b){return a+b.size();})==213,"training count");require(accumulate(hold.begin(),hold.end(),size_t(0),[](size_t a,const string&b){return a+b.size();})==75,"holdout count");
 bool p1=mapped_control(train,hold,3301,600),p2=mapped_control(train,hold,1033,600);if(!p1||!p2){cout<<"MAPPED ORIGINAL GATED OFF: blind controls failed"<<endl;return 1;}
 MappedSearch s(train,body.back());s.run(900);if(!s.won){cout<<"MAPPED ORIGINAL no key; exclusion only if all states completed, no timeout/residual"<<endl;return 1;}
 auto m=fixed::maps(s.answer,s.answerKey);vector<string> held{body.back()+p55[0]};held.insert(held.end(),hold.begin(),hold.end());cout<<"MAPPED ORIGINAL frozen holdout"<<endl;
 for(size_t i=0;i<held.size();i++){auto d=fixed::decode(held[i],m,fixed::dict);cout<<i<<" "<<held[i]<<" candidates="<<d.size();int n=0;for(const auto&w:d){if(n++>=10)break;cout<<" "<<w;}cout<<endl;}
 return 1;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
