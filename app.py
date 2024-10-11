from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pandas as pd
from data_preprocessing import process
from fastapi import FastAPI

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

if not os.path.exists('uploads'):
    os.makedirs('uploads')
# app = FastAPI()

# Route for handling the file upload and processing
@app.route('/upload', methods=['POST'])
def upload_file():

    if not os.path.exists('uploads'):
        os.makedirs('uploads')
        
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save the file temporarily
    file_path = os.path.join('uploads', file.filename)
    file.save(file_path)

    # Process the file using the data_preprocessing script
    output_path = os.path.join('uploads', 'processed_org.csv')
    process(file_path, output_path)

    # Read the processed CSV data
    processed_data = pd.read_csv(output_path)

    # Return the processed data as JSON
    return processed_data.to_json(orient='records')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 10000)))
