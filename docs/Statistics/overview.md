---
sidebar_position: 1
title: Overview
description: What statistics means for a quant, the topics in this section, and where to start.
---

# Statistics

Descriptive and inferential statistics, hypothesis testing, regression, and time-series methods for quant finance.

## What statistics means for a quant

Statistics is how a quant turns noisy data into decisions you can defend. Every alpha signal, risk estimate, and backtest rests on a statistical claim — *this edge is real and not luck*, *this loss is within normal range*, *this relationship will hold out of sample*. The discipline that separates a quant from a chart-reader is knowing when the data actually supports the claim and when it's fooling you: overfitting, multiple testing, non-stationarity, and survivorship bias punish sloppy inference faster in markets than almost anywhere else.

## Topics in this section

| Topic | What it covers |
|---|---|
| [Descriptive Statistics](/docs/Statistics/descriptive-statistics) | Summarizing data — center, dispersion, percentiles, and covariance vs. correlation, each with a runnable example. |
| [Inferential Statistics & Hypothesis Testing](/docs/Statistics/inferential-statistics) | A full module: the testing mechanism, p-values, Type I/II errors, the z- and t-tests, confidence intervals, chi-square, ANOVA (the F-test and variance partition), and Bayes' theorem — each with an interactive lab. |
| [Regression Analysis](/docs/Statistics/regression-analysis) | OLS, factor models, and the assumptions that make a fit trustworthy. |
| [Time Series (AR, MA, ARIMA, GARCH)](/docs/Statistics/time-series) | Modeling and forecasting serially-dependent financial data. |
| [Bayesian Inference](/docs/Statistics/bayesian-inference) | Priors, posteriors, and MCMC — updating beliefs as data arrives. |
| [Robust & Nonparametric Statistics](/docs/Statistics/robust-statistics) | Methods that survive outliers and fat tails. |
| [Causal Inference & DAGs](/docs/Statistics/causal-inference) | Why correlation isn't causation, and which variables to control for. |

The **Descriptive Statistics**, **Inferential Statistics & Hypothesis Testing**, and **Bayesian Inference** pages are fully written and hands-on — the inferential module has a rejection-region/p-value lab and a Bayes base-rate lab, and the Bayesian page has a live prior→posterior updater.

## Where to start

- Begin with [Descriptive Statistics](/docs/Statistics/descriptive-statistics) — the foundation everything else builds on, from central tendency and volatility to percentiles (Value-at-Risk) and correlation, all with runnable in-browser examples.
- The [Bayesian Inference](/docs/Statistics/bayesian-inference) page has a prior→posterior updater you can drag.
- For intuition-first video explanations of every core method, [StatQuest](https://www.youtube.com/@statquest) is the channel I lean on (linked on [Resources](/resources)).
- Probability is the prerequisite — see the [Probability section](/docs/Probability/foundations).
