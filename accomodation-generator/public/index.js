const submitBtn = document.getElementById('submitBtn');
const textInput = document.getElementById('text');
const summaryOutput = document.getElementById('summary');

submitBtn.addEventListener('click', () => {
  const text = textInput.value.trim();

  if (text) {
    fetch('/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    })
    .then(response => response.json())
    .then(data => {
      const { summary } = data;
      summaryOutput.innerText = summary;
    })
    .catch(error => {
      console.error('An error occurred:', error);
      summaryOutput.innerText = 'An error occurred.';
    });
  }
});
