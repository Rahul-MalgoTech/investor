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

Phone OTP uses `PHONE_DUMMY_OTP` for now. Email OTP uses SMTP through Nodemailer.

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
curl -X POST https://investor-backend-d42s.onrender.com/api/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"GOOGLE_ID_TOKEN_FROM_APP"}'
```
