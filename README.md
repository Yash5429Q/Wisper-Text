# 🔐 WhisperText - Cipher Text Converter

A modern, feature-rich web application for encrypting and decrypting text using various cryptographic algorithms. Built with React, featuring user authentication, history tracking, and a beautiful cybersecurity-themed UI.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/react-19.1.1-61DAFB?logo=react)
![Status](https://img.shields.io/badge/status-Active%20Development-brightgreen)

---

## ✨ Features

### Core Encryption Features
- 🔒 **Multiple Cipher Algorithms**
  - Caesar Cipher
  - Vigenère Cipher
  - Substitution Cipher
  - Rail Fence Cipher
  - Atbash Cipher
  - AND MORE...

- 🔓 **Decryption Options**
  - Algorithm-specific decryption
  - Smart Decryption (auto-detect algorithm)
  - Brute-force key guessing

### User Features
- 👤 **Authentication System**
  - User registration and login
  - JWT token-based authentication
  - Secure password storage
  - Session management

- 📜 **History Tracking**
  - Track all encryption/decryption operations
  - Save operation details (algorithm, input, output, key used)
  - Filter and view encryption history
  - Organized by timestamp

### UI/UX Features
- 🎨 **Modern Theme**
  - Dark mode / Light mode toggle
  - Cybersecurity-inspired color scheme
  - Smooth animations and transitions
  - Responsive design

- 📋 **Copy Functionality**
  - One-click copy to clipboard
  - Success notifications

- 📥 **File Operations**
  - Download encrypted/decrypted text
  - Easy text input/output management

---

## 🛠️ Technology Stack

### Frontend
- **React** 19.1.1 - UI library
- **React Router** 7.9.5 - Client-side routing
- **Material-UI** 7.3.4 - UI components
- **Axios** 1.13.2 - HTTP client
- **Crypto-JS** 4.2.0 - Encryption algorithms
- **TweetNaCl.js** 1.0.3 - Modern cryptography

### Backend
- **Node.js** - Runtime environment
- **Express** - Web server framework
- **MySQL** - Database
- **JWT** - Authentication tokens

### Build & Development
- **Vite** 7.1.2 - Build tool & dev server
- **ESLint** 9.33.0 - Code quality

---

## 📋 Project Structure

```
cipher/
├── src/
│   ├── components/           # Reusable React components
│   │   ├── Login.jsx        # Login component
│   │   └── Signup.jsx       # Signup component
│   │
│   ├── App.jsx              # Main app component
│   ├── App.css              # Global app styles
│   ├── ciphers.js           # Cipher algorithm implementations
│   ├── EncryptPage.jsx      # Encryption page
│   ├── DecryptPage.jsx      # Decryption page
│   ├── SmartDecryptPage.jsx # Auto-detection decryption
│   ├── FileHandler.jsx      # File upload/download utilities
│   ├── HistoryPage.jsx      # User history view
│   ├── index.css            # Global styles
│   ├── main.jsx             # React entry point
│   └── styles/
│       └── theme.css        # Theme animations and effects
│
├── backend/
│   ├── server.js            # Express server setup
│   └── package.json         # Backend dependencies
│
├── public/                  # Static assets
├── package.json             # Frontend dependencies
├── vite.config.js          # Vite configuration
├── eslint.config.js        # ESLint configuration
├── LICENSE                 # MIT License
└── README.md              # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MySQL** (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yash5429Q/Wisper-Text.git
   cd cipher
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   Create `.env` files for frontend and backend configuration:
   
   **Backend `.env`:**
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=cipher_db
   JWT_SECRET=your_secret_key
   SERVER_PORT=5000
   ```

5. **Create MySQL database**
   ```bash
   mysql -u root -p
   CREATE DATABASE cipher_db;
   USE cipher_db;
   ```

6. **Create database tables** (Run these SQL commands)
   ```sql
   -- Users table
   CREATE TABLE users (
     id INT PRIMARY KEY AUTO_INCREMENT,
     username VARCHAR(255) UNIQUE NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Encryption history table
   CREATE TABLE encryption_history (
     id INT PRIMARY KEY AUTO_INCREMENT,
     user_id INT NOT NULL,
     operation_type ENUM('encrypt', 'decrypt', 'smart_decrypt') NOT NULL,
     algorithm VARCHAR(100) NOT NULL,
     input_text LONGTEXT,
     output_text LONGTEXT,
     key_used VARCHAR(255),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   );
   ```

7. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

8. **Start the frontend development server** (in a new terminal)
   ```bash
   npm run dev
   ```

9. **Open in browser**
   - Navigate to `http://localhost:5173` (Vite default)
   - Backend runs on `http://localhost:5000`

---

## 📖 Usage

### Encryption
1. Click on **🔒 Encrypt** button
2. Select a cipher algorithm
3. Enter your plaintext and key (if required)
4. Click **Encrypt** to process
5. Copy output or download as file

### Decryption
1. Click on **🔓 Decrypt** button
2. Select the algorithm you used
3. Paste your ciphertext and key
4. Click **Decrypt** to process
5. View or copy the result

### Smart Decryption
1. Click on **🤖 Smart Decrypt** button
2. Paste your ciphertext
3. Select or leave key blank
4. Click **Decrypt** - tries multiple algorithms
5. View results for each algorithm

### History
1. Click on **📜 History** button (requires login)
2. View all your encryption/decryption operations
3. See algorithm used, timestamps, and results

---

## 🔐 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### History
- `GET /history` - Get user's operation history (requires JWT)
- `POST /history` - Save new operation (requires JWT)
- `DELETE /history/:id` - Delete history entry (requires JWT)

### Encryption/Decryption
- `POST /encrypt` - Encrypt text
- `POST /decrypt` - Decrypt text
- `POST /smart-decrypt` - Smart decryption

---

## 🎨 Theme System

The application features a comprehensive theming system:

### Color Schemes
- **Dark Mode**: Navy (#0a0e27), Cyan (#00d4ff), Pink (#ff006e)
- **Light Mode**: White, Blue (#0066cc), Red (#ff0050)

### Animations
- Fade-in effects
- Slide-in animations
- Glow pulse effects
- Smooth transitions

See `src/styles/theme.css` for more details.

---

## 📦 Available Scripts

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend
```bash
npm start        # Start Express server
```

---

## 🗺️ Roadmap

### Phase 1: Enhanced UX (In Progress)
- [ ] Toast notifications for all actions
- [ ] Keyboard shortcuts (Ctrl+E, Ctrl+D, etc.)
- [ ] Character counter and statistics
- [ ] Cipher strength analyzer
- [ ] Favorite ciphers system

### Phase 2: Core Features
- [ ] File batch processing
- [ ] Export history (PDF/CSV)
- [ ] Cipher comparison tool
- [ ] Performance analytics

### Phase 3: Premium Features
- [ ] Multiple theme support
- [ ] Cipher key generator
- [ ] Text encoding options
- [ ] Share encrypted messages

### Phase 4: Enterprise Features
- [ ] Two-factor authentication (2FA)
- [ ] API key management
- [ ] Activity audit trail
- [ ] Encryption certificates

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📋 Requirements for Contributors

- Follow existing code style
- Test your changes thoroughly
- Update documentation as needed
- Ensure no console errors or warnings
- Add comments for complex logic

---

## 🐛 Troubleshooting

### Common Issues

**Issue: MySQL connection error**
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists

**Issue: Port 5173 already in use**
```bash
# Use a different port
npm run dev -- --port 3000
```

**Issue: CORS errors**
- Check backend CORS configuration
- Ensure frontend and backend are both running
- Verify URLs match

**Issue: History not saving**
- Verify JWT token is valid
- Check user is logged in
- Ensure database connection is working

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses
This project uses several open-source libraries. See [LICENSE](LICENSE) for complete third-party license information.

---

## 👥 Authors

- **Yash Verma** - Project Creator

---

## 📧 Support

For support, questions, or feedback:
- Open an issue on GitHub
- Check existing issues for solutions

---

## 🌟 Acknowledgments

- Thanks to all open-source contributors
- Material-UI for amazing components
- React community for excellent libraries
- Crypto-JS and TweetNaCl.js for cryptography

---

## 📈 Project Statistics

- **Algorithms**: 7+ encryption methods
- **Lines of Code**: ~2000+
- **Components**: 8+ React components
- **Development Time**: Ongoing
- **Current Version**: 1.0.0
- **Node Version**: v14+

---

## ✅ Quality Assurance

- ✅ ESLint configured for code quality
- ✅ Error handling throughout app
- ✅ Security best practices implemented
- ✅ Responsive design tested
- ✅ Cross-browser compatible

---

**Happy Encrypting! 🔐✨**
