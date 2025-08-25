# CourseChecker Documentation

## Overview

CourseChecker is a Next.js-based web application that allows university students to review and rate courses, helping future students make informed decisions about their academic choices. The platform features university course browsing, detailed course reviews, and an AI-powered course advice system.

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript, React 18
- **Styling**: TailwindCSS with custom design system
- **UI Components**: shadcn/ui component library
- **Backend**: Supabase (PostgreSQL database, authentication, real-time)
- **Authentication**: Supabase Auth with email/password and Google OAuth
- **AI Integration**: OpenAI GPT-4 for course advice
- **Email Service**: Resend for transactional emails
- **Deployment**: Vercel (inferred from environment variables)

## Project Structure

```
app/
├── (auth-pages)/           # authentication pages with shared layout
│   ├── forgot-password/
│   ├── reset-password/
│   ├── sign-in/
│   └── sign-up/
├── [universityId]/         # dynamic university routes
│   ├── addCourse/         # add new course form
│   └── page.tsx           # university course listing
├── courses/
│   └── [courseId]/        # dynamic course routes
│       ├── review/        # course review submission
│       └── page.tsx       # course details and reviews
├── api/
│   └── advice/            # openai course advice endpoint
├── auth/
│   └── callback/          # oauth callback handler
├── my-reviews/            # user's submitted reviews
├── verify-email/          # email verification page
├── email-verified/        # email verification success
├── actions.ts             # server actions
├── globals.css            # global styles
├── layout.tsx             # root layout
└── page.tsx              # home page

components/
├── ui/                    # shadcn/ui components
├── tutorial/              # tutorial components (unused in prod)
├── CourseAssistant.tsx    # ai chat widget
├── GoogleSignInButton.tsx # google oauth button
├── LoadingProvider.tsx    # loading animation provider
├── header-auth.tsx        # navigation authentication
└── university-logo.tsx    # university header component

lib/
├── services/
│   └── course-advice-service.ts  # openai integration
└── utils.ts               # utility functions

utils/
└── supabase/             # supabase client configurations
```

## Features

### Core Features

1. **University & Course Browsing**
   - search universities by name
   - browse courses within universities
   - filter courses by subject, rating, and other criteria
   - responsive course cards with key metrics

2. **Course Reviews**
   - detailed multi-step review form
   - rating system (1-5 stars) for multiple aspects:
     - overall course rating
     - assignment difficulty
     - study material usefulness
     - weekly workload hours
     - grading fairness
   - textual reviews and advice
   - professor selection
   - semester tracking

3. **Review Interaction**
   - helpful/unhelpful voting system
   - review sorting and filtering
   - user's review history

4. **Authentication System**
   - email/password authentication
   - google oauth integration
   - email verification requirement
   - university email domain validation
   - password reset functionality

5. **AI Course Advice**
   - openai-powered course assistant
   - context-aware advice based on reviews
   - chat interface with formatted responses

### User Interface

- **Responsive Design**: Mobile-first approach with breakpoints for tablet/desktop
- **Modern UI**: Clean design with purple color scheme
- **Loading States**: Animated loading indicators
- **Form Validation**: Client-side and server-side validation
- **Accessibility**: Screen reader support and keyboard navigation

## Database Schema

Based on the codebase, the main database tables are:

### Universities
```sql
- id (primary key)
- name
- location
- domain (for email verification)
```

### Courses
```sql
- id (primary key)
- university_id (foreign key)
- subject_code (e.g., "CSE")
- course_code (e.g., "101")
- title
- description
- historical_average_grade
```

### Professors
```sql
- id (primary key)
- full_name
- university_id (foreign key)
```

### Course_Professors (junction table)
```sql
- course_id (foreign key)
- professor_id (foreign key)
```

### Course_Reviews
```sql
- id (primary key)
- course_id (foreign key)
- professor_id (foreign key)
- user_id (foreign key)
- rating (1-5)
- study_material_usefulness (1-5)
- assignment_difficulty (1-5)
- hours_per_week
- grading_fairness
- grade_received
- mandatory_attendance (boolean)
- textbook_required (boolean)
- comment
- advice
- semester
- created_at
- is_deleted
```

