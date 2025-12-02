import pandas as pd
import ast

# -------- Step 1: Load datasets --------
symptom_df = pd.read_csv("symptomToDisease.csv")
medicine_df = pd.read_csv("DiseaseToMedicine.csv")

print("Symptom CSV columns:", symptom_df.columns.tolist())
print("Medicine CSV columns:", medicine_df.columns.tolist())

# -------- Step 2: Rename columns properly --------
symptom_df.rename(columns={"disease": "Disease", "symptoms": "Symptoms"}, inplace=True)
medicine_df.rename(columns={"disease": "Disease", "drug": "Medicine"}, inplace=True)

# Drop unwanted column if exists
if "Unnamed: 0" in medicine_df.columns:
    medicine_df.drop(columns=["Unnamed: 0"], inplace=True)

# -------- Step 3: Clean and normalize text --------
symptom_df["Disease_clean"] = symptom_df["Disease"].str.lower().str.replace(r'[^a-z\s]', '', regex=True)
medicine_df["Disease_clean"] = medicine_df["Disease"].str.lower().str.replace(r'[^a-z\s]', '', regex=True)

# -------- Step 4: Match diseases by word overlap --------
merged_rows = []

for _, s_row in symptom_df.iterrows():
    s_disease = s_row["Disease_clean"]
    s_symptoms = s_row["Symptoms"]

    s_words = set(str(s_disease).split())

    # Match if at least one word overlaps between diseases
    matches = medicine_df[medicine_df["Disease_clean"].apply(
        lambda m: len(s_words.intersection(set(str(m).split()))) > 0
    )]

    if not matches.empty:
        for _, m_row in matches.iterrows():
            merged_rows.append({
                "Symptoms": s_symptoms,
                "Disease": s_row["Disease"],
                "Medicine": m_row["Medicine"]
            })

# -------- Step 5: Create DataFrame and merge medicines --------
merged_df = pd.DataFrame(merged_rows)

# Group by Disease and Symptoms and collect all medicines in a list
grouped_df = (
    merged_df.groupby(["Disease", "Symptoms"])["Medicine"]
    .apply(list)
    .reset_index()
)

# -------- Step 6: Clean up Symptoms (convert from string to list if needed) --------
def safe_eval(val):
    """Safely convert string lists like "['A', 'B']" into Python lists."""
    try:
        return ast.literal_eval(val)
    except:
        return val

grouped_df["Symptoms"] = grouped_df["Symptoms"].apply(safe_eval)

# -------- Step 7: Save output --------
grouped_df.to_csv("merged_symptom_disease_medicine_grouped.csv", index=False)

print("\n Final merged dataset created successfully!")
print(f"Total unique diseases: {len(grouped_df)}")
print(grouped_df.head(10))
