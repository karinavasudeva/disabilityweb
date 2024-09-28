window.onload = async () => {
    const disabilityDropdown = document.getElementById('disability');
    try {
        console.log('Fetching diseases...');
        const response = await fetch('/diseases');
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const disabilities = await response.json();
        console.log('Disabilities received:', disabilities);

        if (disabilities.length > 0) {
            disabilityDropdown.innerHTML = disabilities.map(disability => `<option value="${disability}">${disability}</option>`).join('');
        } else {
            console.log('No disabilities received from the server');
            disabilityDropdown.innerHTML = '<option value="">No disabilities available</option>';
        }
    } catch (error) {
        console.error('Error fetching disabilities:', error);
        disabilityDropdown.innerHTML = '<option value="">Error loading disabilities</option>';
    }
};

document.getElementById('generateAccommodations').addEventListener('click', async () => {
    const disability = document.getElementById('disability').value;

    try {
        console.log('Fetching accommodations for:', disability);
        const response = await fetch(`/accommodations?disease=${encodeURIComponent(disability)}`);
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Accommodations received:', data);

        const accommodationsList = document.getElementById('accommodationsList');
        accommodationsList.innerHTML = '';

        if (Object.keys(data.accommodations).length === 0) {
            accommodationsList.innerHTML = '<p>No accommodations found for this disability.</p>';
        } else {
            Object.keys(data.accommodations).forEach(limitation => {
                let section = `<h3>${limitation}</h3><ul>`;
                data.accommodations[limitation].forEach(acc => {
                    section += `<li><input type="checkbox" name="accommodations" value="${acc}"> ${acc}</li>`;
                });
                section += '</ul>';
                accommodationsList.innerHTML += section;
            });
        }
    } catch (error) {
        console.error('An error occurred while fetching accommodations:', error);
        document.getElementById('accommodationsList').innerHTML = '<p>An error occurred while fetching accommodations.</p>';
    }
});

document.getElementById('letterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const disability = document.getElementById('disability').value;
    const context = document.getElementById('context').value;

    const selectedAccommodations = Array.from(document.querySelectorAll('input[name="accommodations"]:checked')).map(input => input.value);

    try {
        console.log('Generating letter for:', name, disability, context);
        console.log('Selected accommodations:', selectedAccommodations);
        const response = await fetch('/generate-letter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, disability, context, accommodations: selectedAccommodations })
        });
        console.log('Response status:', response.status);

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
