export abstract class User {
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
  assignedQuizIds: string[];
  assignedContentIds: string[];
  teachersInCharge: string[];
}
export class Teacher extends User {
  assignedQuizIds: string[];
  assignedContentIds: string[];
  studentsInCharge: string[];
}
export class Admin extends User {}
