// Header-as-plaintext crib path, frozen semantic candidates in
// im-results/lp2-p54-header-cribs-agent7.json. This is a candidate-discovery
// specialization: not an unrestricted or all-title-words negative.
#define LP2_MOMENT_COMPLETION_NO_MAIN
#include "lp2_shared_gp29_q8_moment_completion_sft.cpp"
const vector<string> cribForms{"57ifga39","gio58a96","58okkili","jigod834","d43d8i5q","hkiffa96","f3k1ga39","o7o5i9al","54ioga39","hi6a99al","igi49agq","a90a9agq","no459iff","akk1fa39","ko961o6i","19a1i4fi","hi53ja96","ni13ga39","81jo9agq","531i9o9g","fo95gagq","24if83kn","61o4nao9","fi9ga9ik","dogai95i","i57okagq","fqjjig4q","d3ko4agq","4ikoga39","ani9gagq","f3kag1ni"};
struct Header7:FastSearch{
 using FastSearch::FastSearch;
 struct Branch{size_t seed;Graph graph;};
 vector<Branch>branches;vector<uint8_t>visited;
 void split(const string&header,const vector<string>&forms,size_t first,size_t last,const set<size_t>&excluded){
  auto d=makeGDomain(header,forms,base);size_t total=0;
  for(size_t i=first;i<last;i++)if(!excluded.count(i)){
   unordered_set<string>seen;
   for(const auto&o:d.opts){Graph g;if(extend(seeds[i],o,g)&&seen.insert(g.sig()).second){GFilter f(g);if(!f.saturated)branches.push_back({i,move(g)});}}
   total+=seen.size()!=0;
  }
  stable_sort(branches.begin(),branches.end(),[&](auto&a,auto&b){if(a.graph.dimension()!=b.graph.dimension())return a.graph.dimension()<b.graph.dimension();return seedPrior[a.seed]>seedPrior[b.seed];});
  cout<<"HEADER INVENTORY range="<<first<<":"<<last<<" forms="<<forms.size()<<" header_options="<<d.opts.size()<<" carry_nonempty="<<total<<" branches="<<branches.size()<<endl;
 }
 void runHeader(int seconds){
  next=0;done=0;visited.assign(branches.size(),0);deadline=Clock::now()+chrono::seconds(seconds);
  unsigned n=max(1u,min(4u,thread::hardware_concurrency()));vector<GStats>stats(n);vector<thread>pool;
  for(unsigned t=0;t<n;t++)pool.emplace_back([&,t]{while(!stop()){
   size_t id=next.fetch_add(1);if(id>=branches.size())break;auto&b=branches[id];fastDfs(b.graph,order,maxOov,stats[t],DomainPointers{});
   if(!found&&!timed){visited[id]=1;done++;}
  }});
  for(auto&t:pool)t.join();for(auto&c:stats){total.nodes+=c.nodes;total.joins+=c.joins;total.perms+=c.perms;}
  cout<<"HEADER RESULT found="<<found<<" timed="<<timed<<" completed="<<done<<"/"<<branches.size()<<" nodes="<<total.nodes<<" joins="<<total.joins<<" permutations="<<total.perms<<" OOV="<<answerOov<<endl;
 }
};
bool headerControl(const vector<string>&train,const vector<string>&held,const vector<string>&forms,unsigned seed){
 mt19937 rng(seed+123);fixed::Key k{};k[0]=1;for(int j=1;j<Q;j++)k[j]=rng()%N;k[4]=2;
 vector<string>t(train.begin(),train.end()-1),h(held.begin()+1,held.end());auto p=fixed::plant(t,h,k,seed);auto g=p.train;g.push_back(p.prefix);
 string truth=forms[seed%forms.size()],hc=fixed::encode(truth,p.pi,k,rng()%Q);
 Header7 s(g,0);s.split(hc,forms,0,s.seeds.size(),{});s.runHeader(300);
 if(!s.found){cout<<"HEADER CONTROL "<<seed<<" no key"<<endl;return false;}
 auto m=fixed::maps(s.answer,s.answerKey);int tr=0,hit=0,unique=0;
 for(int i=0;i<47;i++)tr+=fixed::decode(p.train[i],m,fixed::dict).count(p.truthTrain[i]);vector<string>c{p.carry},w{p.truthCarry};c.insert(c.end(),p.hold.begin(),p.hold.end());w.insert(w.end(),p.truthHold.begin(),p.truthHold.end());
 for(int i=0;i<int(c.size());i++){auto z=fixed::decode(c[i],m,fixed::dict);hit+=z.count(w[i]);unique+=z.size()==1&&z.count(w[i]);}
 bool exact=equalAction(s.answer,s.answerKey,p.pi,k),head=fixed::decode(hc,m,fixed::dict).count(truth),pass=exact&&head&&tr==47&&hit==17&&unique>=8;
 cout<<"HEADER CONTROL "<<seed<<" exact="<<exact<<" header="<<head<<" train="<<tr<<"/47 hold="<<hit<<"/17 unique="<<unique<<" pass="<<pass<<endl;return pass;
}
int main(int argc,char**argv){try{
 bool controls=false,inventory=false;size_t first=0,last=93;int seconds=600;set<size_t>excluded;
 for(int i=1;i<argc;i++){string a=argv[i];if(a=="--controls-only"){controls=true;continue;}if(a=="--inventory"){inventory=true;continue;}if(i+1>=argc)throw runtime_error("missing argument");string v=argv[++i];if(a=="--seed-start")first=stoull(v);else if(a=="--seed-end")last=stoull(v);else if(a=="--seconds")seconds=stoi(v);else if(a=="--exclude")excluded.insert(stoull(v));else throw runtime_error("unknown argument "+a);}
 aff::init();fixed::dictionary();frequencyOrderEnabled=true;exactMrvEnabled=true;buildPrior7();
 vector<string>forms;for(auto&w:cribForms)if(fixed::dict.count(w))forms.push_back(w);fixed::require(!forms.empty(),"empty title set");
 auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": ["));auto held=fixed::strings(src,"groups",src.rfind("\"p55\""));fixed::require(train.size()==48&&held.size()==17,"profile");
 if(controls){bool a=headerControl(train,held,forms,3301),b=headerControl(train,held,forms,1033);return a&&b?0:2;}
 string header="jlnr2eaj";Header7 s(train);fixed::require(s.seeds.size()==93&&first<last&&last<=93&&seconds>0,"seed range");s.split(header,forms,first,last,excluded);if(inventory)return 0;s.runHeader(seconds);
 if(s.found){auto m=fixed::maps(s.answer,s.answerKey);cout<<"ORIGINAL HEADER candidate pi";for(int x:s.answer)cout<<" "<<x;cout<<" k";for(int x:s.answerKey)cout<<" "<<x;cout<<endl;auto title=fixed::decode(header,m,fixed::dict);cout<<"TITLE";for(auto&w:title)cout<<" "<<w;cout<<endl;for(int i=0;i<47;i++){auto z=fixed::decode(train[i],m,fixed::dict);cout<<"TRAIN "<<i;for(auto&w:z)cout<<" "<<w;cout<<endl;}held[0]=train.back()+held[0];for(int i=0;i<int(held.size());i++){auto z=fixed::decode(held[i],m,fixed::dict);cout<<"HOLD "<<i;for(auto&w:z)cout<<" "<<w;cout<<endl;}}
 if(const char*p=getenv("SFT_OUTPUT")){ofstream o(p);o<<"{\"mode\":\"source-themed-header-cribs\",\"found\":"<<(s.found?"true":"false")<<",\"timed\":"<<(s.timed?"true":"false")<<",\"completed\":"<<s.done<<",\"total\":"<<s.branches.size()<<",\"full_exhausted\":false,\"completed_ids\":[]}\n";}
 return 0;
}catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
