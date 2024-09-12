document.getElementById('letterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const disability = document.getElementById('disability').value;
    const context = document.getElementById('context').value;

    try {
        const response = await fetch('/generate-letter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, disability, context })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        document.getElementById('accommodationsList').innerHTML = '<ul>' + 
            data.accommodations.map(acc => `<li>${acc}</li>`).join('') + 
            '</ul>';
        document.getElementById('letterOutput').textContent = data.letter;
    } catch (error) {
        console.error('An error occurred:', error);
        document.getElementById('letterOutput').textContent = 'An error occurred while generating the letter.';
    }
});
