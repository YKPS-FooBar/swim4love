# Swim For Love 2019

All the code for the 2019 Swim For Love Charity Event.

The code for last year's event can be found at [yu-george/swim4love](https://github.com/yu-george/swim4love).

The `local` directory is not a part of the Flask web application, but contains scripts to run locally on a computer.

## Installation
Make sure you have [*Conda*](https://www.anaconda.com/) installed.

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
