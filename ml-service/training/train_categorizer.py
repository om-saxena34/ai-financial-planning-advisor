"""
Train a TF-IDF + LinearSVC merchant categorizer for Indian bank statements.
Generates synthetic merchant descriptions with realistic UPI prefixes, merchant names,
and slight noise/abbreviations.
"""
import random
from pathlib import Path
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

CATEGORIES = {
    "Food & Dining": [
        "ZOMATO", "SWIGGY", "DOMINOS PIZZA", "MCDONALDS", "KFC STORE",
        "STARBUCKS COFFEE", "CHAAYOS", "HALDIRAMS", "BURGER KING", "SUBWAY",
        "CAFE COFFEE DAY", "BARBEQUE NATION", "PIZZA HUT", "BLINKIT GROCERIES",
        "ZEPTO MARKET", "DUNZO DAILY", "COLLEGE MESS", "CAMPUS CANTEEN",
        "UDUPI RESTAURANT", "BIRYANI BY KILO", "CHAI POINT", "NATURALS ICE CREAM"
    ],
    "Transport": [
        "UBER INDIA", "OLA CABS", "RAPIDO BIKE", "REDBUS TICKETING", "IRCTC RAILWAYS",
        "DELHI METRO RECHARGE", "NAMMA METRO SMART CARD", "HP PETROL PUMP",
        "INDIAN OIL CORP", "BHARAT PETROLEUM", "FASTAG RECHARGE", "SHELL AUTO SERVICE",
        "AUTO RICKSHAW UPI", "VISTARA AIRLINES", "INDIGO FLIGHTS", "MAKE MY TRIP TRAVEL"
    ],
    "Shopping": [
        "AMAZON PAY INDIA", "FLIPKART INTERNET", "MYNTRA DESIGNS", "AJIO TRENDS",
        "MEESHO ONLINE", "NYKAA BEAUTY", "RELIANCE DIGITAL", "CROMA ELECTRONICS",
        "DECATHLON SPORTS", "H&M CLOTHING", "ZARA RETAIL", "LIFESTYLE STORE",
        "DMART RETAIL", "BIG BAZAAR", "VIJAY SALES", "SHOPPERS STOP"
    ],
    "Utilities": [
        "AIRTEL PREPAID", "JIO RECHARGE", "VI MOBILE BILL", "BESCOM ELECTRICITY",
        "TATA POWER", "MGL GAS BILL", "IGL INDRAPRASTHA GAS", "BWSSB WATER SUPPLY",
        "ACT FIBERNET", "AIRTEL BROADBAND", "TATA PLAY DTH", "SUN DIRECT RECHARGE",
        "MUNICIPAL CORP TAX", "CYLINDER REFILL HPCL"
    ],
    "Education": [
        "COLLEGE SEMESTER FEE", "UNIVERSITY EXAM FEE", "HOSTEL MESS FEE",
        "BYJUS LEARNING", "UNACADEMY SUBSCRIPTION", "COURSERA INC", "UDEMY COURSE",
        "CAMPUS BOOK STORE", "STATIONERY MART", "OXFORD BOOK STORE", "LIBRARY FINE"
    ],
    "Health": [
        "APOLLO PHARMACY", "MEDPLUS CHEMIST", "NETMEDS ORDER", "1MG HEALTHCARE",
        "PHARMEASY MEDICINE", "MAX HEALTHCARE HOSPITAL", "FORTIS CLINIC",
        "DR LAL PATH LABS", "METROPOLIS HEALTH", "DENTAL CLINIC VISIT", "EYE CARE OPTICALS"
    ],
    "Entertainment": [
        "NETFLIX STREAMING", "DISNEY HOTSTAR", "AMAZON PRIME VIDEO", "SPOTIFY PREMIUM",
        "YOUTUBE PREMIUM", "BOOKMYSHOW MOVIES", "PVR CINEMAS", "INOX LEISURE",
        "STEAM GAMES", "PLAYSTATION NETWORK", "GOOGLE PLAY STORE"
    ],
    "Savings/Investment": [
        "ZERODHA BROKING", "GROWW INVEST", "UPSTOX SECURITIES", "KFINTECH MUTUAL FUND",
        "CAMS MUTUAL FUND", "NPS TRUST CONTRIBUTION", "PPF DEPOSIT SBI",
        "LIC INDIA PREMIUM", "HDFC LIFE INSURANCE", "ICICI PRUDENTIAL"
    ],
    "Transfer": [
        "UPI PAYMENT TO FRIEND", "NEFT TRANSFER TO ACC", "IMPS FUND TRANSFER",
        "ATM CASH WITHDRAWAL", "RENT TRANSFER OWNER", "SPLITWISE REPAYMENT"
    ]
}

UPI_HANDLES = ["@okhdfcbank", "@okaxis", "@oksbi", "@paytm", "@ybl", "@upi", "@icici", ""]
PREFIXES = ["UPI/", "POS/", "E-COM/", "ACH/", "IMPS-", "NEFT-", ""]

def generate_samples(samples_per_cat=250):
    texts = []
    labels = []
    
    for category, merchants in CATEGORIES.items():
        for _ in range(samples_per_cat):
            merchant = random.choice(merchants)
            prefix = random.choice(PREFIXES)
            handle = random.choice(UPI_HANDLES)
            txn_id = random.randint(100000, 999999) if random.random() > 0.4 else ""
            
            # Formulate realistic statement text
            if handle and random.random() > 0.3:
                clean_name = merchant.lower().replace(" ", "")
                text = f"{prefix}{clean_name}{txn_id}{handle}"
            elif txn_id:
                text = f"{prefix}{merchant} / REF{txn_id}"
            else:
                text = f"{prefix}{merchant}"
                
            # Random lower/upper variation
            if random.random() > 0.5:
                text = text.lower()
                
            texts.append(text)
            labels.append(category)
            
    return texts, labels

def main():
    print("Generating synthetic merchant training data...")
    X, y = generate_samples(samples_per_cat=300)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print(f"Training on {len(X_train)} samples, testing on {len(X_test)}...")
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5), max_features=10000)),
        ("clf", LinearSVC(C=1.0, random_state=42, max_iter=2000))
    ])
    
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    
    print("Classification report:")
    print(classification_report(y_test, y_pred))
    
    out_dir = Path(__file__).parent.parent / "models"
    out_dir.mkdir(exist_ok=True)
    out_path = out_dir / "categorizer.joblib"
    joblib.dump(pipeline, out_path)
    print(f"Saved categorizer model to {out_path}")

if __name__ == "__main__":
    main()
