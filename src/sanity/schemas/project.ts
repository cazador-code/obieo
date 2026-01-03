import { defineType, defineField, defineArrayMember } from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'client',
      title: 'Client Name',
      type: 'string',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Short one-line description',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 2,
      description: 'Brief summary for cards',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'metrics',
      title: 'Key Metrics',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', title: 'Label' }),
            defineField({ name: 'value', type: 'string', title: 'Value' }),
            defineField({ name: 'prefix', type: 'string', title: 'Prefix (e.g., +)' }),
            defineField({ name: 'suffix', type: 'string', title: 'Suffix (e.g., %)' }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'challenge',
      title: 'The Challenge',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'challengeImage',
      title: 'Challenge Image (Before)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'approach',
      title: 'The Approach',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'approachImages',
      title: 'Approach Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'results',
      title: 'The Results',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'resultsImage',
      title: 'Results Image (After)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      client: 'client',
      media: 'thumbnail',
    },
    prepare({ title, client, media }) {
      return {
        title,
        subtitle: client,
        media,
      }
    },
  },
})
