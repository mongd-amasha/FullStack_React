export const mockDb = {
  exams: [
    {
      id: 1,
      title: 'React Basics Exam',
      status: 'Active',
      questions: [
        'What is JSX?',
        'What is a React component?',
        'What is useState used for?'
      ]
    },
    {
      id: 2,
      title: 'JavaScript Fundamentals',
      status: 'Draft',
      questions: [
        'Explain let, const, and var.',
        'What is a function?',
        'What is an array?'
      ]
    },
    {
      id: 3,
      title: 'Fullstack Web Final Test',
      status: 'Completed',
      questions: [
        'What is an API?',
        'What is Git used for?',
        'What is deployment?'
      ]
    }
  ],
  students: [
    { id: 1, name: 'Daniel Cohen', score: 92 },
    { id: 2, name: 'Maya Levi', score: 85 },
    { id: 3, name: 'Yosef Haddad', score: 74 },
    { id: 4, name: 'Lina Mansour', score: 98 }
  ]
}