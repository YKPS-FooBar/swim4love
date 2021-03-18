# Swim For Love

Code for Swim For Love Charity Event.

The `local` directory is not a part of the Flask web application, but contains scripts to run locally on a computer (e.g. for photos / registration).

## Installation
Make sure you have [Conda](https://github.com/conda/conda) installed.

Run
```sh
git clone https://github.com/YKPS-FooBar/swim4love-2019.git
cd swim4love-2019
conda env create -f environment.yaml
conda activate swim4love
```
in shell to download the code, create the environment, and activate.

## Run
Run
```sh
python run.py
```
in shell with activated conda environment.

### Clean data
The code produces cache and databases storing names of swimmers, avatars, etc. To clean them, run
```sh
python clean.py
```

### Legacy
Pre-2019 code can be found at [yu-george/swim4love](https://github.com/yu-george/swim4love).
