# Hotel Booking System

A Node.js-based hotel booking system with Express, MySQL, and eSewa payment integration, featuring admin and user management, hotel and room CRUD operations, booking, ratings, and secure authentication.

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Admin Routes](#admin-routes)
  - [User Routes](#user-routes)
  - [Hotel Routes](#hotel-routes)
  - [Room Routes](#room-routes)
  - [Booking Routes](#booking-routes)
  - [Payment Routes](#payment-routes)
  - [Rating Routes](#rating-routes)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features
- **Admin Management**: Create, update, fetch, and manage admin accounts with role-based access control.
- **User Management**: User registration with email verification, login, profile updates, and password reset.
- **Hotel Management**: CRUD operations for hotels, accessible by admins.
- **Room Management**: Create, update, delete, and fetch rooms with pagination and sorting.
- **Booking System**: Users can choose hotels, select rooms, and book with price calculation.
- **Payment Integration**: Secure payment processing via eSewa with success/failure handling.
- **Rating System**: Users can post, update, delete, and view hotel ratings and reviews with pagination.
- **Authentication**: JWT-based authentication for secure access to protected routes.
- **Email Notifications**: Nodemailer for verification codes and password reset links.
- **Session Management**: Stores booking data temporarily during the booking process.

## Technologies
- **Node.js**: Backend runtime environment.
- **Express.js**: Web framework for routing and middleware.
- **MySQL**: Relational database for data storage.
- **JWT**: JSON Web Tokens for authentication.
- **bcryptjs**: Password hashing for secure storage.
- **Nodemailer**: Email sending for verification and password reset.
- **eSewa**: Payment gateway integration.
- **Axios**: HTTP client for API requests.
- **Moment.js**: Date manipulation for booking calculations.
- **Crypto**: Generates secure tokens and signatures.
- **Express-Session**: Session management for booking
- **Other Dependencies**: mysql2, dotenv, path.

## Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ishwor-stha/hotel.git
   cd hotel
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**: Create a `.env` file (see [Environment Variables](#environment-variables)).
4. **Set up MySQL database**: Import the schema from the [Database Schema](#database-schema) section.
5. **Start the server**:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:4000`.

## Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
# Database configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=hotel_booking

# JWT configuration
JWT_SECRET_KEY=your_jwt_secret
JWT_EXPIRY=1h

# Admin role
AROLE=admin

# eSewa payment configuration
PRODUCT_CODE=your_product_code
SECRET_KEY=your_esewa_secret
BASE_URL=https://esewa.com.np/epay/main
SUCCESS_URL=http://localhost:4000/api/user/booking/success
FAILURE_URL=http://localhost:4000/api/user/booking/failed
PAYMENT_URL=your_payment_api_url
STATUS_CHECK=your_status_check_url

# Domain for password reset links
DOMAIN=http://localhost:4000/

# Nodemailer configuration
EMAIL_HOST=smtp.your_email_provider.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

## API Endpoints

### Admin Routes
| Method | Endpoint                              | Description                              | Authentication |
|--------|---------------------------------------|------------------------------------------|---------------|
| GET    | `/api/admin/get`                     | Fetch all admins                        | JWT (Admin)   |
| GET    | `/api/admin/get-one-admin/:id`       | Fetch single admin by ID                | JWT (Admin)   |
| POST   | `/api/admin/create-admin`            | Create a new admin                      | JWT (Admin)   |
| PATCH  | `/api/admin/update-admin`            | Update admin details                    | JWT (Admin)   |
| POST   | `/api/admin/login`                   | Admin login                             | None          |
| POST   | `/api/admin/forget-password`         | Send password reset link                | None          |
| PATCH  | `/api/admin/reset-password/:code`    | Reset admin password                    | None          |
| POST   | `/api/admin/get-booking-data`        | Fetch booking data by email             | JWT (Admin)   |

### User Routes
| Method | Endpoint                              | Description                              | Authentication |
|--------|---------------------------------------|------------------------------------------|---------------|
| POST   | `/api/user/create-user`              | Create a new user with email verification| None          |
| POST   | `/api/user/verify-user`              | Verify user with code                   | None          |
| POST   | `/api/user/login`                    | User login                              | None          |
| GET    | `/api/user/get-user/:userId`         | Fetch user by ID                        | JWT (Admin)   |
| GET    | `/api/user/get-user`                 | Fetch user by email                     | JWT (Admin)   |
| PATCH  | `/api/user/update-user`              | Update user details                     | JWT (User)    |
| POST   | `/api/user/forget-password`          | Send password reset link                | None          |
| PATCH  | `/api/user/reset-password/:code`     | Reset user password                     | None          |
| GET    | `/api/user/get-booking-data`         | Fetch user’s booking data               | JWT (User)    |

### Hotel Routes
| Method | Endpoint                              | Description                              | Authentication |
|--------|---------------------------------------|------------------------------------------|---------------|
| POST   | `/api/hotel/create-hotel`            | Create a new hotel                      | JWT (Admin)   |
| PATCH  | `/api/hotel/update-hotel/:id`        | Update hotel details                    | JWT (Admin)   |
| DELETE | `/api/hotel/delete-hotel/:id`        | Delete a hotel                          | JWT (Admin)   |
| GET    | `/api/hotel/get-all-hotel`           | Fetch all hotels                        | None          |
| GET    | `/api/hotel/get-hotel/:hotelId`      | Fetch hotel by ID                       | None          |

### Room Routes
| Method | Endpoint                              | Description                              | Authentication |
|--------|---------------------------------------|------------------------------------------|---------------|
| POST   | `/api/rooms/create-room`             | Create a new room                       | JWT (Admin)   |
| PATCH  | `/api/rooms/update-room/:roomId`     | Update room details                     | JWT (Admin)   |
| DELETE | `/api/rooms/delete-room/:roomId`     | Delete a room                           | JWT (Admin)   |
| GET    | `/api/rooms/get-rooms?page=1`        | Fetch all rooms with pagination         | None          |
| GET    | `/api/rooms/get-room/:roomId`        | Fetch room by ID                        | None          |

### Booking Routes
| Method | Endpoint                              | Description                              | Authentication |
|--------|---------------------------------------|------------------------------------------|---------------|
| POST   | `/api/user/booking/choose-hotel`     | Choose hotel and booking details        | JWT (User)    |
| POST   | `/api/user/booking/choose-room`      | Select room for booking                 | JWT (User)    |
| POST   | `/api/user/booking/book`             | Complete booking with payment           | JWT (User)    |

### Payment Routes
| Method | Endpoint                              | Description                              | Authentication |
|--------|---------------------------------------|------------------------------------------|---------------|
| POST   | `/api/user/payment/make-payment`     | Initiate eSewa payment                   | JWT (User)    |
| GET    | `/api/user/booking/success`          | Handle successful payment               | JWT (User)    |
| GET    | `/api/user/booking/failed`           | Handle failed payment                   | JWT (User)    |

### Rating Routes
| Method | Endpoint                              | Description                              | Authentication |
|--------|---------------------------------------|------------------------------------------|---------------|
| POST   | `/api/rating/upload-rating`          | Upload a hotel rating/review            | JWT (User)    |
| PATCH  | `/api/rating/update-rating`          | Update a rating/review                  | JWT (User)    |
| GET    | `/api/rating/get-rating`             | Fetch user’s rating for a hotel         | JWT (User)    |
| GET    | `/api/rating/get-ratings`            | Fetch all ratings for a hotel (paginated)| None          |
| DELETE | `/api/rating/delete-rating`          | Delete a rating/review                  | JWT (User)    |

## Usage
1. **Admin Actions**:
   - Log in as an admin (`/api/admin/login`).
   - Create/update hotels (`/api/hotel/*`) and rooms (`/api/rooms/*`).
   - Manage users (`/api/user/get-user/*`) and admins (`/api/admin/*`).
   - View booking data (`/api/admin/get-booking-data`).
2. **User Actions**:
   - Register (`/api/user/create-user`) and verify email (`/api/user/verify-user`).
   - Log in (`/api/user/login`).
   - Book a hotel (`/api/user/booking/*`) and pay via eSewa (`/api/user/payment/make-payment`).
   - Rate/review hotels (`/api/rating/*`).
   - View booking history (`/api/user/get-booking-data`).
3. **Public Actions**:
   - View all hotels (`/api/hotel/get-all-hotel`).
   - View hotel details (`/api/hotel/get-hotel/:hotelId`).
   - View rooms (`/api/rooms/get-rooms`).
   - View hotel ratings (`/api/rating/get-ratings`).

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.


