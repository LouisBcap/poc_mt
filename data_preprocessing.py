import pandas as pd
import os

def read_csv(file_path: str) -> pd.DataFrame:
    """Use this tool to read XLS files and extract employee hierarchy data
    Returns:
        pd.DataFrame: A dataframe with columns about hierarchical data
    """
    df = pd.read_excel(file_path, dtype={'id': 'Int64'})
    columns_to_convert = df.filter(regex='^(CODE_STRUCTURE_|CODE_NIVEAU)').columns
    df[columns_to_convert] = df[columns_to_convert].astype('Int64')
    df_none = df.where(pd.notnull(df), None)
    return df_none.to_dict(orient="records")


def process(input_csv_path: str, output_csv_path: str) -> pd.DataFrame:
    # Create a new list to store the restructured data
    restructured_data = []
    data = read_csv(input_csv_path)
    # Process each row in the input data
    for row in data:
        # Iterate through each level in the hierarchy
        for i in range(9):  # Assuming maximum 9 levels (0 to 8)
            structure_id = row.get(f'CODE_STRUCTURE_{i}')
            structure_name = row.get(f'STRUCTURE_{i}')
            resp = row.get(f'RESP_{i}')

            # Check if the structure_id is not None
            if pd.notna(structure_id):
                # Determine the parent ID
                parent_id = None if i == 0 else row.get(f'CODE_STRUCTURE_{i-1}')
                # Append the restructured row to the new list
                restructured_data.append({
                    'name': resp,
                    'positionName': structure_name.lower(),
                    'id': structure_id,
                    'parentId': int(parent_id) if parent_id !=None else parent_id
                })

    # Convert the restructured data to a pandas DataFrame
    restructured_df = pd.DataFrame(restructured_data)
    restructured_df[['parentId', 'id']] = restructured_df[['parentId', 'id']].astype(pd.Int64Dtype())
    restructured_df =  restructured_df.drop_duplicates()
    restructured_df['name'] = restructured_df['name'].fillna('Non communiqué')
    # Save the DataFrame to a CSV file
    restructured_df.to_csv(output_csv_path, index=False)

    return restructured_data