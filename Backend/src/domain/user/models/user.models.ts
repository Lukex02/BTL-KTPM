export class User {
  constructor(
    public id?: string,
    public username?: string,
    public password?: string,
    public role?: string,
    public name?: string,
    public email?: string,
  ) {}
}

export class Student extends User {
  quizIds: string[];
}
export class Teacher extends User {
  createdQuizIds: string[];
}
export class Admin extends User {}
