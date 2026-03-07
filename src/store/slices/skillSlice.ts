import { createApi } from '@reduxjs/toolkit/query/react';
import { SKILLS } from '../../utilities/endpoint';
import { axiosBaseQuery } from '../../utilities/axiosBaseQuery';
import type { Skill } from '../../types/api';

export const skillApi = createApi({
  reducerPath: 'skillApi',
  baseQuery: axiosBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return headers;
    },
  }),
  tagTypes: ['Skill'],
  endpoints: (builder) => ({
    getSkills: builder.query<Skill[], void>({
      query: () => ({ url: SKILLS.LIST }),
      transformResponse: (response: any) => {
        // Backend returns { success: true, data: { skills: [...], grouped: {...} } }
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.skills)) return response.skills;
        if (Array.isArray(response?.data?.skills)) return response.data.skills;
        if (Array.isArray(response?.data)) return response.data;
        return [];
      },
      providesTags: ['Skill'],
    }),
    getSkillCategories: builder.query<string[], void>({
      query: () => ({ url: SKILLS.CATEGORIES }),
      providesTags: ['Skill'],
    }),
    getSkillsByCategory: builder.query<Skill[], string>({
      query: (category) => ({ url: SKILLS.BY_CATEGORY(category) }),
      providesTags: ['Skill'],
    }),
    createSkill: builder.mutation<Skill, Partial<Skill>>({
      query: (skill) => ({
        url: SKILLS.CREATE,
        method: 'POST',
        body: skill,
      }),
      invalidatesTags: ['Skill'],
    }),
    updateSkill: builder.mutation<Skill, { skillId: string; updates: Partial<Skill> }>({
      query: ({ skillId, updates }) => ({
        url: SKILLS.UPDATE(skillId),
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Skill'],
    }),
    deleteSkill: builder.mutation<void, string>({
      query: (skillId) => ({
        url: SKILLS.DELETE(skillId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Skill'],
    }),
  }),
});

export const {
  useGetSkillsQuery,
  useGetSkillCategoriesQuery,
  useGetSkillsByCategoryQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} = skillApi;
