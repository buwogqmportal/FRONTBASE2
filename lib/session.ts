import { browser } from '$app/env';
import { get } from 'svelte/store';
import type { APIUser, APIUserMe } from './api/user';
import { sessionName } from './config';
import { connectionSend, userHasRight } from './stores';
import { convertTo } from './util';
import { APIAuthenticationError, connectionSendPure } from './connection';
import EventEmitter from 'events';
import type { APIResponse } from './api';

export function isSessionIdValid(id: string): boolean {
  return Boolean(id) && id !== '0';
}

export function getSessionFromCookie(): string {
  if (browser) {
    const cookieSession = document.cookie.match(/session=((?:\\;|\\&|[^;&])*)/)?.[1];
    return isSessionIdValid(cookieSession) ? cookieSession : undefined;
  }
}

enum SessionState {
  SignedOut,
  UserGetData,
  SignedIn,
}

class Barrier<T> {
  private callbacks: ((data: T) => void)[] = [];
  private lock = false;

  public get isBlocked(): boolean {
    return this.lock;
  }

  constructor(public fallback?: T) {}

  public wait(): Promise<T> {
    if (!this.lock) return Promise.resolve(this.fallback);
    return new Promise((res) => {
      this.callbacks.push(res);
    });
  }

  public block() {
    this.lock = true;
  }

  public release(data: T) {
    for (const fn of this.callbacks) {
      fn(data);
    }

    this.lock = false;
  }
}

export class SessionBehaviour {
  private busy = false;
  private queue = [];

  private state = SessionState.SignedOut;
  public session = '';
  public user: APIUser;
  public rights: Record<string, boolean>;

  public event = new EventEmitter();

  constructor() {}

  public get isLoading() {
    return this.state === SessionState.UserGetData;
  }

  public get isSignedOut() {
    return this.state === SessionState.SignedOut;
  }

  public get isSignedIn() {
    return this.state === SessionState.SignedIn || this.state === SessionState.UserGetData;
  }

  public async signIn(session: string): Promise<void> {
    await this.enqueue(() => this.signInTrigger(session));
  }

  public async signOut(): Promise<void> {
    await this.enqueue(() => this.signOutTrigger());
  }

  public async checkSession(): Promise<void> {
    await this.enqueue(() => this.checkSessionTrigger());
  }

  private async signInTrigger(session: string) {
    if (this.isSignedIn) return;

    console.log('sign in', session);

    this.event.emit('signin', session);
    this.state = SessionState.UserGetData;
    this.session = session;

    this.event.emit('change');

    this.barrier.block();

    try {
      const response = await connectionSendPure(
        'user/me',
        { user_data_type_priority: 9 },
        {
          session: this.session,
          fetch: window.fetch,
        },
      );

      if (!response.ok) {
        throw new APIAuthenticationError();
      }

      const data = (await response.json()) as APIResponse<APIUserMe>;

      this.updateCookie();

      this.user = Object.fromEntries(
        convertTo.local
          .array(data.success.data.user_data)
          .map((data) => [data.user_data_type_key, data.user_data_data]),
      ) as APIUser;
      this.user.user_ID = data.success.data.user.user_ID;
      this.user.user_mail = data.success.data.user.user_mail;
      this.user.user_type = data.success.data.user.user_type;

      const rights = data.success.data.rights as any as string[];
      this.rights = rights.reduce((obj, right) => ({ ...obj, [right.toLowerCase()]: true }), {});

      userHasRight.set((class_: string, function_ = ''): boolean => {
        class_ = class_.toLowerCase();
        function_ = function_.toLowerCase();
        return Boolean(
          this.rights[`${class_}_`] && (this.rights[`${class_}_${function_}`] || this.rights[`${class_}_*`]),
        );
      });

      this.state = SessionState.SignedIn;

      this.barrier.release(true);

      this.event.emit('change');
    } catch (e) {
      this.signOutTrigger();

      this.barrier.release(false);

      this.event.emit('change');

      console.error(e);
    }
  }

  private signOutTrigger() {
    if (this.isSignedOut) return;

    console.log('sign out');

    this.event.emit('signout');

    if (isSessionIdValid(this.session)) {
      try {
        connectionSendPure('user/logout', {}, { session: this.session });
      } catch (e) {}
    }

    this.state = SessionState.SignedOut;
    this.session = '';
    this.rights = undefined;
    this.user = undefined;
    userHasRight.set(() => false);
    this.clearCookie();

    this.event.emit('change');
  }

  private async checkSessionTrigger() {
    console.log('check session');

    this.event.emit('checksession');

    const wasSignedIn = this.isSignedIn;
    const cookie = getSessionFromCookie();

    if (!wasSignedIn && cookie) {
      await this.signInTrigger(cookie);
    } else if (wasSignedIn && !(await this.isSessionValidOnServer())) {
      this.signOutTrigger();
    }
  }

  public updateCookie() {
    if (browser && this.isSignedIn) {
      this.event.emit('setcookie', this.session);
      document.cookie = `${sessionName}=${this.session};Max-Age=3600;Path=/`;
    }
  }

  private clearCookie() {
    if (browser) {
      this.event.emit('clearcookie');
      document.cookie = `${sessionName}=;Max-Age=0;Path=/`;
    }
  }

  private async isSessionValidOnServer(): Promise<boolean> {
    await this.barrier.wait();

    if (this.checkBarrier.isBlocked) {
      return await this.checkBarrier.wait();
    }

    try {
      this.checkBarrier.block();

      const checkResponse = await connectionSendPure(
        'user/check',
        {},
        {
          session: this.session,
          fetch: window.fetch,
        },
      );

      this.checkBarrier.release(checkResponse.ok);

      return checkResponse.ok;
    } catch (e) {
      return false;
    }
  }

  public barrier = new Barrier(true);
  private checkBarrier = new Barrier<boolean>();

  private enqueue(fn: () => void | Promise<void>) {
    return new Promise((res) => {
      this.queue.push(fn, res);
      this.dequeue();
    });
  }

  private async dequeue() {
    if (this.busy) return;
    this.busy = true;
    while (this.queue.length > 0) {
      const fn = this.queue.shift();
      try {
        await fn();
      } catch (e) {
        console.error(e);
      }
    }
    this.busy = false;
    this.event.emit('flush');
  }
}
