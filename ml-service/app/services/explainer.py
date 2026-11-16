"""
ML explainer — answers "Why am I classified as Saver/Balanced/Overspender?"
Uses manual feature permutation: replace one feature with the population median,
measure probability change. No external explainability libraries needed.
"""
import numpy as np
from app.services.classifier import classifier_service, FEATURE_ORDER
from app.schemas import ClassificationInput

# Population medians (based on training data)
POPULATION_MEDIANS = {
    "age": 28,
    "dependents": 0,
    "risk_profile": 1,
    "monthly_income": 45000.0,
    "total_expenses": 30000.0,
    "savings_rate": 0.25,
    "essential_expense_ratio": 0.60,
    "discretionary_expense_ratio": 0.40,
    "food_ratio": 0.20,
    "entertainment_ratio": 0.10,
    "shopping_ratio": 0.10,
    "debt_to_income": 0.15,
    "emergency_fund_months": 3.0,
    "investment_ratio": 0.10,
}

FEATURE_LABELS = {
    "savings_rate": "How much you save",
    "essential_expense_ratio": "Needs spending ratio",
    "discretionary_expense_ratio": "Wants spending ratio",
    "debt_to_income": "Loan payment burden",
    "emergency_fund_months": "Emergency money saved",
    "investment_ratio": "Monthly investing habit",
    "total_expenses": "Total monthly spending",
    "monthly_income": "Monthly income level",
}

FEATURE_TIPS = {
    "savings_rate": "Saving more each month pushes your class toward Saver.",
    "essential_expense_ratio": "Balancing must-haves with savings builds financial strength.",
    "discretionary_expense_ratio": "Cutting non-essential wants prevents overspending.",
    "debt_to_income": "Lower loan payments free up money and improve your class.",
    "emergency_fund_months": "Having more emergency months gives you a stronger safety cushion.",
    "investment_ratio": "Investing regularly is a key habit for long-term wealth.",
    "total_expenses": "Lowering total spending increases what you keep.",
    "monthly_income": "Higher income gives you more headroom to save and invest.",
}


def explain_class(features: dict) -> dict:
    """
    Returns the top 3 reasons why the user got their current class.
    features: dict with any subset of feature keys (missing values get populated from population medians).
    """
    if not classifier_service.is_loaded:
        classifier_service.load_model()
        if not classifier_service.is_loaded:
            return {"error": "Classifier model not loaded yet. Train models first."}

    # Ensure all required features are present
    full_features = {k: POPULATION_MEDIANS[k] for k in FEATURE_ORDER}
    for k, v in features.items():
        if k in full_features and v is not None:
            full_features[k] = float(v) if not isinstance(v, int) else v

    try:
        base_input = ClassificationInput(**full_features)
        base_result = classifier_service.predict(base_input)
        base_class = base_result.predicted_class
        base_proba = base_result.probabilities.get(base_class, 0.5)
    except Exception as exc:
        return {"error": f"Classification error: {str(exc)}"}

    key_features_to_test = [
        "savings_rate",
        "emergency_fund_months",
        "debt_to_income",
        "investment_ratio",
        "essential_expense_ratio",
        "discretionary_expense_ratio",
    ]

    impacts = []
    for feat in key_features_to_test:
        user_val = full_features.get(feat, POPULATION_MEDIANS[feat])
        median_val = POPULATION_MEDIANS[feat]

        # Swap with median and predict
        modified = dict(full_features)
        modified[feat] = median_val

        try:
            mod_input = ClassificationInput(**modified)
            mod_result = classifier_service.predict(mod_input)
            mod_proba = mod_result.probabilities.get(base_class, 0.0)
            impact = base_proba - mod_proba
        except Exception:
            impact = 0.0

        direction = "helps" if impact >= 0 else "hurts"

        impacts.append({
            "feature": feat,
            "label": FEATURE_LABELS.get(feat, feat),
            "yourValue": round(float(user_val), 2),
            "populationMedian": round(float(median_val), 2),
            "impact": round(float(abs(impact)), 4),
            "direction": direction,
            "tip": FEATURE_TIPS.get(feat, "Keep building consistent money habits."),
        })

    # Sort by absolute impact
    impacts.sort(key=lambda x: x["impact"], reverse=True)
    top3 = impacts[:3]

    return {
        "predictedClass": base_class,
        "confidence": round(base_proba * 100, 1),
        "topReasons": top3,
        "note": "Based on your financial data compared to typical users. Uses synthetic training data.",
    }
