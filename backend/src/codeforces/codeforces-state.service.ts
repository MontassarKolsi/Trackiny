import { Injectable } from '@nestjs/common';

interface CodeforcesState {
  userId: string;
  nonce: string;
  expiresAt: number;
}

@Injectable()
export class CodeforcesStateService {
  private readonly states =
    new Map<string, CodeforcesState>();

  createState(
    userId: string,
    nonce: string,
    state: string,
  ) {
    this.states.set(state, {
      userId,
      nonce,
      expiresAt:
        Date.now() +
        10 * 60 * 1000,
    });
  }

  consumeState(
    state: string,
  ):
    | CodeforcesState
    | undefined {
    const stored =
      this.states.get(state);

    if (!stored) {
      return undefined;
    }

    this.states.delete(state);

    if (
      Date.now() >
      stored.expiresAt
    ) {
      return undefined;
    }

    return stored;
  }
}