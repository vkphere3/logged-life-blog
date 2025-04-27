import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { formatISO, parseISO } from 'date-fns';

const notion = new Client({
  auth: import.meta.env.NOTION_API_KEY,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

export async function getAllPosts() {
  const databaseId = import.meta.env.NOTION_DATABASE_ID;
  
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Published',
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    return response.results.map(page => {
      return formatPost(page);
    });
  } catch (error) {
    console.error('Error fetching posts from Notion:', error);
    return [];
  }
}

export async function getPostBySlug(slug) {
  const databaseId = import.meta.env.NOTION_DATABASE_ID;

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: 'Slug',
            rich_text: {
              equals: slug,
            },
          },
          {
            property: 'Published',
            checkbox: {
              equals: true,
            },
          },
        ],
      },
    });

    if (!response.results.length) {
      throw new Error(`Post with slug "${slug}" not found`);
    }

    const page = response.results[0];
    const post = formatPost(page);

    const mdBlocks = await n2m.pageToMarkdown(page.id);
    post.content = n2m.toMarkdownString(mdBlocks);

    return post;
  } catch (error) {
    console.error(`Error fetching post with slug "${slug}":`, error);
    return null;
  }
}

export async function getAllTags() {
  const databaseId = import.meta.env.NOTION_DATABASE_ID;
  
  try {
    const response = await notion.databases.retrieve({
      database_id: databaseId,
    });

    const tagsProperty = response.properties.Tags;
    if (tagsProperty && tagsProperty.type === 'multi_select') {
      return tagsProperty.multi_select.options.map(option => ({
        id: option.id,
        name: option.name,
        color: option.color,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching tags from Notion:', error);
    return [];
  }
}

export async function getPostsByTag(tagName) {
  const databaseId = import.meta.env.NOTION_DATABASE_ID;
  
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: 'Tags',
            multi_select: {
              contains: tagName,
            },
          },
          {
            property: 'Published',
            checkbox: {
              equals: true,
            },
          },
        ],
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    return response.results.map(page => {
      return formatPost(page);
    });
  } catch (error) {
    console.error(`Error fetching posts with tag "${tagName}":`, error);
    return [];
  }
}

export async function searchPosts(query) {
  const databaseId = import.meta.env.NOTION_DATABASE_ID;
  
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            or: [
              {
                property: 'Name',
                title: {
                  contains: query,
                },
              },
              {
                property: 'Tags',
                multi_select: {
                  contains: query,
                },
              },
            ],
          },
          {
            property: 'Published',
            checkbox: {
              equals: true,
            },
          },
        ],
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    return response.results.map(page => {
      return formatPost(page);
    });
  } catch (error) {
    console.error(`Error searching posts with query "${query}":`, error);
    return [];
  }
}

function formatPost(page) {
  const properties = page.properties;

  const title = properties.Name.title
    .map(text => text.plain_text)
    .join('');
  
  const slug = properties.Slug.rich_text
    .map(text => text.plain_text)
    .join('');
  
  let date = null;
  if (properties.Date.date) {
    date = formatISO(parseISO(properties.Date.date.start));
  }
  
  const tags = properties.Tags.multi_select.map(tag => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
  }));

  let coverImage = null;
  if (page.cover) {
    if (page.cover.type === 'external') {
      coverImage = page.cover.external.url;
    } else if (page.cover.type === 'file') {
      coverImage = page.cover.file.url;
    }
  }

  return {
    id: page.id,
    title,
    slug,
    date,
    tags,
    coverImage,
  };
}