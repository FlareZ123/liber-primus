// Source-selected affine red8 shift family: k_j=a*v_j+b (a!=0).
// Covers all phase rotations and unknown common offset; excludes already
// exhausted zero-offset ordinal/prime keys in the original run only.
#define LP2_MOMENT_COMPLETION_NO_MAIN
#include "lp2_shared_gp29_q8_moment_completion_sft.cpp"
using KV=fixed::Key;
set<KV> sourceAffineKeys(const vector<int>&v,bool novel){
 set<KV>out,old;
 for(int r=0;r<Q;r++)if(v[r]){
  KV k{};for(int j=0;j<Q;j++)k[j]=aff::mul[v[(j+r)%Q]][aff::inv[v[r]]];old.insert(k);
 }
 for(int r=0;r<Q;r++)for(int a=1;a<N;a++){
  KV k{};for(int j=0;j<Q;j++)k[j]=aff::mod(1+a*(v[(r+j)%Q]-v[r]));
  if(!novel||!old.count(k))out.insert(k);
 }
 return out;
}
struct Affine7:FastSearch{
 using FastSearch::FastSearch;
 struct Branch{size_t seed;KV key;Graph graph;};
 vector<Branch> branches;vector<uint8_t> visited;
 void split(size_t first,size_t last,const set<KV>&ks,const set<size_t>&excluded){
  set<pair<size_t,KV>> uniq;size_t nonempty=0;
  for(size_t i=first;i<last;i++)if(!excluded.count(i)){
   bool any=false;
   for(const auto&k:ks){Graph g=seeds[i];bool ok=true;
    for(int j=1;j<Q;j++){Vec eq=unit(j);eq[0]=aff::mod(-k[j]);if(!g.k.impose(eq)){ok=false;break;}}
    if(!ok||!g.valid())continue;GFilter f(g);if(f.saturated)continue;
    if(uniq.emplace(i,k).second){branches.push_back({i,k,move(g)});any=true;}
   }nonempty+=any;
  }
  stable_sort(branches.begin(),branches.end(),[&](const Branch&a,const Branch&b){if(a.graph.dimension()!=b.graph.dimension())return a.graph.dimension()<b.graph.dimension();return seedPrior[a.seed]>seedPrior[b.seed];});
  cout<<"AFFINE INVENTORY range="<<first<<":"<<last<<" keys="<<ks.size()<<" canonical_nonempty="<<nonempty<<" branches="<<branches.size()<<endl;
 }
 void runAffine(int seconds){
  next=0;done=0;visited.assign(branches.size(),0);deadline=Clock::now()+chrono::seconds(seconds);
  unsigned n=max(1u,min(4u,thread::hardware_concurrency()));vector<GStats>stats(n);vector<thread>pool;
  for(unsigned t=0;t<n;t++)pool.emplace_back([&,t]{while(!stop()){
   size_t id=next.fetch_add(1);if(id>=branches.size())break;auto&b=branches[id];
   fastDfs(b.graph,order,maxOov,stats[t],DomainPointers{});
   if(!found&&!timed){visited[id]=1;done++;lock_guard<mutex>l(checkpointMutex);cout<<"AFFINE COMPLETE seed="<<b.seed<<" key";for(int k:b.key)cout<<" "<<k;cout<<endl;}
  }});
  for(auto&t:pool)t.join();for(auto&c:stats){total.nodes+=c.nodes;total.joins+=c.joins;total.perms+=c.perms;}
  cout<<"AFFINE RESULT found="<<found<<" timed="<<timed<<" completed="<<done<<"/"<<branches.size()<<" nodes="<<total.nodes<<" joins="<<total.joins<<" permutations="<<total.perms<<" OOV="<<answerOov<<endl;
 }
};
bool affineControl(const vector<string>&train,const vector<string>&held,const vector<int>&v,unsigned seed){
 KV k{};for(int j=0;j<Q;j++)k[j]=aff::mod(1+7*(v[j]-v[0]));
 vector<string>t(train.begin(),train.end()-1),h(held.begin()+1,held.end());auto p=fixed::plant(t,h,k,seed);auto g=p.train;g.push_back(p.prefix);
 Affine7 s(g,0);s.split(0,s.seeds.size(),sourceAffineKeys(v,false),{});s.runAffine(420);
 if(!s.found){cout<<"AFFINE CONTROL "<<seed<<" no key"<<endl;return false;}
 auto m=fixed::maps(s.answer,s.answerKey);int tr=0,hit=0,unique=0;
 for(int i=0;i<47;i++)tr+=fixed::decode(p.train[i],m,fixed::dict).count(p.truthTrain[i]);
 vector<string>c{p.carry},w{p.truthCarry};c.insert(c.end(),p.hold.begin(),p.hold.end());w.insert(w.end(),p.truthHold.begin(),p.truthHold.end());
 for(int i=0;i<int(c.size());i++){auto z=fixed::decode(c[i],m,fixed::dict);hit+=z.count(w[i]);unique+=z.size()==1&&z.count(w[i]);}
 bool exact=equalAction(s.answer,s.answerKey,p.pi,k),pass=exact&&tr==47&&hit==17&&unique>=8;
 cout<<"AFFINE CONTROL "<<seed<<" exact="<<exact<<" train="<<tr<<"/47 hold="<<hit<<"/17 unique="<<unique<<" pass="<<pass<<endl;return pass;
}
int main(int argc,char**argv){try{
 bool controls=false,inventory=false;size_t first=0,last=93;int seconds=600;set<size_t>excluded;string family="both";set<int>offsets,excludedOffsets;
 for(int i=1;i<argc;i++){string a=argv[i];if(a=="--controls-only"){controls=true;continue;}if(a=="--inventory"){inventory=true;continue;}if(i+1>=argc)throw runtime_error("missing argument");string v=argv[++i];if(a=="--seed-start")first=stoull(v);else if(a=="--seed-end")last=stoull(v);else if(a=="--seconds")seconds=stoi(v);else if(a=="--family")family=v;else if(a=="--offset")offsets.insert(aff::mod(stoi(v)));else if(a=="--exclude-offset")excludedOffsets.insert(aff::mod(stoi(v)));else if(a=="--exclude")excluded.insert(stoull(v));else throw runtime_error("unknown argument "+a);}
 aff::init();fixed::dictionary();frequencyOrderEnabled=true;exactMrvEnabled=true;buildPrior7();
 auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": ["));auto held=fixed::strings(src,"groups",src.rfind("\"p55\""));fixed::require(train.size()==48&&held.size()==17,"profile");
 const vector<int>ord{19,21,23,27,2,14,10,19},prime{13,21,2,20,5,18,2,13};
 if(controls){bool a=affineControl(train,held,ord,3301),b=affineControl(train,held,prime,1033);return a&&b?0:2;}
 fixed::require(family=="both"||family=="ordinal"||family=="prime","family");
 set<KV>ks,old;
 for(auto&v:{ord,prime}){auto x=sourceAffineKeys(v,false),y=sourceAffineKeys(v,true);for(auto&k:x)if(!y.count(k))old.insert(k);}
 if(family!="prime"){auto x=sourceAffineKeys(ord,true);ks.insert(x.begin(),x.end());}
 if(family!="ordinal"){auto x=sourceAffineKeys(prime,true);ks.insert(x.begin(),x.end());}
 for(auto&k:old)ks.erase(k);
 if(!offsets.empty()){
  set<KV>selected;
  for(const auto&v:{ord,prime}){if((v==ord&&family=="prime")||(v==prime&&family=="ordinal"))continue;for(int b:offsets)for(int r=0;r<Q;r++){int z=aff::mod(v[r]+b);if(!z)continue;KV k{};for(int j=0;j<Q;j++)k[j]=aff::mul[aff::mod(v[(r+j)%Q]+b)][aff::inv[z]];if(ks.count(k))selected.insert(k);}}
  ks=move(selected);
 }
 for(const auto&v:{ord,prime})for(int b:excludedOffsets)for(int r=0;r<Q;r++){int z=aff::mod(v[r]+b);if(!z)continue;KV k{};for(int j=0;j<Q;j++)k[j]=aff::mul[aff::mod(v[(r+j)%Q]+b)][aff::inv[z]];ks.erase(k);}
 Affine7 s(train);fixed::require(s.seeds.size()==93&&first<last&&last<=93&&seconds>0,"seed range");
 s.split(first,last,ks,excluded);if(inventory)return 0;s.runAffine(seconds);
 if(s.found){auto m=fixed::maps(s.answer,s.answerKey);cout<<"ORIGINAL AFFINE candidate pi";for(int x:s.answer)cout<<" "<<x;cout<<" k";for(int x:s.answerKey)cout<<" "<<x;cout<<endl;for(int i=0;i<47;i++){auto z=fixed::decode(train[i],m,fixed::dict);cout<<"TRAIN "<<i;for(auto&w:z)cout<<" "<<w;cout<<endl;}held[0]=train.back()+held[0];for(int i=0;i<int(held.size());i++){auto z=fixed::decode(held[i],m,fixed::dict);cout<<"HOLD "<<i;for(auto&w:z)cout<<" "<<w;cout<<endl;}}
 if(const char*p=getenv("SFT_OUTPUT")){ofstream o(p);o<<"{\"mode\":\"affine-red8\",\"found\":"<<(s.found?"true":"false")<<",\"timed\":"<<(s.timed?"true":"false")<<",\"completed\":"<<s.done<<",\"total\":"<<s.branches.size()<<",\"full_exhausted\":false,\"completed_ids\":[]}\n";}
 return 0;
}catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