### Review_Votes
```sql
- review_id (foreign key)
- user_id (foreign key)
- vote (1 for helpful, -1 for unhelpful)
```

### Profiles
```sql
- id (matches auth.users.id)
- email
- verified_at
```

## Authentication Flow

1. **Sign Up**: 
   - user creates account with email/password or google
   - profile created in profiles table
   - verification email sent (if email domain is valid)

2. **Email Verification**:
   - custom verification system using resend
   - university domain validation
   - verified_at timestamp updated on success

3. **Sign In**:
   - email/password or google oauth
   - session managed by supabase auth
   - user state maintained across app

4. **Access Control**:
   - unverified users can browse but cannot submit reviews
   - authentication required for review submission
   - user can only edit their own reviews

## API Routes

### `/api/advice` (POST)
- **Purpose**: Generate AI-powered course advice
- **Input**: `{ courseId: number, question: string }`
- **Process**:
  - Fetch course details and reviews from supabase
  - Generate context-aware prompt
  - Call openai gpt-4 for advice
  - Return formatted response
- **Output**: `{ advice: string, metadata: object }`

## Server Actions

Located in `app/actions.ts`, these handle form submissions and server-side logic:

- `signUpAction`: Handle user registration
- `signInAction`: Handle user login
- `forgotPasswordAction`: Initiate password reset
- `resetPasswordAction`: Complete password reset
- `signOutAction`: Handle user logout
- `sendCustomVerificationAction`: Send custom verification email
- `verifyUserFromToken`: Verify email from token

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_BASE_URL=your_app_url
```

## Development Setup

1. **Clone Repository**
```bash
git clone [repository-url]
cd coursechecker
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env.local
# fill in your environment variables
```

4. **Database Setup**
- create supabase project
- set up database schema
- configure row level security (RLS) policies

5. **Run Development Server**
```bash
npm run dev
```

## Deployment

The application is designed for Vercel deployment:

1. **Vercel Setup**
   - connect github repository to vercel
   - configure environment variables
   - set up custom domain (optional)

2. **Supabase Configuration**
   - update redirect urls for authentication
   - configure email templates
   - set up database backups

3. **Domain Configuration**
   - configure redirect urls in supabase auth settings
   - set up university domain validation

## Key Components

### CourseAssistant
- floating chat widget for ai-powered course advice
- context-aware responses based on course data
- expandable interface with chat history

### LoadingProvider
- global loading state management
- animated loading screens with custom SVG
- route change detection

### UniversityLogo
- dynamic university header component
- responsive text sizing
- gradient background with decorative elements

### Review Forms
- multi-step form with validation
- slider components for ratings
- conditional field rendering

## Performance Considerations

1. **Database Optimization**
   - indexes on frequently queried columns
   - efficient joins for course-professor relationships
   - pagination for large result sets

2. **Client-Side Optimization**
   - debounced search inputs
   - lazy loading of course data
   - optimized images and SVGs

3. **Caching**
   - supabase built-in caching
   - client-side state management
   - browser caching for static assets

## Security Features

1. **Row Level Security (RLS)**
   - users can only edit their own data
   - verified users can submit reviews
   - proper access controls on all tables

2. **Input Validation**
   - server-side validation for all forms
   - sql injection prevention
   - xss protection

3. **Authentication Security**
   - secure password hashing
   - oauth integration
   - session management

## Future Enhancements

1. **Analytics Dashboard**
   - course popularity metrics
   - user engagement tracking
   - review sentiment analysis

2. **Advanced Features**
   - course comparison tools
   - prerequisite tracking
   - degree planning integration

3. **Social Features**
   - user profiles
   - review reactions
   - follow favorite reviewers

4. **Mobile App**
   - react native implementation
   - push notifications for new reviews
   - offline reading capabilities

## Contributing

1. follow typescript best practices
2. use conventional commits
3. ensure all forms have proper validation
4. test authentication flows thoroughly
5. maintain responsive design principles
6. update documentation for new features

## Support

For technical issues:
1. check environment variables
2. verify supabase connection
3. confirm database schema matches expectations
4. test authentication flows in incognito mode
