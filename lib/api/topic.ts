import { APINotFoundError, APIResponseError } from '$baselib/connection';
import { toArray } from '$baselib/util';
import type { ConnectionSend } from '$baselib/connection';
import type { APIFile } from './file';
import { ArrayParser, NumberParser, ObjectParser, Parser, StringParser } from '$baselib/parse';

export const topicParser = new ObjectParser({
  topic_ID: new StringParser(),
  topic_type: new StringParser(),
  topiy_type_ID: new StringParser(),
  topic_title: new StringParser(),
  newest_message: new StringParser(),
  newest_message_date: new StringParser(),
  unread_topic_items: new StringParser(),
});

export const topicUnreadItemParser = new ObjectParser({
  topic_ID: new StringParser(),
  topic_priority: new StringParser(),
  topic_title: new StringParser(),
  topic_type: new StringParser(),
  topic_type_ID: new StringParser(),
  unread_topic_items: new NumberParser(0),
});

export type APITopicUnreadItem = typeof topicUnreadItemParser extends Parser<infer R> ? R : string;

export const topicUnreadParser = new ObjectParser({
  count_topicitem: new NumberParser(0),
  count_topics: new NumberParser(0),
  items: new ArrayParser(topicUnreadItemParser),
});

export type APITopicUnread = typeof topicUnreadParser extends Parser<infer R> ? R : string;

export type APITopic = {
  topic_ID: string;
  topic_type: string;
  topiy_type_ID: string;
  topic_title: string;
  newest_message: string;
  newest_message_date: string;
  unread_topic_items: string;
};

export type APITopicItem = {
  me: '' | '1';
  topic_item_ID: string;
  topic_item_content: string;
  user_ID: string;
  topic_item_created: string;
  user_personal_prename: string;
  user_personal_lastname: string;
  user_personal_image: string;
  topic_item_attachment: string;
  file: APIFile[];
};

export type APITopicMember = {
  topic_ID: string;
  topic_member_function: string;
};

export type APIUnreadTopic = {
  count_topicitem: number;
  count_topics: number;
  items: APITopic[];
};

export class TopicRequest {
  constructor(private session: string, private connectionSend: ConnectionSend) {}

  async setTopicItem(item: {
    topic_ID: string;
    topic_item_content: string;
    topic_item_attachment?: string;
  }): Promise<string | void> {
    const response = await this.connectionSend<void>('topicitem/set', item);

    if (response.status === 404) {
      throw new APINotFoundError();
    }

    if (response.status === 403) {
      throw new APIResponseError(response.error.message, 403);
    }
  }

  async setTopicMember(member: { topic_ID: string; topic_member_function: string }): Promise<void> {
    const response = await this.connectionSend<void>('topicmember/set', member);

    if (response.status === 404) {
      throw new APINotFoundError();
    }
  }

  async setTopic(item: { topic_title: string; topic_type: string; topic_type_ID: string }): Promise<string> {
    const response = await this.connectionSend<string>('topic/set', item);

    if (response.status === 404) {
      throw new APINotFoundError();
    }

    return response.success.data;
  }

  async getTopicsByType(
    topic_type: string,
    topic_type_ID: string,
    show_my_topics: boolean = false,
  ): Promise<APITopic[]> {
    const response = await this.connectionSend<APITopic[]>('topic/gettopictype', {
      topic_type,
      topic_type_ID,
      show_my_topics,
    });

    if (response.status === 404) {
      throw new APINotFoundError();
    }

    return toArray(response.success.data);
  }

  async getAllUnreadTopics(): Promise<APITopic> {
    const response = await this.connectionSend<APITopic>('topic/getallunread');

    if (response.status === 404) {
      throw new APINotFoundError();
    }

    return response.success.data;
  }
}
