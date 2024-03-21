import { createAction, Property } from '@activepieces/pieces-framework';
import { dustAuth } from '../..';
import { DUST_BASE_URL, getConversationContent } from '../common';
import {
  httpClient,
  HttpMethod,
  HttpRequest,
} from '@activepieces/pieces-common';

export const addFragmentToConversation = createAction({
  // auth: check https://www.activepieces.com/docs/developers/piece-reference/authentication,
  name: 'addFragmentToConversation',
  displayName: 'Add fragment to conversation',
  description:
    'Create a new content fragment in a conversation. Content fragments are pieces of information that can be inserted in conversations and are passed as context to assistants to when they generate an answer.',
  auth: dustAuth,
  props: {
    conversationId: Property.ShortText({
      displayName: 'Conversation ID',
      required: true,
    }),
    fragment: Property.File({ displayName: 'Fragment', required: true }),
    fragmentName: Property.ShortText({
      displayName: 'Fragment name',
      required: false,
    }),
  },
  async run({ auth, propsValue }) {
    const request: HttpRequest = {
      method: HttpMethod.POST,
      url: `${DUST_BASE_URL}/${auth.workspaceId}/assistant/conversations/${propsValue.conversationId}/content_fragments`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.apiKey}`,
      },
      body: JSON.stringify(
        {
          content: propsValue.fragment.data.toString('utf-8'),
          title: propsValue.fragmentName || propsValue.fragment.filename,
          contentType: 'file_attachment',
          context: null,
          url: null,
        },
        (key, value) => (typeof value === 'undefined' ? null : value)
      ),
    };
    return (await httpClient.sendRequest(request)).body;
  },
});
