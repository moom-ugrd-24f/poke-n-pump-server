
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
PORT=2999
TZ=Asia/Seoul
```

### 3. Start the Server

```bash
node app.js
```

The server will start.

## API Documentation
https://escargots.postman.co/workspace/Escargots~704f90c2-b671-4b1e-aa51-94ce3333183f/collection/39049157-ae3df20c-c85b-4e63-a9d2-e74f553e0397?action=share&creator=39049157

## Database Structure

### User Schema
- `nickname` (String): Unique username, required.
- `inviteCode` (String): Unique invite code for adding friends, required.
- `xp` (Number): Cumulative experience points, defaults to `0`.
- `profilePicture` (String): Path to profile picture, defaults to `uploads/default-profile.jpg`.
- `shamePostSettings` (Object): Settings for shame posting.
  - `isEnabled` (Boolean): Toggles shame posting, defaults to `false`.
  - `noGymStreakLimit` (Number): Threshold for triggering shame posts, defaults to `5`.
- `visibility` (String): User visibility, either `global` or `friend`, defaults to `friend`.
- `workoutPlan` (Object): User's workout plan.
  - `daysOfWeek` (Array of Numbers): Days of the week (0-6) the user plans to work out, defaults to an empty array.
- `todayAttendance` (Boolean): Indicates if the user attended the gym today, defaults to `false`.
- `noGymStreak` (Number): Counts consecutive days without gym attendance, defaults to `0`.
- `friends` (Array of ObjectIds): References to other `User` documents.
- `expoPushToken` (String): Device token for push notifications, required.
- `Timestamps`: Automatically includes `createdAt` and `updatedAt`.

---

### FriendRequest Schema
- `senderId` (ObjectId): Reference to the `User` sending the request, required.
- `receiverId` (ObjectId): Reference to the `User` receiving the request, required.
- `status` (String): Request status, either `pending`, `accepted`, or `rejected`, defaults to `pending`.
- `createdAt` (Date): Timestamp of when the request was created, defaults to `now`.

---

### Poke Schema
- `senderId` (ObjectId): Reference to the `User` sending the poke, required.
- `receiverId` (ObjectId): Reference to the `User` receiving the poke, required.
- `pokeType` (String): Predefined poke type (`Just Poke`, `Join Me`, `Trash Talk`, `Shame Post`), required.
- `timestamp` (Date): Timestamp of when the poke was created, defaults to `now`.


## Contribution

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add a new feature'`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a pull request.

## License

This project is licensed under team Escargots
