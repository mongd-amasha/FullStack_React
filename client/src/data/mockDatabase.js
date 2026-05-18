import User from '../models/User'
import Exam from '../models/Exam'
import Question from '../models/Question'
import Submission from '../models/Submission'
import Result from '../models/Result'

export const mockDatabase = {
  users: [
    new User(1, 'Teacher User', 'teacher@example.com', '123456', 'teacher'),
    new User(2, 'Daniel Cohen', 'daniel@example.com', '123456', 'student'),
    new User(3, 'Maya Levi', 'maya@example.com', '123456', 'student'),
    new User(4, 'Yosef Haddad', 'yosef@example.com', '123456', 'student')
  ],

  exams: [
    new Exam(
      1,
      'React Basics Exam',
      'Basic exam about React components and state.',
      'active',
      1,
      [1, 2, 3]
    ),
    new Exam(
      2,
      'JavaScript Fundamentals',
      'Exam about basic JavaScript concepts.',
      'draft',
      1,
      [4, 5, 6]
    )
  ],

  questions: [
    new Question(
      1,
      1,
      'What is JSX?',
      ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'Java Server XML'],
      'JavaScript XML'
    ),
    new Question(
      2,
      1,
      'What is useState used for?',
      ['Routing', 'Managing state', 'Styling', 'Building APIs'],
      'Managing state'
    ),
    new Question(
      3,
      1,
      'What is a component?',
      ['Reusable UI part', 'Database table', 'Server route', 'CSS file'],
      'Reusable UI part'
    ),
    new Question(
      4,
      2,
      'Which keyword creates a constant?',
      ['var', 'let', 'const', 'static'],
      'const'
    ),
    new Question(
      5,
      2,
      'What is an array?',
      ['Single value', 'List of values', 'CSS selector', 'HTML tag'],
      'List of values'
    ),
    new Question(
      6,
      2,
      'What is a function?',
      ['Reusable block of code', 'Database', 'React page', 'Image file'],
      'Reusable block of code'
    )
  ],

  submissions: [
    new Submission(
      1,
      1,
      2,
      {
        1: 'JavaScript XML',
        2: 'Managing state',
        3: 'Reusable UI part'
      },
      '2026-05-20'
    )
  ],

  results: [
    new Result(1, 1, 2, 100, 'passed'),
    new Result(2, 1, 3, 85, 'passed'),
    new Result(3, 1, 4, 70, 'needs review')
  ]
}