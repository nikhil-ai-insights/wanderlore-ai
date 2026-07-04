# 🔒 Security Policy

The security of **Wanderlore AI** is a top priority. We appreciate responsible security research and encourage the community to report vulnerabilities that could impact the confidentiality, integrity, or availability of the application.

---

## 🛡 Supported Versions

| Version | Supported |
|----------|-----------|
| Latest Release | ✅ Yes |
| Development Branch | ✅ Yes |
| Older Versions | ❌ No |

Please ensure you're using the latest version before reporting any issue.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability, please **do not disclose it publicly**.

Instead, create a private report including:

- Vulnerability description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Potential impact
- Screenshots or proof of concept (if applicable)

We appreciate responsible disclosure and will investigate all valid reports.

---

## 🔍 Security Scope

Examples of security issues include:

- Authentication or authorization bypass
- Cross-Site Scripting (XSS)
- Injection attacks
- Sensitive data exposure
- Firebase security misconfiguration
- Firestore rule vulnerabilities
- Insecure API usage
- Session management issues
- Dependency vulnerabilities
- Information disclosure
- Privilege escalation
- Client-side security flaws

---

## 🔐 Security Practices

Wanderlore AI follows modern security best practices, including:

- Secure Firebase Authentication
- Firestore Security Rules
- Input validation and sanitization
- Protected routes
- Secure API communication
- Environment variable management
- Least-privilege access
- Graceful error handling
- Regular dependency updates

---

## 🔑 Secrets Management

Never commit sensitive information such as:

- API Keys
- Firebase Service Account Keys
- Access Tokens
- Private Keys
- Passwords
- `.env` files
- Database Credentials

All secrets should be managed using secure environment variables.

---

## 🧪 Security Testing

Before every release, verify:

- Authentication flow
- Authorization rules
- Firestore access control
- Input validation
- Error handling
- Dependency vulnerabilities
- Environment configuration
- API security

---

## 📦 Dependency Management

All third-party packages should:

- Come from trusted sources
- Be actively maintained
- Be regularly updated
- Be reviewed before inclusion

Avoid adding unnecessary dependencies.

---

## 🌐 Supported Browsers

Security is tested on the latest versions of:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari

---

## 🤝 Responsible Disclosure

Please:

- Report vulnerabilities privately.
- Avoid accessing or modifying user data.
- Do not disrupt the availability of the application.
- Respect user privacy at all times.

---

## 🚫 Out of Scope

The following are generally **not** considered security issues:

- UI or styling bugs
- Typographical errors
- Browser compatibility issues
- Feature requests
- Minor performance suggestions without security impact

---

## ❤️ Acknowledgements

We sincerely thank the security researchers, contributors, and community members who help improve the security and reliability of Wanderlore AI.

Your responsible disclosures help make the platform safer for everyone.

Thank you for helping secure **Wanderlore AI**! 🛡️
