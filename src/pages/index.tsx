import { GetStaticPaths, GetStaticProps } from 'next';
import { useState } from 'react';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';
import { formatDate } from '../utils/formatDate';

import Header from '../components/Header';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const { results, next_page } = postsPagination;

  const [posts, setPosts] = useState(results);
  const [nextPage, setNextPage] = useState(next_page);

  const loadMorePosts = async (): Promise<void> => {
    const postsResponse = await fetch(nextPage).then(res => res.json());

    const newPosts = postsResponse.results;

    setNextPage(postsResponse.next_page);
    setPosts(prevPosts => [...prevPosts, ...newPosts]);
  };

  return (
    <>
      <Header pageTitle="Home" />
      <main className={commonStyles.pageContainer}>
        <section className={styles.postListContainer}>
          {posts.map(post => {
            const formattedDate = formatDate(post.first_publication_date);
            return (
              <Link key={post.uid} href={`/post/${post.uid}`} passHref>
                <a className={styles.post}>
                  <h2 className={styles.postHeading}>{post.data.title}</h2>
                  <p className={styles.postSubtitle}>{post.data.subtitle}</p>
                  <div className={styles.postDetails}>
                    <span>
                      <FiCalendar />
                      <time>{formattedDate}</time>
                    </span>
                    <span>
                      <FiUser />
                      <span>{post.data.author}</span>
                    </span>
                  </div>
                </a>
              </Link>
            );
          })}
        </section>

        <section className={styles.buttonsContainer}>
          {nextPage && (
            <button
              type="button"
              className={styles.buttonLoadMore}
              onClick={loadMorePosts}
            >
              Carregar mais posts
            </button>
          )}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    Prismic.predicates.at('document.type', 'post'),
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 3,
    }
  );

  return {
    revalidate: 60 * 60 * 24,
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: postsResponse.results,
      },
    },
  };
};
