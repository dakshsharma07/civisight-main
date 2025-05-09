# CiviSight - County Management & Compliance Portal

CiviSight is a comprehensive platform designed to streamline county management and compliance tracking for state agencies and county administrators. The platform facilitates task management, compliance tracking, and inter-agency communication.

## Features

### Authentication System
- Secure login and signup functionality
- Email-based authentication
- Protected routes for authenticated users
- User role management (State Agency vs County Administrator)

### State Agency Dashboard
The State Agency Dashboard provides a comprehensive overview and management interface for state-level administrators.

#### Overview Tab
- Real-time statistics display:
  - Total number of counties
  - Active tasks across all counties
  - Average completion rate
  - Total population served
- Interactive county cards showing:
  - County name and region
  - Population statistics
  - Active task count
  - Completion rate percentage
  - Quick access to county details

#### Counties Tab
- Grid view of all counties with:
  - County profile information
  - Task completion metrics
  - Population statistics
  - Region classification
- County search functionality
- Export data capability
- Detailed county view with:
  - Task management
  - County-specific statistics
  - Administrative controls

#### Tasks Tab
- Comprehensive task management system:
  - View all tasks across counties
  - Sort tasks by deadline or number of assigned counties
  - Task creation and assignment
  - Task status tracking
  - Priority management
  - Deadline monitoring
- Global task creation:
  - Assign tasks to multiple counties simultaneously
  - Set task priorities and deadlines
  - Add detailed descriptions
  - Track completion status

### County Dashboard (In Development)
*Note: The County Dashboard is currently under development and not yet accessible.*

Planned features include:
- County-specific task management
- Compliance tracking
- Form submission and management
- Obligation tracking
- Profile management
- Reminder system

## Technical Stack
- Frontend: React with TypeScript
- Styling: Tailwind CSS
- Authentication: Firebase Authentication
- Database: Firebase Firestore
- State Management: React Context API

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/civisight-main.git
```

2. Install dependencies
```bash
cd civisight-main
npm install
```

3. Set up Firebase configuration
- Create a Firebase project
- Enable Authentication and Firestore
- Add your Firebase configuration to `src/firebase/config.ts`

4. Start the development server
```bash
npm start
```

## Contributing
Please read our contributing guidelines before submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
For any queries or support, please contact the development team.