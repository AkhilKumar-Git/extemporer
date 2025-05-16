# Extempore AI Coach

A web application designed to help users improve their extempore speaking skills through AI-powered analysis and feedback.

## Problem Statement

Many people struggle with extempore speaking, which is crucial in various professional and personal scenarios. Extempore AI Coach aims to provide a focused, intuitive platform for users to practice and enhance their off-the-cuff speaking abilities using AI.

## Solution Overview

Extempore AI Coach allows users to record video and audio of their speeches. These recordings are then (or will be) analyzed using AI to provide detailed, actionable feedback on aspects like clarity, conciseness, eye contact, pacing, and use of filler words. The platform is built with Next.js and leverages Firebase for backend services (Authentication, Firestore Database, Cloud Storage).

## Features

### Current Core Features
- User authentication (via Firebase Auth).
- Video recording and uploading to Firebase Cloud Storage.
- Playback of recorded videos with a custom player.
- Storage of recording metadata in Firestore.
- Foundation for AI analysis data storage in Firestore.

### Planned AI Analysis Features (Examples)
- **Transcription:** Converting speech to text.
- **Filler Word Detection:** Identifying "um," "uh," etc.
- **Pacing Analysis:** Words per minute.
- **Eye Contact Assessment:** (Requires video analysis).
- **Centering/Framing:** (Requires video analysis).
- **Conciseness & Clarity Scores.**
- **Actionable AI Coaching Feedback.**

### Extensibility
- The platform is designed to be extensible for various communication coaching scenarios beyond extempore speaking.

## Project Structure

This project is a Next.js application. All application code resides in the `src/` directory at the project root.

## Tech Stack

- **Application Logic & Frontend:**
  - Next.js (React framework)
  - TypeScript
  - Material UI for UI components
  - Tailwind CSS (for base styling and utility classes)
  - `react-player` for video playback
- **Backend Services:**
  - Firebase:
    - Firebase Authentication
    - Firestore (Database)
    - Firebase Cloud Storage (for video/audio files)
- **AI/ML (Planned for Backend):**
  - Cloud Functions for Firebase (for backend processing, AI model integration)
  - Google Cloud Speech-to-Text (or other STT services)
  - Potentially other Google Cloud AI services (Vision AI, NLP) or custom models.

## Local Development Setup

1.  **Prerequisites:**
    - Node.js (version specified in `package.json` `engines` field, e.g., >=18.0.0)
    - npm or yarn
    - Firebase project set up with Authentication, Firestore, and Cloud Storage enabled.

2.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd extempore-ai-coach # Or your repository name
    ```

3.  **Install dependencies:**
    From the project root directory:
    ```bash
    npm install 
    # or
    # yarn install
    ```

4.  **Set up Firebase Environment Variables:**
    - Create a file `.env.local` at the project root.
    - Populate it with your Firebase project's configuration. Example:
      ```env
      NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
      NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
      NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id # Optional

      # For NextAuth.js (ensure these are correctly configured for your setup)
      NEXTAUTH_URL=http://localhost:3000 # Or your development URL
      NEXTAUTH_SECRET=a_very_secure_random_string # Generate a strong secret
      ```
    - Ensure your Firebase app has web credentials configured.

5.  **Run the development server:**
    From the project root directory:
    ```bash
    npm run dev
    # or
    # yarn dev 
    ```
    This will start the Next.js development server (typically on `http://localhost:3000`).

## Deployment

Detailed deployment instructions for Vercel and Google Cloud (Cloud Run) can be found in [DEPLOYMENT.MD](DEPLOYMENT.MD).

## How to Use (Current Functionality)

1.  **Sign Up/Log In:** Users authenticate using Firebase.
2.  **Record Speech:** Navigate to the record page, grant camera/microphone permissions, and record a video.
3.  **View Recording:** After recording and upload, users can navigate to the analysis page (currently a placeholder for coaching feedback) to view and play their video.

## Future Plans & AI Integration Roadmap

1.  **Backend AI Processing Pipeline (Cloud Functions for Firebase):**
    - Implement Cloud Functions triggered on new video uploads.
    - **Transcription:** Integrate Speech-to-Text.
    - **Video/Audio Analysis:** Develop or integrate services for eye contact, centering, pacing, pauses, etc.
    - Store all analysis results back into the Recording document in Firestore.
2.  **Display Analysis Results:** Enhance the `/analysis/[recordingId]` page to show transcripts, scores, and visual feedback.
3.  **AI Coach:** Implement LLM-based coaching feedback based on the analysis data.
4.  **Scenario Selection:** Allow users to pick or be assigned practice scenarios.

## Contributing

Contributions are welcome! Please fork the repository, make your changes, and submit a pull request. Ensure your contributions align with the project's coding standards and goals.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, reach out to [Akhil_Kumar_A](https://x.com/Akhil_Kumar_A) or update with a relevant project email.