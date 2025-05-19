
# EventPulse - Premium Event Booking Platform

<img src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" width="400" height="200" />

## 🌟 Overview

EventPulse is a modern, user-friendly event booking platform that enables users to discover, explore, and book tickets for various events - from concerts and theater performances to food festivals and tech conferences.

The platform features a visually stunning interface with advanced animations, real-time seat selection, secure payment integration, and personalized booking management.

## ✨ Features

- **Immersive UI/UX**: Beautiful, responsive interface with fluid animations and transitions
- **Event Discovery**: Browse events by category, search, or view featured and upcoming events
- **Secure Authentication**: User registration, login, and password recovery system
- **Real-time Booking**: Select seats, view availability, and make secure payments
- **Booking Management**: Track and manage all your bookings in one place
- **E-Ticket System**: Digital tickets with event details and QR code access
- **Live Chat Support**: Instant assistance with AI-powered chat support
- **Social Sharing**: Share events with friends via generated links

## 🚀 Technologies Used

### Frontend
- **React**: UI component library for building dynamic interfaces
- **TypeScript**: Type-safe JavaScript for robust application development
- **Tailwind CSS**: Utility-first CSS framework for custom designs
- **Framer Motion**: Animation library for fluid motion and transitions
- **React Router**: Client-side routing for single-page application
- **Shadcn UI**: High-quality UI components for rapid development
- **Tanstack Query**: Data fetching and state management
- **Lucide Icons**: Beautiful, consistent icon set
- **Recharts**: Composable chart library for data visualization

### Backend
- **Node.js**: JavaScript runtime for building the server
- **Express**: Web framework for Node.js
- **MySQL**: Relational database management system
- **JWT**: Secure authentication tokens
- **Socket.IO**: Real-time bidirectional communication for chat support
- **QRCode**: Generate QR codes for e-tickets

## 📱 Features by Page

### Home Page
- Featured events carousel
- Category navigation
- Upcoming events listing
- Beautiful hero section with animated elements

### Events Page
- Filter events by category, date, price
- Search functionality
- Pagination for browsing multiple event pages
- Visual indicators for event availability

### Event Detail Page
- Comprehensive event information
- Image gallery
- Location details
- Pricing information
- Seat availability indicator
- Booking button and social sharing

### Booking Page
- Interactive seat selection
- Price calculation based on selection
- Secure payment integration
- Booking confirmation with e-ticket generation

### User Authentication Pages
- Login with email/password
- New user registration
- Password recovery system

### Booking History
- List of all user bookings
- Filtering and sorting options
- E-ticket viewing functionality
- Quick navigation to event details

## 📋 Prerequisites

- Node.js (v16 or higher)
- NPM or Yarn package manager
- MySQL database

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eventpulse.git
   cd eventpulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file based on `.env.example`
   - Configure your database connection and other secrets

4. **Set up the database**
   ```bash
   # Run the database initialization script
   npm run setup-db
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 📦 Project Structure

```
eventpulse/
├── backend/             # Backend code
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   └── server.js        # Server entry point
├── public/              # Static assets
├── src/                 # Frontend source code
│   ├── components/      # Reusable React components
│   │   ├── events/      # Event-related components
│   │   ├── home/        # Homepage components
│   │   ├── layout/      # Layout components
│   │   ├── support/     # Chat support components
│   │   └── ui/          # UI components
│   ├── data/            # Mock data and constants
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── index.html           # HTML entry point
├── package.json         # Project dependencies
├── tailwind.config.ts   # Tailwind configuration
└── vite.config.ts       # Vite configuration
```

## 🧠 Design Decisions

- **Dark Theme**: Modern dark theme with vibrant accent colors for better user experience, especially during evening browsing
- **Animation System**: Thoughtful animations that enhance the user experience without being distracting
- **Component Architecture**: Modular components for maintainability and reusability
- **Responsive Design**: Mobile-first approach ensuring smooth experience across all device sizes
- **Accessibility**: Focus on inclusive design with proper ARIA attributes and keyboard navigation
- **Real-time Elements**: Live updates for seat availability and chat support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 👏 Acknowledgements

- [Unsplash](https://unsplash.com/) for the beautiful images
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful components
- [Framer Motion](https://www.framer.com/motion/) for the animation library
- [React](https://reactjs.org/) for the UI library
- [TypeScript](https://www.typescriptlang.org/) for the type safety
- [Vite](https://vitejs.dev/) for the frontend tooling


