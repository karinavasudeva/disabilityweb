# Accommodation Letter Generator

## Description
The Accommodation Letter Generator is a web application designed to assist in creating personalized accommodation letters for individuals with disabilities. It uses AI to suggest appropriate accommodations based on the person's disability and context, then generates a formal letter requesting these accommodations.

## Features
- AI-powered accommodation suggestions
- Customizable accommodation letters
- User-friendly web interface
- Responsive design with Swiss-inspired styling

## Prerequisites
Before you begin, ensure you have met the following requirements:
- Node.js (v12.0.0 or higher)
- npm (usually comes with Node.js)
- An OpenAI API key

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/accommodation-letter-generator.git
   cd accommodation-letter-generator
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

1. Start the server:
   ```
   npm start
   ```

2. Open a web browser and navigate to `http://localhost:3000` (or the port shown in the console).

3. Fill in the form with the following information:
   - Name of the person requiring accommodations
   - Their disability
   - The context (e.g., student, employee)

4. Click "Generate Letter" to create the accommodation letter.

5. Review the suggested accommodations and the generated letter.

6. You can copy the letter or print it directly from the browser.

## Customization

- To modify the letter template, edit the `generateAccommodationLetter` function in `server.js`.
- To change the styling, update the CSS in the `<style>` section of `public/index.html`.

## Contributing

Contributions to the Accommodation Letter Generator are welcome. Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin <project_name>/<location>`
5. Create the pull request.

Alternatively, see the GitHub documentation on [creating a pull request](https://help.github.com/articles/creating-a-pull-request/).

## License

This project uses the following license: [MIT License](https://opensource.org/licenses/MIT).

## Contact

If you want to contact the maintainer, you can reach out at [your-email@example.com].

## Acknowledgements

- OpenAI for providing the AI model used for generating accommodation suggestions.
- Express.js team for the web application framework.
- All contributors who have helped to enhance this project.
