import { createApi } from '@reduxjs/toolkit/query/react';
import { CLIENT_REGISTRATION } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';
import type { 
  ValidateInviteCodeRequest,
  ValidateInviteCodeResponse,
  AgencyPublicInfo,
  ClientRegistrationRequest,
  ClientRegistrationResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse
} from '../../types/api';

export const clientRegistrationApi = createApi({
  reducerPath: 'clientRegistrationApi',
  baseQuery: axiosBaseQuery({
    // No auth headers needed for public registration endpoints
  }),
  tagTypes: ['ClientRegistration'],
  endpoints: (builder) => ({
    // Validate invite code
    validateInviteCode: builder.mutation<ValidateInviteCodeResponse, ValidateInviteCodeRequest>({
      query: (request) => ({
        url: CLIENT_REGISTRATION.VALIDATE_CODE,
        method: 'POST',
        body: request,
      }),
    }),
    
    // Register new client company
    registerClient: builder.mutation<ClientRegistrationResponse, ClientRegistrationRequest>({
      query: (request) => ({
        url: CLIENT_REGISTRATION.REGISTER,
        method: 'POST',
        body: request,
      }),
    }),
    
    // Verify email address
    verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailRequest>({
      query: (request) => ({
        url: CLIENT_REGISTRATION.VERIFY_EMAIL,
        method: 'POST',
        body: request,
      }),
    }),
    
    // Resend verification email
    resendVerification: builder.mutation<ResendVerificationResponse, ResendVerificationRequest>({
      query: (request) => ({
        url: CLIENT_REGISTRATION.RESEND_VERIFICATION,
        method: 'POST',
        body: request,
      }),
    }),
    
    // Get agency public info for branding
    getAgencyPublicInfo: builder.query<AgencyPublicInfo, string>({
      query: (inviteCode) => ({
        url: CLIENT_REGISTRATION.AGENCY_INFO(inviteCode),
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useValidateInviteCodeMutation,
  useRegisterClientMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useGetAgencyPublicInfoQuery,
} = clientRegistrationApi;
