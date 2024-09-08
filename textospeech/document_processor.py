import PyPDF2
from docx import Document

def process_document(file_path):
    file_extension = file_path.split('.')[-1].lower()
    
    if file_extension == 'txt':
        with open(file_path, 'r') as file:
            return file.read()
    
    elif file_extension == 'pdf':
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            return ' '.join([page.extract_text() for page in reader.pages])
    
    elif file_extension == 'docx':
        doc = Document(file_path)
        return ' '.join([paragraph.text for paragraph in doc.paragraphs])
    
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")