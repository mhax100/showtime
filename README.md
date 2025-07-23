# Showtime 🎬

A collaborative movie scheduling app that helps friends find the perfect showtime based on everyone's availability. Think of it as a better, more streamlined Fandango focused on group coordination rather than ticket purchasing.

## Features

- **Group Movie Planning**: Create events and invite friends to coordinate movie outings
- **Availability Tracking**: Visual calendar interface for submitting and viewing group availability
- **Real-time Showtime Search**: Integrates with live movie showtime data from theaters
- **Smart Matching**: Automatically finds showtimes that work for the most people
- **Theater Chain Filtering**: Focus on specific theater chains (Regal, Cinemark, etc.)
- **Visual Analytics**: Heatmap visualization showing when your group is most available

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite build tool
- Tailwind CSS v4
- React Router v7
- Headless UI components

### Backend
- Node.js + Express v5
- PostgreSQL database
- SerpAPI for showtime data
- Jest for testing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- SerpAPI key (for movie showtime data)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/showtime-app.git
cd showtime-app
```

2. Install dependencies:
```bash
# Install backend dependencies
cd api
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# In the api directory, create a .env file
echo "SERPAPI_KEY=your_serpapi_key_here" > api/.env
```

4. Set up the database:
```bash
# Create PostgreSQL database and run migrations
# Update database credentials in api/index.js
```

### Running the Application

1. Start the backend server:
```bash
cd api
npm start
# Server runs on http://localhost:3000
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

## Usage

1. **Create an Event**: Click "Create New Showtime" and enter:
   - Movie name
   - Location (city or zip code)
   - Potential dates
   - Optional theater chain preference

2. **Submit Availability**: 
   - Select your name from the sidebar
   - Click on time slots when you're available
   - Submit your availability

3. **View Showtimes**: 
   - Switch to "Showtimes" view to see matching movie times
   - Green indicators show which users can attend each showing
   - Percentage shows overall group availability

## API Documentation

### Events
- `GET /events` - List all events
- `POST /events` - Create new event
- `GET /events/:id` - Get event details
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### Availabilities
- `GET /availabilities/:event_id` - Get availability for an event
- `POST /availabilities` - Submit availability
- `PUT /availabilities/:event_id` - Update availability

### Showtimes
- `GET /showtimes/search` - Search for movie showtimes
- `GET /showtimes/:event_id` - Get cached showtimes for an event

### Analytics
- `GET /analytics/:event_id` - Get availability analytics and heatmap data

## Project Structure

```
showtime-app/
├── api/                    # Backend Express API
│   ├── analytics.js        # Availability calculations
│   ├── availabilities.js   # Availability endpoints
│   ├── events.js          # Event management
│   ├── showtimes.js       # Movie showtime integration
│   └── users.js           # User management
├── frontend/              # React TypeScript app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── api/          # API client modules
│   │   └── types/        # TypeScript definitions
│   └── public/           # Static assets
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Future Enhancements

- User authentication and accounts
- Email/SMS notifications for event updates
- Mobile app version
- Integration with more movie data sources
- Social features (comments, reactions)
- Ticket purchasing integration
- Real-time updates with WebSockets

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Movie showtime data provided by SerpAPI
- Built with React, Node.js, and PostgreSQL