document.getElementById('letterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const disability = document.getElementById('disability').value;
    const context = document.getElementById('context').value;


    const selectedAccommodations = Array.from(document.querySelectorAll('input[name="accommodations"]:checked')).map(input => input.value);


    try {
        const response = await fetch('/generate-letter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, disability, context, accommodations: selectedAccommodations })
        });


        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }


        const data = await response.json();
        document.getElementById('letterOutput').textContent = data.letter;
    } catch (error) {
        console.error('An error occurred:', error);
        document.getElementById('letterOutput').textContent = 'An error occurred while generating the letter.';
    }
});


window.onload = async () => {
    const disabilityDropdown = document.getElementById('disability');
    const response = await fetch('/diseases');
    const diseases = await response.json();


    disabilityDropdown.innerHTML = diseases.map(disease => `<option value="${disease}">${disease}</option>`).join('');
};


document.getElementById('generateAccommodations').addEventListener('click', async () => {
    const disability = document.getElementById('disability').value;


    try {
        const response = await fetch(`/accommodations?disease=${disability}`);
        const data = await response.json();


        const accommodationsList = document.getElementById('accommodationsList');
        accommodationsList.innerHTML = '';


        Object.keys(data.accommodations).forEach(limitation => {
            let section = `<h3>${limitation}</h3><ul>`;
            data.accommodations[limitation].forEach(acc => {
                section += `<li><input type="checkbox" name="accommodations" value="${acc}"> ${acc}</li>`;
            });
            section += '</ul>';
            accommodationsList.innerHTML += section;
        });
    } catch (error) {
        console.error('An error occurred while fetching accommodations:', error);
    }
});


