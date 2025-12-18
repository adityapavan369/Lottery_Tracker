# Security Guidelines

## Overview

This document outlines the security measures implemented in the Lottery Tracker app and provides guidelines for maintaining security in production environments.

## Authentication & Authorization

### Implementation
- **JWT-based Authentication**: All API endpoints (except login/register) require valid JWT tokens
- **Password Hashing**: Passwords are hashed using bcryptjs with 10 salt rounds before storage
- **Token Expiration**: JWT tokens expire after 7 days
- **User Isolation**: Users can only access their own data through user_id filtering

### Best Practices for Production
1. **Change JWT Secret**: 
   - Update `JWT_SECRET` in `.env` to a strong, randomly generated secret
   - Use at least 32 characters with mixed alphanumeric and special characters
   - Never commit the `.env` file to version control

2. **Use HTTPS**:
   - Always use HTTPS in production to encrypt data in transit
   - Configure SSL/TLS certificates for your backend API

3. **Implement Rate Limiting**:
   - Add rate limiting to prevent brute force attacks
   - Consider using `express-rate-limit` middleware

4. **Strong Password Policy**:
   - Currently, no password complexity requirements are enforced
   - Consider adding minimum length, complexity requirements
   - Implement password reset functionality with email verification

## API Security

### Current Implementation
- CORS enabled for all origins (development only)
- Input validation on required fields
- SQL injection prevention through parameterized queries
- JWT token validation middleware

### Production Recommendations
1. **Restrict CORS**:
   ```javascript
   app.use(cors({
     origin: 'https://your-production-domain.com'
   }));
   ```

2. **Add Request Validation**:
   - Use libraries like `joi` or `express-validator` for comprehensive input validation
   - Validate email formats, password strength, numeric ranges

3. **Add Security Headers**:
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

4. **Implement Logging & Monitoring**:
   - Log authentication attempts
   - Monitor for suspicious activity
   - Set up alerts for failed login attempts

## Database Security

### Current Implementation
- SQLite database with parameterized queries
- Foreign key constraints for data integrity
- User data isolation through user_id

### Production Recommendations
1. **Database Encryption**:
   - Consider using SQLite encryption extensions
   - Or migrate to PostgreSQL/MySQL with encryption at rest

2. **Regular Backups**:
   - Implement automated database backups
   - Store backups securely with encryption

3. **Database Access Control**:
   - Restrict database file permissions
   - Use dedicated database users with minimal privileges (if using PostgreSQL/MySQL)

## Data Protection

### Sensitive Data
- **Stored**: User passwords (hashed), user emails, sales data
- **In Transit**: All API communications should use HTTPS

### Recommendations
1. **PII Protection**:
   - Implement data retention policies
   - Add user data export/deletion features (GDPR compliance)

2. **Audit Logging**:
   - Log all data modifications
   - Track who accessed what data and when

## Mobile App Security

### Current Implementation
- Token stored in AsyncStorage
- Camera permissions requested at runtime
- QR code validation before processing

### Recommendations
1. **Secure Token Storage**:
   - Consider using `expo-secure-store` for more secure token storage
   - Implement biometric authentication for app access

2. **Code Obfuscation**:
   - Use ProGuard (Android) and similar tools for code obfuscation
   - Protect API keys and secrets

3. **SSL Pinning**:
   - Implement certificate pinning to prevent MITM attacks

## Vulnerability Management

### Dependencies
All npm dependencies have been checked for known vulnerabilities:
- **axios**: Updated to v1.12.0 (patched DoS and SSRF vulnerabilities)
- **body-parser**: Updated to v1.20.3 (patched DoS vulnerability)

### Regular Updates
- Monitor dependencies for security updates using `npm audit`
- Update dependencies regularly
- Subscribe to security advisories for used packages

## Incident Response

### If a Security Issue is Discovered
1. **Do Not** publicly disclose the issue
2. Report to the repository maintainers privately
3. Provide detailed information about the vulnerability
4. Allow time for a patch to be developed before disclosure

### For Maintainers
1. Acknowledge receipt of security report within 24 hours
2. Develop and test a fix
3. Release a security patch
4. Notify users to update
5. Publish a security advisory with details

## Security Checklist for Production

- [ ] Change JWT_SECRET to a strong, unique value
- [ ] Enable HTTPS on backend API
- [ ] Restrict CORS to specific domains
- [ ] Add rate limiting to API endpoints
- [ ] Implement request validation with proper error handling
- [ ] Add security headers using helmet
- [ ] Set up database backups
- [ ] Configure database encryption
- [ ] Implement logging and monitoring
- [ ] Use secure token storage in mobile app
- [ ] Add password complexity requirements
- [ ] Implement password reset functionality
- [ ] Set up security scanning in CI/CD
- [ ] Perform security audit/penetration testing
- [ ] Document security policies
- [ ] Train team on security best practices

## Reporting Security Issues

If you discover a security vulnerability, please email the maintainers directly rather than opening a public issue. Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Native Security](https://reactnative.dev/docs/security)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
