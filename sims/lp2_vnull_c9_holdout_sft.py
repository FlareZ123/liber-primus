"""One untuned public holdout for the frozen contextual receiver (not maintainer-sealed)."""
from lp2_vnull_c9_development_sft import main

if __name__ == "__main__":
    main(paths=["data/keys/armada19/bunyan_pilgrims_progress.txt",
                "data/keys/armada19/bacon_novum_organum.txt"],
         seed=18134686853033529934)
