import pandas as pd

def analyze_file(file, file_ext):
    file.seek(0)
    
    try:
        if file_ext == '.csv':
            df = pd.read_csv(file)
        else:
            df = pd.DataFrame()
    except Exception as e:
        print(f"Error reading file: {e}")
        df = pd.DataFrame()
    
    total_rows = len(df)
    total_columns = len(df.columns) if not df.empty else 0
    missing_values = df.isnull().sum().sum() if not df.empty else 0
    duplicate_rows = df.duplicated().sum() if not df.empty else 0
    
    sample_rows = []
    columns = list(df.columns) if not df.empty else []
    
    if not df.empty and total_rows > 0:
        for _, row in df.head(5).iterrows():
            sample_rows.append([str(val) if pd.notna(val) else None for val in row])
    
    return {
        'total_rows': total_rows,
        'total_columns': total_columns,
        'missing_values': missing_values,
        'duplicate_rows': duplicate_rows,
        'sample_rows': sample_rows,
        'columns': columns
    }


def clean_csv_dataframe(df, options):
    changes = {
        'duplicates_removed': 0,
        'missing_values_fixed': 0,
        'headers_standardized': 0,
        'whitespace_trimmed': 0
    }
    
    if options.get('remove_duplicates', True):
        original_rows = len(df)
        df = df.drop_duplicates()
        changes['duplicates_removed'] = original_rows - len(df)
    
    if options.get('fix_missing_values', True):
        missing_before = df.isnull().sum().sum()
        df = df.fillna("Unknown")
        changes['missing_values_fixed'] = missing_before
    
    if options.get('standardize_headers', True):
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_').str.replace('[^a-z0-9_]', '', regex=True)
        changes['headers_standardized'] = 1
    
    if options.get('trim_whitespace', True):
        for col in df.select_dtypes(include=['object']).columns:
            df[col] = df[col].astype(str).str.strip()
    
    return df, changes