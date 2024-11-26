# API Dashboard

This is a web-based dashboard that interacts with a RESTful API for authentication, fetching bills, categories, bill summaries, and total items sold. It includes sections for registration, login, and making various API requests, along with responsive design for mobile and desktop views.

## Features
- **Registration**: Register a new user with a username and password.
- **Login**: Login using email and password to receive an access token.
- **Fetch Bills**: Fetch bills from the API using a valid access token.
- **Fetch Categories**: Fetch categories from the API using a valid access token.
- **Fetch Bill Summary**: Fetch the summary of bills from the API using a valid access token.
- **Fetch Total Items Sold**: Fetch the quantity-wise total items sold from the API using a valid access token.

## Prerequisites
- A modern web browser (Chrome, Firefox, Safari, etc.).
- An API server with the following routes (replace with your actual API):
  - `/auth/register` (POST): Register a new user.
  - `/auth/login` (POST): Login and get an access token.
  - `/bill/bills` (GET): Fetch bills.
  - `/categories` (GET): Fetch categories.
  - `/bill/bills/summary` (GET): Fetch bill summary.
  - `/bill/bills/orderlist` (GET): Fetch total items sold.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/api-dashboard.git
    cd api-dashboard
    ```

2. Open `index.html` in a web browser.

## Usage

1. **Set the API URL**: In the "API URL" section, enter the base URL of your API (e.g., `https://pos-backend-jwt-auth.onrender.com//api`).

2. **Register**:
    - Enter a username and password in the "Register" section and click the "Register" button to create a new user.
    - A success message will appear once the registration is complete.

3. **Login**:
    - Enter your email and password in the "Login" section and click the "Login" button.
    - If successful, an access token will be generated and stored in your browser. This token will be automatically filled into the token input fields for the subsequent requests.

4. **Fetch Bills**:
    - After logging in, enter the access token into the "Access Token" field and click "Fetch Bills".
    - The bills will be displayed in a JSON format.

5. **Fetch Categories**:
    - Enter the access token and click "Fetch Categories".
    - The categories will be displayed in a JSON format.

6. **Fetch Bill Summary**:
    - Enter the access token and click "Fetch Summary".
    - The summary will be displayed in a JSON format.

7. **Fetch Total Items Sold**:
    - Enter the access token and click "Fetch Orders".
    - The total items sold will be displayed in a JSON format.

## Responsive Design

The dashboard is designed to be responsive:
- For larger screens (desktop), sections are displayed side by side.
- For medium screens (tablets), the layout adjusts to fit comfortably.
- For smaller screens (mobile), the sections are stacked and font sizes are adjusted to ensure readability.

## Contributing

Feel free to fork the repository, open issues, and submit pull requests. Contributions are always welcome!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
