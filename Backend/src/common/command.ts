export abstract class Command {
  abstract execute(request: any): Promise<any>;
}
