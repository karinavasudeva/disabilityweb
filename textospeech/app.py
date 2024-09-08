from flask import Flask, render_template, request, send_file
from werkzeug.utils import secure_filename
import os
from document_processor import process_document
from formula_interpreter import interpret_formula
from text_to_speech import generate_speech

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    app.logger.info(f"Request method: {request.method}")
    if request.method == 'POST':
        app.logger.info("POST request received")
        if 'file' not in request.files:
            app.logger.error("No file part in the request")
            return 'No file part'
        file = request.files['file']
        app.logger.info(f"File received: {file.filename}")
        if file.filename == '':
            app.logger.error("No selected file")
            return 'No selected file'
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            app.logger.info(f"File saved to {file_path}")
            
            # Process the document
            processed_text = process_document(file_path)
            app.logger.info("Document processed")
            
            # Interpret formulas
            interpreted_text = interpret_formula(processed_text)
            app.logger.info("Formulas interpreted")
            
            # Generate speech
            audio_file = generate_speech(interpreted_text)
            app.logger.info(f"Speech generated: {audio_file}")
            
            return send_file(audio_file, as_attachment=True)
        else:
            app.logger.error(f"Invalid file type: {file.filename}")
            return 'Invalid file type'
    return render_template('upload.html')

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True)