import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { formatISO, parseISO } from 'date-fns';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

const databaseId = process.env.NOTION_DATABASE_ID;

export async function getAllPosts() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Published',
        checkbox: { equals: true },
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
      page_size: 100, // Safe limit
    });

    return response.results.map(page => formatPost(page));
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    throw new Error('Failed to fetch posts.');
  }
}

export async function getPostBySlug(slug) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          { property: 'Slug', rich_text: { equals: slug } },
          { property: 'Published', checkbox: { equals: true } },
        ],
      },
    });

    if (!response.results.length) {
      throw new Error(`Post with slug "${slug}" not found`);
    }

    const page = response.results[0];
    const post = formatPost(page);

    try {
      const mdBlocks = await n2m.pageToMarkdown(page.id);
      post.content = n2m.toMarkdownString(mdBlocks);
    } catch (mdError) {
      console.error('Error converting page to Markdown:', mdError.message);
      post.content = '';
    }

    return post;
  } catch (error) {
    console.error(`Error fetching post "${slug}":`, error.message);
    throw new Error('Failed to fetch post.');
  }
}

export async function getAllTags() {
  try {
    const response = await notion.databases.retrieve({
      database_id: databaseId,
    });

    const tagsProperty = response.properties?.Tags;
    if (tagsProperty?.type === 'multi_select') {
      return tagsProperty.multi_select.options.map(option => ({
        id: option.id,
        name: option.name,
        color: option.color,
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching tags:', error.message);
    throw new Error('Failed to fetch tags.');
  }
}

export async function getPostsByTag(tagName) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          { property: 'Tags', multi_select: { contains: tagName } },
          { property: 'Published', checkbox: { equals: true } },
        ],
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
      page_size: 100,
    });

    return response.results.map(page => formatPost(page));
  } catch (error) {
    console.error(`Error fetching posts by tag "${tagName}":`, error.message);
    throw new Error('Failed to fetch posts by tag.');
  }
}

export async function searchPosts(query) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            or: [
              { property: 'Name', title: { contains: query } },
              { property: 'Tags', multi_select: { contains: query } },
            ],
          },
          { property: 'Published', checkbox: { equals: true } },
        ],
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
      page_size: 100,
    });

    return response.results.map(page => formatPost(page));
  } catch (error) {
    console.error(`Error searching posts for "${query}":`, error.message);
    throw new Error('Failed to search posts.');
  }
}

function formatPost(page) {
  const properties = page.properties || {};

  const title = properties.Name?.title?.map(t => t.plain_text).join('') || 'Untitled';
  const slug = properties.Slug?.rich_text?.map(t => t.plain_text).join('') || '';
  const description = properties.Description?.rich_text?.map(t => t.plain_text).join('') || '';

  let date = null;
  if (properties.Date?.date?.start) {
    try {
      date = formatISO(parseISO(properties.Date.date.start));
    } catch {
      console.warn('Invalid date format:', properties.Date.date.start);
    }
  }

  const tags = properties.Tags?.multi_select?.map(tag => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
  })) || [];

  const coverImage = page.cover
    ? page.cover.type === 'external'
      ? page.cover.external.url
      : page.cover.file.url
    : null;

  return {
    id: page.id,
    title,
    slug,
    description,
    date,
    tags,
    coverImage,
  };
}
