# Clinical Patient Management System - Backend API

This is the REST API backend for the Clinical Patient Management System. It is built using **Node.js**, **Restify**, and **MongoDB (Mongoose)**. It handles patient registration, clinical data recording, and identifying critical patients.

## 📋 Prerequisites

* **Node.js** (v14 or higher recommended)
* **npm** (Node Package Manager)
* **MongoDB**: You need a MongoDB Atlas account or a local MongoDB instance.

## 🚀 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/Magduri/MAPD712_react_native_Backend](https://github.com/Magduri/MAPD712_react_native_Backend)
    cd MAPD712_react_native_Backend
    ```

2.  **Install Dependencies**
    Run the following command to install the required packages (`restify`, `mongoose`, `restify-errors`):
    ```bash
    npm install
    ```

3.  **Configure Database Connection**
    Open `index.js` and locate the database connection section. You must replace `<Your_Password>` with your actual MongoDB database password.

    ```javascript
    // Inside index.js
    const username = "iamagduri_db_user";
    const password = "<Your_Password>"; // <-- UPDATE THIS
    const dbname = "mapd713db";
    ```

    *Note: If you are running the mobile app on a physical device, change `let HOST = '127.0.0.1';` to `let HOST = '0.0.0.0';` or your machine's local IP address.*

4.  **Run the Server**
    Start the server using Node:
    ```bash
    node index.js
    ```
    You should see a message indicating the server is listening:
    `Server user-api listening at http://127.0.0.1:3000`

## 🧪 Running Integration Tests

The repository includes an integration test suite (located in `test/api.test.js`) to verify the API endpoints using **Mocha** and **Chai**.

### 1. Install Test Dependencies

Run this command to ensure the testing tools are installed:
```bash
npm install --save-dev mocha chai chai-http
```

### 2. Run the Tests
**Important:** Your backend server must be running in a separate terminal window because these are integration tests that hit the live endpoints.

1.  **Terminal 1:** Start the server
    ```bash
    node index.js
    ```

2.  **Terminal 2:** Run the test file
    ```bash
    npx mocha test/api.test.js
    ```

You should see a report in the terminal showing 7 passing tests (Create, Get, Post Data, Delete, etc.).
