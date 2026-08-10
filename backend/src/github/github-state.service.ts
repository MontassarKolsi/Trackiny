import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class GithubStateService {

  private readonly states = new Map<string, string>();

  createState(userId: string): string {

    const state = randomUUID();

    this.states.set(state, userId);

    return state;
  }

  consumeState(state: string): string | undefined {

    const userId = this.states.get(state);

    if (!userId) {
      return undefined;
    }

    this.states.delete(state);

    return userId;
  }

}