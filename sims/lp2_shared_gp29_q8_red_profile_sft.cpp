// Exact source-motivated key-profile family, distinct from arbitrary q8.
// Every shift is nonzero; exactly one cyclically adjacent pair is equal.
// Retains original canonical carry IDs; profile completion never counts as
// unrestricted-q8 seed exhaustion.
#define LP2_MOMENT_COMPLETION_NO_MAIN
#include "lp2_shared_gp29_q8_moment_completion_sft.cpp"

struct Profile7:FastSearch{
 using FastSearch::FastSearch;
 struct Branch{size_t seed;int repeat;Graph graph;};
 vector<Branch> branches;
 vector<uint8_t> visited;
 void split(size_t first,size_t last){
  redProfile7=true;vector<int>counts(Q+1);size_t totalSeeds=0;
  for(size_t i=first;i<last;i++){
   int n=0;
   for(int j=0;j<Q;j++){
    Graph g=seeds[i];
    if(!g.k.impose(minusv(unit(j),unit((j+1)%Q)))||!g.valid())continue;
    GFilter f(g);if(f.saturated)continue;
    branches.push_back({i,j,move(g)});n++;
   }
   counts[n]++;totalSeeds+=n>0;
  }
  stable_sort(branches.begin(),branches.end(),[&](const Branch&a,const Branch&b){
   if(a.graph.dimension()!=b.graph.dimension())return a.graph.dimension()<b.graph.dimension();
   return seedPrior[a.seed]>seedPrior[b.seed];
  });
  cout<<"PROFILE INVENTORY range="<<first<<":"<<last<<" canonical_nonempty="<<totalSeeds<<" branches="<<branches.size()<<" histogram";
  for(int i=0;i<=Q;i++)cout<<" "<<i<<":"<<counts[i];cout<<endl;
 }
 void runProfile(int seconds){
  next=0;done=0;visited.assign(branches.size(),0);deadline=Clock::now()+chrono::seconds(seconds);
  unsigned n=max(1u,min(4u,thread::hardware_concurrency()));vector<GStats> stats(n);vector<thread> pool;
  for(unsigned t=0;t<n;t++)pool.emplace_back([&,t]{
   while(!stop()){
    size_t id=next.fetch_add(1);if(id>=branches.size())break;auto&b=branches[id];
    fastDfs(b.graph,order,maxOov,stats[t],DomainPointers{});
    if(!found&&!timed){visited[id]=1;done++;lock_guard<mutex>l(checkpointMutex);cout<<"PROFILE COMPLETE seed="<<b.seed<<" repeat="<<b.repeat<<endl;}
   }
  });
  for(auto&t:pool)t.join();
  for(auto&c:stats){total.nodes+=c.nodes;total.joins+=c.joins;total.perms+=c.perms;}
  cout<<"PROFILE RESULT found="<<found<<" timed="<<timed<<" completed="<<done<<"/"<<branches.size()<<" nodes="<<total.nodes<<" joins="<<total.joins<<" permutations="<<total.perms<<" OOV="<<answerOov<<endl;
 }
};
bool profileControl(const vector<string>&train,const vector<string>&held,unsigned seed){
 redProfile7=false;
 mt19937 rng(seed+4242);fixed::Key k{};k[0]=k[7]=1;
 for(int j=1;j<7;j++){do{k[j]=1+rng()%28;}while(k[j]==k[j-1]||(j==6&&k[j]==1));}
 vector<string>t(train.begin(),train.end()-1),h(held.begin()+1,held.end());auto p=fixed::plant(t,h,k,seed);auto g=p.train;g.push_back(p.prefix);
 Profile7 s(g,0);s.split(0,s.seeds.size());s.runProfile(600);
 if(!s.found){cout<<"PROFILE CONTROL "<<seed<<" no key"<<endl;redProfile7=false;return false;}
 auto m=fixed::maps(s.answer,s.answerKey);int tr=0,hit=0,unique=0;
 for(int i=0;i<47;i++)tr+=fixed::decode(p.train[i],m,fixed::dict).count(p.truthTrain[i]);
 vector<string>c{p.carry},w{p.truthCarry};c.insert(c.end(),p.hold.begin(),p.hold.end());w.insert(w.end(),p.truthHold.begin(),p.truthHold.end());
 for(int i=0;i<int(c.size());i++){auto v=fixed::decode(c[i],m,fixed::dict);hit+=v.count(w[i]);unique+=v.size()==1&&v.count(w[i]);}
 bool exact=equalAction(s.answer,s.answerKey,p.pi,k),pass=exact&&s.answerOov==0&&tr==47&&hit==17&&unique>=8;
 cout<<"PROFILE CONTROL "<<seed<<" exact="<<exact<<" train="<<tr<<"/47 hold="<<hit<<"/17 unique="<<unique<<" pass="<<pass<<endl;redProfile7=false;return pass;
}
int main(int argc,char**argv){try{
 bool controls=false,inventory=false;size_t first=27,last=82;int seconds=1200;
 for(int i=1;i<argc;i++){string a=argv[i];if(a=="--controls-only"){controls=true;continue;}if(a=="--inventory"){inventory=true;continue;}if(i+1>=argc)throw runtime_error("missing argument");string v=argv[++i];if(a=="--seed-start")first=stoull(v);else if(a=="--seed-end")last=stoull(v);else if(a=="--seconds")seconds=stoi(v);else throw runtime_error("unknown argument "+a);}
 aff::init();fixed::dictionary();frequencyOrderEnabled=true;exactMrvEnabled=true;buildPrior7();
 auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": ["));auto held=fixed::strings(src,"groups",src.rfind("\"p55\""));fixed::require(train.size()==48&&held.size()==17,"profile");
 if(controls){bool a=profileControl(train,held,3301),b=profileControl(train,held,1033);return a&&b?0:2;}
 Profile7 s(train);fixed::require(s.seeds.size()==93&&first<last&&last<=93&&seconds>0,"seed range");
 s.split(first,last);if(inventory)return 0;
 s.runProfile(seconds);
 if(s.found){auto m=fixed::maps(s.answer,s.answerKey);cout<<"ORIGINAL PROFILE candidate pi";for(int x:s.answer)cout<<" "<<x;cout<<" k";for(int x:s.answerKey)cout<<" "<<x;cout<<endl;for(int i=0;i<47;i++){auto v=fixed::decode(train[i],m,fixed::dict);cout<<"TRAIN "<<i;for(auto&w:v)cout<<" "<<w;cout<<endl;}held[0]=train.back()+held[0];for(int i=0;i<int(held.size());i++){auto v=fixed::decode(held[i],m,fixed::dict);cout<<"HOLD "<<i;for(auto&w:v)cout<<" "<<w;cout<<endl;}}
 if(const char*p=getenv("SFT_OUTPUT")){ofstream o(p);o<<"{\"mode\":\"nonzero-one-adjacent-repeat\",\"found\":"<<(s.found?"true":"false")<<",\"timed\":"<<(s.timed?"true":"false")<<",\"profile_completed\":"<<s.done<<",\"profile_total\":"<<s.branches.size()<<",\"completed_profile_ids\":[";bool first=true;for(size_t i=0;i<s.visited.size();i++)if(s.visited[i]){if(!first)o<<",";first=false;o<<"["<<s.branches[i].seed<<","<<s.branches[i].repeat<<"]";}o<<"],\"full_exhausted\":false,\"completed_ids\":[]}\n";}
 return 0;
}catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
