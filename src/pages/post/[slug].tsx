import { GetStaticPaths, GetStaticProps } from 'next';
import { useCallback, useMemo } from 'react';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { format } from 'date-fns';
import brazilianLocale from 'date-fns/locale/pt-BR';

import { formatDate } from '../../utils/formatDate';
import { getPrismicClient } from '../../services/prismic';

import { Header } from '../../components/Header';
import { UtterancesCommentaries } from '../../components/UtterancesCommentaries';
import { ExitPreviewButton } from '../../components/ExitPreviewButton';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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
    prev_post?: {
      uid?: string;
      title?: string;
    };
    next_post?: {
      uid?: string;
      title?: string;
    };
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
}

export default function Post({ post, preview }: PostProps): JSX.Element {
  const { isFallback } = useRouter();

  const getReadingTime = useCallback((): number => {
    if (!post?.data?.content) {
      return 0;
    }
    const contentReduced = post.data.content.reduce((words, content) => {
      let totalWords = `${words}${content.heading} `;

      const body = RichText.asText(content.body);

      totalWords += body;

      return totalWords;
    }, '');

    const wordCount = contentReduced.split(/\s/).length;

    return Math.ceil(wordCount / 200);
  }, [post]);

  const readTime = useMemo(() => getReadingTime(), [getReadingTime]);

  const formattedDate = useMemo(
    () => post && formatDate(post.first_publication_date),
    [post]
  );

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
            <i>{`* editado em ${post.last_publication_date}`}</i>
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

        <footer className={styles.footer}>
          <div className={styles.divider} />
          <div className={styles.navigation}>
            {post.data?.prev_post?.uid ? (
              <Link href={`/post/${post.data.prev_post.uid}`}>
                <a className={`${styles.navLink} prev`}>
                  <span>{post.data.prev_post.title}</span>
                  <strong>Post anterior</strong>
                </a>
              </Link>
            ) : (
              <div />
            )}
            {post.data.next_post?.uid ? (
              <Link href={`/post/${post.data.next_post.uid}`}>
                <a className={`${styles.navLink} next`}>
                  <span>{post.data.next_post.title}</span>
                  <strong>Prómixo post</strong>
                </a>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </footer>

        <UtterancesCommentaries />

        <ExitPreviewButton preview={preview} />
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {
    ref: previewData?.ref ?? null,
  });

  if (!response) {
    return {
      notFound: true,
    };
  }

  const {
    results: [prev_post],
  } = await prismic.query([Prismic.predicates.at('document.type', 'post')], {
    fetch: ['post.title'],
    pageSize: 1,
    ref: previewData?.ref ?? null,
    after: response.id,
    orderings: '[document.first_publication_date]',
  });

  const {
    results: [next_post],
  } = await prismic.query([Prismic.predicates.at('document.type', 'post')], {
    fetch: ['post.title'],
    pageSize: 1,
    ref: previewData?.ref ?? null,
    after: response.id,
    orderings: '[document.first_publication_date desc]',
  });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: format(
      new Date(response.last_publication_date),
      "dd MMM yyyy', às' HH:mm",
      {
        locale: brazilianLocale,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
      prev_post: prev_post
        ? {
            uid: prev_post?.uid,
            title: prev_post?.data.title,
          }
        : null,
      next_post: next_post
        ? {
            uid: next_post?.uid,
            title: next_post?.data.title,
          }
        : null,
    },
  };

  return {
    props: {
      post,
      preview,
    },
  };
};
