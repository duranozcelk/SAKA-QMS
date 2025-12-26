def replace_in_paragraph(paragraph, placeholder, value):
    """
    Paragraftaki placeholder'ı değiştir, formatı koru
    """
    if placeholder in paragraph.text:
        # Inline replacement yaparak formatı koruyoruz
        inline = paragraph.runs
        for run in inline:
            if placeholder in run.text:
                run.text = run.text.replace(placeholder, str(value))

def replace_placeholders_in_document(doc, placeholders):
    """
    Belgedeki tüm placeholder'ları değiştir
    placeholders: {"MUSTERI_ADI": "ABC Firma", "TARIH": "25.12.2025", ...}
    """
    # Paragrafları güncelle
    for paragraph in doc.paragraphs:
        for key, value in placeholders.items():
            placeholder_text = f"{{{{{key}}}}}"  # {{KEY}} formatı
            if placeholder_text in paragraph.text:
                replace_in_paragraph(paragraph, placeholder_text, value)
    
    # Tabloları güncelle
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for paragraph in cell.paragraphs:
                    for key, value in placeholders.items():
                        placeholder_text = f"{{{{{key}}}}}"
                        if placeholder_text in paragraph.text:
                            replace_in_paragraph(paragraph, placeholder_text, value)
    
    # Header ve Footer'ları güncelle
    for section in doc.sections:
        # Header
        if section.header:
            for paragraph in section.header.paragraphs:
                for key, value in placeholders.items():
                    placeholder_text = f"{{{{{key}}}}}"
                    if placeholder_text in paragraph.text:
                        replace_in_paragraph(paragraph, placeholder_text, value)
        
        # Footer
        if section.footer:
            for paragraph in section.footer.paragraphs:
                for key, value in placeholders.items():
                    placeholder_text = f"{{{{{key}}}}}"
                    if placeholder_text in paragraph.text:
                        replace_in_paragraph(paragraph, placeholder_text, value)
