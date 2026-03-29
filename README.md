# Real-Time Currency Converter and Budgeting Tool (BudgetX)

A production-ready full-stack web application designed for seamlessly managing expenses and performing real-time currency conversions. Built purely with HTML, CSS, Vanilla JavaScript on the frontend, and Node.js with Express on the backend.

## 🎨 Theme & UI
- **Design System:** Glassmorphism UI
- **Colors:** Vibrant Orange (`#FF6B00`, `#FF8C00`) & Clean White (`#FFFFFF`)
- **Key Visuals:** CSS Keyframe Animations (Floating Coins, Particles), Chart.js Donut visuals, Count-Up Animations, Smooth Transitions.

## 🚀 Key Features
1. **Full Authentication:** Sign Up, Login, Forgot Password flows with JWT + bcrypt security.
2. **Email Verification:** Styled HTML NodeMailer Welcome Emails.
3. **Currency Converter:** Real-time exchange rate mock integrations with input debouncing and animations.
4. **Expense Tracker:** Add, view, filter, and delete transactions.
5. **Smart Budgeting:** Category specific limits, warning color shifts (Red > 100%, Orange > 80%), and automated suggestion chips based on real-time calculations.

## 📁 Project Structure

\`\`\`
project/
├── frontend/
│   ├── index.html          # Login view
│   ├── signup.html         # Registration view
│   ├── dashboard.html      # Main Auth App view
│   ├── css/
│   │   ├── main.css        # Variables, globals, glassmorphism utilities
│   │   ├── auth.css        # Left/Right auth panels
│   │   └── dashboard.css   # Layout, cards, stats, tables
│   └── js/
│       ├── auth.js         # JWT, requests, interactions
│       ├── converter.js    # Live swap and rate fetch
│       ├── tracker.js      # CRUD UI logic
│       └── dashboard.js    # Chart.js initialization, core coordinator
├── backend/
│   ├── server.js           # Express App Entry & Config
│   ├── models/             # MongoDB Mongoose Schemas (User, Expense)
│   ├── middleware/         # JWT Verification
│   ├── routes/             # API Endpoints
│   ├── utils/              # Emailer Service
│   └── .env.example        # Environment blueprint
└── package.json            # Dependencies
\`\`\`

## 🛠️ Step-by-Step Installation

1. **Clone/Download the directory.**
2. **Install Node Modules**
   \`\`\`bash
   npm install
   \`\`\`
   This will install all required backend packages (`express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `nodemailer`, etc.)

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env` inside the `backend` folder.
   - Set up your `MONGO_URI` (requires MongoDB connection string).
   - Add your `JWT_SECRET`.
   - Set `EMAIL_USER` and `EMAIL_PASS` (e.g., Gmail App Password) for nodemailers.

4. **Start the Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`
   The API server runs on `http://localhost:5000` by default.

5. **Open Frontend**
   Use a Live Server (like VSCode Live Server extension) or open `frontend/index.html` directly in your browser. Ensure the frontend URL connects to `http://localhost:5000`.

## 🌐 API Reference

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate returning user & provide JWT
- `POST /api/auth/forgot` - Reset password emails
- `PUT /api/auth/reset/:token` - Update forgotten password

### Expenses / Budgets
- `GET /api/expenses` - Retrieve all authorized user's expenses
- `POST /api/expenses` - Create a new expense
- `DELETE /api/expenses/:id` - Delete transaction
- `GET /api/expenses/budget` - Fetch current budget limit configurations
- `PUT /api/expenses/budget` - Update limit configurations
- `GET /api/expenses/rates` - Get latest real-time / mock exchange rates

## 💡 Code Assumptions for Beginners
- Clean inline comments provided across logic files to guide students reading through.
- Used DOM classes naturally without transpilers to promote HTML/CSS learning basics.
- Implemented robust error catching via simple UI `Toast Notifications`.
