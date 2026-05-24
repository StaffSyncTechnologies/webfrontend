import { baseApi } from './baseApi';
import { CONTACT } from '../../services/endpoints';

export interface ContactFormData {
  firstName: string;
  lastName?: string;
  email: string;
  subject?: string;
  message: string;
}

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendContactMessage: builder.mutation<void, ContactFormData>({
      query: (data) => ({
        url: CONTACT.SEND,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useSendContactMessageMutation } = contactApi;
