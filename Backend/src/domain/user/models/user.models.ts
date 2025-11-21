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

export class Student extends User {}
export class Teacher extends User {}
export class Admin extends User {}
