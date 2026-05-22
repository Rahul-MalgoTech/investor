# Investor Backend

Node.js + Express API for Investor authentication.

## Setup

1. Copy `.env.example` to `.env`.
2. Fill `MONGO_URI`, SMTP values, and `JWT_SECRET`.
3. Use your MongoDB Atlas connection string in `MONGO_URI`.
   In development, if MongoDB is unavailable, the backend starts a temporary in-process MongoDB automatically.
4. Install and run:

```bash
npm install
npm run dev
```

## Auth Endpoints

- `POST /api/v1/auth/email/request-otp`
- `POST /api/v1/auth/email/verify-otp`
- `POST /api/v1/auth/phone/request-otp`
- `POST /api/v1/auth/phone/verify-otp`
- `POST /api/v1/auth/google`
- `GET /api/v1/auth/me`

Phone OTP uses `PHONE_DUMMY_OTP` for now. Email OTP uses SMTP through
Nodemailer when `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` are set. If SMTP is
not configured or delivery fails, email login falls back to `EMAIL_FALLBACK_OTP`
(`123456` by default). Resend is not used for OTP delivery.

For Gmail SMTP, enable 2-step verification on the sender Gmail account and use a
Google App Password as `SMTP_PASS`; do not use the normal Gmail password.

## Google Login Flow

1. Create a Web OAuth client in Google Cloud or Firebase.
2. Set that Web client ID as `GOOGLE_CLIENT_ID` on the backend.
3. Build the Flutter app with the same value:

```bash
flutter run --dart-define=GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

The app signs in with Google, receives an ID token, and posts it to
`POST /api/v1/auth/google`. The backend verifies the token audience against
`GOOGLE_CLIENT_ID`, creates or links the user by Google ID/email, then returns
the same JWT response shape used by email and phone login.

For Android, add the app package name and SHA-1/SHA-256 certificate fingerprints
to the Google/Firebase project. For iOS or macOS, also create platform OAuth
clients and pass them as `GOOGLE_IOS_CLIENT_ID` or `GOOGLE_MACOS_CLIENT_ID` when
building the app.

## Request Examples

```bash
curl -X POST https://investor-backend-d42s.onrender.com/api/v1/auth/phone/request-otp \
  -H "Content-Type: application/json" \
  -d '{"countryCode":"+91","phoneNumber":"9876543210"}'
```

```bash
curl -X POST https://investor-backend-d42s.onrender.com/api/v1/auth/phone/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"countryCode":"+91","phoneNumber":"9876543210","otp":"123456"}'
```

```bash
curl -X POST https://investor-backend-d42s.onrender.com/api/v1/auth/email/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

```bash
curl -X POST https://investor-backend-d42s.onrender.com/api/v1/auth/email/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'
```

```bash
curl -X POST https://investor-backend-d42s.onrender.com/api/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"GOOGLE_ID_TOKEN_FROM_APP"}'
```
