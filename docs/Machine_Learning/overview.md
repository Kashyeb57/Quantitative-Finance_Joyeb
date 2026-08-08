---
sidebar_position: 1
title: Overview
description: Machine learning as a quant's toolkit — a complete, hands-on path from fundamentals to market applications, where every page pairs the core method with a runnable in-browser example and a real quant use.
---

# Machine Learning

For a quant, machine learning is not the destination — it's a **toolkit for finding signal in noisy markets**, estimating probabilities, ranking factors, detecting regimes, and *proving* a model generalizes instead of memorizing the past. This section is a complete, hands-on path through that toolkit. **Every page pairs the core method with a runnable, in-browser example and a concrete markets application** — so it reads as a quant's ML toolkit, not a generic data-science course.

## What ML means for a quant

The mindset here is different from a Kaggle competition. In finance:

- **The signal is faint.** A genuinely good direction model might be 53% accurate. Almost everything is noise, and the edge is a whisper — so honest measurement matters more than a fancy model.
- **The data is non-stationary.** Relationships decay, regimes shift, and last year's model can be actively wrong this year. A backtest that ignores this *will* lie to you.
- **Evaluation is the hard part, not fitting.** Any library fits a model in one line. Knowing whether to *trust* it — walk-forward validation, no leakage, net-of-cost significance — is the actual skill.

So the workhorses (regularized regression, tree ensembles, and careful evaluation) matter far more than the exotic architectures, and every technique in this section is presented with that reality front and center.

## How this section is organized

Work through it top to bottom — it's ordered as a learning path, each page building on the last — or jump to what you need. All pages are written and runnable except Reinforcement Learning.

| # | Topic | What it covers | Its quant angle |
|---|---|---|---|
| 1 | [ML Foundations](/docs/Machine_Learning/foundations) | AI/ML/DL/DS, types of learning, instance-vs-model, the hyperplane, the project lifecycle | the geometry & workflow behind every model |
| 2 | [Regression & Classification](/docs/Machine_Learning/regression-and-classification) | linear/ridge/lasso/elasticnet, logistic (OVR), KNN, Naive Bayes | **factor selection** (Lasso); **probability of default** (logistic) |
| 3 | [Bias-Variance & Model Evaluation](/docs/Machine_Learning/model-evaluation) | bias-variance, cross-validation, metrics, imbalance/SMOTE | **walk-forward validation**; the leakage trap |
| 4 | [Trees, Ensembles & SVM](/docs/Machine_Learning/ensembles-and-svm) | trees → forests → boosting → XGBoost; SVM & SVR | **factor discovery** via feature importance; forecasting returns |
| 5 | [Unsupervised Learning](/docs/Machine_Learning/unsupervised-learning) | PCA, K-Means, hierarchical, DBSCAN, silhouette, anomaly detection | **yield-curve factors**; regime & correlation clustering |
| 6 | [Natural Language Processing](/docs/Machine_Learning/nlp) | preprocessing → BoW → TF-IDF → Word2Vec → sentiment | **news & filing sentiment** signals |
| 7 | [Neural Networks & Deep Learning](/docs/Machine_Learning/deep-learning) | ANN, activations, loss, optimizers, weight-init, CNN/RNN | sequence models; **why deep nets overfit markets** |
| 8 | [Reinforcement Learning](/docs/Machine_Learning/reinforcement-learning) | agents, MDPs, Q-learning, exploration | execution & trading agents *(coming soon)* |
| ★ | [ML for Finance](/docs/Machine_Learning/ml-for-finance) | feature engineering, labeling, the backtest traps | **the capstone** — ML applied to markets, honestly |

Every method also has a **regression twin** where relevant (predict a number, not a class), and each page ends with a short quiz.

## The thread that runs through all of it

One idea reappears on every page, because it's the difference between student work and desk-grade work: **being right isn't enough — you have to validate honestly enough to trust it.** Markets are non-stationary and adversarial, so the same shuffled cross-validation that's fine on images silently leaks the future into the past on a price series. Throughout this section you'll see the same discipline enforced — walk-forward validation, no look-ahead, feature importance treated as a hint (not proof), and a suspiciously good backtest treated as a bug until proven otherwise.

## Where to start

- **New to ML** → begin at [Foundations](/docs/Machine_Learning/foundations) and go in order.
- **Know the basics** → jump to [Model Evaluation](/docs/Machine_Learning/model-evaluation) and [ML for Finance](/docs/Machine_Learning/ml-for-finance), where the quant-specific traps live.
- **Want a scratchpad** → the browser [Notebook](/notebook) runs numpy, pandas, matplotlib, and scikit-learn (the same libraries the examples here use).
- **Need the prerequisites** → regression and inference come first for a reason — see the [Statistics section](/docs/Statistics/regression-analysis) and the runnable [Python course](/docs/Programming/Python).

## Why this section is here

ML for finance is where my data-science training meets my quant interests most directly — the same models I studied become **trading-signal classifiers, factor screens, and regime detectors** when pointed at market data. It's also the pillar where careless methodology is punished fastest, which makes it the best place to practice the honest evaluation the rest of quant work depends on.
