# Feature: User Exam System

This module handles all functionality related to users taking exams to obtain their AML compliance officer certification.

## Functionalities

### For Users

- View available exam list
- Take exams with timer
- View immediate results
- Check attempt history
- Resume exams in progress

### Main Components

- **ExamView**: Main view for taking an exam
- **ExamList**: List of available exams for the user
- **ExamResult**: Results screen after completing an exam
- **ExamHistory**: History of all user attempts

### Hooks

- **useExam**: Logic for taking an exam (timer, auto-save)
- **useExamList**: Get and filter available exams
- **useExamResult**: Calculate and display results

### Services

- API communication to get exams
- Send answers and results
- Auto-save progress

### Types

- **Exam**: Exam structure
- **Question**: Question structure with options
- **ExamAttempt**: Record of an exam attempt
- **QuestionAttempt**: Individual answer to a question

### Configuration

- Warning time before finishing
- Minimum score for passing
- Available categories and difficulties
- Attempt statuses

## User Flow

1. User sees list of available exams
2. Selects an exam and confirms start
3. Takes the exam with real-time timer
4. System auto-saves progress
5. Upon finishing, sees immediate results
6. Can check history at any time

## Integration

This feature integrates with:

- `certifications`: To generate certifications based on results
- `user-profile`: To show progress and statistics
- `reports`: To generate performance reports
