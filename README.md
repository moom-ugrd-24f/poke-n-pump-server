
# PokePump - Gym Motivation App Backend

PokePump is the backend for an app designed to motivate users to attend the gym through friendly competition, social interactions, and gamification. Users can add friends, send pokes to encourage gym attendance, shame post for added motivation, and track XP and leaderboard standings.

## Key Features

- **Friend Management**: Add and remove friends using a unique invite code; only accepted friends appear on the friend list.
- **Gym Motivation with Pokes**: Users can poke friends who haven’t attended the gym yet, providing gentle reminders or challenges.
- **Shame Posting**: Users who don’t attend the gym consistently can be highlighted in the shame post list.
- **XP and Leaderboard**: Users earn XP through gym attendance and interactions, with their progress reflected on a leaderboard.

## Installation and Setup

### 1. Clone the Repository and Install Dependencies

```bash
git clone https://github.com/moom-ugrd-24f/poke-n-pump-server.git
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root and add your MongoDB URI and other necessary settings.

```plaintext
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@pokepump.xddsr.mongodb.net/?retryWrites=true&w=majority&appName=PokePump
PORT=3000
```

### 3. Start the Server

```bash
node app.js
```

The server will start at `http://localhost:3000`.

## API Documentation
https://escargots.postman.co/workspace/Escargots~704f90c2-b671-4b1e-aa51-94ce3333183f/collection/39049157-ae3df20c-c85b-4e63-a9d2-e74f553e0397?action=share&creator=39049157

## Database Structure

- **User Schema**
  - `nickname`: String, unique username
  - `inviteCode`: String, unique invite code for adding friends
  - `xp`: Number, cumulative experience points
  - `shamePostSettings`: Object, includes `isEnabled` (Boolean) and `noGymStreakLimit` (Number)
  - `workoutPlan`: Object, includes `daysOfWeek` (Array of Numbers representing workout days)
  - `todayAttendance`: Boolean, indicates if the user attended the gym today
  - `noGymStreak`: Number, counts consecutive days without gym attendance
  - `friends`: Array of ObjectIds, references User model

- **FriendRequest Schema**
  - `sender`: ObjectId, references the User sending the request
  - `receiver`: ObjectId, references the User receiving the request
  - `status`: String, represents the request status (`pending`, `accepted`, `rejected`)

## Contribution

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add a new feature'`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a pull request.

## License

This project is licensed under team Escargots
