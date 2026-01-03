import { defineType, defineField } from 'sanity'

export const lead = defineType({
  name: 'lead',
  title: 'Lead',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),
    defineField({
      name: 'website',
      title: 'Website URL',
      type: 'url',
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          { title: 'Quiz', value: 'quiz' },
          { title: 'Contact Form', value: 'contact' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'quizAnswers',
      title: 'Quiz Answers',
      type: 'object',
      fields: [
        defineField({ name: 'industry', type: 'string', title: 'Industry' }),
        defineField({ name: 'hasWebsite', type: 'string', title: 'Has Website' }),
        defineField({ name: 'leadSource', type: 'string', title: 'Lead Source' }),
        defineField({ name: 'frustration', type: 'string', title: 'Main Frustration' }),
        defineField({ name: 'goals', type: 'string', title: 'Goals' }),
      ],
    }),
    defineField({
      name: 'score',
      title: 'Quiz Score',
      type: 'number',
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Contacted', value: 'contacted' },
          { title: 'Qualified', value: 'qualified' },
          { title: 'Closed', value: 'closed' },
        ],
      },
      initialValue: 'new',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'email',
      subtitle: 'source',
    },
  },
  orderings: [
    {
      title: 'Newest First',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
})
