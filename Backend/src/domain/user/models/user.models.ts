export class User {
  constructor(
    public id: string,
    public username: string,
    public password?: string,
    public role?: string,
    public refreshToken?: string,
  ) {}
}

export class Student extends User {}
export class Teacher extends User {}
export class Admin extends User {}
