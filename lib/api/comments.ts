import { APINotFoundError } from '$baselib/connection';
import type { ConnectionSend } from '$baselib/connection';

export type APIComments = {
  user_ID?: string;
  comments_ID: string;
  comments_body: string;
  comments_create_timestamp?: string;
  comments_create_user_ID?: number;
  comments_source: string;
  comments_source_ID: string;
  creator?: {
    partner_user_ID: string;
    user_personal_gender: string;
    user_personal_image: string;
    user_personal_lastname: string;
    user_personal_prename: string;
    user_personal_title: string;
  };
};

export class CommentsRequest {
  constructor(private session: string, private connectionSend: ConnectionSend) {}

  async setComment(comment: {
    comments_body: string;
    comments_source: string;
    comments_source_ID: string;
  }): Promise<void> {
    const response = await this.connectionSend<APIComments>('comments/set', comment);

    if (response.status === 404) {
      throw new APINotFoundError();
    }
  }
}
