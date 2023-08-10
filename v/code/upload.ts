// Assume you have an input element for selecting the file
const fileInput = document.getElementById('fileInput') as HTMLInputElement;

// Handle file selection and upload
fileInput.addEventListener('change', async (event) => {
  const selectedFile = fileInput.files[0];
  
  if (selectedFile) {
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
      await fetch('/upload', {
        method: 'POST',
        body: formData,
      });
      console.log('File uploaded successfully.');
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }
});
