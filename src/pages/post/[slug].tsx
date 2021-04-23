import { GetStaticPaths, GetStaticProps } from 'next';
import { useCallback, useMemo } from 'react';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { formatDate } from '../../utils/formatDate';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const { isFallback } = useRouter();

  const getReadingTime = useCallback((): number => {
    const contentReduced = post.data.content.reduce((words, content) => {
      let totalWords = `${words}${content.heading} `;

      const body = RichText.asText(content.body);

      totalWords += body;

      return totalWords;
    }, '');

    const wordCount = contentReduced.split(/\s/).length;

    return Math.ceil(wordCount / 200);
  }, [post.data.content]);

  const readTime = useMemo(() => getReadingTime(), [getReadingTime]);

  const formattedDate = useMemo(() => formatDate(post.first_publication_date), [
    post.first_publication_date,
  ]);

  if (isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Header pageTitle={post?.data?.title} />

      <img
        className={styles.banner}
        src={post.data.banner.url}
        alt={post.data.title}
      />

      <main className={commonStyles.pageContainer}>
        <article className={styles.post}>
          <header className={styles.header}>
            <h1 className={styles.title}>{post?.data.title}</h1>
            <div className={styles.details}>
              <span>
                <FiCalendar />
                <time>{formattedDate}</time>
              </span>
              <span>
                <FiUser />
                <span>{post?.data.author}</span>
              </span>
              <span>
                <FiClock />
                <span>{readTime} min</span>
              </span>
            </div>
          </header>

          {post.data.content.map(content => (
            <section key={content.heading}>
              <h2 className={styles.contentTitle}>{content.heading}</h2>

              <div
                className={styles.content}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </section>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.predicates.at('document.type', 'post'),
    {
      fetch: ['post.uid'],
      pageSize: 2,
    }
  );

  return {
    paths: posts.results.map(post => ({
      params: {
        slug: post.uid,
      },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  return {
    props: {
      post: response,
    },
  };
};
