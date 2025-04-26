import os
import re
import sys
import pypandoc

def check_pandoc():
    """Check if pandoc is available and download if needed"""
    try:
        pypandoc.get_pandoc_version()
        print("Pandoc found!")
    except OSError:
        print("Pandoc not found. Downloading Pandoc automatically...")
        pypandoc.download_pandoc()
        print("Pandoc download complete.")

def format_markdown(file_path):
    """Format the markdown file to fix spacing and structure issues"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()

        # Ensure proper spacing after headings
        content = re.sub(r'(#+\s+.*?)\n([^#\n])', r'\1\n\n\2', content)
        
        # Ensure proper spacing before headings (except at file start)
        content = re.sub(r'([^\n])\n(#+\s+)', r'\1\n\n\2', content)
        
        # Remove excessive blank lines (more than 2 consecutive newlines)
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        # Ensure code blocks have proper spacing
        content = re.sub(r'(```.*?```)\n([^#\n])', r'\1\n\n\2', content, flags=re.DOTALL)
        
        # Fix spacing around horizontal rules
        content = re.sub(r'\n---\n', r'\n\n---\n\n', content)

        # Get the directory and filename without extension
        dir_name = os.path.dirname(file_path)
        base_name = os.path.basename(file_path)
        name_without_ext = os.path.splitext(base_name)[0]
        
        # Create a temporary formatted markdown file
        formatted_md_path = os.path.join(dir_name, f"{name_without_ext}_temp.md")
        
        # Write the formatted content to the temporary file
        with open(formatted_md_path, 'w', encoding='utf-8') as file:
            file.write(content)
            
        print(f"Markdown formatting complete!")
        return formatted_md_path
    except Exception as e:
        print(f"Error formatting markdown: {str(e)}")
        return None

def convert_to_docx(input_file):
    """Convert the formatted markdown file to DOCX"""
    try:
        # Create output filename (replace or remove "_formatted" and change extension)
        output_file = os.path.splitext(input_file)[0].replace('_temp', '') + '.docx'
        
        # Convert markdown to docx
        pypandoc.convert_file(
            input_file,
            'docx',
            outputfile=output_file
        )
        
        # Clean up the temporary file
        os.remove(input_file)
        
        print(f"Conversion successful! Output file: {output_file}")
        return True
    except Exception as e:
        print(f"Error during conversion: {str(e)}")
        return False

def main():
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = input("Enter the path to your markdown file: ")
    
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} does not exist.")
        return
    
    # Ensure Pandoc is available
    check_pandoc()
    
    # Format the markdown file
    formatted_file = format_markdown(file_path)
    if formatted_file:
        # Convert the formatted file to DOCX
        convert_to_docx(formatted_file)

if __name__ == "__main__":
    main()
