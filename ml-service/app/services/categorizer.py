"""
Merchant categorizer — classifies Indian bank statement descriptions
into spending categories using TF-IDF + LinearSVC.
Falls back to keyword rules if model is not loaded.
"""
import re
from pathlib import Path

try:
    import joblib
    _MODEL_PATH = Path(__file__).parent.parent.parent / "models" / "categorizer.joblib"
    if _MODEL_PATH.exists():
        _categorizer = joblib.load(str(_MODEL_PATH))
        _LOADED = True
    else:
        _categorizer = None
        _LOADED = False
except Exception:
    _categorizer = None
    _LOADED = False


# Keyword fallback rules — covers common Indian UPI/bank patterns
KEYWORD_RULES = {
    "Food & Dining":     ["zomato","swiggy","dominos","mcdonalds","kfc","pizza","blinkit","dunzo","mess","canteen","restaurant","cafe","biryani","dhaba","hotel","tea","snack","food"],
    "Transport":         ["uber","ola","rapido","redbus","irctc","metro","petrol","fuel","diesel","toll","cab","auto","taxi","namma metro","dmart"],
    "Shopping":          ["amazon","flipkart","myntra","ajio","meesho","snapdeal","nykaa","reliance","big bazaar","dmart","croma","vijay sales","mall"],
    "Utilities":         ["airtel","jio","vodafone","bsnl","vi","electricity","bescom","water","gas","lpg","broadband","fiber","dish","dth","recharge","topup"],
    "Education":         ["byju","unacademy","coursera","udemy","college","university","school","tuition","fee","exam","book","stationery"],
    "Health":            ["apollo","medplus","netmeds","1mg","pharmeasy","hospital","clinic","doctor","medicine","lab","diagnostic","chemist","pharmacy","health"],
    "Entertainment":     ["netflix","hotstar","prime video","spotify","youtube","bookmyshow","inox","pvr","gaming","steam","play store"],
    "Savings/Investment":["sip","mutual fund","groww","zerodha","upstox","ppf","fd","lic","policy","insurance","nps","elss"],
    "Transfer":          ["transfer","neft","rtgs","imps","upi","payment","sent","received","bank"],
    "Other":             [],
}


def categorize_description(description: str) -> str:
    """Return the best category for a merchant description string."""
    desc_lower = description.lower()

    # 1. ML model (if loaded)
    if _LOADED and _categorizer is not None:
        try:
            pred = _categorizer.predict([desc_lower])[0]
            return pred
        except Exception:
            pass

    # 2. Keyword rules fallback
    for category, keywords in KEYWORD_RULES.items():
        for kw in keywords:
            if kw in desc_lower:
                return category

    return "Other"


def categorize_batch(items: list[dict]) -> list[dict]:
    """
    items: list of {idx, description}
    Returns: list of {idx, category, confidence}
    """
    results = []
    descriptions = [it["description"] for it in items]

    # ML batch predict
    if _LOADED and _categorizer is not None:
        try:
            preds = _categorizer.predict(descriptions)
            for it, pred in zip(items, preds):
                results.append({"idx": it["idx"], "category": pred, "confidence": 0.8})
            return results
        except Exception:
            pass

    # Keyword fallback
    for it in items:
        cat = categorize_description(it["description"])
        results.append({"idx": it["idx"], "category": cat, "confidence": 0.6 if cat != "Other" else 0.3})

    return results
